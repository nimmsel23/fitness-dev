import { api } from "./core";

// Makrozyklen (mehrwöchige, handgebaute Trainingsblöcke) — Coach ↔ Klient.
export async function listMacrocycles(clientUid) {
  try {
    const data = await api.get(`/fitness/coach/macrocycles/${encodeURIComponent(clientUid)}`);
    return data?.macrocycles || [];
  } catch {
    return [];
  }
}

export async function getMacrocycle(clientUid, cycleId) {
  try {
    const data = await api.get(
      `/fitness/coach/macrocycles/${encodeURIComponent(clientUid)}/${encodeURIComponent(cycleId)}`
    );
    return data?.macrocycle || null;
  } catch {
    return null;
  }
}

export async function createMacrocycle(clientUid, { name, coachUid, weeks }) {
  const data = await api.post(`/fitness/coach/macrocycles/${encodeURIComponent(clientUid)}`, {
    name,
    coachUid,
    weeks,
  });
  return data?.macrocycle || null;
}

export async function updateMacrocycleWeeks(clientUid, cycleId, weeks) {
  const data = await api.put(
    `/fitness/coach/macrocycles/${encodeURIComponent(clientUid)}/${encodeURIComponent(cycleId)}`,
    { weeks }
  );
  return data?.macrocycle || null;
}

export async function deleteMacrocycle(clientUid, cycleId) {
  await api.delete(
    `/fitness/coach/macrocycles/${encodeURIComponent(clientUid)}/${encodeURIComponent(cycleId)}`
  );
  return true;
}
