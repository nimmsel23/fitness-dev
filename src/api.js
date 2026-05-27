const BASE = import.meta.env.VITE_API_BASE || ''

function apiFetch(url, opts) {
  const fn = window.aosOfflineQueue?.fetch ?? fetch
  return fn(url, opts)
}

export const api = {
  async get(path) {
    const res = await apiFetch(BASE + path, { cache: 'no-store' })
    if (!res.ok && !res.headers?.get?.('X-Source')?.startsWith('offline'))
      throw new Error(`GET ${path} → ${res.status}`)
    return res.json()
  },
  async post(path, data) {
    const res = await apiFetch(BASE + path, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    })
    // 202 = offline-queued, das ist ok
    if (!res.ok && res.status !== 202) throw new Error(`POST ${path} → ${res.status}`)
    return res.json()
  }
}

export function localToday() {
  const d = new Date()
  return `${d.getFullYear()}-${String(d.getMonth()+1).padStart(2,'0')}-${String(d.getDate()).padStart(2,'0')}`
}

export function getWeekDates() {
  const today = localToday()
  const d = new Date(today + 'T12:00:00')
  const off = (d.getDay() + 6) % 7
  d.setDate(d.getDate() - off)
  return Array.from({ length: 7 }, (_, i) => {
    const x = new Date(d)
    x.setDate(d.getDate() + i)
    return `${x.getFullYear()}-${String(x.getMonth()+1).padStart(2,'0')}-${String(x.getDate()).padStart(2,'0')}`
  })
}

export function parseQuick(raw) {
  if (!raw?.trim()) return null
  const name = raw.replace(/[\d@x\s].*/i, '').trim() || raw.trim()
  const setsMatch = raw.match(/(\d+)\s*[xX×]\s*(\d+)/)
  const weightMatch = raw.match(/@(\d+(?:\.\d+)?)/)
  const rpeMatch = raw.match(/rpe\s*(\d+(?:\.\d+)?)/i)
  return {
    name,
    sets: setsMatch ? parseInt(setsMatch[1]) : 3,
    reps: setsMatch ? parseInt(setsMatch[2]) : 10,
    weight: weightMatch ? parseFloat(weightMatch[1]) : null,
    note: rpeMatch ? `RPE ${rpeMatch[1]}` : '',
    primaryMuscles: [],
    secondaryMuscles: [],
  }
}

export function downloadText(filename, text, mime = 'text/plain;charset=utf-8') {
  const blob = new Blob([text], { type: mime })
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url
  a.download = filename
  document.body.appendChild(a)
  a.click()
  a.remove()
  URL.revokeObjectURL(url)
}

// ── Coverage Logic ───────────────────────────────────────────────────────────

