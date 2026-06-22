# View Architecture: Session

Workout-Journal für Kraft- und Ausdauertraining. Zwei Session-Modi, Multi-Session pro Tag, Autosave, lokale Intelligenz (prevMap, Coverage-Gaps, Plan-Hint).

## Komponenten

- **`index.jsx`**: State-Owner — Session-Modi, Multi-Session, Autosave, alle Handler.
- **`DateHeader.jsx`**: 7-Tage-Slider, Save-Button, Sidebar- und Settings-Trigger.
- **`ExerciseSection.jsx`**: Übungsliste + QuickInput + ExerciseSearchOverlay.
- **`ExerciseItem.jsx`**: Einzelübung — `setsArray` (multi-set), prevMap-Stats, Trend-Badge, Recovery.
- **`ActivitySection.jsx`**: Cardio-Logger — im `cardio`-Mode die gesamte Session.
- **`ActivityAddon.jsx`**: Optionaler Cardio-Anhang an eine Strength-Session.
- **`SidebarSheet.jsx`**: Bottom-Sheet mit SessionSidebar (Block, Ort, Dauer, Effort, Notizen, Exports).
- **`MuscleMapModal.jsx`**: Anterior/Posterior BodyMap aller Session-Exercises + Anatomie-Detail.
- **`SourceSettingsModal.jsx`**: Übungsquellen-Toggle (wger/yuhonas/coach) via localStorage.

## Session-Modi

- **`strength`**: Krafttraining — ExerciseSection + optionaler ActivityAddon-Anhang.
- **`cardio`**: Ausdauer — nur ActivitySection, keine Exercises, keine Gap-Hints.

## Multi-Session pro Tag

Pro Tag können mehrere Sessions existieren. `id: null` = Hauptsession, `id: "<timestamp>"` = Suffix-Session. Switcher-Bar zeigt alle Sessions des Tages. "+ Neues Workout" legt eine neue Suffix-Session an.

## Autosave

Jede Änderung triggert `scheduleAutoSave()` — debounced 2500ms. `saveRef.current` hält immer die aktuelle `save`-Closure (stale-closure Workaround für setTimeout).

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
