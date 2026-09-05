/**
 * ActivityAddon — Kompakter Activity-Anhang für Kraft-Sessions
 *
 * Gedacht für Finisher-Aktivitäten wie "5min HIIT Core" am Ende eines
 * Krafttrainings. Bleibt Teil derselben Session, keine neue Session nötig.
 *
 * Thin re-export (2026-09-05): die eigentliche UI lebt jetzt in
 * `ActivityPicker.jsx` (gemeinsam mit ActivitySection.jsx, siehe dortige
 * Kommentare zu den bewusst NICHT gefixten Inkonsistenzen). Diese Datei
 * bleibt bestehen, damit `ADDON_TYPES` (weiterhin von `SessionSlots.jsx`
 * und `ActivityAddonHistory.jsx` importiert) und die bisherige Props-API
 * unverändert funktionieren.
 */

import ActivityPicker, { ADDON_TYPES } from './ActivityPicker';

export { ADDON_TYPES };

export default function ActivityAddon({ hasActivity, setHasActivity, activity, setActivity }) {
  return (
    <ActivityPicker
      mode="addon"
      hasActivity={hasActivity}
      setHasActivity={setHasActivity}
      activity={activity}
      setActivity={setActivity}
    />
  );
}
