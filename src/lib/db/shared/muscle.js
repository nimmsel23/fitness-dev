/**
 * shared/muscle.js — Muscle-group constants & mapping helpers.
 * Used by both local/analysis.js and firestore/analysis.js.
 *
 * Coverage-Bucket = die Region (z.B. "back", "chest") — für Klienten
 * verständlich, keine Einzelmuskelnamen im Coverage/Review-Tab. Die Region
 * kommt live aus der KB (`region:`-Feld jeder Muskel-Datei), keine
 * hartcodierte Tabelle. Details bleiben Sache des Learn-Tabs.
 */

import { ACTIVITY_MUSCLE_GROUPS } from "../../../constants/ActivityConstants.js";

/** Impact factor per activity type when computing coverage scores. */
const ACTIVITY_IMPACT = { hiking: 1.0, running: 1.0, cycling: 0.8, swimming: 0.7 };

/**
 * Maps an activity-type key → { muscles: string[], impact: number }.
 * Built from ActivityConstants so there is a single source of truth.
 */
export const ACTIVITY_MUSCLE_MAPPING = Object.fromEntries(
  Object.entries(ACTIVITY_MUSCLE_GROUPS).map(([k, muscles]) => [
    k,
    { muscles, impact: ACTIVITY_IMPACT[k] ?? 1.0 },
  ])
);

let _vizMap = null;

export function primeMuscleViz(viz) {
  if (viz && typeof viz === "object") _vizMap = viz;
}

export function hasMuscleViz() {
  return _vizMap != null;
}

/** Alle aktuell bekannten Regionen + Anzeigename (für Gap-Report-Labels). */
export function getMuscleGroups() {
  const labels = _vizMap?.region_labels || {};
  return Object.keys(labels).map((id) => ({ id, label: labels[id] || id }));
}

/** Region einer Muskel-ID (z.B. "chest", "back"), live aus der KB. */
export function muscleToRegion(muscle) {
  const id = String(muscle || "").trim();
  return (id && _vizMap?.region?.[id]) || null;
}

/** Coverage-Bucket einer Muskel-ID: ihre Region, live aus der KB. */
export function muscleToGroupIds(muscle) {
  const region = muscleToRegion(muscle);
  return region ? [region] : [];
}
