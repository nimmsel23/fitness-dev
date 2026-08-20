// Gemeinsame Fortschritts-Logik für Routinen-als-Habit (targetCount/
// targetPeriodDays auf einer Routine, "done" = abgeschlossenes Workout mit
// passender routine_id im rollierenden Zeitfenster). Genutzt von
// views/Plan/WorkoutList.jsx (Self-Service, eigener Fortschritt) UND
// views/Coach/ClientsPanel.jsx (Coach beobachtet Klienten-Fortschritt,
// read-only) — eine Formel, zwei Konsumenten.

export function countCompletionsInPeriod(routineId, workouts, periodDays) {
  if (!periodDays) return 0;
  const cutoff = new Date();
  cutoff.setDate(cutoff.getDate() - periodDays);
  const cutoffIso = cutoff.toISOString();
  return workouts.filter((w) =>
    w.routine_id === routineId && w.sessionState === "completed" && w.finished_at && w.finished_at >= cutoffIso
  ).length;
}

export function computeHabitProgress(routines, workouts) {
  const targeted = (routines || []).filter((r) => r.targetCount > 0 && r.targetPeriodDays > 0);
  const rows = targeted.map((r) => ({
    routine: r,
    done: countCompletionsInPeriod(r.id, workouts, r.targetPeriodDays),
  }));
  const allMet = rows.length > 0 && rows.every(({ routine, done }) => done >= routine.targetCount);
  return { rows, allMet };
}

// Habit-artige Rotation (Vorbild TodayPlan.jsx bei Coach-Makrozyklen): die
// Routine, die am längsten nicht abgeschlossen wurde, ist "dran". Nie
// abgeschlossen zählt als am längsten überfällig (sortiert zuerst).
export function pickNextRoutine(routines, workouts) {
  const eligible = (routines || []).filter((r) => r.category !== "calisthenics-skill");
  if (eligible.length === 0) return null;

  const lastCompletedAt = {};
  for (const w of workouts || []) {
    if (w.sessionState !== "completed" || !w.routine_id || !w.finished_at) continue;
    if (!lastCompletedAt[w.routine_id] || w.finished_at > lastCompletedAt[w.routine_id]) {
      lastCompletedAt[w.routine_id] = w.finished_at;
    }
  }

  return eligible.slice().sort((a, b) => {
    const aDate = lastCompletedAt[a.id] || "";
    const bDate = lastCompletedAt[b.id] || "";
    return aDate.localeCompare(bDate);
  })[0];
}
