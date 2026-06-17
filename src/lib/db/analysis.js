import { api } from "./core";

const MUSCLE_GROUPS = {
  chest: ["pecs", "chest", "pectoralis", "brust", "100_chest", "101_pectoralis", "102_pectoralis", "103_pectoralis", "104_serratus"],
  back: ["lats", "traps", "lower back", "back", "latissimus", "trapezius", "rhomboids", "rücken", "pull-up", "klimmzug", "rudern", "row", "200_back", "201_latissimus", "202_trapezius", "203_trapezius", "204_trapezius", "205_rhomboids", "206_erector", "207_teres", "208_quadratus"],
  shoulders: ["shoulders", "delts", "deltoid", "schulter", "schultern", "overhead", "press", "300_shoulders", "301_anterior_deltoid", "302_lateral_deltoid", "303_posterior_deltoid", "304_rotator"],
  arms: ["biceps", "triceps", "forearms", "brachii", "bizeps", "trizeps", "arm", "arme", "curl", "extension", "400_arms", "401_biceps", "402_brachialis", "403_triceps", "404_brachioradialis", "405_forearm", "406_anconeus"],
  core: ["abs", "obliques", "core", "abdominis", "bauch", "500_core", "501_rectus", "502_obliques", "503_transverse"],
  glutes: ["glutes", "gluteus", "po", "gesäß", "hip thrust", "601_gluteus", "602_gluteus"],
  quads: ["quads", "quadriceps", "oberschenkel", "squat", "kniebeuge", "603_quadriceps"],
  hamstrings: ["hamstrings", "biceps femoris", "beinbeuger", "leg curl", "604_hamstrings"],
  calves: ["calves", "gastrocnemius", "waden", "calf", "700_calves", "701_gastrocnemius", "702_soleus", "triceps_surae"],
  legs: ["legs", "squat", "deadlift", "lunge", "beine", "bein", "leg press", "600_legs", "605_adductors"]
};

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

const ACTIVITY_MUSCLE_MAPPING = {
  hiking: { muscles: ["legs", "quads", "calves", "glutes"] },
  running: { muscles: ["legs", "quads", "calves", "hamstrings", "glutes"] },
  cycling: { muscles: ["legs", "quads", "calves", "glutes"] },
  swimming: { muscles: ["back", "shoulders", "arms", "core", "legs"] }
};

function muscleToGroupIds(muscle, exerciseName = "") {
  const m = muscle.toLowerCase();
  const name = exerciseName.toLowerCase();
  const matches = new Set();
  for (const [group, list] of Object.entries(MUSCLE_GROUPS)) {
    if (list.some(x => m.includes(x) || (name && name.includes(x)))) {
      matches.add(group);
    }
  }
  return Array.from(matches);
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
  kbExercises.forEach(ex => kbMap.set((ex.display_name || ex.name || ex.exercise_id).toLowerCase(), ex));

  const sessions = [];
  const bodyRegionScores = {};
  const topExMap = {};

  for (const date of dates) {
    const sess = history.find(h => h.date === date);
    if (!sess) continue;
    const sessGroupsCount = {};
    for (let ex of (sess.exercises || [])) {
      if (!ex.done) continue;
      const exName = ex.name || ex.exercise_id || "";
      if (exName) topExMap[exName] = (topExMap[exName] || 0) + 1;
      const kbEx = kbMap.get(exName.toLowerCase());
      const primary = kbEx?.primary_muscles || kbEx?.primaryMuscles || ex.primaryMuscles || [];
      const secondary = kbEx?.secondary_muscles || kbEx?.secondaryMuscles || ex.secondaryMuscles || [];
      const stabilizers = kbEx?.stabilizers || ex.stabilizers || [];
      [...primary].forEach(m => muscleToGroupIds(m, exName).forEach(gid => { sessGroupsCount[gid] = (sessGroupsCount[gid] || 0) + 1; bodyRegionScores[gid] = (bodyRegionScores[gid] || 0) + 1; }));
      [...secondary].forEach(m => muscleToGroupIds(m, exName).forEach(gid => { bodyRegionScores[gid] = (bodyRegionScores[gid] || 0) + 0.5; }));
      [...stabilizers].forEach(m => muscleToGroupIds(m, exName).forEach(gid => { bodyRegionScores[gid] = (bodyRegionScores[gid] || 0) + 0.2; }));
    }
    sessions.push({ ...sess, exercise_count: sess.exercises?.length || 0 });
  }

  const allGroups = ["chest", "back", "shoulders", "arms", "core", "glutes", "quads", "hamstrings", "calves", "legs"];
  const gaps = allGroups.filter(g => (bodyRegionScores[g] || 0) < 1);
  return {
    ok: true,
    session_count: sessions.length,
    sessions: sessions.reverse(),
    body_region_scores: bodyRegionScores,
    missing_regions: gaps,
    top_exercises: Object.entries(topExMap).sort((a, b) => b[1] - a[1]).map(([name, count]) => ({ display_name: name, count }))
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
      if (!ex.done) continue;
      const exName = ex.name || ex.exercise_id || "";
      const kbEx = kbMap.get(exName.toLowerCase());
      const primary = kbEx?.primary_muscles || kbEx?.primaryMuscles || ex.primaryMuscles || [];
      const secondary = kbEx?.secondary_muscles || kbEx?.secondaryMuscles || ex.secondaryMuscles || [];
      const stabilizers = kbEx?.stabilizers || ex.stabilizers || [];
      [...primary].forEach(m => muscleToGroupIds(m, exName).forEach(gid => { bodyRegionScores[gid] = (bodyRegionScores[gid] || 0) + 1; }));
      [...secondary].forEach(m => muscleToGroupIds(m, exName).forEach(gid => { bodyRegionScores[gid] = (bodyRegionScores[gid] || 0) + 0.5; }));
      [...stabilizers].forEach(m => muscleToGroupIds(m, exName).forEach(gid => { bodyRegionScores[gid] = (bodyRegionScores[gid] || 0) + 0.2; }));
    }
  }

  return bodyRegionScores;
}

export async function getCoverageGaps(days = 7) {
  const hits = await getMuscleCoverage(days);
  return Object.keys(MUSCLE_GROUPS)
    .filter(g => (hits[g] || 0) < 1)
    .map(g => ({ name: g, hits: hits[g] || 0 }));
}