const MUSCLE_GROUPS = {
  chest: ["pecs", "chest", "pectoralis", "brust"],
  back: ["lats", "traps", "lower back", "back", "latissimus", "trapezius", "rhomboids", "rücken", "pull-up", "klimmzug", "rudern", "row"],
  shoulders: ["shoulders", "delts", "deltoid", "schulter", "schultern", "overhead", "press"],
  arms: ["biceps", "triceps", "forearms", "brachii", "bizeps", "trizeps", "arm", "arme", "curl", "extension"],
  core: ["abs", "obliques", "core", "abdominis", "bauch"],
  glutes: ["glutes", "gluteus", "po", "gesäß", "hip thrust"],
  quads: ["quads", "quadriceps", "oberschenkel", "squat", "kniebeuge"],
  hamstrings: ["hamstrings", "biceps femoris", "beinbeuger", "leg curl"],
  calves: ["calves", "gastrocnemius", "waden", "calf"],
  legs: ["legs", "squat", "deadlift", "lunge", "beine", "bein", "leg press"]
};

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
  
  const [exRes, histRes] = await Promise.all([
    api.get('/fitness/exercises/all').catch(() => ({ exercises: [] })),
    api.get('/session/history?limit=120').catch(() => ({ sessions: [] }))
  ]);

  const kbExercises = exRes.exercises || [];
  const history = histRes.sessions || [];

  const kbMap = new Map();
  kbExercises.forEach(ex => {
    kbMap.set((ex.display_name || ex.name || ex.exercise_id).toLowerCase(), ex);
  });

  const historyWithMuscles = history.map(s => {
    const groups = new Set();
    for (const ex of (s.exercises || [])) {
      if (!ex.done) continue;
      const kbEx = kbMap.get((ex.name || "").toLowerCase());
      const primary = kbEx?.primary_muscles || kbEx?.primaryMuscles || ex.primaryMuscles || [];
      const secondary = kbEx?.secondary_muscles || kbEx?.secondaryMuscles || ex.secondaryMuscles || [];
      [...primary, ...secondary].forEach(m => {
        muscleToGroupIds(m, ex.name).forEach(gid => groups.add(gid));
      });
    }
    return { date: s.date, groups: Array.from(groups) };
  }).sort((a, b) => b.date.localeCompare(a.date));

  const sessions = [];
  let totalVolume = 0;
  let entriesCount = 0;
  const muscleScores = {};
  const bodyRegionScores = {};
  const topExMap = {};

  for (const date of dates) {
    const sess = history.find(h => h.date === date);
    if (!sess) continue;
    
    const blockName = sess.block || sess.trainingsart || "Training";
    let sessVolume = 0;
    let hasDoneExercises = false;
    const sessGroupsCount = {};

    for (let ex of (sess.exercises || [])) {
      if (!ex.done) continue;
      
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

      [...primary, ...secondary].forEach(m => {
        muscleToGroupIds(m, exName).forEach(gid => {
           sessGroupsCount[gid] = (sessGroupsCount[gid] || 0) + 1;
        });
      });

      for (const m of primary) {
        muscleToGroupIds(m, exName).forEach(gid => {
          muscleScores[m] = (muscleScores[m] || 0) + 1;
          bodyRegionScores[gid] = (bodyRegionScores[gid] || 0) + 1;
        });
      }
      for (const m of secondary) {
        muscleToGroupIds(m, exName).forEach(gid => {
          bodyRegionScores[gid] = (bodyRegionScores[gid] || 0) + 0.5;
        });
      }
    }

    if (hasDoneExercises || sess.block || sess.activity) {
      const sortedGroups = Object.entries(sessGroupsCount).sort((a, b) => b[1] - a[1]);
      let autoSplit = sess.block || sess.trainingsart || "Training";
      if (!sess.block && sortedGroups.length > 0) {
        autoSplit = sortedGroups[0][0].charAt(0).toUpperCase() + sortedGroups[0][0].slice(1);
      }

      if (sess.activity && ACTIVITY_MUSCLE_MAPPING[sess.activity.type]) {
        const act = ACTIVITY_MUSCLE_MAPPING[sess.activity.type];
        act.muscles.forEach(gid => {
           sessGroupsCount[gid] = (sessGroupsCount[gid] || 0) + 1;
           bodyRegionScores[gid] = (bodyRegionScores[gid] || 0) + 1;
        });
      }

      const muscleRecovery = {};
      for (const gid of Object.keys(sessGroupsCount)) {
        const lastSessionWithGroup = historyWithMuscles.find(h => h.date < date && h.groups.includes(gid));
        if (lastSessionWithGroup) {
          const d1 = new Date(date);
          const d2 = new Date(lastSessionWithGroup.date);
          muscleRecovery[gid] = Math.round((d1 - d2) / (1000 * 60 * 60));
        }
      }

      totalVolume += sessVolume;
      sessions.push({ 
        ...sess, 
        block: autoSplit, 
        total_volume: sessVolume, 
        exercise_count: sess.exercises?.length || 0,
        muscle_recovery: muscleRecovery
      });
    }
  }

  const allGroups = ["chest", "back", "shoulders", "arms", "core", "glutes", "quads", "hamstrings", "calves", "legs"];
  const gaps = allGroups.filter(g => (bodyRegionScores[g] || 0) < 1);
  const low = allGroups.filter(g => bodyRegionScores[g] > 0 && bodyRegionScores[g] < 3);

  return {
    ok: true,
    week: selector,
    session_count: sessions.length,
    entries_count: entriesCount,
    total_volume: totalVolume,
    sessions: sessions.reverse(),
    muscle_scores: muscleScores,
    body_region_scores: bodyRegionScores,
    missing_regions: gaps,
    low_regions: low,
    top_exercises: Object.entries(topExMap).sort((a, b) => b[1] - a[1]).map(([name, count]) => ({ display_name: name, count })),
    recommendations: gaps.length > 0 ? [`Fokus auf: ${gaps.join(", ")}`] : ["Woche perfekt abgedeckt!"]
  };
}
