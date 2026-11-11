/**
 * workoutNotation.js — kompakte Workout-Sprache (Liftosaur-inspiriert).
 *
 * Eine Zeile Notation beschreibt eine Übung inkl. Satzstruktur, Last und
 * Progressionsregel. Ziel: Quick-Add im Session-Tab tippt man das Schema,
 * nicht 10 Felder. Die Sprache ist bewusst klein, deutsch- und
 * tastaturfreundlich (alles auf der Zahlenreihe), und jeder Baustein ist
 * optional — einfache Eingaben bleiben gültig.
 *
 * Grammatik (BNF-ähnlich):
 *
 *   line      := name scheme (rest)? (progression)?
 *   scheme    := setgroup ("," setgroup)*            // mehrere Blöcke = Pyramide
 *   setgroup  := sets "x" repspec ("@" load)?
 *   repspec   := int                                  // 8
 *              | int "-" int                          // 8-12 (Reps-Band)
 *              | int "+"                              // 8+ (AMRAP-Style)
 *   load      := number unit?                          // 60, 60kg, 132lb
 *              | number "%"                            // 80% (vom besten e1RM)
 *              | "bw" (offset)?                       // Körpergewicht ±
 *   rest      := "/90s" | "/2m"                       // Pause
 *   progression := "+" number (unit)?                  // +2.5kg wenn Reps-Band oben erreicht
 *              | "lp" "(" number ")"                   // alias linear progression
 *
 * Beispiele:
 *   Bankdrücken 3x8-12 @60 +2.5 /2m
 *   Kniebeuge 4x5 @80%
 *   Klimmzüge 3x8+ @bw
 *   Rudern 2x12, 2x8 @50 /90s
 *   Curls 3x12 @12.5kg
 *
 * parser ist bewusst fehlertolerant: unverständliche Fragmente werden
 * ignoriert statt zu werfen — Notation ist Eingabehilfe, kein Compiler.
 */

const NUM = String.raw`\d+(?:[.,]\d+)?`;

// "3x8-12", "3 x 8", "3×AMRAP", "3x8+" — Sets x Reps-Spek
const SETGROUP_RE = new RegExp(
  String.raw`(\d+)\s*[xX×]\s*(\d+)\s*(?:\+\s*)?(?:-\s*(\d+))?(?=\s*[,@/+]|\s*$)`,
  'g',
);
// (?![\w.]) statt \b: "\b" nach "80" vor "%" wäre schon eine Wortgrenze und
// lässt die optionale Einheit wegfallen — so wird "%" sicher erkannt.
const LOAD_RE = new RegExp(String.raw`@\s*(${NUM})\s*(%|kg|lb|kgs|lbs)?(?![\w.])`, 'i');
const REST_RE = new RegExp(String.raw`/\s*(\d+)\s*(s|sek|m|min)?`, 'i');
const PROG_RE = new RegExp(String.raw`(?:\+\s*(${NUM})\s*(kg|lb)?\s*(?=/|$)|lp\s*\(\s*(${NUM})\s*(kg|lb)?\s*\)\s*$)`, 'i');
const BW_RE = new RegExp(String.raw`@\s*bw\s*([+-]\s*${NUM})?`, 'i');

/**
 * @param {string} raw — eine Notations-Zeile, z.B. "Bankdrücken 3x8-12 @60 +2.5 /2m"
 * @returns {{ name: string, groups: Array<Object>, restSec: number|null,
 *             progression: { step: number, unit: 'kg'|'lb' }|null, note: string }|null }
 */
