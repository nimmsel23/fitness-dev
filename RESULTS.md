## 2026-11-12 — CI: Gemini + Merge-Agent wiederhergestellt

- Restored: gemini-ci-repair.yml merge-agent.yml (Owner: volle Automatisierung, nicht Abräumen)
- Simplicity = dünne neue Komplexität, nicht bestehende Auto-Schienen killen.

## 2026-11-11 — CI Simplicity: remove Gemini/Merge-Agent

- Removed: gemini-ci-repair.yml merge-agent.yml
- Spine bleibt: Check → automerge-pr (Dependabot) → automerge (dev→master) → Deploy.
- Owner: complexity only in vitalos/prod (CI.md Kopf).

# 2026-11-11 — AL: Checkout-Sync Org 903f1fbe

- Haupt-Checkout ff `52bc1da`→`09c0953` (=origin/dev); AL-LOG 11.11. gefüllt verifiziert.
- Fremd-WIP unberührt (Pathspec-Stash NEXT/RESULTS); kein Produktcode.
- Org-Task `903f1fbe` done. Check `42951630568` / Promote `42951785004` / Live `42951805997`.

# 2026-11-11 — AL: bp3dMap → build:kb-data

- `scripts/build-bp3d-map.mjs`: KB `registry/bp3d_kb_map.json` → `src/data/bp3dMap.json` (soft-skip ohne KB-Link).
- In `build-kb-data.mjs` als Step `bp3d-map`; npm-Script `build:bp3d-map`.
- Learn `ARCHITECTURE`/`AUDIT` + NEXT abgehakt (Feature-Freeze Wartung).

# 2026-11-10 — AL: tooling:biome Format-Fix (CTO-Hit 175b5162)

- `scripts/verify-dist.mjs`: Preload-Marker-`errors.push`-Zeile biome-konform umgebrochen.
- Behebt Check-Rot `42750194503` @ `52bc1da` (`tooling:biome` Format).

# Vite-Preload-Marker Guard (2026-11-10)

- Defense-in-depth zu Rolldown-Pin `1.2.16` + „Keine Dynamic Imports“: Plugin `fix-vite-preload-markers` (Root + Learn), Safety-Skript nach Vite-Build, `verify-dist` failt bei bare Hex nach `mapDeps`.
- Anlass: derselbe Rolldown-1.3.0-Bug hat vos-coach.web.app killt.

# TodayPlan als Settings-Option + SessionGate-Default (2026-11-10)

- Default: SessionGate zuerst (Plan übernehmen / manuell); `GateNextPlanCard` speist Drafts in den Editor.
- Settings → Trainings-Präferenzen: Toggle **TodayPlan-Screen** (`fitness-todayPlanScreen`, default aus) für den

# Vite-Preload-Marker Guard (2026-11-10)

- Defense-in-depth zu Rolldown-Pin `1.2.16` + „Keine Dynamic Imports“: Plugin `fix-vite-preload-markers` (Root + Learn), Safety-Skript nach Vite-Build, `verify-dist` failt bei bare Hex nach `mapDeps`.
- Anlass: derselbe Rolldown-1.3.0-Bug hat vos-coach.web.app killt.

# TodayPlan als Settings-Option + SessionGate-Default (2026-11-10)

- Default: SessionGate zuerst (Plan übernehmen / manuell); `GateNextPlanCard` speist Drafts in den Editor.
- Settings → Trainings-Präferenzen: Toggle **TodayPlan-Screen** (`fitness-todayPlanScreen`, default aus) für den optionalen Habit-Screen.
- Docs: Session `ARCHITECTURE`/`AUDIT`, `PLAN-OWNERSHIP`, `AGENTS`, `NEXT`.

# 2026-11-10 — AL: Learn-3D View-Docs

- `src/views/Learn/ARCHITECTURE.md` + `AUDIT.md`: BodyParts3DMesh, 2D/3D-Toggle, bp3dMap/OBJ-Pfad, statische three-Imports, bekannte Mesh-Lücken dokumentiert (Feature-Freeze Docs).

# Plan-Tab-Fix, Dynamic Imports entfernt und Docs aktualisiert (2026-11-10)

Ein `SyntaxError` im Plan-Tab wurde durch einen `rolldown`-Versionskonflikt verursacht, der `__VITE_PRELOAD__`-Marker beschädigte. Dies führte zur Entscheidung, alle `React.lazy` und dynamischen `import()`-Aufrufe zu entfernen und die Dokumentation zu aktualisieren, um zukünftige Probleme zu vermeiden. Zusätzlich wurden die Learn-3D-Komponenten und Assets eingecheckt.

