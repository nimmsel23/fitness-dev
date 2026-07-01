# fitness-dev Architecture

Orts-bezogene Übersicht: was läuft wo, mit welchem Stack, auf welchem Port.

---

## Laufende Services

| Service | Port | Pfad | Stack | Rolle |
|---------|------|------|-------|-------|
| Python Backend | 9150 | `~/fitness-dev/server.py` | FastAPI + uvicorn | Prod/Tailscale Backend, KB-Direktimport |
| Node Backend | 9100 | `~/fitness-dev/server.mjs` | Hono (@hono/node-server) | Frontend-Dev-Server, Vite Proxy-Target |
| fitness_agent | 9120 | `~/fitness-dev/catalog/fitness_agent/server.py` | aiohttp | Legacy — wird archiviert sobald server.py verifiziert |
| anatomy-kb | 9200 | `~/fitness-dev/anatomy-kb/server.py` | aiohttp | Muskel-Anatomie-Layer, HTTP-Fallback |
| Vite DevServer | 5902 | `~/fitness-dev/vite.config.js` | Vite + React | HMR, proxied API zu :9100 |

Systemd (user-scope):
- `fitness-python-backend.service` → server.py :9150
- `fitness-firestore-daemon.service` → on_snapshot Fallback
- `fitness-firestore-mirror.timer` → stündlicher Sync

---

## Python Backend (`server.py` :9150)

**Stack:** FastAPI · uvicorn · pydantic v2 · loguru · httpx · pandas · PyYAML

**Direktimports (kein HTTP-Proxy):**
- `fitness_agent.*` aus `catalog/fitness_agent/`
- `anatomy_kb.*` aus `anatomy-kb/anatomy_kb/`
- `firestore.*` aus `firestore/` (user-data Mirror)
- `firestore_kb.*` aus `catalog/firestore_kb/` (KB-Sync-Primitives)

**Datenbank:**
- SQLite via **SQLAlchemy ORM** — `~/.aos/fitness/sessions/training_history.sqlite`
- Migrations: **Alembic** — `~/fitness-dev/alembic/versions/`
- Modelle: `~/fitness-dev/db/models.py`

**Pandas-Einsatz:**
- `_coverage_hits()` — muscle groupby sum über N Tage
- `coverage_anatomy()` — pivot_table nach Muskelrolle (primary/secondary/stabilizer)
- `export_pflichtaufgabe()` — DataFrame → CSV

**Endpoints (Auswahl):**

| Prefix | Beschreibung |
|--------|-------------|
| `/session`, `/sessions`, `/session/history` | Session CRUD + dual-write (JSON + SQLite) |
| `/journal` | Markdown-Journal |
| `/fitness/body` | Körpermessungen + wger Gewichtssync |
| `/exercises/search` | Lokaler Katalog + wger + yuhonas |
| `/exercise/{id}/teaching` | Anatomie-Lesson aus anatomy_teaching YAML |
| `/fitness/muscles` | Muskel-Taxonomie |
| `/coverage/detailed`, `/coverage/anatomy`, `/coverage/gaps` | Muskelabdeckungs-Analyse |
| `/fitness/weekly` | Wochenreport |
| `/fitness/plan` | Trainingsplan-Generator |
| `/export/csv`, `/export/pflichtaufgabe` | CSV-Exports |
| `/fitness/export/{kind}` | Obsidian/Markdown-Export |
| `/firestore/status`, `/firestore/sync`, `/firestore/pull` | Firestore-Integration |
| `/habitsync/*` | Habits (lokal, Firestore-first via server.mjs) |
| `/health` | Health-Check |

---

## Node Backend (`server.mjs` :9100)

**Stack:** Hono · @hono/node-server · better-sqlite3 · firebase-admin · node-fetch

**Rolle:** Frontend-Dev-Server. Bleibt als Vite-Proxy-Target. Wird langfristig durch server.py abgelöst.

**Dual-write:** `POST /session` schreibt JSON-File + SQLite synchron (better-sqlite3).

**Proxies:** wger (:8000), HabitSync (:6842)

---

## Catalog / KB (`catalog/`)

```
catalog/
├── fitness_agent/          Python Tool-Set (resolver, planner, coverage, weekly, obsidian, …)
├── firestore_kb/           Shared Firestore-Primitives für KB-Sync (batch_write, fetch_hashes, …)
├── kb/
│   ├── exercises/          Exercise-YAMLs (canonical IDs)
│   ├── anatomy_teaching/   Anatomie-YAMLs (Ursprung, Ansatz, Innervation)
│   ├── muscles/            Muskel-Taxonomie + Coverage-Regeln
│   └── maps/               Aliases, wger-Mapping, yuhonas-Mapping
└── tests/                  Pytest-Suite
```

