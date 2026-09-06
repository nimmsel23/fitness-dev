/**
 * firestore/inbox.js — Coach-Inbox CRUD (Übungsanfragen/Review) für Firestore.
 */

import {
  collection, doc, addDoc, getDoc, getDocs, deleteDoc, updateDoc,
  query, orderBy, serverTimestamp, writeBatch, collectionGroup,
} from "firebase/firestore";

import { db } from "../../../firebase.js";
import { getUid, LOCAL_FITNESS_API_BASE } from "./core.js";
import { normalizeExerciseRecord } from "../shared/exercise.js";
import { enrichExerciseViaVertex } from "../../exerciseAiEnrich.js";

const REENRICH_PROVENANCE_FIELDS = [
  "wger_id",
  "wger_muscle_ids",
  "yuhonas_id",
  "external_ids",
  "origin",
  "source_snapshot",
  "original_description",
  "instructions",
  "images",
];

function preserveReenrichProvenance(enriched, seed) {
  const out = { ...(enriched || {}) };
  for (const field of REENRICH_PROVENANCE_FIELDS) {
    const value = seed?.[field];
    if (value !== null && value !== undefined && value !== "" && !(Array.isArray(value) && value.length === 0)) {
      out[field] = value;
    }
  }
  return out;
}

// ── Inbox ─────────────────────────────────────────────────────────────────────

export async function sendToInbox(exerciseData) {
  try {
    const uid = getUid();
    const ref = await addDoc(collection(db, "fitness", uid, "inbox"), {
      ...exerciseData,
      userId: uid,
      received_at: serverTimestamp(),
    });
    return { ok: true, id: ref.id };
  } catch (e) {
    console.error("Inbox Firestore push failed:", e);
    return { ok: false };
  }
}

// Vormals ein fetch() gegen http://localhost:9120 — unerreichbar für eine
// deployte PWA, schlug im Firebase-Modus immer still fehl (try/catch{}).
// Neue, unbekannte Übungen landeten dadurch nie im Coach-Inbox-Feed.
// sendToInbox() schreibt in dieselbe Firestore-Collection, die getInbox()/
// getGlobalInbox() unten lesen.
export async function queueForEnrichment(ex) {
  if (!ex || ex.source === "expert") return;
  await sendToInbox({
    exercise_id: ex.id || ex.exercise_id || null,
    name: ex.name || ex.display_name,
    status: "pending_review",
  });
}

export async function getInbox() {
  const q = query(
    collection(db, "fitness", getUid(), "inbox"),
    orderBy("received_at", "desc")
  );
  const snap = await getDocs(q);
  return snap.docs.map((d) => ({ file_id: d.id, ...d.data() }));
}

export async function getGlobalInbox() {
  try {
    const snap = await getDocs(collectionGroup(db, "inbox"));
    return snap.docs
      .map((d) => ({
        file_id: d.id,
        userId: d.ref.parent?.parent?.id || null,
        ...d.data(),
      }))
      .filter((item) => item.status !== "approved" && item.status !== "rejected");
  } catch (e) {
    console.error("getGlobalInbox error:", e);
    return [];
  }
}

export async function approveInbox(id, userId) {
  const targetUid = userId || getUid();
  const inboxRef = doc(db, "fitness", targetUid, "inbox", id);
  const snap = await getDoc(inboxRef);
  if (!snap.exists()) return { ok: false, error: "not_found" };

  const data = snap.data();
  const exercise = normalizeExerciseRecord(data.enriched || data);
  const exId = exercise.exercise_id || exercise.id || id;

  try {
    const res = await fetch(`${LOCAL_FITNESS_API_BASE}/inbox/${id}/approve`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        uid: targetUid,
        doc_id: id,
        current_data: exercise,
      }),
    });
    if (res.ok) return await res.json();
  } catch {
    // Local coach backend is optional for pure Firestore use; fallback below.
  }

  const batch = writeBatch(db);
  batch.set(doc(db, "fitness", "kb", "exercises", exId), {
    ...exercise,
    source: "approved",
    approved_at: serverTimestamp(),
  });
  batch.update(inboxRef, { status: "approved", approved_at: serverTimestamp() });
  await batch.commit();

  return { ok: true, id: exId };
}

