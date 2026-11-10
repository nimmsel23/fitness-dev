# Plan-Quelle und Coach-Einbindung

Stand: 2026-11-10.

- `~/plan-dev` besitzt Trainingsplan-/Programmeditor und Planlogik. Änderungen
  daran werden dort implementiert; Fitness pflegt keinen zweiten Editor und
  keine eingecheckte Kopie unter `src/views/Plan`.
- Coach nutzt diesen Code über sein gepinntes Submodul `modules/plan`. Dort
  werden geprüfte Plan-Commits bewusst übernommen; Rollen und Klientenwahl
  bleiben Coach-Aufgaben.
- Fitness ist ein separater Verbraucher. `vite-miniapp-submodules.mjs` sucht
  benachbarte `plan-app`-/`plan-dev`-Checkouts (daneben analog 6Pack/Skills)
  und mappt `src/views/Plan/…` sowie `@vos-plan/…` dorthin. Es gibt keinen
  verschachtelten Fallback-Pfad und in diesem Checkout weder Plan-Gitlink
  noch `.gitmodules`. Fehlt der Nachbar (schlanke CI), wird die Mini-App
  übersprungen; Fitness-Live-Deploy klont die Nachbarn.
- Ein Coach-Pointer-Bump aktualisiert Fitness, die eigenständige Plan-Website
  und den VitalOS-Shell-Pointer nicht. Für Builds/Übernahmen immer den tatsächlich
  aufgelösten Plan-Checkout und dessen Commit prüfen.
- Klientenpläne bleiben unter `fitness/{uid}/macrocycles`, Workout-Vorlagen unter
  `routines` mit Übungs-Subcollections, Trainingslogs unter `workouts`. Entwurf,
  veröffentlichter Snapshot und absolvierte Trainings bleiben getrennt.

### Was Fitness wo zeigt

| Oberfläche | Komponente | Rolle |
|---|---|---|
| Session-Tab (Soll) | Editor + Plan als Vorlage | Session = **nachträgliches** Journal (nicht Live-Gym). Plan speist Übungs-/Vorgabe-Drafts in den Editor. |
| Session-Tab (Ist, verfehlt) | `TodayPlan.jsx` (+ `GateNextPlanCard`) | Habit-Screen ersetzt bei aktivem Makrozyklus den Editor; „erledigt“ ohne Sätze. Owner: zurückgeblieben, Zweck verfehlt — ersetzen/abbauen, nicht ausbauen. |
| Inbox / Coach-Gespräch | `PlanDocument.jsx` aus plan-dev via `@vos-plan/` | Lesbares/druckbares Planblatt zu einer Nachricht mit Planbezug. |
| Solo-Plan-Site / Plan-Modus | `StrongApp.jsx` (`plan-main.jsx`) | Eigenständiger Plan-Editor auf vos-plan. |

Details: `plan-dev/docs/PLAN-COACH-INTEGRATION.md` und
`coach-dev/docs/COACH-PLAN-WORKFLOW.md`. Dieser Dokumentationsstand ändert keine
Fitness-Integration, Daten, Gitlinks oder Deployments.

## Planbezogenes Feedback (2026-11-01)

Die über den Mini-App-Resolver eingebundene PlanCard zeigt in Cloud-Modi den gemeinsamen PlanFeedback-Bereich aus Plan. Klient bestätigt explizit den Empfang und gibt Rückmeldung zur angezeigten freigegebenen Version; Coach antwortet am selben Plan. Es entsteht keine zusätzliche Fitness-Kopie. `planResponses/{uid}/plans/{id}/versions/vN` ist unabhängig von Katalog-Inbox und freiem Chat; die neuen zentralen Regeln müssen vor Veröffentlichung freigegeben sein. Bedienung, Daten und aktuelle Grenzen: `../plan-dev/docs/PLAN-FEEDBACK.md`. Noch kein Deployment.
