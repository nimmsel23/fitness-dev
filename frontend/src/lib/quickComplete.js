// Geteilte Quick-Complete-Logik: Routine/Template direkt als "heute erledigt"
// speichern, ohne Satz für Satz einzutragen. Fallback-Kette wie in
// WorkoutSession.jsx's SetRow.toggleCompleted(): echter Wert > letzte
// Performance (ghost) > Template-Zielwert. Genutzt von views/Plan/WorkoutList.jsx
// (Templates direkt) UND views/Plan/TrainingPlans.jsx (Templates innerhalb
// eines Plans) — eine Implementierung, zwei Aufrufer.
export function fillCompletedSet(s) {
  return {
    ...s,
    completed: true,
    reps: s.reps ?? s.ghostReps ?? s.targetReps ?? null,
    weight: s.weight ?? s.ghostWeight ?? s.targetWeight ?? null,
    distance: s.distance ?? s.ghostDistance ?? s.targetDistance ?? null,
    duration: s.duration ?? s.ghostDuration ?? s.targetDuration ?? null,
  };
}

export async function quickCompleteRoutine(api, routineId) {
  const created = await api.post(`/workouts`, { routine_id: routineId });
  const { workout } = await api.get(`/workouts/${created.id}`);
  const exercises = (workout.exercises || []).map((ex) => ({
    ...ex,
    sets: (ex.sets || []).map(fillCompletedSet),
  }));
  await api.patch(`/workouts/${created.id}`, {
    exercises,
    finished_at: new Date().toISOString(),
    sessionState: "completed",
  });
}

// Coach-Pendant: für "hab live mit dem Klienten trainiert, markiere das
// Template als heute erledigt". Nutzt createClientWorkout/getClientWorkout/
// updateClientWorkout aus @db (lokal via ?uid=-Override, Firestore via
// uidOverride-Parameter in workouts.js) statt views/Plan/api.js — die
// Self-Service-Dispatcher-Weiche kennt im Firestore-Modus kein clientUid.
export async function quickCompleteClientRoutine(dbFns, clientUid, routineId) {
  const { createClientWorkout, getClientWorkout, updateClientWorkout } = dbFns;
  const created = await createClientWorkout(clientUid, { routine_id: routineId });
  const { workout } = await getClientWorkout(clientUid, created.id);
  const exercises = (workout.exercises || []).map((ex) => ({
    ...ex,
    sets: (ex.sets || []).map(fillCompletedSet),
  }));
  await updateClientWorkout(clientUid, created.id, {
    exercises,
    finished_at: new Date().toISOString(),
    sessionState: "completed",
  });
}
