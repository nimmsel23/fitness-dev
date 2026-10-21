// Programm-Fortschritt (Track-View) pro User: Merge lokal ↔ Firestore.
// Pfad: users/{uid}/meta/sixpack (von `match /users/{uid}/{document=**}` gedeckt).
// Reine Funktionen, damit sie ohne Firebase testbar sind.

const uniqSorted = (...lists) => [...new Set(lists.flat())].filter(Number.isFinite).sort((a, b) => a - b);

// Neuerer Stand (updatedAt) gewinnt bei currentDay/lastCompletedOn/restDate;
// erledigte Tage und generierte Workouts werden vereinigt, damit nichts verloren geht.
export function mergePrograms(local, remote) {
  if (!remote) return local;
  const remoteNewer = (remote.updatedAt || 0) > (local.updatedAt || 0);
  const newer = remoteNewer ? remote : local;
  const older = remoteNewer ? local : remote;
  const { saved_at, ...rest } = newer;
  return {
    ...rest,
    completedDays: uniqSorted(local.completedDays || [], remote.completedDays || []),
    completedOn: { ...(older.completedOn || {}), ...(newer.completedOn || {}) },
    workouts: { ...(older.workouts || {}), ...(newer.workouts || {}) },
    settings: { ...(older.settings || {}), ...(newer.settings || {}) },
    updatedAt: Math.max(local.updatedAt || 0, remote.updatedAt || 0),
  };
}

// Firestore verträgt kein undefined; JSON-Roundtrip entfernt es.
export function serializeProgram(program) {
  return JSON.parse(JSON.stringify(program));
}

// Tracker manuell auf einen Programm-Tag setzen (Navigation im Track-View).
// Ruhetag: heute ist Ruhetag (restDate), sonst Training heute möglich (lastCompletedOn zurücksetzen).
export function setTrackerDay(program, day, rest, today, now = Date.now()) {
  return {
    ...program,
    currentDay: day,
    lastCompletedOn: rest ? program.lastCompletedOn : null,
    restDate: rest ? today : null,
    updatedAt: now,
  };
}
