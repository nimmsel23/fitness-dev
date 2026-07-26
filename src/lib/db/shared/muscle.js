/**
 * shared/muscle.js — Muscle-group constants & mapping helpers.
 * Source of Truth: Evaluates top-level KB region files (quadriceps.yml, hamstrings.yml, etc.)
 * and maps muscle IDs via their declared `muscles: [...]` lists.
 */

import { ACTIVITY_MUSCLE_GROUPS } from "../../../constants/ActivityConstants.js";

/** Impact factor per activity type when computing coverage scores. */
const ACTIVITY_IMPACT = { hiking: 1.0, running: 1.0, cycling: 0.8, swimming: 0.7 };

export const ACTIVITY_MUSCLE_MAPPING = Object.fromEntries(
  Object.entries(ACTIVITY_MUSCLE_GROUPS).map(([k, muscles]) => [
    k,
    { muscles, impact: ACTIVITY_IMPACT[k] ?? 1.0 },
  ])
);

// In-Memory Speicher für KB-Regionen und die direkte Muskel-zu-Regionen Map
let _kbRegions = new Map(); // regionId -> label
let _muscleToRegionMap = new Map(); // muscleId -> regionId

/**
 * Registriert alle aus der KB geladenen Muskel-Dokumente.
 * Liest die `muscles: [...]` Listen aus den Regionen-Dateien (quadriceps.yml, chest.yml, etc.)
 * und verknüpft jeden Unter-Muskel direkt mit seiner Region.
 */
export function setKBMuscles(musclesList) {
  _kbRegions.clear();
  _muscleToRegionMap.clear();

  const docs = Array.isArray(musclesList) ? musclesList : [];

  // Pass 1: Regionen-Dokumente identifizieren (Dateien mit `muscles: [...]` Liste oder `highlight_ids`)
  for (const doc of docs) {
    const id = String(doc.id || doc.muscle_id || "");
    if (!id) continue;

    // Wenn das Dokument eine `muscles` Liste oder `highlight_ids` hat, ist es eine Regionen-Datei
    if (Array.isArray(doc.muscles) || doc.highlight_ids) {
      const regionId = doc.region || id;
      const label = doc.label_de || doc.display_name || regionId;
      _kbRegions.set(regionId, label);

      // Alle in der `muscles:` Liste deklarierten Muskel-IDs dieser Region zuweisen
      if (Array.isArray(doc.muscles)) {
        for (const subMuscleId of doc.muscles) {
          _muscleToRegionMap.set(String(subMuscleId), regionId);
        }
      }
    }

    // Wenn im Muskel-Dokument selbst eine `region` steht
    if (doc.region) {
      _muscleToRegionMap.set(id, doc.region);
    }
  }
}

/** Gibt alle registrierten Regionen (aus quadriceps.yml, hamstrings.yml, chest.yml etc.) zurück. */
export function getMuscleGroups() {
  return Array.from(_kbRegions.entries()).map(([id, label]) => ({ id, label }));
}

/**
 * Liest die Region einer Muskel-ID direkt aus dem KB-Mapping (aus muscles: [...] in *.yml).
 */
export function muscleToRegion(muscle) {
  const id = String(muscle || "").trim();
  if (!id) return null;

  // 1. Ist selbst eine Region
  if (_kbRegions.has(id)) return id;

  // 2. Aus dem KB-Mapping lesen (abgeleitet aus `muscles: [...]` in den *.yml Dateien)
  if (_muscleToRegionMap.has(id)) {
    return _muscleToRegionMap.get(id);
  }

  return id;
}

export function muscleToGroupIds(muscle) {
  const region = muscleToRegion(muscle);
  return region ? [region] : [];
}
