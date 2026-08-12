# Audit: Session

## Zweck
Workout-Journal — Session-Logging mit Satz/Wdh/Gewicht, Session-Modi, intelligenten Empfehlungen und Anatomie-Visualisierung.

## Komponenten
| Datei | Zweck |
|-------|-------|
| `index.jsx` | Thin Sub-Tab-Router: editor (default) / timer / skills / plan / history |
| `useSession.js` | State-Owner, alle Handler, Autosave/Flush, Datenfluss |
| `SessionEditor.jsx` | Editor-Assembly: DateStrip + Switcher + ExerciseList/ActivitySection | 
| `SessionGateCard.jsx` | Großer Start/Stop-Einstieg für Trainingstag, Timer, Live-Status-Notification |
| `SessionHistory.jsx` | Verlauf-SubTab: Timeline, Drag&Drop-Umdatierung |
| `DateStrip.jsx` | Datum-Navigation (7-Tage-Slider), Save-Button, Sidebar/Settings-Trigger |
| `SessionSwitcher.jsx` | Multi-Session-Pills + Neu/Löschen (Löschen für jede Session der Tagesliste, auch Hauptsession) |
| `ModeSwitcher.jsx` | strength/cardio Umschalter |
| `ExerciseList.jsx` | Übungsliste + QuickInput + Search-Trigger + Hint/Gap-Banner |
| `ExerciseCard.jsx` | Einzelübung: setsArray, NxM-Expansion, Drop-Set, Trend, prevMap, Recovery |
| `ActivitySection.jsx` | Cardio-Logger (im Cardio-Mode die ganze Session) |
| `ActivityAddon.jsx` | Optionaler Cardio-Anhang an eine Strength-Session |
| `SessionSidebar.jsx` | Meta-Daten (Block, Ort, Dauer, Effort, Notizen, Exports) |
| `SidebarSheet.jsx` | Bottom-Sheet Wrapper für SessionSidebar |
| `MuscleMapModal.jsx` | Anterior/Posterior BodyMap + Anatomie-Detail-Chain |
| `SourceSettingsModal.jsx` | Übungsquellen-Toggle (wger/yuhonas/coach) via localStorage |
| `utils.js` | `getRollingDays`, `blockColor`, `DAY_LABELS` |
| `WorkoutTimerCard.jsx` | reine Stoppuhr, SubTab `skills`, Lime-Akzent (`#c8ff00`) |
| `SixPackPromiseCard.jsx` | SubTab `timer` — eigenständiger 6-Pack-Promise-Nachbau (Home/Track/Day/Runner/Shuffle/Learn/Favorites/Selfies), setzt App-weit `data-theme="sixpack"` solange gemountet |
| `SkillsCard.jsx` | SubTab `skills` — Calisthenics-Skill-Liste + Progressions-Kette im Thenics-Stil (aktuelle Stufe groß, nächste klein, Rest gesperrt bis gemeistert), Fortschritt in localStorage. Setzt App-weit `data-theme="skills"` solange gemountet (Lime-Theme, gleiches Pattern wie `SixPackPromiseCard.jsx`). Skill-Daten aktuell noch hardcodiert im Component (14 Skills, identisch zu `fitness/catalog/kb/exercises/calisthenics/*.yml`, aber nicht von dort geladen — siehe Auffälligkeiten). |

## Auffälligkeiten (2026-08-12)
- `SixPackPromiseCard.jsx`: Übungskategorisierung (Lower/Bottom-up/Top-down/Upper Abs) ist eigene fachliche Einordnung der 10 verifizierten echten Übungsnamen, nicht aus der App selbst bestätigt — vom Nutzer als Vitaltrainer ggf. zu korrigieren.
- `SkillsCard.jsx`: Skill/Progressions-Daten sind im Component hardcodiert (`SKILLS`-Array), obwohl es seit heute auch `kb/exercises/calisthenics/*.yml` mit identischem Inhalt gibt — kein API-Endpoint verbindet beide, zwei Quellen für dieselben Daten. Bei künftiger Änderung an einer Stelle die andere nicht vergessen (oder auf einen einzigen Ladepfad umstellen).

## Session-Modi

| Mode | Bedeutung |
|------|-----------|
| `strength` | Krafttraining — ExerciseSection + optionaler ActivityAddon |
| `cardio` | Ausdauer — nur ActivitySection, keine Exercises |

Umschaltbar per Mode-Switcher in der UI. Wird im Session-JSON als `sessionMode` gespeichert. Legacy-Sessions ohne `sessionMode` werden erkannt: hat eine Session `activity` aber keine Exercises → `cardio`.

## Session Gate

Zusätzlich zum bestehenden manuellen Workout-Editor kann eine Session jetzt ein `sessionGate` enthalten:

- `startedAt` markiert den Start des Workouts.
- `endedAt` markiert das Ende.
- ohne Übungen/Activity zählt ein gestartetes oder beendetes Gate trotzdem als geloggter Trainingstag.
- die Oberfläche bleibt absichtlich zweistufig: erst Start/Stop, dann optionales Nachtragen.
- `gps` wird beim Start einmalig erfasst (15s Timeout, `enableHighAccuracy`, Fehlgrund `denied`/`timeout`/`unavailable` landet als Toast) und client-seitig via `lib/geoLocate.js` (Overpass + Nominatim, kein API-Key, kein Server-Roundtrip) aufgelöst: nächstes Gym (250m Radius) > Adresse > rohe Koordinaten. Client-seitig bewusst statt Server-Endpoint, weil der Firebase-Hosting-Build `server.mjs` nicht erreicht. Befüllt `location` nur wenn leer, liefert zusätzlich `mapsUrl` für den Navigation-Icon-Link im Location-Feld.

## Multi-Session pro Tag

Pro Tag können mehrere Workouts existieren (`daySessions`-Array). Sessions haben entweder `id: null` (Hauptsession, Default) oder einen Suffix-String (Timestamp). Switcher-Bar oben zeigt alle Sessions des Tages als Buttons. "+ Neues Workout" legt eine Suffix-Session an. Löschen ist für jede Session der Tagesliste möglich — auch die Hauptsession (seit 2026-07-13, Klienten-Request).

## Autosave / Dirty-Flush

Kein Zeit-Debounce mehr. `scheduleAutoSave()` setzt nur das `dirty`-Flag; gespeichert wird an semantischen Commit-Punkten: sofort bei `addEx`/`addQuick`, sonst via `flushDirty()` bei Tab-Hide/`pagehide`, Unmount (Haupt-Tab-Wechsel), Datumswechsel, Session-Wechsel und neuem Workout. `saveRef`/`dirtyRef`/`dateRef` halten die aktuellen Closures (stale-closure Workaround); der `dateRef`-Guard verhindert, dass der `listSessionsForDate`-Nachlauf eines Flush-Saves nach Datumswechsel die frische Tagesliste überschreibt.

## Datenfluss
- `listSessionsForDate(date)` → alle Sessions des Tages laden — liefert **volle** Session-Objekte (Contract identisch in local `/sessions` + Firestore; meta-only war der Datenverlust-Bug bis 2026-07-12)
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
- **Autosave** — Save an Commit-Punkten (addEx/addQuick) + Dirty-Flush bei Tab-Hide, Unmount, Datums-/Session-Wechsel
- **BodyMap** — zeigt alle Exercises der Session (kein `done: true`-Filter)

## Auffälligkeiten
- `coachFeedback` wird geladen und an SidebarSheet übergeben — unklar ob dort editierbar
