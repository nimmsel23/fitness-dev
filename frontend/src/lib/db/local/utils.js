import { api } from "./core";
import { getWeekDates, downloadText, num, localToday } from '../shared/utils';
export { getWeekDates, downloadText, num };

export async function exportFitnessData(payload) {
  try {
    return await api.post('/fitness/export', payload);
  } catch {
    return null;
  }
}

export async function exportCsv(days = 14) {
  const res = await api.get(`/export/csv?days=${days}`);
  if (!res?.ok) return { ok: false };
  downloadText(res.filename || `fitness-${days}d-${localToday()}.csv`, res.csv || "", "text/csv;charset=utf-8");
  return res;
}