**Stack:** PyYAML · loguru · tqdm · typer · pandas · google-cloud-firestore

---

## anatomy-kb (`anatomy-kb/`)

Git-Subtree in fitness-dev (war standalone unter `~/anatomy-kb/`).

```
anatomy-kb/
├── anatomy_kb/
│   ├── config.py           Zentral-Resolver (auto-detect subtree vs. sibling)
│   ├── muscle_store.py     Muskel-Index (muscles/*.yml)
│   ├── muscle_handler.py   API-Handler für /muscles/*
│   ├── firestore_handler.py → Firestore fitness/kb/muscles/ + anatomy/ + index/
│   └── commands/           CLI (audit, enrich, serve, …)
├── muscles/                Ein YAML pro Muskel (origin, insertion, innervation, function)
└── server.py               aiohttp :9200
```

**Verhältnis zu catalog/kb:**
- `anatomy-kb/muscles/` = Deep-Anatomie-Layer (Einzelmuskel, ausbildungsrelevant)
- `catalog/kb/anatomy_teaching/` = Teaching-Layer (je Übung: joint_actions, errors, cues)
- `anatomy-kb/exercises/` → Symlink auf `catalog/kb/anatomy_teaching/`

**Firestore-Sync:**
- muscles → `fitness/kb/muscles/{muscle_id}` + `fitness/kb/muscles/{rbh_slug}`
- anatomy_teaching → `fitness/kb/anatomy/{exercise_id}`
- catalog-index.json → `fitness/kb/index/catalog`

---

## Daten (`~/.aos/fitness/`)

| Pfad | Inhalt | Schreiber |
|------|--------|-----------|
| `sessions/YYYY-MM-DD.json` | Session-Logs | server.py · server.mjs |
| `sessions/training_history.sqlite` | SQLite Mirror | server.py (SQLAlchemy) · server.mjs (better-sqlite3) |
| `journal/YYYY-MM-DD.md` | Text-Notizen | server.py |
| `body/YYYY-MM-DD.json` | Körpermessungen | server.py |
| `plan.json` | Aktiver Trainingsplan | server.py |
| `theme.json` | UI-Theme-Präferenz | server.py |
| `users/{uid}/sessions/` | Multi-User Sessions | server.py |
| `sessions/training_history.sqlite` | SQL Mirror | SQLAlchemy (server.py) |

---

## Firestore (`fitness-aos` Projekt)

| Collection | Inhalt | Sync-Richtung |
|------------|--------|---------------|
| `fitness/sessions/{date}` | Session-Mirror | Push (on write) |
| `fitness/journal/{date}` | Journal-Mirror | Push (on write) |
| `fitness/kb/exercises/{id}` | Exercise-Katalog | Push (fitness_agent kb-sync) |
| `fitness/kb/muscles/{id}` | Muskel-Daten | Push (anatomy-kb sync) |
| `fitness/kb/anatomy/{exercise_id}` | Teaching-Layer | Push (anatomy-kb sync) |
| `fitness/kb/index/catalog` | Katalog-Index | Push (anatomy-kb sync) |

Creds: `~/.env/firebase-fitness.json` (Service Account)

---

## Frontend (`src/`)

**Stack:** React 18 · Vite · TailwindCSS · recharts · react-body-highlighter · react-muscle-highlighter

**Build-Modi:**
- `npm run build` → `dist/` (lokal, served by server.mjs + server.py SPA-Fallback)
- `npm run build:firebase` → `~/fitness/dist-firebase/` (Firebase PWA Deploy)

**@db Alias:**
- Default → `src/db.js` (Barrel, alle Calls via fetch → :9100)
- Firebase-Build → `src/db.firestore.js` (Firestore SDK direkt)

---

## Datenquellen-Hierarchie

```
custom_yaml (catalog/kb/)    — Semantic Truth, gewinnt bei Konflikt
    ↑ überschreibt
wger (:8000 lokal)           — Exercise Master Data, Primär-Backend
    + ergänzt
yuhonas (free-exercise-db)   — Bilder, Varianten, alternative Namen
```

---

## Geplant / In Arbeit

| Was | Wo | Status |
|-----|----|--------|
| SQLAlchemy ORM | `db/models.py` + `server.py` | in Arbeit |
| Alembic Migrations | `alembic/` | in Arbeit |
| Bridge-Handler `/fitness-backend` | `~/aos-dev/handlers/fitness.py` | geplant |
| Tailscale Funnel | root → Bridge :9080 | reset, neu einzurichten |
| fitness_agent/server.py archivieren | `archive/` | nach server.py Verifikation |
