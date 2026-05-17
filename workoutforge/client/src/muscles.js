// Muscle map: yuhonas exercise-db keys → { de, gruppe }
// gruppe: druck | zug | beine | core | sonstige

const MUSCLE_MAP = {
  // ── Druck (Push) ──────────────────────────────────────────
  chest:               { de: "Brust",               gruppe: "druck" },
  shoulders:           { de: "Schultern",            gruppe: "druck" },
  triceps:             { de: "Trizeps",              gruppe: "druck" },

  // ── Zug (Pull) ────────────────────────────────────────────
  lats:                { de: "Breiter Rücken",       gruppe: "zug" },
  "middle back":       { de: "Mittlerer Rücken",     gruppe: "zug" },
  "lower back":        { de: "Unterer Rücken",       gruppe: "zug" },
  traps:               { de: "Trapez",               gruppe: "zug" },
  biceps:              { de: "Bizeps",               gruppe: "zug" },
  forearms:            { de: "Unterarme",            gruppe: "zug" },

  // ── Beine ─────────────────────────────────────────────────
  quadriceps:          { de: "Quadrizeps",           gruppe: "beine" },
  hamstrings:          { de: "Hamstrings",           gruppe: "beine" },
  glutes:              { de: "Gesäß",                gruppe: "beine" },
  calves:              { de: "Waden",                gruppe: "beine" },
  adductors:           { de: "Adduktoren",           gruppe: "beine" },
  abductors:           { de: "Abduktoren",           gruppe: "beine" },
  "hip flexors":       { de: "Hüftbeuger",           gruppe: "beine" },
  "it band":           { de: "IT-Band",              gruppe: "beine" },

  // ── Core ──────────────────────────────────────────────────
  abdominals:          { de: "Bauch",                gruppe: "core" },
  obliques:            { de: "Schräge Bauchmuskeln", gruppe: "core" },

  // ── Sonstige ──────────────────────────────────────────────
  neck:                { de: "Nacken",               gruppe: "sonstige" },
};

const GRUPPE_COLOR = {
  druck:    "#3b82f6",
  zug:      "#22c55e",
  beine:    "#f97316",
  core:     "#a855f7",
  sonstige: "#6b7280",
};

export function muskelDe(name) {
  return MUSCLE_MAP[name?.toLowerCase()]?.de ?? name;
}

export function muskelGruppe(name) {
  return MUSCLE_MAP[name?.toLowerCase()]?.gruppe ?? "sonstige";
}

export function muskelColor(name) {
  return GRUPPE_COLOR[muskelGruppe(name)] ?? "#64748b";
}
