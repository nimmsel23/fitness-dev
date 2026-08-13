import { api } from "./core";
import { ACTIVITY_MUSCLE_GROUPS } from "../../../constants/ActivityConstants";
import { muscleToGroupIds, getMuscleGroups, buildMuscleBalanceInsights, muscleToRegion } from "../shared/muscle";
import { computeMuscleScores } from "../../superkompensation.js";

export async function getDashboardAnalytics(days = 28) {
  try {
    const data = await api.get(`/fitness/analytics/dashboard?days=${days}`);
    if (data?.data) return data.data;
  } catch {}
  
  // Fallback to local calculation for backwards compatibility
  const scores = await getMuscleCoverage(days);
  return {
    body_region_scores: scores,
    total_volume: 0,
    session_count: 0
  };
}

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
  const [exRes, histRes] = await Promise.all([
    api.get('/fitness/exercises/all').catch(() => ({ exercises: [] })),
    api.get('/session/history?limit=120').catch(() => ({ sessions: [] }))
  ]);

  const kbExercises = exRes.exercises || [];
  const history = histRes.sessions || [];
  const kbMap = new Map();
  kbExercises.forEach(ex => kbMap.set((ex.display_name || ex.name || ex.exercise_id || "").toLowerCase(), ex));

  // Pre-build muscle group index over full history for recovery calculation
  const historyWithMuscles = history.map(s => {
    const groups = new Set();
    for (const ex of (s.exercises || [])) {
      const exName = ex.name || ex.exercise_id || "";
      const primary = ex.primaryMuscles || [];
      const secondary = ex.secondaryMuscles || [];
      [...primary, ...secondary].forEach(m => muscleToGroupIds(m, exName).forEach(gid => groups.add(gid)));
    }
    return { date: s.date, groups: [...groups] };
  }).sort((a, b) => (b.date || '').localeCompare(a.date || ''));

  const sessions = [];
  const bodyRegionScores = {};
  const muscleScores = {};
  const topExMap = {};
  const allExercises = [];

  // "Top Exercises" bewusst über die volle Historie (bis zu 120 Sessions),
  // nicht nur die aktuelle Wochen-/Periodenauswahl (dates) — sonst zeigt der
  // Report bei kurzen Perioden nur 1-2 Sessions und wirkt wie "es zählt nur
  // das letzte Workout", obwohl deutlich mehr Trainingsdaten vorliegen.
  for (const s of history) {
    for (const ex of (s.exercises || [])) {
      const exName = ex.name || ex.exercise_id || "";
      if (exName) topExMap[exName] = (topExMap[exName] || 0) + 1;
    }
  }

  for (const date of dates) {
    const sess = history.find(h => h.date === date);
    if (!sess) continue;
    const sessGroupsCount = {};
    for (let ex of (sess.exercises || [])) {
      const exName = ex.name || ex.exercise_id || "";
      if (!exName) continue;
      // Snapshot-First: inline-Werte aus dem Log gewinnen. KB nur Fallback,
      // damit gelöschte/umbenannte Katalog-Einträge keine alten Sessions kaputtmachen.
      const kbEx = kbMap.get(exName.toLowerCase());
      const primary = (ex.primaryMuscles?.length ? ex.primaryMuscles : null) || kbEx?.primary_muscles || kbEx?.primaryMuscles || [];
      const secondary = (ex.secondaryMuscles?.length ? ex.secondaryMuscles : null) || kbEx?.secondary_muscles || kbEx?.secondaryMuscles || [];
      const stabilizers = (ex.stabilizers?.length ? ex.stabilizers : null) || kbEx?.stabilizers || [];
      allExercises.push({ name: exName, primaryMuscles: primary });
      [...primary].forEach(m => {
        muscleScores[m] = (muscleScores[m] || 0) + 1;
        muscleToGroupIds(m, exName).forEach(gid => { sessGroupsCount[gid] = (sessGroupsCount[gid] || 0) + 1; bodyRegionScores[gid] = (bodyRegionScores[gid] || 0) + 1; });
      });
      [...secondary].forEach(m => muscleToGroupIds(m, exName).forEach(gid => { bodyRegionScores[gid] = (bodyRegionScores[gid] || 0) + 0.7; }));
      [...stabilizers].forEach(m => muscleToGroupIds(m, exName).forEach(gid => { bodyRegionScores[gid] = (bodyRegionScores[gid] || 0) + 0.4; }));
    }
    const actRegions = sess.activity?.muscles
      || (sess.activity?.type ? ACTIVITY_MUSCLE_GROUPS[sess.activity.type] : null);
    if (actRegions) {
      actRegions.forEach(m => muscleToGroupIds(m).forEach(gid => {
        sessGroupsCount[gid] = (sessGroupsCount[gid] || 0) + 0.5;
        bodyRegionScores[gid] = (bodyRegionScores[gid] || 0) + 0.5;
      }));
    }
    const muscleRecovery = {};
    for (const gid of Object.keys(sessGroupsCount)) {
      const lastSess = historyWithMuscles.find(h => h.date < date && h.groups.includes(gid));
      if (lastSess) {
        const d1 = new Date(date), d2 = new Date(lastSess.date);
        muscleRecovery[gid] = Math.round((d1 - d2) / (1000 * 60 * 60));
      }
    }
    sessions.push({ ...sess, exercise_count: sess.exercises?.length || 0, muscle_recovery: muscleRecovery });
  }

  const allGroups = getMuscleGroups().map(g => g.id);
  const gaps = allGroups.filter(g => (bodyRegionScores[g] || 0) < 1);
  const totalExercises = sessions.reduce((sum, s) => sum + (s.exercise_count || 0), 0);
  const effortValues = sessions.map(s => s.effort).filter(e => e && Number(e) > 0);
  const avgEffort = effortValues.length > 0 ? Math.round(effortValues.reduce((a, b) => a + Number(b), 0) / effortValues.length * 10) / 10 : null;
  return {
    ok: true,
    session_count: sessions.length,
    total_exercises: totalExercises,
    avg_effort: avgEffort,
    sessions,
    muscle_scores: muscleScores,
    body_region_scores: bodyRegionScores,
    missing_regions: gaps,
    recommendations: [
      ...(gaps.length > 0 ? [`Fokus auf: ${gaps.join(", ")}`] : ["Woche gut abgedeckt!"]),
      ...buildMuscleBalanceInsights(allExercises),
    ],
    top_exercises: Object.entries(topExMap).sort((a, b) => b[1] - a[1]).map(([name, count]) => {
      const kbEx = kbMap.get(name.toLowerCase());
      return {
        display_name: name,
        count,
        exercise_id: kbEx?.exercise_id || kbEx?.id || null,
        primary_muscles: kbEx?.primary_muscles || kbEx?.primaryMuscles || [],
        secondary_muscles: kbEx?.secondary_muscles || kbEx?.secondaryMuscles || [],
      };
    })
  };
}

