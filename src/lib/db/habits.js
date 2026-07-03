import { api, localToday } from "./core";

export async function getHabits() {
  const data = await api.get("/habitsync/habits");
  return data?.habits || [];
}

export async function addHabit(name, icon = "Activity") {
  return api.post("/habitsync/add", { name, icon });
}

export async function deleteHabit(uuid) {
  return api.delete(`/habitsync/delete/${uuid}`);
}

export async function updateHabit(uuid, newName, newIcon) {
  return api.post(`/habitsync/update/${uuid}`, { name: newName, icon: newIcon });
}

export async function recordHabit(uuid, date = localToday()) {
  return api.post(`/habitsync/record/${uuid}`, { date, completion: "DONE" });
}

export async function unrecordHabit(uuid, date = localToday()) {
  return api.post(`/habitsync/record/${uuid}`, { date, completion: "MISSED" });
}

export async function getHabitRecordsForDate(date = localToday()) {
  const data = await api.get(`/habitsync/records?date=${date}`);
  return data?.completedIds || [];
}

export async function getHabitJournal(habitId, date) {
  try {
    const data = await api.get(`/habitsync/journal/${habitId}?date=${date}`);
    return data || null;
  } catch { return null; }
}

export async function getHabitJournalHistory(habitId) {
  try {
    const data = await api.get(`/habitsync/journal/${habitId}/history`);
    return data?.entries || [];
  } catch { return []; }
}

export async function getAllHabitJournalsHistory() {
  try {
    const data = await api.get("/habitsync/journal/all");
    return data?.entries || [];
  } catch { return []; }
}

export async function saveHabitJournal(habitId, date, text) {
  return api.post(`/habitsync/journal/${habitId}`, { date, text });
}
