import { api, localToday } from "./core";

export async function getJournal(date = localToday()) {
  const data = await api.get(`/journal?date=${date}`);
  return data?.entry || null;
}

export async function getJournalHistory(limitCount = 50) {
  const data = await api.get(`/journal/list?limit=${limitCount}`);
  return data?.entries || [];
}

export async function saveJournal(date = localToday(), text) {
  return api.post("/journal", { date, text });
}
