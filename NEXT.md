- ~~Vite-8 test-sixpack-selection~~: esbuild.transform statt transformWithEsbuild.
- ~~RESULTS.md aus `.gitignore`~~: Org-Task `ca183b8c` (CEO-Ruling 2026-11-07), Tracking bleibt.
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

- [ ] Session Gate: Flow anpassen, sodass das Gate zuerst als Verzweigung dient (Plan übernehmen oder manuell loggen), bevor `TodayPlan` oder der Editor angezeigt wird.
