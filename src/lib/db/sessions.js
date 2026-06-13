import { api, localToday } from "./core";

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

export async function getProgressTrend(exerciseName) {
  return { status: "neutral", change: 0 };
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
