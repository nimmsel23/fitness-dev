/**
 * firestore/analysis.js — Muscle coverage, weekly report, and analytics for Firestore.
 */

import {
  collection, doc, setDoc, getDoc, getDocs,
  query, where, serverTimestamp,
} from "firebase/firestore";

import { db } from "../../../firebase.js";
import { num, todayISO } from "../shared/utils.js";
import {
  ACTIVITY_MUSCLE_MAPPING, muscleToGroupIds,
  getMuscleGroupsForGaps, buildMuscleBalanceInsights,
} from "../shared/muscle.js";
import { getUid, hasAuthSession } from "./core.js";
import { getAllExercises } from "./kb.js";
import { getSessionHistory, listSessionsForDate } from "./sessions.js";
import {
  getDashboardAnalytics as getLocalDashboardAnalytics,
  getRecoveryAnalytics as getLocalRecoveryAnalytics,
  getWeeklyReport as getLocalWeeklyReport,
  getCoverageGaps as getLocalCoverageGaps,
  getMuscleCoverage as getLocalMuscleCoverage,
} from "../local/analysis.js";
import { getProgressTrend as getLocalProgressTrend } from "../local/sessions.js";
import { computeMuscleScores } from "../../superkompensation.js";
import { muscleToRegion } from "../shared/muscle.js";

export { ACTIVITY_MUSCLE_MAPPING, muscleToGroupIds };

const pendingWeeklyRefreshes = new Map();

// ── Analytics cache doc ───────────────────────────────────────────────────────

export async function updateAnalyticsDoc() {
  if (!hasAuthSession()) return null;
  try {
    const [s7, s14, s21, r7, r14, r28] = await Promise.all([
      getMuscleCoverage(7),
      getMuscleCoverage(14),
      getMuscleCoverage(21),
      buildRecoveryAnalyticsData(7),
      buildRecoveryAnalyticsData(14),
      buildRecoveryAnalyticsData(28),
    ]);
    await setDoc(
      doc(db, "fitness", getUid(), "analytics", "dashboard"),
      {
        rolling_7_days:  { body_region_scores: s7,  updated_at: new Date().toISOString() },
        rolling_14_days: { body_region_scores: s14, updated_at: new Date().toISOString() },
        rolling_21_days: { body_region_scores: s21, updated_at: new Date().toISOString() },
        recovery_7_days: r7,
        recovery_14_days: r14,
        recovery_28_days: r28,
      }
    );
  } catch (e) {
    console.warn("analytics update failed", e);
  }
}

export async function getDashboardAnalytics(days = 21) {
  if (!hasAuthSession()) return getLocalDashboardAnalytics(days);
  try {
    const snap = await getDoc(doc(db, "fitness", getUid(), "analytics", "dashboard"));
    if (snap.exists()) {
      const data = snap.data();
      if (days <= 7  && data.rolling_7_days)  return data.rolling_7_days;
      if (days <= 14 && data.rolling_14_days) return data.rolling_14_days;
      if (data.rolling_21_days) return data.rolling_21_days;
    }
  } catch (e) {
    console.error("Failed to fetch dashboard analytics", e);
  }
  // Fallback: compute locally from sessions
  const scores = await getMuscleCoverage(days);
  return { body_region_scores: scores };
}

// ── Muscle coverage ───────────────────────────────────────────────────────────

export async function getMuscleCoverage(days = 7) {
  if (!hasAuthSession()) return getLocalMuscleCoverage(days);
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
      [...(ex.primaryMuscles || [])].forEach((m) =>
        muscleToGroupIds(m, exName).forEach((g) => { hits[g] = (hits[g] || 0) + 1; })
      );
      [...(ex.secondaryMuscles || [])].forEach((m) =>
        muscleToGroupIds(m, exName).forEach((g) => { hits[g] = (hits[g] || 0) + 0.7; })
      );
      [...(ex.stabilizers || [])].forEach((m) =>
        muscleToGroupIds(m, exName).forEach((g) => { hits[g] = (hits[g] || 0) + 0.4; })
      );
    }
    for (const region of (session.activity?.muscles || [])) {
      muscleToGroupIds(region).forEach((g) => { hits[g] = (hits[g] || 0) + 0.5; });
    }
  }
  return hits;
}

export async function getCoverageGaps(days = 7, threshold = 1.0) {
  if (!hasAuthSession()) return getLocalCoverageGaps(days, threshold);
  const hits = await getMuscleCoverage(days);
  return getMuscleGroupsForGaps()
    .filter((g) => (hits[g.id] || 0) < threshold)
    .map((g) => ({ name: g.label, id: g.id, hits: hits[g.id] || 0 }));
}

