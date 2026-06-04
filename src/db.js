import { api, localToday } from "./api.js";

const LOCAL_KEYS = {
  settings: "fitness-local-settings",
  layout: "fitness-local-layout",
  body: "fitness-local-body",
  plan: "fitness-local-plan",
  habitOverlay: "fitness-local-habit-overlay",
  habitJournals: "fitness-local-habit-journals",
};

function readJSON(key, fallback) {
  try {
    const raw = localStorage.getItem(key);
    return raw ? JSON.parse(raw) : fallback;
  } catch {
    return fallback;
  }
}

function writeJSON(key, value) {
  try {
    localStorage.setItem(key, JSON.stringify(value));
  } catch {}
}

function readMap(key) {
  return readJSON(key, {});
}

function writeMap(key, map) {
  writeJSON(key, map);
}

function normalizeHabitRecord(record) {
  const date =
    record?.date ||
    (record?.epochDay !== undefined
      ? new Date(Number(record.epochDay) * 86400000).toISOString().slice(0, 10)
      : null);
  if (!date) return null;
  return {
    ...record,
    date,
    completion: record?.completion || (record?.done ? "DONE" : "MISSED"),
  };
}

function overlayHabit(habit) {
  const overlay = readJSON(LOCAL_KEYS.habitOverlay, {})[habit.uuid] || {};
  return { ...habit, ...overlay };
}

function mapHabits(raw) {
  const habits = Array.isArray(raw) ? raw : raw?.habits || [];
  return habits
    .map((h) => {
      const records = (h.records || [])
        .map(normalizeHabitRecord)
        .filter(Boolean);
      return {
        uuid: h.uuid || h.id,
        name: h.name,
        icon: h.icon || "Activity",
        deleted: !!h.deleted,
        source: h.source || (isLocalMode() ? "coach" : "user"), // Hybrid logic
        records,
        hasRecord: (date) => records.some((x) => x.date === date && x.completion === "DONE"),
      };
    })
    .map(overlayHabit);
}

export function watchAuth(callback) {
  const user = { displayName: "Local Host", email: "localhost", photoURL: null };
  callback?.(user);
  return () => {};
}

export async function signIn() { return { ok: true }; }
export async function signOut() { return { ok: true }; }
export async function signInEmail() { return { ok: true }; }
export async function signUpEmail() { return { ok: true }; }

export function getUid() { return "local"; }
export function isLocalMode() { return true; }
export function setOverrideUid() {}

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

export async function getPlan() {
  return readJSON(LOCAL_KEYS.plan, null);
}

export async function savePlan(plan) {
  writeJSON(LOCAL_KEYS.plan, plan);
  return { ok: true };
}

export async function getJournal(date = localToday()) {
  try {
    const data = await api.get(`/journal?date=${date}`);
    if (!data?.content) return [];
    return [{ id: date, date, text: data.content, time: data.mtime || date }];
  } catch {
    return [];
  }
}

export async function saveJournal(date = localToday(), text) {
  const content = String(text || "").trim();
  await api.post(`/journal?date=${date}`, { content });
  return { id: date, date, text: content, time: new Date().toISOString() };
}

export async function updateJournal(id, text) {
  const date = /^\d{4}-\d{2}-\d{2}$/.test(id) ? id : localToday();
  await api.post(`/journal?date=${date}`, { content: String(text || "").trim() });
  return { ok: true };
}

export async function getAllHabitJournalsForDate(date) {
  const journals = readJSON(LOCAL_KEYS.habitJournals, {});
  return Object.entries(journals)
    .map(([habitId, items]) => {
      const current = (Array.isArray(items) ? items : []).find((item) => item.date === date);
      return current ? { id: `${habitId}_${date}`, habitId, ...current, type: "habit" } : null;
    })
    .filter(Boolean);
}

export async function getHabits() {
  try {
    const data = await api.get("/habitsync/habits");
    return mapHabits(data).filter((h) => !h.deleted);
  } catch {
    return [];
  }
}

export async function updateHabit(uuid, newName, newIcon) {
  const overlay = readJSON(LOCAL_KEYS.habitOverlay, {});
  overlay[uuid] = { ...(overlay[uuid] || {}), name: newName, icon: newIcon };
  writeJSON(LOCAL_KEYS.habitOverlay, overlay);
  return { ok: true };
}

export async function addHabit(name, icon = "Activity") {
  return api.post("/habitsync/add", { name: name.trim(), icon });
}

export async function deleteHabit(uuid) {
  const overlay = readJSON(LOCAL_KEYS.habitOverlay, {});
  overlay[uuid] = { ...(overlay[uuid] || {}), deleted: true };
  writeJSON(LOCAL_KEYS.habitOverlay, overlay);
  return api.delete(`/habitsync/delete/${encodeURIComponent(uuid)}`);
}

