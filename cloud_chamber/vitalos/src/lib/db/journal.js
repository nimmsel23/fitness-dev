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

export async function getJournalHistory(limitCount = 50) {
  try {
    const data = await api.get(`/journal/history?limit=${limitCount}`);
    return data?.entries || [];
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
  const journals = JSON.parse(localStorage.getItem("fitness-local-habit-journals") || "{}");
  return Object.entries(journals)
    .map(([habitId, items]) => {
      const current = (Array.isArray(items) ? items : []).find((item) => item.date === date);
      return current ? { id: `${habitId}_${date}`, habitId, ...current, type: "habit" } : null;
    })
    .filter(Boolean);
}

export async function getAllHabitJournalsHistory(limitCount = 50) {
  const journals = JSON.parse(localStorage.getItem("fitness-local-habit-journals") || "{}");
  const allEntries = [];
  
  Object.entries(journals).forEach(([habitId, items]) => {
    (Array.isArray(items) ? items : []).forEach(item => {
       allEntries.push({ id: `${habitId}_${item.date}`, habitId, ...item, type: "habit" });
    });
  });
  
  return allEntries
    .sort((a, b) => b.date.localeCompare(a.date))
    .slice(0, limitCount);
}
