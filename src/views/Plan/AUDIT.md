# views/Plan/ — Audit

## Struktur (Stand 2026-08-21)

```
views/Plan/
├── index.jsx              — Router (WorkoutList ↔ RoutineBuilder ↔ WorkoutSession)
├── api.js                 — lokal/Firestore-Dispatch (isLocalMode()-Weiche)
├── WorkoutList.jsx         — Orchestrierung: Templates+Workouts laden, Aktionen, Layout
├── TrainingPlans.jsx       — Orchestrierung: Trainingspläne (Makro) laden, Aktionen, Layout
├── RoutineBuilder.jsx      — Orchestrierung: Template-Editor (Übungen, Reihenfolge)
├── WorkoutSession.jsx      — Orchestrierung: laufendes Workout loggen
├── AssignedMacrocycles.jsx — Klienten-Ansicht zugewiesener Makrozyklen (Coach→Klient)
├── AssignedPlans.jsx       — kleine Liste zugewiesener Pläne
├── components/
│   ├── RoutineCard.jsx           — eine Template-Karte (Vorschau, Start, Quick-Complete, Menü)
│   ├── RoutineFolder.jsx         — Ordner-Gruppierung (nach category) für RoutineCard-Grids
│   ├── CalisthenicsSkillsSection.jsx — eigener fester Ordner für category=calisthenics-skill
│   ├── NextUpCard.jsx            — "Heute dran"-Karte (Template-Ebene, alle Templates)
│   ├── TemplatePicker.jsx        — Dropdown-Liste beim Hinzufügen eines Templates zu einem Plan
│   ├── PlanCard.jsx              — ein Trainingsplan (Makro): Templates, Ziele, Pensum, Heute dran
│   ├── SetRow.jsx                — eine Satz-Zeile in WorkoutSession
│   ├── ExerciseBlock.jsx         — eine Übung (Kopf + Sätze) in WorkoutSession
│   ├── ExerciseRow.jsx           — eine Übungszeile (Drag+Detail-Formular) in RoutineBuilder
│   ├── ExerciseSearch.jsx, ExerciseChecklist.jsx, MuscleHeatmap.jsx, BodyMap.jsx — bereits vorher hier
├── lib/
│   ├── restTimer.js        — Rest-Timer localStorage-Persistenz + SW-Notification
│   └── templateSets.js     — ensureTemplateSets()/patchTemplateSets() (Legacy↔neues Format)
```

**Regel ab jetzt:** neue Sub-Komponenten (irgendetwas mit eigenem sichtbarem
State/Markup-Block > ~20 Zeilen) gehören nach `components/`, reine
Datenlogik ohne JSX nach `lib/`. Die `*.jsx`-Dateien direkt in `views/Plan/`
sind nur noch Orchestrierung (laden, Aktionen definieren, Layout
zusammensetzen) — kein Feature-Markup mehr direkt inline.

---

## Zwei Ebenen: Templates (Mikro) und Trainingsplan (Makro)

- **Template** (`fitness/{uid}/routines/{id}`, UI-Begriff "Routine"/"Vorlage") =
  eine einzelne Workout-Vorlage: Name + Übungen mit Satz-Zielwerten. Wird
  entweder direkt im `RoutineBuilder` von Hand gebaut, oder — Basisfunktion,
  die vorher fehlte — aus einem frei geloggten Workout heraus per "Als
  Vorlage"-Button in `WorkoutSession.jsx` gespeichert (`saveAsTemplate()`).
- **Trainingsplan** (Makro, technisch ein Makrozyklus,
  `fitness/{uid}/macrocycles/{id}`) = mehrere Templates gebündelt, jedes mit
  eigenem Zeitraum-Ziel (`targetCount`/`targetPeriodDays` pro Plan-Routine,
  x-mal in y Tagen, rollierendes Fenster). Referenziert das Ursprungs-Template
  über `sourceTemplateId` — Fortschritt wird gegen echte Workout-Completions
  gezählt (`workouts.routine_id === sourceTemplateId`), kein separater
  Complete-Mechanismus.
- **"Pensum erfüllt"** = alle Templates mit gesetztem Ziel in einem Plan
  haben ihr Ziel im eigenen Zeitfenster erreicht. Lebt nur noch in
  `PlanCard.jsx` (eine Stelle) — eine frühere Duplikat-Anzeige direkt auf
  Templates (`PensumSummary` in `WorkoutList.jsx`, sowie das Pendant
  `ClientHabits.jsx` im Coach-Tab) wurde entfernt, weil sie denselben
  Zustand ein zweites Mal, unabhängig vom Plan, gezeigt hat.

