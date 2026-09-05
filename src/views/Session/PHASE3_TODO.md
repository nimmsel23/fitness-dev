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
- [ ] In Sub-Komponenten aufteilen:
      - `ExerciseCardHeader.jsx` (Name, Muscle-Tags, Trend, Recovery-Hours,
        Volume-Summary, Delete-Button)
      - `SetGridEditor.jsx` (Set-Grid, Reps/Weight-Inputs + Steppers,
        NxM-Expansion, Drop-Set-Detection)
      - `ExerciseHistoryCollapse.jsx` (Previous-Stats/`prevMap`-Anzeige)
      - `ExerciseCard.jsx` bleibt nur noch Orchestrator.
- [ ] `stepReps()`/`stepWeight()` genau gegenlesen, ob sie WIRKLICH
      identisch sind (nicht nur "sehen ähnlich aus"). Nur falls
      tatsächlich bit-identische Logik (keine unterschiedlichen
      Rundungs-/Schrittweiten/Edge-Cases zwischen Reps und Gewicht): dem
      Nutzer explizit vorschlagen zusammenzuführen, nicht eigenmächtig
      mergen. Im Zweifel getrennt lassen.
- [ ] Async-Trend-Fetch (`getProgressTrend(ex.name)`) bekommt eine
      `useEffect`-Cleanup/Abort — aktuell keine Cancel-Logik, potentielle
      Race-Condition bei schnellem Übungs-Wechsel.
- [ ] `tryExpandReps()` gibt bei Parse-Fehler nur `false` zurück, kein
      User-Feedback — Toast ergänzen, wenn NxM-Parsing fehlschlägt.
- [ ] `formatMuscle()` wird bei jedem Render neu aufgerufen — memoizen.

### 2. ExerciseList.jsx
- [ ] Props-Drilling reduzieren: `useExerciseListState()`/`useExerciseOps()`
      Custom-Hook, der die 15+ durchgereichten Props gegenüber
      `useSession.js` kapselt.
- [ ] `addQuick()` (Quick-Input-Parser + AddEx-Wrapper) gehört fachlich
      nicht in die View — nach `useSession.js` (oder einen dedizierten
      `useQuickInput()`-Hook) verschieben.
- [ ] Abhängigkeit vom Parent-`DndContext` explizit dokumentieren (crasht
      aktuell ohne Kontext, kein lokaler Fallback) — falls das beim
      Sub-Split relevant wird.

### 3. SessionSlots.jsx (~220 Z.)
- [ ] Nested-DnD-Problem lösen: Slots selbst sind untereinander nicht
      sortierbar (nur Exercises zwischen Slots/Basis-Abschnitt) — DnD-
      Konzept auf Session-Ebene klären, bevor an der Komponente selbst
      geschraubt wird.
- [ ] Template-Persistenz verifizieren: `getSlotTemplates(block)`/
      `saveSlotTemplate()` sollen über `@db/slotTemplates.js` laufen
      (`lib/db/local|firestore/slotTemplates.js`) — im Audit nicht
      abschließend bestätigt, gegenchecken.
- [ ] `SlotCard.jsx` als eigene Komponente aus der Slot-Listen-Verwaltung
      herauslösen (aktuell beides in `SessionSlots.jsx` vermischt).
- [ ] ~20 durchgereichte Props (u.a. komplettes `exerciseListProps`-Bündel)
      reduzieren, sobald ExerciseList (#2) den eigenen Hook hat.

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