- **`pnpm-workspace.yaml`**: `rolldown` von `1.3.0` auf `1.2.16` gepinnt, um `__VITE_PRELOAD__`-Marker-Fehler zu beheben.
- **`AGENTS.md` (fitness-dev & plan-dev)**: Neue Owner-Regel "Keine Dynamic Imports" hinzugefügt; Session-Produktvertrag präzisiert (retrospektives Journal, nicht Live-Logging).
- **`docs/CLAUDE.md`**: Updates zur Mini-App-Integration (keine eingecheckten Kopien, Resolver-Mapping) und zur neuen Regel "Keine Dynamic Imports".
- **`docs/PLAN-OWNERSHIP.md`**: Aktualisierung der Plan-Quellenbeschreibung und des Session-Tab-Verhaltens (`TodayPlan.jsx` als verfehltes Ist).
- **`src/views/Coach/ARCHITECTURE.md`**: Aktualisierung der Plan-Zuweisung und der Rolle von `TodayPlan.jsx` im Session-Tab.
- **`src/views/Session/ARCHITECTURE.md`**: Produktvertrag für den Session-Tab hinzugefügt (nachträgliches Logging, nicht Live-Gym).
- **`src/App.jsx`**: Alle `React.lazy` Imports für Views (Learn, WeeklyReview, Touren, Exercises, Settings, Anamnese, Fokus, Inbox) entfernt und durch statische Imports ersetzt; `Suspense` entfernt.
- **`src/views/Session/index.jsx`**: `React.lazy` Imports für `PlanView` und `Logbuch` entfernt und durch statische Imports ersetzt; `Suspense` entfernt.
- **`src/views/Session/SessionEditor.jsx`**: `React.lazy` Import für `SplitPlanSheet` entfernt und durch statischen Import ersetzt; `Suspense` und `planSheetLoaded` State entfernt.
- **`src/views/Inbox/CoachConversation.jsx`**: `React.lazy` Import für `PlanDocument` entfernt und durch statischen Import ersetzt; `Suspense` entfernt.
- **`src/views/Learn/AnatomyExplorer.jsx`**: `React.lazy` Import für `BodyParts3DMesh` entfernt und durch statischen Import ersetzt; `Suspense` entfernt.
- **`src/views/Learn/BodyParts3DMesh.jsx`**: `three`, `OBJLoader`, `OrbitControls` von dynamischem Import auf statischen Import umgestellt.
- **`src/lib/db/firestore/kb.js`**: Dynamischer Import für `exerciseBulkData.generated.js` entfernt und durch statischen Import ersetzt.
- **`src/lib/db/shared/kbLookup.js`**: Dynamischer Import für `search.js` entfernt und durch statischen Import ersetzt.
- **`plan-dev/src/views/Plan/components/ExerciseSearch.jsx`**: Dynamischer Import für `api.js` entfernt und durch statischen Import ersetzt.
- **`plan-dev/src/views/Plan/components/PlanCard.jsx`**: `React.lazy` Import für `PlanFeedback` entfernt und durch statischen Import ersetzt; `Suspense` entfernt.
- **`fitness-dev` & `plan-dev`**: Alle relevanten Code- und Doku-Änderungen wurden in den jeweiligen Repos committed und nach `dev` gepusht (`fitness-dev` `ee0f790`, `plan-dev` `60dab8fe`).
- **`public/anatomy/` (fitness-dev)**: BodyParts3D OBJ-Meshes und `bp3dMap.json` wurden eingecheckt und gepusht (`fitness-dev` `a267062`), nachdem der `.gitignore`-Eintrag für `.obj`-Dateien entfernt wurde.
---


# 2026-11-10

- Major deps: React 19.3 / Vite 8.3.6 / Firebase 13.2; age excludes quoted; manualChunks path-normalize for Rolldown; eslint preserve-caught-error in fit.js.

- 2026-11-10: chore(deps) major stack align — React 19 / Vite 8.3.6 / plugin-react 6.2.1 / Firebase 13 (age-safe pins, pnpm-workspace overrides).

## 2026-11-10 — backend/ = Sammelordner, fitness-Paket darin

- Layout: `coach-dev/backend/fitness/` (+ später `fuel/` …).
- `import fitness` über `PYTHONPATH=…/backend`. Symlinks `fitness` → `backend/fitness`.
- Kein Dienst-Restart.

## 2026-11-10 — backend/ als normaler Ordner

- `fitness-backend/` weg; Sessions-Code = `~/dev/coach-dev/backend/`.
- `COACH_FITNESS_BACKEND_ROOT` Default = `~/dev/coach-dev`. Kein Dienst-Restart.

## 2026-11-09 — Sessions-SOT + anatomy-kb → Coach

- `deploy.sh` `FITNESS_PY_BACKEND` → `~/dev/coach-dev/fitness-backend/backend`.
- `anatomy-kb` Symlink → `~/dev/coach-dev/anatomy-kb` (nicht mehr backend).

## 2026-11-09 — deps: minor/patch Upgrades

- `npm-check-updates --target minor` + Lockfile; `packageManager` bleibt pnpm@11.3.0; `@firebase/util` ^1.12.1.

## 2026-11-09 — Node Tooling (Biome/knip/engines/smoke)

- `engines.node: >=22.13`, Scripts `tooling:biome|knip|check`.
- Check.yml: Biome format auf `scripts/`; knip report (continue-on-error).
- SSOT-Vorlagen: `~/vitalos/tooling/`.

## 2026-11-09 — CI: soft Mini-App-Nachbarn im Vite-Plugin

- `vite-miniapp-submodules.mjs`: fehlende plan/6pack/skills → Skip statt Throw (Journal/Habits-CI).

## 2026-11-09 — CI: rollup 4.68.0 Pin + soft kb-data

- `rollup: 4.68.0` Override: 4.68.1 scheiterte an pnpm `minimumReleaseAge` (Live Deploy).
- `build-kb-data.mjs`: Nachbarn soft; `KB_DATA_SKIP_PLAN=1` in Check/Preview (Meta-Pin kann alt sein).

## 2026-11-09 — anatomy-kb → shared Backend

- SOT: `~/dev/backend/fitness/anatomy-kb/`; hier und in coach-dev nur Symlinks.

## 2026-11-09 — Learn 3D: BodyParts3D

