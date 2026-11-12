// Host fields for a workout logged into the fitness session collection.
// `buildWorkoutDoc` (6pack) keys the document `${source}-${runId}`, so a
// caller-supplied runId keeps that id stable across retries.

function text(value) {
  return typeof value === 'string' ? value.trim() : '';
}

export function resolveExternalWorkoutFields(workout) {
  const input = workout && typeof workout === 'object' ? workout : {};
  const appIn = text(input.app);
  const sourceIn = text(input.source);
  const app = appIn || sourceIn || 'fitness';
  const source = sourceIn || appIn || 'fitness';
  const runId = text(input.runId);
  return { app, source, ...(runId ? { runId } : {}) };
}
