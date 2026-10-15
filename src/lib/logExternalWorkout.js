import { saveSession } from '@db';
import { localToday } from '@utils';

// Abgeschlossene Calisthenics-(Skills) und 6Pack-Workouts landen als eigene
// Kraft-Session im Tages-Log (neben der Hauptsession, wie "Neues Workout"
// im Session-Tab), statt nur in localStorage der jeweiligen Karte zu liegen.
// Die Karten selbst kennen @db nicht (6pack/ läuft auch standalone) und
// melden den Abschluss nur per onWorkoutComplete-Prop nach oben.
//
// exercises: [{ name, sets: [{ reps?, seconds? }] }]
export async function logWorkoutAsSession({ block, source, exercises, startedAt, endedAt, effort = null, notes = '' }) {
  const date = localToday();
  const id = `${source}-${Date.now().toString(36)}`;
  const start = new Date(startedAt || Date.now());
  const end = new Date(endedAt || Date.now());
  const rpe = Number(effort);

  const sessionData = {
    block,
    sessionMode: 'strength',
    source,
    exercises: exercises.map((ex) => ({
      id: `${source}-${ex.name}`.toLowerCase().replace(/[^a-z0-9]+/g, '-'),
      name: ex.name,
      source,
      setsArray: ex.sets.map((s) => ({
        reps: s.reps != null ? String(s.reps) : '',
        weight: '',
        ...(s.seconds != null ? { duration: s.seconds } : {}),
      })),
    })),
    effort: Number.isFinite(rpe) && rpe >= 1 && rpe <= 10 ? rpe : null,
    mood: '',
    notes,
    sessionGate: {
      status: 'completed',
      startedAt: start.toISOString(),
      endedAt: end.toISOString(),
      gps: null,
    },
    saved_at: end.toISOString(),
  };

  await saveSession(date, sessionData, id);
  return { date, id, sessionData };
}
