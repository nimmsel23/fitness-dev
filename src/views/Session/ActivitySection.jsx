/**
 * ActivitySection — Dedicated Cardio/Endurance Logger
 *
 * Used when sessionMode === 'cardio'. Replaces the old ExerciseSection entirely.
 *
 * Thin re-export (2026-09-05): die eigentliche UI lebt jetzt in
 * `ActivityPicker.jsx` (gemeinsam mit ActivityAddon.jsx, siehe dortige
 * Kommentare zu den bewusst NICHT gefixten Inkonsistenzen). Diese Datei
 * bleibt bestehen, um die bisherige Props-API unverändert zu halten.
 */

import ActivityPicker from './ActivityPicker';

export default function ActivitySection({ activity, setActivity }) {
  return <ActivityPicker mode="standalone" activity={activity} setActivity={setActivity} />;
}
