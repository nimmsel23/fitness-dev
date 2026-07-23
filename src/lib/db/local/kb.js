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

export async function getConfig() {
  try {
    return await api.get("/fitness/config");
  } catch {
    return null;
  }
}

export async function getInbox() {
  try {
    const data = await api.get("/fitness/inbox");
    return data?.exercises || [];
  } catch {
    return [];
  }
}

export async function getGlobalInbox() {
  return getInbox();
}

export async function approveInbox(id, userId) {
  try {
    return await api.post(`/fitness/inbox/${id}/approve`, userId ? { userId } : {});
  } catch {
    return { ok: false };
  }
}

export { getFavourites, toggleFavourite } from "../shared/favourites.js";
export { parseQuick } from "../shared/parse.js";

export async function queueForEnrichment(ex) {
  if (!ex || ex.source === 'expert') return;
  // Vormals ein fetch() gegen http://localhost:9120 — der archivierte
  // aiohttp-catalog-Server, längst durch das FastAPI-Prod-Backend (:9150,
  // hinter server.mjs :9100 geproxied) abgelöst. Schlug immer still fehl
  // (try{}catch{}), Übungen wurden im lokalen Modus nie fürs Enrichment
  // vorgemerkt. /fitness/inbox/queue ist der reale, laufende Endpoint dafür
  // (fitness/api/routers/exercises.py) — über api.post statt hartcodierter
  // toter URL. Hinweis: Der Endpoint schreibt aktuell nach
  // fitness/catalog/kb/inbox/*.yml, NICHT in das vom Enrichment-Watcher
  // beobachtete ~/.aos/fitness/users/<uid>/inbox/*.json — dieser Bruch ist
  // separat als offene Aufgabe dokumentiert, hier nur der :9120-Dead-Link-Bug.
  try {
    await api.post("/fitness/inbox/queue", {
      exercise_id: ex.id || ex.exercise_id,
      name: ex.name || ex.display_name,
    });
  } catch {}
}

export async function deleteInbox(id) {
  try {
    return await api.delete(`/fitness/inbox/${id}`);
  } catch {
    return { ok: false };
  }
}

export async function sendToInbox(exerciseData) {
  try {
    return await api.post("/fitness/inbox", exerciseData);
  } catch {
    return { ok: false };
  }
}

// ── Coach-only: globaler Feed aller Klienten-Workouts ─────────────────────────

export async function getGlobalJournalFeed(limitCount = 100) {
  try {
    const data = await api.get(`/fitness/coach/feed?limit=${limitCount}`);
    return data?.feed || [];
  } catch {
    return [];
  }
}

export async function getAllUserProfiles() {
  try {
    const data = await api.get('/fitness/coach/profiles');
    return data?.profiles || {};
  } catch {
    return {};
  }
}

export async function saveCoachFeedback(userId, sessionId, type, text) {
  try {
    return await api.post('/fitness/coach/feedback', { userId, sessionId, text });
  } catch {
    return { ok: false };
  }
}

