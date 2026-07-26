/**
 * shared/muscle.js — Muscle-group constants & mapping helpers.
 * Used by both local/analysis.js and firestore/analysis.js.
 *
 * Coverage-Gruppe = die Muskel-ID selbst (z.B. "206_erector_spinae") — dafür
 * gibt es die Detail-Muskel-Files, keine Reduktion auf wger_id oder Region.
 * wger_id ist reines Catalog-Detail (wger-Import/-Abgleich in Python), nie
 * eine Gruppierung im Frontend-Code.
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

/** Alle aktuell bekannten Muskel-IDs + Anzeigename (für Gap-Report-Labels). */
export function getMuscleGroups() {
  const labels = _vizMap?.labels || {};
  return Object.keys(labels).map((id) => ({ id, label: labels[id] || id }));
}

/** Coverage-Gruppe einer Muskel-ID: die ID selbst, keine Reduktion. */
export function muscleToGroupIds(muscle) {
  const id = String(muscle || "").trim();
  return id ? [id] : [];
}

/**
 * Region-Wort einer Muskel-ID (z.B. "chest", "back") — aus den Top-Level-
 * Regionsdateien (kb/muscles/*.yml) abgeleitet, live geladen. Dasselbe Wort
 * wie ACTIVITY_MUSCLE_GROUPS.
 */
export function muscleToRegion(muscle) {
  const id = String(muscle || "").trim();
  return (id && _vizMap?.region?.[id]) || null;
}

/**
 * Region-Wort (aus ACTIVITY_MUSCLE_GROUPS) -> alle Muskel-IDs dieser Region.
 * Verbindet Cardio-Aktivitäten (kennen nur das grobe Wort) mit der
 * muskel-ID-genauen Coverage-Gruppierung — reiner Lookup im schon geladenen
 * region-Dict, keine eigene Tabelle.
 */
export function regionToGroupIds(region) {
  const regionMap = _vizMap?.region || {};
  const ids = [];
  for (const [muscleId, r] of Object.entries(regionMap)) {
    if (r === region) ids.push(muscleId);
  }
  return ids;
}
