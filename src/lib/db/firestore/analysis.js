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

export { updateAnalyticsDoc };
import { muscleToGroups } from "../../lib/muscleMapping.js";

export async function getDashboardAnalytics(days = 21) {
  try {
    const snap = await getDoc(doc(db, "fitness", getUid(), "analytics", "dashboard"));
    if (snap.exists()) {
      const data = snap.data();
      if (days <= 7 && data.rolling_7_days) return data.rolling_7_days;
      if (days <= 14 && data.rolling_14_days) return data.rolling_14_days;
      if (data.rolling_21_days) return data.rolling_21_days;
    }
  } catch (e) {
    console.error("Failed to fetch dashboard analytics", e);
  }
  // Fallback: lokal aus Sessions berechnen
  const scores = await getMuscleCoverage(days);
  return { body_region_scores: scores };
}

import { ACTIVITY_MUSCLE_GROUPS } from "../../../constants/ActivityConstants.js";

// Adapter auf zentrales Mapping (siehe ActivityConstants.js). Impact bleibt lokal,
// da nur dieser Firebase-Build damit rechnet.
const ACTIVITY_IMPACT = { hiking: 1.0, running: 1.0, cycling: 0.8, swimming: 0.7 };
export const ACTIVITY_MUSCLE_MAPPING = Object.fromEntries(
  Object.entries(ACTIVITY_MUSCLE_GROUPS).map(([k, muscles]) => [k, { muscles, impact: ACTIVITY_IMPACT[k] ?? 1.0 }])
);

export const MUSCLE_GROUPS = ["chest", "back", "shoulders", "arms", "core", "glutes", "quads", "hamstrings", "calves", "legs"];

export function muscleToGroupIds(muscle, exerciseName = "") {
  return muscleToGroups(muscle, exerciseName);
}

export async function getMuscleCoverage(days = 7) {
  const today = new Date();
  const startDate = new Date();
  startDate.setDate(today.getDate() - (days - 1));
  const startStr = startDate.toISOString().slice(0, 10);
  const todayStr = today.toISOString().slice(0, 10);

  const q = query(
    collection(db, "fitness", getUid(), "sessions"),
    where("date", ">=", startStr),
    where("date", "<=", todayStr),
  );
  const snap = await getDocs(q);

  const hits = {};
  for (const d of snap.docs) {
    const session = d.data();
    for (const ex of (Array.isArray(session.exercises) ? session.exercises : [])) {
      const exName = ex.name || ex.exercise_id || "";
      [...(ex.primaryMuscles || [])].forEach(m =>
        muscleToGroups(m, exName).forEach(g => { hits[g] = (hits[g] || 0) + 1; })
      );
      [...(ex.secondaryMuscles || [])].forEach(m =>
        muscleToGroups(m, exName).forEach(g => { hits[g] = (hits[g] || 0) + 0.5; })
      );
    }
    // Activity addon: muscles bereits beim Speichern aufgelöst
    for (const m of (session.activity?.muscles || [])) {
      hits[m] = (hits[m] || 0) + 0.5;
    }
  }
  return hits;
}

export async function getCoverageGaps(days = 7, threshold = 1.0) {
  const hits = await getMuscleCoverage(days);
  return MUSCLE_GROUPS.filter(g => (hits[g] || 0) < threshold).map(g => ({ name: g, hits: hits[g] || 0 }));
}

async function updateAnalyticsDoc() {
  try {
    const [s7, s14, s21] = await Promise.all([
      getMuscleCoverage(7),
      getMuscleCoverage(14),
      getMuscleCoverage(21),
    ]);
    await setDoc(
      doc(db, "fitness", getUid(), "analytics", "dashboard"),
      {
        rolling_7_days:  { body_region_scores: s7,  updated_at: new Date().toISOString() },
        rolling_14_days: { body_region_scores: s14, updated_at: new Date().toISOString() },
        rolling_21_days: { body_region_scores: s21, updated_at: new Date().toISOString() },
      }
    );
  } catch (e) {
    console.warn("analytics update failed", e);
  }
}

