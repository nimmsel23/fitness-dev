/**
 * Firestore Data Layer — Fitness PWA (Multi-User)
 *
 * Counterpart to src/db.js (Node-API). Selected at build time via
 * `vite build --mode firebase` through the @db alias in vite.config.js.
 *
 * Public API parity with src/db.js (Node barrel) — views import either
 * via "@db" or relative "../../db.js" and must get the same names back.
 */

import {
  collection, doc, addDoc, setDoc, getDoc, getDocs,
  query, where, orderBy, limit, serverTimestamp,
} from "firebase/firestore";
import {
  onAuthStateChanged,
  signInWithPopup, signInWithEmailAndPassword, createUserWithEmailAndPassword,
  signOut as fbSignOut, updateProfile,
} from "firebase/auth";

import { db, auth, googleProvider } from "./firebase.js";
import { getWeekDates, calculateExVolume, downloadText, num } from "./lib/db/utils.js";

export { getWeekDates, calculateExVolume, downloadText, num };

// ── Mode flag ────────────────────────────────────────────────────────────────
export function isLocalMode() { return false; }

// ── Date helpers ─────────────────────────────────────────────────────────────
export function localToday() {
  const d = new Date();
  return `${d.getFullYear()}-${String(d.getMonth()+1).padStart(2,'0')}-${String(d.getDate()).padStart(2,'0')}`;
}
const todayISO = localToday;

// ── Compat: api shim ─────────────────────────────────────────────────────────
// Views that bypass @db and hit api directly (Session/Learn/Settings/Inbox)
// are out of the smart-hybrid contract. We stub here so the Firebase bundle
// still loads; calls are no-ops with a console warning to help track them down.
const noopApi = (verb) => async () => {
  console.warn(`[db.firestore] api.${verb}() called — view bypasses @db contract`);
  return null;
};
export const api = { get: noopApi("get"), post: noopApi("post"), delete: noopApi("delete") };

// ── Activity → Muscle mapping (used by weekly report) ────────────────────────
export const ACTIVITY_MUSCLE_MAPPING = {
  hiking:   { muscles: ["legs", "core", "glutes"],        impact: 1.0 },
  running:  { muscles: ["quads", "hamstrings", "calves"], impact: 1.0 },
  cycling:  { muscles: ["quads", "calves"],               impact: 0.8 },
  swimming: { muscles: ["back", "shoulders", "core"],     impact: 0.7 },
};

// ── Auth ─────────────────────────────────────────────────────────────────────
let currentUid = null;

export function watchAuth(callback) {
  return onAuthStateChanged(auth, (user) => {
    currentUid = user ? user.uid : null;
    callback?.(user);
  });
}

export async function signIn()                          { await signInWithPopup(auth, googleProvider); }
export async function signInEmail(email, password)      { await signInWithEmailAndPassword(auth, email, password); }
export async function signUpEmail(email, password, name) {
  const cred = await createUserWithEmailAndPassword(auth, email, password);
  if (name) await updateProfile(cred.user, { displayName: name });
}
export async function signOut() { await fbSignOut(auth); }

export function getUid() {
  if (!currentUid) throw new Error("Nicht eingeloggt");
  return currentUid;
}

function pingBridge() {
  fetch("https://alpha-aos.ts.net/api/fitness/notify", { method: "POST" }).catch(() => {});
}

// ── Sessions ─────────────────────────────────────────────────────────────────

export async function getSession(date = todayISO()) {
  const snap = await getDoc(doc(db, "fitness", getUid(), "sessions", date));
  if (!snap.exists()) return { date, block: "", exercises: [], effort: null, mood: "", notes: "" };
  return snap.data();
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
    limit(n),
  );
  const snap = await getDocs(q);
  return snap.docs.map(d => d.data());
}

export async function getLatestSession() {
  const sessions = await getRecentSessions(1);
  return sessions.length > 0 ? sessions[0] : null;
}

export async function getSessionHistory(n = 60) { return getRecentSessions(n); }

// ── Plan ─────────────────────────────────────────────────────────────────────

export async function getPlan() {
  const snap = await getDoc(doc(db, "fitness", getUid(), "plan"));
  return snap.exists() ? snap.data() : null;
}

export async function savePlan(plan) {
  await setDoc(doc(db, "fitness", getUid(), "plan"), {
    ...plan,
    updated_at: serverTimestamp(),
  });
  return { ok: true };
}