export async function getMuscleCoverage(days = 7) {
  const cutoffDate = new Date(Date.now() - days * 86400000).toISOString().slice(0, 10);
  const [exRes, histRes] = await Promise.all([
    api.get('/fitness/exercises/all').catch(() => ({ exercises: [] })),
    api.get('/session/history?limit=120').catch(() => ({ sessions: [] }))
  ]);

  const kbExercises = exRes.exercises || [];
  const history = histRes.sessions || [];
  const kbMap = new Map();
  kbExercises.forEach(ex => kbMap.set((ex.display_name || ex.name || ex.exercise_id || "").toLowerCase(), ex));

  const bodyRegionScores = {};
  const sessionsInWindow = history.filter(s => s.date && s.date >= cutoffDate);

  for (const sess of sessionsInWindow) {
    for (let ex of (sess.exercises || [])) {
      const exName = ex.name || ex.exercise_id || "";
      // Snapshot-First: inline-Werte aus dem Log gewinnen. KB nur Fallback,
      // damit gelöschte/umbenannte Katalog-Einträge keine alten Sessions kaputtmachen.
      const kbEx = kbMap.get(exName.toLowerCase());
      const primary = (ex.primaryMuscles?.length ? ex.primaryMuscles : null) || kbEx?.primary_muscles || kbEx?.primaryMuscles || [];
      const secondary = (ex.secondaryMuscles?.length ? ex.secondaryMuscles : null) || kbEx?.secondary_muscles || kbEx?.secondaryMuscles || [];
      const stabilizers = (ex.stabilizers?.length ? ex.stabilizers : null) || kbEx?.stabilizers || [];
      [...primary].forEach(m => muscleToGroupIds(m, exName).forEach(gid => { bodyRegionScores[gid] = (bodyRegionScores[gid] || 0) + 1; }));
      [...secondary].forEach(m => muscleToGroupIds(m, exName).forEach(gid => { bodyRegionScores[gid] = (bodyRegionScores[gid] || 0) + 0.7; }));
      [...stabilizers].forEach(m => muscleToGroupIds(m, exName).forEach(gid => { bodyRegionScores[gid] = (bodyRegionScores[gid] || 0) + 0.4; }));
    }
    // Activity addon: muscles pre-resolved on save, fallback to old mapping for legacy sessions
    const actRegions = sess.activity?.muscles
      || (sess.activity?.type ? ACTIVITY_MUSCLE_GROUPS[sess.activity.type] : null);
    if (actRegions) {
      actRegions.forEach(m => muscleToGroupIds(m).forEach(gid => { bodyRegionScores[gid] = (bodyRegionScores[gid] || 0) + 0.5; }));
    }
  }

  return bodyRegionScores;
}

export async function getCoverageGaps(days = 7, threshold = 1.0) {
  const hits = await getMuscleCoverage(days);
  return getMuscleGroups()
    .filter(g => (hits[g.id] || 0) < threshold)
    .map(g => ({ name: g.label, id: g.id, hits: hits[g.id] || 0 }));
}

function buildAcwr(sessions) {
  const now = new Date();
  const safeSessions = Array.isArray(sessions) ? sessions.filter(Boolean) : [];
  const dayOf = (dateStr) => Math.floor((now - new Date(`${dateStr}T12:00:00`)) / 86400000);
  const sessionLoad = (session) => {
    const effort = typeof session?.effort === 'number' ? session.effort : 6;
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

export async function getRecoveryAnalytics(days = 28) {
  const [exRes, histRes] = await Promise.all([
    api.get('/fitness/exercises/all').catch(() => ({ exercises: [] })),
    api.get('/session/history?limit=120').catch(() => ({ sessions: [] })),
  ]);

  const kbExercises = exRes.exercises || [];
  const history = histRes.sessions || [];
  const safeSessions = Array.isArray(history)
    ? history.filter(Boolean).map((session) => ({
      ...session,
      exercises: Array.isArray(session.exercises) ? session.exercises : [],
    }))
    : [];
  const kbMap = new Map();
  kbExercises.forEach((exercise) => {
    kbMap.set((exercise.display_name || exercise.name || exercise.exercise_id || '').toLowerCase(), exercise);
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
