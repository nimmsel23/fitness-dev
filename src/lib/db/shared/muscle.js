/**
 * shared/muscle.js — Muscle-group constants & mapping helpers.
 * Source of Truth: Reads regions and muscle-mappings directly from the loaded KB.
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

// Map aller aus der KB geladenen Muskeln & Regionen
let _kbMuscles = new Map();
let _kbRegions = new Map();

/**
 * Befüllt die Muskeln & Regionen direkt aus den KB-Dokumenten.
 */
export function setKBMuscles(musclesList) {
  _kbMuscles.clear();
  _kbRegions.clear();
  for (const m of Array.isArray(musclesList) ? musclesList : []) {
    const id = String(m.id || m.muscle_id || "");
    if (!id) continue;
    _kbMuscles.set(id, m);

    // Haupt-Regionen-Dokumente aus der KB (z.B. chest.yml, back.yml, shoulders.yml)
    if (m.highlight_ids || m.muscles || m.is_region || !m.region) {
      const regionId = m.region || id;
      _kbRegions.set(regionId, m.label_de || m.display_name || regionId);
    }
  }
}

/** Gibt alle in der KB deklarierten Regionen mit Label zurück. */
export function getMuscleGroups() {
  return Array.from(_kbRegions.entries()).map(([id, label]) => ({ id, label }));
}

/**
 * Liest die Region einer Muskel-ID direkt aus den KB-Daten.
 */
export function muscleToRegion(muscle) {
  const id = String(muscle || "").trim();
  if (!id) return null;

  // 1. Ist bereits selbst eine KB-Region
  if (_kbRegions.has(id)) return id;

  // 2. Direkt aus dem KB-Muskel-Dokument lesen
  const doc = _kbMuscles.get(id);
  if (doc?.region) return doc.region;

  return id;
}

export function muscleToGroupIds(muscle) {
  const region = muscleToRegion(muscle);
  return region ? [region] : [];
}
