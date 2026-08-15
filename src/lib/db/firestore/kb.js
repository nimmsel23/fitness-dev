/**
 * firestore/kb.js — Exercise Knowledge Base CRUD for Firestore.
 * Favourites are localStorage-backed and mode-agnostic (→ shared/favourites.js).
 */

import {
  collection, doc, setDoc, getDoc, getDocs,
  serverTimestamp,
} from "firebase/firestore";

import { db } from "../../../firebase.js";
import { normalizeExerciseRecord } from "../shared/exercise.js";
export { getFavourites, toggleFavourite } from "../shared/favourites.js";

// ── Exercises ─────────────────────────────────────────────────────────────────

export async function getExercise(exerciseId) {
  const snap = await getDoc(doc(db, "fitness", "kb", "exercises", exerciseId));
  if (!snap.exists()) return null;
  return snap.data();
}

export async function getAllExercises() {
  const snap = await getDocs(collection(db, "fitness", "kb", "exercises"));
  return snap.docs.map((d) => ({ id: d.id, ...d.data() }));
}

export async function saveExercise(exerciseId, data) {
  const exId = exerciseId || data.exercise_id || data.id;
  if (!exId) return { ok: false, error: "missing_id" };
  await setDoc(doc(db, "fitness", "kb", "exercises", exId), {
    ...data,
    updated_at: serverTimestamp(),
  }, { merge: true });
  _searchCache = null;
  return { ok: true, id: exId };
}

// Client-side fuzzy search — Firestore has no full-text index.
// Load once, cache in module scope, score in browser.
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

  const stored = localStorage.getItem("fitness-sessionSources");
  const sources = stored ? JSON.parse(stored) : { wger: true, yuhonas: true, coach: true };
  const superseded = _buildSupersededExternalRefs(_searchCache);
  const pool = _searchCache.filter((ex) => {
    const tags = ex.tags || [];
    if (_isSupersededExternalExercise(ex, superseded)) return false;
    if (tags.includes("wger") || tags.includes("unreviewed")) return sources.wger !== false;
    if (tags.includes("yuhonas")) return sources.yuhonas !== false;
    return sources.coach === true;
  });

  const qn = _normalize(q);
  const qTokens = qn.split(" ").filter(Boolean);
  const scored = pool.map((ex) => {
    if (ex.merged_into || ex.superseded_by) return { ex, score: 0 };
    const hay = [ex.display_name, ex.german, ex.name, ex.exercise_id, ex.id, ...(ex.aliases || []), ...(ex.search_aliases || []), ...(ex.tags || [])].map(_normalize);
    let score = 0;
    if (hay.some((h) => h === qn))                                                    score = 100;
    else if (hay.some((h) => h.startsWith(qn)))                                       score = 80;
    else if (hay.some((h) => h.includes(qn)))                                         score = 60;
    else if (qTokens.length > 1 && qTokens.every((t) => hay.some((h) => h.includes(t)))) score = 50;
    else if (qTokens.some((t) => hay.some((h) => h.includes(t))))                     score = 20;
    return { ex, score };
  }).filter((x) => x.score > 0).sort((a, b) => b.score - a.score).slice(0, limit);

  const results = scored.map(({ ex }) => normalizeExerciseRecord({
    ...ex,
    id: ex.exercise_id || ex.id,
    name: ex.display_name || ex.german || ex.name || ex.exercise_id || ex.id,
    source: "firestore",
  }));
  return {
    ok: true, source: "firestore", query: q, results,
    suggestions: results.slice(0, 3).map((r) => ({ canonical_id: r.id, display_name: r.name })),
  };
}

function _isExpert(ex) {
  const tags = ex.tags || [];
  return ex.source === "expert" || tags.includes("expert");
}

function _buildSupersededExternalRefs(exercises) {
  const refs = { wger: new Set(), yuhonas: new Set(), names: new Set() };
  for (const ex of exercises || []) {
    if (!_isExpert(ex)) continue;
    if (ex.wger_id) refs.wger.add(String(ex.wger_id));
    const external = ex.external_ids || {};
    for (const id of external.wger || []) refs.wger.add(String(id));
    for (const id of external.yuhonas || []) refs.yuhonas.add(String(id));
    for (const name of ex.search_aliases || []) refs.names.add(_normalize(name));
  }
  return refs;
}

function _isSupersededExternalExercise(ex, refs) {
  if (_isExpert(ex)) return false;
  if (ex.merged_into || ex.superseded_by) return true;
  if (ex.wger_id && refs.wger.has(String(ex.wger_id))) return true;
  if (ex.yuhonas_id && refs.yuhonas.has(String(ex.yuhonas_id))) return true;
  const hay = [ex.display_name, ex.german, ex.english, ex.name, ex.exercise_id, ex.id].map(_normalize);
  return hay.some((item) => item && refs.names.has(item));
}

// ── Anatomy & Muscles ─────────────────────────────────────────────────────────

export async function getAnatomy(exerciseId) {
  const snap = await getDoc(doc(db, "fitness", "kb", "anatomy", exerciseId));
  if (!snap.exists()) return null;
  return snap.data();
}

export async function saveAnatomy(exerciseId, data) {
  const exId = exerciseId || data.exercise_id || data.id;
  if (!exId) return { ok: false, error: "missing_id" };
  await setDoc(doc(db, "fitness", "kb", "anatomy", exId), {
    ...data,
    exercise_id: exId,
    updated_at: serverTimestamp(),
  }, { merge: true });
  return { ok: true, exercise_id: exId, lesson: { ...data, exercise_id: exId } };
}

import { setKBMuscles } from "../shared/muscle.js";

export async function getAllMuscles() {
  const snap = await getDocs(collection(db, "fitness", "kb", "muscles"));
  const docs = snap.docs.map((d) => ({ ...d.data(), doc_id: d.id, id: d.data().id || d.id }));
  setKBMuscles(docs);
  return docs;
}

export async function getMuscle(muscleId) {
  const snap = await getDoc(doc(db, "fitness", "kb", "muscles", muscleId));
  if (!snap.exists()) return null;
  return snap.data();
}

// Anatomy & Muscles CRUD weiter oben definiert.

// Inbox-Funktionen (sendToInbox, queueForEnrichment, getInbox, approveInbox,
// reenrichInbox, ...) leben jetzt in ./inbox.js — siehe index.firestore.js-Barrel.
