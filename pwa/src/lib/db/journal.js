import { 
  collection, query, where, orderBy, getDocs, addDoc, doc, setDoc, serverTimestamp, getDoc 
} from "firebase/firestore";
import { db, getUid } from "./core";
import { todayISO } from "../utils";

export async function getJournal(date = todayISO()) {
  try {
    const q = query(
      collection(db, "fitness", getUid(), "journal"),
      where("date", "==", date),
      orderBy("time", "desc")
    );
    const snap = await getDocs(q);
    return snap.docs.map((d) => ({ id: d.id, ...d.data() }));
  } catch {
    const q = query(collection(db, "fitness", getUid(), "journal"), where("date", "==", date));
    const snap = await getDocs(q);
    return snap.docs
      .map((d) => ({ id: d.id, ...d.data() }))
      .sort((a, b) => (b.time || "").localeCompare(a.time || ""));
  }
}

export async function saveJournal(date = todayISO(), text, tags = []) {
  const ref = await addDoc(collection(db, "fitness", getUid(), "journal"), {
    date,
    text: text.trim(),
    tags,
    time: new Date().toISOString(),
    created_at: serverTimestamp(),
  });
  return { id: ref.id };
}

export async function updateJournal(id, text) {
  const ref = doc(db, "fitness", getUid(), "journal", id);
  await setDoc(ref, {
    text: text.trim(),
    updated_at: serverTimestamp(),
  }, { merge: true });
  return { ok: true };
}

export async function getHabitJournal(habitId, date) {
  const snap = await getDoc(doc(db, "fitness", getUid(), "habitJournals", `${habitId}_${date}`));
  return snap.exists() ? snap.data() : null;
}

export async function getHabitJournalHistory(habitId) {
  const q = query(
    collection(db, "fitness", getUid(), "habitJournals"),
    where("habitId", "==", habitId),
    orderBy("date", "desc"),
    limit(20)
  );
  const snap = await getDocs(q);
  return snap.docs.map(d => d.data());
}

export async function getAllHabitJournalsForDate(date) {
  const q = query(
    collection(db, "fitness", getUid(), "habitJournals"),
    where("date", "==", date)
  );
  const snap = await getDocs(q);
  return snap.docs.map(d => ({ id: d.id, ...d.data(), type: 'habit' }));
}

export async function saveHabitJournal(habitId, date, text) {
  const ref = doc(db, "fitness", getUid(), "habitJournals", `${habitId}_${date}`);
  await setDoc(ref, {
    habitId,
    date,
    text: text.trim(),
    updated_at: serverTimestamp(),
  }, { merge: true });
  return { ok: true };
}
