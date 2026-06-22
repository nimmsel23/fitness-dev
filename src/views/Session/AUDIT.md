# Audit: Session

## Zweck
Workout-Journal — Session-Logging mit Satz/Wdh/Gewicht, Session-Modi, intelligenten Empfehlungen und Anatomie-Visualisierung.

## Komponenten
| Datei | Zweck |
|-------|-------|
| `index.jsx` | State-Owner, Datenfluss, Orchestrator |
| `DateHeader.jsx` | Datum-Navigation (7-Tage-Slider), Save-Button, Sidebar-Trigger |
| `ExerciseSection.jsx` | Übungsliste + QuickInput + Search-Trigger |
| `ExerciseItem.jsx` | Einzelübung: setsArray, Trend-Badge, prevMap-Stats, Recovery |
| `ActivitySection.jsx` | Cardio-Logger (im Cardio-Mode die ganze Session) |
| `ActivityAddon.jsx` | Optionaler Cardio-Anhang an eine Strength-Session |
| `SessionSidebar.jsx` | Meta-Daten (Block, Ort, Dauer, Effort, Notizen, Exports) |
| `SidebarSheet.jsx` | Bottom-Sheet Wrapper für SessionSidebar |
| `MuscleMapModal.jsx` | Anterior/Posterior BodyMap + Anatomie-Detail-Chain |
| `SourceSettingsModal.jsx` | Übungsquellen-Toggle (wger/yuhonas/coach) via localStorage |
| `utils.js` | `getRollingDays`, `blockColor`, `DAY_LABELS` |

## Session-Modi

| Mode | Bedeutung |
|------|-----------|
| `strength` | Krafttraining — ExerciseSection + optionaler ActivityAddon |
| `cardio` | Ausdauer — nur ActivitySection, keine Exercises |

Umschaltbar per Mode-Switcher in der UI. Wird im Session-JSON als `sessionMode` gespeichert. Legacy-Sessions ohne `sessionMode` werden erkannt: hat eine Session `activity` aber keine Exercises → `cardio`.

## Multi-Session pro Tag

Pro Tag können mehrere Workouts existieren (`daySessions`-Array). Sessions haben entweder `id: null` (Hauptsession, Default) oder einen Suffix-String (Timestamp). Switcher-Bar oben zeigt alle Sessions des Tages als Buttons. "+ Neues Workout" legt eine Suffix-Session an.

## Autosave

Jede Änderung an Exercises, Block, Location etc. triggert `scheduleAutoSave()` — debounced 2500ms via `autoSaveTimer`. `saveRef.current` hält immer die aktuelle `save`-Closure (Workaround für stale-closure in setTimeout).

## Datenfluss
- `listSessionsForDate(date)` → alle Sessions des Tages laden
- `saveSession(date, data, sessionId)` → dual-write JSON + SQLite
- `getSessionHistory(60)` → prevMap + recentSessions aufbauen
- `getCoverageGaps(recentDays, coverageThreshold)` → Gap-Hints (nur im Strength-Mode)
- `getPlanSuggestion(date)` → Plan-Hint
- `getExercise(id)` → Muskel-Enrichment beim Hinzufügen
- `queueForEnrichment(ex)` → fire-and-forget für non-expert Sources
- `exportFitnessData()` → Obsidian-Sync

## Kernfeatures (müssen nach jedem Refactoring erhalten bleiben)
- **prevMap** — Previous-Stats (Datum + Sätze/Gewicht) unter jeder Übung, aus letzten 60 Sessions
- **restHours** — Stunden seit letztem Training mit gleichem Block/trainingsart
- **muscleRecovery** — Recovery-Hours pro Muskel im ExerciseItem
- **Gap-Hints** — rote Coverage-Lücken-Badges, nur im Strength-Mode
- **Plan-Hint** — Zap-Banner mit Vorschlag für heutigen Block
- **Multi-Session** — mehrere Workouts pro Tag über daySessions + Switcher-Bar
- **Autosave** — debounced 2500ms nach jeder Änderung
- **BodyMap** — zeigt alle Exercises der Session (kein `done: true`-Filter)

## Auffälligkeiten
- `trainingsart` wird geladen/gesetzt/gespeichert aber hat kein UI-Eingabefeld — wird intern für `restHours`-Berechnung genutzt (`s.trainingsart === block`)
- `coachFeedback` wird geladen und an SidebarSheet übergeben — unklar ob dort editierbar
