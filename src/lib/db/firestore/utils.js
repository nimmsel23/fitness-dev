import { getWeekDates, downloadText, num, todayISO, localToday } from '../shared/utils.js';
export { getWeekDates, downloadText, num, todayISO, localToday };
import { getSession } from "./sessions.js";

import {
  collection, doc, addDoc, setDoc, getDoc, getDocs, deleteDoc, updateDoc,
  query, where, orderBy, limit, serverTimestamp, writeBatch, collectionGroup
} from "firebase/firestore";
import {
  onAuthStateChanged,
  signInWithPopup, signInWithEmailAndPassword, createUserWithEmailAndPassword,
  signOut as fbSignOut, updateProfile,
} from "firebase/auth";

import { db, auth, googleProvider } from "../../../firebase.js";
import { getUid, pingBridge } from "./core.js";
import { getAllExercises } from "./kb.js";
import { updateAnalyticsDoc } from "./analysis.js";


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
  downloadText(`fitness-${days}d-${todayISO()}.csv`, csv, "text/csv;charset=utf-8");
}

export function parseQuick(raw) {
  if (!raw?.trim()) return null;
  const name = raw.replace(/[\d@x\s].*/i, "").trim() || raw.trim();
  const setsMatch = raw.match(/(\d+)\s*[xX×]\s*(\d+)/);
  const weightMatch = raw.match(/@(\d+(?:\.\d+)?)/);
  const rpeMatch = raw.match(/rpe\s*(\d+(?:\.\d+)?)/i);
  const count = setsMatch ? parseInt(setsMatch[1]) : 1;
  const reps = setsMatch ? setsMatch[2] : "";
  const weight = weightMatch ? weightMatch[1] : "";
  return {
    name,
    setsArray: Array.from({ length: count }, () => ({ reps, weight })),
    note: rpeMatch ? `RPE ${rpeMatch[1]}` : "",
    primaryMuscles: [], secondaryMuscles: [],

  };
}

export async function queueForEnrichment(ex) {
  // In Firebase mode: Firestore inbox (already handled via sendToInbox for new exercises)
  if (!ex || ex.source === 'expert') return
  // fire-and-forget to local catalog server if available
  try {
    await fetch('http://localhost:9120/inbox/queue', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ exercise_id: ex.id || ex.exercise_id, name: ex.name || ex.display_name }),
    })
  } catch {}
}

const FAV_KEY = 'fitness_favourites'
export function getFavourites() {
  try { return JSON.parse(localStorage.getItem(FAV_KEY) || '[]') } catch { return [] }
}
export function toggleFavourite(exerciseId) {
  const favs = getFavourites()
  const idx = favs.indexOf(exerciseId)
  const next = idx >= 0 ? favs.filter(f => f !== exerciseId) : [...favs, exerciseId]
  localStorage.setItem(FAV_KEY, JSON.stringify(next))
  return next.includes(exerciseId)
}

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
      type: "workout"
    });
  }

  feed.sort((a, b) => b.date.localeCompare(a.date));
  return feed.slice(0, limitCount);
}

export async function getAllUserProfiles() {
  try {
    const snap = await getDocs(collectionGroup(db, "profile"));
    const profiles = {};
    snap.docs.forEach(d => {
      const uid = d.reference.parent.parent.id;
      profiles[uid] = d.data();
    });
    return profiles;
  } catch {
    return {};
  }
}

export async function saveCoachFeedback(userId, entryId, type, text, habitId = null, date = null) {
  if (type === 'habit_journal' || type === 'habit') {
    const targetHabitId = habitId || entryId.split("__")[0];
    const targetDate = date || entryId.split("__")[1];
    const ref = doc(db, "fitness", userId, "habitJournals", `${targetHabitId}__${targetDate}`);
    await setDoc(ref, { coachFeedback: String(text || "").trim(), updated_at: serverTimestamp() }, { merge: true });
  } else if (type === 'workout' || type === 'session') {
    const ref = doc(db, "fitness", userId, "sessions", entryId);
    await setDoc(ref, { coachFeedback: String(text || "").trim(), updated_at: serverTimestamp() }, { merge: true });
  } else {
    const ref = doc(db, "fitness", userId, "journal", entryId);
    await setDoc(ref, { coachFeedback: String(text || "").trim() }, { merge: true });
  }
  return { ok: true };
}
