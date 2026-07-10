/**
 * shared/muscle.js — Muscle-group constants & mapping helpers.
 * Used by both local/analysis.js and firestore/analysis.js.
 */

import { muscleToGroups } from "../../muscleMapping.js";
import { ACTIVITY_MUSCLE_GROUPS } from "../../../constants/ActivityConstants.js";

/** Canonical list of body-region group IDs. */
export const MUSCLE_GROUPS = [
  "chest", "back", "shoulders", "arms", "core",
  "glutes", "quads", "hamstrings", "calves", "legs",
];

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

/**
 * Maps a raw muscle name + optional exercise name → array of group IDs.
 * Delegates to the canonical muscleMapping utility.
 */
export function muscleToGroupIds(muscle, exerciseName = "") {
  return muscleToGroups(muscle, exerciseName);
}
