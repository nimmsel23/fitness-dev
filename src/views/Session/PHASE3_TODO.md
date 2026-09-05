# Session-Tab Rebuild — Phase 3: Groß, verwoben (riskant)

Quelle: Haiku-Doppel-Audit 2026-09-05. Das ist der Kern des eigentlichen
Rebuilds — beide Audits (DB-Layer + UI-Reihenfolge) landen unabhängig
voneinander bei denselben drei Baustellen. Nicht ohne Tests/manuelle
Verifikation pro Schritt angehen, nicht alles auf einmal.

**Grundsatz (Nutzer-Korrektur 2026-09-05, siehe globale Memory
`feedback_never_unify_divergent_implementations`): NICHTS angleichen oder
vereinheitlichen.** Wo zwei Stellen im Code unterschiedlich aussehen oder
sich unterschiedlich verhalten, ist die Standard-Annahme, dass das Absicht
ist oder bei einem früheren Refactor verloren ging — nicht dass es
bereinigt gehört. "Zusammenführen"/"Deduplizieren" ist selbst der
riskante Schritt, auch wenn er verhaltenserhaltend gemeint ist (siehe
Phase-2-Revert des `ActivityPicker.jsx`-Merges). Jeder Punkt unten, der
nach Zusammenlegen von zwei Implementierungen klingt, braucht VOR der
Umsetzung eine explizite Rückfrage an den Nutzer — nicht nur bei
offensichtlichen fachlichen Unterschieden, auch bei vermeintlich reinem
Copy-Paste-Code.

## Stücke (Reihenfolge wie unten empfohlen)

### 1. ExerciseCard.jsx (~600 Zeilen — größte Einzeldatei im Tab)
- [x] In Sub-Komponenten aufteilen (2026-09-05, rein mechanisch, keine
      Logik/Werte verändert, `npm run build` grün):
      - `ExerciseCardHeader.jsx` (Name, Muscle-Tags, Trend, Recovery-Hours,
        Volume-Summary, Delete-Button)
      - `SetGridEditor.jsx` (Set-Grid, Reps/Weight-Inputs + Steppers,
        NxM-Expansion, Drop-Set-Detection)
      - `ExerciseHistoryCollapse.jsx` (Previous-Stats/`prevMap`-Anzeige)
      - `ExerciseCard.jsx` ist jetzt reiner Orchestrator (State + berechnete
        Werte + Handler + Zusammensetzen + Notiz-Footer inline).
- [x] `stepReps()`/`stepWeight()` gegengelesen (2026-09-05): **nicht
      identisch**, bewusst getrennt gelassen. `stepReps` parst als Integer
      und blockt bei aktivem NxM-Pattern; `stepWeight` parst als Float mit
      Komma→Punkt-Konvertierung und rundet auf 2 Nachkommastellen —
      unterschiedliche Domänen (Wiederholungen vs. Gewicht), kein
      zufälliges Copy-Paste. Kein Merge-Vorschlag nötig.
- [x] Async-Trend-Fetch (`getProgressTrend(ex.name)`) hat jetzt eine
      `useEffect`-Cleanup (`cancelled`-Flag) — verhindert, dass ein
      schneller Übungs-Wechsel einen veralteten Trend setzt.
- [x] `tryExpandReps()` toastet jetzt bei echtem Parse-Fehler (NxM-Pattern
      matcht, aber `nSets < 1`, z.B. "0x5"). Normale Reps-Eingabe (kein
      NxM-Match) bleibt bewusst ohne Toast — das ist der Standardfall,
      kein Fehler. `showToast` dafür neu aus `useSession.js` exportiert
      und über `SessionEditor→ExerciseList/SessionSlots→ExerciseCard`
      als `onToast`-Prop durchgereicht.
- [x] `muscleTags` (einziger Konsument von `formatMuscle()`) ist jetzt
      `useMemo`-gecacht auf `[ex.primaryMuscles, muscleLang, muscleDetail]`
      — `formatMuscle` selbst als separate Funktion entfernt (war nach
      dem Memo ungenutzt).

### 2. ExerciseList.jsx
- [x] Props-Drilling reduziert (2026-09-05): `useSession.js` liefert jetzt
      zusätzlich ein gebündeltes `exerciseOps`-Objekt (`updateEx, addSet,
      removeSet, removeEx, replaceSets, moveEx, addEx, quickInput,
      setQuickInput, addQuick, onToast`) statt 11 einzelner Props.
      `SessionEditor.jsx` reicht nur noch `exerciseOps` an
      `ExerciseList`/`SessionSlots` durch (statt 11 Einzel-Props je
      Aufrufstelle); reine Anzeige-/Kontext-Props (`exercises`, `restHours`,
      `muscleRecovery`, `date`, `prevMap`, `onInspectExercise`) bleiben
      bewusst einzeln, weil Basis-Abschnitt und Slots hier unterschiedliche
      Werte brauchen. `SessionSlots.jsx` (Stück 3) musste dafür an zwei
      Stellen mitgezogen werden, da es `addEx` nicht nur durchreicht,
      sondern selbst konsumiert (Slot-Override zum Anhängen der `slotId`,
      Template-Anwendung in `handleUseTemplate()`) — beide Stellen greifen
      jetzt auf `exerciseListProps.exerciseOps.addEx` statt
      `exerciseListProps.addEx`. Kein dedizierter Hook-File nötig, da
      `useSession.js` selbst schon der Hook ist — die Kapselung ist einfach
      ein weiteres Feld in dessen Rückgabe-Objekt.
