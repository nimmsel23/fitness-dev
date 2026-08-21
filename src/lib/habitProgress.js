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

// Tages-Punkte für eine Routine über die letzten `days` Kalendertage
// (HabitShare/Awesome-Habits-artige Dot-Grid-Optik). Ein Tag zählt als
// erledigt, wenn an diesem Tag ein completed Workout mit passender
// routine_id existiert (finished_at-Datum, lokale Zeitzone).
export function getRecentCompletionDays(routineId, workouts, days = 14) {
  const doneDates = new Set(
    (workouts || [])
      .filter((w) => w.routine_id === routineId && w.sessionState === "completed" && w.finished_at)
      .map((w) => w.finished_at.slice(0, 10))
  );
  const out = [];
  for (let i = days - 1; i >= 0; i--) {
    const d = new Date();
    d.setDate(d.getDate() - i);
    const iso = d.toISOString().slice(0, 10);
    out.push({ date: iso, done: doneDates.has(iso) });
  }
  return out;
}

// Streak = Anzahl aufeinanderfolgender abgeschlossener Perioden (Fenster =
// targetPeriodDays), rückwärts ab heute gezählt, in denen das Ziel erreicht
// wurde. Bricht bei der ersten verfehlten Periode ab (max. 26 Perioden
// zurück, verhindert Endlos-Suche bei sehr alten/leeren Daten).
export function computeStreak(routine, workouts) {
  const { targetCount, targetPeriodDays } = routine;
  if (!targetCount || !targetPeriodDays) return 0;
  const completions = (workouts || [])
    .filter((w) => w.routine_id === routine.id && w.sessionState === "completed" && w.finished_at)
    .map((w) => w.finished_at);

  let streak = 0;
  for (let period = 0; period < 26; period++) {
    const windowEnd = new Date();
    windowEnd.setDate(windowEnd.getDate() - period * targetPeriodDays);
    const windowStart = new Date(windowEnd);
    windowStart.setDate(windowStart.getDate() - targetPeriodDays);
    const startIso = windowStart.toISOString();
    const endIso = windowEnd.toISOString();
    const count = completions.filter((f) => f >= startIso && f < endIso).length;
    if (count >= targetCount) {
      streak++;
    } else {
      break;
    }
  }
  return streak;
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

// Wie pickNextRoutine, aber für Routinen innerhalb eines Trainingsplans
// (Makrozyklus) — die matchen gegen workouts nicht über ihre eigene id
// (rt_xxx, planintern), sondern über sourceTemplateId (die tatsächliche
// Template-Herkunft, gegen die auch das Ziel gezählt wird, siehe
// countCompletionsInPeriod). Handverdrahtete Plan-Routinen ohne
// sourceTemplateId (noch kein Template verknüpft) sind nie "dran".
export function pickNextPlanRoutine(planRoutines, workouts) {
  const eligible = (planRoutines || []).filter((r) => r.sourceTemplateId);
  if (eligible.length === 0) return null;

  const lastCompletedAt = {};
  for (const w of workouts || []) {
    if (w.sessionState !== "completed" || !w.routine_id || !w.finished_at) continue;
    if (!lastCompletedAt[w.routine_id] || w.finished_at > lastCompletedAt[w.routine_id]) {
      lastCompletedAt[w.routine_id] = w.finished_at;
    }
  }

  return eligible.slice().sort((a, b) => {
    const aDate = lastCompletedAt[a.sourceTemplateId] || "";
    const bDate = lastCompletedAt[b.sourceTemplateId] || "";
    return aDate.localeCompare(bDate);
  })[0];
}
