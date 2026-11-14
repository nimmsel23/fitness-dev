import { muscleToGroupIds } from './muscle.js';

// VitalOS bewertet NICHT das Volumen einer Session, sondern die Erholung
// zwischen den Sessions (One Set to Failure, Owner 2026-11-14).
// Darum zählt jede Übung als genau EINE Belastung je Muskelregion — egal ob
// ein Satz, drei Sätze oder ein Satz mit Dropsätzen geloggt wurde. Ein Satz
// ist nicht schlechter als zwei, im Gegenteil: mehr Sätze machen aus Kraft
// schnell Kraftausdauer und fressen Erholungszeit. Die Satzzahl dient nur
// noch als Warnschwelle (`high_volume_exercises`), nie als Belastungsmaß.
export const SETS_RECOVERY_WARN = 3;

function positiveNumber(value) {
  const normalized = String(value ?? '').trim().replace(',', '.');
  const number = Number(normalized);
  return Number.isFinite(number) && number > 0 ? number : 0;
}

function hasLoad(set) {
  return !!set && (positiveNumber(set.reps) > 0 || positiveNumber(set.weight) > 0);
}

function setRows(exercise) {
  if (Array.isArray(exercise?.setsArray) && exercise.setsArray.length) return exercise.setsArray;
  if (Array.isArray(exercise?.sets) && exercise.sets.length) return exercise.sets;
  return null;
}

/**
 * Geloggte Arbeitssätze, nur für die Volumen-Warnung. Leere Zeilen und
 * Aufwärmsätze zählen nicht; Dropsätze gehören zum Satz davor und zählen
 * nicht extra (ein Dropset-Block ist EIN Satz bis zum Versagen).
 */
export function countLoggedSets(exercise) {
  const rows = setRows(exercise);
  if (rows) {
    const worked = rows.filter((set) => hasLoad(set) && !/warm.?up/i.test(String(set.setType || '')));
    const normal = worked.filter((set) => !/drop/i.test(String(set.setType || ''))).length;
    return normal || (worked.length ? 1 : 0);
  }
  // Altformat: eine Vorgabezeile sets/reps/weight.
  if (!positiveNumber(exercise?.reps) && !positiveNumber(exercise?.weight)) return 0;
  return Math.min(20, Math.max(1, Math.floor(positiveNumber(exercise?.sets) || 1)));
}

/** HIT-Einheiten haben kein Satz/Wdh-Tracking: `isHIT` oder `done` reicht als Belastung. */
export function isLoggedExercise(exercise) {
  return countLoggedSets(exercise) > 0 || exercise?.isHIT === true || exercise?.done === true;
}

/**
 * Trägt eine Übung als Belastung je Muskelregion ein: direkt 1, indirekt 0,5.
 * Stabilisatoren bleiben bewusst außen vor. `high_volume_exercises` zählt
 * Übungen, die diese Region direkt trafen UND mehr als SETS_RECOVERY_WARN
 * Sätze hatten (Erholungswarnung). Gibt 1 zurück, wenn die Übung keiner Region
 * zugeordnet werden konnte (und sammelt sie dann in `unmappedExercises`).
 */
export function addExerciseMuscleLoad(volume, exercise, kbExercise = null, unmappedExercises = null) {
  if (!isLoggedExercise(exercise)) return 0;
  const sets = countLoggedSets(exercise);

  const primary = (exercise?.primaryMuscles?.length ? exercise.primaryMuscles : null)
    || kbExercise?.primary_muscles || kbExercise?.primaryMuscles || [];
  const secondary = (exercise?.secondaryMuscles?.length ? exercise.secondaryMuscles : null)
    || kbExercise?.secondary_muscles || kbExercise?.secondaryMuscles || [];
  const primaryRegions = new Set(primary.flatMap((muscle) => muscleToGroupIds(muscle)));
  const secondaryRegions = new Set(secondary.flatMap((muscle) => muscleToGroupIds(muscle)));
  const regions = new Set([...primaryRegions, ...secondaryRegions]);

  for (const region of regions) {
    const isPrimary = primaryRegions.has(region);
    const entry = volume[region] || { primary_hits: 0, secondary_hits: 0, effective_hits: 0, max_sets: 0, high_volume_exercises: 0 };
    if (isPrimary) {
      entry.primary_hits += 1;
      entry.max_sets = Math.max(entry.max_sets, sets);
      if (sets > SETS_RECOVERY_WARN) entry.high_volume_exercises += 1;
    } else {
      entry.secondary_hits += 1;
    }
    entry.effective_hits += isPrimary ? 1 : 0.5;
    volume[region] = entry;
  }

  if (regions.size) return 0;

  const id = String(exercise?.exercise_id || exercise?.id || exercise?.name || 'unbekannte Übung');
  if (unmappedExercises) {
    const existing = unmappedExercises[id];
    unmappedExercises[id] = {
      exercise_id: exercise?.exercise_id || exercise?.id || null,
      name: exercise?.name || exercise?.displayName || id,
      hits: (existing?.hits || 0) + 1,
    };
  }
  return 1;
}