- KB: `vendor/bodyparts3d/` Indexes + `registry/bp3d_kb_map.yml/.json` (catalog→FMA→OBJ).
- Learn: 2D/3D-Toggle in `AnatomyExplorer`; `BodyParts3DMesh` (three@0.170) lädt `public/anatomy/bp3d/*.obj`.
- Fetch: `~/dev/fitness/scripts/fetch_bodyparts3d_meshes.sh …/public/anatomy/bp3d`.

## 2026-11-09 — Bulk-Build: Yuhonas aus Vendor-JSON

- `build-exercise-bulk-data.mjs` liest `vendor/free-exercise-db/dist/exercises.json`.
- `unreviewed_yuhonas.yml` entfällt (KB-Dump entfernt).

## 2026-11-09 — CI: KB aus coach-dev einhängen

Nach Entfernen von fitness/ braucht Check/Preview/Live-Deploy den KB-Symlink aus coach-dev.

## 2026-11-09 — Funnel-API-Base ohne `/fitness/fitness`

- `src/lib/db/firestore/core.js`: Funnel-Base `…/fitness`, Desktop `:9150/fitness`.
- Doppelpfad war Rest vom alten Funnel-auf-`:6100`-Root.

## 2026-11-09 — CLAUDE-Orientierung ohne Fitness-Fork

- Header/Backend-Sektion zeigen auf coach-dev + backend SOT.

## 2026-11-09 — fitness.* Fork entfernt

- `fitness/` war 174/176 identisch mit `coach-dev/fitness` (Coach neuer bei Workouts/Watcher).
- Archiv: `~/dev/_archive/2026-11-09-fitness-dev-fitness-fork`. Deploy synct aus Coach.
- Plan hat kein Python-`fitness` mehr.

## 2026-11-09 — Remote-vitalos gelöscht; Pre-Push ohne vitalos-Deploy

`origin/vitalos` entfernt. Pre-Push: kein lokaler Firebase-Deploy mehr auf Branch vitalos; Reminder/Build auf `dev`.

## 2026-11-09 — Coach mountet shared Fitness-Python

- SOT bleibt `~/dev/backend/fitness/backend`; Coach default Root dorthin.

## 2026-11-09 — Shell-Pin auf origin/master (CI/AGENTS)

CI: kein Auto-Vorspulen von `vitalos` mehr; Merge-Agent nur `master`; PR-Checks
auf `[master, dev]`. AGENTS Release-Weg: `dev → master` + Shell-Pin.

## 2026-11-09 — kein Backend-Symlink mehr

- `backend/`-Symlink entfernt; Python-SOT nur `~/dev/backend/fitness/backend`. `deploy.sh` synct von dort.

## 2026-11-09 — Python-backend → ~/dev/backend/fitness/backend

- Inhalt verschoben; `backend` hier = Symlink. Node unverändert Repo-Root von `~/dev/backend`.

## 2026-11-09 — RESULTS.md aus .gitignore (Org-Task ca183b8c)

- CEO-Ruling 2026-11-07: `RESULTS.md` bleibt getrackt; Eintrag aus `.gitignore` entfernt (Kommentar: Session-Handoff nur noch TODO/NEXT lokal).
- Org-Task `ca183b8c` geschlossen; AL-LOG 2026-11-09 nachgezogen.


## 2026-11-09 — Python-backend/ bleibt (kein Subtree)

- Nested `backend/` war Verdacht „Kopie nach Node-Split“ — faktisch **eigenes**
  Python-Paket (notifier/pusher/sync), nicht in coach-dev abgebildet.
- Wiederhergestellt; Doku: `docs/BACKEND-MOVED.md`. Node-SOT weiter `~/dev/backend`.

## 2026-11-09 — Vite-8-Nachzug: test-sixpack-selection ohne transformWithEsbuild

- `scripts/test-sixpack-selection.mjs` nutzt `esbuild.transform`; Dev-Dep `esbuild ^0.27.7` (Vite 8 liefert den Vite-Reexport nicht mehr).
- `build.target`-Fix (`87d349c`) war schon da; dieser Nachzug schließt die zweite Vite-8-Landmine.

## 2026-11-09 — Backend-Breakthrough + Yuhonas-Pin

- `docs/ARCHITECTURE.md` / Root-`ARCHITECTURE.md`: Breakthrough (Klient-Rolle,
  KB in `~/dev/fitness`, API in Coach, Plan-Brücke).
- Yuhonas CDN nicht mehr `@main`: `yuhonas.ref` + `src/lib/yuhonas.pin.js`
  (gleicher SHA wie plan-dev); `yuhonasImage.js` / `exerciseDbs/sources.js`
  nutzen den Pin. Vendor-Vollklon optional (liegt in plan-dev).

## 2026-11-08 — Dashboard-Datenquelle: Cloud vs. lokal kennzeichnen

- HOTLIST 2026-11-07 „Fitness Dashboard: Cloud vs. local unterscheiden" (task 115, Org-Task 20) umgesetzt: Lese-Rückgaben des `@db`-Barrels tragen additives `_origin: 'cloud' | 'local'` (neu `src/lib/db/shared/origin.js`) — `getSession`/`listSessionsForDate`/`getRecentSessions`/`getSessionHistory` in beiden Layern plus `getDigestSessions` (Firestore-Digest). Bestehende Felder (insb. `source` im Katalog-Kontext) unberührt.
- Schreibwege strippen `_origin` (`withoutDataOrigin`-Guard in lokal + Firestore `saveSession`), damit der reine Anzeige-Marker nie persistiert; 4 Helper-Unit-Tests grün.
- Sichtbarkeit: Badge neben der Datumszeile im `SessionHeader` (Herkunft des geladenen Tages) und im Logbuch-Kopf (`useLogbook().dataOrigin`, Digest-Herkunft); leerer Tag/leeres Logbuch → kein Badge. View-Doku nachgezogen (Session/ARCHITECTURE, Logbuch/ARCHITECTURE+AUDIT; Regel aus `views/Logbuch/AGENTS.md`).
- Prüfung: 13 Logbuch-Regressionstests + 4 Helper-Tests grün; `esbuild`-Syntaxcheck der JSX-/JS-Dateien grün. `firestore/offline.test.mjs` scheitert identisch auf jungfräulichem `origin/dev` (Bestandsbefund, Firebase-Env). Kein `master`/Force/Store/Deploy von Hand; Veröffentlichung siehe AL-LOG-Tagessektion.

