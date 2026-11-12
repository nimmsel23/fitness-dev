import { test } from 'node:test';
import assert from 'node:assert/strict';
import { resolveExternalWorkoutFields } from './externalWorkoutHost.js';

test('defaults app and source to fitness when the caller omits both', () => {
  assert.deepEqual(resolveExternalWorkoutFields({}), { app: 'fitness', source: 'fitness' });
  assert.deepEqual(resolveExternalWorkoutFields(null), { app: 'fitness', source: 'fitness' });
});

test('takes app and source from the caller, filling the missing one from the other', () => {
  assert.deepEqual(resolveExternalWorkoutFields({ app: 'skills', runId: 'run-1' }), {
    app: 'skills', source: 'skills', runId: 'run-1',
  });
  assert.deepEqual(resolveExternalWorkoutFields({ source: 'sixpack' }), {
    app: 'sixpack', source: 'sixpack',
  });
  assert.deepEqual(resolveExternalWorkoutFields({ app: 'fitness', source: 'sixpack' }), {
    app: 'fitness', source: 'sixpack',
  });
});

test('keeps a provided runId so the workout doc id can stay stable', () => {
  const first = resolveExternalWorkoutFields({ app: 'sixpack', runId: 'abc123' });
  const second = resolveExternalWorkoutFields({ app: 'sixpack', runId: 'abc123' });
  assert.equal(first.runId, 'abc123');
  assert.deepEqual(first, second);
  // buildWorkoutDoc ids the session `${source}-${runId}`.
  assert.equal(`${first.source}-${first.runId}`, 'sixpack-abc123');
});

test('drops a blank runId so the doc builder can mint one', () => {
  assert.equal('runId' in resolveExternalWorkoutFields({ app: 'fitness', runId: '  ' }), false);
});
