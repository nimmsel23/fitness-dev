import { api } from "./core";

// ── Coach-Tab: globaler Feed aller Klienten-Workouts + Profile ───────────────

export async function getGlobalJournalFeed(limitCount = 100) {
  try {
    const data = await api.get(`/fitness/coach/feed?limit=${limitCount}`);
    return data?.feed || [];
  } catch {
    return [];
  }
}

// Gezielt nur die Einträge eines Klienten — umgeht den globalen
// limit-Cutoff von getGlobalJournalFeed() (siehe server.mjs-Kommentar).
export async function getClientJournalFeed(clientUid, limitCount = 100) {
  try {
    const data = await api.get(`/fitness/coach/feed?uid=${encodeURIComponent(clientUid)}&limit=${limitCount}`);
    return data?.feed || [];
  } catch {
    return [];
  }
}

// Coach beobachtet Habit-Fortschritt eines Klienten (read-only) — nutzt
// dieselben /routines + /workouts-Routen wie der Klient selbst, per
// ?uid=-Override (Python _uid_from_request() unterstützt das bereits für
// alle Routen, kein neuer Endpoint nötig). Fortschritt wird im UI-Layer
// aus routines+workouts berechnet (lib/habitProgress.js).
export async function getClientRoutinesProgress(clientUid) {
  try {
    const [routinesRes, workoutsRes] = await Promise.all([
      api.get(`/routines?uid=${encodeURIComponent(clientUid)}`),
      api.get(`/workouts?uid=${encodeURIComponent(clientUid)}`),
    ]);
    return { routines: routinesRes?.routines || [], workouts: workoutsRes?.workouts || [] };
  } catch {
    return { routines: [], workouts: [] };
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