## 2026-11-07 — CI-Agent-Fix: gh pr list Feld korrigiert

- Journal-Run 42416606547 scheiterte vor Gemini: GitHub CLI meldete `Unknown JSON field: baseRepository`; `gh pr list` beendete den Analyse-Step mit Exit 1. Kein Gemini-API-Key-Fehler.
- `.github/ci-agent/repair.mjs` sucht PRs jetzt mit unterstützten JSON-Feldern und dem Head-Filter `nimmsel23:<branch>`. Fix auf `dev` in allen acht Modul-/Coach-Repos.
- CI-Checks der Reparaturcommits grün; Modul-Promotion/Live-Deploy grün, Journals Live-Deploy war beim Eintrag noch in Arbeit. Ein echter roter Gemini-Reparaturlauf bleibt als Abnahme offen.

## 2026-11-07 — GitHub-Pages-Doku vorbereitet

- `docs/README.md` als Jekyll-Landingpage ergänzt. Die Datei ist auf `/index.html` geroutet; GitHub-Pages-Quelle `dev /docs` muss noch in den Repository-Einstellungen geprüft bzw. aktiviert werden.

## 2026-11-07 — CI-Agent-Deploy-Routing und No-op-Ausgänge korrigiert

- Reale Modul-Deploy-/Preview-Workflownamen ergänzt; grüne Deploy-Läufe lösen keine Merges aus. Ohne sichere Quellreparatur endet der Agent ohne Commit.
- Tailwind-4- und Dependabot-Upgrades bleiben erhalten; Gemini schreibt keine Lockfiles um.
- Actions-Secrets und ein echter Fehler→Reparatur→Check→Deploy-Rundlauf sind noch zu verifizieren.

## 2026-11-07 — Gemini CI-Agent installiert

- CI-Agent fuer Check-Fehler, Dependabot-PRs und Merge-Konflikte ergänzt; Tailwind-/Paket-Upgrades bleiben erhalten.
- Quellreparaturen werden auf den betroffenen Branch geschrieben; Zielbranch-Reparaturen erhalten einen PR und werden erst nach gruenem Check gemergt.
- Gemini-API und `SYNC_TOKEN` muessen als Actions-Secrets vorhanden sein. Nachweis: erster erfolgreicher automatischer Reparatur- und Deploy-Lauf steht aus.

# Katalog-Korrekturen und Ownership-Abgabe an coach-dev (2026-11-06)

Nachtsession: Die letzten Katalog-Pflegearbeiten in fitness-dev selbst — danach ging
die Katalog-Ownership per Beschluss an coach-dev ueber. fitness-dev bleibt Owner des
Fitness-Clients (PWA, Session, Logbuch) und Konsum ent der Katalogdaten; die
fitness/catalog/kb hier ist ab sofort eine veraltete Kopie und wird nicht mehr
bearbeitet.

-   **`fitness/catalog/kb/inbox/`** (`8c4f9d9`): Kopfstand (yoga_kopfstand, origin:
    expert, ankerfrei — kein Rohquellen-Treffer) und Handstand (wger 1472) als
    getrennte Identitaeten statt zwei Drafts unter einer exercise_id.
-   **`fitness/catalog/kb/exercises/020.yml`** (`765cfc3`): Klimmzug im Obergriff vom
    Yuhonas-Pullups-Anker entkoppelt (yuhonas beschreibt alle Griffvarianten; Anker
    gehoert dem eigenen Kanonischen yuhonas_pullups). wger 821 bleibt.
-   **`inbox_..._cc51fb`/`_3b9447`** (`0f94a34`, `17ad02b`, `7148142`): Muskel-Rollen-
    Splits fuer beide Inversions-Halte-Uebungen (Schulterguertel prim, Koerperlinie
    Stabilizers) und konsequenter Anzeigename "Yoga Kopfstand (Sirsasana)".
-   **Context**: Reenrichment-Beweis — Worker verarbeitete Handstand in 25 s inkl.
    Auto-Commit (`c733d95`). Danach Spiegelung der KB nach coach-dev
    (dort f3c6e600), Worker-Umzug via FITNESS_AGENT_KB/PYTHONPATH auf den Coach-Baum
    und Komplett-Veredelung aller 13 Drafts im Coach-Repo. Komplett-Gate fuer neue
    Drafts liegt in coach-dev (process_inbox_file).

---
# Fitness-Dev: Logbuch-Digests statt Voll-Read, Linse „Muskeln", Deep-Links, FF-Automatik (2026-11-05)