- [x] `addQuick()` war bereits vor diesem Stück in `useSession.js`
      implementiert (Quick-Input-Parser via `parseQuick()` + State-Update),
      nicht in der View — `ExerciseList.jsx` ruft es nur noch über
      `exerciseOps.addQuick` auf. Punkt war bereits erfüllt, hier nur
      verifiziert + im neuen Bündel nachgezogen.
- [x] DndContext-Abhängigkeit dokumentiert: JSDoc-Kommentar am Dateikopf von
      `ExerciseList.jsx` — `useDroppable()`/`useSortable()` werfen ohne
      umschließenden `<DndContext>` (kein lokaler Fallback), aktuell stellt
      `SessionEditor.jsx` genau einen gemeinsamen Context für Basisliste +
      alle Slot-Listen bereit.

### 3. SessionSlots.jsx (~220 Z.)
- [x] Nested-DnD-Problem gelöst (2026-09-05, User-Entscheidung: volles
      nested dnd-kit-Sortable statt Pfeil-Buttons). Slots sind jetzt per
      eigenem Griff-Icon (`SortableSlotRow` in `SessionSlots.jsx`, gleiches
      Muster wie `SortableExerciseRow` in `ExerciseList.jsx`) untereinander
      sortierbar — eigene `SortableContext` über die Slot-IDs, im selben
      `DndContext` wie die Exercise-Listen (dnd-kit erkennt Drags nur über
      den nächsten Vorfahren-Context, ein zweiter, verschachtelter
      `DndContext` wäre nicht nutzbar gewesen). Unterscheidung der beiden
      Reorder-Pfade in `SessionEditor.jsx::handleDragEnd()` über
      `active.data.current?.type` (`'slot'` vs. `'exercise'`, letzteres neu
      an `ExerciseList.jsx`s Sortable-Items ergänzt). Neuer Handler
      `reorderSlots(activeId, overId)` in `useSession.js` nutzt
      `arrayMove()` aus `@dnd-kit/sortable` und vergibt `order` für alle
      Slots neu (das Feld existierte vorher schon, wurde aber nie geändert
      außer beim Anlegen). `npm run build` grün.
- [x] Template-Persistenz verifiziert (2026-09-05): `getSlotTemplates()`/
      `saveSlotTemplate()` laufen sauber über `@db` →
      `lib/db/local/slotTemplates.js` (lokal) bzw.
      `lib/db/firestore/slotTemplates.js` (Firebase-Build), beide korrekt
      in ihrem jeweiligen Barrel (`lib/db/index.js` /
      `lib/db/index.firestore.js`) re-exportiert. Kein Fix nötig.
- [x] `SlotCard.jsx` als eigene Datei herausgelöst (rein mechanisch, keine
      Logik verändert) — `SessionSlots.jsx` importiert sie jetzt und
      kümmert sich nur noch um Slot-Liste + Reorder + Templates + Add-Button.
- [x] Props reduziert: profitiert direkt von Stück 2s `exerciseOps`-Bündel
      — `...exerciseListProps` (Rest-Spread in `SessionSlots`s
      Funktionssignatur) enthält jetzt `restHours, muscleRecovery, date,
      prevMap, onInspectExercise, exerciseOps` (6 statt vorher 16 Keys).

### 4. useSession.js (771 Zeilen — der State-Monolith)
- [ ] In Mini-Hooks aufspalten (aus DB-Layer-Audit + UI-Audit
      übereinstimmend empfohlen):
      - `useExerciseList()` — add/update/remove/move Exercise-State
      - `useSessionActivity()` — `activity` + `activityAddons`
      - `useSessionSlots()` — Slots-State + Handler
      - `useSessionGateController()` — GPS-Start/Stop, Timer
      - Haupthook (`useSession.js`) bleibt Koordination + Load/Save,
        Ziel ~300 Zeilen statt 771.
- [ ] Vor dem Split: Interdependenzen dokumentieren (z.B. `moveExercise()`
      braucht Slot-Kontext UND Exercise-Liste gleichzeitig — nicht sauber
      trennbar ohne gemeinsame Schnittstelle).
- [ ] Bekannte Einzel-Bugs im selben Aufwasch mitnehmen (siehe
      DB-Layer-Audit):
      - GPS-Fehlerpfade (`getCurrentPosition()` vs. `resolveGeoLocation()`)
        haben zwei getrennte Fehler-Enums, unklare Propagation an UI.
      - Auto-Save schreibt localStorage-Draft UND API-Call im selben
        Effect — Reihenfolge/Race prüfen.
- [ ] `SessionEditor.jsx` danach auf reinen Orchestrator zurückstutzen
      (kein Inline-JSX mehr außer Layout-Wrappern).

## Definition of Done pro Stück

1. Kernfeatures aus `AUDIT.md`-Abschnitt "Kernfeatures (müssen nach jedem
   Refactoring erhalten bleiben)" explizit gegengetestet: prevMap,
   restHours, muscleRecovery, Gap-Hints, Plan-Hint, Multi-Session,
   Autosave, BodyMap.
2. Manuelle End-to-End-Session (anlegen → Übung hinzufügen → Slot
   hinzufügen → speichern → History prüfen) nach jedem Teil-Schritt.
3. Kein Verhaltensunterschied im Session-JSON-Format (Feld-Shape bleibt
   stabil, siehe `../CLAUDE.md`-Abschnitt "Session-JSON-Format").

## Nicht in dieser Phase

Dual-DB-Layer (local vs. Firestore) grundsätzlich bereinigen, Modal-
Zentralisierung — siehe [[PHASE4_TODO]].
