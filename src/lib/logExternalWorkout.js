import { saveSession, getUid } from '@db';
import { buildWorkoutDoc } from '../../6pack/workoutDoc.js';

// Abgeschlossene Calisthenics-(Skills) und 6Pack-Workouts landen als eigene
// Session im Tages-Log (neben der Hauptsession, wie "Neues Workout" im
// Session-Tab). Das Dokument-Format (workoutDoc.js) ist dasselbe, das auch das
// Standalone-6Pack schreibt — die Fitness-App liest beides gleich.
// Die Karten selbst kennen @db nicht (6pack/ läuft auch standalone) und melden
// den Abschluss nur per onWorkoutComplete-Prop nach oben.
export async function logWorkoutAsSession(workout) {
  let userId = null;
  try { userId = getUid(); } catch { /* lokaler Modus ohne Login */ }

  const built = buildWorkoutDoc({ ...workout, app: 'fitness', userId });
  await saveSession(built.date, built.data, built.id);
  return { date: built.date, id: built.id, sessionData: built.data };
}
