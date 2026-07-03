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


export async function getSettings() {
  const snap = await getDoc(doc(db, "fitness", getUid(), "settings", "general"));
  if (!snap.exists()) return { theme: "honey", themeMode: "manual" };
  return snap.data();
}

export async function saveSettings(settings) {
  await setDoc(doc(db, "fitness", getUid(), "settings", "general"), {
    ...settings,
    updated_at: serverTimestamp(),
  });
  return { ok: true };
}

export async function getLayout() {
  const snap = await getDoc(doc(db, "fitness", getUid(), "settings", "layout"));
  if (!snap.exists()) return null;
  return snap.data()?.layout;
}

export async function saveLayout(layout) {
  await setDoc(doc(db, "fitness", getUid(), "settings", "layout"), {
    layout,
    updated_at: serverTimestamp(),
  });
  return { ok: true };
}

export async function getBodyEntry(date) {
  const snap = await getDoc(doc(db, "fitness", getUid(), "body", date));
  if (!snap.exists()) return null;
  return snap.data();
}

export async function saveBodyEntry(date, data) {
  await setDoc(doc(db, "fitness", getUid(), "body", date), {
    ...data,
    date,
    saved_at: serverTimestamp(),
  });
  return { ok: true };
}

export async function getBodyEntries(days = 30) {
  const q = query(
    collection(db, "fitness", getUid(), "body"),
    orderBy("date", "desc"),
    limit(days),
  );
  const snap = await getDocs(q);
  return snap.docs.map(d => d.data());
}

