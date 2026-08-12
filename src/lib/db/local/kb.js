import { api } from "./core";
import { normalizeExerciseRecord } from "../shared/exercise.js";

export async function getExercise(exerciseId) {
  try {
    const data = await api.get("/fitness/exercises/all");
    return (data?.exercises || []).find((ex) => String(ex.exercise_id || ex.id) === String(exerciseId)) || null;
  } catch {
    return null;
  }
}

export async function getAllExercises() {
  try {
    const data = await api.get("/fitness/exercises/all");
    return data?.exercises || [];
  } catch {
    return [];
  }
}

export async function saveExercise(exerciseId, data) {
  const exId = exerciseId || data.exercise_id || data.id;
  try {
    return await api.post(`/fitness/exercises/${exId}`, data);
  } catch {
    return { ok: false };
  }
}

export async function searchExercises(query, limit = 12) {
  const q = String(query || "").trim();
  if (!q) return { ok: true, results: [], query: q, suggestions: [] };
  try {
    const stored = localStorage.getItem('fitness-sessionSources');
    const sources = stored ? JSON.parse(stored) : { wger: true, yuhonas: true, coach: true };
    const active = Object.entries(sources).filter(([, v]) => v).map(([k]) => k).join(',') || 'wger';
    const data = await api.get(`/fitness/search?q=${encodeURIComponent(q)}&limit=${limit}&sources=${active}`);
    if (!data) return { ok: false, results: [], query: q };
    return {
      ...data,
      results: Array.isArray(data.results) ? data.results.map((ex) => normalizeExerciseRecord(ex)) : [],
    };
  } catch {
    return { ok: false, results: [], query: q };
  }
}

export async function getAnatomy(exerciseId) {
  try {
    const data = await api.get(`/exercise/${encodeURIComponent(exerciseId)}/teaching`);
    return data?.lesson || null;
  } catch {
    return null;
  }
}

import { setKBMuscles } from "../shared/muscle.js";

export async function getAllMuscles() {
  try {
    const data = await api.get("/fitness/muscles/all");
    const list = Array.isArray(data) ? data : (data?.muscles || []);
    setKBMuscles(list);
    return list;
  } catch {
    return [];
  }
}

export async function getMuscle(muscleId) {
  try { return await api.get(`/fitness/muscles/${encodeURIComponent(muscleId)}`); } catch { return null; }
}

// Local KB Functions

export async function getConfig() {
  try {
    return await api.get("/fitness/config");
  } catch {
    return null;
  }
}

export { getFavourites, toggleFavourite } from "../shared/favourites.js";
export { parseQuick } from "../shared/parse.js";

// Inbox-Funktionen (getInbox, approveInbox, reenrichInbox, sendToInbox,
// queueForEnrichment, ...) leben jetzt in ./inbox.js — siehe index.js-Barrel.
// Coach-Feed-Funktionen (getGlobalJournalFeed, getAllUserProfiles,
// saveCoachFeedback) leben jetzt in ./coach.js.
