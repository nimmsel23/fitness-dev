import { api, localToday } from "./core";
import { calculateExVolume, num } from "./utils";

export async function getSession(date = localToday(), id = null) {
  try {
    const qs = id ? `?date=${date}&id=${encodeURIComponent(id)}` : `?date=${date}`;
    const data = await api.get(`/session${qs}`);
    return data?.data || null;
  } catch {
    return null;
  }
}

export async function saveSession(date = localToday(), sessionData, id = null) {
  const qs = id ? `?date=${date}&id=${encodeURIComponent(id)}` : `?date=${date}`;
  await api.post(`/session${qs}`, sessionData || {});
  return { ok: true };
}

export async function listSessionsForDate(date = localToday()) {
  try {
    const data = await api.get(`/sessions?date=${date}`);
    return data?.sessions || [];
  } catch {
    return [];
  }
}

export async function deleteSession(date = localToday(), id = null) {
  const qs = id ? `?date=${date}&id=${encodeURIComponent(id)}` : `?date=${date}`;
  await api.delete(`/session${qs}`);
  return { ok: true };
}

export async function getRecentSessions(n = 10) {
  try {
    const data = await api.get(`/session/history?limit=${n}`);
    return data?.sessions || [];
  } catch {
    return [];
  }
}

export async function getLatestSession() {
  const sessions = await getRecentSessions(1);
  return sessions.length > 0 ? sessions[0] : null;
}

export async function getSessionHistory(n = 60) {
  return getRecentSessions(n);
}

export async function getProgressTrend(exerciseName, lastN = 4) {
  const history = await getSessionHistory(lastN * 7);
  const sessions = (Array.isArray(history) ? history.filter(Boolean) : [])
    .map(s => ({ ...s, exercises: Array.isArray(s.exercises) ? s.exercises : [] }))
    .filter(s => s.exercises.some(ex => ex.name === exerciseName))
    .sort((a, b) => b.date.localeCompare(a.date));

  if (sessions.length < 2) return { status: "neutral", message: "Nicht genug Daten" };

  const values = sessions.map(s => {
    const ex = s.exercises.find(e => e.name === exerciseName);
    if (!ex) return null;
    if (ex.isHIT) {
      const w = ex.weight || ex.setsArray?.[0]?.weight;
      return num(w);
    }
    return calculateExVolume(ex);
  }).filter(v => v !== null && v > 0);

  if (values.length < 2) return { status: "neutral", message: "Zu wenig Daten" };

  const current = values[0];
  const avgPrevious = values.slice(1, lastN).reduce((a, b) => a + b, 0) / Math.max(values.length - 1, 1);
  if (avgPrevious === 0) return { status: "neutral" };

  const pctChange = ((current - avgPrevious) / avgPrevious) * 100;
  if (pctChange > 2)  return { status: "up",      change: pctChange.toFixed(1) };
  if (pctChange < -2) return { status: "down",    change: pctChange.toFixed(1) };
  return                   { status: "neutral", change: pctChange.toFixed(1) };
}

export async function getPlan() {
  return JSON.parse(localStorage.getItem("fitness-local-plan") || "null");
}

export async function savePlan(plan) {
  localStorage.setItem("fitness-local-plan", JSON.stringify(plan));
  return { ok: true };
}

export function parseQuick(raw) {
  if (!raw?.trim()) return null
  const name = raw.replace(/[\d@x\s].*/i, '').trim() || raw.trim()
  const setsMatch = raw.match(/(\d+)\s*[xX×]\s*(\d+)/)
  const weightMatch = raw.match(/@(\d+(?:\.\d+)?)/)
  const rpeMatch = raw.match(/rpe\s*(\d+(?:\.\d+)?)/i)

  const count = setsMatch ? parseInt(setsMatch[1]) : 1
  const reps = setsMatch ? setsMatch[2] : "10"
  const weight = weightMatch ? weightMatch[1] : ""
  
  const setsArray = Array.from({ length: count }, () => ({
    reps,
    weight
  }))

  return {
    name,
    setsArray,
    note: rpeMatch ? `RPE ${rpeMatch[1]}` : '',
    primaryMuscles: [],
    secondaryMuscles: [],
    done: true,
    isHIT: false
  }
}
