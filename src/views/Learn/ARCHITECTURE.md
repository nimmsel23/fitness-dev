# Learn Module Architecture (Anatomy Explorer)

Interaktiver Lern-Tab: Übungsbibliothek, Anatomie-Teaching, Body-Map-Explorer, Anatomie-Quiz und Stärke-Matrix.

## Komponenten

- **`index.jsx`**: Haupt-Container. State-Management, View-Router zwischen den vier Modi, Mobile-Overlay-Logik.
- **`StrengthMatrix.jsx`**: Stärke-Matrix (1RM-Rechner), eigener Modus `strength`.
- **`QuizMode.jsx`**: Flashcard-Quiz (eigene Datei).
- **`ExerciseLibrary.jsx`**: Suchfeld + "Zuletzt Trainiert"-Chips + scrollbare Übungsliste (max 80 Einträge).
- **`AnatDetail.jsx`**: Detail-Panel für gewählte Übung — Muskelgruppen, Coaching Notes, Biomechanik. Desktop = sticky Sidebar, Mobile = Full-Screen-Overlay.
- **`ExplorerHeader.jsx`**: Tab-Switcher zwischen den Modi. Quiz-Button nur sichtbar wenn `hasRecent === true`.
- **`AnatomyExplorer.jsx`**: Interaktive Body-Map (Anterior/Posterior). Muskel-Klick öffnet `AnatomyDetailModal`.
- **`BodyMusclesMap.jsx`**: React-Wrapper für `body-muscles`-Library (70+ Regionen, Intensity-Highlighting via `useMuscleMap()` Hook aus `src/lib/muscleMap.js`).

## View-Modi

| Modi-ID | Inhalt |
|---------|--------|
| `library` | Suchbare Übungsliste + AnatDetail-Sidebar |
| `explorer` | Interaktive Body-Map (AnatomyExplorer + BodyMusclesMap) |
| `quiz` | Anatomie-Quiz basierend auf Übungen der letzten Session |
| `strength` | Stärke-Matrix (`StrengthMatrix.jsx`, 1RM-Rechner) |

## QuizMode

Eigene Datei `QuizMode.jsx`. Läuft auf `recent` (Übungen der letzten Session), nicht auf dem Gesamtkatalog. Lädt `quiz_prompts`/`quiz`-Array via `getAnatomy()` für bis zu 8 Übungen.

## Datenfluss

1. Mount: `getAllExercises()` + `getLatestSession()` parallel
2. Übung gewählt: `getAnatomy(exercise_id)` → `anatomy`-State → `AnatDetail`
3. Nicht-Expert-Übung gewählt: `queueForEnrichment(ex)` fire-and-forget
4. Muskel-Klick in Body-Map: `getMuscle(muscleId)` → `AnatomyDetailModal`

## Synergy mit Anatomy-KB

Primärer Consumer der biomechanischen Daten aus `~/anatomy-kb`. Teaching-YAMLs aus `catalog/kb/anatomy_teaching/` fließen via `/exercise/:id/teaching`-Endpoint in `AnatDetail`.

## Styling (Standalone-Build)

- **Theme:** `src/styles.css` importiert `[data-theme="nordic"]` direkt aus der Fitness-App (`@fitness/styles/themes/nordic.css`, Alias in `vite.config.js`) — eine Quelle, kein Drift. `index.html` setzt `data-theme="nordic"`.
- **Tailwind-Tokens:** `tailwind.config.cjs` übernimmt `theme.extend.colors` (`fit-*`, `forge-*`) aus `fitness-dev/tailwind.config.cjs` und macht sie alpha-fähig (`color-mix`), sonst würden `bg-fit-accent/10` & Co. nicht erzeugt (Tailwind 3 kann `var(--x)` nicht mit Opacity-Modifier).
- **Content-Globs:** zusätzlich `fitness-dev/src/components/**` (PlanBuilder, AnatomyDetailModal), sonst purged Tailwind deren Klassen.
- **Animationen:** `animate-in fade-in slide-in-from-bottom duration-*` sind in `styles.css` selbst definiert (`tailwindcss-animate` ist nicht installiert).
- **Nur `fit-*`-Tokens verwenden** (`text-fit-ink`, `border-fit-accent` …). Kurzformen wie `text-ink`, `bg-card`, `from-bg2` existieren nicht und erzeugen kein CSS.
- **App-Icon:** Graduation-Cap (Lucide `GraduationCap`), nicht die Hantel — `public/favicon.svg`, `icon-192.svg`, daraus per `rsvg-convert` die PNGs.


## Quellzuständigkeit seit 2026-11-06
Learn gehört zu Fitness: Views unter `src/views/Learn`, Mapping unter `src/lib/muscleMapping.js`, eigene PWA unter `apps/learn`. Der Alias `@learn` zeigt auf Fitness-src. Node-Backend gehört nach `~/dev/backend/`.