// ── Journal ──────────────────────────────────────────────────────────────────

export async function getJournal(date = todayISO()) {
  try {
    const q = query(
      collection(db, "fitness", getUid(), "journal"),
      where("date", "==", date),
      orderBy("time", "desc"),
    );
    const snap = await getDocs(q);
    return snap.docs.map(d => ({ id: d.id, ...d.data() }));
  } catch {
    const q = query(collection(db, "fitness", getUid(), "journal"), where("date", "==", date));
    const snap = await getDocs(q);
    return snap.docs
      .map(d => ({ id: d.id, ...d.data() }))
      .sort((a, b) => (b.time || "").localeCompare(a.time || ""));
  }
}

export async function saveJournal(date = todayISO(), text, tags = []) {
  const ref = await addDoc(collection(db, "fitness", getUid(), "journal"), {
    date,
    text: String(text || "").trim(),
    tags,
    time: new Date().toISOString(),
    created_at: serverTimestamp(),
  });
  return { id: ref.id, date, text: String(text || "").trim() };
}

export async function updateJournal(id, text) {
  await setDoc(
    doc(db, "fitness", getUid(), "journal", id),
    { text: String(text || "").trim(), updated_at: serverTimestamp() },
    { merge: true },
  );
  return { ok: true };
}

// ── Body / Weight ────────────────────────────────────────────────────────────

export async function getBodyEntry(date = todayISO()) {
  const snap = await getDoc(doc(db, "fitness", getUid(), "body", date));
  return snap.exists() ? snap.data() : null;
}

export async function saveBodyEntry(date = todayISO(), data) {
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

// ── Settings / Layout ────────────────────────────────────────────────────────

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
  return snap.exists() ? snap.data()?.layout : null;
}

export async function saveLayout(layout) {
  await setDoc(doc(db, "fitness", getUid(), "settings", "layout"), {
    layout,
    updated_at: serverTimestamp(),
  });
  return { ok: true };
}

// ── Habits ───────────────────────────────────────────────────────────────────

export async function getHabits(days = 28) {
  const snap = await getDocs(collection(db, "fitness", getUid(), "habits"));
  const habits = snap.docs.map(d => ({ uuid: d.id, ...d.data() }));

  const start = new Date();
  start.setDate(start.getDate() - (days - 1));
  const startStr = start.toISOString().slice(0, 10);

  const q = query(
    collection(db, "fitness", getUid(), "habitRecords"),
    where("date", ">=", startStr),
    where("date", "<=", todayISO()),
    orderBy("date", "desc"),
  );
  const recordsSnap = await getDocs(q);
  const allRecords = recordsSnap.docs.map(d => d.data());

  return habits
    .filter(h => !h.deleted)
    .map(h => {
      const records = allRecords.filter(r => r.habitId === h.uuid);
      return {
        ...h,
        records,
        hasRecord: (date) => records.some(r => r.date === date && r.completion === "DONE"),
      };
    });
}

export async function updateHabit(uuid, newName, newIcon) {
  await setDoc(
    doc(db, "fitness", getUid(), "habits", uuid),
    { name: newName, icon: newIcon, updated_at: serverTimestamp() },
    { merge: true },
  );
  return { ok: true };
}

export async function addHabit(name, icon = "Activity") {
  return addDoc(collection(db, "fitness", getUid(), "habits"), {
    name: String(name).trim(),
    icon,
    created_at: serverTimestamp(),
  });
}

export async function deleteHabit(uuid) {
  await setDoc(
    doc(db, "fitness", getUid(), "habits", uuid),
    { deleted: true },
    { merge: true },
  );
  return { ok: true };
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
  await setDoc(doc(db, "fitness", getUid(), "habitRecords", `${uuid}_${date}`), {
    habitId: uuid,
    date,
    completion: "DONE",
    recorded_at: serverTimestamp(),
  });
  return { ok: true };
}

export async function unrecordHabit(uuid, date = todayISO()) {
  await setDoc(
    doc(db, "fitness", getUid(), "habitRecords", `${uuid}_${date}`),
    { habitId: uuid, date, completion: "MISSED", recorded_at: serverTimestamp() },
    { merge: true },
  );
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
    limit(20),
  );
  const snap = await getDocs(q);
  return snap.docs.map(d => d.data());
}