**Explizit NICHT gewollt:** ein separates "Habit"-Objekt/-Konzept neben dem
Trainingsplan. Der Trainingsplan *ist* der Habit-artige Mechanismus
(Zeitraum-Ziel pro Template) — kein zusätzliches Vokabular, keine zweite
UI dafür.

---

## Self-Service UND Coach — ein Komponent, zwei Aufrufer

`TrainingPlans.jsx` (und damit `PlanCard.jsx`) nimmt optional `clientUid`.
Ohne `clientUid`: Self-Service (eigener `getUid()`). Mit `clientUid`: Coach
sieht/bearbeitet denselben Plan für einen Klienten (`views/Coach/
ClientTrainingPlans.jsx`, dünner Lade-Wrapper). Beide Fälle laufen durch
denselben Code — kein zweiter Nachbau der Bündelungslogik im Coach-Tab.

Quick-Complete ("heute erledigt") funktioniert jetzt auch im Coach-Fall
(z.B. Coach hat live mit dem Klienten trainiert) — über
`quickCompleteClientRoutine()` (`lib/quickComplete.js`), das
`createClientWorkout`/`getClientWorkout`/`updateClientWorkout` aus `@db`
nutzt statt `views/Plan/api.js` (dessen Self-Service-Dispatcher im
Firestore-Modus kein `clientUid` kennt). Dafür wurden `createWorkout`/
`getWorkout`/`updateWorkout` (`firestore/workouts.js`) sowie `getRoutine`
(`firestore/routines.js`) um einen optionalen `uidOverride`-Parameter
erweitert (additiv, Default bleibt `getUid()`) statt die Logik zu
duplizieren. Ziel-**Setzen** ("Template hinzufügen" mit Zeitraum-Ziel)
funktionierte für den Coach bereits vorher.

`views/Coach/ClientPlan.jsx` (vormals `ClientHabits.jsx`) verwaltet nur noch
Templates selbst (Name, Übungen) — keine Ziel-Logik mehr, die gehört
ausschließlich in den Trainingsplan.

---

## Ordner/Kategorien (Strong-Vorbild)

Templates werden in "Meine Routinen" nach ihrem `category`-Feld gruppiert
(`RoutineFolder.jsx`), analog zu Strongs Ordner-Konzept. Kategorielose
Templates landen in "Ohne Ordner". Kategorie setzen: Karten-Menü →
"Ordner…". Calisthenics-Skills (`category === "calisthenics-skill"`)
bleiben ein eigener, immer vorhandener Bereich statt in die freien Ordner
gemischt zu werden.

---

## Erledigt seit erster Fassung dieses Dokuments

- **Wochen-Slider** (`src/components/WeekSlider.jsx`, HabitShare-artig,
  7-Tage-Strip Mo–So) ist in `PlanCard.jsx` verdrahtet, ersetzt den
  einzelnen Erledigt-Haken. Nur der heutige Tag ist antippbar, für
  Self-Service UND Coach gleichermaßen.
- **Pro-Tag-Kommentar Coach↔Klient** auf Plan-Ebene: neue Funktion
  `saveWorkoutFeedback(clientUid, workoutId, text)` (lokal + Firestore,
  `lib/db/{local,firestore}/coach.js`) schreibt `coachFeedback` direkt aufs
  Workout-Dokument (`fitness/{uid}/workouts/{id}`) — eigener Speicher als
  das ältere `saveCoachFeedback` (das schreibt aufs alte Session-JSON-Modell,
  `sessions/journal/habitJournals`, nicht auf `workouts`). Kommentar-Icon im
  `WeekSlider` auf erledigten Tagen: Coach kann schreiben/bearbeiten, Klient
  sieht denselben Kommentar read-only (Icon erscheint auch ohne
  `onComment`-Prop, wenn `workout.coachFeedback` gesetzt ist).
- **Quick-Complete für Coach** (z.B. Coach hat live mit dem Klienten
  trainiert): `quickCompleteClientRoutine()` in `lib/quickComplete.js`,
  nutzt neue `createClientWorkout`/`getClientWorkout`/`updateClientWorkout`
  (lokal + Firestore). Firestore-Seite: `createWorkout`/`getWorkout`/
  `updateWorkout`/`getRoutine` um optionalen `uidOverride`-Parameter
  erweitert statt Logik zu duplizieren.

## Offene Punkte (nicht implementiert, bewusst)

- Erweitertes URL-Hashing für den Plan-Tab (welcher Plan/welches Template
  offen ist in der URL) — noch nicht gebaut, App.jsx kennt bisher nur
  `subTab=plan` als Segment, keine tiefere Verschachtelung.
- Quick-Complete für Coach im Firestore-Modus (siehe oben) — bewusst
  deaktiviert statt unsicher gebaut.
