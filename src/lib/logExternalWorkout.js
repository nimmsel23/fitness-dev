import { saveSession, getUid } from '@db';
import { buildWorkoutDoc } from '../views/SixPack/workoutDoc.js';
import { resolveExternalWorkoutFields } from './externalWorkoutHost.js';

// Abgeschlossene Calisthenics-(Skills) und 6Pack-Workouts landen als eigene
// Session im Tages-Log (neben der Hauptsession, wie "Neues Workout" im
// Session-Tab). Das Dokument-Format (workoutDoc.js) entspricht dem Format der
// eigenständigen 6pack-dev-App — die Fitness-App liest beides gleich.
// Die Karten selbst kennen @db nicht und melden
// den Abschluss nur per onWorkoutComplete-Prop nach oben.
//
// Der Import oben löst nur auf, wenn der 6pack-Submodul-Alias
// (`vite-miniapp-submodules.mjs`) `src/views/SixPack` auf den 6pack-Checkout
// mappt. Die Datei liegt nicht in diesem Repo — Pfad nicht umbauen.
// `buildWorkoutDoc` vergibt die Doc-Id `${source}-${runId}`. app/source kommen
// vom Aufrufer (Host), sonst 'fitness'. Ein mitgegebenes runId bleibt erhalten,
// damit ein erneutes Senden dasselbe Dokument trifft.
export async function logWorkoutAsSession(workout = {}) {
  let userId = null;
  try { userId = getUid(); } catch { /* lokaler Modus ohne Login */ }

  const host = resolveExternalWorkoutFields(workout);
  const input = workout && typeof workout === 'object' ? workout : {};
  const { app: _app, source: _source, runId: _runId, ...rest } = input;
  const built = buildWorkoutDoc({
    ...rest,
    app: host.app,
    source: host.source,
    userId,
    ...(host.runId ? { runId: host.runId } : {}),
  });
  await saveSession(built.date, built.data, built.id);
  return { date: built.date, id: built.id, sessionData: built.data };
}
