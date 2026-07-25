/**
 * firestore/inbox.js — Coach-Inbox CRUD (Übungsanfragen/Review) für Firestore.
 */

import {
  collection, doc, addDoc, getDoc, getDocs, deleteDoc, updateDoc,
  query, orderBy, serverTimestamp, writeBatch, collectionGroup,
} from "firebase/firestore";

import { db } from "../../../firebase.js";
import { getUid, BRIDGE_API_BASE } from "./core.js";

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
  const exercise = data.enriched || data;
  const exId = exercise.exercise_id || exercise.id || id;

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

// Jagt einen bestehenden Inbox-Eintrag (z.B. aus einer frueheren Import-Aera,
// der mit dem aktuellen Schema nicht mehr sauber approvebar ist) nochmal
// frisch durch die Gemini-Anreicherung. Muss serverseitig laufen (API-Key,
// Python-Pipeline) — ruft deshalb das FastAPI-Backend ueber den
// Tailscale-Funnel an statt direkt Firestore zu schreiben. Der Backend-
// Endpoint aktualisiert das Firestore-Dokument selbst zurueck
// (siehe fitness/api/routers/exercises.py::inbox_reenrich).
export async function reenrichInbox(id, userId, ex) {
  const targetUid = userId || getUid();
  const data = ex?.exercises?.[0] || ex?.enriched || ex || {};
  try {
    const res = await fetch(`${BRIDGE_API_BASE}/inbox/${id}/reenrich`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        exercise_id: data.exercise_id || data.id,
        display_name: data.display_name || data.name || data.german,
        uid: targetUid,
        doc_id: id,
      }),
    });
    if (!res.ok) return { ok: false, error: `status_${res.status}` };
    return await res.json();
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
