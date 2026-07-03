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
import { getWeekDates, downloadText, num, todayISO, localToday } from "../shared/utils.js";
import { getUid, pingBridge } from "./core.js";
import { getAllExercises } from "./kb.js";
import { getSession, getSessionHistory } from "./sessions.js";
import { updateAnalyticsDoc } from "./analysis.js";


export async function getHabits(days = 28) {
  const snap = await getDocs(collection(db, "fitness", getUid(), "habits"));
  const habits = snap.docs.map(d => ({ uuid: d.id, ...d.data() }));

  const today = new Date();
  const startDate = new Date();
  startDate.setDate(today.getDate() - (days - 1));

  const q = query(
    collection(db, "fitness", getUid(), "habitRecords"),
    where("date", ">=", startDate.toISOString().slice(0, 10)),
    where("date", "<=", todayISO()),
    orderBy("date", "desc"),
  );
  const recordsSnap = await getDocs(q);
  const allRecords = recordsSnap.docs.map(d => d.data());

  return habits.map(h => {
    const habitRecords = allRecords.filter(r => r.habitId === h.uuid);
    return {
      ...h,
      records: habitRecords,
      hasRecord: (date) => habitRecords.some(r => r.date === date && r.completion === "DONE"),
    };
  });
}

export async function updateHabit(uuid, newName, newIcon) {
  await setDoc(doc(db, "fitness", getUid(), "habits", uuid), {
    name: newName,
    icon: newIcon,
    updated_at: serverTimestamp(),
  }, { merge: true });
}

export async function addHabit(name, icon = "Activity") {
  return await addDoc(collection(db, "fitness", getUid(), "habits"), {
    name,
    created_at: serverTimestamp(),
  });
}

export async function deleteHabit(uuid) {
  await setDoc(doc(db, "fitness", getUid(), "habits", uuid), { deleted: true }, { merge: true });
}

export async function getHabitRecordsForDate(date = todayISO()) {
  const q = query(
    collection(db, "fitness", getUid(), "habitRecords"),
    where("date", "==", date),
    where("completion", "==", "DONE"),
  );
  const snap = await getDocs(q);
  return snap.docs.map(d => d.data().habitId);
}

export async function recordHabit(uuid, date = todayISO()) {
  const ref = doc(db, "fitness", getUid(), "habitRecords", `${uuid}_${date}`);
  await setDoc(ref, {
    habitId: uuid,
    date,
    completion: "DONE",
    recorded_at: serverTimestamp(),
  });
  return { ok: true };
}

export async function unrecordHabit(uuid, date = todayISO()) {
  const ref = doc(db, "fitness", getUid(), "habitRecords", `${uuid}_${date}`);
  await setDoc(ref, {
    habitId: uuid,
    date,
    completion: "MISSED",
    recorded_at: serverTimestamp(),
  }, { merge: true });
  return { ok: true };
}

