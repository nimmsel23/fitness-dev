import test from 'node:test';
import assert from 'node:assert/strict';
import { recoveryWindow, broadGroupWindows } from './recoveryWindows.js';

const NOW = new Date('2026-11-11T12:00:00');

test('heavy: Fenster öffnet sich in Zukunft', () => {
  const w = recoveryWindow(10, 'strength', NOW);
  assert.equal(w.phase, 'heavy');
  assert.equal(w.opensInHours, 62); // 72 - 10
  assert.ok(w.windowFrom > NOW);
  assert.match(w.advice, /Erholungs-Defizit/);
});

test('recovering: Phase 2 mit Öffnungszeitpunkt', () => {
  const w = recoveryWindow(100, 'strength', NOW);
  assert.equal(w.phase, 'recovering');
  assert.equal(w.opensInHours, 68); // 168 - 100
  assert.match(w.advice, /optimal trainierbar ab/);
  // Erholungs-%: (100-72)/(168-72) = 29% — Regressionsschutz für den
  // Math.round-Präzedenz-Bug (x*100 vs *100 nach round → zeigte ~0%)
  assert.match(w.advice, /~29%/);
});

test('super: Fenster offen, Restzeit positiv', () => {
  const w = recoveryWindow(200, 'strength', NOW);
  assert.equal(w.phase, 'super');
  assert.equal(w.opensInHours, 0);
  assert.equal(w.closesInHours, 136); // 336 - 200
  assert.match(w.advice, /Jetzt im Superkompensations-Fenster/);
});

test('ready: jenseits des Fensters', () => {
  const w = recoveryWindow(400, 'strength', NOW);
  assert.equal(w.phase, 'ready');
  assert.match(w.advice, /Voll erholt/);
});

test('cardio-Fenster ist kürzer', () => {
  const w = recoveryWindow(30, 'cardio', NOW);
  assert.equal(w.phase, 'recovering');
  const w2 = recoveryWindow(30, 'strength', NOW);
  assert.equal(w2.phase, 'heavy'); // dieselben 30h, unterschiedlicher Typ
});

test('hiit-Fenster ist am kürzesten', () => {
  assert.equal(recoveryWindow(3, 'hiit', NOW).phase, 'heavy');
  assert.equal(recoveryWindow(10, 'hiit', NOW).phase, 'recovering');
  assert.equal(recoveryWindow(50, 'hiit', NOW).phase, 'super');
});

test('ohne Daten: ready-Phase', () => {
  const w = recoveryWindow(Infinity, 'strength', NOW);
  assert.equal(w.phase, 'ready');
});

test('broadGroupWindows sortiert Super vor Heavy', () => {
  const groups = {
    legs: { name: 'Beine', members: ['quadriceps', 'hamstrings'] },
    chest: { name: 'Brust', members: ['chest'] },
  };
  const lastSeen = {
    quadriceps: { hours: 200, type: 'strength' },
    hamstrings: { hours: 200, type: 'strength' },
    chest: { hours: 5, type: 'strength' },
  };
  const result = broadGroupWindows(lastSeen, groups, NOW);
  assert.equal(result[0].id, 'legs'); // super zuerst
  assert.equal(result[0].window.phase, 'super');
  assert.equal(result[1].id, 'chest');
  assert.equal(result[1].window.phase, 'heavy');
  assert.equal(result[1].window.opensInHours, 67);
});

test('broadGroupWindows ohne Daten → ready + hasData false', () => {
  const groups = { chest: { name: 'Brust', members: ['chest'] } };
  const result = broadGroupWindows({}, groups, NOW);
  assert.equal(result[0].hasData, false);
  assert.equal(result[0].window.phase, 'ready');
});

test('Gruppe nutzt frischeste Region (Beine = min über Members)', () => {
  const groups = { legs: { name: 'Beine', members: ['quadriceps', 'hamstrings'] } };
  const lastSeen = {
    quadriceps: { hours: 150, type: 'strength' },
    hamstrings: { hours: 20, type: 'strength' },
  };
  const result = broadGroupWindows(lastSeen, groups, NOW);
  // frischeste Region (hamstrings, 20h) bestimmt die Gruppe → heavy
  assert.equal(result[0].window.phase, 'heavy');
});
