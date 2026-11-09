# FRAME — fitness-dev

Stand: 2026-11-09. Ehrliche Bestandsaufnahme (Repo + App), kein Wunschdenken.

## Was ist das?

| | |
|---|---|
| **Rolle** | Klienten-PWA — loggen, lesen, Pläne ausführen |
| **Repo** | `~/dev/fitness-dev` → `nimmsel23/fitness-dev` |
| **Branch** | `dev` @ `5e7bca1` — sync mit `origin/dev` |
| **Pkg** | `fitness-dev` 3.0.0 |
| **Nicht** | Coach-Code, Catalog-Python-SOT, Live-API-Owner |

## App / Oberfläche

- Vite/React PWA: Session, Logbuch, Plan-Miniapp, Inbox, Learn, Muscles, Settings
- Prod: Firebase-direkt (`@db` → Firestore), kein Server nötig
- Dev: optional Proxy/Mock; `fitness-dev.service` derzeit **inactive**
- Views inkl. Digest-Logbuch, Cloud/Local-Origin-Badge (Nov 2026)
- Übungs-Default: Yuhonas-Pin (Pflaster). Expert-KB = `kb/exercises` nach Inbox → Build-JS
- Plan kommt als Miniapp/Overlay (Sibling `plan-dev` / `fitness.ref`-Pin)

## Backend / Daten (fremd, konsumiert)

| Braucht | Liegt bei |
|---|---|
| YAML-KB / Enrichment | `~/dev/fitness` + `coach catalog` |
| HTTP :9150 | `coach-api.service` auf `coach-dev` (**active**, `127.0.0.1:9150`) |
| Plan-Editor-Code | `plan-dev` |
| Node-Funktionen | `~/dev/backend` |

Eingebetteter Tree `fitness/` (Python) = **Fork-Schuld** — nicht weiter pflegen.

## Repo-Zustand

- Breakthrough + Yuhonas-Pin auf `origin/dev` (nach Rebase auf ~57 Remote-Commits)
- Root/`docs/ARCHITECTURE.md` beschreiben die Klienten-Rolle im neuen Modell
- `fitness/catalog/kb` hier gilt als veraltete Kopie (Ownership seit 2026-11-06 Coach/Daten-Repo)

## Release

`dev` → `master` (CI) → Shell `fitness-release` / `vos-release fitness`.
Hosting: Fitness-Workflow / vos-fitness.

## Offen / Drift

- Python-Fork `fitness/` langfristig ignorieren oder ausdünnen
- Vendor-Vollklon Yuhonas optional (Pin reicht für CDN; Vollklon in plan-dev)
- CI-Secrets / Gemini-Agent-Abnahme teils noch offen (siehe ältere RESULTS)
- Untracked `AL-LOG.md` lokal möglich — nicht Teil des Breakthroughs

## Ein Satz

Fitness ist die App für den Menschen am Gerät; Wissen und Schmiede liegen woanders.
