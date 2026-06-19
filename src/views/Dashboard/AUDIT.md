# Audit: Dashboard

## Zweck
Zentraler "at-a-glance" Einstiegspunkt: zeigt heutige Session, Habit-Status, Aktivitätsheatmap, Muskelstatus, Coverage-Gaps und Gewichtsverlauf — mit drag-and-drop Widget-Layout.

## Komponenten

| Datei | Zweck | Zeilen |
|-------|-------|--------|
| `src/views/Dashboard/index.jsx` | Orchestrierung: State, Datenfetching, Widget-Grid, Drag&Drop, Layout-Persistenz | 250 |
| `src/components/dashboard/DashboardHeader.jsx` | Header mit "Willkommen zurück", Export-Button, Edit/Fertig/Reset-Buttons | 33 |
| `src/components/dashboard/DashboardWidget.jsx` | Wrapper für alle Widgets: Click-to-navigate, Doppelklick-Modal, Long-Press (Mobile), Maximize-Hint | 102 |
| `src/components/dashboard/SessionStatus.jsx` | Plan-Vorschlag, heutige Session-Stats, Verlauf der letzten 3 Sessions | 135 |
| `src/components/dashboard/ActivityHeatmap.jsx` | Rollendes 10-Tage-Raster mit Block-Farben, klickbar auf Past-Sessions | 45 |
| `src/components/dashboard/MuscleBody.jsx` | Anterior/Posterior BodyMap (react-body-highlighter oder DetailedMuscleMap), klickbar → AnatomyDetailModal | 60 |
| `src/components/dashboard/MuscleCoverage.jsx` | Gap-Liste (Muskeln unter Threshold), mit Icon + Übersetzung, Loading-Skeleton | 35 |
| `src/components/dashboard/MuscleStatus.jsx` | **Wrapper aus alter Architektur**: kombiniert MuscleBody + Coverage-Panel mit hartkodiertem "7 Tage" | 37 |
| `src/components/dashboard/HealthWidget.jsx` | Fitbit-Vitals (Gewicht, Schlaf, Schritte, Ruhepuls) mit Mini-Linechart — **nicht im Dashboard-Grid registriert** | 109 |
| `src/components/dashboard/utils.js` | `getRolling10Days()`, `DAY_LABELS`, Re-export von ActivityConstants | 14 |
| `src/components/HabitWidget.jsx` | Habits-Übersicht (extern, nicht in dashboard/) | — |
| `src/components/WeightChart.jsx` | Gewichtsverlauf 30 Tage (extern, nicht in dashboard/) | — |

## Datenfluss

### @db-Funktionen (alle in `index.jsx` aufgerufen)
- `getSession(today)` → `todaySession`
- `getPlan()` → `plan`
- `getDashboardAnalytics(recentDays)` → `coverage` (body_region_scores → Gap-Liste)
- `getRecentSessions(max(recentDays*2, 10))` → `recent`
- `getAllExercises()` → KB-Enrichment der Recent Sessions → `enrichedRecent`

### @db in Unterkomponenten
- `getMuscle(muscleId)` in `MuscleBody.jsx` (on demand, beim Klick auf Muskel)
- `getBodyEntries(days)` in `HealthWidget.jsx` (eigenständig, kein Prop)
- `HabitWidget.jsx` fetcht selbst (kein Prop)
- `WeightChart.jsx` fetcht selbst (kein Prop)

### State in index.jsx
| State | Typ | Befüllt durch |
|-------|-----|---------------|
| `layout` | `string[]` | localStorage (`fitness-dashboard-layout`) |
| `isEditMode` | `boolean` | Benutzer-Toggle |
| `dragId` | `string\|null` | Drag-Events |
| `overId` | `string\|null` | DragOver-Events |
| `todaySession` | `object\|null` | `getSession()` |
| `recent` | `array` | `getRecentSessions()` |
| `enrichedRecent` | `array` | `Promise.all([sessions, kbExercises])` |
| `plan` | `object\|null` | `getPlan()` |
| `coverage` | `array\|null` | `getDashboardAnalytics()` |
| `exportToast` | `string` | `handleExport()` |