export function parseWorkoutNotation(raw) {
  if (!raw?.trim()) return null;
  let text = String(raw).trim();

  // Rest/Pause zuerst extrahieren (sonst frisst SETGROUP_RE die "2m" nicht, aber /90s stört LOAD)
  let restSec = null;
  const restMatch = text.match(REST_RE);
  if (restMatch) {
    const n = Number(restMatch[1]);
    const unit = (restMatch[2] || 'm').toLowerCase();
    restSec = unit.startsWith('s') ? n : n * 60;
    text = text.replace(restMatch[0], ' ').trim();
  }

  // Progression am Ende abspalten ("+2.5" / "lp(2.5)")
  let progression = null;
  const progMatch = text.match(PROG_RE);
  if (progMatch) {
    const step = Number((progMatch[1] || progMatch[3] || '').replace(',', '.'));
    const unitRaw = (progMatch[2] || progMatch[4] || 'kg').toLowerCase();
    if (Number.isFinite(step) && step > 0) {
      progression = { step, unit: unitRaw === 'lb' ? 'lb' : 'kg' };
    }
    text = text.replace(progMatch[0], '').trim();
  }

  // Alle Satzgruppen einsammeln
  const groups = [];
  let m;
  SETGROUP_RE.lastIndex = 0;
  while ((m = SETGROUP_RE.exec(text)) !== null) {
    const sets = Number(m[1]);
    const minReps = Number(m[2]);
    const hasPlus = /\+\s*$/.test(m[0]) || /\+/.test(text.slice(m.index + m[0].length, m.index + m[0].length + 2));
    const maxReps = m[3] ? Number(m[3]) : null;
    if (sets > 0 && sets <= 50 && minReps > 0 && minReps <= 1000) {
      groups.push({
        sets,
        reps: { min: minReps, max: maxReps ?? minReps, amrap: hasPlus },
      });
    }
  }
  if (!groups.length) return null;

  // Letzte Gruppe mit Last-Annotation gewinnt die Last für alle (eine Übung = ein Load-Konzept)
  const loadMatch = text.match(LOAD_RE);
  const bwMatch = text.match(BW_RE);
  let load = null;
  if (bwMatch) {
    load = { type: 'bodyweight', offset: bwMatch[1] ? Number(bwMatch[1].replace(/\s|[+-]/g, '')) : 0 };
  } else if (loadMatch) {
    const value = Number(loadMatch[1].replace(',', '.'));
    const unit = (loadMatch[2] || 'kg').toLowerCase().replace('kgs', 'kg').replace('lbs', 'lb');
    if (Number.isFinite(value)) {
      load = { type: unit === '%' ? 'percent' : 'weight', value, unit: unit === '%' ? 'kg' : unit };
    }
  }

  // Name = alles vor der ersten Satzgruppe
  const firstGroupIdx = text.search(SETGROUP_RE);
  const name = (firstGroupIdx > 0 ? text.slice(0, firstGroupIdx) : text.replace(SETGROUP_RE, ''))
    .replace(/[@/+,].*$/, '')
    .replace(/\s{2,}/g, ' ')
    .trim();

  const note = progression
    ? `Progression +${progression.step}${progression.unit} bei vollem Reps-Band`
    : '';

  return {
    name: name || raw.trim(),
    groups,
    load,
    restSec,
    progression,
    note,
  };
}

/**
 * Notation → Session-übliche setsArray ({reps, weight} strings) für
 * parseQuick-Kompatibilität. Reps-Band wird als "8-12" notiert, AMRAP als "8+".
 */
export function notationToSets(parsed) {
  if (!parsed?.groups?.length) return [];
  const out = [];
  for (const g of parsed.groups) {
    const reps = g.reps.amrap ? `${g.reps.min}+` : (g.reps.max > g.reps.min ? `${g.reps.min}-${g.reps.max}` : String(g.reps.min));
    const weight =
      parsed.load?.type === 'weight' ? String(parsed.load.value)
      : parsed.load?.type === 'percent' ? `${parsed.load.value}%`
      : parsed.load?.type === 'bodyweight' ? 'bw'
      : '';
    for (let i = 0; i < g.sets; i++) out.push({ reps, weight });
  }
  return out;
}

/**
 * Progressions-Entscheidung: alle Sätze im Reps-Band oben angekommen →
 * nächste Ziel-Last = letzte Last + step. Sonst Last halten.
 * @param {{reps:{min:number,max:number}}} group
 * @param {Array<{reps:string|number, weight:string|number}>} lastSets
 * @param {{step:number, unit:string}} progression
 * @returns {number|null} neue Ziel-Last oder null (kein Vorschlag möglich)
 */
export function nextTargetLoad(group, lastSets, progression) {
  if (!group?.reps || !progression || !Array.isArray(lastSets) || !lastSets.length) return null;
  const weights = lastSets.map((s) => Number(String(s.weight ?? '').replace(',', '.'))).filter((w) => Number.isFinite(w) && w > 0);
  if (!weights.length) return null;
  const target = group.reps.amrap ? group.reps.min : group.reps.max;
  const allHit = lastSets.every((s) => Number(s.reps) >= target);
  if (!allHit) return weights[0];
  const round = (v) => Math.round(v * 2) / 2; // auf 0,5 runden — Platten-Realität
  return round(weights[0] + progression.step);
}

/**
 * Kanonische Anzeige einer Notation (für Toasts/Karten).
 */
export function formatNotation(parsed) {
  if (!parsed?.groups?.length) return '';
  const scheme = parsed.groups
    .map((g) => `${g.sets}×${g.reps.amrap ? g.reps.min + '+' : g.reps.min + (g.reps.max > g.reps.min ? '-' + g.reps.max : '')}`)
    .join(', ');
  let load = '';
  if (parsed.load?.type === 'weight') load = ` @${parsed.load.value}${parsed.load.unit}`;
  else if (parsed.load?.type === 'percent') load = ` @${parsed.load.value}%`;
  else if (parsed.load?.type === 'bodyweight') load = ' @bw';
  return `${parsed.name} ${scheme}${load}`.trim();
}
