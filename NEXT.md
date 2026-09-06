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
- Session-Tab-Rebuild Phase 1–4 ist **komplett und deployed** (2026-09-05
  per `fitness-release --yes`: alle `dev`-Commits gepusht, nach `vitalos`
  gemergt, nach `fitness-aos.web.app` deployed — inkl. `e472849`
  Macrocycles-Proxy, `81122fc` server.mjs-TODO, `2893ede` SOT-Doku, Details
  in RESULTS.md). Die früher hier gelisteten "nur lokal auf dev / nicht
  gepusht"-Punkte sind damit erledigt, nicht erneut als offen behandeln.
  Aus der Rebuild-Arbeit offen geblieben:
  - **Browser-Durchklick-Verifikation** von Phase 3 Stück 4 + Phase 4
    Stück 1 wurde von Claude mehrfach angemahnt, aber nie durchgeführt:
    Übung hinzufügen, Slot anlegen, GPS-Start/Stop, Auto-Save beobachten
    (die `savingRef`-Guard-Race), Sidebar/Settings/Gate-Modal öffnen
    (neuer `activeModal`-State + `SessionModalsLayer.jsx`). Steht jetzt
    gegen den live-deployten Stand aus.
  - **Gate-Sub-Tab-Nav-Drift**: `src/constants/NavigationItems.js` vs.
    `SessionGateCard.jsx::SESSION_NAV_ITEMS` pflegen dieselben 5 Sub-Tab-IDs
    unabhängig (Label/Reihenfolge/`comingSoon`-Flag driften). Nur in
    `PHASE4_TODO.md` dokumentiert — braucht eine explizite User-Rückfrage,
    bevor vereinheitlicht wird (Grundsatz `never_unify_divergent`).
  - `getPlanSuggestion()` bleibt bewusst komplett divergent zwischen
    `local`/`firestore` — nicht als Aufräumaufgabe behandeln.
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
- Coach-Inbox Source-Merge (2026-09-06) ist als expliziter
  `Verbinden`-Flow umgesetzt: Firebase-Coach-Tab kann Kandidaten ueber den
  lokalen FastAPI-Prod-Server in Firestore/YAML-Drafts verlinken. Desktop nutzt
  `http://127.0.0.1:6100/fitness`; Firebase Hosting nutzt per Default den
  Tailscale-Funnel `https://ideapad.tail7a15d6.ts.net/fitness/fitness`.
  Offen bleibt ein separater Schritt:
  `approveInbox()` im
  Firebase-DB-Layer laeuft noch direkt gegen Firestore; falls Firebase-Approve
  auch lokale `kb/exercises/*.yml` erzeugen soll, muss Approve ebenfalls ueber
  den lokalen `:6100`-Pfad laufen und Firestore danach nur spiegeln.
- Direkte Fitness-Fuel-Crossovers sind nicht vorgesehen. Der alte
  `@fuel/store.js`-Headerimport und Fuel-Firestore-Re-Export wurden entfernt;
  bei neuen Nutrition-Anforderungen nicht in Fitness importieren, sondern als
  getrennten Fuel-Surface behandeln.

## Claude Handoff - Firebase Coach-Inbox / Fuel-Grenze (2026-09-06)

Kontext: Der Coach-Tab ist die offene Baustelle. Inbox-Items kommen aus Firestore, lokale Source-/KB-Arbeit muss aber ueber den lokalen Fitness-Prod-Server auf Port 6100 laufen. Der Tailscale Funnel routet nun `/fitness/` auf `http://127.0.0.1:6100/`.

Aktueller Arbeitsstand in diesem Tree:
- Firebase-Coach-API-Base ist nicht mehr nur hart `127.0.0.1`: `src/lib/db/firestore/core.js` nutzt `localStorage["fitness-local-api-base"]`, dann `VITE_LOCAL_FITNESS_API_BASE`, dann auf Firebase Hosting den Funnel `https://ideapad.tail7a15d6.ts.net/fitness/fitness`, sonst Desktop-Fallback `http://127.0.0.1:6100/fitness`.
- `BRIDGE_API_BASE` nicht wieder einfuehren. Der Coach-Inbox-Vertrag ist der Fitness-Prod-Server auf 6100.
- Direkte Fitness-Fuel-Crossovers sind nicht gewollt. `src/components/common/UserProfile.jsx` nutzt jetzt Fitness-`UserContext` statt `@fuel/store.js`; `src/lib/db/index.firestore.app.js` exportiert keine Fuel-Firestore-History mehr, sondern Fitness-Stubs fuer alte Nutrition/Supplement-History-Namen.
- `vite.config.js` entfernt `@fuel` aus den Cross-App-Aliases, auch wenn `@vos/cross-app-aliases` den Alias liefern sollte. Neue Fitness-Imports aus `@fuel/*` sollen dadurch nicht still funktionieren.
- Firebase-`approveInbox()` in `src/lib/db/firestore/inbox.js` versucht jetzt zuerst `POST ${LOCAL_FITNESS_API_BASE}/inbox/{id}/approve` mit `uid`, `doc_id` und `current_data`. Nur wenn der lokale Coach-Server nicht erreichbar ist, faellt es auf den direkten Firestore-Batch zurueck.
- FastAPI `fitness/api/routers/exercises_inbox.py` akzeptiert beim Approve jetzt JSON-Body, kann aus `current_data` notfalls eine lokale Inbox-YAML erzeugen, ruft `approve_inbox_entry()` auf und spiegelt `status: approved` plus Expert-Datensatz nach Firestore zurueck.
- `server.mjs` Proxy fuer `/fitness/inbox/{id}/approve` reicht JSON-Body weiter; live auf 6100 ist aber FastAPI/uvicorn direkt, nicht `server.mjs` als Edge.
- `docs/FIREBASE.md`, `RESULTS.md`, `TODO.md` dokumentieren Web SDK vs Admin SDK vs lokales Backend, Funnel, Fuel-Grenze und Coach-Approve-Stand.

Bisherige Verifikation:
- `npm run build -- --mode firebase` lief nach Entfernen der Fuel-Imports gruen und ohne Fuel-Import-Warnings; transformierte Module gingen von 4515 auf 4184 zurueck. Uebrig war nur die bekannte Chunkgroessen-Warnung.
- `curl https://ideapad.tail7a15d6.ts.net/fitness/health` antwortete mit FastAPI-Prod (`ok: true`, `port: 6100`).
- CORS-Preflight gegen `https://ideapad.tail7a15d6.ts.net/fitness/fitness/inbox/example/link-source` antwortete 200 mit `access-control-allow-origin: *`.

Noch vor finalem Deploy/Vertrauen pruefen:
- Nach dem Approve-Umbau erneut `npm run build -- --mode firebase`, `node --check server.mjs` und `python -m py_compile fitness/api/routers/exercises_inbox.py` laufen lassen.
- Browser-Durchklick gegen Firebase Hosting mit laufendem 6100: Source verbinden -> Reenrich -> Approve.
- Danach lokal pruefen, ob `fitness/catalog/kb/exercises/*.yml` erzeugt wurde, und in Firestore pruefen: `fitness/{uid}/inbox/{doc_id}.status == approved` sowie `fitness/kb/exercises/{exercise_id}` existiert.
- Wenn der lokale Server nicht erreichbar ist, greift bewusst der Firestore-Fallback; der erzeugt keine lokale YAML. Das ist akzeptabler Fallback, aber nicht der Coach-Workbench-Idealpfad.