function buildAcwr(sessions) {
  const now = new Date();
  const safeSessions = Array.isArray(sessions) ? sessions.filter(Boolean) : [];
  const dayOf = (dateStr) => Math.floor((now - new Date(`${dateStr}T12:00:00`)) / 86400000);
  const sessionLoad = (session) => {
    const effort = typeof session?.effort === "number" ? session.effort : 6;
    const count = Array.isArray(session?.exercises) && session.exercises.length > 0
      ? session.exercises.length
      : session?.activity ? 1 : 0;
    return effort * count;
  };

  let acute = 0;
  let chronic28 = 0;
  for (const session of safeSessions) {
    if (!session?.date) continue;
    const daysAgo = dayOf(session.date);
    if (daysAgo < 0 || daysAgo > 27) continue;
    const load = sessionLoad(session);
    chronic28 += load;
    if (daysAgo <= 6) acute += load;
  }
  const chronicWeekly = chronic28 / 4;
  if (chronicWeekly <= 0) return null;
  return Math.round((acute / chronicWeekly) * 100) / 100;
}

async function buildRecoveryAnalyticsData(days = 28) {
  const [sessions, kbExercises] = await Promise.all([
    getSessionHistory(60),
    getAllExercises(),
  ]);
  const safeSessions = Array.isArray(sessions)
    ? sessions.filter(Boolean).map((session) => ({
      ...session,
      exercises: Array.isArray(session.exercises) ? session.exercises : [],
    }))
    : [];
  const kbMap = new Map();
  (Array.isArray(kbExercises) ? kbExercises : []).forEach((exercise) => {
    kbMap.set((exercise.display_name || exercise.name || "").toLowerCase(), exercise);
  });

  const cutoff = new Date();
  cutoff.setDate(cutoff.getDate() - days);
  const cutoffStr = cutoff.toISOString().slice(0, 10);
  const sessionsInRange = safeSessions.filter((session) => session.date && session.date >= cutoffStr);
  return {
    ok: true,
    days,
    cutoff_date: cutoffStr,
    updated_at: new Date().toISOString(),
    session_count: sessionsInRange.length,
    hit_analysis: computeMuscleScores(sessionsInRange, kbMap, muscleToRegion),
    acwr: buildAcwr(safeSessions),
  };
}

export async function getRecoveryAnalytics(days = 28) {
  if (!hasAuthSession()) return getLocalRecoveryAnalytics(days);
  try {
    const snap = await getDoc(doc(db, "fitness", getUid(), "analytics", "dashboard"));
    if (snap.exists()) {
      const data = snap.data() || {};
      const field = days <= 7 ? "recovery_7_days" : days <= 14 ? "recovery_14_days" : "recovery_28_days";
      if (data[field]) return data[field];
    }
  } catch (e) {
    console.warn("Failed to fetch cached recovery analytics", e);
  }
  return buildRecoveryAnalyticsData(days);
}

// ── Weekly report ─────────────────────────────────────────────────────────────

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

function getWeekSelectorFromDate(date = todayISO()) {
  const source = new Date(`${date}T12:00:00`);
  const day = (source.getDay() + 6) % 7;
  source.setDate(source.getDate() - day + 3);
  const isoYear = source.getFullYear();
  const firstThursday = new Date(isoYear, 0, 4);
  const firstDay = (firstThursday.getDay() + 6) % 7;
  firstThursday.setDate(firstThursday.getDate() - firstDay + 3);
  const diffDays = Math.round((source - firstThursday) / 86400000);
  const isoWeek = 1 + Math.floor(diffDays / 7);
  return `${isoYear}-W${String(isoWeek).padStart(2, "0")}`;
}

function resolveWeekSelector(selector = "current") {
  return selector === "current" ? getWeekSelectorFromDate(todayISO()) : selector;
}

function weeklyReportDocRef(selector = "current") {
  return doc(db, "fitness", getUid(), "analytics", `weekly_${resolveWeekSelector(selector)}`);
}

