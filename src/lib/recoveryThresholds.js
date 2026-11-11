/**
 * recoveryThresholds.js — Superkompensations-Zeitfenster in Stunden.
 *
 * Bewusst frei von Imports (auch kein ActivityConstants-Kettenimport, der
 * Directory-Imports enthält und Node-Tests brechen würde): superkompensation.js
 * und recoveryWindows.js teilen sich diese eine Quelle der Wahrheit.
 */

// Kraft: 4-Phasen-Modell
export const CAT_HEAVY      = 72;   // < 3 Tage: stark belastet
export const CAT_RECOVERING = 168;  // 3–7 Tage: Erholung
export const CAT_SUPER      = 336;  // 7–14 Tage: Superkompensation

// Cardio: kürzeres Zeitfenster als Kraft, kein "Fenster schließt sich"-Tier
export const CARDIO_HEAVY      = 24;   // ≤ 1 Tag
export const CARDIO_RECOVERING = 96;   // ≤ 4 Tage
export const CARDIO_SUPER      = 240;  // ≤ 10 Tage

// HIIT-Finisher (z.B. 5-Minuten-Core-Routinen) sind bewusst für tägliches/
// mehrfach-wöchentliches Training konzipiert — deutlich kürzeres Fenster,
// damit "stark belastet" nur den Trainingstag selbst markiert.
export const HIIT_HEAVY      = 4;    // ≤ 4 Std.
export const HIIT_RECOVERING = 24;   // ≤ 1 Tag
export const HIIT_SUPER      = 72;   // ≤ 3 Tage

// score → Farbe, identisch zu hitColors in MuscleBodyMap.jsx (index = score-1)
export const SCORE_COLORS = { 1: '#3b82f6', 2: '#22c55e', 3: '#f59e0b', 4: '#ef4444' };
