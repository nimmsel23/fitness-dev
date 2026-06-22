# Learn Module Architecture (Anatomy Explorer)

Interaktiver Lern-Tab: Übungsbibliothek, Anatomie-Teaching, Body-Map-Explorer und Anatomie-Quiz.

## Komponenten

- **`index.jsx`**: Haupt-Container. State-Management, View-Router zwischen den vier Modi, Mobile-Overlay-Logik.
- **`ExerciseLibrary.jsx`**: Suchfeld + "Zuletzt Trainiert"-Chips + scrollbare Übungsliste (max 80 Einträge).
- **`AnatDetail.jsx`**: Detail-Panel für gewählte Übung — Muskelgruppen, Coaching Notes, Biomechanik. Desktop = sticky Sidebar, Mobile = Full-Screen-Overlay.
- **`ExplorerHeader.jsx`**: Tab-Switcher zwischen den vier Modi. Quiz-Button nur sichtbar wenn `hasRecent === true`.
- **`AnatomyExplorer.jsx`**: Interaktive Body-Map (Anterior/Posterior). Muskel-Klick öffnet `AnatomyDetailModal`.
- **`BodyMusclesMap.jsx`**: React-Wrapper für `body-muscles`-Library (70+ Regionen, Intensity-Highlighting via `useMuscleMap()` Hook aus `src/lib/muscleMap.js`).

## View-Modi

| Modi-ID | Inhalt |
|---------|--------|
| `library` | Suchbare Übungsliste + AnatDetail-Sidebar |
| `explorer` | Interaktive Body-Map (AnatomyExplorer + BodyMusclesMap) |
| `quiz` | Anatomie-Quiz basierend auf Übungen der letzten Session |
| `analysis` | Muscles-View eingebettet (granulare Coverage-Analyse) |

## QuizMode

Inline-Komponente in `index.jsx`. Läuft auf `recent` (Übungen der letzten Session), nicht auf dem Gesamtkatalog. Lädt `quiz_prompts`/`quiz`-Array via `getAnatomy()` für bis zu 8 Übungen.

## Datenfluss

1. Mount: `getAllExercises()` + `getLatestSession()` parallel
2. Übung gewählt: `getAnatomy(exercise_id)` → `anatomy`-State → `AnatDetail`
3. Nicht-Expert-Übung gewählt: `queueForEnrichment(ex)` fire-and-forget
4. Muskel-Klick in Body-Map: `getMuscle(muscleId)` → `AnatomyDetailModal`

## Synergy mit Anatomy-KB

Primärer Consumer der biomechanischen Daten aus `~/anatomy-kb`. Teaching-YAMLs aus `catalog/kb/anatomy_teaching/` fließen via `/exercise/:id/teaching`-Endpoint in `AnatDetail`.
