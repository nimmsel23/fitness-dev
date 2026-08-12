import { canonicalMuscleId, splitMuscleEntries } from "../../translations.js";

const GENERIC_REGION_REASSIGNMENT = [
  [/external rotation|internal rotation|au(ss|ß)enrotation|innenrotation|rotator ?cuff/i, "304_rotator_cuff"],
  [/rear|reverse|posterior|face.?pull|hintere schulter|vorgebeugt|rückwärt/i, "303_posterior_deltoid"],
  [/lateral raise|side raise|seitheben|upright row/i, "302_lateral_deltoid"],
  [/front raise|frontheben|shoulder press|overhead press|arnold press|schulterdr(ü|ue)cken/i, "301_anterior_deltoid"],
];

function toArray(value) {
  if (Array.isArray(value)) return value;
  if (value == null || value === "") return [];
  return [value];
}

export function normalizeExerciseMuscleId(raw) {
  const value = String(raw || "").trim();
  if (!value) return "";
  return canonicalMuscleId(value);
}

function refineGenericRegionLabels(muscleIds, ...nameVariants) {
  const names = nameVariants.filter(Boolean).join(" ");
  const genericShoulders = new Set(["shoulders", "300_shoulders"]);
  if (!muscleIds.some((muscleId) => genericShoulders.has(muscleId))) return muscleIds;
  for (const [pattern, replacement] of GENERIC_REGION_REASSIGNMENT) {
    if (pattern.test(names)) {
      return muscleIds.map((muscleId) => (genericShoulders.has(muscleId) ? replacement : muscleId));
    }
  }
  return muscleIds;
}

export function normalizeExerciseMuscleList(rawList, ...nameVariants) {
  const normalized = [];
  for (const raw of splitMuscleEntries(toArray(rawList))) {
    const value = normalizeExerciseMuscleId(raw);
    if (value && !normalized.includes(value)) normalized.push(value);
  }
  return refineGenericRegionLabels(normalized, ...nameVariants);
}

export function normalizeExerciseRecord(rawEx = {}) {
  const displayName =
    rawEx.displayName ||
    rawEx.display_name ||
    rawEx.name ||
    rawEx.german ||
    rawEx.exercise_id ||
    rawEx.id ||
    "Übung";
  const id = rawEx.id || rawEx.exercise_id || null;
  const nameVariants = [
    displayName,
    rawEx.german,
    rawEx.english,
    rawEx.name,
    rawEx.exercise_id,
    rawEx.id,
  ];
  const primaryMuscles = normalizeExerciseMuscleList(rawEx.primaryMuscles || rawEx.primary_muscles, ...nameVariants);
  const secondaryMuscles = normalizeExerciseMuscleList(rawEx.secondaryMuscles || rawEx.secondary_muscles, ...nameVariants);
  const stabilizers = normalizeExerciseMuscleList(rawEx.stabilizers, ...nameVariants);

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