async function buildWeeklyReportData(selector = "current") {
  const dates = getWeekBounds(selector);
  const [kbExercises, history] = await Promise.all([
    getAllExercises(),
    getSessionHistory(120),
  ]);
  const kbMap = new Map();
  kbExercises.forEach((ex) => kbMap.set((ex.display_name || ex.name || "").toLowerCase(), ex));

  const safeHistory = Array.isArray(history)
    ? history.filter(Boolean).map((s) => ({ ...s, exercises: Array.isArray(s.exercises) ? s.exercises : [] }))
    : [];

  const historyWithMuscles = safeHistory.map((s) => {
    const groups = new Set();
    for (const ex of (s.exercises || [])) {
      const primary = ex.primaryMuscles || [];
      const secondary = ex.secondaryMuscles || [];
      const exName = ex.name || ex.exercise_id || "";
      let hasMapped = false;
      [...primary, ...secondary].forEach((m) => {
        muscleToGroupIds(m, exName).forEach((gid) => { groups.add(gid); hasMapped = true; });
      });
      if (!hasMapped && exName) muscleToGroupIds("", exName).forEach((gid) => groups.add(gid));
    }
    if (s.activity && ACTIVITY_MUSCLE_MAPPING[s.activity.type]) {
      ACTIVITY_MUSCLE_MAPPING[s.activity.type].muscles.forEach((m) => {
        muscleToGroupIds(m).forEach((gid) => groups.add(gid));
      });
    }
    return { date: s.date, groups: [...groups] };
  }).sort((a, b) => (b.date || "").localeCompare(a.date || ""));

  const sessions = [];
  let entriesCount = 0;
  const muscleScores = {}, bodyRegionScores = {}, topExMap = {};
  const allExercises = [];

  // "Top Exercises" bewusst über die volle Historie (bis zu 120 Sessions),
  // nicht nur die aktuelle Wochen-/Periodenauswahl (dates) — sonst zeigt der
  // Report bei kurzen Perioden nur 1-2 Sessions und wirkt wie "es zählt nur
  // das letzte Workout", obwohl deutlich mehr Trainingsdaten vorliegen.
  for (const s of safeHistory) {
    for (const ex of (s.exercises || [])) {
      const exName = ex.name || ex.exercise_id || "";
      if (exName) topExMap[exName] = (topExMap[exName] || 0) + 1;
    }
  }

  // listSessionsForDate() statt getSession(date): getSession() lädt per exakter
  // Dokument-ID (nur der reine Datumsstring). Sessions, die über "Neues Workout"
  // angelegt wurden, haben aber eine "date__<timestamp>"-Dokument-ID (Mehrfach-
  // Sessions pro Tag) — getSession(date) fand solche Docs nie, wodurch komplette
  // Trainingstage (inkl. aller Muskelgruppen) aus dem Weekly Report verschwanden.
  // listSessionsForDate() nutzt eine Query auf das "date"-Feld und findet alle
  // Sessions eines Tages, unabhängig von der Dokument-ID.
  for (const date of dates) {
    const daySessions = await listSessionsForDate(date);

    for (const sess of daySessions) {
    let hasDoneExercises = false;
    const sessGroupsCount = {};

    for (const ex of (Array.isArray(sess.exercises) ? sess.exercises : [])) {
      const primary = ex.primaryMuscles || [], secondary = ex.secondaryMuscles || [], stabilizers = ex.stabilizers || [];
      const exName = ex.name || ex.exercise_id || "";
      hasDoneExercises = true; entriesCount++;
      allExercises.push({ name: exName, primaryMuscles: primary });
      let hasMapped = false;
      [...primary, ...secondary, ...stabilizers].forEach((m) => {
        muscleToGroupIds(m, exName).forEach((gid) => { sessGroupsCount[gid] = (sessGroupsCount[gid] || 0) + 1; hasMapped = true; });
      });
      for (const m of primary) {
        muscleToGroupIds(m, exName).forEach((gid) => { muscleScores[m] = (muscleScores[m] || 0) + 1; bodyRegionScores[gid] = (bodyRegionScores[gid] || 0) + 1; hasMapped = true; });
      }
      for (const m of secondary) {
        muscleToGroupIds(m, exName).forEach((gid) => { bodyRegionScores[gid] = (bodyRegionScores[gid] || 0) + 0.7; hasMapped = true; });
      }
      for (const m of stabilizers) {
        muscleToGroupIds(m, exName).forEach((gid) => { bodyRegionScores[gid] = (bodyRegionScores[gid] || 0) + 0.4; hasMapped = true; });
      }
      if (!hasMapped && exName) {
        muscleToGroupIds("", exName).forEach((gid) => { sessGroupsCount[gid] = (sessGroupsCount[gid] || 0) + 1; bodyRegionScores[gid] = (bodyRegionScores[gid] || 0) + 1; });
      }
    }

    if (hasDoneExercises || sess.block || sess.activity) {
      const sortedGroups = Object.entries(sessGroupsCount).sort((a, b) => b[1] - a[1]);
      let autoSplit = sess.block || sess.trainingsart || "Training";
      if (!sess.block && sortedGroups.length > 0) autoSplit = sortedGroups[0][0].charAt(0).toUpperCase() + sortedGroups[0][0].slice(1);
      if (sess.activity && ACTIVITY_MUSCLE_MAPPING[sess.activity.type]) {
        ACTIVITY_MUSCLE_MAPPING[sess.activity.type].muscles.forEach((m) => {
          muscleToGroupIds(m).forEach((gid) => {
            sessGroupsCount[gid] = (sessGroupsCount[gid] || 0) + 1;
            bodyRegionScores[gid] = (bodyRegionScores[gid] || 0) + 1;
          });
        });
      }
      const muscleRecovery = {};
      for (const gid of Object.keys(sessGroupsCount)) {
        const lastSessionWithGroup = historyWithMuscles.find((h) => h.date < date && h.groups.includes(gid));
        if (lastSessionWithGroup) {
          const d1 = new Date(date), d2 = new Date(lastSessionWithGroup.date);
          muscleRecovery[gid] = Math.round((d1 - d2) / (1000 * 60 * 60));
        }
      }
      sessions.push({ ...sess, block: autoSplit, exercise_count: sess.exercises?.length || 0, muscle_recovery: muscleRecovery });
    }
    }
  }

  const allGroups = getMuscleGroupsForGaps().map((g) => g.id);
  const gaps = allGroups.filter((g) => (bodyRegionScores[g] || 0) < 1);

  const efforts = sessions.map((s) => s.effort).filter((e) => typeof e === "number");
  const avgEffort = efforts.length > 0 ? Math.round((efforts.reduce((a, b) => a + b, 0) / efforts.length) * 10) / 10 : null;

  return {
    ok: true,
    week: resolveWeekSelector(selector),
    requested_week: selector,
    week_dates: dates,
    session_count: sessions.length,
    entries_count: entriesCount,
    total_exercises: entriesCount, avg_effort: avgEffort,
    sessions, muscle_scores: muscleScores, body_region_scores: bodyRegionScores, missing_regions: gaps,
    top_exercises: Object.entries(topExMap).sort((a, b) => b[1] - a[1]).map(([name, count]) => ({ display_name: name, count })),
    recommendations: [
      ...(gaps.length > 0 ? [`Fokus auf: ${gaps.join(", ")}`] : ["Woche perfekt abgedeckt!"]),
      ...buildMuscleBalanceInsights(allExercises),
    ],
  };
}

