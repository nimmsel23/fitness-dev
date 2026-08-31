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
- Von ~60 Node-Routen in `server.mjs` haben nur 3 (`/exercises/search`,
  `/fitness/plan`, `POST /session`) echte Zod-Schemas als Vorlage
  bekommen (2026-08-31), Rest bleibt beim generischen Autodoc ohne Body-/
  Response-Schema.
- `/fitness/coach/habit-cycle/:clientUid` fehlt weiterhin im
  Python-Backend (Details: `docs/BACKEND.md`, Claude-Memory
  `project_server_mjs_frontend_only_migration`).
- `fitness-catalog inbox attach-sources` meldet bei bereits vorhandenen
  Snapshots irreführend "gefunden (dry-run)" statt "bereits vorhanden" —
  rein kosmetisch, keine Datenauswirkung, noch nicht gefixt.
- 5 Inbox-Drafts ohne wger-/yuhonas-Snapshot (`inbox_cable_row_close_grip`,
  `inbox_jefferson_curl`, `inbox_scapula_priming`, `inbox_skin_the_cat`,
  2× Yoga-Headstand) brauchen echten Gemini-Reenrich-Pass, da keine externe
  Quelle existiert.
- Zwei identische leere Yoga-Headstand-Inbox-Drafts (`inbox_20260831_161715_3b9447`,
  `inbox_20260831_161759_cc51fb`) sind ein Duplikat — einer sollte
  tombstoned/gelöscht werden, noch nicht entschieden welcher.
- `_best_match()`-Schwelle (`min_score=86`) in `source_merge.py` verhindert
  systematisch Treffer bei wger-generischen vs. yuhonas-equipment-
  präfigierten Namen (z.B. "Walking Lunges" vs. "Barbell Walking Lunge") —
  diagnostiziert, aber noch nicht gefixt.
