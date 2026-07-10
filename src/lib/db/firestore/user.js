/**
 * firestore/user.js — User settings, layout, body entries, and profile for Firestore.
 */

import {
  collection, doc, setDoc, getDoc, getDocs,
  query, orderBy, limit, serverTimestamp,
} from "firebase/firestore";

import { db } from "../../../firebase.js";
import { getUid } from "./core.js";

// ── Settings ──────────────────────────────────────────────────────────────────

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

// ── Layout ────────────────────────────────────────────────────────────────────

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

// ── Body entries ──────────────────────────────────────────────────────────────

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
  return snap.docs.map((d) => d.data());
}

// ── User profile ──────────────────────────────────────────────────────────────

export async function getUserProfile(uid) {
  if (!uid) return null;
  try {
    const snap = await getDoc(doc(db, "fitness", uid, "profile", "metadata"));
    return snap.exists() ? snap.data() : null;
  } catch (error) {
    console.error("Fehler beim Laden des Profils:", error);
    return null;
  }
}

export async function updateUserProfile(uid, data) {
  if (!uid) return false;
  try {
    await setDoc(doc(db, "fitness", uid, "profile", "metadata"), {
      ...data,
      updated_at: serverTimestamp(),
    }, { merge: true });
    return true;
  } catch (error) {
    console.error("Fehler beim Speichern des Profils:", error);
    return false;
  }
}
