// Eine Session endet spätestens nach 3 h: ein vergessenes Stoppen lässt die
// Stoppuhr nicht endlos weiterlaufen, sondern gilt ab dann als beendet (Ende =
// Start + 3 h).
export const MAX_SESSION_GATE_MS = 3 * 60 * 60 * 1000;

export function normalizeSessionGate(value, nowMs = Date.now()) {
  if (!value || typeof value !== 'object') {
    return { status: 'idle', startedAt: null, endedAt: null, gps: null };
  }
  const startedAt = value.startedAt || null;
  let endedAt = value.endedAt || null;
  if (startedAt && !endedAt) {
    const startMs = Date.parse(startedAt);
    if (Number.isFinite(startMs) && nowMs - startMs >= MAX_SESSION_GATE_MS) {
      endedAt = new Date(startMs + MAX_SESSION_GATE_MS).toISOString();
    }
  }
  const gps = value.gps && typeof value.gps === 'object' ? {
    lat: Number.isFinite(Number(value.gps.lat)) ? Number(value.gps.lat) : null,
    lng: Number.isFinite(Number(value.gps.lng)) ? Number(value.gps.lng) : null,
    accuracy: Number.isFinite(Number(value.gps.accuracy)) ? Number(value.gps.accuracy) : null,
    capturedAt: value.gps.capturedAt || null,
    label: value.gps.label || null,
    mapsUrl: value.gps.mapsUrl || null,
    source: value.gps.source || null,
  } : null;
  let status = value.status || 'idle';
  if (startedAt && endedAt) status = 'completed';
  else if (startedAt) status = 'active';
  return { status, startedAt, endedAt, gps };
}

export function isSessionGateActive(sessionGate) {
  return normalizeSessionGate(sessionGate).status === 'active';
}

export function isSessionGateCompleted(sessionGate) {
  return normalizeSessionGate(sessionGate).status === 'completed';
}

export function sessionHasLoggedWorkout(session) {
  if (!session || typeof session !== 'object') return false;
  if (Array.isArray(session.exercises) && session.exercises.length > 0) return true;
  if (String(session.block || '').trim()) return true;
  if (session.activity) return true;
  const gate = normalizeSessionGate(session.sessionGate);
  return !!gate.endedAt;
}

export function getSessionGateElapsedMs(sessionGate, nowMs = Date.now()) {
  const gate = normalizeSessionGate(sessionGate, nowMs);
  if (!gate.startedAt) return 0;
  const startMs = Date.parse(gate.startedAt);
  if (!Number.isFinite(startMs)) return 0;
  const endMs = gate.endedAt ? Date.parse(gate.endedAt) : nowMs;
  if (!Number.isFinite(endMs) || endMs <= startMs) return 0;
  return endMs - startMs;
}

export function formatSessionGateElapsed(ms) {
  const totalSeconds = Math.max(0, Math.floor((ms || 0) / 1000));
  const hours = Math.floor(totalSeconds / 3600);
  const minutes = Math.floor((totalSeconds % 3600) / 60);
  const seconds = totalSeconds % 60;
  if (hours > 0) {
    return `${hours}:${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}`;
  }
  return `${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}`;
}

export function estimateDurationMinutes(sessionGate) {
  const elapsedMs = getSessionGateElapsedMs(sessionGate);
  if (elapsedMs <= 0) return '';
  return String(Math.max(1, Math.round(elapsedMs / 60000)));
}