### Props an Widgets
- `SessionStatus` bekommt: `plan`, `todaySession`, `recent`, `today`, `onNavigate`
- `HabitWidget` bekommt: `onNavigate`
- `ActivityHeatmap` bekommt: `rollingDays`, `sessionByDate`, `today`, `onNavigate`
- `MuscleBody` bekommt: `enrichedRecent`, `recentDays`, `highlighterMode`, `gender`
- `MuscleCoverage` bekommt: `coverage`, `recentDays`, `muscleLanguage`, `taxonomy`
- `WeightChart` bekommt: `days={30}` (hardkodiert)

## Inline-Code (Extraktionskandidaten)

- **KB-Enrichment-Logik** (index.jsx Zeilen 95–111): Das Zusammenführen von `kbExercises` mit Session-Exercises via `kbMap` ist substanzielle Logik direkt in `useEffect`. Kandidat für `enrichSessions(sessions, kbExercises)` in `utils.js`.
- **Coverage-Gap-Berechnung** (index.jsx Zeilen 76–79): Die `allGroups`-Liste und der Threshold-Filter sind hart in `useEffect` eingebettet. Kandidat für `computeCoverageGaps(analytics, threshold)` in `utils.js`.
- **`onNavigate`-Funktion** (index.jsx Zeilen 35–39): Navigation-Dispatcher als eigenständige Funktion ohne eigene Datei — ok bei dieser Größe, könnte aber in einen Custom Hook (`useDashboardNav`).
- **Drag&Drop-Logik** (index.jsx Zeilen 128–153): `onDragStart`, `onDragOver`, `onDrop`, `onDragEnd`, `resetLayout` — 5 Funktionen für eine Funktion. Kandidat für `useWidgetLayout(LAYOUT_KEY, DEFAULT_LAYOUT)` Custom Hook.

## Kernfeatures (müssen nach jedem Refactoring erhalten bleiben)

- **Layout-Persistenz**: Reihenfolge der Widgets wird in `localStorage` gespeichert und beim Start rekonstruiert — mit Fallback für unbekannte IDs (`known`/`missing` Merge-Logik).
- **KB-Enrichment von `enrichedRecent`**: `primaryMuscles`/`secondaryMuscles` werden aus dem KB überschrieben, nicht aus Session-Daten vertraut. Die Lookup-Kette `kbEx?.primary_muscles || kbEx?.primaryMuscles || ex.primaryMuscles` bewahrt Rückwärtskompatibilität.
- **Coverage-Gap-Filter**: `allGroups` ist hardkodiert, `body_region_scores` aus Analytics, Threshold per Prop (`coverageThreshold`). Null-sicherer Pfad mit `|| 0`.
- **`onNavigate` mit optionalem `date`**: `onOpenSession?.(date || null)` — Session-Widget kann in Past-Session navigieren.
- **`sessionByDate`-Map** (Zeile 115): Wird live aus `recent` gebaut, kein eigener State — korrekt.
- **Draggable nur wenn `isEditMode`**: `draggable={isEditMode}`, alle Drag-Handler nur wenn `isEditMode` aktiv. Verhindert versehentliches Verschieben.
- **`DashboardWidget` click-passthrough**: Klick auf `button`, `a`, `input` im Children wird nicht als Widget-Navigation gewertet (`.closest()` Guard).
- **Doppelklick-Modal / Long-Press-Modal** in `DashboardWidget`: Zeigt Widget-Inhalt nochmals in Vollbild-Modal an — nur wenn nicht im Edit-Mode.
- **`HOME_NAV`-Variable** (Zeile 32): `NAV_ITEMS` ohne `dash` und `settings` — für Hub-Modus vorbereitet, aber aktuell nicht im JSX verwendet.

