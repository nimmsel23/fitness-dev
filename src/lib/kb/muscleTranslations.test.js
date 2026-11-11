import test from 'node:test';
import assert from 'node:assert/strict';
import { muscleToRbhSlug, translateMuscle, canonicalMuscleId } from './muscleTranslations.js';

/**
 * Highlighter-Robustheit: jede Muskel-ID, die die App je aus KB/Sessions
 * bekommt, muss entweder korrekt auf einen RBH-Slug mappen oder sicher auf
 * null fallen — niemals auf den FALSCHEN Slug ("deppensicher gerendert").
 * Nummern-Schema: fitness/catalog/muscle_index.yml.
 */

test('Kanonische KB-IDs: Brust + Rücken komplett', () => {
  assert.equal(muscleToRbhSlug('101_pectoralis_major'), 'chest');
  assert.equal(muscleToRbhSlug('102_pectoralis_major_clavicular'), 'chest'); // BUGLIST: zählt jetzt als Brust
  assert.equal(muscleToRbhSlug('201_latissimus_dorsi'), 'latissimus');      // fehlte komplett
  assert.equal(muscleToRbhSlug('205_rhomboids'), 'upper-back');
  assert.equal(muscleToRbhSlug('207_teres_major'), 'latissimus');
  assert.equal(muscleToRbhSlug('206_erector_spinae'), 'lower-back');
  assert.equal(muscleToRbhSlug('202_trapezius'), 'trapezius');
});

test('Kanonische KB-IDs: Schultern + Arme (401=Trizeps, 402=Bizeps, 403=Brachialis)', () => {
  assert.equal(muscleToRbhSlug('301_anterior_deltoid'), 'front-deltoids');
  assert.equal(muscleToRbhSlug('302_lateral_deltoid'), 'front-deltoids');
  assert.equal(muscleToRbhSlug('303_posterior_deltoid'), 'back-deltoids');  // BUGLIST: Rear-Delt-Fly
  assert.equal(muscleToRbhSlug('401_triceps_brachii'), 'triceps');
  assert.equal(muscleToRbhSlug('401a_triceps_long_head'), 'triceps');
  assert.equal(muscleToRbhSlug('402_biceps_brachii'), 'biceps');
  assert.equal(muscleToRbhSlug('403_brachialis'), 'biceps');
});

test('Kanonische KB-IDs: Rumpf + Beine (601=Quadrizeps, 603=Gluteus Max., 604=Hamstrings)', () => {
  assert.equal(muscleToRbhSlug('501_rectus_abdominis'), 'abs');
  assert.equal(muscleToRbhSlug('502_obliquus_externus'), 'obliques');
  assert.equal(muscleToRbhSlug('601_quadriceps_femoris'), 'quadriceps');
  assert.equal(muscleToRbhSlug('601a_rectus_femoris'), 'quadriceps');
  assert.equal(muscleToRbhSlug('602_adductors'), 'adductor');
  assert.equal(muscleToRbhSlug('603_gluteus_maximus'), 'gluteal');
  assert.equal(muscleToRbhSlug('604_hamstrings'), 'hamstring');
  assert.equal(muscleToRbhSlug('604a_biceps_femoris'), 'hamstring');
  assert.equal(muscleToRbhSlug('608_gluteus_medius'), 'gluteal');
  assert.equal(muscleToRbhSlug('701_gastrocnemius'), 'calves');
  assert.equal(muscleToRbhSlug('702_soleus'), 'calves');
});

test('Freitext-Vokabular (Yuhonas-Sessions) mappt statt null', () => {
  assert.equal(muscleToRbhSlug('shoulders'), 'front-deltoids');
  assert.equal(muscleToRbhSlug('lats'), 'latissimus');
  assert.equal(muscleToRbhSlug('back'), 'upper-back');
  assert.equal(muscleToRbhSlug('forearm'), 'forearm');
  assert.equal(muscleToRbhSlug('chest'), 'chest');
});

test('Müll-IDs fallen sicher auf null, ohne zu werfen', () => {
  assert.equal(muscleToRbhSlug(''), null);
  assert.equal(muscleToRbhSlug(null), null);
  assert.equal(muscleToRbhSlug(undefined), null);
  assert.equal(muscleToRbhSlug(''), null);
  assert.equal(muscleToRbhSlug('999_unknown_muscle'), null);
  assert.equal(muscleToRbhSlug('irgendein text'), null);
});

test('translateMuscle: kanonisch + Freitext + Müll', () => {
  // 201er-IDs rollen auf ihre Sammelgruppe "Rücken" (numericSlugToGroup) —
  // bewusst die breite Gruppe, nicht der Latissimus-spezifische Name.
  assert.equal(translateMuscle('201_latissimus_dorsi', null, 'de'), 'Rücken');
  assert.equal(translateMuscle('chest', null, 'de'), 'Brust');
  assert.equal(translateMuscle('garbage', null, 'de'), 'Garbage'); // lesbarer Fallback, kein Crash
});

test('canonicalMuscleId löst Yuhonas-Freitext auf kanonische KB-IDs auf', () => {
  assert.equal(canonicalMuscleId('lower back'), '206_erector_spinae');
  assert.equal(canonicalMuscleId('lats'), '201_latissimus_dorsi');
});
