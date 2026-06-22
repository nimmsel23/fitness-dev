/**
 * db.firestore.js — journal-dev Firestore Data Layer
 *
 * Liest/schreibt direkt in fitness-aos Firestore.
 * Gewählt beim Build via `vite build --mode firebase` durch @db-Alias.
 *
 * Schema (identisch mit fitness-dev + firestore-mirror.mjs):
 *   fitness/<uid>/journal/<autoId>          { date, text, time }
 *   fitness/<uid>/habits/<uuid>             { name, icon, deleted, created_at }
 *   fitness/<uid>/habitJournals/<hid__date> { habitId, date, text, coachFeedback }
 *   fitness/<uid>/habitRecords/<autoId>     { habitId, date, completion, recorded_at }
 */

import {
  collection, doc, getDoc, getDocs, addDoc, setDoc, deleteDoc, query,
  orderBy, limit, where, serverTimestamp,
} from "firebase/firestore";
import {
  onAuthStateChanged, signInWithRedirect, getRedirectResult,
  signOut as fbSignOut,
} from "firebase/auth";
import { db, auth, googleProvider } from "./firebase.js";

export { db, auth, googleProvider };

// ── Auth ──────────────────────────────────────────────────────────────────────

export function isLocalMode() { return false; }
export function getUid() { return auth.currentUser?.uid ?? null; }

export function watchAuth(cb) {
  // Redirect-Result nach Rückkehr von Google abarbeiten
  getRedirectResult(auth).catch(() => {});
  return onAuthStateChanged(auth, cb);
}

export async function signIn() {
  await signInWithRedirect(auth, googleProvider);
  return { ok: true };
}

export async function signOut() { await fbSignOut(auth); return { ok: true }; }

// ── Utils ─────────────────────────────────────────────────────────────────────

export function localToday() {
  const d = new Date();
  return `${d.getFullYear()}-${String(d.getMonth()+1).padStart(2,'0')}-${String(d.getDate()).padStart(2,'0')}`;
}

function fitCol(uid, ...segs) {
  return collection(db, "fitness", uid, ...segs);
}
function fitDoc(uid, ...segs) {
  return doc(db, "fitness", uid, ...segs);
}

// ── Journal ───────────────────────────────────────────────────────────────────

export async function getJournal(date = localToday()) {
  const uid = getUid();
  if (!uid) return [];

  const [jSnap, hjSnap, hrSnap] = await Promise.all([
    getDocs(query(fitCol(uid, "journal"), where("date", "==", date))),
    getDocs(query(fitCol(uid, "habitJournals"), where("date", "==", date))),
    getDocs(query(fitCol(uid, "habitRecords"), where("date", "==", date))),
  ]);

  // Habit-Namen laden
  const habitIds = new Set([
    ...hjSnap.docs.map(d => d.data().habitId),
    ...hrSnap.docs.map(d => d.data().habitId),
  ]);
  const habitNames = {};
  await Promise.all([...habitIds].map(async hid => {
    const h = await getDoc(fitDoc(uid, "habits", hid));
    if (h.exists()) habitNames[hid] = h.data().name || hid;
  }));

  const entries = [];
  for (const d of jSnap.docs) {
    const { text, time } = d.data();
    if (text) entries.push({ id: d.id, date, text, time: (time || "").slice(0,16), type: "journal" });
  }
  for (const d of hjSnap.docs) {
    const { text, habitId, coachFeedback } = d.data();
    const name = habitNames[habitId] || habitId;
    entries.push({ id: d.id, date, text: text || "", habitName: name, coachFeedback, type: "habit_journal" });
  }
  for (const d of hrSnap.docs) {
    const { habitId, completion, recorded_at } = d.data();
    const name = habitNames[habitId] || habitId;
    const time = recorded_at?.toDate?.()?.toISOString?.()?.slice(0,16) || "";
    entries.push({ id: d.id, date, habitName: name, completion: completion || "DONE", time, type: "habit_record" });
  }
  return entries.sort((a, b) => (a.time || "").localeCompare(b.time || ""));
}

export async function getJournalHistory(limitCount = 50) {
  const uid = getUid();
  if (!uid) return [];
  const [jSnap, hjSnap] = await Promise.all([
    getDocs(query(fitCol(uid, "journal"), orderBy("date", "desc"), limit(limitCount))),
    getDocs(query(fitCol(uid, "habitJournals"), orderBy("date", "desc"), limit(limitCount))),
  ]);
  const seen = new Map();
  for (const d of [...jSnap.docs, ...hjSnap.docs]) {
    const date = d.data().date;
    const time = d.data().time || d.data().updated_at || date;
    if (date && !seen.has(date)) seen.set(date, { date, time, preview: (d.data().text || "").slice(0, 100) });
  }
  return [...seen.values()].sort((a, b) => b.date.localeCompare(a.date)).slice(0, limitCount);
}

