/**
 * Firestore Mirror — fire-and-forget dual-write für server.mjs
 *
 * Schreibt Session, Journal und Plan nach Firestore ohne den lokalen
 * Node-Server zu blockieren. Wenn Firebase nicht konfiguriert ist → still skip.
 *
 * Config: ~/.env/firebase-fitness.json (Service Account)
 * Oder: GOOGLE_APPLICATION_CREDENTIALS + FIREBASE_FITNESS_PROJECT env vars
 */

import { createRequire } from "node:module";
import { existsSync } from "node:fs";
import { homedir } from "node:os";
import { join } from "node:path";

const CRED_PATH = join(homedir(), ".env", "firebase-fitness.json");
const PROJECT   = process.env.FIREBASE_FITNESS_PROJECT || "fitness-aos";

let _db = null;
let _unavailable = false;

async function getDb() {
  if (_db) return _db;
  if (_unavailable) return null;

  const credFile = process.env.GOOGLE_APPLICATION_CREDENTIALS || CRED_PATH;
  if (!existsSync(credFile)) {
    _unavailable = true;
    return null;
  }

  try {
    const require = createRequire(import.meta.url);
    const admin = require("firebase-admin");
    if (!admin.apps.length) {
      admin.initializeApp({
        credential: admin.credential.cert(credFile),
        projectId: PROJECT,
      });
    }
    _db = admin.firestore();
    console.log(`[firestore-mirror] aktiv → ${PROJECT}`);
    return _db;
  } catch (e) {
    console.warn(`[firestore-mirror] nicht verfügbar: ${e.message}`);
    _unavailable = true;
    return null;
  }
}

function fire(fn) {
  fn().catch((e) => console.warn(`[firestore-mirror] write fehler: ${e.message}`));
}

export async function mirrorSession(date, session, uid = "default") {
  const db = await getDb();
  if (!db) return;
  const targetId = session.session_id ? `${date}__${session.session_id}` : date;
  fire(() =>
    db.collection("fitness").doc(uid).collection("sessions").doc(targetId).set({
      ...session,
      date,
      saved_at: new Date().toISOString(),
    })
  );
}

export async function mirrorJournal(date, entry, uid = "default") {
  const db = await getDb();
  if (!db) return;
  fire(() =>
    db.collection("fitness").doc(uid).collection("journal").add({
      ...entry,
      date,
      time: new Date().toISOString(),
    })
  );
}

export async function getHabitJournals(uid = "default") {
  const db = await getDb();
  if (!db) return [];
  const col = db.collection("fitness").doc(uid).collection("habit_journals");
  const snap = await col.get();
  return snap.docs.map(d => {
    const id = d.id; // habitId__date
    const [habitId, date] = id.split("__");
    const data = d.data();
    return { habitId, date, ...data };
  });
}

// ── Read Layer (Firestore → direkt, kein lokaler Sync nötig) ─────────────────

export async function readJournal(uid, date) {
  const db = await getDb();
  if (!db) return null;
  try {
    const snap = await db.collection("fitness").doc(uid).collection("journal")
      .where("date", "==", date).limit(10).get();
    if (snap.empty) return null;
    const parts = snap.docs
      .sort((a, b) => (a.data().time || "").localeCompare(b.data().time || ""))
      .map(d => {
        const { text, time } = d.data();
        return `<!-- fsid:${d.id} -->\n**${(time || "").slice(0,16)}** ${text || ""}`;
      });
    return parts.join("\n\n");
  } catch { return null; }
}

export async function listJournals(uid, limitCount = 50) {
  const db = await getDb();
  if (!db) return null;
  try {
    const [journalSnap, habitSnap] = await Promise.all([
      db.collection("fitness").doc(uid).collection("journal")
        .orderBy("date", "desc").limit(limitCount).get(),
      db.collection("fitness").doc(uid).collection("habitJournals")
        .orderBy("date", "desc").limit(limitCount).get(),
    ]);
    const seen = new Map();
    for (const d of [...journalSnap.docs, ...habitSnap.docs]) {
      const date = d.data().date;
      if (date && !seen.has(date)) seen.set(date, d.data().time || date);
    }
    return [...seen.entries()]
      .sort((a, b) => b[0].localeCompare(a[0])).slice(0, limitCount)
      .map(([date, mtime]) => ({ date, mtime }));
  } catch { return null; }
}

