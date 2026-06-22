# Audit: Learn

## Zweck
Interaktiver Lern-Tab für Übungsbibliothek, Anatomie-Teaching, interaktive Body-Map und Anatomie-Quiz basierend auf der letzten Trainingssession.

## Komponenten
| Datei | Zweck |
|-------|-------|
| `index.jsx` | Haupt-Container: State-Management, View-Router (library / explorer / quiz), Mobile-Overlay |
| `ExerciseLibrary.jsx` | Suchfeld + "Zuletzt Trainiert"-Chips + scrollbare Übungsliste (max 80 Einträge) |
| `AnatDetail.jsx` | Detail-Panel für gewählte Übung: Muskelgruppen, Erklärung, Coaching Notes, Biomechanik |
| `ExplorerHeader.jsx` | Tab-Switcher (Übungen / Explorer / Quiz) mit konditionellem Quiz-Button |
| `AnatomyExplorer.jsx` | Interaktive Body-Map (Anterior/Posterior-Toggle), Muskel-Klick → AnatomyDetailModal |
| `BodyMusclesMap.jsx` | React-Wrapper für `body-muscles`-Library (70+ Regionen, Intensity-Highlighting via `useMuscleMap()`) |
| `QuizMode.jsx` | Eigenständige Quiz-Komponente: Flashcard-Quiz auf Übungen der letzten Session |

## Datenfluss
- **`@db`-Funktionen aufgerufen in `index.jsx`:**
  - `getAllExercises()` — beim Mount, befüllt `exercises`-State
  - `getLatestSession()` — beim Mount, befüllt `recent` (Exercises der letzten Session)
  - `getAnatomy(exercise_id)` — bei jeder Auswahl einer Übung, befüllt `anatomy`-State
  - `getMuscle(muscleId)` — bei Klick auf Muskelregion in Body-Map, befüllt `muscleData`
  - `queueForEnrichment(ex)` — bei Auswahl einer Übung die nicht `source: 'expert'` ist (fire-and-forget)

- **`@db`-Funktionen aufgerufen in `QuizMode.jsx`:**
  - `getAnatomy(id)` — für bis zu 8 Übungen aus `recent`, lädt `quiz_prompts`/`quiz`-Array

- **State in `index.jsx`:**
  - `exercises` — alle Übungen aus Katalog
  - `selected` — aktuell gewählte Übung (Objekt)
  - `viewMode` — `'library'` | `'explorer'` | `'quiz'`
  - `q` — Suchstring
  - `recent` — Exercises aus letzter Session (für Quiz + Library-Chips)
  - `loading` — initiales Laden der Übungsliste
  - `anatomy` — Teaching-Daten der gewählten Übung
  - `anatLoading` — Ladeindikator für Anatomie-Fetch
  - `selectedMuscleId` — Muskel-ID aus Body-Map-Klick
  - `muscleData` — geladene Muskeldaten für Modal
  - `muscleLoading` — Ladeindikator für Muskel-Fetch

- **Props weitergegeben:**
  - `ExerciseLibrary` ← `exercises`, `selected`, `setSelected` (mit `queueForEnrichment`-Seiteneffekt), `q`, `setQ`, `recent`, `loading`
  - `AnatDetail` ← `ex` (selected), `anatomy`, `loading` (anatLoading), `isEmbedded` (true Desktop / false Mobile), `onBack`
  - `ExplorerHeader` ← `viewMode`, `setViewMode`, `onStartQuiz`, `hasRecent`
  - `AnatomyExplorer` ← `exercises`, `onMuscleClick` (→ setzt `selectedMuscleId`)
  - `BodyMusclesMap` ← `side`, `exercises`, `onMuscleClick`
  - `AnatomyDetailModal` ← `muscleId`, `muscleData`, `loading`, `onClose`, `muscleLanguage`, `taxonomy`
  - `Muscles` (aus `../Muscles/`) ← `gender`, `muscleLanguage`, `taxonomy`
  - `PlanBuilder` ← `onInspectExercise`

## Inline-Code (Extraktionskandidaten)
- `QuizMode` ist bereits als eigene Datei `./QuizMode.jsx` ausgelagert.

