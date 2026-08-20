/**
 * firestore/coach.js — Coach-Tab: globaler Feed aller Klienten-Workouts/Journale + Profile.
 */

import {
  doc, setDoc, getDocs, serverTimestamp, collectionGroup, collection,
} from "firebase/firestore";

import { db } from "../../../firebase.js";

// Direkte Pro-Klient-Query (fitness/{uid}/sessions|journal|habitJournals),
// keine collectionGroup über alle User. Wichtig: getGlobalJournalFeed()
// deckelt global auf `limitCount` Items über ALLE Klienten hinweg, bevor
// überhaupt gefiltert wird — bei mehreren aktiven Usern (inkl. des Coaches
// selbst, der die App auch für eigene Sessions nutzt) fallen die Einträge
// eines bestimmten Klienten dadurch komplett aus dem Feed, noch bevor ein
// clientseitiger uid-Filter sie sehen könnte. Für "zeig mir Klient X" muss
// deshalb gezielt nach diesem einen Klienten gequeried werden.
export async function getClientJournalFeed(clientUid, limitCount = 100) {
  const feed = [];

  try {
    const snap = await getDocs(collection(db, "fitness", clientUid, "sessions"));
    for (const d of snap.docs) {
      const data = d.data();
      feed.push({
        id: d.id,
        userId: clientUid,
        path: d.ref.path,
        date: data.date || "Unbekannt",
        exercises: data.exercises || [],
        effort: data.effort ?? null,
        mood: data.mood || "",
        notes: data.notes || "",
        coachFeedback: data.coachFeedback || "",
        time: data.saved_at?.toDate?.()?.toISOString() || data.date || "",
        type: "workout",
      });
    }
  } catch (e) {
    console.error("Error in getClientJournalFeed sessions:", e);
  }

  try {
    const journalSnap = await getDocs(collection(db, "fitness", clientUid, "journal"));
    for (const d of journalSnap.docs) {
      const data = d.data();
      feed.push({
        id: d.id,
        userId: clientUid,
        path: d.ref.path,
        date: data.date || "Unbekannt",
        notes: data.text || "",
        tags: data.tags || [],
        coachFeedback: data.coachFeedback || "",
        time: data.time || data.date || "",
        type: "journal",
      });
    }
  } catch (e) {
    console.error("Error in getClientJournalFeed journal:", e);
  }

  try {
    const habitSnap = await getDocs(collection(db, "fitness", clientUid, "habitJournals"));
    for (const d of habitSnap.docs) {
      const data = d.data();
      feed.push({
        id: d.id,
        userId: clientUid,
        path: d.ref.path,
        habitId: data.habitId || null,
        date: data.date || "Unbekannt",
        notes: data.text || "",
        coachFeedback: data.coachFeedback || "",
        time: data.date || "",
        type: "habit_journal",
      });
    }
  } catch (e) {
    console.error("Error in getClientJournalFeed habitJournals:", e);
  }

  feed.sort((a, b) => String(b.date || "").localeCompare(String(a.date || "")));
  return feed.slice(0, limitCount);
}

// Coach beobachtet Habit-Fortschritt eines Klienten (read-only): direkte
// Query auf fitness/{clientUid}/routines + .../workouts, bypass getUid()
// (das würde immer den eingeloggten Coach selbst treffen, nicht den
// Klienten). Nur Meta-Felder nötig (targetCount/targetPeriodDays auf der
// Routine, routine_id/finished_at/sessionState auf dem Workout) — Fortschritt
// wird im UI-Layer aus beidem berechnet (lib/habitProgress.js), keine
// exercises-Subcollections nötig.
export async function getClientRoutinesProgress(clientUid) {
  try {
    const [routinesSnap, workoutsSnap] = await Promise.all([
      getDocs(collection(db, "fitness", clientUid, "routines")),
      getDocs(collection(db, "fitness", clientUid, "workouts")),
    ]);
    return {
      routines: routinesSnap.docs.map((d) => ({ id: d.id, ...d.data() })),
      workouts: workoutsSnap.docs.map((d) => ({ id: d.id, ...d.data() })),
    };
  } catch (e) {
    console.error("Error in getClientRoutinesProgress:", e);
    return { routines: [], workouts: [] };
  }
}

export async function getGlobalJournalFeed(limitCount = 50) {
  const feed = [];

  // 1. Workout Sessions
  try {
    const snap = await getDocs(collectionGroup(db, "sessions"));
    for (const d of snap.docs) {
      const data = d.data();
      const userId = d.ref.parent?.parent?.id || "unknown";
      feed.push({
        id: d.id,
        userId,
        path: d.ref.path,
        date: data.date || "Unbekannt",
        exercises: data.exercises || [],
        effort: data.effort ?? null,
        mood: data.mood || "",
        notes: data.notes || "",
        coachFeedback: data.coachFeedback || "",
        time: data.saved_at?.toDate?.()?.toISOString() || data.date || "",
        type: "workout",
      });
    }
  } catch (e) {
    console.error("Error in getGlobalJournalFeed sessions:", e);
  }

  // 2. Daily Journal Entries
  try {
    const journalSnap = await getDocs(collectionGroup(db, "journal"));
    for (const d of journalSnap.docs) {
      const data = d.data();
      const userId = d.ref.parent?.parent?.id || "unknown";
      feed.push({
        id: d.id,
        userId,
        path: d.ref.path,
        date: data.date || "Unbekannt",
        notes: data.text || "",
        tags: data.tags || [],
        coachFeedback: data.coachFeedback || "",
        time: data.time || data.date || "",
        type: "journal",
      });
    }
  } catch (e) {
    console.error("Error in getGlobalJournalFeed journal:", e);
  }

  // 3. Habit Journal Entries
  try {
    const habitSnap = await getDocs(collectionGroup(db, "habitJournals"));
    for (const d of habitSnap.docs) {
      const data = d.data();
      const userId = d.ref.parent?.parent?.id || "unknown";
      feed.push({
        id: d.id,
        userId,
        path: d.ref.path,
        habitId: data.habitId || null,
        date: data.date || "Unbekannt",
        notes: data.text || "",
        coachFeedback: data.coachFeedback || "",
        time: data.date || "",
        type: "habit_journal",
      });
    }
  } catch (e) {
    console.error("Error in getGlobalJournalFeed habitJournals:", e);
  }

  feed.sort((a, b) => String(b.date || "").localeCompare(String(a.date || "")));
  return feed.slice(0, limitCount);
}

export async function getAllUserProfiles() {
  const profiles = {};

  try {
    const snap = await getDocs(collectionGroup(db, "profile"));
    snap.docs.forEach((d) => {
      const uid = d.ref.parent?.parent?.id;
      if (uid) profiles[uid] = { ...profiles[uid], ...d.data() };
    });
  } catch {}

  try {
    const snapSettings = await getDocs(collectionGroup(db, "settings"));
    snapSettings.docs.forEach((d) => {
      const uid = d.ref.parent?.parent?.id;
      if (uid) {
        const data = d.data();
        profiles[uid] = {
          displayName: data.displayName || data.name || profiles[uid]?.displayName || profiles[uid]?.email || uid,
          email: data.email || profiles[uid]?.email || "",
          ...profiles[uid],
          ...data,
        };
      }
    });
  } catch {}

  return profiles;
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
