export const BLOCK_COLORS = {
  push: "#f472b6", pull: "#34d399", legs: "#fb923c",
  upper: "#38bdf8", lower: "#a78bfa", full: "#fbbf24",
  hiking: "#48c87a", running: "#e05060", cycling: "#38bdf8", swimming: "#5294e2"
};

// Kanonische Form eines Split-Tags für Vergleiche (Coach-Habit-Tracking,
// SplitPicker-Werte) — Kleinschreibung + Trim, "full body" -> "full", damit
// die zwei im Code parallel existierenden Vokabulare (SplitPicker: "Full",
// Wochenplan-Defaults: "Full Body") zusammenfallen.
export function normalizeBlock(block) {
  const b = String(block || "").trim().toLowerCase();
  if (!b) return "";
  if (b === "full body") return "full";
  return b;
}

export function blockColor(block, activity) {
  if (activity?.type && BLOCK_COLORS[activity.type]) return BLOCK_COLORS[activity.type];
  if (!block) return "var(--accent)";
  for (const [key, color] of Object.entries(BLOCK_COLORS)) {
    if (block.toLowerCase().includes(key)) return color;
  }
  return "var(--accent)";
}

// Grobe Klassifikation für die Split-Autoerkennung — bewusst simple
// Keyword-Zuordnung statt KB-Region-Lookup (der lädt async und ist für eine
// reine UX-Vorschlagsfunktion überdimensioniert).
const PUSH_MUSCLES = ['chest', 'pec', 'shoulder', 'delt', 'tricep'];
const PULL_MUSCLES = ['back', 'lat', 'trap', 'rhomboid', 'bicep'];
const LEG_MUSCLES = ['leg', 'quad', 'hamstring', 'glute', 'calv'];

function classifyMuscle(name) {
  const n = String(name || '').toLowerCase();
  if (PUSH_MUSCLES.some(k => n.includes(k))) return 'push';
  if (PULL_MUSCLES.some(k => n.includes(k))) return 'pull';
  if (LEG_MUSCLES.some(k => n.includes(k))) return 'legs';
  return null;
}

/**
 * Leitet einen Split-Vorschlag (Push/Pull/Legs/Upper/Full) aus den bereits
 * eingetragenen Übungen einer Session ab — greift nur, solange der User
 * selbst noch keinen Split gewählt hat (block === '').
 */
export function inferBlockFromExercises(exercises) {
  const list = Array.isArray(exercises) ? exercises : [];
  let hasPush = false, hasPull = false, hasLegs = false;
  for (const ex of list) {
    const muscles = [...(ex.primaryMuscles || []), ...(ex.secondaryMuscles || [])];
    for (const m of muscles) {
      const c = classifyMuscle(m);
      if (c === 'push') hasPush = true;
      else if (c === 'pull') hasPull = true;
      else if (c === 'legs') hasLegs = true;
    }
  }
  if (!hasPush && !hasPull && !hasLegs) return null;
  if (hasLegs && (hasPush || hasPull)) return 'Full';
  if (hasLegs) return 'Legs';
  if (hasPush && hasPull) return 'Upper';
  if (hasPush) return 'Push';
  if (hasPull) return 'Pull';
  return null;
}

export function getRollingDays(count) {
  const dates = [];
  const today = new Date();
  for (let i = count - 1; i >= 0; i--) {
    const d = new Date(today);
    d.setDate(today.getDate() - i);
    dates.push(d.toISOString().slice(0, 10));
  }
  return dates;
}

export const DAY_LABELS = ["So", "Mo", "Di", "Mi", "Do", "Fr", "Sa"];

// Zentrale Stelle für "YYYY-MM-DD" -> lokales Date-Objekt (Mittag statt
// Mitternacht, damit Zeitzonen-Rundung nie auf den Vor-/Folgetag kippt).
// Vorher parsten SessionHeader.jsx und useDayStrip.js dasselbe Pattern
// (`new Date(d + 'T12:00:00')`) jeweils unabhängig.
export function parseLocalDate(dateStr) {
  return new Date(`${dateStr}T12:00:00`);
}

export const num = (v) => {
  if (v === null || v === undefined) return null;
  const s = String(v).trim().replace(',', '.');
  if (!s) return null;
  const n = Number(s);
  return Number.isFinite(n) ? n : null;
};
