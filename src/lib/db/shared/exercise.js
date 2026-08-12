import { canonicalMuscleId, splitMuscleEntries } from "../../translations.js";

const REGION_BUCKET_MAP = {
  100: "chest",
  200: "back",
  300: "shoulders",
  400: "arms",
  500: "core",
  600: "legs",
  700: "calves",
};

function toArray(value) {
  if (Array.isArray(value)) return value;
  if (value == null || value === "") return [];
  return [value];
}

function normalizeBucketId(id) {
  const match = String(id || "").match(/^(\d{3})_[a-z0-9_]+$/i);
  if (!match) return id;
  return REGION_BUCKET_MAP[Number(match[1])] || id;
}

export function normalizeExerciseMuscleId(raw) {
  const value = String(raw || "").trim();
  if (!value) return "";
  return normalizeBucketId(canonicalMuscleId(value));
}

export function normalizeExerciseMuscleList(rawList) {
  const normalized = [];
  for (const raw of splitMuscleEntries(toArray(rawList))) {
    const value = normalizeExerciseMuscleId(raw);
    if (value && !normalized.includes(value)) normalized.push(value);
  }
  return normalized;
}

export function normalizeExerciseRecord(rawEx = {}) {
  const primaryMuscles = normalizeExerciseMuscleList(rawEx.primaryMuscles || rawEx.primary_muscles);
  const secondaryMuscles = normalizeExerciseMuscleList(rawEx.secondaryMuscles || rawEx.secondary_muscles);
  const stabilizers = normalizeExerciseMuscleList(rawEx.stabilizers);
  const displayName =
    rawEx.displayName ||
    rawEx.display_name ||
    rawEx.name ||
    rawEx.german ||
    rawEx.exercise_id ||
    rawEx.id ||
    "Übung";
  const id = rawEx.id || rawEx.exercise_id || null;

  return {
    ...rawEx,
    id,
    exercise_id: rawEx.exercise_id || id,
    name: rawEx.name || displayName,
    displayName,
    display_name: rawEx.display_name || displayName,
    primaryMuscles,
    primary_muscles: primaryMuscles,
    secondaryMuscles,
    secondary_muscles: secondaryMuscles,
    stabilizers,
  };
}
