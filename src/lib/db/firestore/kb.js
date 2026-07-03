import {
  collection, doc, addDoc, setDoc, getDoc, getDocs, deleteDoc, updateDoc,
  query, where, orderBy, limit, serverTimestamp, writeBatch, collectionGroup
} from "firebase/firestore";
import {
  onAuthStateChanged,
  signInWithPopup, signInWithEmailAndPassword, createUserWithEmailAndPassword,
  signOut as fbSignOut, updateProfile,
} from "firebase/auth";

import { db, auth, googleProvider } from "../../../firebase.js";
import { getWeekDates, downloadText, num, todayISO, localToday } from "../shared/utils.js";
import { getUid, pingBridge } from "./core.js";
import { getSession, getSessionHistory } from "./sessions.js";
import { updateAnalyticsDoc } from "./analysis.js";

import { muscleToGroups } from "../../lib/muscleMapping.js";

export async function getExercise(exerciseId) {
  const snap = await getDoc(doc(db, "fitness", "kb", "exercises", exerciseId));
  if (!snap.exists()) return null;
  return snap.data();
}

export async function getAllExercises() {
  const snap = await getDocs(collection(db, "fitness", "kb", "exercises"));
  return snap.docs.map((d) => ({ id: d.id, ...d.data() }));
}

// Client-side fuzzy search through Firestore exercises collection.
// Firestore has no full-text; load-once-and-cache + score in browser.
let _searchCache = null;
function _normalize(s) {
  return String(s || "")
    .toLowerCase()
    .replace(/ä/g, "ae").replace(/ö/g, "oe").replace(/ü/g, "ue").replace(/ß/g, "ss")
    .replace(/[-_]/g, " ").replace(/\s+/g, " ").trim();
}
export async function searchExercises(query, limit = 12) {
  const q = String(query || "").trim();
  if (!q) return { ok: true, results: [], query: q, suggestions: [] };
  if (!_searchCache) _searchCache = await getAllExercises();
  const stored = localStorage.getItem('fitness-sessionSources');
  const sources = stored ? JSON.parse(stored) : { wger: true, yuhonas: true, coach: false };
  const pool = _searchCache.filter(ex => {
    const tags = ex.tags || [];
    if (tags.includes('wger') || tags.includes('unreviewed')) return sources.wger !== false;
    if (tags.includes('yuhonas')) return sources.yuhonas !== false;
    return sources.coach === true;
  });
  const qn = _normalize(q);
  const qTokens = qn.split(" ").filter(Boolean);
  const scored = pool.map(ex => {
    const hay = [ex.display_name, ex.german, ex.name, ex.exercise_id, ex.id, ...(ex.aliases || []), ...(ex.tags || [])].map(_normalize);
    let score = 0;
    if (hay.some(h => h === qn))         score = 100;
    else if (hay.some(h => h.startsWith(qn))) score = 80;
    else if (hay.some(h => h.includes(qn)))   score = 60;
    else if (qTokens.length > 1 && qTokens.every(t => hay.some(h => h.includes(t)))) score = 50;
    else if (qTokens.some(t => hay.some(h => h.includes(t)))) score = 20;
    return { ex, score };
  }).filter(x => x.score > 0).sort((a, b) => b.score - a.score).slice(0, limit);
  const results = scored.map(({ ex }) => ({
    ...ex,
    id:   ex.exercise_id || ex.id,
    name: ex.display_name || ex.german || ex.name || ex.exercise_id || ex.id,
    primaryMuscles:   ex.primary_muscles   || ex.primaryMuscles   || [],
    secondaryMuscles: ex.secondary_muscles || ex.secondaryMuscles || [],
    source: "firestore",
  }));
  return { ok: true, source: "firestore", query: q, results,
           suggestions: results.slice(0, 3).map(r => ({ canonical_id: r.id, display_name: r.name })) };
}

export async function getAnatomy(exerciseId) {
  const snap = await getDoc(doc(db, "fitness", "kb", "anatomy", exerciseId));
  if (!snap.exists()) return null;
  return snap.data();
}

export async function getMuscle(muscleId) {
  const snap = await getDoc(doc(db, "fitness", "kb", "muscles", muscleId));
  if (!snap.exists()) return null;
  return snap.data();
}

export async function sendToInbox(exerciseData) {
  try {
    const ref = await addDoc(collection(db, "fitness", getUid(), "inbox"), {
      ...exerciseData,
      received_at: serverTimestamp(),
    });
    return { ok: true, id: ref.id };
  } catch (e) {
    console.error("Inbox Firestore push failed:", e);
    return { ok: false };
  }
}

