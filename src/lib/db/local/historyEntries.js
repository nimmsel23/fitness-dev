// Lokaler Modus (SQLite via server.mjs): die Abfrage ist ohnehin lokal, ein
// Index bringt nichts — gleiche Rückgabeform wie firestore/workoutIndex.js.
import { getRecentSessions } from "./sessions.js";
import { toIndexEntry } from "../../../../6pack/workoutDoc.js";

export async function getHistoryEntries({ months = 6 } = {}) {
  const n = months * 10;
  const sessions = await getRecentSessions(n);
  const entries = (Array.isArray(sessions) ? sessions : [])
    .map((s) => toIndexEntry(s.id ? `${s.date}__${s.id}` : s.date, s))
    .filter(Boolean);
  return { entries, hasMore: (sessions?.length || 0) >= n };
}
export async function compactWorkoutIndex() { return { processed: 0 }; }