export async function updateWeeklyReportDoc(selector = "current") {
  if (!hasAuthSession()) return null;
  const data = await buildWeeklyReportData(selector);
  await setDoc(weeklyReportDocRef(selector), {
    ...data,
    updated_at: new Date().toISOString(),
    saved_at: serverTimestamp(),
  });
  return data;
}

export function scheduleWeeklyReportRefreshForDate(date = todayISO(), delayMs = 900) {
  if (!hasAuthSession()) return Promise.resolve(null);
  const selector = getWeekSelectorFromDate(date);
  const existing = pendingWeeklyRefreshes.get(selector);
  if (existing?.timer) clearTimeout(existing.timer);

  let resolvePromise;
  let rejectPromise;
  const promise = new Promise((resolve, reject) => {
    resolvePromise = resolve;
    rejectPromise = reject;
  });

  const timer = setTimeout(async () => {
    try {
      const data = await updateWeeklyReportDoc(selector);
      resolvePromise(data);
    } catch (error) {
      rejectPromise(error);
    } finally {
      pendingWeeklyRefreshes.delete(selector);
    }
  }, delayMs);

  pendingWeeklyRefreshes.set(selector, { timer, promise });
  return promise;
}

export async function getWeeklyReport(selector = "current") {
  if (!hasAuthSession()) return getLocalWeeklyReport(selector);

  const resolvedSelector = resolveWeekSelector(selector);
  const pending = pendingWeeklyRefreshes.get(resolvedSelector);
  if (pending?.promise) {
    try {
      await pending.promise;
    } catch {}
  }

  try {
    const snap = await getDoc(weeklyReportDocRef(selector));
    if (snap.exists()) return snap.data();
  } catch (e) {
    console.warn("Failed to fetch cached weekly report", e);
  }

  return updateWeeklyReportDoc(selector);
}

// ── Progress trend ────────────────────────────────────────────────────────────

export async function getProgressTrend(exerciseName, lastN = 4) {
  if (!hasAuthSession()) return getLocalProgressTrend(exerciseName, lastN);
  const history = await getSessionHistory(lastN * 7);
  const safeHistory = Array.isArray(history)
    ? history.filter(Boolean).map((s) => ({ ...s, exercises: Array.isArray(s.exercises) ? s.exercises : [] }))
    : [];

  const sessions = safeHistory
    .filter((s) => s.exercises.some((ex) => ex.name === exerciseName))
    .sort((a, b) => b.date.localeCompare(a.date));

  if (sessions.length < 2) return { status: "neutral", message: "Nicht genug Daten" };

  const values = sessions.map((s) => {
    const ex = s.exercises.find((e) => e.name === exerciseName);
    if (!ex) return null;
    if (Array.isArray(ex.setsArray)) {
      const weights = ex.setsArray.map((s) => num(s.weight)).filter((w) => w !== null);
      return weights.length > 0 ? Math.max(...weights) : null;
    }
    return num(ex.weight);
  }).filter((v) => v !== null && v > 0);

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