Ausgangspunkt war der Wunsch, dass Logbuch und Review nicht bei jedem Öffnen alle Sessions aus Firestore lesen und neu summieren. Umgesetzt wurde ein monatliches Digest-Rollup (`fitness/{uid}/logbookDigest/{YYYY-MM}`), auf das die Abnehmer umgestellt wurden; danach kamen die Linse „Muskeln", ein Digest-Neuaufbau und Deep-Links dazu. Alles liegt auf `dev`, ist per `vos-release-pr fitness` (u. a. PR #42) nach `master` und per `fitness-release` nach `vitalos` ausgeliefert. Geprüft wurden ESLint, die Logbuch-Tests und `vite build --mode firebase`; gegen echte Firestore-Daten und im Browser wurde nichts getestet.

- **`src/lib/db/firestore/workoutIndex.js`, `src/lib/db/local/historyEntries.js`** (`856308c`): Digest-Pflege im selben Pfad wie der `workoutIndex` (Speichern, Löschen, Verdichtung, Nachzügler); `getLogbookSessions()` liest Monats-Digests plus die letzten 7 Tage live (≈ 1 Read pro Monat statt pro Session). Schema 2 trägt zusätzlich Dauer, Trainingsart, Aufwand u. Ä. Neu: `rebuildLogbookDigest()` (räumt auch Monats-Docs ohne Session auf), automatischer Hintergrund-Neuaufbau bei Digest-Alter > 30 Tage in `getDigestSessions()`, Export in beiden DB-Barrels.
- **`src/views/Logbuch/logbookStats.js`, `useLogbook.js`** (+ Test `logbookStats.test.mjs`): `buildLogbook` arbeitet auf Digest-Zeilen; Test „Digest liefert dasselbe Ergebnis wie volle Sessions". Ladetext „Logbuch wird initialisiert…" beim ersten Aufbau (`d9db218`).
- **`src/lib/db/firestore/sessions.js`, `analysis.js`, `tours.js`, `src/views/WeeklyReview/TrainingProtocol.jsx`** (`43a6895`, `7de0f49`): Weitere Abnehmer umgestellt: Trainingsprotokoll und Touren lesen Digests statt 2000/365 Tage Sessions; Wochenbericht gruppiert Sessions je Tag aus dem geladenen Verlauf statt 7 Einzelqueries; Session-Cache wird bei Schreibvorgängen invalidiert.
- **`src/views/Logbuch/MuscleLoad.jsx`** (neu, `9f394ba`): Fünfte Linse „Muskeln" — Arbeitssätze je Hauptmuskel × Woche (13/26/52 Wochen), Summe/Schnitt der letzten 4 Wochen, Aufwärmsätze zählen nicht, „Ohne Zuordnung" für Übungen ohne Muskel; Auswertungsfunktion samt Test in `logbookStats.js`.
- **`src/views/Logbuch/index.jsx`** (`2227b8e`): Knopf „Logbuch neu aufbauen" im Kopf (im lokalen Modus ohne Wirkung).
- **`src/views/Logbuch/logbuchRoute.js`** (neu, + Test, `0330932`), **`src/App.jsx`**: Deep-Links `#session/logbuch/<linse>` (`kodex|rekorde|rhythmus|muskeln|chronik`) und `?ex=<Übungs-Key>` im Kodex; das Logbuch schreibt Wechsel ohne neuen Verlaufseintrag in die URL zurück; `buildHashRoute` überschreibt Linse/Übung nicht mehr.
- **`.github/workflows/deploy-master.yml`** (`5e7f5ff`): Letzter Schritt spult `vitalos` nach erfolgreichem Live-Deploy per Push ohne Force auf `master` vor, wenn `vitalos` in `master` enthalten ist; sonst nur Warnung; `continue-on-error`.
- **`src/views/Logbuch/ARCHITECTURE.md`**: Digest-Modell, weitere Abnehmer, Linse „Muskeln", Digest-Abweichungen und Deep-Links dokumentiert.

---

# Fitness-Dev: Setup-Tab mit Prop `hideAppearance` für den Pulse-Wrapper (2026-11-05)

Der Setup-Tab kann die Themes-Auswahl jetzt ausblenden, weil `vos-fitness` (Pulse) ein festes Design hat. Anlass war die Prüfung des Pulse-Setups: Dort scheiterte „Push aktivieren“ mit „messaging-sw.js load failed“, weil im Wrapper-Build `fitness-messaging-sw.js` fehlte (Fix im Meta-Repo `~/vitalos`, nicht hier). Die Prop ist über `vos-ship fitness --yes` (dev → master → vitalos) ausgeliefert; ob „Erscheinungsbild“ im Live-Setup tatsächlich verschwunden ist, wurde nicht auf der Live-Seite geprüft.

- **`src/views/Settings/index.jsx`** (`35c803d`): Neue Prop `hideAppearance` blendet die Sektion „Erscheinungsbild“ (`AppearanceSection`) aus; Standard bleibt sichtbar, alle anderen Builds unverändert.

---

# Fitness-Dev: Session-Gate-Sheet wird Quick-Entrance-Portal / Nav-Sheet mit Hub (2026-11-05)

Das Session-Gate-Sheet (`src/views/Session/`) wurde vom reinen Start-Sheet zum Schnelleinstieg-Portal ausgebaut: Die untere Nav ist der eingeklappte Rand des Sheets, ein weiteres Hochziehen öffnet den Hub. Alles ist auf `dev` committed und gepusht und über PR #67 bereits in `master` gemergt (`fitness-release` meldete „Bereits aktuell“). Geprüft wurde per Lint/Build und Headless-Firefox-Harness mit simulierten Touch-Events, nicht auf einem echten Gerät.

