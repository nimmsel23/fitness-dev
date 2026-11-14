// Läuft nicht direkt mit `node --test` (muscle.js zieht Verzeichnis-Imports nach sich), daher gebündelt:
//   esbuild --bundle --platform=node --format=esm src/lib/db/shared/muscleSetVolume.test.mjs --outfile=/tmp/msv.test.mjs && node --test /tmp/msv.test.mjs
import test from 'node:test';
import assert from 'node:assert/strict';
import { countWorkingSets, addExerciseMuscleSetVolume } from './muscleSetVolume.js';

const row = (reps, weight, extra = {}) => ({ reps, weight, ...extra });

test('countWorkingSets: Aufwärmsätze und leere Zeilen zählen nicht', () => {
  const ex = { setsArray: [row('8', '60'), row('', ''), row('5', '40', { setType: 'warmup' }), row('6', '62,5')] };
  assert.equal(countWorkingSets(ex), 2);
});

test('countWorkingSets: Altformat sets/reps/weight, gedeckelt auf 20', () => {
  assert.equal(countWorkingSets({ sets: 3, reps: 8, weight: 50 }), 3);
  assert.equal(countWorkingSets({ sets: 99, reps: 8 }), 20);
  assert.equal(countWorkingSets({ sets: 3 }), 0);
});

test('addExerciseMuscleSetVolume: direkt = 1, indirekt = 0,5 effektive Sätze', () => {
  const volume = {};
  const ex = { setsArray: [row('8', '60'), row('8', '60')], primaryMuscles: ['pectoralis_major'], secondaryMuscles: ['triceps_brachii'] };
  assert.equal(addExerciseMuscleSetVolume(volume, ex), 0);
  assert.deepEqual(volume.pectoralis_major, { primary_sets: 2, secondary_sets: 0, effective_sets: 2 });
  assert.deepEqual(volume.triceps_brachii, { primary_sets: 0, secondary_sets: 2, effective_sets: 1 });
});

test('addExerciseMuscleSetVolume: Übung ohne Muskeln wird gezählt und gesammelt', () => {
  const volume = {};
  const unmapped = {};
  const ex = { exercise_id: 'x1', name: 'Mystery Move', setsArray: [row('10', '20'), row('10', '20')] };
  assert.equal(addExerciseMuscleSetVolume(volume, ex, null, unmapped), 2);
  assert.deepEqual(volume, {});
  assert.deepEqual(unmapped.x1, { exercise_id: 'x1', name: 'Mystery Move', sets: 2 });
  // zweite Einheit derselben Übung addiert auf
  addExerciseMuscleSetVolume(volume, { ...ex, setsArray: [row('10', '20')] }, null, unmapped);
  assert.equal(unmapped.x1.sets, 3);
});

test('addExerciseMuscleSetVolume: ohne Arbeitssätze nichts gezählt', () => {
  const unmapped = {};
  assert.equal(addExerciseMuscleSetVolume({}, { name: 'Leer', setsArray: [row('', '')] }, null, unmapped), 0);
  assert.deepEqual(unmapped, {});
});
