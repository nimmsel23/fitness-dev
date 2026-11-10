- ~~Vite-8 test-sixpack-selection~~: esbuild.transform statt transformWithEsbuild.
- ~~RESULTS.md aus `.gitignore`~~: Org-Task `ca183b8c` (CEO-Ruling 2026-11-07), Tracking bleibt.
- [x] CTO-Hit `175b5162`: biome format `scripts/verify-dist.mjs` (Check-Rot `42750194503` @ `52bc1da`) — AL 2026-11-10.
- [ ] Vite/Rolldown: Preload-Guard behalten; Pin `1.2.16` nicht ohne Check auf 1.3+; Sibling-Repos (6pack/fuel/relax/plan) noch auf 1.3.0 — Guard/Pin nachziehen.
- [x] Learn-3D: `ARCHITECTURE.md`/`AUDIT.md` für BodyParts3D-Viewer nachgezogen (AL 2026-11-10).
- [ ] Learn-3D: fehlende BP3D-Muskeln (Abs/Lat/Rotator-Cuff) — Fallback oder andere Mesh-Quelle; Mesh-Click → Muscle-Detail.
- [ ] `bp3dMap.json` in `build:kb-data` aus KB regenerieren (statt Hand-Copy).
# CI-Agent — offener Betriebspunkt

- [x] `GEMINI_API_KEY` als Actions-Secret gesetzt; Agent und grüner Cloud-Lauf verifiziert. Ein echter roter Code-Reparaturlauf bleibt offen.



## Gemini CI-Agent — verbleibende Betriebsprüfung

- [ ] Einen echten roten, code-behebbaren CI-Lauf beobachten und bestätigen, dass Reparatur-Commit, grüner Check und vorgesehener Promote/Deploy enden.
- [ ] Fehler außerhalb des Codes (fehlende Deploy-Credentials, externe Dienste, Runner-Ausfälle) separat als Diagnose melden; keine ungeprüften Änderungen an Secrets oder Deploy-Konfiguration.
- [ ] GitHub Pages fuer `fitness-dev` auf Branch `dev`, Ordner `/docs` prüfen/aktivieren; Pages-Admin-Einstellungen sind über die aktuelle GitHub-Schnittstelle nicht erreichbar.
- [ ] Gemini-Reparaturpfad nach dem Feld-Fix anhand eines isolierten roten Checks verifizieren: Diagnose, Commit, Check-Neustart und nachgelagerter Deploy.

- [x] Session Gate: Flow anpassen — Gate zuerst als Verzweigung (Plan übernehmen / manuell); TodayPlan optional in Settings.

**Gemini-Review (potenzielle blinde Flecken, 2026-11-10):**
*   ~~SessionGate vor TodayPlan~~ — erledigt (Gate = Plan/Manuell; TodayPlan opt-in Settings).
*   ~~Learn-3D `ARCHITECTURE.md`/`AUDIT.md`~~ — erledigt.
*   Static Imports → größeres Initial-Bundle (~4.7 MB) bewusst.