- **`GatePortalGrid.jsx`** (neu, `1fba0e0`): Portal-Grid mit Suche (`/`, Ziffern, Enter), „Zuletzt genutzt“ (`fitness-gate-portal-recent`) und Einträgen für Heute, Plan, Logbuch, Timer, Skills, Gestern sowie (außerhalb von Solo-Builds) Review, Learn, Atlas, Touren, Settings. Named Export `GateHubBar`: sticky Leiste mit 5 Einträgen und „Hub aufklappen“-Button (Swipe-up).
- **`SessionGateSheet.jsx`, `SessionGateCard.jsx`, `SessionModalsLayer.jsx`, `SessionEditor.jsx`** (`747ac1a`, `1966d4e`, `e5051e5`): Sheet öffnet nicht mehr reflexartig; Hochziehen am Griff expandiert zum Hub (`initialExpanded`, `activeModal` `'gate'|'hub'`). Tageszähler (Übungen/Sätze/Volumen), Kraft/Ausdauer-Toggle und Split-Chips im Gate; kompakter Split-Chip im Session-Tab statt `SplitPicker`.
- **`App.jsx`, `MobileNav.jsx`, `Sidebar.jsx`** (`86ba486`, `e2cf6e4`): `openHub(mode)` ersetzt das alte Auto-Open-Effect; Mobile-Nav hat Hub-Button und Swipe-up/Griff zum Herausziehen des Sheets, Sidebar einen Hub-Eintrag.
- **`SplitPicker.jsx`, `utils.js`**: neue Splits Shoulders und Arms (Farben in `BLOCK_COLORS`), `inferIsolationBlock` erkennt sie über Primärmuskeln.
- **`GateNextPlanCard.jsx`** (neu, `64aafa7`): Karte „Nächster Plan“ (via `useTodayPlan()`), „Übernehmen“ legt die Routine über `applyNextRoutine` an.
- **`SessionGateBar.jsx`, `index.jsx`**: Grid-Button „Schnelleinstieg öffnen“; TodayPlan-Screen wird übersprungen, wenn das Gate automatisch öffnet.
- **`views/Session/ARCHITECTURE.md`, `AUDIT.md`**: Portal, Hub, Dock, Splits und Nächster-Plan-Karte dokumentiert.
- **`.claude/settings.json`** (`14e20f6`): Hook-Pfade zeigten noch auf das nicht mehr existierende `~/fitness-dev`, jetzt `~/dev/fitness-dev` (Backup `.claude/settings.json.bak`); betraf `pre-compact-fill-docs.sh` und `post-edit-commit-docs.sh`.

---

# Fitness-Dev: App-Portal (docs/apps.html) und Fix leere Fokus-/Anamnese-Mini-App (2026-11-05)

Für alle Mini-Apps gibt es jetzt eine aus den vorhandenen Manifesten erzeugte Übersicht. Dabei fiel auf, dass `vos-fokus` nur Hintergrund und Login zeigte; die Ursache liegt in der Flow-Weiterleitung und ist behoben (committed und auf `dev` gepusht, noch nicht per `vos-ship fitness` live).

- **`scripts/portal.mjs`, `docs/apps.html`, `docs/apps.json`** (`b43afeb`, `7f821bb`): Das Skript liest `scripts/miniapps.json`, `mini-app.json` und `.firebaserc` und erzeugt eine durchsuchbare Karten-Übersicht mit Name, Zweck und Site-Link. Das Skript stammt aus `~/vitalos/scripts/vos-portal.mjs` und wird von `~/vitalos/bin/vos-portal` in jedes Repo kopiert; `--check` prüft nur auf veraltete Dateien. Eine eigene Registry ist nicht nötig.
- **`src/App.jsx`** (`679b53e`): `resolveFlowTab` leitete den Fokus-Tab auf die Anamnese um, solange keine Hits gesetzt waren. Im Fokus-Solo-Build ist der Anamnese-View ausgestubbt, daher blieb die Seite leer. In Solo-Builds entfällt die Weiterleitung jetzt (`if (devBypassFlow || IS_SOLO) return id`), Fokus zeigt „Noch keine Hits gesetzt“. Der Gegenfall (`vos-anamnese` leitet bei ausgefüllten Hits auf Fokus um) ist mit demselben Fix behoben, aber ungetestet. Verifiziert nur per `pnpm run build:miniapp fokus`, nicht im Browser.
- **`CLAUDE.md`** (`ce477b9`): Backend-Abschnitte nach `fitness-backend` ausgelagert, Hinweisblock ergänzt.

---

# Fitness-Dev: Mini-Apps als Unterpfade, eigener Cache-Präfix und Master-Deploy (2026-11-05)

Die `fitness-dev`-App wurde um die Möglichkeit erweitert, Mini-Apps als Unterpfade unter einer gemeinsamen Origin (`fitness-aos.web.app/<id>/`) zu hosten. Ein neuer Build-Workflow und Skripte wurden implementiert, um dies zu unterstützen, inklusive eines eigenen Cache-Präfixes für jede Unterpfad-App, um Cache-Kollisionen zu vermeiden. Diese Änderungen wurden in `fitness-dev` committed und der `dev`-Branch erfolgreich gepusht.

-   **`7dbb987` feat(origin) Commit

# Fitness-Dev: Mini-Apps als Unterpfade, eigener Cache-Präfix (2026-11-05)

Die `fitness-dev`-App wurde um die Möglichkeit erweitert, Mini-Apps als Unterpfade unter einer gemeinsamen Origin (`fitness-aos.web.app/<id>/`) zu hosten. Ein neuer Build-Workflow und Skripte wurden implementiert, um dies zu unterstützen, inklusive eines eigenen Cache-Präfixes für jede Unterpfad-App, um Cache-Kollisionen zu vermeiden.

