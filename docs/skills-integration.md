# Skills: direkte Submodule-Integration

Stand: 2026-10-17. `Skills/` ist ein Gitlink zu `nimmsel23/skills-dev`,
Tracking-Branch `fitness`. Die frühere identische Kopie ist ersetzt.
Entwicklungsquelle: `~/skills-dev/dev`. Fitness importiert unverändert
`Skills/SkillsCard.jsx` und `Skills/skills.css`; neue Module kommen direkt
aus diesem Checkout. Keine manuellen Dateikopien mehr.

1. In skills-dev entwickeln, testen, committen und dev pushen.
2. Den geprüften Stand in den Branch fitness übernehmen und pushen.
3. Skills/-Gitlink aktualisieren, Fitness prüfen und scoped committen.
4. Fitness-dev pushen, in vitalos/fitness-app (Branch vitalos) übernehmen,
   verschachtelte Submodule sync/update und Release-Branch pushen.
5. VitalOS-Fitness-Pointer bumpen und pushen.

`deploy-fitness.yml` baut den Host. `deploy-skills.yml` im VitalOS-Meta-Repo
baut denselben gepinnten `fitness-app/Skills`-Checkout als eigenständige App
für vos-skills.web.app. Root-Workspace-Lockfile und Skills-Lockfile bleiben
getrennt: Skills-CI installiert in dem verschachtelten Standalone-Paket.

Prüfung: `node Skills/scripts/test-exercise-videos.mjs`, Fitness-Lint und
normaler/Firebase-Build. Alle 65 Übungen haben Videos (50 native Loops,
15 Tutorials); Details/Quellen in Skills/docs/EXERCISE-VIDEOS.md.
