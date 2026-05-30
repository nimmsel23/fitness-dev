import { getSession, getSessionHistory } from "./sessions";
import { getAllExercises } from "./kb";

export const ACTIVITY_MUSCLE_MAPPING = {
  hiking: { muscles: ["legs", "core", "glutes"], impact: 1.0 },
  running: { muscles: ["quads", "hamstrings", "calves"], impact: 1.0 },
  cycling: { muscles: ["quads", "calves"], impact: 0.8 },
  swimming: { muscles: ["back", "shoulders", "core"], impact: 0.7 }
};

const MUSCLE_TAG_TO_GROUP = {
  "chest": "chest", "pecs": "chest", "pectoralis": "chest",
  "back": "back", "lats": "back", "traps": "back", "trapezius": "back", "rhomboids": "back",
  "shoulders": "shoulders", "delts": "shoulders", "deltoid": "shoulders",
  "biceps": "arms", "triceps": "arms", "forearms": "arms",
  "abs": "core", "obliques": "core", "core": "core", "abdominis": "core",
  "glutes": "glutes", "gluteus": "glutes",
  "quads": "quads", "quadriceps": "quads",
  "hamstrings": "hamstrings", "biceps femoris": "hamstrings",
  "calves": "calves", "gastrocnemius": "calves"
};

export const MUSCLE_GROUPS = {
  chest: ["pecs", "chest", "pectoralis", "brust"],
  back: ["lats", "traps", "lower back", "back", "latissimus", "trapezius", "rhomboids", "rücken", "pull-up", "klimmzug", "rudern", "row"],
  shoulders: ["shoulders", "delts", "deltoid", "schulter", "schultern", "overhead", "press"],
  arms: ["biceps", "triceps", "forearms", "brachii", "bizeps", "trizeps", "arm", "arme", "curl", "extension"],
  core: ["abs", "obliques", "core", "abdominis", "bauch"],
  glutes: ["glutes", "gluteus", "po", "gesäß", "hip thrust", "squat", "kniebeuge"],
  quads: ["quads", "quadriceps", "oberschenkel", "squat", "kniebeuge"],
  hamstrings: ["hamstrings", "biceps femoris", "beinbeuger", "leg curl", "kreuzheben", "good mornings", "rumänisches kreuzheben", "squat", "kniebeuge"],
  calves: ["calves", "gastrocnemius", "waden", "calf", "wadenheben", "stehendes wadenheben", "squat", "kniebeuge"],
  legs: ["legs", "squat", "deadlift", "lunge", "beine", "bein", "leg press", "kniebeuge"]
};

export function muscleToGroupIds(muscle, exerciseName = "") {
  const m = muscle.toLowerCase().trim();
  const name = exerciseName.toLowerCase();
  const matches = new Set();
  if (MUSCLE_TAG_TO_GROUP[m]) matches.add(MUSCLE_TAG_TO_GROUP[m]);
  for (const [group, list] of Object.entries(MUSCLE_GROUPS)) {
    if (list.some(x => m.includes(x) || (name && name.includes(x)))) {
      matches.add(group);
    }
  }
  return Array.from(matches);
}

export async function getMuscleCoverage(days = 7) {
  const dates = [];
  const today = new Date();
  for (let i = 0; i < days; i++) {
    const d = new Date(today);
    d.setDate(today.getDate() - i);
    dates.push(d.toISOString().slice(0, 10));
  }
  const hits = {};
  for (const date of dates) {
    const session = await getSession(date);
    if (!session) continue;
    for (let ex of (session.exercises || [])) {
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

export async function getCoverageGaps(days = 7) {
  const hits = await getMuscleCoverage(days);
  const all = Object.keys(MUSCLE_GROUPS);
  return all.filter(g => (hits[g] || 0) < 1).map(g => ({ name: g, hits: hits[g] || 0 }));
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
  const [kbExercises, history] = await Promise.all([
    getAllExercises(),
    getSessionHistory(120)
  ]);
  const kbMap = new Map();
  kbExercises.forEach(ex => kbMap.set((ex.display_name || ex.name).toLowerCase(), ex));

  const historyWithMuscles = history.map(s => {
    const groups = new Set();
    for (const ex of (s.exercises || [])) {
      if (!ex.done) continue;
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
    return { date: s.date, groups: Array.from(groups) };
  }).sort((a, b) => b.date.localeCompare(a.date));

  const sessions = [];
  let totalVolume = 0, entriesCount = 0;
  const muscleScores = {}, bodyRegionScores = {}, topExMap = {};

  for (const date of dates) {
    const sess = await getSession(date);
    if (!sess) continue;
    let sessVolume = 0, hasDoneExercises = false;
    const sessGroupsCount = {};

    for (let ex of (sess.exercises || [])) {
      if (!ex.done) continue;
      const primary = ex.primaryMuscles || [], secondary = ex.secondaryMuscles || [], exName = ex.name || ex.exercise_id || "";
      hasDoneExercises = true; entriesCount++;
      const s = parseFloat(ex.sets), r = parseFloat(ex.reps), w = parseFloat(ex.weight);
      const vol = (isFinite(s) && isFinite(r) && isFinite(w)) ? s * r * w : 0;
      sessVolume += vol;
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
      totalVolume += sessVolume;
      sessions.push({ ...sess, block: autoSplit, total_volume: sessVolume, exercise_count: sess.exercises?.length || 0, muscle_recovery: muscleRecovery });
    }
  }

  const allGroups = ["chest", "back", "shoulders", "arms", "core", "glutes", "quads", "hamstrings", "calves", "legs"];
  const gaps = allGroups.filter(g => (bodyRegionScores[g] || 0) < 1);

  return {
    ok: true, week: selector, session_count: sessions.length, entries_count: entriesCount, total_volume: totalVolume,
    sessions, muscle_scores: muscleScores, body_region_scores: bodyRegionScores, missing_regions: gaps,
    top_exercises: Object.entries(topExMap).sort((a, b) => b[1] - a[1]).map(([name, count]) => ({ display_name: name, count })),
    recommendations: gaps.length > 0 ? [`Fokus auf: ${gaps.join(", ")}`] : ["Woche perfekt abgedeckt!"]
  };
}

export async function getProgressTrend(exerciseName, lastN = 4) {
  const history = await getSessionHistory(lastN * 7);
  const sessions = history.filter(s => s.exercises?.some(ex => ex.name === exerciseName)).sort((a, b) => b.date.localeCompare(a.date));
  if (sessions.length < 2) return { status: 'neutral', message: 'Nicht genug Daten' };
  const volumes = sessions.map(s => {
    const ex = s.exercises.find(e => e.name === exerciseName);
    if (!ex || ex.isHIT) return null;
    const sN = parseFloat(ex.sets), rN = parseFloat(ex.reps), wN = parseFloat(ex.weight);
    return (isFinite(sN) && isFinite(rN) && isFinite(wN)) ? sN * rN * wN : null;
  }).filter(v => v !== null);
  if (volumes.length < 2) return { status: 'neutral', message: 'Zu wenig Volumen-Daten' };
  const current = volumes[0], previous = volumes.slice(1, lastN);
  const avgPrevious = previous.reduce((a, b) => a + b, 0) / previous.length;
  const pctChange = ((current - avgPrevious) / avgPrevious) * 100;
  if (pctChange > 5) return { status: 'up', change: pctChange.toFixed(1) };
  if (pctChange < -5) return { status: 'down', change: pctChange.toFixed(1) };
  return { status: 'neutral', change: pctChange.toFixed(1) };
}
