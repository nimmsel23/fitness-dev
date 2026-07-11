# View Architecture: Dashboard (Heute)

Zentraler Einstiegspunkt: heutige Session, Aktivitätsheatmap, Muskelstatus, Coverage-Gaps und Gewichtsverlauf — mit drag-and-drop Widget-Layout.

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

## Datenfluss

- `getSession(today)` → heutige Session
- `getPlan()` → Plan-Vorschlag in SessionStatus
- `getDashboardAnalytics(recentDays)` → Coverage-Scores → Gap-Liste
- `getRecentSessions(n)` → Heatmap + SessionStatus + KB-Enrichment
- `getAllExercises()` → KB-Map für Muskel-Enrichment der Recent Sessions
- `getGlobalInbox()` + `isLocalMode()` → nur für SuperUser/Coach (`isLocalMode()` oder `user.email` enthält "alpha" oder feste UID): roter Banner mit Anzahl ausstehender Übungsanfragen, Klick navigiert zu `#coach`. Kein separater User-Inbox-Banner mehr — nur noch der Coach-Banner.

## Widget-Layout

Reihenfolge wird in `localStorage` (`fitness-dashboard-layout`) persistiert. Drag&Drop nur im Edit-Mode aktiv. Reset-Button stellt Default-Reihenfolge wieder her. Es gibt kein echtes Hide/Show — jedes Widget aus `DEFAULT_LAYOUT`/`WIDGET_META` wird beim Laden immer eingeblendet, auch wenn es vorher aus dem gespeicherten Layout entfernt wurde. Der `HabitWidget` wurde deshalb am 2026-07-11 komplett aus `DEFAULT_LAYOUT`/`WIDGET_META` entfernt statt nur umsortiert (`src/components/HabitWidget.jsx` bleibt als Datei erhalten, ist aber nicht mehr eingebunden — Grund: tauchte trotz Entfernens immer wieder auf + `getHabits()` verlangsamte vermutlich den Firebase-Build, da der lokale HabitSync-Backend dort nicht erreichbar ist).

## Nav-Modi

- **`tabs`** (Standard): Dashboard ist erster Tab in der Bottom-Nav.
- **`home`**: AppGate übernimmt den Home-Slot komplett (`App.jsx:49`) inkl. "Zurück zum Menü"-Handle. Dashboard braucht dafür keine eigene Navigation — `HOME_NAV`/`navMode` (ungenutzter Rest aus einem früheren Ansatz) wurden am 2026-07-11 entfernt.
