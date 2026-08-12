# View Architecture: Session

Workout-Journal für Kraft- und Ausdauertraining. Zwei Session-Modi, Multi-Session pro Tag, Autosave, lokale Intelligenz (prevMap, Coverage-Gaps, Plan-Hint).

## Komponenten

- **`index.jsx`**: Thin Sub-Tab-Router — editor (default) / timer / skills / plan / history.
- **`useSession.js`**: State-Owner — Session-Modi, Multi-Session, Autosave/Flush, alle Handler.
- **`SessionEditor.jsx`**: Editor-Assembly — DateStrip + SessionSwitcher + ExerciseList/ActivitySection.
- **`SessionGateCard.jsx`**: großes Start/Stop-Gate für den Trainingstag inkl. laufender Session-Stoppuhr und Live-Notification-Anbindung.
- **`SessionHistory.jsx`**: Verlauf-SubTab — Timeline, Drag&Drop-Umdatierung.
- **`DateStrip.jsx`**: 7-Tage-Slider, Save-Button, Sidebar- und Settings-Trigger.
- **`SessionSwitcher.jsx`**: Multi-Session-Pills + Neu/Löschen (Löschen für jede Session der Tagesliste, auch die Hauptsession).
- **`ModeSwitcher.jsx`**: strength/cardio Umschalter.
- **`ExerciseList.jsx`**: Übungsliste + QuickInput + ExerciseSearchOverlay + Hint/Gap-Banner.
- **`ExerciseCard.jsx`**: Einzelübung — `setsArray` (multi-set), NxM-Expansion, Drop-Set, prevMap-Stats, Trend-Badge, Recovery.
- **`ActivitySection.jsx`**: Cardio-Logger — im `cardio`-Mode die gesamte Session.
- **`ActivityAddon.jsx`**: Optionaler Cardio-Anhang an eine Strength-Session.
- **`SidebarSheet.jsx`**: Bottom-Sheet mit SessionSidebar (Block, Ort, Dauer, Effort, Notizen, Exports).
- **`MuscleMapModal.jsx`**: Anterior/Posterior BodyMap aller Session-Exercises + Anatomie-Detail.
- **`SourceSettingsModal.jsx`**: Übungsquellen-Toggle (wger/yuhonas/coach) via localStorage.
- **`WorkoutTimerCard.jsx`**: reine Stoppuhr, lebt im `skills`-SubTab, Lime-Akzent (`#c8ff00`).
- **`SixPackPromiseCard.jsx`**: lebt im `timer`-SubTab. Eigenständiger Mini-Router (Home/Track/Day/Runner/Shuffle/Learn/Favorites/Selfies) nach dem Athlean-X "6 Pack Promise"-Vorbild — verifizierte echte Übungsnamen (Crucifix, Rolling Jackknifes, Canoe Crunches u.a. aus App-Reviews + Nutzer-Screenshots), 8-Wochen-Track mit Rest-Tagen an Tag 3/7, Timing nach Nutzerangabe (30/60s Arbeit, 5s Standard-Übergang, 1-2× 30/45s echte Pause pro Workout). Setzt `document.documentElement[data-theme]` auf `"sixpack"` solange gemountet (gleiches Pattern wie `SettingsContext.jsx`) — kippt die ganze App ins Rot/Schwarz-Theme (`styles/themes/sixpack.css`), stellt vorherigen Wert beim Verlassen wieder her.
- **`SkillsCard.jsx`**: lebt im `skills`-SubTab. Calisthenics-Skill-Liste (14 Skills, Thenics-App-Vorbild) mit Progressions-Kette im Thenics-Prinzip (aktuelle Stufe groß, nächste klein, weitere Stufen gesperrt bis "gemeistert"). Fortschritt pro Skill in localStorage. Setzt `data-theme="skills"` solange gemountet (`styles/themes/skills.css`, Lime-Akzent) — gleiches Pattern wie `SixPackPromiseCard.jsx`. Skill/Progressions-Daten aktuell im Component hardcodiert, **nicht** verbunden mit `fitness/catalog/kb/exercises/calisthenics/*.yml` (gleicher Inhalt, zwei Quellen — siehe AUDIT.md).

## Session-Modi

- **`strength`**: Krafttraining — ExerciseSection + optionaler ActivityAddon-Anhang.
- **`cardio`**: Ausdauer — nur ActivitySection, keine Exercises, keine Gap-Hints.

## Session Gate

Vor dem manuellen Editor liegt ein leichtgewichtiges `sessionGate` im selben Session-Dokument:

```json
{
  "sessionGate": {
    "status": "active|completed",
    "startedAt": "2026-08-09T11:23:00.000Z",
    "endedAt": "2026-08-09T12:14:00.000Z"
  }
}
```

- Start loggt sofort den Fakt "Workout läuft", auch ohne Übungen.
- Stop beendet die Session und füllt bei leerem `duration` automatisch grob die Minuten.
- Der manuelle Editor bleibt bewusst getrennt darunter für das Nachtragen.
- Eine aktive Session kann best-effort eine laufende App-Service-Worker-Benachrichtigung halten.

## Multi-Session pro Tag

Pro Tag können mehrere Sessions existieren. `id: null` = Hauptsession, `id: "<timestamp>"` = Suffix-Session. Switcher-Bar zeigt alle Sessions des Tages. "+ Neues Workout" legt eine neue Suffix-Session an. Löschen ist für jede Session der Tagesliste möglich — auch die Hauptsession (seit 2026-07, Klienten-Request).

## Autosave

Kein Zeit-Debounce mehr (seit 2026-07). `scheduleAutoSave()` setzt nur das `dirty`-Flag. Gespeichert wird an semantischen Commit-Punkten: sofort bei `addEx`/`addQuick`, sonst via `flushDirty()` bei Tab-Hide/`pagehide`, Unmount (Haupt-Tab-Wechsel), Datumswechsel, Session-Wechsel und neuem Workout. `saveRef`/`dirtyRef`/`dateRef` halten die aktuellen Closures (stale-closure Workaround); der `dateRef`-Guard verhindert, dass der `listSessionsForDate`-Nachlauf eines Flush-Saves nach Datumswechsel die frische Tagesliste überschreibt.

## Datenformat

```json
{
  "date": "2026-06-22",
  "sessionMode": "strength",
  "block": "Push",
  "exercises": [{ "id": "...", "name": "...", "setsArray": [{"reps": "8", "weight": "80"}], "primaryMuscles": [...] }],
  "effort": 8,
  "location": "",
  "duration": "",
  "notes": "",
  "activity": { "type": "hiit", "duration": "", "notes": "" }
}
```
