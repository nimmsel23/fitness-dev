/**
 * Firestore Data Layer — Fitness PWA (Multi-User)
 */

import {
  doc, collection,
  getDoc, getDocs, setDoc, addDoc,
  query, where, orderBy, limit,
  serverTimestamp,
} from "firebase/firestore";
import { 
  signInWithPopup, 
  onAuthStateChanged,
  signOut as fbSignOut 
} from "firebase/auth";
import { db, auth, googleProvider } from "./firebase.js";

let currentUid = null;

// ── Auth ──────────────────────────────────────────────────────────────────────

export function watchAuth(callback) {
  return onAuthStateChanged(auth, (user) => {
    currentUid = user ? user.uid : null;
    callback(user);
  });
}

export async function signIn() {
  await signInWithPopup(auth, googleProvider);
}

export async function signOut() {
  await fbSignOut(auth);
}

// ── Helpers ───────────────────────────────────────────────────────────────────

function getUid() {
  if (!currentUid) throw new Error("Nicht eingeloggt");
  return currentUid;
}

const BRIDGE_NOTIFY = "https://alpha-aos.ts.net/api/fitness/notify";
function pingBridge() {
  fetch(BRIDGE_NOTIFY, { method: "POST" }).catch(() => {});
}

export function todayISO() {
  const d = new Date();
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
}

export function localToday() { return todayISO(); }

// ── Sessions ──────────────────────────────────────────────────────────────────

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
    limit(n)
  );
  const snap = await getDocs(q);
  return snap.docs.map((d) => d.data());
}

export async function getLatestSession() {
  const sessions = await getRecentSessions(1);
  return sessions.length > 0 ? sessions[0] : null;
}

export async function getSessionHistory(n = 60) {
  return getRecentSessions(n);
}

// ── Plan ──────────────────────────────────────────────────────────────────────

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

// ── Journal ───────────────────────────────────────────────────────────────────

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
  pingBridge();
  return { id: ref.id, date, text };
}

// ── Body / Weight ─────────────────────────────────────────────────────────────

export async function getBodyEntry(date = todayISO()) {
  const snap = await getDoc(doc(db, "fitness", getUid(), "body", date));
  if (!snap.exists()) return null;
  return snap.data();
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
    limit(days)
  );
  const snap = await getDocs(q);
  return snap.docs.map(d => d.data());
}

// ── Settings ──────────────────────────────────────────────────────────────────

export async function getSettings() {
  const snap = await getDoc(doc(db, "fitness", getUid(), "settings", "general"));
  if (!snap.exists()) return { theme: 'honey', themeMode: 'manual' };
  return snap.data();
}

export async function saveSettings(settings) {
  await setDoc(doc(db, "fitness", getUid(), "settings", "general"), {
    ...settings,
    updated_at: serverTimestamp(),
  });
  return { ok: true };
}

// ── Habits ────────────────────────────────────────────────────────────────────

export async function getHabits() {
  const snap = await getDocs(collection(db, "fitness", getUid(), "habits"));
  const habits = snap.docs.map(d => ({ uuid: d.id, ...d.data() }));
  const today = todayISO();
  const epochDay = Math.floor(Date.now() / 86400000);
  
  return Promise.all(habits.map(async h => {
    const rSnap = await getDoc(doc(db, "fitness", getUid(), "habitRecords", `${h.uuid}_${today}`));
    const records = rSnap.exists() ? [{ epochDay, completion: 'DONE' }] : [];
    return { ...h, records };
  }));
}

export async function recordHabit(uuid) {
  const today = todayISO();
  const ref = doc(db, "fitness", getUid(), "habitRecords", `${uuid}_${today}`);
  await setDoc(ref, {
    habitId: uuid,
    date: today,
    completion: 'DONE',
    recorded_at: serverTimestamp(),
  });
  return { ok: true };
}

// ── Knowledge Base ───────────────────────────────────────────────────────────

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

// ── Coverage Logic ───────────────────────────────────────────────────────────

const MUSCLE_GROUPS = {
  chest: ["pecs", "chest"],
  back: ["lats", "traps", "lower back", "back"],
  shoulders: ["shoulders", "delts"],
  arms: ["biceps", "triceps", "forearms"],
  core: ["abs", "obliques", "core"],
  glutes: ["glutes"],
  quads: ["quads"],
  hamstrings: ["hamstrings"],
  calves: ["calves"]
};