export async function saveJournal(date = localToday(), text) {
  const uid = getUid();
  if (!uid) throw new Error("not_signed_in");
  await addDoc(fitCol(uid, "journal"), {
    date,
    text: String(text || "").trim(),
    time: new Date().toISOString(),
  });
  return { ok: true, date };
}

export async function updateJournal(id, text) {
  const uid = getUid();
  if (!uid) throw new Error("not_signed_in");
  await setDoc(fitDoc(uid, "journal", id), { text: String(text || "").trim() }, { merge: true });
  return { ok: true };
}

export async function getSessionHistory() { return []; }

// ── Habit Journals ────────────────────────────────────────────────────────────

export async function getHabitJournal(habitId, date) {
  const uid = getUid();
  if (!uid) return null;
  const snap = await getDoc(fitDoc(uid, "habitJournals", `${habitId}__${date}`));
  return snap.exists() ? { id: snap.id, ...snap.data() } : null;
}

export async function saveHabitJournal(habitId, date, text) {
  const uid = getUid();
  if (!uid) throw new Error("not_signed_in");
  await setDoc(fitDoc(uid, "habitJournals", `${habitId}__${date}`), {
    habitId, date,
    text: String(text || "").trim(),
    updated_at: serverTimestamp(),
  }, { merge: true });
  return { ok: true };
}

export async function getAllHabitJournalsForDate(date) {
  const uid = getUid();
  if (!uid) return [];
  const snap = await getDocs(query(fitCol(uid, "habitJournals"), where("date", "==", date)));
  return snap.docs.map(d => ({ id: d.id, ...d.data(), type: "habit" }));
}

export async function getAllHabitJournalsHistory(limitCount = 50) {
  const uid = getUid();
  if (!uid) return [];
  const snap = await getDocs(query(fitCol(uid, "habitJournals"), orderBy("date", "desc"), limit(limitCount)));
  return snap.docs.map(d => ({ id: d.id, ...d.data(), type: "habit" }));
}

export async function getHabitJournalHistory(habitId) {
  const uid = getUid();
  if (!uid) return [];
  const all = await getAllHabitJournalsHistory(200);
  return all.filter(d => d.habitId === habitId);
}

// ── Habits ────────────────────────────────────────────────────────────────────

export async function getHabits(date = localToday()) {
  const uid = getUid();
  if (!uid) return [];
  const [habitsSnap, recordsSnap] = await Promise.all([
    getDocs(fitCol(uid, "habits")),
    getDocs(query(fitCol(uid, "habitRecords"), where("date", "==", date))),
  ]);
  const doneToday = new Set(recordsSnap.docs.map(d => d.data().habitId));
  return habitsSnap.docs
    .map(d => ({ uuid: d.id, ...d.data() }))
    .filter(h => !h.deleted)
    .map(h => ({
      ...h,
      records: doneToday.has(h.uuid)
        ? [{ date, completion: "DONE" }]
        : [],
    }));
}

export async function addHabit(name, icon = "Activity") {
  const uid = getUid();
  if (!uid) throw new Error("not_signed_in");
  const uuid = crypto.randomUUID();
  await setDoc(fitDoc(uid, "habits", uuid), {
    name: name.trim(), icon, deleted: false, created_at: serverTimestamp(),
  });
  return { ok: true, uuid };
}

export async function updateHabit(uuid, newName, newIcon) {
  const uid = getUid();
  if (!uid) throw new Error("not_signed_in");
  await setDoc(fitDoc(uid, "habits", uuid), { name: newName, icon: newIcon }, { merge: true });
  return { ok: true };
}

export async function deleteHabit(uuid) {
  const uid = getUid();
  if (!uid) throw new Error("not_signed_in");
  await setDoc(fitDoc(uid, "habits", uuid), { deleted: true }, { merge: true });
  return { ok: true };
}

export async function getHabitRecordsForDate(date = localToday()) {
  const uid = getUid();
  if (!uid) return [];
  const snap = await getDocs(query(fitCol(uid, "habitRecords"), where("date", "==", date)));
  return snap.docs.map(d => d.data().habitId);
}

export async function recordHabit(uuid, date = localToday()) {
  const uid = getUid();
  if (!uid) throw new Error("not_signed_in");
  await addDoc(fitCol(uid, "habitRecords"), {
    habitId: uuid, date, completion: "DONE",
    recorded_at: serverTimestamp(),
  });
  return { ok: true };
}

export async function unrecordHabit(uuid, date = localToday()) {
  const uid = getUid();
  if (!uid) throw new Error("not_signed_in");
  const snap = await getDocs(
    query(fitCol(uid, "habitRecords"), where("habitId", "==", uuid), where("date", "==", date))
  );
  await Promise.all(snap.docs.map(d => deleteDoc(d.ref)));
  return { ok: true };
}
