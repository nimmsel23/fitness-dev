import { 
  doc, getDoc, setDoc, query, collection, orderBy, limit, getDocs, serverTimestamp 
} from "firebase/firestore";
import { db, getUid, pingBridge } from "./core";
import { todayISO } from "../utils";

export async function getSession(date = todayISO()) {
  const snap = await getDoc(doc(db, "fitness", getUid(), "sessions", date));
  if (!snap.exists()) return { date, block: "", exercises: [], effort: null, mood: "", notes: "" };
  const data = snap.data() || {};
  return {
    date,
    block: "",
    exercises: [],
    effort: null,
    mood: "",
    notes: "",
    ...data,
    exercises: Array.isArray(data.exercises) ? data.exercises : [],
  };
}

export async function saveSession(date = todayISO(), sessionData) {
  await setDoc(doc(db, "fitness", getUid(), "sessions", date), {
    ...sessionData,
    date,
    saved_at: serverTimestamp(),
  });
  pingBridge();
  return { ok: true };
}

export async function getRecentSessions(n = 10) {
  const q = query(
    collection(db, "fitness", getUid(), "sessions"),
    orderBy("date", "desc"),
    limit(n)
  );
  const snap = await getDocs(q);
  return snap.docs
    .map((d) => {
      const data = d.data() || {};
      return {
        id: d.id,
        ...data,
        exercises: Array.isArray(data.exercises) ? data.exercises : [],
      };
    })
    .filter(Boolean);
}

export async function getLatestSession() {
  const sessions = await getRecentSessions(1);
  return sessions.length > 0 ? sessions[0] : null;
}

export async function getSessionHistory(n = 60) {
  return getRecentSessions(n);
}

export async function getPlan() {
  const snap = await getDoc(doc(db, "fitness", getUid(), "plan"));
  if (!snap.exists()) return null;
  return snap.data();
}

export async function savePlan(plan) {
  await setDoc(doc(db, "fitness", getUid(), "plan"), {
    ...plan,
    updated_at: serverTimestamp(),
  });
  return { ok: true };
}
