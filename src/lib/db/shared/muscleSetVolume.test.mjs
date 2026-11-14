import test from 'node:test';
import assert from 'node:assert/strict';
import { countLoggedSets, isLoggedExercise, addExerciseMuscleLoad, SETS_RECOVERY_WARN } from './muscleSetVolume.js';

const row = (reps, weight, extra = {}) => ({ reps, weight, ...extra });

test('countLoggedSets: Aufwärmsätze und leere Zeilen zählen nicht', () => {
  const ex = { setsArray: [row('8', '60'), row('', ''), row('5', '40', { setType: 'warmup' }), row('6', '62,5')] };
  assert.equal(countLoggedSets(ex), 2);
});

test('countLoggedSets: Dropsätze gehören zum Satz davor', () => {
  const ex = { setsArray: [row('8', '60'), row('4', '45', { setType: 'drop' }), row('3', '30', { setType: 'drop' })] };
  assert.equal(countLoggedSets(ex), 1);
  assert.equal(countLoggedSets({ setsArray: [row('4', '45', { setType: 'drop' })] }), 1);
});

test('countLoggedSets: Altformat sets/reps/weight, gedeckelt auf 20', () => {
  assert.equal(countLoggedSets({ sets: 3, reps: 8, weight: 50 }), 3);
  assert.equal(countLoggedSets({ sets: 99, reps: 8 }), 20);
  assert.equal(countLoggedSets({ sets: 3 }), 0);
});

test('isLoggedExercise: HIT ohne Satz-Tracking zählt, leere Planzeile nicht', () => {
  assert.equal(isLoggedExercise({ isHIT: true, sets: '', reps: '' }), true);
  assert.equal(isLoggedExercise({ done: true }), true);
  assert.equal(isLoggedExercise({ name: 'Plan', setsArray: [row('', '')] }), false);
});

test('Belastung: ein Satz = zwei Sätze = Satz mit Dropsätzen (kurzgeschlossen)', () => {
  const base = { primaryMuscles: ['pectoralis_major'], secondaryMuscles: ['triceps_brachii'] };
  const one = {}; const two = {}; const drops = {};
  addExerciseMuscleLoad(one, { ...base, setsArray: [row('8', '60')] });
  addExerciseMuscleLoad(two, { ...base, setsArray: [row('8', '60'), row('8', '60')] });
  addExerciseMuscleLoad(drops, { ...base, setsArray: [row('8', '60'), row('4', '45', { setType: 'drop' })] });
  const hits = (v) => Object.fromEntries(Object.entries(v).map(([k, e]) => [k, [e.primary_hits, e.secondary_hits, e.effective_hits]]));
  assert.deepEqual(hits(two), hits(one));
  assert.deepEqual(hits(drops), hits(one));
  assert.deepEqual(drops, one, 'Dropsätze ändern auch max_sets nicht');
  assert.equal(one.pectoralis_major.primary_hits, 1);
  assert.equal(one.triceps_brachii.effective_hits, 0.5);
});

test('Volumen-Warnung: erst über der Schwelle, nur für direkt belastete Regionen', () => {
  const sets = (n) => Array.from({ length: n }, () => row('8', '60'));
  const base = { primaryMuscles: ['pectoralis_major'], secondaryMuscles: ['triceps_brachii'] };
  const ok = {}; const many = {};
  addExerciseMuscleLoad(ok, { ...base, setsArray: sets(SETS_RECOVERY_WARN) });
  addExerciseMuscleLoad(many, { ...base, setsArray: sets(SETS_RECOVERY_WARN + 1) });
  assert.equal(ok.pectoralis_major.high_volume_exercises, 0);
  assert.equal(many.pectoralis_major.high_volume_exercises, 1);
  assert.equal(many.pectoralis_major.max_sets, SETS_RECOVERY_WARN + 1);
  assert.equal(many.pectoralis_major.effective_hits, 1, 'mehr Sätze erhöhen die Belastung nicht');
  assert.equal(many.triceps_brachii.high_volume_exercises, 0);
});

test('Übung ohne Muskeln wird als eine Belastung gesammelt, nicht nach Sätzen', () => {
  const volume = {}; const unmapped = {};
  const ex = { exercise_id: 'x1', name: 'Mystery Move', setsArray: [row('10', '20'), row('10', '20')] };
  assert.equal(addExerciseMuscleLoad(volume, ex, null, unmapped), 1);
  assert.deepEqual(volume, {});
  assert.deepEqual(unmapped.x1, { exercise_id: 'x1', name: 'Mystery Move', hits: 1 });
  addExerciseMuscleLoad(volume, { ...ex, setsArray: [row('10', '20')] }, null, unmapped);
  assert.equal(unmapped.x1.hits, 2);
});

test('ohne geloggte Arbeit nichts gezählt', () => {
  const unmapped = {};
  assert.equal(addExerciseMuscleLoad({}, { name: 'Leer', setsArray: [row('', '')] }, null, unmapped), 0);
  assert.deepEqual(unmapped, {});
});
