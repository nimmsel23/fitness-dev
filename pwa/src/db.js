/**
 * Firestore Data Layer — Fitness PWA
 *
 * Struktur:
 *   fitness/{uid}/sessions/{date}      → Session-Log (exercises, effort, mood)
 *   fitness/{uid}/journal/{auto-id}    → Text-Notizen
 *   fitness/{uid}/plan                 → Aktiver Trainingsplan
 *   fitness/{uid}/body/{date}          → Körpermessungen
 *   fitness/kb/exercises/{id}          → Exercise-Definitionen (aus catalog/kb)
 *   fitness/kb/anatomy/{id}            → Anatomy Teaching (aus catalog/kb)
 *
 * uid: "default" — Single-User, kein Auth
 */

import {
  doc, collection,
  getDoc, getDocs, setDoc, addDoc,
  query, where, orderBy, limit,
  serverTimestamp,
} from "firebase/firestore";
import { db } from "./firebase.js";

const UID = "default";

function todayISO() {
  const d = new Date();
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
}

// ── Sessions ──────────────────────────────────────────────────────────────────

export async function getSession(date = todayISO()) {
  const snap = await getDoc(doc(db, "fitness", UID, "sessions", date));
  if (!snap.exists()) return { date, block: "", exercises: [], effort: null, mood: "", notes: "" };
  return snap.data();
}

export async function saveSession(date = todayISO(), sessionData) {
  await setDoc(doc(db, "fitness", UID, "sessions", date), {
    ...sessionData,
    date,
    saved_at: serverTimestamp(),
  });
  return { ok: true };
}

export async function getRecentSessions(n = 10) {
  const q = query(
    collection(db, "fitness", UID, "sessions"),
    orderBy("date", "desc"),
    limit(n)
  );
  const snap = await getDocs(q);
  return snap.docs.map((d) => d.data());
}

// ── Plan ──────────────────────────────────────────────────────────────────────

export async function getPlan() {
  const snap = await getDoc(doc(db, "fitness", UID, "plan"));
  if (!snap.exists()) return null;
  return snap.data();
}

export async function savePlan(plan) {
  await setDoc(doc(db, "fitness", UID, "plan"), {
    ...plan,
    updated_at: serverTimestamp(),
  });
  return { ok: true };
}

// ── Journal ───────────────────────────────────────────────────────────────────

export async function getJournal(date = todayISO()) {
  const q = query(
    collection(db, "fitness", UID, "journal"),
    where("date", "==", date),
    orderBy("time", "desc")
  );
  const snap = await getDocs(q);
  return snap.docs.map((d) => ({ id: d.id, ...d.data() }));
}

export async function saveJournal(date = todayISO(), text, tags = []) {
  const ref = await addDoc(collection(db, "fitness", UID, "journal"), {
    date,
    text: text.trim(),
    tags,
    time: new Date().toISOString(),
    created_at: serverTimestamp(),
  });
  return { id: ref.id, date, text };
}

// ── Body ──────────────────────────────────────────────────────────────────────

export async function getBodyEntry(date = todayISO()) {
  const snap = await getDoc(doc(db, "fitness", UID, "body", date));
  if (!snap.exists()) return null;
  return snap.data();
}

// ── Knowledge Base (catalog/kb sync) ─────────────────────────────────────────

export async function getExercise(exerciseId) {
  const snap = await getDoc(doc(db, "fitness", "kb", "exercises", exerciseId));
  if (!snap.exists()) return null;
  return snap.data();
}

export async function getAllExercises() {
  const snap = await getDocs(collection(db, "fitness", "kb", "exercises"));
  return snap.docs.map((d) => ({ id: d.id, ...d.data() }));
}

export async function getAnatomy(exerciseId) {
  const snap = await getDoc(doc(db, "fitness", "kb", "anatomy", exerciseId));
  if (!snap.exists()) return null;
  return snap.data();
}

// ── KB Sync (anatomy-kb server trigger) ───────────────────────────────────────

const KB_SERVER = import.meta.env.VITE_KB_SERVER || "http://localhost:9200";

export async function triggerKbSync({ dry = false } = {}) {
  const res = await fetch(`${KB_SERVER}/api/firestore/sync${dry ? "?dry=1" : ""}`, { method: "POST" });
  return res.json();
}
