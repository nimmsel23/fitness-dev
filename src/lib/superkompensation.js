/**
 * superkompensation.js — geteilte Scoring-Logik für Muskel-Regeneration.
 *
 * Single Source of Truth für das 4-Phasen-Superkompensationsmodell, das
 * zuvor inline in views/Muscles/index.jsx lebte. Wird jetzt sowohl vom
 * Muskeln-Tab als auch vom Readiness-Subtab (WeeklyReview) genutzt, damit
 * beide Ansichten auf denselben Zahlen basieren statt zwei leicht
 * abweichende Recovery-Modelle zu pflegen.
 */
import { ACTIVITY_MUSCLE_GROUPS } from '../constants/ActivityConstants';

export const CAT_HEAVY      = 72;   // < 3 Tage: stark belastet
export const CAT_RECOVERING = 168;  // 3–7 Tage: Erholung
export const CAT_SUPER      = 336;  // 7–14 Tage: Superkompensation

// Cardio: kürzeres Zeitfenster als Kraft, kein "Fenster schließt sich"-Tier
export const CARDIO_HEAVY      = 24;   // ≤ 1 Tag
export const CARDIO_RECOVERING = 96;   // ≤ 4 Tage
export const CARDIO_SUPER      = 240;  // ≤ 10 Tage

// score → Farbe, identisch zu hitColors in MuscleBodyMap.jsx (index = score-1)
export const SCORE_COLORS = { 1: '#3b82f6', 2: '#22c55e', 3: '#f59e0b', 4: '#ef4444' };

// Die 16 spezifischen KB-Regionen (kb/muscles/*.yml) — siehe Kommentar-Historie
// in views/Muscles/index.jsx für den Hintergrund dieser expliziten Liste.
export const MUSCLE_GROUPS = [
  'chest',
  'upper_back', 'middle_back', 'lower_back', 'rhomboids', 'serratus_anterior',
  'biceps', 'triceps', 'forearms',
  'core', 'abductors', 'adductors',
  'glutes', 'quadriceps', 'hamstrings', 'calves',
];

function scoreForLastSeen(last) {
  if (!last) return 1;
  if (last.type === 'cardio') {
    if (last.hours > CARDIO_SUPER) return 1;
    if (last.hours > CARDIO_RECOVERING) return 2;
    if (last.hours > CARDIO_HEAVY) return 3;
    return 4;
  }
  if (last.hours > CAT_SUPER) return 1;
  if (last.hours > CAT_RECOVERING) return 2;
  if (last.hours > CAT_HEAVY) return 3;
  return 4;
}

/**
 * @param {Array} sessions - getSessionHistory()-Ergebnis
 * @param {Map} kbMap - lowercase(name) -> KB-Exercise, für Muskel-Fallback
 * @param {(muscleId: string) => string} getMuscleGroup - z.B. muscleToRegion aus @db
 */
export function computeMuscleScores(sessions, kbMap, getMuscleGroup) {
  const now = new Date();
  const lastSeen = {};
  const safeSessions = Array.isArray(sessions) ? sessions.filter(Boolean) : [];
  const sortedSessions = [...safeSessions].sort((a, b) => String(b.date).localeCompare(String(a.date)));

  for (const s of sortedSessions) {
    if (!s?.date) continue;
    const sessionDate = new Date(s.date + "T12:00:00");
    const hoursAgo = (now - sessionDate) / (1000 * 60 * 60);

    // Beide Zweige unabhängig ausführen (kein if/else!) — eine Session kann
    // gleichzeitig Kraft-Exercises UND einen Activity-Finisher (ActivityAddon,
    // "hasActivity") haben. Mit if/else wurden bei jeder Session mit Finisher
    // die kompletten Kraft-Exercises stillschweigend übersprungen, weil s.activity
    // truthy war — der Finisher "gewann" immer gegen die eigentliche Session.
    if (s.activity && hoursAgo <= 168) {
      // activity.muscles (spezifisches Ziel aus ActivityAddon, z.B. ["core"])
      // hat Vorrang vor dem groben Typ-Default — konsistent mit getWeeklyReport().
      const activeMuscles = (s.activity.muscles?.length ? s.activity.muscles : null)
        || ACTIVITY_MUSCLE_GROUPS[s.activity.type]
        || ['quadriceps', 'calves'];
      for (const raw of activeMuscles) {
        const m = getMuscleGroup(raw) || raw;
        if (!lastSeen[m] || lastSeen[m].hours > hoursAgo) {
          if (!lastSeen[m] || lastSeen[m].type !== 'strength' || lastSeen[m].hours > 72) {
            lastSeen[m] = { hours: hoursAgo, type: 'cardio' };
          }
        }
      }
    }

    for (const ex of (s.exercises || [])) {
      const kbEx = kbMap?.get((ex.name || "").toLowerCase());
      const primary = (ex.primaryMuscles?.length ? ex.primaryMuscles : null) || kbEx?.primary_muscles || kbEx?.primaryMuscles || [];
      const secondary = kbEx?.secondary_muscles || kbEx?.secondaryMuscles || ex.secondaryMuscles || [];

      for (const m of [...primary, ...secondary]) {
        const group = getMuscleGroup(m);
        if (group && MUSCLE_GROUPS.includes(group)) {
          if (!lastSeen[group] || lastSeen[group].hours > hoursAgo) {
            lastSeen[group] = { hours: hoursAgo, type: 'strength' };
          }
        }
      }
    }
  }

  const heavy = [], recovering = [], supercomp = [], ready = [], scores = {};
  for (const m of MUSCLE_GROUPS) {
    const score = scoreForLastSeen(lastSeen[m]);
    scores[m] = { score, color: SCORE_COLORS[score] };
    if (score === 1) ready.push(m);
    else if (score === 2) supercomp.push(m);
    else if (score === 3) recovering.push(m);
    else heavy.push(m);
  }
  return { heavy, recovering, super: supercomp, ready, scores, lastSeen };
}
