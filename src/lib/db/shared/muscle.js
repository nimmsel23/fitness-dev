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

function regionIdFromDoc(doc) {
  const id = String(doc.region || doc.doc_id || doc.id || doc.muscle_id || "").trim();
  return id.includes("_") && /^\d/.test(id) ? id.split("_").slice(1).join("_") : id;
}

function bucketRank(doc) {
  const catalogId = String(doc.catalog_id || doc.id || "").trim();
  return /^\d00_/.test(catalogId) ? 1 : 0;
}

/**
 * Registriert alle aus der KB geladenen Muskel-Dokumente.
 * Liest die `muscles: [...]` Listen aus den Regionen-Dateien (quadriceps.yml, chest.yml, etc.)
 * und verknüpft jeden Unter-Muskel direkt mit seiner Region.
 */
export function setKBMuscles(musclesList) {
  _kbRegions.clear();
  _muscleToRegionMap.clear();

  const docs = Array.isArray(musclesList) ? musclesList : [];
  const regionDocs = docs
    .filter((doc) => Array.isArray(doc?.muscles) && (doc.kb_level === "region" || !doc.region || doc.region === doc.doc_id))
    .sort((a, b) => bucketRank(a) - bucketRank(b) || (a.muscles?.length || 0) - (b.muscles?.length || 0));

  for (const doc of regionDocs) {
    const regionId = regionIdFromDoc(doc);
    if (!regionId) continue;
    // Nur die x00-Top-Level-Gruppen (100_chest, 200_back, ...) sind echte
    // Coverage-Regionen. Alles andere mit einer eigenen muscles:-Liste
    // (rhomboids.yml, upper_back.yml, hamstrings.yml, ...) ist eine reine
    // Index/Registry-Ebene (aus den 16 yuhonas-Pseudo-Gruppen) — die soll
    // weiter unten muscleId -> regionId auflösen helfen, aber nicht selbst
    // als eigenständige Region in getMuscleGroups()/Coverage Gaps auftauchen.
    if (bucketRank(doc) === 1) {
      const label = doc.label_de || doc.display_name || regionId;
      _kbRegions.set(regionId, label);
    }
    for (const subMuscleId of doc.muscles) {
      const muscleId = String(subMuscleId);
      if (!_muscleToRegionMap.has(muscleId)) {
        _muscleToRegionMap.set(muscleId, regionId);
      }
    }
  }

  // Detail-Dateien liefern nur Fallback über ihren Ordner, falls eine neue
  // Detail-ID noch nicht in einer Top-Level-Region eingetragen wurde.
  for (const doc of docs) {
    const id = String(doc.id || doc.muscle_id || "").trim();
    const region = String(doc.region || "").trim();
    if (id && region && doc.kb_level === "muscle" && !_muscleToRegionMap.has(id)) {
      _muscleToRegionMap.set(id, region);
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
