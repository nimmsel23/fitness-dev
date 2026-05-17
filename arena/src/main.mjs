import "./style.css";
import { renderSkeleton } from "./skeleton-generator.mjs";
import { computeDailyCoverage, renderCoverageRing } from "./coverage-calculator.mjs";
import { normalizeLogEntry } from "./log-form.mjs";
import { createArenaApp } from "./alpine-app.mjs";

const STORAGE_KEY = "muscle_arena_logs_v1";
const BASE_URL = import.meta.env.BASE_URL || "/";

const state = {
  anatomy: null,
  exerciseDb: null,
  logs: [],
  syncMode: "boot",
  groupCoverage: {},
  muscleCoverage: {},
  exerciseLookup: new Map(),
  mappingsByExercise: new Map(),
  muscleExerciseRank: new Map(),
  groupToMuscles: new Map(),
  muscleById: new Map(),
};

const $ = (selector) => document.querySelector(selector);
const todayIso = () => new Date().toISOString().slice(0, 10);

function appUrl(relPath) {
  const clean = String(relPath || "").replace(/^\/+/, "");
  return `${BASE_URL}${clean}`;
}

function apiUrl(relPath) {
  const clean = String(relPath || "").replace(/^\/+/, "");
  return new URL(`../../${clean}`, window.location.href).toString();
}

function normalizeKey(value) {
  return String(value || "")
    .trim()
    .toLowerCase()
    .replace(/\s+/g, " ");
}

// clamp01 moved to coverage-calculator.mjs

function readLogs() {
  try {
    return JSON.parse(localStorage.getItem(STORAGE_KEY) || "[]");
  } catch {
    return [];
  }
}

function writeLogs(logs) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(logs));
}

// setSyncStatus removed - now handled by Alpine.js reactive syncStatus property

// normalizeLogEntry moved to log-form.mjs

// toSessionExercise moved to log-form.mjs

async function loadTodayLogsFromServer() {
  const date = todayIso();
  const response = await fetch(apiUrl(`session?date=${encodeURIComponent(date)}`), { cache: "no-store" });
  if (response.status === 404) return [];
  if (!response.ok) throw new Error(`session load failed: ${response.status}`);
  const payload = await response.json();
  if (!payload?.ok) throw new Error(String(payload?.error || "session load failed"));
  const exercises = Array.isArray(payload?.data?.exercises) ? payload.data.exercises : [];
  const today = todayIso();
  return exercises.map((exercise) =>
    normalizeLogEntry(
      {
        ...exercise,
        date,
        ts: payload?.mtime || new Date().toISOString(),
        exercise: exercise?.name || exercise?.id || "",
        exercise_id: exercise?.id || "",
      },
      today
    )
  );
}

// saveTodayLogsToServer moved to log-form.mjs

async function loadJson(path) {
  const response = await fetch(path, { cache: "no-store" });
  if (!response.ok) throw new Error(`Failed loading ${path}: ${response.status}`);
  return response.json();
}

function buildExerciseLookup(exerciseIndex) {
  const map = new Map();
  (exerciseIndex || []).forEach((exercise) => {
    const keys = [exercise?.id, exercise?.name_en, exercise?.name_de].filter(Boolean);
    keys.forEach((key) => map.set(normalizeKey(key), exercise));
  });
  return map;
}

function buildMappingsByExercise(mappings) {
  const map = new Map();
  (mappings || []).forEach((item) => {
    const exerciseId = String(item?.exercise_id || "");
    if (!exerciseId) return;
    if (!map.has(exerciseId)) map.set(exerciseId, []);
    map.get(exerciseId).push(item);
  });
  return map;
}

function buildMuscleExerciseRank(exerciseIndex, mappings) {
  const exerciseMap = new Map((exerciseIndex || []).map((exercise) => [exercise.id, exercise]));
  const scoreByMuscle = new Map();

  (mappings || []).forEach((item) => {
    const muscleId = String(item?.muscle_id || "");
    const exerciseId = String(item?.exercise_id || "");
    if (!muscleId || !exerciseId) return;
    if (!scoreByMuscle.has(muscleId)) scoreByMuscle.set(muscleId, new Map());
    const target = scoreByMuscle.get(muscleId);
    target.set(exerciseId, (target.get(exerciseId) || 0) + Number(item?.weight || 0));
  });

  const result = new Map();
  for (const [muscleId, scores] of scoreByMuscle.entries()) {
    const ranked = [...scores.entries()]
      .sort((a, b) => b[1] - a[1])
      .slice(0, 30)
      .map(([exerciseId, score]) => {
        const exercise = exerciseMap.get(exerciseId) || {};
        return {
          id: exerciseId,
          score,
          name_de: exercise.name_de || exercise.name_en || exerciseId,
          name_en: exercise.name_en || exercise.name_de || exerciseId,
        };
      });
    result.set(muscleId, ranked);
  }
  return result;
}

function buildGroupToMuscles(anatomy) {
  const map = new Map();
  (anatomy?.muscles || []).forEach((muscle) => {
    const groupId = muscle?.group;
    if (!groupId) return;
    if (!map.has(groupId)) map.set(groupId, []);
    map.get(groupId).push(muscle);
  });
  return map;
}

