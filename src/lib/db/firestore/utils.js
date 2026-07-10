/**
 * firestore/utils.js — CSV export, parseQuick, coach feed, and multi-user helpers.
 */

import {
  doc, setDoc, getDocs, serverTimestamp, collectionGroup,
} from "firebase/firestore";

import { db } from "../../../firebase.js";
import { downloadText, todayISO } from "../shared/utils.js";
import { getUid } from "./core.js";
import { getSession } from "./sessions.js";

export { getWeekDates, downloadText, num, todayISO, localToday } from "../shared/utils.js";
export { parseQuick } from "../shared/parse.js";

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

// ── Global coach / multi-user views ──────────────────────────────────────────

export async function getGlobalJournalFeed(limitCount = 50) {
  const snap = await getDocs(collectionGroup(db, "sessions"));
  const feed = [];
  for (const d of snap.docs) {
    const data = d.data();
    const userId = d.reference.parent.parent.id;
    feed.push({
      id: d.id,
      userId,
      path: d.reference.path,
      date: data.date,
      exercises: data.exercises || [],
      effort: data.effort ?? null,
      mood: data.mood || "",
      notes: data.notes || "",
      coachFeedback: data.coachFeedback || "",
      time: data.saved_at?.toDate?.()?.toISOString() || data.date,
      type: "workout",
    });
  }
  feed.sort((a, b) => b.date.localeCompare(a.date));
  return feed.slice(0, limitCount);
}

export async function getAllUserProfiles() {
  try {
    const snap = await getDocs(collectionGroup(db, "profile"));
    const profiles = {};
    snap.docs.forEach((d) => {
      const uid = d.reference.parent.parent.id;
      profiles[uid] = d.data();
    });
    return profiles;
  } catch {
    return {};
  }
}

export async function saveCoachFeedback(userId, entryId, type, text, habitId = null, date = null) {
  if (type === "habit_journal" || type === "habit") {
    const targetHabitId = habitId || entryId.split("__")[0];
    const targetDate = date || entryId.split("__")[1];
    const ref = doc(db, "fitness", userId, "habitJournals", `${targetHabitId}__${targetDate}`);
    await setDoc(ref, { coachFeedback: String(text || "").trim(), updated_at: serverTimestamp() }, { merge: true });
  } else if (type === "workout" || type === "session") {
    const ref = doc(db, "fitness", userId, "sessions", entryId);
    await setDoc(ref, { coachFeedback: String(text || "").trim(), updated_at: serverTimestamp() }, { merge: true });
  } else {
    const ref = doc(db, "fitness", userId, "journal", entryId);
    await setDoc(ref, { coachFeedback: String(text || "").trim() }, { merge: true });
  }
  return { ok: true };
}
