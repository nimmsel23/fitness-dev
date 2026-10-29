# Fitness Dev

## Repo- und Branch-Rollen

- `dev` ist der Entwicklungsbranch von `fitness-dev`; relevante Änderungen starten den CI-Preview-Deploy.
- `vitalos` ist der Firebase-Release-Branch dieser Fitness-App.
- In `~/vitalos` liegt dasselbe Repo als Submodul `fitness-app`; dessen Gitlink pinnt den Fitness-Commit, den die VitalOS-Shell verwendet.
- Ein Push auf `dev` oder `vitalos` aktualisiert den `fitness-app`-Gitlink in `~/vitalos` nicht selbst. Für einen neuen Shell-Quellstand muss dieser Pointer separat aktualisiert werden.

## Mini-App-Integration

- `plan`, `6pack` und `Skills` sind direkte Submodule aus `plan-dev`, `6pack-dev` und `skills-dev`. `.gitmodules` verfolgt für alle den Integrationsbranch `fitness`.
- Laufende Mini-App-Arbeit bleibt auf dem jeweiligen `dev`-Branch. Übernommene Änderungen werden in diesem Mini-App-Repo nach `fitness` gemerged. Anschließend wird der zugehörige Submodul-Pointer in `fitness-dev/dev` aktualisiert und gepusht.
- `vite.config.js` löst Fitness-Imports für Plan, 6Pack und Skills gegen die ausgecheckten Submodule auf. Die standalone App-Releases bleiben eigene Workflows.
- Die Preview- und Live-CI-Workflows checken `fitness-app` rekursiv aus, damit auch die drei verschachtelten Submodule verfügbar sind. Änderungen an `plan`, `6pack`, `Skills` oder `.gitmodules` müssen die jeweiligen Workflows triggern.
- Für lokale Builds zuerst `git submodule update --init --recursive` ausführen. Es wird kein lokales Deployment ausgelöst.

## Fitness-Release

- Für Fitness-Prod läuft der Weg `dev` → `master` (PR, `vos-release-pr fitness`) → `vitalos` (`fitness-release`, mergt `origin/master` in `~/vitalos/fitness-app` auf `vitalos`). Danach wird der `fitness-app`-Commit als Gitlink in `~/vitalos` aktualisiert; ein Push von `~/vitalos/master` deployed die Shell samt gepinnten Quellen. Details im Block `release-weg` unten.

<!-- release-weg:start -->
## Release-Weg und Branches (Fitness)

Stand 2026-10-29. Ausführlich: `~/vitalos/docs/DEPLOYMENT.md` (GitHub: nimmsel23/vitalos, `docs/DEPLOYMENT.md`).

**dev → master → vitalos**

| Branch | Rolle | Lokal |
|---|---|---|
| `dev` | Edits und Previews (Preview-Channel `dev`, PR-Channel je PR) | ja — dieser Klon steht fest auf `dev` |
| `master` | **Standalone-Prod** (Hosting-Target `client` = fitness-aos.web.app (plus Training/Atlas); Plan, 6Pack und Skills kommen als Nachbar-Checkouts, nicht mehr als Gitlinks); deployt nur per CI (`Live Deploy (Fitness master)`) | nein, muss nicht existieren |
| `vitalos` | Stand für die Shell (`~/vitalos/fitness-app`); darf hinter `master` liegen | nur als `-app`-Checkout im Meta-Repo |

- Release: `vos-release-pr fitness` öffnet den PR `dev → master`. `Check (Fitness)` läuft, bei Grün mergt der Auto-Merge
  (Merge-Commit) und startet den Live-Deploy per Dispatch. Nie von Hand auf `master` pushen, außer Hotfix.
- Shell: `vos-release fitness` merged `origin/master` nach `vitalos` und bumpt den Pointer im Meta-Repo (deployt die Shell).
  Vorher `vos-overview`.
- `master` wird nie lokal ausgecheckt; `git fetch` genügt. Das Meta-Repo `vitalos` deployt nur noch die Shell.
- Nicht auf `dev` im Hauptordner arbeiten, wenn ein Agent-/Feature-Branch nötig ist: Worktree
  (`git worktree add .worktrees/<name> <branch>`).
- Default-Branch des Repos ist `master`; die `.github/workflows/*.yml` auf `master` bestimmen das Live-Verhalten.
<!-- release-weg:end -->
