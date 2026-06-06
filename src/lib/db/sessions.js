import { api, localToday } from "./core";

export async function getSession(date = localToday()) {
  try {
    const data = await api.get(`/session?date=${date}`);
    return data?.data || null;
  } catch {
    return null;
  }
}

export async function saveSession(date = localToday(), sessionData) {
  await api.post(`/session?date=${date}`, sessionData || {});
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
