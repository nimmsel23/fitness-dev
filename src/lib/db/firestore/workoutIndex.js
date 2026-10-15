/**
 * firestore/workoutIndex.js — Monats-Index über Sessions, die älter als
 * INDEX_AFTER_DAYS (7) Tage sind. Abgeleitete Daten: fitness/{uid}/sessions
 * bleibt die einzige Wahrheit, der Index lässt sich jederzeit neu aufbauen.
 *
 *   fitness/{uid}/workoutIndex/{YYYY-MM}  → { entries: { [sessionDocId]: Eintrag } }
 *   fitness/{uid}/workoutIndex/_meta      → { indexedThrough, compactedAtMs, schema }
 *
 * Der Verlauf liest die letzten 7 Tage live aus sessions (vollständige Docs)
 * und alles Ältere aus wenigen Monats-Docs statt aus Dutzenden Session-Docs.
 *
 * Verdichtung (compactWorkoutIndex) läuft clientseitig beim Öffnen des
 * Verlaufs, ohne Cloud Function:
 *   (a) Sessions, die seit dem Wasserzeichen (indexedThrough) "alt" wurden,
 *   (b) Sessions, die seit der letzten Verdichtung gespeichert wurden (saved_at),
 *       aber ein altes Datum haben — fängt Nachzügler fremder Apps (z.B. das
 *       Standalone-6Pack nach dem Login) und Änderungen an alten Sessions ab.
 * Einträge sind nach Session-Doc-ID geschlüsselt → doppelte Läufe zweier
 * Geräte schreiben dasselbe und sind unkritisch.
 */

import {
  collection, doc, getDoc, getDocs, setDoc, writeBatch, query, where, orderBy, limit,
  documentId, deleteField, Timestamp,
} from "firebase/firestore";

import { db } from "../../../firebase.js";
import { getUid } from "./core.js";
import { indexCutoffDate, localDateOf, monthOf, toIndexEntry } from "../../../../6pack/workoutDoc.js";

const SCHEMA = 1;
const CLOCK_SKEW_MS = 10 * 60 * 1000;
const META_REFRESH_MS = 24 * 60 * 60 * 1000;
const LEGACY_LIMIT = 60;

const sessionsCol = () => collection(db, "fitness", getUid(), "sessions");
const indexCol = () => collection(db, "fitness", getUid(), "workoutIndex");
const metaRef = () => doc(db, "fitness", getUid(), "workoutIndex", "_meta");

function dateOfDoc(id, data) {
  return data?.date || String(id).split("__")[0];
}

// Eintrag in den Monats-Doc setzen (oder entfernen, wenn entry === null).
// Nur für Sessions bis einschließlich Cutoff — neuere liest der Verlauf live.
export async function indexUpsert(docId, data) {
  const date = dateOfDoc(docId, data);
  if (!date || date > indexCutoffDate()) return;
  const entry = toIndexEntry(docId, { ...data, date });
  await setDoc(
    doc(indexCol(), monthOf(date)),
    { entries: { [docId]: entry ?? deleteField() } },
    { merge: true },
  );
}

export async function indexRemove(docId, date) {
  if (!date || date > indexCutoffDate()) return;
  await setDoc(
    doc(indexCol(), monthOf(date)),
    { entries: { [docId]: deleteField() } },
    { merge: true },
  );
}

let inflight = null;
export function compactWorkoutIndex() {
  if (!inflight) inflight = runCompaction().finally(() => { inflight = null; });
  return inflight;
}

