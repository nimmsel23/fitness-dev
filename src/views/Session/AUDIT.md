# Audit: Session

## Zweck
Workout-Journal — Session-Logging mit Satz/Wdh/Gewicht, Session-Modi, intelligenten Empfehlungen und Anatomie-Visualisierung.

## Komponenten
| Datei | Zweck |
|-------|-------|
| `index.jsx` | Thin Sub-Tab-Router: editor (default) / timer / skills / plan / history |
| `useSession.js` | State-Owner, alle Handler, Autosave/Flush, Datenfluss |
| `SessionEditor.jsx` | Editor-Assembly: SessionHeader + ExerciseList + ActivityAddon (Basis-Abschnitt) + SessionSlots (zusätzliche Abschnitte) / ActivitySection (Cardio-Mode) |
| `SessionSlots.jsx` | Zusätzliche, frei benannte Abschnitte einer Strength-Session (seit 2026-08-25) — additiv zum Basis-Abschnitt, kein Ersatz. Jeder Slot kombiniert frei Übungen + Activity + Notiz, Slot-Inhalt 1:1 als "Baustein" pro Trainingsblock speicherbar (`slotTemplates.js`) |
| `SessionGateCard.jsx` | Großer Start/Stop-Einstieg für Trainingstag, Timer, Live-Status-Notification |
| `SessionHistory.jsx` | Verlauf-SubTab: Timeline, Drag&Drop-Umdatierung |
| `SessionHeader.jsx` | Konsolidierter Header (2026-08-20, "Concept A/Ruhig"): ersetzt `DateStrip.jsx` + `SessionSwitcher.jsx` + `ModeSwitcher.jsx` (alle drei gelöscht) — Titel-Zeile mit Kalender-Sprung + Overflow-Menü (Session-Details/Übungsquellen) statt vier Icon-Buttons, flacher Day-Strip ohne Boxen, Session-Pills + Kraft/Ausdauer-Underline-Tabs in einer Zeile |
| `useDayStrip.js` | Aus `DateStrip.jsx` extrahierte Day-Strip-Logik (Fensterung/Navigation), von `SessionHeader.jsx` genutzt |
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
| `SkillsCard.jsx` | SubTab `skills` — Calisthenics-Skill-Liste (Push/Pull/Core-Gruppen, nur Icon-Header statt Text, keine Free/Pro-Trennung mehr — war zu viel zum Lesen) + Progressions-Kette im Thenics-Stil (aktuelle Stufe groß, nächste klein, Rest gesperrt bis gemeistert). Jede Progressionsstufe hat einen Typ (`reps` dynamisch oder `hold` isometrisch) + generisches Sets/Reps/Sekunden-Ziel (eigene Default-Werte 3×8 bzw. 3×15s, **nicht** aus der echten App verifiziert). "Workout starten" öffnet `WorkoutRunner` — 3-Phasen-Workout (eigenes Modell, nicht app-verifiziert): **Primär** (aktuelle Stufe, 150s Pause) → **Sekundär** (eine Stufe zurück, mehr Volumen, 75s Pause, entfällt bei Stufe 0) → **Conditioning** (Core/Gelenk-Übung passend zur Kategorie via `CONDITIONING_BY_CATEGORY`, 45s Pause). Pro Übung State-Machine `prep → work (Countdown bei hold, Reps-Stepper + "Satz erledigt" bei reps) → rest (Auto-Countdown, +30s/Skip-Buttons, Preview der nächsten Übung, Farbwechsel) → nächster Satz`. Sätze werden real geloggt (`log[blockIndex]`), am Ende zeigt `SessionSummary` Gesamtzeit + Volumen + Satz-für-Satz-Protokoll (z. B. "5 | 5 | 4" statt nur Summe) + RPE-Abfrage (Leicht/Optimal/Am Limit) + "Workout speichern"-Button, der erst dann persistiert. `WorkoutArchive` unter dem "Workout starten"-Button: read-only, aufklappbare Liste vergangener Sessions (Datum, Gesamtzeit, Volumen, RPE), Klick öffnet Satz-für-Satz-Detail pro Übung — exakte Kopie des `SessionSummary`-Protokolls. Nichts im Code editiert `sessions[]` nachträglich (kein update/delete), auch ein späterer Downgrade lässt die Archiv-Einträge unangetastet. Zusätzlich eingebetteter freier Hold-Timer pro Stufe für Einzel-Attempts außerhalb eines strukturierten Workouts. Fortschritt + Meister-Verlauf + Hold-Historie + volles Workout-Session-Log (inkl. RPE, Satz-Protokoll) in localStorage. Deep-Link via `?skill=<id>` im URL-Hash (eigenständig verwaltet, nicht über App.jsx's Routing). Setzt App-weit `data-theme="skills"` solange gemountet (Lime-Theme, gleiches Pattern wie `SixPackPromiseCard.jsx`). **Update 2026-08-12 (Kurskorrektur nutzerbestätigt):** Freischaltung ist NICHT mehr rein subjektiv — der manuelle "Stufe gemeistert"-Button bleibt zusätzlich bestehen, aber `WorkoutRunner` prüft jetzt nach jedem Workout `metTarget` (alle Sätze der **Primär**-Übung ≥ Zielwert, Sekundär/Conditioning zählen nicht) und ruft bei Erfüllung automatisch `onMaster()` mit auf — Workout-Log dient als Beweis. `SessionSummary` zeigt vor dem Speichern einen Hinweis, wenn das Ziel erreicht ist. Bei Hold-Typ-Übungen ist das aktuell trivial immer erfüllt, da der Countdown im Runner immer vollständig durchläuft (keine Möglichkeit, einen Hold vorzeitig als "nicht geschafft" zu markieren) — Auffälligkeit, siehe unten. Symmetrisch dazu: "↩ Eine Stufe zurücksetzen" (sichtbar sobald `stage > 0`, mit `confirm()`) für den Rückschritt-Fall — ändert nur `stage`, Verlauf/Holds/Sessions bleiben erhalten, Reset selbst landet als eigener (orange markierter) Eintrag im Verlauf statt stillschweigend zu verschwinden. Abbrechen eines laufenden Workouts (`onExit`) schreibt nichts in `progress` — nur `master`/`downgrade`/`logHold`/`logWorkout` sind Schreibpfade, alle explizite User-Aktionen; Workout-Performance und Stufen-Fortschritt sind komplett entkoppelt (auch 0 geschaffte Wiederholungen ändern `stage` nicht). Skill-Daten aktuell noch hardcodiert im Component (14 Skills, identisch zu `fitness/catalog/kb/exercises/calisthenics/*.yml`, aber nicht von dort geladen — siehe Auffälligkeiten). Zwei Analytics-Charts (recharts): `SkillLevelChart` (Treppendiagramm, Stufe über Zeit aus `history`) und `VolumeChart` (Liniendiagramm, Volumen pro Übung mit Dropdown-Auswahl aus `sessions`, ab 2 Datenpunkten). Muscle-Up-Stufe 1 "Klimmzüge" auf 4×8 korrigiert (Nutzer-Recherche), Rest weiterhin generische Defaults. |
| Dritte Datenquelle: Plan-Tab hat zusätzlich 14 "Skill: <Name>"-Routinen (Strong-Modell, `category: "calisthenics-skill"`), die aus denselben Skills generiert wurden — listen aber alle Progressionsstufen einer Skill gleichzeitig als flache Übungsliste statt stage-aware wie SkillsCard. Komplett unsynchronisiert mit #1/#2 (siehe Task "Skills/6Pack Learn-Tab-Überschneidung", Konsolidierung noch offen). |
| `SessionEditor.jsx` | `SessionGateCard` ist kein inline Card-Element mehr, sondern ein Sheet (Portal, Bottom-Sheet), das öffnet wenn `currentSubTab === 'today'` (Nav-Klick auf "Heute"/"Session") — Editor bleibt darunter jederzeit erreichbar |

## Auffälligkeiten (2026-08-25)
- `SessionSlots.jsx` (neu): erste Version machte den Fehler, `ActivityAddon` als "obsolet" aus `SessionEditor.jsx` zu entfernen — nutzerkorrigiert: der Basis-Abschnitt (ExerciseList + ActivityAddon) bleibt unverändert, Slots sind rein additive Extra-Abschnitte danach, kein Ersatz. Erste Slot-UI war zudem zu klickintensiv (Label-Edit-Modus, Uhrzeit-Klick-zum-Öffnen, 10-Button-Activity-Grid, zweistufiges Anlegen) — auf direkte Inline-Inputs + Dropdown + Ein-Schritt-Eingabe vereinfacht.

## Auffälligkeiten (2026-08-20)
- `SessionEditor.jsx`: **Gefixt (2026-08-22).** Gate-Sheet öffnete vorher über die normale Navigation nie automatisch, weil `subTab === 'today'` durch `App.jsx`s URL-Routing nie gesetzt wurde. Jetzt setzt `parseHashRoute()` `subTab = 'today'` explizit bei jedem Einstieg ohne explizites Datum (leerer Hash/PWA-Start-URL, oder `#session/today`) — ein Deep-Link mit explizitem ISO-Datum (Dashboard/Review) setzt weiterhin kein `subTab` und öffnet das Gate nicht.
- `SplitPicker.jsx`: Split-Auswahl leitet sich jetzt automatisch aus den eingetragenen Übungen ab (`inferBlockFromExercises()` in `utils.js`), solange der User selbst noch nichts gewählt hat. `EffortPicker.jsx` (neu) zeigt RPE direkt unter dem SplitPicker statt nur in der Sidebar.

## Auffälligkeiten (2026-08-12)
- `SixPackPromiseCard.jsx`: Übungskategorisierung (Lower/Bottom-up/Top-down/Upper Abs) ist eigene fachliche Einordnung der 10 verifizierten echten Übungsnamen, nicht aus der App selbst bestätigt — vom Nutzer als Vitaltrainer ggf. zu korrigieren.
- `SkillsCard.jsx`: Skill/Progressions-Daten sind im Component hardcodiert (`SKILLS`-Array), obwohl es seit heute auch `kb/exercises/calisthenics/*.yml` mit identischem Inhalt gibt — kein API-Endpoint verbindet beide, zwei Quellen für dieselben Daten. Bei künftiger Änderung an einer Stelle die andere nicht vergessen (oder auf einen einzigen Ladepfad umstellen).
- `useSession.js` (`getRollingDays`, Zeile ~112): war fix 30 Tage — Date-Picker konnte nie weiter zurück (betraf Klient Matthias, konnte alte Workouts nicht nachloggen). **Gefixt**: Fenster auf 365 Tage erweitert, zusätzlich `DateStrip.jsx` bekam einen echten Kalender-Sprung (natives `<input type="date">`, Icon-Button links) statt nur 3-Tage-Klicks — `setDate()` funktioniert dort auch für Daten außerhalb der 365-Tage-`rollingDays` (nur die horizontale Strip-Hervorhebung greift dann nicht, die Session lädt trotzdem korrekt).
- `getSessionHistory(n)`-Limit (früher fix 60) ist jetzt `historyLimit`-State mit "Mehr laden"-Button in `SessionHistory.jsx` — Fix wirkt identisch für lokalen Dev-Build und Firebase-Prod, da beide `n` direkt in ihre jeweilige Query (Datei-Slice bzw. Firestore `limit(n)`) durchreichen.
- `SkillsCard.jsx` `WorkoutRunner`: Hold-Typ-Sätze zählen aktuell immer als "geschafft" für `metTarget` (Auto-Unlock), weil der Countdown im UI immer vollständig durchläuft — es gibt keinen Weg, einen Hold als vorzeitig abgebrochen/nicht geschafft zu markieren. Bei reps-Typ funktioniert das korrekt über den Reps-Stepper (Nutzer trägt echte Zahl ein). Für ehrliches Auto-Unlock bei Hold-Skills müsste der Runner einen "Abgebrochen nach Xs"-Pfad bekommen.
- `SkillsCard.jsx` (2026-08-12, Nutzer-Vorgabe, korrigiert): Front-Lever-Stufen Tuck/Advanced Tuck/Straddle bekamen konkrete sets/seconds aus einer Nutzer-Vorgabe (ersetzen die generischen 3×15s-Defaults). Ein zunächst mit derselben Vorgabe eingeführtes `module`-Feld (Zuordnung zu 3 Ausbildungsmodulen, Coach-Approval/Video-Verification-Konzept) wurde noch am selben Tag wieder entfernt — der zugrunde liegende Web-Agent war laut Nutzer vom Ausbildungskontext verwirrt, das Konzept war unbegründet. `rest_seconds` aus der ursprünglichen Vorgabe (90/120/180s pro Stufe) wurde nie übernommen — `WorkoutRunner` vergibt Pausen pro Rolle (Primär 150s/Sekundär 75s/Conditioning 45s), nicht pro Stufe.
- `SkillsCard.jsx` `SkillDetailScreen`, manueller "Stufe gemeistert"-Button (2026-08-12): von prominentem Primary-Button auf dezenten Text-Link ("Manuell auf nächste Stufe springen") herabgestuft, damit der Runner (mit `metTarget`-Auto-Unlock) der offensichtliche Hauptweg bleibt und der manuelle Override nicht zum Schummel-Reflex einlädt. `metTarget` selbst verlangt bereits 100%-Erfüllung jedes einzelnen Satzes der Primär-Übung (`.every()`, nicht aggregiertes Volumen) — kein Fast-Fail-Leck. Downgrade wird bereits als eigener `{ reset: true }`-History-Eintrag geloggt und von `SkillLevelChart` als sichtbarer Einbruch dargestellt, nächstes Workout lädt automatisch die neue Stufe (`buildWorkoutBlocks` liest `stage` frisch bei jedem Runner-Start). Sekundär-/Conditioning-Übung werden weiterhin programmatisch abgeleitet (eine Stufe zurück bzw. fix pro Kategorie), nicht explizit pro Stufe im Katalog hinterlegt — bewusste Design-Entscheidung gegen Mehraufwand bei 14 Skills, kein bekannter Fehlerfall. Ein vorgeschlagenes Links/Rechts-Tracking für einseitige Übungen (Archer Pull-Ups, Pistol Squat, One-Arm-Progressionen) wurde explizit abgelehnt ("merkt man eh selber"), nicht gebaut.
- `SkillsCard.jsx` `WorkoutRunner` (2026-08-12): zwei praktische Ergänzungen. **Crash-Sicherheit** — strukturelle Fortschritts-Punkte (`skillId`, `stage`, `blockIndex`, `setIndex`, `log`, `rpe`, `startedAt`) werden bei jeder Änderung in `localStorage` (`fitness-skills-active-runner-v1`) gesichert, NICHT die laufenden Countdown-Millisekunden (kein 100ms-Schreib-Spam). Schließt der Tab/Browser mitten im Workout, zeigt `SkillDetailScreen` beim nächsten Öffnen desselben Skills+Stufe einen Resume-Banner ("Unterbrochenes Workout gefunden") mit Fortsetzen/Verwerfen — Resume startet den aktuellen Satz immer bei "prep" neu (kein Versuch, einen exakten Countdown-Stand zu rekonstruieren), bereits geloggte Sätze bleiben aber erhalten. Storage wird bei `saveWorkout()` und bei "Abbrechen" (`handleExit`) geleert. **Block überspringen** — Sekundär/Conditioning (nicht Primär, `blockIndex > 0`) kann jederzeit übersprungen werden, springt direkt zum nächsten Block bzw. zu "done", falls letzter Block. Beide Ergänzungen aus einer User-Anfrage, die zusätzlich Plateau-Popup/ZNS-Cooldown-Warnung vorschlug — die wurden explizit abgelehnt (generische SaaS-Nudges mit unverifizierten Schwellwerten, User ist selbst angehender Vitaltrainer und trifft solche Einschätzungen selbst).

## Session-Modi

| Mode | Bedeutung |
|------|-----------|
| `strength` | Krafttraining — ExerciseSection + optionaler ActivityAddon, plus beliebig viele zusätzliche SessionSlots |
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
