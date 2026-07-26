/**
 * firestore/kb.js — Exercise Knowledge Base CRUD for Firestore.
 * Favourites are localStorage-backed and mode-agnostic (→ shared/favourites.js).
 */

import {
  collection, doc, setDoc, getDoc, getDocs,
  serverTimestamp,
} from "firebase/firestore";

import { db } from "../../../firebase.js";
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
  const pool = _searchCache.filter((ex) => {
    const tags = ex.tags || [];
    if (tags.includes("wger") || tags.includes("unreviewed")) return sources.wger !== false;
    if (tags.includes("yuhonas")) return sources.yuhonas !== false;
    return sources.coach === true;
  });

  const qn = _normalize(q);
  const qTokens = qn.split(" ").filter(Boolean);
  const scored = pool.map((ex) => {
    const hay = [ex.display_name, ex.german, ex.name, ex.exercise_id, ex.id, ...(ex.aliases || []), ...(ex.tags || [])].map(_normalize);
    let score = 0;
    if (hay.some((h) => h === qn))                                                    score = 100;
    else if (hay.some((h) => h.startsWith(qn)))                                       score = 80;
    else if (hay.some((h) => h.includes(qn)))                                         score = 60;
    else if (qTokens.length > 1 && qTokens.every((t) => hay.some((h) => h.includes(t)))) score = 50;
    else if (qTokens.some((t) => hay.some((h) => h.includes(t))))                     score = 20;
    return { ex, score };
  }).filter((x) => x.score > 0).sort((a, b) => b.score - a.score).slice(0, limit);

  const results = scored.map(({ ex }) => ({
    ...ex,
    id:              ex.exercise_id || ex.id,
    name:            ex.display_name || ex.german || ex.name || ex.exercise_id || ex.id,
    primaryMuscles:  ex.primary_muscles  || ex.primaryMuscles  || [],
    secondaryMuscles: ex.secondary_muscles || ex.secondaryMuscles || [],
    source: "firestore",
  }));
  return {
    ok: true, source: "firestore", query: q, results,
    suggestions: results.slice(0, 3).map((r) => ({ canonical_id: r.id, display_name: r.name })),
  };
}

// ── Anatomy & Muscles ─────────────────────────────────────────────────────────

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

// Live rbh/body_muscles-Slug-Mapping aus der fitness/kb/muscles-Collection
// (viz-Feld, gepusht von firestore_push.py::sync_muscles). Ersetzt die früher
// in muscleMapping.js hartcodierte, bei jeder Katalog-Umnummerierung
// veraltende ID-Tabelle.
let _vizCache = null;

export async function getMuscleVizMap() {
  if (_vizCache) return _vizCache;
  const snap = await getDocs(collection(db, "fitness", "kb", "muscles"));
  const rbh = {};
  const body_muscles = {};
  const body_muscles_slugs = {};
  const wger = {};
  const group_labels = {};
  snap.docs.forEach((d) => {
    const data = d.data();
    if (data?.wger_id) {
      wger[d.id] = data.wger_id;
      if (!group_labels[data.wger_id]) group_labels[data.wger_id] = data.label_de || data.display_name;
    }
    const viz = data?.viz;
    if (!viz) return;
    if (viz.rbh) rbh[d.id] = viz.rbh;
    if (viz.body_muscles?.ids?.length) {
      body_muscles[d.id] = viz.body_muscles;
      body_muscles_slugs[d.id] = viz.body_muscles.ids[0];
    }
  });
  _vizCache = { rbh, body_muscles, body_muscles_slugs, wger, group_labels };
  return _vizCache;
}

// Inbox-Funktionen (sendToInbox, queueForEnrichment, getInbox, approveInbox,
// reenrichInbox, ...) leben jetzt in ./inbox.js — siehe index.firestore.js-Barrel.
