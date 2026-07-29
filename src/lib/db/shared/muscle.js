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

// Freitext-Fallback: Sessions/Suchresultate speichern primaryMuscles/
// secondaryMuscles teils als lesbare Gruppennamen ("Quads", "Shoulders")
// statt kanonischer KB-IDs. Ohne diese Normalisierung landet so ein Eintrag
// unverändert als "Region" (siehe muscleToRegion()-Fallback unten) — ein Key,
// den keine Coverage-Abfrage kennt — und die Muskelgruppe erscheint
// fälschlich als "nicht trainiert", obwohl Sessions dafür existieren.
const FREE_TEXT_MUSCLE_ALIASES = {
  chest: "chest", pec: "chest", pectoralis: "chest",
  back: "back", lat: "back", lats: "back", latissimus: "back", trap: "back", traps: "back", rhomboid: "back",
  shoulders: "shoulders", shoulder: "shoulders", delt: "shoulders", delts: "shoulders", deltoid: "shoulders",
  arms: "arms", arm: "arms", bicep: "arms", biceps: "arms", tricep: "arms", triceps: "arms", forearm: "arms",
  core: "core", abs: "core", ab: "core", obliques: "core",
  glutes: "glutes", glute: "glutes", gluteal: "glutes", gluteus: "glutes",
  quadriceps: "quadriceps", quad: "quadriceps", quads: "quadriceps", legs: "quadriceps", leg: "quadriceps",
  hamstrings: "hamstrings", hamstring: "hamstrings",
  calves: "calves", calf: "calves", gastrocnemius: "calves",
};

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
    const label = doc.label_de || doc.display_name || regionId;
    _kbRegions.set(regionId, label);
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

  // 3. Freitext-Fallback (nur wenn die aufgelöste Region tatsächlich aus der
  // KB registriert ist — sonst wie bisher unverändert zurückgeben).
  const alias = FREE_TEXT_MUSCLE_ALIASES[id.toLowerCase()];
  if (alias && _kbRegions.has(alias)) return alias;

  return id;
}

export function muscleToGroupIds(muscle) {
  const region = muscleToRegion(muscle);
  return region ? [region] : [];
}
