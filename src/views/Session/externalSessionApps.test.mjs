import { test } from 'node:test';
import assert from 'node:assert/strict';
import {
  externalSessionCopy,
  markStandaloneHost,
  resetStandaloneHostForTests,
  resolveInShell,
} from './externalSessionApps.js';

test('standalone Fitness uses the same embedded labels as the Shell', () => {
  const timer = externalSessionCopy('timer', { shell: false });
  const skills = externalSessionCopy('skills', { shell: false });
  assert.deepEqual(timer, { label: '6Pack', external: false, ariaLabel: '6Pack' });
  assert.deepEqual(skills, { label: 'Skills', external: false, ariaLabel: 'Skills' });
});

test('shell copy is a plain in-app tab', () => {
  assert.deepEqual(externalSessionCopy('timer', { shell: true }), {
    label: '6Pack', external: false, ariaLabel: '6Pack',
  });
  assert.deepEqual(externalSessionCopy('skills', { shell: true }), {
    label: 'Skills', external: false, ariaLabel: 'Skills',
  });
  assert.equal(externalSessionCopy('plan', { shell: true }), null);
});

test('omitted shell prop follows the standalone host mark', () => {
  resetStandaloneHostForTests();
  assert.equal(resolveInShell({}), true);
  markStandaloneHost();
  assert.equal(resolveInShell({}), false);
  assert.equal(resolveInShell({ shell: true }), true);
  assert.equal(resolveInShell({ embedded: true }), true);
  assert.equal(resolveInShell({ shell: false }), false);
  assert.equal(resolveInShell({ shell: false, embedded: true }), false);
  resetStandaloneHostForTests();
});
