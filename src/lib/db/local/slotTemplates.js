const LOCAL_KEY = "fitness-local-slotTemplates";

function readJSON(key, fallback) {
  try {
    const raw = localStorage.getItem(key);
    return raw ? JSON.parse(raw) : fallback;
  } catch { return fallback; }
}

function writeJSON(key, value) {
  try { localStorage.setItem(key, JSON.stringify(value)); } catch {}
}

export async function getSlotTemplates(block = null) {
  const all = readJSON(LOCAL_KEY, []);
  return block ? all.filter(t => t.block === block) : all;
}

export async function saveSlotTemplate(template) {
  const all = readJSON(LOCAL_KEY, []);
  const idx = all.findIndex(t => t.id === template.id);
  if (idx === -1) all.push(template);
  else all[idx] = template;
  writeJSON(LOCAL_KEY, all);
  return { ok: true };
}

export async function deleteSlotTemplate(id) {
  const all = readJSON(LOCAL_KEY, []);
  writeJSON(LOCAL_KEY, all.filter(t => t.id !== id));
  return { ok: true };
}
