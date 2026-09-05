# NEXT.md — fitness-dev (repo-lokal)

Aktive Arbeitsliste für dieses Repo. Wird vom `PreCompact`-Hook
(`.claude/hooks/pre-compact-fill-docs.sh`) automatisch mit offen
gebliebenen Punkten aus abgeschlossenen Sessions ergänzt.
Unterscheidung zu `TODO.md`: hier steht *was als Nächstes konkret dran
ist*, dort steht *was im Makro insgesamt noch zu tun ist*.

- ClientsPanel-Detail-Sub-Tabs (`ClientWorkoutsFeed`/`ClientHabitCycle`/
  `ClientPlan`/`ClientTrainingPlans`/`AssignPlan`) haben aus dem
  Coach-Redesign (2026-08-31) nur die automatische CSS-Kaskade geerbt,
  nicht die tiefere `cc-panel`/`cc-dossier`-Struktur wie CatalogBrowser/
  Klienten-Roster.
- Die Zod-Umstellung in `server.mjs` deckt jetzt praktisch alle API-
  Routen ab; offen ist eher Nachschärfung einzelner Response-Schemas
  (der breite Rollout nutzt bewusst oft `z.any()`/lockere Objekt-Schemas
  statt strikter Domain-Shapes).
- `/fitness/coach/habit-cycle/:clientUid` fehlt weiterhin im
  Python-Backend (Details: `docs/BACKEND.md`, Claude-Memory
  `project_server_mjs_frontend_only_migration`).
- 5 Inbox-Drafts ohne wger-/yuhonas-Quelle (`inbox_cable_row_close_grip`,
  `inbox_jefferson_curl`, `inbox_scapula_priming`, `inbox_skin_the_cat`,
  2× Yoga-Headstand) brauchen echten Gemini-Reenrich-Pass, da keine externe
  Quelle existiert.
- Zwei identische leere Yoga-Headstand-Inbox-Drafts (`inbox_20260831_161715_3b9447`,
  `inbox_20260831_161759_cc51fb`) sind ein Duplikat — einer sollte
  tombstoned/gelöscht werden, noch nicht entschieden welcher.
- Die vom `source-consistency`-Audit gefundenen 18 echten Muskel-Flags
  (u.a. `clean_snatch`, `dumbbell_lateral_raise`, `face_pull`) sind noch
  nicht einzeln manuell durchgegangen/korrigiert worden — der Audit-Check
  selbst ist fertig, die inhaltliche Review-Arbeit an den gefundenen Drafts
  steht noch aus.
- Der neue `PreCompact`-Hook (`.claude/hooks/pre-compact-fill-docs.sh`)
  wurde nur mit simuliertem Fake-Input getestet (JSON-/Bash-Syntax, Lock-
  Verhalten), noch nicht gegen einen echten Compact-Trigger — erster
  echter Lauf sollte kurz verifiziert werden (füllt er TODO/RESULTS/NEXT
  sinnvoll, committet der PostToolUse-Hook danach sauber).
- Session-Tab-Rebuild Phase 3: Stück 1 (`ExerciseCard.jsx`), Stück 2
  (`ExerciseList.jsx`, `exerciseOps`-Bündel) und Stück 3 (`SessionSlots.jsx`,
  Slot-Reorder-DnD + `SlotCard.jsx`-Extraktion) sind jetzt komplett
  abgehakt (`9ff7d78`, `f8020b5`, `540dfc7`). Nutzer hat für die nächste
  Session bereits **Stück 4** angewiesen (`weiter mit Stück 4 dann aus
  Phase 3`), aber noch nicht begonnen: der eigentliche Kern —
  `useSession.js` (771 Zeilen, 60+ `useState`) in Mini-Hooks aufspalten
  (`useExerciseList`, `useSessionActivity`, `useSessionSlots`,
  `useSessionGateController`), vorher Interdependenzen dokumentieren
  (z.B. `moveExercise()` braucht Slot-Kontext UND Exercise-Liste
  gleichzeitig), dabei zwei bekannte Einzel-Bugs mitnehmen (GPS-Fehlerpfade
  mit zwei getrennten Error-Enums, Auto-Save-Race zwischen localStorage-
  Draft und API-Call im selben Effect). Danach `SessionEditor.jsx` auf
  reinen Orchestrator zurückstutzen. Details + Definition-of-Done in
  `src/views/Session/PHASE3_TODO.md`. Phase 4 (Modals zentralisieren,
  Details/Sidebar-Duplikat, Dual-DB-Layer) ist noch gar nicht begonnen.
- `server.mjs`-Commit `e472849` (Macrocycles-Proxy-Routen) ist lokal
  committed, aber **nicht gepusht** — auf explizite Freigabe des Nutzers
  warten, bevor das nach `dev`/`vitalos` geht.
- `docs`-Commit `81122fc` (`TODO-02_ServerMjsModularisierung.md`) ist
  ebenfalls nur lokal committed, nicht gepusht.
- Auch die neuen Phase-3-Commits (`9ff7d78`, `f8020b5`, `540dfc7`) sind
  bisher nur lokal committed, nicht gepusht.
- CI-Blocker-Fix (`@vos/cross-app-aliases` als `optionalDependencies` in
  `fuel-dev`/`habits-dev`, `vitalos/package-lock.json` neu generiert) wurde
  gepusht, aber die dadurch neu getriggerten GitHub-Actions-Runs
  (`gh run rerun`) wurden nicht mehr bis zum Abschluss verifiziert — Status
  noch offen, ob sie tatsächlich grün durchlaufen.
- Der versehentliche Live-Redeploy von `fuel-os.web.app` (Nebenwirkung des
  CI-Fix-Pushs nach `fuel-dev`/`master`) sollte vom Nutzer selbst
  gegengeprüft werden (funktioniert die App noch wie erwartet) — wurde in
  dieser Session nicht mehr verifiziert.
- Zwei ungeklärte fachliche Detailfragen aus dem Session-Tab-Audit bleiben
  offen: ob `AssignPlan.jsx` (Coach) und `AssignedMacrocycles.jsx`
  (Plan-Tab) bewusst zwei Oberflächen für dieselben Makrozyklus-Daten sind
  oder Doppelarbeit, wurde nicht geprüft.
