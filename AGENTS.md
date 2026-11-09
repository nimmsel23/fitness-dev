## Zusammenführung seit 2026-11-06

Learn gehört jetzt zu diesem Repo (`apps/learn`). Node-Backend-Entwicklung gehört ausschließlich nach `~/dev/backend/`. Siehe `docs/CONSOLIDATION.md`; alte Backend-/Release-Stände werden nicht mehr fachlich erweitert.

# Fitness Dev

## Repo- und Branch-Rollen

- `dev` ist der Entwicklungsbranch von `fitness-dev`; relevante Änderungen starten den CI-Preview-Deploy.
- `vitalos` ist der Firebase-Release-Branch dieser Fitness-App.
- In `~/vitalos` liegt dasselbe Repo als Submodul `fitness-app`; dessen Gitlink pinnt den Fitness-Commit, den die VitalOS-Shell verwendet.
- Ein Push auf `dev` oder `vitalos` aktualisiert den `fitness-app`-Gitlink in `~/vitalos` nicht selbst. Für einen neuen Shell-Quellstand muss dieser Pointer separat aktualisiert werden.

## Mini-App-Integration

- Plan ist die Quelle für Trainingsplan-/Programmeditor und Planlogik. Coach nutzt einen eigenen Pin unter `coach-dev/modules/plan`; daraus folgt kein automatisches Fitness-Update.
- `vite-miniapp-submodules.mjs` löst die Mini-App-Quellen derzeit zuerst über benachbarte Checkouts auf (`plan-app`/`plan-dev`, entsprechend 6Pack/Skills); historische verschachtelte Pfade bleiben Fallbacks. In diesem Checkout existiert derzeit keine `.gitmodules` und kein Plan-Gitlink.
- Vor Builds und Übernahmen den tatsächlich aufgelösten Quellcheckout samt Commit prüfen. Nicht allein aus alten Submodul-Anweisungen auf den aktuellen Stand schließen.
- Standalone-Releases, Coach-Plan-Pointer, Fitness-Integration und VitalOS-Shell-Pointer sind getrennte Schritte.
- Details zur Zuständigkeit: `docs/PLAN-OWNERSHIP.md`.

## Fitness-Release

- Für Fitness-Prod läuft der Weg `dev` → `master` (PR, `vos-release-pr fitness`) → `vitalos` (`fitness-release`, mergt `origin/master` in `~/vitalos/fitness-app` auf `vitalos`). Danach wird der `fitness-app`-Commit als Gitlink in `~/vitalos` aktualisiert; ein Push von `~/vitalos/master` deployed die Shell samt gepinnten Quellen. Details im Block `release-weg` unten.
- **Vollständige Deploy-Doku:** `docs/DEPLOY.md` (Release-Weg, Lockfile, Standalone-Zielbild, Shell-Kopplung, Fehlerbild→Ursache).
- **Ein Befehl für beide Schritte:** `fitness-ship` (= `vos-ship fitness`, liegt in `~/vitalos/bin`) macht `dev` → `master` (PR) → `vitalos` in einem Lauf: Preflight, PR, auf Checks und Auto-Merge warten, auf den Live-Deploy warten, dann `vos-release fitness`, am Ende startet er einen am Lockfile gescheiterten Live-Deploy neu. `--dry-run` zeigt den Plan und ändert nichts, `--yes` nur nach ausdrücklicher Freigabe. Scheitert `vos-release` am Lockfile des Meta-Repos, zieht das Skript ihn selbst nach (nur `pnpm-lock.yaml`, Pathspec-Commit) und wiederholt `vos-release`; ein am Lockfile gescheiterter Live-Deploy wird danach neu gestartet.
- **Lockfile (Stand 2026-11-01):** `Live Deploy (Fitness master)` baut seit der Umschaltung **standalone**: eigener `pnpm-lock.yaml` plus die `master`-Checkouts der Nachbarn (`plan-dev`, `6pack-dev`, `skills-dev`, `learn-dev`, `relax-dev`), kein Meta-Repo. Der frühere Stolperstein (erster Live-Deploy rot mit `ERR_PNPM_OUTDATED_LOCKFILE` gegen den Root-Lockfile von `~/vitalos`) entfällt für Fitness. Voraussetzung: jedes Nachbar-Repo ist auf `master` mit `pnpm install --frozen-lockfile` standalone installierbar. Der Root-Lockfile von `~/vitalos` bleibt Sache der Shell: `vos-release`/`vos-ship` ziehen ihn bei Dependency-Änderungen nach, Lockfile und Pointer müssen in **einem** Push raus (`deploy-shell.yml` läuft bei jedem Push auf `vitalos master` außer reiner Doku mit `--frozen-lockfile` gegen die gepinnten Submodule). Test einer Workflow-Änderung ohne Deploy: Branch `ci-test/<name>` pushen. Details: `docs/DEPLOY.md`.
- **Erledigt (2026-11-01):** `@vos/cross-app-aliases` ist aus `fitness-dev` entfernt (nur `@relax`/`@learn` gebraucht, Auflösung über `siblingDir()`); damit kippt der pfadabhängige `link:` im Lockfile nicht mehr zwischen `~/dev/fitness-dev` und `~/vitalos/fitness-app`. Zusätzlich toleriert `vos-release` im `-app`-Worktree eine reine `link:`-Umschreibung in `pnpm-lock.yaml` (Option A, nur wenn ausschließlich `link:`-Zeilen geändert sind).
- **Hinweis `vos-release-pr`** (SIGPIPE-Fehler bei >30 Commits seit 2026-11-01 behoben; früher Exit 141 ohne PR, dann PR von Hand mit `gh pr create` anlegen (Konfliktcheck: `git merge-tree --write-tree --name-only origin/master origin/dev`)).

