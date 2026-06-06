const LOCAL_KEYS = {
  settings: "fitness-local-settings",
  layout: "fitness-local-layout",
  body: "fitness-local-body",
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

export async function getBodyEntry(date) {
  const body = readJSON(LOCAL_KEYS.body, {});
  return body[date] || null;
}
export async function saveBodyEntry(date, data) {
  const body = readJSON(LOCAL_KEYS.body, {});
  body[date] = { ...(body[date] || {}), ...data, date, saved_at: new Date().toISOString() };
  writeJSON(LOCAL_KEYS.body, body);
  return { ok: true };
}
export async function getBodyEntries(days = 30) {
  const body = readJSON(LOCAL_KEYS.body, {});
  return Object.values(body)
    .filter(Boolean)
    .sort((a, b) => String(b.date || "").localeCompare(String(a.date || "")))
    .slice(0, days);
}
