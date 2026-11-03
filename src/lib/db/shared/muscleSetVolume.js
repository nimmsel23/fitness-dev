import { muscleToGroupIds } from './muscle.js';

function positiveNumber(value) {
  const normalized = String(value ?? '').trim().replace(',', '.');
  const number = Number(normalized);
  return Number.isFinite(number) && number > 0 ? number : 0;
}

/** Counts logged working sets, excluding blank rows and warm-up sets. */
export function countWorkingSets(exercise) {
  const rows = Array.isArray(exercise?.setsArray) && exercise.setsArray.length
    ? exercise.setsArray
    : Array.isArray(exercise?.sets) && exercise.sets.length
      ? exercise.sets
      : null;

  if (rows) {
    return rows.filter((set) => {
      if (!set || /warm.?up/i.test(String(set.setType || ''))) return false;
      return positiveNumber(set.reps) > 0 || positiveNumber(set.weight) > 0;
    }).length;
  }

  // Older session records stored one prescription row as sets/reps/weight.
  if (!positiveNumber(exercise?.reps) && !positiveNumber(exercise?.weight)) return 0;
  return Math.min(20, Math.max(1, Math.floor(positiveNumber(exercise?.sets) || 1)));
}

/**
 * Adds performed sets by muscle region. Primary work counts as 1 set and
 * secondary work as 0.5 effective sets; stabilizers are intentionally omitted.
 */
export function addExerciseMuscleSetVolume(volume, exercise, kbExercise = null) {
  const sets = countWorkingSets(exercise);
  if (!sets) return 0;

  const primary = (exercise?.primaryMuscles?.length ? exercise.primaryMuscles : null)
    || kbExercise?.primary_muscles || kbExercise?.primaryMuscles || [];
  const secondary = (exercise?.secondaryMuscles?.length ? exercise.secondaryMuscles : null)
    || kbExercise?.secondary_muscles || kbExercise?.secondaryMuscles || [];
  const primaryRegions = new Set(primary.flatMap((muscle) => muscleToGroupIds(muscle)));
  const secondaryRegions = new Set(secondary.flatMap((muscle) => muscleToGroupIds(muscle)));
  const regions = new Set([...primaryRegions, ...secondaryRegions]);

  for (const region of regions) {
    const isPrimary = primaryRegions.has(region);
    const entry = volume[region] || { primary_sets: 0, secondary_sets: 0, effective_sets: 0 };
    if (isPrimary) entry.primary_sets += sets;
    else entry.secondary_sets += sets;
    entry.effective_sets += sets * (isPrimary ? 1 : 0.5);
    volume[region] = entry;
  }

  return regions.size ? 0 : sets;
}
