/**
 * shared/parse.js — parseQuick: text input parser for quick exercise entry.
 * Mode-agnostic: works in both local and firebase builds.
 */

/**
 * Parses a quick-entry string like "3x10 @80 rpe7" into an exercise object.
 * Returns null for empty/invalid input.
 *
 * @example
 *   parseQuick("Squat 4x8 @100 rpe8")
 *   // → { name: "Squat", setsArray: [{reps:"8",weight:"100"}, ...], note:"RPE 8", ... }
 */
export function parseQuick(raw) {
  if (!raw?.trim()) return null;
  const name = raw.replace(/[\d@x\s].*/i, "").trim() || raw.trim();
  const setsMatch = raw.match(/(\d+)\s*[xX×]\s*(\d+)/);
  const weightMatch = raw.match(/@(\d+(?:\.\d+)?)/);
  const rpeMatch = raw.match(/rpe\s*(\d+(?:\.\d+)?)/i);
  const count = setsMatch ? parseInt(setsMatch[1]) : 1;
  const reps = setsMatch ? setsMatch[2] : "";
  const weight = weightMatch ? weightMatch[1] : "";
  return {
    name,
    setsArray: Array.from({ length: count }, () => ({ reps, weight })),
    note: rpeMatch ? `RPE ${rpeMatch[1]}` : "",
    primaryMuscles: [],
    secondaryMuscles: [],
  };
}