export async function readJournalFull(uid, date) {
  const db = await getDb();
  if (!db) return null;
  try {
    const [jSnap, hjSnap, hrSnap] = await Promise.all([
      db.collection("fitness").doc(uid).collection("journal")
        .where("date", "==", date).get(),
      db.collection("fitness").doc(uid).collection("habitJournals")
        .where("date", "==", date).get(),
      db.collection("fitness").doc(uid).collection("habitRecords")
        .where("date", "==", date).get(),
    ]);
    // Habit-Namen laden
    const habitIds = new Set([
      ...hjSnap.docs.map(d => d.data().habitId),
      ...hrSnap.docs.map(d => d.data().habitId),
    ]);
    const habitNames = {};
    await Promise.all([...habitIds].map(async hid => {
      const h = await db.collection("fitness").doc(uid).collection("habits").doc(hid).get();
      if (h.exists) habitNames[hid] = h.data().name || hid;
    }));

    const parts = [];
    for (const d of jSnap.docs) {
      const { text, time } = d.data();
      if (text) parts.push(`<!-- fsid:${d.id} -->\n**${(time||"").slice(0,16)}** ${text}`);
    }
    for (const d of hjSnap.docs) {
      const { text, habitId, coachFeedback } = d.data();
      const name = habitNames[habitId] || habitId;
      let block = `<!-- fshid:${d.id} -->\n**Habit: ${name}**\n${text || ""}`;
      if (coachFeedback) block += `\n> **Coach Feedback:** ${coachFeedback}`;
      parts.push(block);
    }
    for (const d of hrSnap.docs) {
      const { habitId, completion, recorded_at } = d.data();
      const name = habitNames[habitId] || habitId;
      const time = recorded_at ? recorded_at.toDate().toISOString().slice(0,16) : "";
      parts.push(`<!-- fshr:${d.id} -->\n**${name}** ${completion||"DONE"} _${time}_`);
    }
    return parts.length ? parts.join("\n\n") : null;
  } catch { return null; }
}

export async function readSessions(uid, limitCount = 50) {
  const db = await getDb();
  if (!db) return null;
  try {
    const snap = await db.collection("fitness").doc(uid).collection("sessions")
      .orderBy("date", "desc").limit(limitCount).get();
    return snap.docs.map(d => ({ id: d.id, ...d.data() }));
  } catch { return null; }
}

export async function readSession(uid, date) {
  const db = await getDb();
  if (!db) return null;
  try {
    const snap = await db.collection("fitness").doc(uid).collection("sessions")
      .where("date", "==", date).limit(5).get();
    if (snap.empty) return null;
    return snap.docs.map(d => ({ id: d.id, ...d.data() }));
  } catch { return null; }
}

export async function readHabits(uid) {
  const db = await getDb();
  if (!db) return null;
  try {
    const [habitsSnap, recordsSnap] = await Promise.all([
      db.collection("fitness").doc(uid).collection("habits").get(),
      db.collection("fitness").doc(uid).collection("habitRecords")
        .where("date", "==", new Date().toISOString().slice(0,10)).get(),
    ]);
    const doneToday = new Set(recordsSnap.docs.map(d => d.data().habitId));
    return habitsSnap.docs
      .map(d => ({ uuid: d.id, ...d.data() }))
      .filter(h => !h.deleted)
      .map(h => ({
        ...h,
        records: doneToday.has(h.uuid)
          ? [{ date: new Date().toISOString().slice(0,10), completion: "DONE" }]
          : [],
      }));
  } catch { return null; }
}

export async function mirrorPlan(plan, uid = "default") {
  const db = await getDb();
  if (!db) return;
  fire(() =>
    db.collection("fitness").doc(uid).collection("plan").doc("active").set({
      ...plan,
      updated_at: new Date().toISOString(),
    })
  );
}

// New: Mirror habit journal entries (memoirs)
export async function mirrorHabitJournal(habitId, date, entry, uid = "default") {
  const db = await getDb();
  if (!db) return;
  fire(() =>
    db.collection("fitness")
      .doc(uid)
      .collection("habit_journals")
      .doc(`${habitId}__${date}`)
      .set({
        habitId,
        date,
        ...entry,
        saved_at: new Date().toISOString(),
      })
  );
}