export async function getAllHabitJournalsForDate(date) {
  const q = query(
    collection(db, "fitness", getUid(), "habitJournals"),
    where("date", "==", date),
  );
  const snap = await getDocs(q);
  return snap.docs.map(d => ({ id: d.id, ...d.data(), type: "habit" }));
}

export async function saveHabitJournal(habitId, date, text) {
  await setDoc(
    doc(db, "fitness", getUid(), "habitJournals", `${habitId}_${date}`),
    {
      habitId,
      date,
      text: String(text || "").trim(),
      updated_at: serverTimestamp(),
    },
    { merge: true },
  );
  return { ok: true };
}

// ── Knowledge Base ───────────────────────────────────────────────────────────

export async function getExercise(exerciseId) {
  if (!exerciseId) return null;
  const snap = await getDoc(doc(db, "fitness", "kb", "exercises", String(exerciseId)));
  return snap.exists() ? { ...snap.data(), exercise_id: snap.id } : null;
}

export async function getAllExercises() {
  const snap = await getDocs(collection(db, "fitness", "kb", "exercises"));
  return snap.docs.map(d => ({ ...d.data(), exercise_id: d.data().exercise_id || d.id }));
}

export async function getAnatomy(exerciseId) {
  if (!exerciseId) return null;
  const snap = await getDoc(doc(db, "fitness", "kb", "anatomy", String(exerciseId)));
  return snap.exists() ? snap.data() : null;
}