export async function getHabitRecordsForDate(date = localToday()) {
  const habits = await getHabits();
  return habits.filter((h) => h.hasRecord(date)).map((h) => h.uuid);
}

export async function recordHabit(uuid, date = localToday()) {
  if (date === localToday()) {
    return api.post(`/habitsync/record/${encodeURIComponent(uuid)}`, {});
  }
  console.warn("Local HabitSync does not support backdating records.");
  return { ok: false };
}

export async function unrecordHabit(uuid, date = localToday()) {
  if (date === localToday()) {
    return api.post(`/habitsync/record/${encodeURIComponent(uuid)}`, {});
  }
  console.warn("Local HabitSync does not support backdating records.");
  return { ok: false };
}

export async function getHabitJournal(habitId, date) {
  const journals = readJSON(LOCAL_KEYS.habitJournals, {});
  return (journals[habitId] || []).find((item) => item.date === date) || null;
}

export async function getHabitJournalHistory(habitId) {
  const journals = readJSON(LOCAL_KEYS.habitJournals, {});
  return (journals[habitId] || []).slice().sort((a, b) => b.date.localeCompare(a.date));
}

export async function saveHabitJournal(habitId, date, text) {
  const journals = readJSON(LOCAL_KEYS.habitJournals, {});
  const items = Array.isArray(journals[habitId]) ? journals[habitId].filter((item) => item.date !== date) : [];
  items.unshift({ date, text: String(text || "").trim(), updated_at: new Date().toISOString() });
  journals[habitId] = items;
  writeJSON(LOCAL_KEYS.habitJournals, journals);
  return { ok: true };
}

export async function getSettings() {
  return readJSON(LOCAL_KEYS.settings, { theme: "honey", themeMode: "manual" });
}

export async function saveSettings(settings) {
  writeJSON(LOCAL_KEYS.settings, settings);
  return { ok: true };
}

export async function getLayout() {
  const layout = readJSON(LOCAL_KEYS.layout, null);
  return layout?.layout || null;
}

export async function saveLayout(layout) {
  writeJSON(LOCAL_KEYS.layout, { layout });
  return { ok: true };
}

export async function getBodyEntry(date) {
  return readMap(LOCAL_KEYS.body)[date] || null;
}

export async function saveBodyEntry(date, data) {
  const body = readMap(LOCAL_KEYS.body);
  body[date] = { ...(body[date] || {}), ...data, date, saved_at: new Date().toISOString() };
  writeMap(LOCAL_KEYS.body, body);
  return { ok: true };
}

export async function getBodyEntries(days = 30) {
  const body = readMap(LOCAL_KEYS.body);
  return Object.values(body)
    .filter(Boolean)
    .sort((a, b) => String(b.date || "").localeCompare(String(a.date || "")))
    .slice(0, days);
}

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

export async function getAnatomy(exerciseId) {
  try {
    const data = await api.get(`/exercise/${encodeURIComponent(exerciseId)}/teaching`);
    return data?.lesson || null;
  } catch {
    return null;
  }
}

export async function getMuscle(muscleId) {
  try {
    return await api.get(`/fitness/muscles/${encodeURIComponent(muscleId)}`);
  } catch {
    return null;
  }
}

export async function sendToInbox() {
  return { ok: false };
}

export async function exportCsv(days = 14) {
  const res = await api.get(`/export/csv?days=${days}`);
  if (!res?.ok) return { ok: false };
  const blob = new Blob([res.csv || ""], { type: "text/csv;charset=utf-8" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = res.filename || `fitness-${days}d-${localToday()}.csv`;
  a.click();
  URL.revokeObjectURL(url);
  return res;
}

export function parseQuick(raw) {
  if (!raw?.trim()) return null;
  const name = raw.replace(/[\\d@x\\s].*/i, "").trim() || raw.trim();
  const setsMatch = raw.match(/(\\d+)\\s*[xX×]\\s*(\\d+)/);
  const weightMatch = raw.match(/@(\\d+(?:\\.\\d+)?)/);
  const rpeMatch = raw.match(/rpe\\s*(\\d+(?:\\.\\d+)?)/i);
  return {
    name,
    sets: setsMatch ? setsMatch[1] : "3",
    reps: setsMatch ? setsMatch[2] : "10",
    weight: weightMatch ? weightMatch[1] : "",
    note: rpeMatch ? `RPE ${rpeMatch[1]}` : "",
    primaryMuscles: [],
    secondaryMuscles: [],
    done: true,
  };
}
