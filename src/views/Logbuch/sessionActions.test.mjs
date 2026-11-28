import { test } from 'node:test';
import assert from 'node:assert/strict';
import { moveLogbookSession, applySessionChange } from './sessionActions.js';

test('moving one of several sessions loads its full document, not a day aggregate or digest', async () => {
  const full = { id: 'extra', date: '2026-11-27', notes: 'keep', slots: [1], activityAddons: [{ type: 'walk' }], coachFeedback: 'keep too' };
  let moved;
  const db = {
    listSessionsForDate: async () => [{ date: full.date, id: null }, full],
    relocateSession: async (...args) => { moved = args; return { session: { ...args[2], date: args[3] } }; },
  };
  await moveLogbookSession(db, full.date, 'extra', '2026-11-26');
  assert.deepEqual(moved, [full.date, 'extra', full, '2026-11-26']);
});

test('a missing session or a conflicting destination never silently copies a digest', async () => {
  await assert.rejects(moveLogbookSession({ listSessionsForDate: async () => [], relocateSession() { assert.fail('no write'); } }, '2026-11-27', null, '2026-11-26'), /existiert nicht mehr/);
  const conflict = Object.assign(new Error('target-occupied'), { code: 'target-occupied' });
  await assert.rejects(moveLogbookSession({ listSessionsForDate: async () => [{ id: 'a' }], relocateSession: async () => { throw conflict; } }, '2026-11-27', 'a', '2026-11-26'), error => error === conflict);
});

test('a move or delete updates only the selected session, retaining both days other sessions', () => {
  const source = [{ date: '2026-11-27', id: null }, { date: '2026-11-27', id: 'a' }, { date: '2026-11-26', id: 'b' }];
  const moved = applySessionChange(source, { date: '2026-11-27', id: 'a', session: { date: '2026-11-26', notes: 'full' } });
  assert.equal(moved.length, 3);
  assert.deepEqual(moved.at(-1), { date: '2026-11-26', id: 'a', notes: 'full' });
  assert.deepEqual(applySessionChange(source, { date: '2026-11-27', id: 'a' }), [source[0], source[2]]);
});
