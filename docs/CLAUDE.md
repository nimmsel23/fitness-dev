# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

**Sub-Docs (lies mit, je nach Bereich):**
- `../fitness/CLAUDE.md` — Python-Backend (Prod-API :9150, Dispatcher, Alembic, Packages)
- `../fitness/catalog/CLAUDE.md` — Katalog-/KB-Tool-Set (Sub-Package von `fitness/`: KB-Struktur, Coverage-Formel, Gemini-Enrichment)
- `../src/CLAUDE.md` — React-Frontend (Tabs/Views, DB-Layer, Body-Highlighter, PWA/Offline, Session-JSON-Format)
- `../anatomy-kb/CLAUDE.md` — Muskel-Anatomie-KB (Git Subtree, :9200)

---

## fitness-dev: Praktisches Werkzeug der Diplom Präventiver Vitaltrainer Ausbildung

**fitness-dev** ist ein Kraft-Trainings-Tracking-System (PWA Frontend, Node.js Backend) das die Pflichtaufgaben der Fitnesstrainer-Module konkret unterstützt:
- Trainingspläne erstellen + dokumentieren
- Trainings-Logs führen + exportieren
- Anatomie-Lehre dokumentieren + verstehen
- Muskelabdeckungs-Analyse

---

## Arbeitshinweise für Claude Code (dauerhaft gültig, repo-weit)

- `CLAUDE.md` ist Symlink → `docs/CLAUDE.md`. Direktes Schreiben scheitert
  ("Refusing to write through symlink") — immer `docs/CLAUDE.md` editieren.
- `~/vitalos/fitness-app` ist ein Git-**Worktree** von `~/fitness-dev`
  (`git worktree list` zeigt alle) — kein separater Clone. Ein Branch kann
  nicht in zwei Worktrees gleichzeitig ausgecheckt sein; dort meist mit
  `git checkout <commit-hash>` (detached) statt `git checkout master` arbeiten.
- Live-KB-Pfad ist `fitness/catalog/kb/`. `catalog` ist Symlink darauf
  (`catalog -> fitness/catalog`), `fitness_cli` Symlink auf `fitness` — kein
  separater Alt-Baum mehr, alle drei Pfade sind identisch. Details zur
  Katalog-Struktur: `../fitness/catalog/CLAUDE.md`.
- CLI-Binary heißt `fitness-catalog` (uv-Tool unter
  `~/.local/share/uv/tools/fitness-agent/bin/`), NICHT `fitness-agent` — die
  Skill-Doku ist hier veraltet. Domain-Dispatcher `fitness agent <cmd>` ruft
  dieselbe CLI auf. `fitness-catalog doctor` für schnellen Health-Check,
  `fitness-catalog audit anatomy|exercises|coverage` (Topic angeben!) —
  `audit` ohne Topic/mit "all" hängt (>30s, vermutlich wger-Netzwerkaufruf),
  nicht mit langem Timeout erneut versuchen ohne das zu verifizieren.
- **Mehrere Claude-Sessions laufen praktisch immer parallel** an diesem Repo
  (`ps aux | grep claude` zeigt üblicherweise mehrere Prozesse, teils
  eigenständige anatomy-agent-Läufe). Vor größeren Eingriffen/gemeinsam
  genutzten Dateien (`kb/inbox_*.yml` etc.): `git status`/`git log -3` bzw.
  `git log --oneline -5 -- <pfad>` prüfen — frische Commits/unerwartete
  `M`-Dateien einer anderen Session sind kein Fehler, nicht reflexartig
  reverten. Vor eigenem `git add`/`git commit`: prüfen ob die eigene Änderung
  nicht schon (mit-)committed wurde (kann auch der Enrichment-Watcher tun,
  z.T. mit falscher Attribution) — nicht blind erneut committen.