function muscleToGroupId(muscle) {
  const m = muscle.toLowerCase();
  for (const [group, list] of Object.entries(MUSCLE_GROUPS)) {
    if (list.some(x => m.includes(x))) return group;
  }
  return null;
}

export async function getCoverageGaps(days = 7) {
  const today = new Date();
  const dates = [];
  for (let i = 0; i < days; i++) {
    const d = new Date(today);
    d.setDate(today.getDate() - i);
    dates.push(d.toISOString().slice(0, 10));
  }

  const hits = {};
  for (const date of dates) {
    const session = await getSession(date);
    for (const ex of (session?.exercises || [])) {
      if (!ex.done) continue;
      for (const m of (ex.primaryMuscles || [])) {
        const id = muscleToGroupId(m);
        if (id) hits[id] = (hits[id] || 0) + 1;
      }
      for (const m of (ex.secondaryMuscles || [])) {
        const id = muscleToGroupId(m);
        if (id) hits[id] = (hits[id] || 0) + 0.5;
      }
    }
  }

  const all = Object.keys(MUSCLE_GROUPS);
  return all.filter(g => (hits[g] || 0) < 1).map(g => ({ name: g, hits: hits[g] || 0 }));
}

// ── Weekly Report ─────────────────────────────────────────────────────────────

function getWeekBounds(selector = "current") {
  let d = new Date();
  if (selector !== "current") {
    const [year, week] = selector.split("-W");
    d = new Date(year, 0, 1 + (parseInt(week) - 1) * 7);
  }
  const off = (d.getDay() + 6) % 7;
  const start = new Date(d);
  start.setDate(d.getDate() - off);
  const dates = [];
  for (let i = 0; i < 7; i++) {
    const x = new Date(start);
    x.setDate(start.getDate() + i);
    dates.push(x.toISOString().slice(0, 10));
  }
  return dates;
}

export async function getWeeklyReport(selector = "current") {
  const dates = getWeekBounds(selector);
  const sessions = [];
  let totalVolume = 0;
  let entriesCount = 0;
  const muscleScores = {};
  const bodyRegionScores = {};
  const topExMap = {};

  for (const date of dates) {
    const sess = await getSession(date);
    if (!sess || !sess.block) continue;
    let sessVolume = 0;
    for (const ex of (sess.exercises || [])) {
      if (!ex.done) continue;
      entriesCount++;
      const s = parseFloat(ex.sets), r = parseFloat(ex.reps), w = parseFloat(ex.weight);
      const vol = (isFinite(s) && isFinite(r) && isFinite(w)) ? s * r * w : 0;
      sessVolume += vol;
      const id = ex.name || ex.exercise_id;
      if (id) topExMap[id] = (topExMap[id] || 0) + 1;
      for (const m of (ex.primaryMuscles || [])) {
        const gid = muscleToGroupId(m);
        if (gid) {
          muscleScores[m] = (muscleScores[m] || 0) + 1;
          bodyRegionScores[gid] = (bodyRegionScores[gid] || 0) + 1;
        }
      }
    }
    totalVolume += sessVolume;
    sessions.push({ ...sess, total_volume: sessVolume, exercise_count: sess.exercises?.length || 0 });
  }

  const allGroups = ["chest", "back", "shoulders", "arms", "core", "glutes", "quads", "hamstrings", "calves"];
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
    recommendations: gaps.length > 0 ? [`Fokus auf: ${gaps.join(", ")}`] : ["Woche perfekt abgedeckt!"]
  };
}

// ── Export CSV ────────────────────────────────────────────────────────────────

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
  const blob = new Blob([csv], { type: "text/csv;charset=utf-8" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = `fitness-${days}d-${todayISO()}.csv`;
  a.click();
  URL.revokeObjectURL(url);
}

export function parseQuick(raw) {
  if (!raw?.trim()) return null;
  const name = raw.replace(/[\d@x\s].*/i, "").trim() || raw.trim();
  const setsMatch = raw.match(/(\d+)\s*[xX×]\s*(\d+)/);
  const weightMatch = raw.match(/@(\d+(?:\.\d+)?)/);
  const rpeMatch = raw.match(/rpe\s*(\d+(?:\.\d+)?)/i);
  return {
    name,
    sets: setsMatch ? setsMatch[1] : "3",
    reps: setsMatch ? setsMatch[2] : "10",
    weight: weightMatch ? weightMatch[1] : "",
    note: rpeMatch ? `RPE ${rpeMatch[1]}` : "",
    primaryMuscles: [],
    secondaryMuscles: [],
    done: true,
  };
}
