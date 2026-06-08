import { localToday } from "./core";

export function getWeekDates() {
  const today = localToday()
  const d = new Date(today + 'T12:00:00')
  const off = (d.getDay() + 6) % 7
  d.setDate(d.getDate() - off)
  return Array.from({ length: 7 }, (_, i) => {
    const x = new Date(d)
    x.setDate(d.getDate() + i)
    return `${x.getFullYear()}-${String(x.getMonth()+1).padStart(2,'0')}-${String(x.getDate()).padStart(2,'0')}`
  })
}

export function calculateExVolume(ex) {
  if (ex.isHIT) return 0;
  if (Array.isArray(ex.setsArray)) {
    return ex.setsArray.reduce((acc, set) => {
      const r = parseFloat(String(set.reps || "").replace(',', '.'));
      const w = parseFloat(String(set.weight || "").replace(',', '.'));
      return (Number.isFinite(r) && Number.isFinite(w)) ? acc + (r * w) : acc;
    }, 0);
  }
  const s = parseFloat(ex.sets), r = parseFloat(ex.reps), w = parseFloat(ex.weight);
  return (Number.isFinite(s) && Number.isFinite(r) && Number.isFinite(w)) ? s * r * w : 0;
}

export function downloadText(filename, text, mime = 'text/plain;charset=utf-8') {
  const blob = new Blob([text], { type: mime })
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url
  a.download = filename
  document.body.appendChild(a)
  a.click()
  a.remove()
  URL.revokeObjectURL(url)
}

export const num = (v) => {
  if (v === null || v === undefined) return null;
  const s = String(v).trim().replace(',', '.');
  if (!s) return null;
  const n = Number(s);
  return Number.isFinite(n) ? n : null;
};

export async function exportCsv(days = 14) {
  const { api } = await import("./core");
  const res = await api.get(`/export/csv?days=${days}`);
  if (!res?.ok) return { ok: false };
  downloadText(res.filename || `fitness-${days}d-${localToday()}.csv`, res.csv || "", "text/csv;charset=utf-8");
  return res;
}
