# Audit: Session

## Zweck
Workout-Journal — Session-Logging mit Satz/Wdh/Gewicht, intelligenten Empfehlungen und Anatomie-Visualisierung.

## Komponenten
| Datei | Zweck | Zeilen |
|-------|-------|--------|
| `index.jsx` | State-Owner, Datenfluss, Orchestrator | 357 |
| `DateHeader.jsx` | Datum-Navigation (7-Tage-Slider), Save-Button, Sidebar-Trigger | 119 |
| `ExerciseSection.jsx` | Übungsliste + QuickInput + Search-Trigger | 96 |
| `ExerciseItem.jsx` | Einzelübung: Sets/Reps, Trend-Badge, prev-Stats, Recovery | 173 |
| `ActivitySection.jsx` | Optionale Non-Strength-Activity (Wandern, Laufen etc.) | 33 |
| `SessionSidebar.jsx` | Meta-Daten (Block, Ort, Dauer, Effort, Notizen, Exports) | 151 |
| `SidebarSheet.jsx` | Bottom-Sheet Wrapper für SessionSidebar | 38 |
| `MuscleMapModal.jsx` | Anterior/Posterior BodyMap + Anatomie-Detail-Chain | 65 |
| `SourceSettingsModal.jsx` | Übungsquellen-Toggle (wger/yuhonas/coach) via localStorage | 57 |
| `SectionHeader.jsx` | Wiederverwendbare Section-Überschrift | — |
| `utils.js` | `getRollingDays`, `blockColor`, `DAY_LABELS`, `num` | — |

## Datenfluss
- `getSession(date)` → Session laden
- `saveSession(date, data)` → dual-write JSON + SQLite
- `getSessionHistory(60)` → prevMap + recentSessions aufbauen
- `getCoverageGaps(7)` → Gap-Hints
- `getPlanSuggestion(date)` → Plan-Hint
- `getExercise(id)` → Muskel-Enrichment beim Hinzufügen
- `getProgressTrend(name)` → Trend-Badge (in ExerciseItem)
- `getMuscle(id)` → Anatomie-Detail (in MuscleMapModal)
- `exportFitnessData()` → Obsidian-Sync
- `queueForEnrichment(ex)` → Enrichment-Queue für non-expert Sources

## Kernfeatures (müssen nach jedem Refactoring erhalten bleiben)
- **prevMap** — Previous-Stats (Datum + Sätze/Gewicht) unter jeder Übung
- **restHours** — Stunden seit letztem gleichen Block-Training
- **muscleRecovery** — Recovery-Hours pro Muskel im ExerciseItem
- **getProgressTrend** — Trend-Badge (↑/↓ %) im ExerciseItem
- **Gap-Hints** — rote Coverage-Lücken-Badges über Exercises
- **Plan-Hint** — Zap-Banner mit Vorschlag für heutigen Block
- **doneExercises** — nur `done: true` Übungen im MuscleMapModal
- **BodyMap** zeigt ausschließlich abgehakte Übungen (kein Preview)

## Inline-Code (Extraktionskandidaten)
- `buildSessionCoachSheet` kommt aus `lib/exerciseInsights.js` — passt, bleibt dort
- `showDetails`-State in ExerciseItem existiert, steuert nur CSS-Shadow — kein UI expandiert davon (halbfertiger Detail-Bereich)
- `trainingsart`-State in index.jsx gesetzt, nirgendwo gerendert

## Auffälligkeiten
- `showDetails` + `ChevronDown/ChevronUp/Minus/Target/Activity` Imports in ExerciseItem deuten auf eine entfernte Detail-Sektion hin — Nutzung fehlt, nicht die Imports
- `trainingsart` wird geladen/gesetzt aber nie angezeigt — unklar ob Feature geplant oder vergessen
- `date`-Prop wurde aus ExerciseItem entfernt (heute) — falls künftig nötig wieder hinzufügen
- `num` aus utils.js war importiert aber ungenutzt (heute entfernt) — utils.js enthält `num`, Verwendungszweck unklar

## Status
**okay** — sauber modularisiert nach heutigem Refactoring. Zwei tote State-Variablen (`showDetails`-Logik, `trainingsart`) zur späteren Klärung.
