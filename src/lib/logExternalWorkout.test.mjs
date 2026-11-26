import { test } from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync, existsSync } from 'node:fs';
import { transform } from 'esbuild';
import vm from 'node:vm';
import { resolveExternalWorkoutFields } from './externalWorkoutHost.js';

const shared = ['../../../6pack-app/workoutDoc.js', '../../../6pack-dev/workoutDoc.js']
  .map(path => new URL(path, import.meta.url)).find(path => existsSync(path));
// Same packet/document contract as the integrated source; no Firebase writes.
const documentModule = { exports: {} };
const documentCode = await transform(readFileSync(shared, 'utf8'), { format: 'cjs' });
vm.runInNewContext(documentCode.code, { module: documentModule, exports: documentModule.exports });
const { buildWorkoutDoc } = documentModule.exports;
const { code } = await transform(readFileSync(new URL('./logExternalWorkout.js', import.meta.url), 'utf8'), { format: 'cjs' });

test('Skills and 6Pack completions save stable Fitness session documents and propagate save failures', async () => {
  const writes = [];
  let fail = false;
  const module = { exports: {} };
  vm.runInNewContext(code, {
    module, exports: module.exports,
    require: name => name === '@db' ? {
      getUid: () => 'fitness-user',
      saveSession: async (date, data, id) => {
        if (fail) throw new Error('offline write failed');
        writes.push({ date, data, id });
      },
    } : name.endsWith('workoutDoc.js') ? { buildWorkoutDoc } : { resolveExternalWorkoutFields },
  });
  for (const source of ['skills', 'sixpack']) {
    const workout = { app: source, source, runId: `${source}-run`, date: '2026-11-26', exercises: [{ name: 'Plank', sets: [30] }] };
    const result = await module.exports.logWorkoutAsSession(workout);
    const retry = await module.exports.logWorkoutAsSession(workout);
    assert.equal(result.id, `${source}-${source}-run`);
    assert.equal(retry.id, result.id);
    assert.equal(result.sessionData.userId, 'fitness-user');
    assert.equal(writes.at(-1).id, result.id);
  }
  fail = true;
  await assert.rejects(module.exports.logWorkoutAsSession({ app: 'skills', runId: 'failed' }), /offline write failed/);
});
