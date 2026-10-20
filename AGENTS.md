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

- Für Fitness-Prod wird `fitness-dev/dev` in `~/vitalos/fitness-app` auf den Branch `vitalos` übernommen. Danach wird der gewünschte `fitness-app`-Commit als Gitlink in `~/vitalos` aktualisiert; ein Push von `~/vitalos/master` deployed die Shell samt gepinnten Quellen.