<!-- release-weg:start -->
## Release-Weg und Branches (Fitness)

Stand 2026-11-09. Ausführlich: `~/vitalos/docs/DEPLOYMENT.md`.

**dev → master** (+ Shell-Pin auf `origin/master`)

| Branch | Rolle | Lokal |
|---|---|---|
| `dev` | Edits und Previews (Preview-Channel `dev`, PR-Channel je PR) | ja — dieser Klon steht fest auf `dev` |
| `master` | **Standalone-Prod** (Hosting-Target `client` = fitness-aos.web.app (plus Training/Atlas); Plan, 6Pack und Skills kommen als Nachbar-Checkouts, nicht mehr als Gitlinks); deployt nur per CI (`Live Deploy (Fitness master)`) | nein, lokal nicht nötig |
| `vitalos` | **Legacy** (darf remote noch existieren) — kein Pin-Ziel mehr | nicht für Shell nutzen |

- Release (automatisch): `dev` committen und pushen. Nach grünem Check promotet `automerge.yml` nach `master` und startet den Live-Deploy. Direkte Pushes auf `master` vermeiden; Hotfixes über `dev`.
- Shell: `vos-release` / `vos-ship` pinnt `origin/master` (detached im `*-app`) und bumpt den Meta-Pointer → `deploy-shell.yml`. Vorher `vos-overview`.
- `.gitmodules` im Meta-Repo: `branch = master`. Kein Auto-Vorspulen eines App-Branches `vitalos` mehr.
- Parallel-Branches/Worktrees nur mit Owner-Ausnahme.
- Default-Branch des Repos ist `master`; die Workflows auf `master` bestimmen das Live-Verhalten.
<!-- release-weg:end -->

## Coach ↔ Klienten-Kommunikation (2026-11-01)

Details: [docs/COACH-COMMUNICATION.md](docs/COACH-COMMUNICATION.md). Fitness besitzt
die Klienten-Inbox und bindet deren Gesprächspfad an die tatsächliche Firebase-
Auth-UID. Coach besitzt seine Klientenauswahl; VitalOS besitzt die Regeln.
`coachConversations` nicht mit Katalog-Inbox/Enrichment oder Session-Kommentaren
vermischen. Neue Rules müssen vor App-Veröffentlichung im VitalOS-Owner freigegeben
sein. Keine offenen Fallback-Regeln, automatische realen Testnachrichten oder
zweite Klienten-Registry. Aktuelle Limits/Release-Nachweise im gemeinsamen Runbook.

## Org-Taskwarrior (global) — gilt fuer alle Agenten der VitalOS-Org

Verbindlich fuer alle Agenten (Vibe, Claude, Codex, Gemini) in Org-Kontexten
(Owner-Weisung 2026-11-07):

1. EINE globale Org-Task-DB — KEINE eigenen Rollen- oder Repo-DBs mehr:
   `TASKRC=~/.local/state/vitalos-org/taskrc` (DB liegt daneben in `task/`).
   Alte Repo-DBs sind archiviert unter `~/.local/state/vitalos-org/archive-repodb/`.
2. Daniels private Taskwarrior-DB (`~/.task`, u. a. Hotlist `+hot`) bleibt
   TABU fuer Schreibzugriffe — nur lesend (CEO-Runde: Task `status:pending +hot`).
3. Rolle = Tag: Jeder Agent taggt seine eigenen Aufgaben mit seiner Rolle:
   `+ceo`, `+cto`, `+al`, `+pm`, `+alpha`, `+betta` …
4. Abteilung/Repo = project: `project:fitness-dev`, `project:journal-dev`,
   `project:vitalos-prod`, `project:dotfiles`, `project:aos` …
5. Prio-Encoder (in der Org-taskrc verankert):
   - `+hit` und `+br` sind EIN Tier (Hits = Big Rocks, Koeffizient 8.0) —
     hoechste Dringlichkeit, `+hit` = `+br`.
   - `+lr` 2.0 (Little Rocks).
   - `+hot` 1.0 — NUR Potential/Sichtbarkeit, wird NIE automatisch ausgefuehrt;
     ob ein Potential jetzt anfaellt, entscheidet der Door War (Sonntagsrunde).
   - `+s` -1.0 (Sand, Zeitverschwendungsroutine).
   - `+go` ist KEINE Prioritaet und bewirkt nichts — Freigaben laufen ueber
     die Rollen (CTO-Freigabeprozess), nicht ueber Urgency.
6. Aufgaben IMMER per UUID anfassen (`task <uuid> modify|done|info`), NIE per
   ID — IDs renummerieren sich nach jedem `done` (Fehltreffer-Gefahr).
7. Guard: orgsh und die Runner verweigern den Lauf, wenn die Org-taskrc fehlt —
   kein stiller Rueckfall auf die Privat-DB.
8. Uebersicht/Rang: `TASKRC=~/.local/state/vitalos-org/taskrc \
   ~/.org/venv/bin/python ~/aos/bin/aos door plan quadrants --json`
   (Eisenhower-Sicht Q1–Q4).
