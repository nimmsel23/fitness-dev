import { Footprints, Bike, Waves, Activity, Mountain, Anchor, Leaf, Zap } from "lucide-react";

export const BLOCK_COLORS = {
  // Strength splits
  push:       "#f472b6",
  pull:       "#34d399",
  legs:       "#fb923c",
  upper:      "#38bdf8",
  lower:      "#a78bfa",
  full:       "#fbbf24",
  // Cardio / Endurance — all use orange family to be visually distinct from strength
  running:    "#f97316",  // orange
  cycling:    "#fb923c",  // orange-400
  swimming:   "#38bdf8",  // sky (water)
  hiking:     "#4ade80",  // green (nature)
  rowing:     "#22d3ee",  // cyan
  climbing:   "#a78bfa",  // violet
  yoga:       "#bd93f9",  // soft purple
  stretching: "#e879f9",  // fuchsia
  hiit:       "#ef4444",  // red (intensity)
  walking:    "#86efac",  // soft green
};

export const ACTIVITY_LABELS = {
  running:    "Laufen",
  cycling:    "Radfahren",
  swimming:   "Schwimmen",
  hiking:     "Wandern",
  rowing:     "Rudern",
  climbing:   "Klettern",
  yoga:       "Yoga",
  stretching: "Stretching",
  hiit:       "HIIT",
  walking:    "Spazieren",
};

export const ACTIVITY_EMOJI = {
  running:    "🏃",
  cycling:    "🚴",
  swimming:   "🏊",
  hiking:     "🥾",
  rowing:     "🚣",
  climbing:   "🧗",
  yoga:       "🧘",
  stretching: "🤸",
  hiit:       "⚡",
  walking:    "🚶",
};

export const ACTIVITY_ICONS = {
  running:    Footprints,
  cycling:    Bike,
  swimming:   Waves,
  hiking:     Mountain,
  rowing:     Anchor,
  climbing:   Mountain,
  yoga:       Leaf,
  stretching: Activity,
  hiit:       Zap,
  walking:    Footprints,
};

// Default muscle target per activity type — used in ActivityAddon + server coverage
export const ACTIVITY_MUSCLE_DEFAULTS = {
  hiit:       'core',
  stretching: 'full',
  yoga:       'full',
  running:    'legs',
  cycling:    'legs',
  rowing:     'full',
  walking:    'legs',
  hiking:     'legs',
  climbing:   'full',
  swimming:   'full',
};

// Muscle groups per target key — mirrors server.mjs muscleToGroupId keys
export const MUSCLE_TARGET_GROUPS = {
  core:  ['core'],
  legs:  ['quadriceps', 'hamstrings', 'glutes', 'calves'],
  full:  ['chest', 'back', 'shoulders', 'arms', 'core', 'quadriceps', 'hamstrings', 'glutes'],
};

// Single source of truth: welche Muskelgruppen jede Cardio-/Activity-Art trifft.
// Wird von MuscleBody (Dashboard), Muscles-View und analysis.js (Coverage) genutzt.
// Swimming = Brustschwimmen (Pec-Zug + Froschkick) — nicht Kraul.
export const ACTIVITY_MUSCLE_GROUPS = {
  swimming:   ["chest", "shoulders", "arms", "core", "quadriceps", "hamstrings"], // Default = Brustschwimmen
  running:    ["quadriceps", "hamstrings", "calves", "glutes"],
  cycling:    ["quadriceps", "hamstrings", "calves", "glutes"],
  hiking:     ["quadriceps", "hamstrings", "calves", "glutes", "core"],
  walking:    ["quadriceps", "calves", "glutes"],
  rowing:     ["back", "shoulders", "arms", "quadriceps", "hamstrings", "core"],
  yoga:       ["core", "shoulders", "back"],
  stretching: ["core", "back", "hamstrings"],
  climbing:   ["back", "shoulders", "arms", "core", "quadriceps"],
  hiit:       ["core", "quadriceps", "shoulders"],
  boxing:     ["shoulders", "arms", "core", "quadriceps"],
};

// Schwimmstil-Varianten — überschreiben das swimming-Default je nach Stil.
export const SWIM_STYLE_MUSCLES = {
  breast: ["chest", "shoulders", "arms", "core", "quadriceps", "hamstrings"], // Brustschwimmen
  back:   ["back", "shoulders", "arms", "core", "quadriceps"],                // Rückenschwimmen
};

/**
 * Returns a CSS color string for a given session.
 * - If sessionMode === 'cardio', uses orange as a general cardio color
 *   (or the specific activity-type color if available).
 * - Falls back to block-name lookup for strength sessions.
 */
export function getBlockColor(block, activity, sessionMode) {
  // Prefer specific activity-type color
  if (activity?.type && BLOCK_COLORS[activity.type]) return BLOCK_COLORS[activity.type];
  // General cardio fallback (orange)
  if (sessionMode === 'cardio') return "#f97316";
  if (!block) return "var(--accent)";
  for (const [key, color] of Object.entries(BLOCK_COLORS)) {
    if (block.toLowerCase().includes(key)) return color;
  }
  return "var(--accent)";
}
