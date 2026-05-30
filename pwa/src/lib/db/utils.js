import { getSession } from "./sessions";
import { todayISO } from "../utils";

export async function exportCsv(days = 14) {
  const today = new Date();
  const dates = [];
  for (let i = 0; i < days; i++) {
    const d = new Date(today);
    d.setDate(today.getDate() - i);
    dates.push(d.toISOString().slice(0, 10));
  }
  const rows = [["date", "block", "exercise", "sets", "reps", "weight", "note", "effort"]];
  for (const date of dates) {
    const sess = await getSession(date);
    const block = sess?.block || "";
    const effort = sess?.effort ?? "";
    for (const ex of (sess?.exercises || [])) {
      rows.push([date, block, ex.name || "", ex.sets || "", ex.reps || "", ex.weight || "", ex.note || "", effort]);
    }
  }
  const csv = rows.map(r => r.map(v => `"${v}"`).join(",")).join("\n");
  const blob = new Blob([csv], { type: "text/csv;charset=utf-8" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = `fitness-${days}d-${todayISO()}.csv`;
  a.click();
  URL.revokeObjectURL(url);
}

export function parseQuick(raw) {
  if (!raw?.trim()) return null;
  const name = raw.replace(/[\d@x\s].*/i, "").trim() || raw.trim();
  const setsMatch = raw.match(/(\d+)\s*[xX×]\s*(\d+)/);
  const weightMatch = raw.match(/@(\d+(?:\.\d+)?)/);
  const rpeMatch = raw.match(/rpe\s*(\d+(?:\.\d+)?)/i);
  return {
    name,
    sets: setsMatch ? setsMatch[1] : "3",
    reps: setsMatch ? setsMatch[2] : "10",
    weight: weightMatch ? weightMatch[1] : "",
    note: rpeMatch ? `RPE ${rpeMatch[1]}` : "",
    primaryMuscles: [],
    secondaryMuscles: [],
    done: true,
  };
}