## Auffälligkeiten

- **`HOME_NAV` ist toter Code**: `const HOME_NAV = NAV_ITEMS.filter(...)` wird deklariert (Zeile 32) aber nirgendwo im JSX von `index.jsx` verwendet. Die Hub-Mode-Implementierung (NavCards-Grid) fehlt komplett — steht in `ARCHITECTURE.md` als Feature, ist aber nicht vorhanden.
- **`MuscleStatus.jsx` ist toter Code**: Wrapper aus alter Architektur, der `MuscleBody` + Coverage-Panel vereint. Wird nicht mehr in `index.jsx` verwendet — `body` und `coverage` sind jetzt getrennte Widgets. Coverage-Text hartkodiert auf "7 Tage" statt Prop.
- **`HealthWidget.jsx` ist nicht registriert**: Vollständige Komponente (Vitals, Schlaf, Schritte, Mini-Chart), aber weder in `WIDGET_META` noch in `renderInner()` vorhanden. Kein Weg für User, sie anzuzeigen.
- **`recentDays * 2` Abruf vs. `cutoffDate`-Filter**: `getRecentSessions(max(recentDays*2, 10))` holt mehr Sessions als nötig, dann wird `sessionsInWindow` per `cutoffDate` auf `recentDays` zurückgefiltert. `recent` (für SessionStatus/Heatmap) enthält also alle abgerufenen Sessions, `enrichedRecent` nur die im Window — subtile Diskrepanz die bei `recentDays=7` zu maximal 10 Sessions in `recent` führt (min max(14,10)=14 abgerufen, aber SessionStatus zeigt nur 3).
- **`layoutRef`** (Zeile 53–54): `useRef(layout)` + `layoutRef.current = layout` als Workaround für Closure-Problem in `onDrop`. Korrekt aber undokumentiert — beim Refactoring leicht entfernt.
- **`exportToast` Timeout ohne Cleanup**: Zwei `setTimeout` in `handleExport` ohne `clearTimeout`. Bei schnellem Doppelklick könnten beide Timeouts gleichzeitig feuern.
- **`ActivityHeatmap.jsx` hat hardkodiertes Grid-Spanning** (Zeile 7: `md:col-span-2 xl:col-span-3`): Das Widget setzt seine eigene Spanning-Klasse, obwohl `WIDGET_META` das bereits definiert. Doppeltes Spanning → Konflikt wenn Klasse sich unterscheidet.
- **`navigate`-Prop** (Zeile 34): Dashboard bekommt `navigate` als Prop, verwendet es aber nirgendwo. `onNavigate` ist intern definiert. Toter Prop.
- **`getDashboardAnalytics` vs. Coverage**: Die Funktion liefert `body_region_scores`, aber die Gap-Logik in `index.jsx` prüft gegen `coverageThreshold` (default 1.0). Ein Score von 0.0 und einer von 0.99 sind beide "Gap" — es gibt kein Feedback wie weit weg ein Muskel vom Threshold ist. `MuscleCoverage` zeigt nur die Gap-Namen, keine Scores.
- **`ARCHITECTURE.md` ist veraltet**: Referenziert `getHabits` und `getWeeklyReport` als direkte `@db`-Calls im Dashboard — keiner von beiden wird in `index.jsx` aufgerufen.

## Status

**Okay** — Kernfunktionen (Session-Status, Heatmap, BodyMap, Coverage, Drag&Drop-Layout) funktionieren solide. Drei tote Dateien/Variablen (`MuscleStatus.jsx`, `HealthWidget.jsx`, `HOME_NAV`) und ein toter Prop (`navigate`) erhöhen die kognitive Last ohne Nutzen. `ARCHITECTURE.md` beschreibt einen Zustand der nicht mehr existiert (Hub-Mode-NavCards, direkte `getHabits`/`getWeeklyReport` Calls).