-   **`7dbb987` feat(origin) Commit**: Implementierung der Unterpfad-Struktur, eigener Cache-Präfixe (`vos-<id>-`

# Fitness-Dev: Mini-Apps als Unterpfade, eigener Cache-Präfix (2026-11-05)

Die `fitness-dev`-App wurde um die Möglichkeit erweitert, Mini-Apps als Unterpfade unter einer gemeinsamen Origin (`fitness-aos.web.app/<id>/`) zu hosten. Ein neuer Build-Workflow und Skripte wurden implementiert, um dies zu unterstützen, inklusive eines eigenen Cache-Präfixes für jede Unterpfad-App, um Cache-Kollisionen zu vermeiden.

-   **`7dbb987` feat(origin) Commit**: Implementierung der Unterpfad-Struktur, eigener Cache-Präfixe und des neuen Merge

# Fitness-Release dev → master → vitalos, Firebase-Konto (2026-11-04)

Release der Logbuch- und Mini-App-Änderungen über `vos-ship fitness`: PR #40 (`dev` → `master`) wurde gemergt und der Standalone-Live-Deploy lief grün. Der Schritt `vos-release` (`master` → `vitalos`) scheiterte zunächst am Pre-Push-Hook von `fitness-app`, weil die lokale Firebase-Anmeldung für `fitness-aos` keine Berechtigung hatte.

- **Firebase-Login (Systemeinstellung, kein Repo-Inhalt)**: `firebase login:use nimmsel23@gmail.com` setzt das Konto mit Zugriff auf `fitness-aos` für das Projektverzeichnis. Danach lief `vos-release fitness --yes` (ohne TTY nötig) durch.
- **`fitness-app` / Meta-Repo `~/vitalos`**: 13 Commits auf `vitalos` gepusht, Pointer-Bump auf `master` (`84d3a0b`); der Push löste die CI für Shell und `vos-fitness` aus. Deren Ergebnis wurde nur für `deploy-vos-fitness.yml` geprüft (grün, ca. 1m20s).
- **`dev`**: `7421fc9` (Stempel-Build) und `33df556` (Lint-Hook, CI-Cache in `check.yml`) nach `origin/dev` gepusht; der Pre-Push-Hook meldete „Build-Verifikation OK“.

---

# 2026-11-04 — Fuel-App-Wrapper (vos-fuel)

Ein neuer Wrapper für die Fuel-App (`vos-fuel`) wurde im `vitalos`-Monorepo erstellt, der die bestehenden Fuel-Funktionen in einer neuen React-Hülle zusammenführt. Der Fokus liegt auf einem integrierten Home-Screen und der Nutzung der vorhandenen Fuel-Tabs über Hash-Routen.

-   **`vos-fuel` App-Wrapper (`src/FuelApp.jsx`, `src/Menu.jsx`, `src/nav.js`, `src/home/*.jsx`)**: Die Kernkomponenten des Wrappers wurden erstellt. `FuelApp.jsx` dient als Haupt-Container und verw

# Results

## 2026-11-04 — Mini-Apps pro Tab, Ship-Hook, TWA-APK

Jeder Tab aus fitness-dev bekommt eine Solo-Mini-App mit eigenem Hosting-Target, deren Deploy per CI tabellengesteuert läuft. Dazu kommt ein `[ship]`-Hook, der den Release bis `fitness-vos` anstößt, und eine signierte Android-APK (TWA) der klassischen Fitness-Centre-App. Die APK wurde im Android-Emulator getestet (Start, Vollbild ohne Adressleiste); ein Test auf einem echten Gerät steht aus.

- **`scripts/miniapps.json` + `.github/workflows/deploy-miniapps.yml`**: SSOT für alle Solo-Mini-Apps (training, logbuch, review, atlas, touren, setup, anamnese, fokus → Sites `vos-<id>`); Workflow baut per Matrix nur diffgesteuert die geänderten Apps. Nach dem Release-Merge löst ein Dispatch den Deploy aus (`96d64c4`).
- **`firebase.json` / `.firebaserc` / `package.json` / `vite-miniapp-submodules.mjs`**: Deploy-Target `plan` und verschachtelte Mini-App-Fallbacks entfernt, `build:miniapp <id>` als einheitlicher Build.
- **`.githooks/pre-push` + `scripts/ship-after-push.sh`**: `[ship]` im dev-Push startet den Release dev → master → vitalos bis zum Deploy von `fitness-vos`.
- **`src/components/common/SoloHelper.jsx` / `src/App.jsx`**: kleiner Login- und Update-Helfer für die Mini-Apps. Firebase-Auth-Domains für die Mini-App-Sites eingetragen.
- **`twa/`, `public/.well-known/assetlinks.json`, `firebase.json` (Target `client`), `.gitignore`**: Fitness Centre als TWA (`app.vitalos.fitnesscentre`, minSdk 24), mit Gradle/`zipalign`/`apksigner` gebaut und signiert, Fingerabdruck entspricht der live ausgelieferten `assetlinks.json`. Keystore liegt außerhalb des Repos.
- **`docs/TWA-APK.md`, `docs/MINI-APPS.md`**: Bauanleitung der APK (inkl. Gradle statt `bubblewrap build`) und Beschreibung der Mini-App-Struktur.
- **Branch `feat/shared-origin`** (Worktree `~/dev/fitness-dev-origin`): Variante, in der alle Mini-Apps unter einer gemeinsamen Origin als Unterpfade laufen (`scripts/build-miniapps-origin.mjs`); als Branch gepusht, nicht nach `dev` gemergt.
- **Waydroid/Emulator**: Netz in Waydroid über `DOCKER-USER`-Regeln (iptables) repariert, um die APK testen zu können; Systemänderung außerhalb des Repos.

---

## 2026-10-31 — Dependabot

Enabled Dependabot alerts and security updates. Configured weekly GitHub Actions and npm/pnpm updates plus Python dependency updates; version updates target `dev`. Minor/patch updates are grouped; vendored mini-app-shell copies stay maintained at their source. Validated YAML, repository manifest paths and update targets.

## 2026-11-01 — Coach ↔ Klienten: Gesprächsbereich

Statische Inbox-Roadmap durch Auth-gebundenen Nachrichtenverlauf ersetzt: echte Antworten, Planbezug, bestätigte Writes und sichtbarkeitsabhängige Lesestände. Client-Adapter bindet Pfad an eigene Firebase-UID; kein Laptop-Worker nötig. Lokaler mobiler Emulator-Ablauf bestanden (Coach mit Planbezug → Antwort → Lesestände → Klientenwechsel ohne Verlauf-/Entwurfsleck); Firebase-Client-Build und ESLint bestanden. Regeln separat im VitalOS-Feature-Worktree vorbereitet und mit fünf Rules-Tests geprüft. Keine echten Nachrichten, kein Push/Release/Deployment.

## 2026-11-01 — Kommunikationsdokumentation vervollständigt

Klienten-Handbuch für Auth, Planantwort, Datenpfade, Speicher-/Lesestände, Cache-/Entwurfsgrenzen, Release und Diagnose ergänzt. AGENTS und Inbox-Architektur/Audit verlinken zum gemeinsamen Vertrag/Runbook. Projektweite Coach-Rolle und fehlende Cloud-/Geräteabnahme ausdrücklich beschrieben. Nur Dokumentation; keine Dienste, Deployments oder echten Nachrichten.

## 2026-11-01 — Coach-Worker wiederhergestellt

`coach-sync.service` um 18:01 CET mit `systemctl --user enable --now`
wieder aktiviert. Firestore bestätigt Worker `Alpha:2344779` mit einem
eine Sekunde alten Heartbeat; queued/processing/stale jeweils 0, keine
Neustarts. Beim beobachteten Start keine neuen Katalog-Commits oder
Katalog-Rebuilds; semantischer Replay-Schutz ist in der geladenen Quelle
vorhanden. Bestehende neun historische Command-Fehler unverändert, keine
Aufträge erneut ausgeführt. Keine App-/Rules-Änderung und kein Deployment.

## 2026-11-01 — Splash blockiert nicht mehr auf Service-Worker-Update

Die vendorte Mini-App-Shell mit der aktuellen VitalOS-Quelle synchronisiert. Ein langsamer Netzwerk-/Service-Worker-Updatecheck hält den Splash nicht mehr offen; er verschwindet nach dem App-Start (mindestens 200 ms, maximal 12 s nur falls der App-Root gar nicht bereit wird).

## 2026-11-01: Push-Test nach Admin-SDK-Update repariert

Firebase-Log von sendTestPush: `TypeError: admin.firestore is not a function` (HTTP 500). `firebase-admin` 14.5.0 entfernt die Namespace-API. Alle Firestore-, FieldValue-, Messaging- und Auth-Aufrufe in functions/index.js nutzen jetzt die modularen Einstiegspunkte. Damit erhalten auch Reminder, Coach-Workout-Push und Strava denselben Fix. Keine Änderung an Rules oder Klientendaten.

## 2026-11-02 — Exercise Buckets als Katalog-Entwurf

- `docs/EXERCISE-BUCKETS.md` dokumentiert das additive Bucket-Modell für
  Übungsfamilien, konkrete Varianten, Quellenbelege und Muskel-/Regionsbrücken.
- Dips- und Seitheben-Beispiele grenzen verwandte Varianten explizit ab.
- Den Bench-Dips-Eintrag von der generischen wger-Dips-ID 194 auf den
  passenden wger-Quellbeleg 1324 korrigiert.
- Keine Neuimport- oder Build-Änderung: vorhandene wger-/yuhonas-Daten bleiben
  Quellenbestand. Unvollständige automatische Namens-Deduplikation und ein
  unsicherer Akzentzeichen-Sprachfilter wurden verworfen.

- 2026-11-05: Changelog fehlte nach CI-Live-Deploys — automerge startet deploy-master.yml per workflow_dispatch (kein Push-Event mit Commits), der Checkout war flach (depth 1), `git log parent..HEAD` lief ins Leere → keine release-info.json. Fix: `fetch-depth: 0` im Checkout von fitness-dev (deploy-master.yml).


## 2026-11-07 — Gemini CI-Agent aktiviert

- Agent-Workflow und lokale Trigger für `fitness-dev` auf `dev` eingerichtet; `GEMINI_API_KEY` als Actions-Secret gesetzt.
- `Check`/Preview und Agent-Run [42405239691](https://github.com/nimmsel23/fitness-dev/actions/runs/42405239691) waren auf Commit `64a0d748` grün. Dieser Lauf war ein No-op auf einem erfolgreichen Check; ein roter Code-Fehler wurde noch nicht absichtlich simuliert.
- Pushes und PR-Merges verwenden die eng berechtigte `GITHUB_TOKEN`-Workflow-Berechtigung; kein separates `SYNC_TOKEN` erforderlich.