- **`git stash` ist in diesem Repo riskant**, seit `catalog`/`fitness_cli`
  Symlinks sind: `git stash -u` kann bei Symlinks silent fehlschlagen ("...
  is beyond a symbolic link"), ein danach ausgeführtes `git stash pop` poppt
  dann einen ALTEN, unrelated Stash-Eintrag statt nichts zu tun. Nach jedem
  `git stash`: `git stash list` davor/danach vergleichen.
- `~/fitness/free-exercise-db` ist ein reiner Git-Klon von
  `github.com/yuhonas/free-exercise-db` (kein eigener Code) — falls Dateien
  fehlen, ist ein frischer Klon in ein Temp-Verzeichnis + gezieltes Kopieren
  risikofrei; `git checkout -- .` im Original-Ordner wird vom
  Auto-Mode-Classifier als Bypass-Versuch geblockt — nicht versuchen,
  stattdessen User fragen oder Fresh-Clone-Weg nehmen.
- Firestore-Bugs live debuggen statt aus Code raten: `firebase-admin`
  Python-SDK + Credentials unter `~/.env/firebase-fitness.json`
  (`firebase_admin.initialize_app(credentials.Certificate(...))`, dann
  `db.collection_group(...)` / `db.collection(...).stream()`) — deckt Bugs
  auf, die aus reinem Code-Lesen nicht zweifelsfrei hervorgehen (Dokument-
  IDs, tatsächlich gespeicherte Feldwerte).
- Nach `git push`: `gh run list --limit 5` / `gh run view <id> --log-failed`
  prüfen — Post-Push-Hook triggert automatisch Build+Deploy.

---

## Architektur: Zwei Schichten

### 1. fitness-dev (dieses Repo) — der Tempel
Node.js Backend + React Frontend. Logging, Visualisierung, Export.
Details: `../src/CLAUDE.md`.

### 2. fitness/ — Python Backend (Prod-API :9150 + Katalog-Tool-Set)
`fitness/api/` ist das Prod-Backend selbst (FastAPI). `fitness/catalog/` ist
ein **Sub-Package** darin — das KB-/Katalog-Tool-Set (Claude/Gemini nutzen es,
um den Katalog zu erweitern), kein eigenständiges Backend. Details:
`../fitness/CLAUDE.md` (Backend, Dispatcher, Alembic) und
`../fitness/catalog/CLAUDE.md` (KB-Struktur, Coverage-Formel).

---

## Backend — Server-Rollen auf einen Blick

| Datei | Port | Typ | Rolle |
|-------|------|-----|-------|
| `server.mjs` | 9100 | Node/Hono | **DEV-Server** — Vite-Proxy-Target, Frontend-Dev |
| `fitness/api/main.py` | 9150 | Python/FastAPI | **Prod-Backend** — Tailscale-Funnel, Direktimports (`fitness/catalog/api/api.py` ist nur noch Compat-Shim, siehe `../fitness/CLAUDE.md`) |

**server.mjs** (Hono, `@hono/node-server`):
- API-Routen: `/session`, `/journal`, `/exercises/search`, `/coverage`, `/fitness/plan`, `/fitness/weekly`, `/fitness/export`, `/fitness/body`
- Static-Serving (dist/ oder public/) + SPA-Fallback
- Proxies: wger (lokal), HabitSync (:6842)
- **Dual-write**: `POST /session` schreibt JSON-File + SQLite synchron
- **wger Gewichtssync**: `POST /fitness/body` mit `weight_kg` → schreibt Body-JSON + pusht `POST /api/v2/weightentry/` zu wger (fire-and-forget). Token: `WGER_API_TOKEN` env. Base-URL: `WGER_BASE` env (Standard `:8000`, wger läuft tatsächlich auf `:80`, siehe `../fitness/catalog/CLAUDE.md`).

**fitness-runtime.mjs** (Shared Runtime): `searchExercises()`, `buildPlan()`,
`getWeeklySummary()` (via Python weekly.py), `exportSessionMarkdown()`.

**Daten**: `~/.aos/fitness/`
- `sessions/YYYY-MM-DD.json` — Session-Logs (SOT für Node-Server)
- `sessions/training_history.sqlite` — SQLite Mirror (SOT für catalog Python-Tools)
- `journal/YYYY-MM-DD.md` — Text-Notizen
- `body/YYYY-MM-DD.json` — Körpermessungen (Fitbit-Pipeline)
- `plan.json` — Aktiver Trainingsplan
- `agent-state/` — catalog Runtime-State (Symlink: catalog/state)

---

## Commands

| Befehl | Zweck |
|--------|-------|
| `npm run dev` | Backend (9100) + Vite DevServer (5902) mit HMR |
| `npm run ui:dev` | Nur Vite DevServer (Port 5902) |
| `npm run build` | Production-Build in `dist/` |
| `npm run build:catalog` | Katalog → ~/.aos/fitness/workouts/catalog.json |
| `fitnessctl dev status` / `fitnessctl prod status` | Service-Status Dev bzw. Prod |
| `fitness sync kb\|pull\|pull-uid\|push\|watch\|all` | KB-Sync + Firestore-Sync (`fitness/commands/sync.py`) |
| `fitness catalog` | Katalog-TUI (Dashboard/Inbox-Review "Neuzugänge"/Browser/Plan/Lesson/History) |
| `fitness enrich-watch` | Gemini-Enrichment-Daemon im Vordergrund/Ad-hoc starten (läuft normalerweise als `fitness-enricher.service`) |
| `systemctl --user status fitness-enricher.service` | Status des dauerhaften Enrichment-Watchers |
| `fitness session today` | Heutige Session anzeigen |
| `fitness coverage -d DAYS` | Muskelabdeckung der letzten N Tage |
| `cd pwa && npm run dev` | Firebase PWA Dev-Server |
| `cd pwa && npm run deploy` | Firebase PWA bauen + deployen |

Weitere Dispatcher (fitness-devctl/fitness-prodctl/fitnessctl): `../fitness/CLAUDE.md`.

---

## API-Referenz

| Endpoint | Methode | Beschreibung |
|----------|---------|-------------|
| `/health` | GET | Server-Status |
| `/exercise/:id/teaching` | GET | Anatomy-Lesson aus catalog/kb/anatomy_teaching/ |
| `/session?date=YYYY-MM-DD` | GET/POST | Tageslog — POST macht dual-write (JSON + SQLite) |
| `/session/history?limit=10` | GET | Letzte N Sessions |
| `/exercises/search?q=...` | GET | Search lokal + wger + yuhonas |
| `/fitness/plan?template=ppl&split=6` | GET | Trainingsplan-Generator |
| `/fitness/weekly?week=2025-W45` | GET | Wochenreport (week: "current" oder "YYYY-Www") |
| `/fitness/export` | POST | Session/Plan/Sheet/Lesson-Export |
| `/theme` | GET/POST | UI-Theme-Pref |
| `/fitness/body?days=30` | GET | Körpermessungen (Gewicht, BMI, Schritte, Schlaf, HR) der letzten N Tage |
| `/fitness/body` | POST | Body-Eintrag speichern + wger-Gewichtssync (wenn `weight_kg` vorhanden) |
| `/firestore/status` | GET | Firestore-Verbindungsstatus (`{ ok, project }`) |
| `/firestore/sync` | POST | Letzte 30 Sessions → Firestore pushen |

---

## Muscle-Normalisierung (CLI)

`fitness_cli/commands/__init__.py::muscle_to_group(name)` mappt rohe
Session-Muskelnamen (`"201_latissimus_dorsi"`, `"Back"`, `"back"`) auf
kanonische Gruppen (`"back"`) via Präfix-Range. `muscle_group_label(group)`
gibt den deutschen Anzeigenamen zurück (`"Rücken"`).

---

## Abhängigkeiten

- **wger lokal** — primäres Backend, lokal gehostet (Port-Gotcha: `../fitness/catalog/CLAUDE.md`)
- **yuhonas_free_exercise_db** — optional, Bilder + Varianten
- **better-sqlite3** — dual-write SQLite im Node-Server
- **React** ^18.3, **Vite** ^5.4, **TailwindCSS** ^3.4
- **react-body-highlighter** ^2.0.5 — Body-Map UI
- **recharts** — Charts (WeightChart, Coverage-Trends)

---

## Workflow

1. **Ausbildung läuft** — User macht Fitnesstrainer-Module, Pflichtaufgaben
2. **User loggt Sessions** — über Session-View, dual-write in JSON + SQLite
3. **AI Agent erweitert Katalog** — nutzt `fitness/catalog`-Tools (`audit anatomy` → fehlende Übungen, Gemini generiert YAML, `map-wger` → wger-IDs)
4. **fitness-dev zeigt es** — Anatomie-Layer, Coverage-Analyse, BodyMap
5. **Loop** — mehr Logs → bessere Coverage-Analyse → bessere Vorschläge

---

## Status

- ✅ DEV-Server (Node.js, Port 9100) — server.mjs, Hono, Vite-Proxy-Target
- ✅ Python Prod-Backend (FastAPI, Port 9150) — Tailscale-Funnel
- ✅ Frontend Views (Dashboard, Session, Journal, Muscles, Learn, Weekly, Habits, Settings, Inbox)
- ✅ Swipe-Navigation + Gym Mode (layout scaling)
- ✅ Dual DB-Layer (`@db` Alias, lokal vs. Firebase-Build)
- ✅ wger + yuhonas Integration
- ✅ Katalog-Struktur in `fitness/catalog/kb/` (Exercises, Anatomy Teaching, Rules, Registry)
- ✅ Pytest-Suite (`fitness/catalog/tests/`, ~60 vorbestehende Fehler, siehe Sub-Doc)
- ✅ Session dual-write (JSON + SQLite via better-sqlite3)
- ✅ Gmail-Pipeline (bin/fitness-mail, Fitbit-Daten)
- ✅ Firestore Sync + PWA Offline-Unterstützung (SW + IndexedDB offline-queue)
- ✅ Firebase PWA: `npm run build:firebase` → `~/fitness/dist-firebase/`
- ✅ anatomy-kb Integration (Git Subtree, :9200)
- ⏳ AI Agent Workflow (Gemini → anatomy_teaching YAML-Generierung, laufend)
- ⏳ Coverage-Granularität (primary/secondary/stabilizer) — teilweise
- ⏳ Anatomie-Lehre für alle Übungen (~28 von ~50+ im Katalog)
- ⏳ npm workspaces (root + pwa/ + arena/ als Workspace-Pakete)