function resolveExercise(exerciseInput) {
  return state.exerciseLookup.get(normalizeKey(exerciseInput)) || null;
}

function inferGroupFromExerciseId(exerciseId) {
  if (!exerciseId) return "";
  const mappings = state.mappingsByExercise.get(exerciseId) || [];
  if (!mappings.length) return "";

  const scoreByGroup = new Map();
  mappings.forEach((item) => {
    const muscle = state.muscleById.get(item.muscle_id);
    const groupId = muscle?.group;
    if (!groupId) return;
    scoreByGroup.set(groupId, (scoreByGroup.get(groupId) || 0) + Number(item.weight || 0));
  });

  return [...scoreByGroup.entries()].sort((a, b) => b[1] - a[1])[0]?.[0] || "";
}

// computeDailyCoverage moved to coverage-calculator.mjs (now called with params)

// renderCoverageRing moved to coverage-calculator.mjs (now called with params)

// renderTodayLog removed - now handled by Alpine.js reactive todayLogs computed property

// fillGroupSelect removed - now handled by Alpine.js x-for over muscleGroups computed property

// fillExerciseDatalist removed - now handled by Alpine.js exerciseOptions computed property

// findBestMuscleInGroup moved to alpine-app.mjs (used in onGroupChange)

// showMuscleInfo moved to alpine-app.mjs (reactive muscleInfo state)

function renderScene() {
  const { muscleCoverage, groupCoverage } = computeDailyCoverage({
    logs: state.logs,
    anatomy: state.anatomy,
    mappingsByExercise: state.mappingsByExercise,
    groupToMuscles: state.groupToMuscles,
    dateFilter: todayIso(),
  });

  state.muscleCoverage = muscleCoverage;
  state.groupCoverage = groupCoverage;

  renderCoverageRing(groupCoverage, state.anatomy?.muscle_groups || [], {
    ring: $("#coverageRingFg"),
    scoreText: $("#coverageScore"),
  });

  renderSkeleton({
    root: $("#skeletonRoot"),
    anatomy: state.anatomy,
    coverageByMuscle: muscleCoverage,
    onMuscleClick: ({ muscleId }) => {
      // Call Alpine.js method via custom event
      const alpineComponent = document.querySelector('[x-data]');
      if (alpineComponent && alpineComponent.__x) {
        alpineComponent.__x.$data.showMuscleInfo(muscleId);
      }
    },
  });
}

// bindEvents removed - now handled by Alpine.js (@click, @submit, @change directives)

async function init() {
  // Load data
  const [anatomy, exerciseDb] = await Promise.all([
    loadJson(appUrl("data/anatomy.json")),
    loadJson(appUrl("data/exercise-muscle-db.json")).catch(() => ({ exercise_index: [], mappings: [] })),
  ]);

  // Server sync attempt
  try {
    state.logs = await loadTodayLogsFromServer();
    state.syncMode = "server";
    writeLogs(state.logs);
  } catch (error) {
    state.logs = readLogs();
    state.syncMode = "local";
    console.warn("[muscle-arena] server unavailable, using local fallback", error);
  }

  // Build state indexes
  state.anatomy = anatomy;
  state.exerciseDb = exerciseDb;
  state.groupToMuscles = buildGroupToMuscles(anatomy);
  state.muscleById = new Map((anatomy?.muscles || []).map((muscle) => [muscle.id, muscle]));
  state.exerciseLookup = buildExerciseLookup(exerciseDb?.exercise_index || []);
  state.mappingsByExercise = buildMappingsByExercise(exerciseDb?.mappings || []);
  state.muscleExerciseRank = buildMuscleExerciseRank(exerciseDb?.exercise_index || [], exerciseDb?.mappings || []);

  // Register Alpine.js component globally
  window.arenaApp = () =>
    createArenaApp({
      state,
      resolveExercise,
      inferGroup: inferGroupFromExerciseId,
      apiUrl,
      todayIso,
      writeLogs,
      onLogAdded: () => renderScene(),
    });

  // Initial render
  renderScene();

  // Show initial muscle info (first group's best muscle)
  const firstGroup = state.anatomy?.muscle_groups?.[0]?.id;
  if (firstGroup) {
    setTimeout(() => {
      const alpineComponent = document.querySelector('[x-data]');
      if (alpineComponent && alpineComponent.__x) {
        const candidates = state.groupToMuscles.get(firstGroup) || [];
        if (candidates.length) {
          const best = candidates
            .slice()
            .sort((a, b) => (state.muscleCoverage[b.id] || 0) - (state.muscleCoverage[a.id] || 0))[0];
          if (best) alpineComponent.__x.$data.showMuscleInfo(best.id);
        }
      }
    }, 100);
  }

  // Register service worker
  if ("serviceWorker" in navigator) {
    navigator.serviceWorker.register(appUrl("sw.js"), { scope: BASE_URL }).catch(() => {});
  }
}

init().catch((error) => {
  const root = $("#skeletonRoot");
  if (root) {
    root.innerHTML = `<div class="rounded-xl border border-red-500/40 bg-red-900/20 p-4 text-red-200">Init error: ${String(error.message || error)}</div>`;
  }
  console.error(error);
});
