import { api, localToday } from "./core";

const LOCAL_KEYS = {
  settings: "fitness-local-settings",
  layout: "fitness-local-layout",
  push: "fitness-local-push-settings",
};

function readJSON(key, fallback) {
  try {
    const raw = localStorage.getItem(key);
    return raw ? JSON.parse(raw) : fallback;
  } catch { return fallback; }
}

function writeJSON(key, value) {
  try { localStorage.setItem(key, JSON.stringify(value)); } catch {}
}

export async function getSettings() { return readJSON(LOCAL_KEYS.settings, { theme: "honey", themeMode: "manual" }); }
export async function saveSettings(settings) { writeJSON(LOCAL_KEYS.settings, settings); return { ok: true }; }

export async function getLayout() {
  const layout = readJSON(LOCAL_KEYS.layout, null);
  return layout?.layout || null;
}
export async function saveLayout(layout) { writeJSON(LOCAL_KEYS.layout, { layout }); return { ok: true }; }

export async function getPushSettings() {
  return readJSON(LOCAL_KEYS.push, {
    enabled: false,
    types: {},
    reminderTime: "18:00",
  });
}

export async function savePushSettings(settings) {
  writeJSON(LOCAL_KEYS.push, settings);
  return { ok: true };
}

export async function getBodyEntry(date) {
  try {
    const data = await api.get(`/fitness/body?days=365`);
    return (data?.entries || []).find(e => e.date === date) || null;
  } catch { return null; }
}

export async function saveBodyEntry(date, data) {
  try {
    await api.post(`/fitness/body`, { ...data, date });
    return { ok: true };
  } catch { return { ok: false }; }
}

export async function getBodyEntries(days = 30) {
  try {
    const data = await api.get(`/fitness/body?days=${days}`);
    return data?.entries || [];
  } catch { return []; }
}

export async function getUserProfile(uid) {
  try {
    const raw = localStorage.getItem(`fitness-profile-${uid}`);
    return raw ? JSON.parse(raw) : null;
  } catch { return null; }
}

export async function updateUserProfile(uid, data) {
  try {
    const current = await getUserProfile(uid) || {};
    localStorage.setItem(`fitness-profile-${uid}`, JSON.stringify({ ...current, ...data, updated_at: new Date().toISOString() }));
    return true;
  } catch { return false; }
}
