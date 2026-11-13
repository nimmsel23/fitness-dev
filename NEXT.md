- [x] Issue #104: Biome-Formatierung scripts/portal.mjs behoben (Check grün, dev→master Auto-Promote freigegeben)
- [ ] Issue #104: 6 Geister-Runs (queued vom 11.11.) manuell im GitHub Actions UI abbrechen, danach Issue schließen
- ~~Vite-8 test-sixpack-selection~~: esbuild.transform statt transformWithEsbuild.
- ~~RESULTS.md aus `.gitignore`~~: Org-Task `ca183b8c` (CEO-Ruling 2026-11-07), Tracking bleibt.
- [x] CTO-Hit `175b5162`: biome format `scripts/verify-dist.mjs` (Check-Rot `42750194503` @ `52bc1da`) — AL 2026-11-10.
- [ ] Vite/Rolldown: Preload-Guard behalten; Pin `1.2.16` nicht ohne Check auf 1.3+; Sibling-Repos (6pack/fuel/relax/plan) noch auf 1.3.0 — Guard/Pin nachziehen.
- [x] Learn-3D: `ARCHITECTURE.md`/`AUDIT.md` für BodyParts3D-Viewer nachgezogen (AL 2026-11-10).
- [ ] Learn-3D: fehlende BP3D-Muskeln (Abs/Lat/Rotator-Cuff) — Fallback oder andere Mesh-Quelle; Mesh-Click → Muscle-Detail.
- [x] `bp3dMap.json` in `build:kb-data` aus KB regenerieren (statt Hand-Copy) — AL 2026-11-11, `build-bp3d-map.mjs`.
- [x] Org `903f1fbe`: Haupt-Checkout hinter origin/dev syncen + AL-LOG 11.11. verifizieren — AL 2026-11-11.
- [x] CTO-Nacht `c1f9b6ce` Port: `automerge-pr.yml` Dependabot base=master→dev Retarget (journal-SSOT) — AL 2026-11-12.
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

**Gemini-Review (potenzielle blinde Flecken, 2026-11-10):**
*   **Ungetestete Stabilität des wiederhergestellten `TodayPlan`-Screens:** Die Wiedereinführung des `TodayPlan`-Habit-Screens als optionale Einstellung wurde nicht mit einem echten Plan-Klienten getestet, was angesichts früherer Bugs in dieser Komponente ein Risiko darstellt.
*   **Implizite Annahme zur `sessionStorage`-Persistenz:** Die Speicherung der Plan-/Manuell-Wahl in `sessionStorage` ist flüchtig (z.B. bei Inkognito-Modus oder Browserdaten-Löschung), was nicht als Trade-off oder Edge-Case in der Zusammenfassung erwähnt wird.
*   **Ungenutzter `TemplateLauncher`:** Die im Code als "hängt tot rum, unangetastet" markierte Komponente `TemplateLauncher` wurde nicht im Rahmen der Session-Flow-Anpassungen oder im `RESULTS.md` adressiert.
