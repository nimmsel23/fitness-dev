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
  signOut as fbSignOut,
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  updateProfile
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

export async function signInEmail(email, password) {
  await signInWithEmailAndPassword(auth, email, password);
}

export async function signUpEmail(email, password, displayName) {
  const cred = await createUserWithEmailAndPassword(auth, email, password);
  if (displayName) {
    await updateProfile(cred.user, { displayName });
  }
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

export async function addHabit(name) {
  return await addDoc(collection(db, "fitness", getUid(), "habits"), {
    name,
    created_at: serverTimestamp()
  });
}

export async function deleteHabit(uuid) {
  await setDoc(doc(db, "fitness", getUid(), "habits", uuid), { deleted: true }, { merge: true });
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
  chest: ["pecs", "chest", "pectoralis"],
  back: ["lats", "traps", "lower back", "back", "latissimus", "trapezius", "rhomboids"],
  shoulders: ["shoulders", "delts", "deltoid"],
  arms: ["biceps", "triceps", "forearms", "brachii"],
  core: ["abs", "obliques", "core", "abdominis"],
  glutes: ["glutes", "gluteus"],
  quads: ["quads", "quadriceps"],
  hamstrings: ["hamstrings", "biceps femoris"],
  calves: ["calves", "gastrocnemius"],
  legs: ["legs", "squat", "deadlift", "lunge"]
};

function muscleToGroupId(muscle, exerciseName = "") {
  const m = muscle.toLowerCase();
  const name = exerciseName.toLowerCase();
  
  for (const [group, list] of Object.entries(MUSCLE_GROUPS)) {
    if (list.some(x => m.includes(x) || (name && name.includes(x)))) return group;
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
      const primary = ex.primaryMuscles || ex.primary_muscles || [];
      const secondary = ex.secondaryMuscles || ex.secondary_muscles || [];
      const name = ex.name || "";
      
      // If no muscles tagged, try to infer from name
      if (primary.length === 0 && secondary.length === 0) {
        const id = muscleToGroupId("", name);
        if (id) hits[id] = (hits[id] || 0) + 1;
      }

      for (const m of primary) {
        const id = muscleToGroupId(m, name);
        if (id) hits[id] = (hits[id] || 0) + 1;
      }
      for (const m of secondary) {
        const id = muscleToGroupId(m, name);
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
  if (selector === "current") {
    // Rolling 7 days instead of hard Monday reset
    const dates = [];
    for (let i = 0; i < 7; i++) {
      const x = new Date();
      x.setDate(d.getDate() - (6 - i));
      dates.push(x.toISOString().slice(0, 10));
    }
    return dates;
  }
  
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
  console.log("WeeklyReport - Analyzing dates:", dates);
  
  const [kbExercises] = await Promise.all([
    getAllExercises()
  ]);

  const kbMap = new Map();
  kbExercises.forEach(ex => {
    kbMap.set((ex.display_name || ex.name).toLowerCase(), ex);
  });

  const sessions = [];
  let totalVolume = 0;
  let entriesCount = 0;
  const muscleScores = {};
  const bodyRegionScores = {};
  const topExMap = {};

  for (const date of dates) {
    const sess = await getSession(date);
    if (!sess) continue;
    
    const blockName = sess.block || sess.trainingsart || "Training";
    let sessVolume = 0;
    let hasDoneExercises = false;

    for (let ex of (sess.exercises || [])) {
      if (!ex.done) continue;
      
      // Enrich on-the-fly for the report
      const kbEx = kbMap.get((ex.name || "").toLowerCase());
      if (kbEx) {
        ex = {
          ...ex,
          primaryMuscles: kbEx.primary_muscles || kbEx.primaryMuscles || ex.primaryMuscles || [],
          secondaryMuscles: kbEx.secondary_muscles || kbEx.secondaryMuscles || ex.secondaryMuscles || []
        };
      }

      hasDoneExercises = true;
      entriesCount++;
      const s = parseFloat(ex.sets), r = parseFloat(ex.reps), w = parseFloat(ex.weight);
      const vol = (isFinite(s) && isFinite(r) && isFinite(w)) ? s * r * w : 0;
      sessVolume += vol;
      const exName = ex.name || ex.exercise_id || "";
      if (exName) topExMap[exName] = (topExMap[exName] || 0) + 1;
      
      const primary = ex.primaryMuscles || [];
      const secondary = ex.secondaryMuscles || [];

      // Fallback if still no muscles
      if (primary.length === 0 && secondary.length === 0) {
        const gid = muscleToGroupId("", exName);
        if (gid) bodyRegionScores[gid] = (bodyRegionScores[gid] || 0) + 1;
      }

      for (const m of primary) {
        const gid = muscleToGroupId(m, exName);
        if (gid) {
          muscleScores[m] = (muscleScores[m] || 0) + 1;
          bodyRegionScores[gid] = (bodyRegionScores[gid] || 0) + 1;
        }
      }
      for (const m of secondary) {
        const gid = muscleToGroupId(m, exName);
        if (gid) bodyRegionScores[gid] = (bodyRegionScores[gid] || 0) + 0.5;
      }
    }

    if (hasDoneExercises || sess.block) {
      console.log(`WeeklyReport - Found session on ${date}: ${blockName}, Volume: ${sessVolume}`);
      totalVolume += sessVolume;
      sessions.push({ ...sess, block: blockName, total_volume: sessVolume, exercise_count: sess.exercises?.length || 0 });
    }
  }

  const allGroups = ["chest", "back", "shoulders", "arms", "core", "glutes", "quads", "hamstrings", "calves", "legs"];
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

// ── Progress Tracking ─────────────────────────────────────────────────────────

export async function getProgressTrend(exerciseName, lastN = 4) {
  const history = await getSessionHistory(lastN * 7); // Load enough sessions
  
  // Extract sessions containing this exercise, sorted by date desc
  const sessions = history
    .filter(s => s.exercises?.some(ex => ex.name === exerciseName))
    .sort((a, b) => b.date.localeCompare(a.date));

  if (sessions.length < 2) return { status: 'neutral', message: 'Nicht genug Daten' };

  // Calculate volume per session for this exercise
  const volumes = sessions.map(s => {
    const ex = s.exercises.find(e => e.name === exerciseName);
    if (!ex || ex.isHIT) return null; // Ignore HIT in volume trend
    const sN = parseFloat(ex.sets), rN = parseFloat(ex.reps), wN = parseFloat(ex.weight);
    return (isFinite(sN) && isFinite(rN) && isFinite(wN)) ? sN * rN * wN : null;
  }).filter(v => v !== null);

  if (volumes.length < 2) return { status: 'neutral', message: 'Zu wenig Volumen-Daten' };

  // Simple Trend: Compare last session with the average of previous ones (excluding deload if 4th)
  const current = volumes[0];
  const previous = volumes.slice(1, lastN);
  
  // Deload detection: If we have 4 weeks, consider 4th as deload (optional tolerance)
  // Here: Just simple average of available data points for robust trend
  const avgPrevious = previous.reduce((a, b) => a + b, 0) / previous.length;
  const pctChange = ((current - avgPrevious) / avgPrevious) * 100;

  if (pctChange > 5) return { status: 'up', change: pctChange.toFixed(1) };
  if (pctChange < -5) return { status: 'down', change: pctChange.toFixed(1) };
  return { status: 'neutral', change: pctChange.toFixed(1) };
}

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
