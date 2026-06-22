# View Architecture: Dashboard (Heute)

Zentraler Einstiegspunkt: heutige Session, Habit-Status, Aktivitätsheatmap, Muskelstatus, Coverage-Gaps und Gewichtsverlauf — mit drag-and-drop Widget-Layout.

## Komponenten

- **`index.jsx`**: Orchestrierung — State, Datenfetching, Widget-Grid, Drag&Drop, Layout-Persistenz in localStorage.
- **`DashboardHeader.jsx`**: Header mit Export-Button, Edit/Fertig/Reset-Buttons.
- **`DashboardWidget.jsx`**: Wrapper für alle Widgets — Click-to-navigate, Doppelklick-Modal (Vollbild), Long-Press (Mobile), Drag-Handle im Edit-Mode.
- **`SessionStatus.jsx`**: Plan-Vorschlag, heutige Session-Stats, Verlauf der letzten 3 Sessions.
- **`ActivityHeatmap.jsx`**: Rollendes 10-Tage-Raster mit Block-Farben, klickbar auf Past-Sessions.
- **`MuscleBody.jsx`**: Anterior/Posterior BodyMap (react-body-highlighter), klickbar → AnatomyDetailModal.
- **`MuscleCoverage.jsx`**: Gap-Liste (Muskeln unter Threshold), mit Icon + Übersetzung.
- **`WeightChart.jsx`**: Gewichtsverlauf 30 Tage (fetcht selbst).
- **`HealthWidget.jsx`**: Fitbit-Vitals (Gewicht, Schlaf, Schritte, Ruhepuls) — **vorhanden, aber nicht im Widget-Grid registriert**.
- **`MuscleStatus.jsx`**: Alter Wrapper (MuscleBody + Coverage kombiniert) — **nicht mehr verwendet**.

## Datenfluss

- `getSession(today)` → heutige Session
- `getPlan()` → Plan-Vorschlag in SessionStatus
- `getDashboardAnalytics(recentDays)` → Coverage-Scores → Gap-Liste
- `getRecentSessions(n)` → Heatmap + SessionStatus + KB-Enrichment
- `getAllExercises()` → KB-Map für Muskel-Enrichment der Recent Sessions

## Widget-Layout

Reihenfolge wird in `localStorage` (`fitness-dashboard-layout`) persistiert. Drag&Drop nur im Edit-Mode aktiv. Reset-Button stellt Default-Reihenfolge wieder her.

## Nav-Modi

- **`tabs`** (Standard): Dashboard ist erster Tab in der Bottom-Nav.
- **`home`**: AppGate als Hub-Startscreen, Dashboard öffnet sich als Sheet von unten. `HOME_NAV` ist im Code vorbereitet (`NAV_ITEMS` ohne `dash`/`settings`), aber das NavCards-Grid ist nicht implementiert.
