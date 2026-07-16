/**
 * firestore/kb.js — Exercise Knowledge Base CRUD for Firestore.
 * Favourites are localStorage-backed and mode-agnostic (→ shared/favourites.js).
 */

import {
  collection, doc, addDoc, getDoc, getDocs,
  serverTimestamp,
} from "firebase/firestore";

import { db } from "../../../firebase.js";
import { muscleToGroups } from "../../muscleMapping.js";
import { getUid } from "./core.js";
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

// ── Inbox (KB-side) ───────────────────────────────────────────────────────────

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

// ── Enrichment queue ──────────────────────────────────────────────────────────

export async function queueForEnrichment(ex) {
  if (!ex || ex.source === "expert") return;
  // fire-and-forget to local catalog server if available
  try {
    await fetch("http://localhost:9120/inbox/queue", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ exercise_id: ex.id || ex.exercise_id, name: ex.name || ex.display_name }),
    });
  } catch {}
}
