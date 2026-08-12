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
| `WorkoutTimerCard.jsx` | Hold-Timer (SubTab `skills`, Lime-Akzent `#c8ff00`) — Stoppuhr + "Hold loggen" während sie läuft (Zehntelsekunden-Genauigkeit für kurze Halte-Attempts), Bestzeit der Session hervorgehoben (Trophy-Icon) |
| `SixPackPromiseCard.jsx` | SubTab `timer` — eigenständiger 6-Pack-Promise-Nachbau (Home/Track/Day/Runner/Shuffle/Learn/Favorites/Selfies), setzt App-weit `data-theme="sixpack"` solange gemountet |
| `SkillsCard.jsx` | SubTab `skills` — Calisthenics-Skill-Liste (Push/Pull/Core-Gruppen, nur Icon-Header statt Text, keine Free/Pro-Trennung mehr — war zu viel zum Lesen) + Progressions-Kette im Thenics-Stil (aktuelle Stufe groß, nächste klein, Rest gesperrt bis gemeistert). Jede Progressionsstufe hat einen Typ (`reps` dynamisch oder `hold` isometrisch) + generisches Sets/Reps/Sekunden-Ziel (eigene Default-Werte 3×8 bzw. 3×15s, **nicht** aus der echten App verifiziert). "Workout starten" öffnet `WorkoutRunner` — 3-Phasen-Workout (eigenes Modell, nicht app-verifiziert): **Primär** (aktuelle Stufe, 150s Pause) → **Sekundär** (eine Stufe zurück, mehr Volumen, 75s Pause, entfällt bei Stufe 0) → **Conditioning** (Core/Gelenk-Übung passend zur Kategorie via `CONDITIONING_BY_CATEGORY`, 45s Pause). Pro Übung State-Machine `prep → work (Countdown bei hold, Reps-Stepper + "Satz erledigt" bei reps) → rest (Auto-Countdown, +30s/Skip-Buttons, Preview der nächsten Übung, Farbwechsel) → nächster Satz`. Sätze werden real geloggt (`log[blockIndex]`), am Ende zeigt `SessionSummary` Gesamtzeit + Volumen + Satz-für-Satz-Protokoll (z. B. "5 | 5 | 4" statt nur Summe) + RPE-Abfrage (Leicht/Optimal/Am Limit) + "Workout speichern"-Button, der erst dann persistiert. Zusätzlich eingebetteter freier Hold-Timer pro Stufe für Einzel-Attempts außerhalb eines strukturierten Workouts. Fortschritt + Meister-Verlauf + Hold-Historie + volles Workout-Session-Log (inkl. RPE, Satz-Protokoll) in localStorage. Deep-Link via `?skill=<id>` im URL-Hash (eigenständig verwaltet, nicht über App.jsx's Routing). Setzt App-weit `data-theme="skills"` solange gemountet (Lime-Theme, gleiches Pattern wie `SixPackPromiseCard.jsx`). **Freischaltung der nächsten Stufe bleibt weiterhin rein subjektiv** per "Stufe gemeistert"-Klick, unabhängig vom Workout-Runner — 1:1 wie die echte Thenics-App (kein Algorithmus, kein Performance-Test, der Runner führt nur durch die Sätze, er wertet sie nicht). Symmetrisch dazu: "↩ Eine Stufe zurücksetzen" (sichtbar sobald `stage > 0`, mit `confirm()`) für den Rückschritt-Fall — ändert nur `stage`, Verlauf/Holds/Sessions bleiben erhalten, Reset selbst landet als eigener (orange markierter) Eintrag im Verlauf statt stillschweigend zu verschwinden. Abbrechen eines laufenden Workouts (`onExit`) schreibt nichts in `progress` — nur `master`/`downgrade`/`logHold`/`logWorkout` sind Schreibpfade, alle explizite User-Aktionen; Workout-Performance und Stufen-Fortschritt sind komplett entkoppelt (auch 0 geschaffte Wiederholungen ändern `stage` nicht). Skill-Daten aktuell noch hardcodiert im Component (14 Skills, identisch zu `fitness/catalog/kb/exercises/calisthenics/*.yml`, aber nicht von dort geladen — siehe Auffälligkeiten). |
| `SessionEditor.jsx` | `SessionGateCard` ist kein inline Card-Element mehr, sondern ein Sheet (Portal, Bottom-Sheet), das öffnet wenn `currentSubTab === 'today'` (Nav-Klick auf "Heute"/"Session") — Editor bleibt darunter jederzeit erreichbar |

## Auffälligkeiten (2026-08-12)
- `SixPackPromiseCard.jsx`: Übungskategorisierung (Lower/Bottom-up/Top-down/Upper Abs) ist eigene fachliche Einordnung der 10 verifizierten echten Übungsnamen, nicht aus der App selbst bestätigt — vom Nutzer als Vitaltrainer ggf. zu korrigieren.
- `SkillsCard.jsx`: Skill/Progressions-Daten sind im Component hardcodiert (`SKILLS`-Array), obwohl es seit heute auch `kb/exercises/calisthenics/*.yml` mit identischem Inhalt gibt — kein API-Endpoint verbindet beide, zwei Quellen für dieselben Daten. Bei künftiger Änderung an einer Stelle die andere nicht vergessen (oder auf einen einzigen Ladepfad umstellen).
- `useSession.js` (`getRollingDays`, Zeile ~112): war fix 30 Tage — Date-Picker konnte nie weiter zurück (betraf Klient Matthias, konnte alte Workouts nicht nachloggen). **Gefixt**: Fenster auf 365 Tage erweitert, zusätzlich `DateStrip.jsx` bekam einen echten Kalender-Sprung (natives `<input type="date">`, Icon-Button links) statt nur 3-Tage-Klicks — `setDate()` funktioniert dort auch für Daten außerhalb der 365-Tage-`rollingDays` (nur die horizontale Strip-Hervorhebung greift dann nicht, die Session lädt trotzdem korrekt).
- `getSessionHistory(n)`-Limit (früher fix 60) ist jetzt `historyLimit`-State mit "Mehr laden"-Button in `SessionHistory.jsx` — Fix wirkt identisch für lokalen Dev-Build und Firebase-Prod, da beide `n` direkt in ihre jeweilige Query (Datei-Slice bzw. Firestore `limit(n)`) durchreichen.

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
