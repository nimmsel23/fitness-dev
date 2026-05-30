import { 
  getDoc, doc, collection, getDocs, addDoc, serverTimestamp 
} from "firebase/firestore";
import { db, getUid } from "./core";

export async function getExercise(exerciseId) {
  const snap = await getDoc(doc(db, "fitness", "kb", "exercises", exerciseId));
  if (!snap.exists()) return null;
  return snap.data();
}

export async function getAllExercises() {
  const snap = await getDocs(collection(db, "fitness", "kb", "exercises"));
  return snap.docs.map((d) => ({ id: d.id, ...d.data() }));
}

export async function getAnatomy(exerciseId) {
  const snap = await getDoc(doc(db, "fitness", "kb", "anatomy", exerciseId));
  if (!snap.exists()) return null;
  return snap.data();
}

export async function sendToInbox(exerciseData) {
  try {
    const ref = await addDoc(collection(db, "fitness", getUid(), "inbox"), {
      ...exerciseData,
      received_at: serverTimestamp(),
    });
    return { ok: true, id: ref.id };
  } catch (e) {
    console.error("Inbox Firestore push failed:", e);
    return { ok: false };
  }
}
