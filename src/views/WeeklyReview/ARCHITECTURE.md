# Weekly Review Module Architecture

This folder contains the modularized components for the Weekly Performance Review view.

## Component Structure

- **`index.jsx`**: Main container. Manages state for the selected week, loading status, and coordinate data fetching from `getWeeklyReport`.
- **`ReviewHeader.jsx`**: The top section with "Performance Review" title and the week selection input.
- **`ReviewOverview.jsx`**: Displays core metrics like total session count and volume/recovery focus (HIT mode).
- **`ReviewInsights.jsx`**: Shows textual recommendations and lists "Coverage Gaps" (untrained muscle regions).
- **`ReviewMuscleImpact.jsx`**: Visualizes relative muscle load using bar charts.
- **`ReviewMuscleLoad.jsx`**: Shows the load (not the volume) per muscle region: one exercise = one hit, split into direct (1) and indirect (0.5). Warns in amber when an exercise has more than `SETS_RECOVERY_WARN` sets (possibly too much volume to recover before the next session).
- **`ReviewSessionList.jsx`**: A chronological list of sessions with date cards and recovery indicators. Its navigation callback includes the selected session as a third argument, so workouts on the same date stay distinct.
- **`ReviewTopExercises.jsx`**: Displays the most frequent exercises of the week with deep-dive inspection (Coaching Notes, Errors).
- **`utils.js`**: Helper functions like `formatRecovery`.

## SubTabs (`report` | `muscles` | `readiness` | `strength` | `verlauf`)

`index.jsx` switches on `subTab` between the default weekly report and four
nested views:
- **`readiness`** → `ReviewReadiness.jsx` — Overall-Readiness-Score, ACWR
  (Acute:Chronic Workload Ratio), Tages-Empfehlung, Regenerations-Matrix.
  Scoring kommt aus `../../lib/superkompensation.js` (geteilt mit dem
  Muskeln-Tab, `views/Muscles/index.jsx`) — bewusst dieselbe Datenquelle,
  damit Readiness und Muskeln-Tab nie auseinanderlaufen.
- **`strength`** → `ReviewStrengthMatrix.jsx` — 1RM-Rechner (Epley/Brzycki/
  Wathan-Konsens) + prozentuales Last-/Rep-Spektrum. Rein clientseitige
  Berechnung, keine Session-Daten involviert.
- **`muscles`** → `../Muscles/index.jsx` (Superkompensations-Body-Map).
- **`verlauf`** → `ReviewHistory.jsx` (chronologische Session-Liste).

Bis 2026-08-06 lebten Readiness und Stärke-Matrix in einer einzigen
`ReviewReadinessMatrix.jsx` mit eigenem, vom Muskeln-Tab abweichendem
Recovery-Modell — aufgetrennt + auf geteiltes Scoring umgestellt.

## Intelligence Features (Local Super-Version)
- **Obsidian Sync**: Direct export of the weekly report to the local markdown vault.
- **Deep Inspection**: Clicking an exercise in `ReviewTopExercises` opens a full biomechanical profile including coaching notes and common errors.

## Data Flow

The rolling monthly report cache is scoped to the signed-in user and local calendar day; saving or deleting a session invalidates it. A pending calculation is discarded or retried if invalidated during loading.

The report carries `muscle_set_volume` (per region: `primary_hits`, `secondary_hits`,
`effective_hits`, `max_sets`, `high_volume_exercises`) for the selected 28-day window and
each 7-day chunk. Local and Firestore paths use the same shared calculation
(`shared/muscleSetVolume.js::addExerciseMuscleLoad`).

**Konzept (Owner 2026-11-14): One Set to Failure, Recovery statt Volumen.** The app does
not rate the volume of a session but the recovery between sessions. Every logged exercise
is exactly one hit per muscle region (direct 1, indirect 0.5, stabilizers excluded),
independent of the number of sets; drop sets belong to the set before them. One set is
not worse than two — more sets turn strength into strength endurance. The set count is
only a warning threshold: `high_volume_exercises` counts exercises that hit the region
directly with more than `SETS_RECOVERY_WARN` (3) sets, and the UI then warns that the
volume may be too high for adequate recovery until the next training. HIT exercises
without set tracking (`isHIT`/`done`) count as one hit. Exercises without mapped
muscles are reported separately as `unmapped_hits`.

1.  **Selection**: User changes the `week` in `ReviewHeader`.
2.  **Fetching**: `index.jsx` triggers a re-fetch via `db.js` (`getWeeklyReport`).
3.  **Distribution**: Data is passed down to specialized presentational components.
4.  **Navigation**: `ReviewSessionList` uses `onNavigate` to jump to specific session details in the main app.

## Update 2026-10-15 — Stärke-Matrix ist nach Learn umgezogen

Der SubTab `strength` (`ReviewStrengthMatrix.jsx`, 1RM-Rechner) existiert im Review nicht mehr.
Die Komponente lebt jetzt im Learn-Tab (`fitness-dev`: `src/views/Learn/StrengthMatrix.jsx`, Header-Tab
„Stärke", Sub-Tab-ID `strength`). Alte Deep-Links `#review/strength` werden in `App.jsx`
(`parseHashRoute`) auf `learn/strength` umgeleitet.

- `unmapped_exercises` (Report, lokal und Firestore, pro Woche und gesamt): Übungen ohne Muskelzuordnung (`{exercise_id, name, hits}`, absteigend nach Treffern). `ReviewMuscleLoad` zeigt die ersten fünf unter dem Hinweis zu `unmapped_hits`. Test: `src/lib/db/shared/muscleSetVolume.test.mjs` (läuft direkt unter `node --test`; dafür tragen `constants/ActivityConstants.js` und `constants/activities/index.js` jetzt `.js`-Endungen).
