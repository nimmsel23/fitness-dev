import { api } from "./core";
import { ACTIVITY_MUSCLE_GROUPS } from "../../../constants/ActivityConstants";
import { muscleToGroupIds, getMuscleGroupsForGaps, buildMuscleBalanceInsights, muscleToRegion } from "../shared/muscle";
import { computeMuscleScores } from "../../superkompensation.js";

const ROLE_W = { primary: 1, secondary: 0.5, stabilizer: 0.2 };
const DEFAULT_EFFORT = 7; // RPE-7-Baseline, siehe fitness/catalog/coverage.py effort_factor-Tabelle

// Rohe (Muskel, Übungsname, Gewicht)-Treffer einer Session, aus geloggten
// Übungen UND einem geloggten Cardio/Activity-Finisher. activity.primaryMuscles
// markiert die Hauptmover (z.B. Brust beim Brustschwimmen) — Rest bleibt
// secondary. Spiegel von server.mjs::sessionHits / coaching.py::_exercise_hits.
function sessionHits(sess, kbMap) {
  const rows = [];
  for (const ex of (sess.exercises || [])) {
    const exName = ex.name || ex.exercise_id || "";
    const kbEx = kbMap.get(exName.toLowerCase());
    const primary = (ex.primaryMuscles?.length ? ex.primaryMuscles : null) || kbEx?.primary_muscles || kbEx?.primaryMuscles || [];
    const secondary = (ex.secondaryMuscles?.length ? ex.secondaryMuscles : null) || kbEx?.secondary_muscles || kbEx?.secondaryMuscles || [];
    const stabilizers = (ex.stabilizers?.length ? ex.stabilizers : null) || kbEx?.stabilizers || [];
    primary.forEach(m => rows.push([m, exName, ROLE_W.primary]));
    secondary.forEach(m => rows.push([m, exName, ROLE_W.secondary]));
    stabilizers.forEach(m => rows.push([m, exName, ROLE_W.stabilizer]));
  }
  const actMuscles = sess.activity?.muscles
    || (sess.activity?.type ? ACTIVITY_MUSCLE_GROUPS[sess.activity.type] : null) || [];
  const actPrimary = new Set(sess.activity?.primaryMuscles || []);
  actMuscles.forEach(m => rows.push([m, null, actPrimary.has(m) ? ROLE_W.primary : ROLE_W.secondary]));
  return rows;
}

function sessionBudget(sess) {
  const effort = Number(sess?.effort);
  return (Number.isFinite(effort) && effort > 0 ? effort : DEFAULT_EFFORT) / 10;
}

// Session-Budget-Normalisierung: die Summe aller Gewichte EINER Session ist
// auf effort/10 gedeckelt, unabhängig davon wie viele Übungen geloggt
// wurden. One-Set-to-Failure: jede geloggte Übung ist ungefähr gleich hart,
// mehr Übungen bedeuten mehr Muskel-Breite, nicht automatisch mehr
// Gesamtbelastung. Spiegel von server.mjs::normalizedSessionHits /
// coaching.py::_normalized_session_hits.
function normalizedSessionHits(sess, kbMap) {
  const raw = sessionHits(sess, kbMap);
  const rawTotal = raw.reduce((sum, [, , w]) => sum + w, 0);
  if (rawTotal <= 0) return [];
  const scale = sessionBudget(sess) / rawTotal;
  return raw.map(([m, exName, w]) => [m, exName, w * scale]);
}

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
    for (const ex of (sess.exercises || [])) {
      const exName = ex.name || ex.exercise_id || "";
      if (!exName) continue;
      // Snapshot-First: inline-Werte aus dem Log gewinnen. KB nur Fallback,
      // damit gelöschte/umbenannte Katalog-Einträge keine alten Sessions kaputtmachen.
      const kbEx = kbMap.get(exName.toLowerCase());
      const primary = (ex.primaryMuscles?.length ? ex.primaryMuscles : null) || kbEx?.primary_muscles || kbEx?.primaryMuscles || [];
      allExercises.push({ name: exName, primaryMuscles: primary });
      // muscleScores bleibt eine reine Übungs-Häufigkeit (wie oft dieser Muskel
      // als primary vorkommt), unabhängig von der Session-Budget-Normalisierung
      // unten — anderes Konzept als "Belastung".
      primary.forEach(m => { muscleScores[m] = (muscleScores[m] || 0) + 1; });
    }
    // Session-Budget-normalisiert (normalizedSessionHits): verhindert, dass eine
    // Session mit vielen Übungen allein wegen der Übungsanzahl höher zählt als
    // eine gleich intensive Session mit 1-2 Übungen.
    for (const [m, exName, w] of normalizedSessionHits(sess, kbMap)) {
      muscleToGroupIds(m, exName).forEach(gid => {
        sessGroupsCount[gid] = (sessGroupsCount[gid] || 0) + w;
        bodyRegionScores[gid] = (bodyRegionScores[gid] || 0) + w;
      });
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

  const allGroups = getMuscleGroupsForGaps().map(g => g.id);
  // Threshold an die Session-Budget-Normalisierung angepasst, siehe getCoverageGaps().
  const gaps = allGroups.filter(g => (bodyRegionScores[g] || 0) < 0.3);
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
    for (const [m, exName, w] of normalizedSessionHits(sess, kbMap)) {
      muscleToGroupIds(m, exName).forEach(gid => { bodyRegionScores[gid] = (bodyRegionScores[gid] || 0) + w; });
    }
  }

  return bodyRegionScores;
}

// Threshold an die Session-Budget-Normalisierung angepasst (normalizedSessionHits) —
// Gruppen-Scores liegen jetzt in der Größenordnung effort/10 pro Session statt
// vorher unbegrenzt pro Übung zu summieren, siehe server.mjs::/coverage/gaps.
export async function getCoverageGaps(days = 7, threshold = 0.3) {
  const hits = await getMuscleCoverage(days);
  return getMuscleGroupsForGaps()
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