## Kernfeatures (müssen nach jedem Refactoring erhalten bleiben)
- **Dual-Render AnatDetail:** Desktop = sticky Sidebar (`hidden lg:block`), Mobile = `fixed inset-0` Full-Screen-Overlay mit `slide-in-from-bottom`. Beide rendern dieselbe Komponente mit `isEmbedded`-Flag.
- **`queueForEnrichment`-Seiteneffekt:** Wird nur ausgelöst wenn `ex.source !== 'expert'` — enrichment-Gate darf nicht verloren gehen.
- **QuizMode läuft auf `recent`**, nicht auf `exercises` — Quiz testet was in der letzten Session trainiert wurde, nicht den Gesamtkatalog. Beim viewMode-Wechsel zu `'quiz'` wird der ExplorerHeader ohne `onStartQuiz`/`hasRecent` Props gerendert.
- **Quiz-Button im Header ist konditionell:** Nur sichtbar wenn `hasRecent === true` (d.h. letzte Session hat Übungen). Bei leerem `recent` verschwindet der Button.
- **`'explorer'`-Mode im Header hat keine eigene Früh-Return-Logik** — fällt durch in den default `return`-Zweig wo `AnatomyExplorer` gerendert wird (nicht `'library'` → else-Branch). Implizite Kontrolle, keine explizite Fallunterscheidung.
- **BodyMusclesMap-Initialisierung einmalig** (`useEffect` mit leerem Dependency-Array) — `side` und `highlightedMuscles` werden über separate `update()`-Calls gesetzt. Destroy im Cleanup.
- **Intensity-Mapping in `BodyMusclesMap`:** nutzt `useMuscleMap()` Hook (Slug-Tabelle aus YAML) — ohne diesen Hook kein Muscle-Highlighting. `.bak`-Version hatte noch einen hartcodierten `BODY_MUSCLES_SLUGS` ohne Hook.
- **Library begrenzt auf 80 Einträge** (`filtered.slice(0, 80)`) — Performance-Limit, kein Paging.
- **`getLatestSession()` vs `getAllExercises()`:** Werden beide parallel beim Mount gefeuert (kein await-await).

## Auffälligkeiten
- **`'analysis'`-Mode existiert nicht**: War geplant (Muscles-Einbettung), wurde nie implementiert. ViewMode hat nur `'library'` / `'explorer'` / `'quiz'`.
- **`muscleData`/`muscleLoading`/`selectedMuscleId`-State** wird in `index.jsx` gepflegt, aber `AnatomyDetailModal` wird immer gerendert (auch in quiz/analysis/explorer viewMode) — unnötige Hintergrundrenderings. Kein Bug, aber unklar.
- **`QuizMode` bekommt `exercises={recent}`** — wenn `recent` leer ist (erste Nutzung, keine Session) zeigt QuizMode sofort "Keine Quiz-Fragen verfügbar". Kein Pre-Check vor Moduswechsel (der Quiz-Button wird zwar nur bei `hasRecent` gezeigt, aber `recent` könnte nachträglich leer sein wenn `getLatestSession()` noch läuft).
- **`anatomy`-Initialstate ist `null`**, aber der `useEffect` setzt ihn bei fehlendem `selected` auf `{}` — `AnatDetail` bekommt also erst `null`, dann `{}`. `AnatDetail` behandelt beide gleich (kein expliziter `null`-Check, alle Felder via optional chaining).
- **Kein Debounce auf Suchfeld** — bei jedem Keystroke wird `filtered` neu berechnet. Bei 80+ Übungen unkritisch.
- **`ExerciseLibrary` sucht in `display_name || name`** (Zeile 7), aber "Zuletzt Trainiert"-Chips matchen über `exercise_id` oder `display_name || name` (Zeile 26) — inkonsistente Match-Logik für recent chips (könnte `found === undefined` ergeben, Button klickbar aber `setSelected(undefined)` wird nicht ausgelöst).
- **`AnatDetail` Sektion-Label:** "Biometrische Daten" sollte "Biomechanische Daten" heißen (Code-Kommentar sagt "Biomechanical Details Section", Label sagt "Biometrische Daten" — copy-paste Fehler).
- **`onInspectExercise`-Prop:** Wird in der `setSelected`-Lambda aufgerufen (`if (onInspectExercise) onInspectExercise(ex)`), aber `PlanBuilder` bekommt `onInspectExercise || setSelected` — wenn `onInspectExercise` nicht übergeben wird, nutzt `PlanBuilder` `setSelected` direkt, ohne den `queueForEnrichment`-Seiteneffekt. Potenzielle Inkonsistenz.

## Status
Okay — gut modularisiert. `QuizMode.jsx` ist eigenständig. `PlanBuilder` ist in der Library-View unten eingebettet. Label-Tippfehler ("Biometrische" statt "Biomechanische") in `AnatDetail.jsx` noch offen.
