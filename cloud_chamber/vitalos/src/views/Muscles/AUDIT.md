# Audit: Muscles

## Zweck
Muskelabdeckungs- und Superkompensations-Analyse mit interaktiver Body-Map — war früher aktiver Nav-Tab, jetzt nicht mehr verlinkt (kein Eintrag in `NavigationItems.js`).

## Komponenten
| Datei | Zweck | Zeilen |
|-------|-------|--------|
| `index.jsx` | Container: State, Datenfetch, HIT-Analyse-Logik, Layout | 217 |
| `MuscleHeader.jsx` | Titel + Zeitraum-Toggle (7/14/28d) + Map-Mode-Toggle | 34 |
| `MuscleAnalysis.jsx` | Textuelle Status-Auflistung (heavy/recovering/super/ready) mit Muskel-Tags | 49 |
| `MuscleBodyMap.jsx` | Standardansicht: Anterior + Posterior BodyMap via `BodyMap`-Komponente | 29 |
| `MuscleDetailedMap.jsx` | Erweiterte anatomische Karte via `DetailedMuscleMap`, mit Side- und Gender-Toggle | 79 |
| `MuscleInsights.jsx` | Ein-Satz-Coaching-Hinweis basierend auf HIT-Analyse | 25 |

## Datenfluss
- `getSessionHistory(60)` aus `@db/sessions` → letzten 60 Sessions
- `getAllExercises()` aus `@db/kb` → KB-Map für Muskel-Lookup per Übungsname
- `getMuscle(selectedMuscleId)` aus `@db/kb` → `GET /fitness/muscles/:id` → `muscleData` für `AnatomyDetailModal`
- State in `index.jsx`:
  - `days` (7/14/28) — Zeitfenster für Coverage-Filter
  - `loading` — initialer Fetch
  - `recentExercises` — gefilterte, angereicherte Übungen (nur `done: true`, im Zeitfenster)
  - `hitAnalysis` — `{ heavy, recovering, super, ready, scores, lastSeen }` — HIT-Kategorien
  - `showDetailed` — Toggle zwischen BodyMap und DetailedMuscleMap
  - `selectedMuscleId` — öffnet `AnatomyDetailModal`
  - `muscleData` + `muscleLoading` — Daten für Modal
- Props nach unten:
  - `MuscleHeader` bekommt `days`, `setDays`, `showDetailed`, `setShowDetailed`
  - `MuscleBodyMap` bekommt `scores`, `onGroupClick`
  - `MuscleDetailedMap` bekommt `exercises`, `gender`, `onGroupClick`
  - `MuscleAnalysis` bekommt `hitAnalysis`, `muscleLanguage`, `taxonomy`
  - `MuscleInsights` bekommt `hitAnalysis`
  - `AnatomyDetailModal` bekommt `muscleId`, `muscleData`, `loading`, `onClose`, `muscleLanguage`, `taxonomy`
- Props die `Muscles` von außen bekommt: `gender`, `muscleLanguage`, `taxonomy`

## Inline-Code (Extraktionskandidaten)
- `getMuscleGroup()` (Zeilen 19–58) — große Mapping-Funktion direkt in `index.jsx`. Sollte in `src/lib/muscleUtils.js` oder `src/lib/translations.js` ausgelagert werden; wird aktuell nur hier genutzt.
- `StatusRow` (Zeilen 26–49 in `MuscleAnalysis.jsx`) — ist bereits lokal definiert, würde als eigenständige Datei wenig Mehrwert bieten, ist aber ein Kandidat wenn `MuscleAnalysis` wächst.
- `LegendRow` (Zeilen 72–79 in `MuscleDetailedMap.jsx`) — kleines Inline-Subcomponent, ok wo es ist.
- Die komplette HIT-Analyse-Logik in `useEffect` (Zeilen 79–165 in `index.jsx`) ist sehr dicht — Kandidat für Custom Hook `useHitAnalysis(days)`.

## Kernfeatures (müssen nach jedem Refactoring erhalten bleiben)
- Zeitfenster-Filter: `days`-State schneidet Sessions nach Datum — `recentExercises` enthält nur Übungen innerhalb des Fensters, aber `hitAnalysis` verwendet alle 60 Sessions für `lastSeen`-Berechnung (bewusste Asymmetrie)
- `done: true` Filter: nur abgehakte Übungen fließen in Analyse ein
- KB-Enrichment: Muskelzuordnung kommt primär aus `kbMap` (custom YAML), nicht aus Session-Daten — `kbEx?.primary_muscles || ex.primaryMuscles` Fallback-Kette
- Cardio-Aktivitäts-Handling: `s.activity`-Branch (Zeilen 121–131) — Cardio-Sessions beeinflussen `lastSeen` für Beinmuskeln, aber nie als `strength` klassifiziert
- Strength-overrides-Cardio-Logik: ein `strength`-Eintrag unter 72h überschreibt `cardio` nicht (Zeile 127–129)
- Zwei Map-Modi togglebar: `showDetailed` → `MuscleDetailedMap` (granulare Anatomie) vs `MuscleBodyMap` (Heatmap nach HIT-Score)
- `AnatomyDetailModal` per Muskel-Klick in beiden Map-Modi öffenbar (gemeinsamer `setSelectedMuscleId`-Callback)
- Gender-Toggle in DetailedMap ist lokal — `currentGender` wird in `MuscleDetailedMap` separat verwaltet, der `gender`-Prop nur als Initialwert genutzt
- HIT-Kategorien nach Stunden-Schwellen: heavy (<72h), recovering (72–96h), supercomp (96–168h), ready (>168h oder cardio oder nie)

## Auffälligkeiten
- `hitMode` wird in `ARCHITECTURE.md` erwähnt ("HIT vs Volume mode") — existiert nicht im aktuellen Code. ARCHITECTURE.md beschreibt einen älteren Stand.
- `days`-State beeinflusst `recentExercises` (Coverage-Visualisierung), hat aber keine Auswirkung auf `hitAnalysis` (benutzt immer alle 60 Sessions für `lastSeen`). Das ist vermutlich Absicht, aber verwirrend — ein User der auf "7d" wechselt erwartet womöglich auch eine frischere Recovory-Analyse.
- `getMuscleGroup()` hat einen nicht vollständig abgedeckten Fall: Numeric slugs im Range 600–602 returnen `"glutes"`, 603 `"quads"`, 604 `"hamstrings"`, alles andere `"legs"` — `"legs"` ist aber kein gültiger Eintrag in `MUSCLE_GROUPS`, wird daher ignoriert.
- `scores[m] = { score: 1 }` etc. — Scores sind immer fixe Integers (1–4), nie feiner aufgelöst. Das `BodyMap`-Rendering könnte mehr Granularität nutzen.
- `index.jsx.bak` liegt im Ordner — sollte entfernt werden (kein `.gitignore`-Eintrag dafür prüfen).
- `muscleLanguage` und `taxonomy` Props werden von außen übergeben — unklar ob der Parent (`App.jsx`) diese tatsächlich befüllt oder ob Defaults immer greifen.

## Status
okay — die Analyse-Logik ist solide und korrekt implementiert. Hauptproblem ist die dichte `useEffect`-Logik in `index.jsx` und die veraltete `ARCHITECTURE.md`. `getMuscleGroup()` hat einen stillen Edge-Case bei unbekannten Numeric-Slugs.