function getWeekBounds(selector = "current") {
  let d = new Date();
  if (selector === "current") {
    const dates = [];
    for (let i = 0; i < 7; i++) {
      const x = new Date();
      x.setDate(d.getDate() - (6 - i));
      dates.push(x.toISOString().slice(0, 10));
    }
    return dates;
  }
  const [year, week] = selector.split("-W");
  d = new Date(Number(year), 0, 1 + (parseInt(week) - 1) * 7);
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
  const [kbExercises, history] = await Promise.all([
    getAllExercises(),
    getSessionHistory(120),
  ]);
  const kbMap = new Map();
  kbExercises.forEach(ex => kbMap.set((ex.display_name || ex.name || "").toLowerCase(), ex));

  const safeHistory = Array.isArray(history)
    ? history.filter(Boolean).map(s => ({
        ...s,
        exercises: Array.isArray(s.exercises) ? s.exercises : [],
      }))
    : [];

  const historyWithMuscles = safeHistory.map(s => {
    const groups = new Set();
    for (const ex of (s.exercises || [])) {
      const primary = ex.primaryMuscles || [];
      const secondary = ex.secondaryMuscles || [];
      const exName = ex.name || ex.exercise_id || "";
      let hasMapped = false;
      [...primary, ...secondary].forEach(m => {
        muscleToGroupIds(m, exName).forEach(gid => { groups.add(gid); hasMapped = true; });
      });
      if (!hasMapped && exName) muscleToGroupIds("", exName).forEach(gid => groups.add(gid));
    }
    if (s.activity && ACTIVITY_MUSCLE_MAPPING[s.activity.type]) {
      ACTIVITY_MUSCLE_MAPPING[s.activity.type].muscles.forEach(gid => groups.add(gid));
    }
    return { date: s.date, groups: [...groups] };
  }).sort((a, b) => (b.date || "").localeCompare(a.date || ""));

  const sessions = [];
  let entriesCount = 0;
  const muscleScores = {}, bodyRegionScores = {}, topExMap = {};

  for (const date of dates) {
    const sess = await getSession(date);
    if (!sess) continue;
    let hasDoneExercises = false;
    const sessGroupsCount = {};

    for (const ex of (Array.isArray(sess.exercises) ? sess.exercises : [])) {
      const primary = ex.primaryMuscles || [], secondary = ex.secondaryMuscles || [], exName = ex.name || ex.exercise_id || "";
      hasDoneExercises = true; entriesCount++;
      if (exName) topExMap[exName] = (topExMap[exName] || 0) + 1;
      let hasMapped = false;
      [...primary, ...secondary].forEach(m => {
        muscleToGroupIds(m, exName).forEach(gid => { sessGroupsCount[gid] = (sessGroupsCount[gid] || 0) + 1; hasMapped = true; });
      });
      for (const m of primary) {
        muscleToGroupIds(m, exName).forEach(gid => { muscleScores[m] = (muscleScores[m] || 0) + 1; bodyRegionScores[gid] = (bodyRegionScores[gid] || 0) + 1; hasMapped = true; });
      }
      for (const m of secondary) {
        muscleToGroupIds(m, exName).forEach(gid => { bodyRegionScores[gid] = (bodyRegionScores[gid] || 0) + 1; hasMapped = true; });
      }
      if (!hasMapped && exName) {
        muscleToGroupIds("", exName).forEach(gid => { sessGroupsCount[gid] = (sessGroupsCount[gid] || 0) + 1; bodyRegionScores[gid] = (bodyRegionScores[gid] || 0) + 1; });
      }
    }

    if (hasDoneExercises || sess.block || sess.activity) {
      const sortedGroups = Object.entries(sessGroupsCount).sort((a, b) => b[1] - a[1]);
      let autoSplit = sess.block || sess.trainingsart || "Training";
      if (!sess.block && sortedGroups.length > 0) autoSplit = sortedGroups[0][0].charAt(0).toUpperCase() + sortedGroups[0][0].slice(1);
      if (sess.activity && ACTIVITY_MUSCLE_MAPPING[sess.activity.type]) {
        ACTIVITY_MUSCLE_MAPPING[sess.activity.type].muscles.forEach(gid => { sessGroupsCount[gid] = (sessGroupsCount[gid] || 0) + 1; bodyRegionScores[gid] = (bodyRegionScores[gid] || 0) + 1; });
      }
      const muscleRecovery = {};
      for (const gid of Object.keys(sessGroupsCount)) {
        const lastSessionWithGroup = historyWithMuscles.find(h => h.date < date && h.groups.includes(gid));
        if (lastSessionWithGroup) {
          const d1 = new Date(date), d2 = new Date(lastSessionWithGroup.date);
          muscleRecovery[gid] = Math.round((d1 - d2) / (1000 * 60 * 60));
        }
      }
      sessions.push({ ...sess, block: autoSplit, exercise_count: sess.exercises?.length || 0, muscle_recovery: muscleRecovery });
    }
  }

  const allGroups = ["chest", "back", "shoulders", "arms", "core", "glutes", "quads", "hamstrings", "calves", "legs"];
  const gaps = allGroups.filter(g => (bodyRegionScores[g] || 0) < 1);

  return {
    ok: true, week: selector, session_count: sessions.length, entries_count: entriesCount,
    sessions, muscle_scores: muscleScores, body_region_scores: bodyRegionScores, missing_regions: gaps,
    top_exercises: Object.entries(topExMap).sort((a, b) => b[1] - a[1]).map(([name, count]) => ({ display_name: name, count })),
    recommendations: gaps.length > 0 ? [`Fokus auf: ${gaps.join(", ")}`] : ["Woche perfekt abgedeckt!"],
  };
}

export async function getProgressTrend(exerciseName, lastN = 4) {
  const history = await getSessionHistory(lastN * 7);
  const safeHistory = Array.isArray(history)
    ? history.filter(Boolean).map(s => ({
        ...s,
        exercises: Array.isArray(s.exercises) ? s.exercises : [],
      }))
    : [];
  
  const sessions = safeHistory
    .filter(s => s.exercises.some(ex => ex.name === exerciseName))
    .sort((a, b) => b.date.localeCompare(a.date));

  if (sessions.length < 2) return { status: "neutral", message: "Nicht genug Daten" };

  const values = sessions.map(s => {
    const ex = s.exercises.find(e => e.name === exerciseName);
    if (!ex) return null;

    // Trend is now always based on max weight
    if (Array.isArray(ex.setsArray)) {
      const weights = ex.setsArray.map(s => num(s.weight)).filter(w => w !== null);
      return weights.length > 0 ? Math.max(...weights) : null;
    }
    return num(ex.weight);
  }).filter(v => v !== null && v > 0);

  if (values.length < 2) return { status: "neutral", message: "Zu wenig Daten" };
  
  const current = values[0];
  const previous = values.slice(1, lastN);
  const avgPrevious = previous.reduce((a, b) => a + b, 0) / previous.length;
  
  if (avgPrevious === 0) return { status: "neutral" };

  const pctChange = ((current - avgPrevious) / avgPrevious) * 100;
  if (pctChange > 2)  return { status: "up",      change: pctChange.toFixed(1) };
  if (pctChange < -2) return { status: "down",    change: pctChange.toFixed(1) };
  return                   { status: "neutral", change: pctChange.toFixed(1) };
}