async function runCompaction() {
  const cutoff = indexCutoffDate();
  const runStartedMs = Date.now();
  const metaSnap = await getDoc(metaRef());
  const meta = metaSnap.exists() ? metaSnap.data() : null;

  const found = new Map();
  const collect = (snap) => snap.docs.forEach((d) => {
    const data = d.data() || {};
    if (dateOfDoc(d.id, data) <= cutoff) found.set(d.id, data);
  });

  // (a) neu gealterte Tage (beim ersten Lauf: der gesamte Altbestand)
  const aQuery = meta?.indexedThrough
    ? query(sessionsCol(), where("date", ">", meta.indexedThrough), where("date", "<=", cutoff))
    : query(sessionsCol(), where("date", "<=", cutoff));
  collect(await getDocs(aQuery));

  // (b) Nachzügler / Änderungen an alten Sessions
  if (meta?.compactedAtMs) {
    const since = Timestamp.fromMillis(meta.compactedAtMs - CLOCK_SKEW_MS);
    collect(await getDocs(query(sessionsCol(), where("saved_at", ">", since))));
  }

  if (found.size > 0) {
    const byMonth = new Map();
    found.forEach((data, id) => {
      const date = dateOfDoc(id, data);
      const month = monthOf(date);
      const entry = toIndexEntry(id, { ...data, date });
      if (!byMonth.has(month)) byMonth.set(month, {});
      byMonth.get(month)[id] = entry ?? deleteField();
    });
    // writeBatch: max. 500 Operationen — Monats-Docs sind wenige, aber sicher chunken.
    const months = [...byMonth.entries()];
    for (let i = 0; i < months.length; i += 400) {
      const batch = writeBatch(db);
      months.slice(i, i + 400).forEach(([month, entries]) => {
        batch.set(doc(indexCol(), month), { entries }, { merge: true });
      });
      await batch.commit();
    }
  }

  const advanced = meta?.indexedThrough !== cutoff;
  const stale = !meta?.compactedAtMs || runStartedMs - meta.compactedAtMs > META_REFRESH_MS;
  if (found.size > 0 || advanced || stale) {
    await setDoc(metaRef(), { indexedThrough: cutoff, compactedAtMs: runStartedMs, schema: SCHEMA }, { merge: true });
  }
  return { processed: found.size };
}

function shiftMonth(date, deltaMonths) {
  const [y, m] = date.split("-").map(Number);
  const d = new Date(y, m - 1 + deltaMonths, 1);
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}`;
}

function sortEntries(entries) {
  return entries.sort((a, b) =>
    String(b.date).localeCompare(String(a.date))
    || String(b.startedAt || "").localeCompare(String(a.startedAt || "")));
}

function docsToEntries(snap) {
  return snap.docs.map((d) => toIndexEntry(d.id, { ...(d.data() || {}), date: dateOfDoc(d.id, d.data()) })).filter(Boolean);
}

/**
 * Verlaufs-Zeilen (Index-Einträge) der letzten `months` Monate.
 * Gibt { entries, hasMore } zurück; entries sind nach Datum absteigend sortiert.
 * Solange der Index noch nie aufgebaut wurde, kommt die Liste aus den letzten
 * 60 vollständigen Sessions, und die Verdichtung startet im Hintergrund.
 */
export async function getHistoryEntries({ months = 6 } = {}) {
  const metaSnap = await getDoc(metaRef());
  if (!metaSnap.exists()) {
    compactWorkoutIndex().catch((err) => console.warn("[workoutIndex] Verdichtung fehlgeschlagen", err));
    const snap = await getDocs(query(sessionsCol(), orderBy("date", "desc"), limit(LEGACY_LIMIT)));
    const entries = sortEntries(docsToEntries(snap));
    return { entries, hasMore: snap.size >= LEGACY_LIMIT };
  }

  try { await compactWorkoutIndex(); } catch (err) { console.warn("[workoutIndex] Verdichtung fehlgeschlagen", err); }

  const cutoff = indexCutoffDate();
  const today = localDateOf();
  const fromMonth = shiftMonth(today, -(months - 1));

  const [recentSnap, indexSnap, olderSnap] = await Promise.all([
    getDocs(query(sessionsCol(), where("date", ">", cutoff))),
    getDocs(query(indexCol(), where(documentId(), ">=", fromMonth), where(documentId(), "<=", monthOf(cutoff)))),
    getDocs(query(indexCol(), where(documentId(), "<", fromMonth), orderBy(documentId(), "desc"), limit(1))),
  ]);

  const entries = docsToEntries(recentSnap);
  indexSnap.docs.forEach((d) => {
    Object.values(d.data()?.entries || {}).forEach((e) => { if (e && e.date <= cutoff) entries.push(e); });
  });
  return { entries: sortEntries(entries), hasMore: !olderSnap.empty };
}
