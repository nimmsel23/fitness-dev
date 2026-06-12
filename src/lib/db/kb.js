import { api } from "./core";

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

export async function searchExercises(query, limit = 12) {
  const q = String(query || "").trim();
  if (!q) return { ok: true, results: [], query: q, suggestions: [] };
  try {
    const data = await api.get(`/fitness/search?q=${encodeURIComponent(q)}&limit=${limit}`);
    return data || { ok: false, results: [], query: q };
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

export async function getMuscle(muscleId) {
  try { return await api.get(`/fitness/muscles/${encodeURIComponent(muscleId)}`); } catch { return null; }
}

export async function sendToInbox() {
  return { ok: false };
}