// Jagt einen bestehenden Firestore-Inbox-Eintrag nochmal frisch durch die
// lokale Fitness-Prod-Kette (:6100 -> Python/Gemini/Review) und schreibt den
// angereicherten Draft von dort zurueck. Wenn der lokale Prod-Server nicht
// laeuft, faellt die Firebase-App auf Vertex AI direkt im Browser zurueck.
export async function reenrichInbox(id, userId, ex) {
  const targetUid = userId || getUid();
  const data = ex?.exercises?.[0] || ex?.enriched || ex || {};
  const feedback = ex?.coachFeedback || ex?.feedback || null;
  try {
    const res = await fetch(`${LOCAL_FITNESS_API_BASE}/inbox/${id}/reenrich`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        exercise_id: data.exercise_id || data.id,
        display_name: data.display_name || data.name || data.german,
        uid: targetUid,
        doc_id: id,
        feedback,
        current_data: data,
      }),
    });
    if (res.ok) return await res.json();
  } catch {
    // lokales Backend nicht erreichbar — weiter zum Vertex-Fallback unten
  }

  try {
    const enriched = preserveReenrichProvenance(
      await enrichExerciseViaVertex(data, ex?.coachFeedback || null),
      data,
    );
    const inboxRef = doc(db, "fitness", targetUid, "inbox", id);
    await updateDoc(inboxRef, {
      status: "ai_enriched",
      enriched,
      updated_at: serverTimestamp(),
      reenrich_feedback: feedback || null,
      reenrich_source: "vertex_fallback",
    });
    return { ok: true, id, exercise_id: enriched.exercise_id || enriched.id, enriched, via: "vertex" };
  } catch (e) {
    return { ok: false, error: String(e) };
  }
}

export async function deleteInbox(id, userId) {
  const targetUid = userId || getUid();
  const inboxRef = doc(db, "fitness", targetUid, "inbox", id);
  const snap = await getDoc(inboxRef);
  if (snap.exists() && targetUid !== getUid()) {
    await updateDoc(inboxRef, { status: "rejected", rejected_at: serverTimestamp() });
  } else {
    await deleteDoc(inboxRef);
  }
  return { ok: true };
}

// Braucht den lokalen Coach-Rechner mit Fitness-Prod-Server (:6100), da die
// Fuzzy-Matches gegen unreviewed_wger.yml/unreviewed_yuhonas.yml laufen —
// nicht im Firebase-Build gebundelt. Liefert bei Nichterreichbarkeit einfach
// leer statt einen Fehler zu werfen; Kandidaten sind ein optionaler Hinweis,
// kein kritischer Pfad.
export async function getInboxMergeCandidates() {
  try {
    const res = await fetch(`${LOCAL_FITNESS_API_BASE}/inbox/merge-candidates`);
    if (!res.ok) return {};
    const data = await res.json();
    return data?.candidates || {};
  } catch {
    return {};
  }
}

export async function linkInboxSource(id, source, sourceId, userId, currentData = null) {
  const targetUid = userId || getUid();
  const res = await fetch(`${LOCAL_FITNESS_API_BASE}/inbox/${id}/link-source`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      source,
      source_id: sourceId,
      uid: targetUid,
      doc_id: id,
      current_data: currentData,
    }),
  });
  if (!res.ok) return { ok: false };
  return await res.json();
}

export async function getInboxDuplicates(id, userId) {
  const targetUid = userId || getUid();
  const res = await fetch(`${LOCAL_FITNESS_API_BASE}/inbox/${id}/duplicates?uid=${encodeURIComponent(targetUid)}`);
  if (!res.ok) return { ok: false, has_duplicates: false, plan: null };
  return await res.json();
}

export async function mergeInboxDuplicates(id, userId) {
  const targetUid = userId || getUid();
  const res = await fetch(`${LOCAL_FITNESS_API_BASE}/inbox/${id}/merge-duplicates`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ uid: targetUid }),
  });
  if (!res.ok) return { ok: false, merged: false, plan: null };
  return await res.json();
}
