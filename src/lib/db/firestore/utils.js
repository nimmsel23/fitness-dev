/**
 * firestore/utils.js — CSV export, parseQuick, coach feed, and multi-user helpers.
 */

import { downloadText, todayISO } from "../shared/utils.js";
import { getSession } from "./sessions.js";

export { getWeekDates, downloadText, num, todayISO, localToday } from "../shared/utils.js";
export { parseQuick } from "../shared/parse.js";

// Coach-Feed-Funktionen (getGlobalJournalFeed, getAllUserProfiles,
// saveCoachFeedback) leben jetzt in ./coach.js.

// ── CSV export ────────────────────────────────────────────────────────────────

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
  const csv = rows.map((r) => r.map((v) => `"${v}"`).join(",")).join("\n");
  downloadText(`fitness-${days}d-${todayISO()}.csv`, csv, "text/csv;charset=utf-8");
}
