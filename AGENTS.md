# AGENTS.md — Fitness Dev

## Repo- und Branch-Rollen

- Dieses Repo ist die Entwicklungsquelle für die eigenständige Fitness-App. `dev` ist der Entwicklungsbranch; Qualifizierende Änderungen auf `dev` starten den CI-Preview-Deploy (siehe Pfadfilter in `preview-dev.yml`).
- `vitalos` ist aktuell der Produktionsbranch der eigenständigen Fitness-App. Qualifizierende Änderungen auf `vitalos` starten den Fitness-Live-Deploy.
- Im Meta-Repo `~/vitalos` liegt dasselbe Repo als Submodule `fitness-app`. Dieser Checkout liefert Quellcode für die Fitness-Subapp der VitalOS-Shell; der Meta-Repo-Gitlink pinnt dafür einen konkreten Commit.
- Auch `~/vitalos/.github/workflows/deploy-fitness.yml` kann bei Änderungen am `fitness-app`-Gitlink einen Fitness-Deploy auslösen. Die beiden CI-Pfade getrennt prüfen.
- `~/vitalos` selbst ist die VitalOS-Shell. Ihr Produktionsbranch ist `master`; die Shell-CI deployed die Shell samt den dort gepinnten Submodule-Quellen.
- Ein Branch-Push auf `dev` oder `vitalos` aktualisiert den Submodule-Gitlink im Meta-Repo nicht automatisch. Für einen neuen Shell-Quellstand muss der Pointer in `~/vitalos` aktualisiert werden.
- `main` ist für diesen Ablauf nicht erforderlich. Branch-Namen und Ziele immer anhand des aktiven Workflows prüfen.
