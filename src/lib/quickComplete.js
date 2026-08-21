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

// uid optional: gesetzt, wenn der Coach im Namen eines Klienten quick-
// completed (hängt ?uid= an jeden Call, analog zu den anderen
// Coach-Schreibpfaden in lib/db/local|firestore/coach.js).
export async function quickCompleteRoutine(api, routineId, uid = null) {
  const q = uid ? `?uid=${encodeURIComponent(uid)}` : "";
  const created = await api.post(`/workouts${q}`, { routine_id: routineId });
  const { workout } = await api.get(`/workouts/${created.id}${q}`);
  const exercises = (workout.exercises || []).map((ex) => ({
    ...ex,
    sets: (ex.sets || []).map(fillCompletedSet),
  }));
  await api.patch(`/workouts/${created.id}${q}`, {
    exercises,
    finished_at: new Date().toISOString(),
    sessionState: "completed",
  });
}
