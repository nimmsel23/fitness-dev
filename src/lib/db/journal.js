import { api, localToday } from "./core";

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
