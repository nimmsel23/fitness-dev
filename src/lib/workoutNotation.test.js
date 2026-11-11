import test from 'node:test';
import assert from 'node:assert/strict';
import { parseWorkoutNotation, notationToSets, nextTargetLoad, formatNotation } from './workoutNotation.js';

test('einfaches Schema: 3x8 @60', () => {
  const p = parseWorkoutNotation('Bankdrücken 3x8 @60');
  assert.equal(p.name, 'Bankdrücken');
  assert.equal(p.groups.length, 1);
  assert.deepEqual(p.groups[0].reps, { min: 8, max: 8, amrap: false });
  assert.equal(p.groups[0].sets, 3);
  assert.deepEqual(p.load, { type: 'weight', value: 60, unit: 'kg' });
});

test('Reps-Band + Progression + Pause: 3x8-12 @60 +2.5 /2m', () => {
  const p = parseWorkoutNotation('Bankdrücken 3x8-12 @60 +2.5 /2m');
  assert.deepEqual(p.groups[0].reps, { min: 8, max: 12, amrap: false });
  assert.deepEqual(p.progression, { step: 2.5, unit: 'kg' });
  assert.equal(p.restSec, 120);
  assert.match(p.note, /Progression/);
});

test('AMRAP: 3x8+ @bw', () => {
  const p = parseWorkoutNotation('Klimmzüge 3x8+ @bw');
  assert.equal(p.groups[0].reps.amrap, true);
  assert.deepEqual(p.load, { type: 'bodyweight', offset: 0 });
});

test('Prozent-Last: 4x5 @80%', () => {
  const p = parseWorkoutNotation('Kniebeuge 4x5 @80%');
  assert.deepEqual(p.load, { type: 'percent', value: 80, unit: 'kg' });
});

test('Pyramide: mehrere Satzgruppen', () => {
  const p = parseWorkoutNotation('Rudern 2x12, 2x8 @50 /90s');
  assert.equal(p.groups.length, 2);
  assert.equal(p.groups[1].sets, 2);
  assert.equal(p.groups[1].reps.min, 8);
  assert.equal(p.restSec, 90);
});

test('lp()-Progressions-Alias', () => {
  const p = parseWorkoutNotation('Curls 3x12 @12.5kg lp(1)');
  assert.deepEqual(p.progression, { step: 1, unit: 'kg' });
});

test('notationToSets expandiert alle Gruppen', () => {
  const p = parseWorkoutNotation('Rudern 2x12, 2x8 @50');
  const sets = notationToSets(p);
  assert.equal(sets.length, 4);
  assert.equal(sets[0].reps, '12');
  assert.equal(sets[2].reps, '8');
  assert.equal(sets[0].weight, '50');
});

test('nextTargetLoad: alle Sätze oben → +step', () => {
  const p = parseWorkoutNotation('Bankdrücken 3x8-12 @60 +2.5');
  const next = nextTargetLoad(p.groups[0], [
    { reps: 12, weight: 60 }, { reps: 12, weight: 60 }, { reps: 12, weight: 60 },
  ], p.progression);
  assert.equal(next, 62.5);
});

test('nextTargetLoad: Reps nicht erreicht → Last halten', () => {
  const p = parseWorkoutNotation('Bankdrücken 3x8-12 @60 +2.5');
  const next = nextTargetLoad(p.groups[0], [
    { reps: 10, weight: 60 }, { reps: 9, weight: 60 },
  ], p.progression);
  assert.equal(next, 60);
});

test('Unsinn bleibt null / known-simple bleibt kompatibel', () => {
  assert.equal(parseWorkoutNotation(''), null);
  assert.equal(parseWorkoutNotation('   '), null);
  // nur Name ohne Schema → null (kein clobbering des klassischen Quick-Adds)
  assert.equal(parseWorkoutNotation('Bankdrücken'), null);
});

test('formatNotation rundet sauber', () => {
  const p = parseWorkoutNotation('Bankdrücken 3x8-12 @60');
  assert.equal(formatNotation(p), 'Bankdrücken 3×8-12 @60kg');
});