export async function getMuscle(muscleId) {
  if (!muscleId) return null;
  const snap = await getDoc(doc(db, "fitness", "kb", "muscles", String(muscleId)));
  return snap.exists() ? snap.data() : null;
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

// ── Coverage / Weekly Report ─────────────────────────────────────────────────

const MUSCLE_TAG_TO_GROUP = {
  chest: "chest", pecs: "chest", pectoralis: "chest",
  back: "back", lats: "back", traps: "back", trapezius: "back", rhomboids: "back",
  shoulders: "shoulders", delts: "shoulders", deltoid: "shoulders",
  biceps: "arms", triceps: "arms", forearms: "arms",
  abs: "core", obliques: "core", core: "core", abdominis: "core",
  glutes: "glutes", gluteus: "glutes",
  quads: "quads", quadriceps: "quads",
  hamstrings: "hamstrings", "biceps femoris": "hamstrings",
  calves: "calves", gastrocnemius: "calves",
};

const MUSCLE_GROUPS = {
  chest:      ["pecs", "chest", "pectoralis", "brust"],
  back:       ["lats", "traps", "lower back", "back", "latissimus", "trapezius", "rhomboids", "rücken", "pull-up", "klimmzug", "rudern", "row"],
  shoulders:  ["shoulders", "delts", "deltoid", "schulter", "schultern", "overhead", "press"],
  arms:       ["biceps", "triceps", "forearms", "brachii", "bizeps", "trizeps", "arm", "arme", "curl", "extension"],
  core:       ["abs", "obliques", "core", "abdominis", "bauch"],
  glutes:     ["glutes", "gluteus", "po", "gesäß", "hip thrust"],
  quads:      ["quads", "quadriceps", "oberschenkel", "squat", "kniebeuge"],
  hamstrings: ["hamstrings", "biceps femoris", "beinbeuger", "leg curl", "kreuzheben", "good mornings", "rumänisches kreuzheben"],
  calves:     ["calves", "gastrocnemius", "waden", "calf", "wadenheben", "stehendes wadenheben"],
  legs:       ["legs", "squat", "deadlift", "lunge", "beine", "bein", "leg press", "kniebeuge"],
};

function muscleToGroupIds(muscle, exerciseName = "") {
  const m = String(muscle || "").toLowerCase().trim();
  const name = String(exerciseName || "").toLowerCase();
  const matches = new Set();
  if (MUSCLE_TAG_TO_GROUP[m]) matches.add(MUSCLE_TAG_TO_GROUP[m]);
  for (const [group, list] of Object.entries(MUSCLE_GROUPS)) {
    if (list.some(x => m.includes(x) || (name && name.includes(x)))) matches.add(group);
  }
  return [...matches];
}

export async function getMuscleCoverage(days = 7) {
  const today = new Date();
  const dates = Array.from({ length: days }, (_, i) => {
    const d = new Date(today);
    d.setDate(today.getDate() - i);
    return d.toISOString().slice(0, 10);
  });

  const hits = {};
  for (const date of dates) {
    const session = await getSession(date);
    for (const ex of (session?.exercises || [])) {
      if (!ex.done) continue;
      const primary = ex.primaryMuscles || [];
      const secondary = ex.secondaryMuscles || [];
      const exName = ex.name || ex.exercise_id || "";
      [...primary, ...secondary].forEach(m => {
        muscleToGroupIds(m, exName).forEach(gid => hits[gid] = (hits[gid] || 0) + 1);
      });
    }
  }
  return hits;
}

function getWeekBounds(selector = "current") {
  if (selector === "current") {
    const today = new Date();
    return Array.from({ length: 7 }, (_, i) => {
      const x = new Date(today);
      x.setDate(today.getDate() - (6 - i));
      return x.toISOString().slice(0, 10);
    });
  }
  const [year, week] = selector.split("-W");
  const d = new Date(Number(year), 0, 1 + (Number(week) - 1) * 7);
  const off = (d.getDay() + 6) % 7;
  const start = new Date(d);
  start.setDate(d.getDate() - off);
  return Array.from({ length: 7 }, (_, i) => {
    const x = new Date(start);
    x.setDate(start.getDate() + i);
    return x.toISOString().slice(0, 10);
  });
}

export async function getWeeklyReport(selector = "current") {
  const dates = getWeekBounds(selector);
  const history = await getSessionHistory(120);

  const historyWithMuscles = history.map(s => {
    const groups = new Set();
    for (const ex of (s.exercises || [])) {
      if (!ex.done) continue;
      const primary = ex.primaryMuscles || [];
      const secondary = ex.secondaryMuscles || [];
      const exName = ex.name || ex.exercise_id || "";
      let mapped = false;
      [...primary, ...secondary].forEach(m => {
        muscleToGroupIds(m, exName).forEach(gid => { groups.add(gid); mapped = true; });
      });
      if (!mapped && exName) muscleToGroupIds("", exName).forEach(gid => groups.add(gid));
    }
    if (s.activity && ACTIVITY_MUSCLE_MAPPING[s.activity.type]) {
      ACTIVITY_MUSCLE_MAPPING[s.activity.type].muscles.forEach(gid => groups.add(gid));
    }
    return { date: s.date, groups: [...groups] };
  }).sort((a, b) => (b.date || "").localeCompare(a.date || ""));

  const sessions = [];
  let totalVolume = 0;
  let entriesCount = 0;
  const muscleScores = {};
  const bodyRegionScores = {};
  const topExMap = {};

  for (const date of dates) {
    const sess = await getSession(date);
    if (!sess) continue;
    let sessVolume = 0;
    let hasDone = false;
    const sessGroupsCount = {};

    for (const ex of (sess.exercises || [])) {
      if (!ex.done) continue;
      hasDone = true;
      entriesCount++;
      const primary = ex.primaryMuscles || [];
      const secondary = ex.secondaryMuscles || [];
      const exName = ex.name || ex.exercise_id || "";
      const vol = calculateExVolume(ex);
      sessVolume += vol;
      if (exName) topExMap[exName] = (topExMap[exName] || 0) + 1;
      let mapped = false;
      for (const m of primary) {
        muscleToGroupIds(m, exName).forEach(gid => {
          sessGroupsCount[gid] = (sessGroupsCount[gid] || 0) + 1;
          muscleScores[m] = (muscleScores[m] || 0) + 1;
          bodyRegionScores[gid] = (bodyRegionScores[gid] || 0) + 1;
          mapped = true;
        });
      }
      for (const m of secondary) {
        muscleToGroupIds(m, exName).forEach(gid => {
          bodyRegionScores[gid] = (bodyRegionScores[gid] || 0) + 1;
          mapped = true;
        });
      }
      if (!mapped && exName) {
        muscleToGroupIds("", exName).forEach(gid => {
          sessGroupsCount[gid] = (sessGroupsCount[gid] || 0) + 1;
          bodyRegionScores[gid] = (bodyRegionScores[gid] || 0) + 1;
        });
      }
    }

    if (hasDone || sess.block || sess.activity) {
      const sortedGroups = Object.entries(sessGroupsCount).sort((a, b) => b[1] - a[1]);
      let autoSplit = sess.block || sess.trainingsart || "Training";
      if (!sess.block && sortedGroups.length) {
        autoSplit = sortedGroups[0][0][0].toUpperCase() + sortedGroups[0][0].slice(1);
      }
      if (sess.activity && ACTIVITY_MUSCLE_MAPPING[sess.activity.type]) {
        ACTIVITY_MUSCLE_MAPPING[sess.activity.type].muscles.forEach(gid => {
          sessGroupsCount[gid] = (sessGroupsCount[gid] || 0) + 1;
          bodyRegionScores[gid] = (bodyRegionScores[gid] || 0) + 1;
        });
      }
      const muscleRecovery = {};
      for (const gid of Object.keys(sessGroupsCount)) {
        const last = historyWithMuscles
          .filter(h => h.date < date && h.groups.includes(gid))
          .sort((a, b) => b.date.localeCompare(a.date))[0];
        if (last) {
          const diffH = Math.round((new Date(date) - new Date(last.date)) / 3_600_000);
          muscleRecovery[gid] = diffH;
        }
      }
      totalVolume += sessVolume;
      sessions.push({
        ...sess,
        block: autoSplit,
        total_volume: sessVolume,
        exercise_count: sess.exercises?.length || 0,
        muscle_recovery: muscleRecovery,
      });
    }
  }

  const allGroups = ["chest","back","shoulders","arms","core","glutes","quads","hamstrings","calves","legs"];
  const gaps = allGroups.filter(g => (bodyRegionScores[g] || 0) < 1);

  return {
    ok: true,
    week: selector,
    session_count: sessions.length,
    entries_count: entriesCount,
    total_volume: totalVolume,
    sessions,
    muscle_scores: muscleScores,
    body_region_scores: bodyRegionScores,
    missing_regions: gaps,
    top_exercises: Object.entries(topExMap).sort((a, b) => b[1] - a[1]).map(([name, count]) => ({ display_name: name, count })),
    recommendations: gaps.length ? [`Fokus auf: ${gaps.join(", ")}`] : ["Woche perfekt abgedeckt!"],
  };
}

// ── Progress Trend ───────────────────────────────────────────────────────────

export async function getProgressTrend(exerciseName, lastN = 4) {
  const history = await getSessionHistory(lastN * 7);
  const sessions = history
    .filter(s => s.exercises?.some(ex => ex.name === exerciseName))
    .sort((a, b) => b.date.localeCompare(a.date));
  if (sessions.length < 2) return { status: "neutral", message: "Nicht genug Daten" };

  const volumes = sessions.map(s => {
    const ex = s.exercises.find(e => e.name === exerciseName);
    if (!ex || ex.isHIT) return null;
    return calculateExVolume(ex) || null;
  }).filter(v => v != null);

  if (volumes.length < 2) return { status: "neutral", message: "Zu wenig Volumen-Daten" };

  const current = volumes[0];
  const previous = volumes.slice(1, lastN);
  const avg = previous.reduce((a, b) => a + b, 0) / previous.length;
  const pct = ((current - avg) / avg) * 100;
  if (pct >  5) return { status: "up",   change: pct.toFixed(1) };
  if (pct < -5) return { status: "down", change: pct.toFixed(1) };
  return        { status: "neutral",     change: pct.toFixed(1) };
}

// ── Quick parser (used by Session input) ─────────────────────────────────────

export function parseQuick(raw) {
  if (!raw?.trim()) return null;
  const name = raw.replace(/[\d@x\s].*/i, "").trim() || raw.trim();
  const setsMatch = raw.match(/(\d+)\s*[xX×]\s*(\d+)/);
  const weightMatch = raw.match(/@(\d+(?:\.\d+)?)/);
  const rpeMatch = raw.match(/rpe\s*(\d+(?:\.\d+)?)/i);
  return {
    name,
    sets:    setsMatch    ? setsMatch[1]    : "3",
    reps:    setsMatch    ? setsMatch[2]    : "10",
    weight:  weightMatch  ? weightMatch[1]  : "",
    note:    rpeMatch     ? `RPE ${rpeMatch[1]}` : "",
    primaryMuscles: [], secondaryMuscles: [],
    done: true,
  };
}

// ── CSV Export ───────────────────────────────────────────────────────────────

export async function exportCsv(days = 14) {
  const today = new Date();
  const dates = Array.from({ length: days }, (_, i) => {
    const d = new Date(today);
    d.setDate(today.getDate() - i);
    return d.toISOString().slice(0, 10);
  });
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
