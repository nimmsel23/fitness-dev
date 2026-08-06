# CLAUDE.md — fitness/ (Python Backend)

`fitness/` ist das komplette Python-Backend-Paket: Prod-API (`fitness/api/`,
FastAPI :9150), Domain-CLI (`fitness/cli.py`, `fitness/commands/`), HTTP-
Fallback-Modul, ORM/Alembic. Übergeordneter Kontext: `../CLAUDE.md`
(Repo-Root). **`fitness/catalog/` ist ein Sub-Package davon** — das
Katalog-/KB-Tool-Set (Übungen, Anatomie, Coverage-Berechnung), eigene Doku in
`catalog/CLAUDE.md`, nicht "das Backend" selbst.

---

## Prod-API (`fitness/api/`, FastAPI, Port 9150)

`fitness/api/main.py` ist der tatsächliche Server — modulares FastAPI, kein
Monolith mehr. `fitness/catalog/api/api.py` existiert nur noch als
**Compatibility-Shim** (`from fitness.api.main import app, main`) für
bestehende systemd-Units/Skripte, die noch den alten Pfad referenzieren —
keine eigene Logik mehr dort.

**Offener Cleanup-Punkt (Stand 2026-08-06):** `pyproject.toml` (`fitness-api`/
`fitness-catalog-api`-Scripts) zeigt bereits direkt auf `fitness.api.main:main`,
aber `~/.dotfiles/config/systemd/user/fitness-python-backend.service`
(`ExecStart=uvicorn fitness.catalog.api.api:app ...`) läuft noch über den
Shim — das ist der einzige verbliebene Grund, warum `api.py` noch existiert.
Sauberer wäre: Unit auf `fitness.api.main:app` umstellen, danach `api.py`
löschen. **Nicht** ohne Absprache anfassen — Prod-Service (:9150), Änderung
braucht Service-Restart (sudo). Der Rest von `fitness/catalog/api/`
(`watcher.py`, `sync_gateway.py`, `firestore_push.py`, `push.py`) ist aktives
KB-Sync-Tooling, unabhängig von diesem Shim, bleibt so bestehen.

```
fitness/api/
├── main.py             — FastAPI-App, lifespan (startet Firestore-Catalog-Watchers)
├── config.py            — PORT (FITNESS_PYTHON_PORT/FITNESS_PORT, default 9150), RUNTIME, DB-Engine
└── routers/
    ├── sessions.py, journal.py, exercises.py, coaching.py, system.py
```

- Port: `FITNESS_PYTHON_PORT` env (default 9150)
- Starten: `python3 -m fitness.api.main` / `fitness-agent-api serve` / `fitness-devctl start --no-node`
- Service: `fitness-python-backend.service`
- **Firestore-Watcher-Trennung (seit 2026-07-30):** Nur Katalog-Belange
  (Inbox-Drafts + approved `kb/exercises`) laufen eingebettet im API-Prozess
  (`firestore.mirror.start_catalog_watchers()`). User-Data-Sync (Sessions/
  Journal/Habits/Nutrition/Supplements) läuft bewusst getrennt im
  `fitness-firestore-daemon.service` (`firestore.mirror
  .start_userdata_watchers`) — Catalog-API soll keine User-Data
  synchronisieren. Fehlen Firebase-Creds (`~/.env/firebase-fitness.json`,
  im Dev-Alltag oft der Fall): Watcher-Start wird übersprungen, kein Crash
  des ganzen API-Servers.
- 2 verschiedene Frontends werden über denselben Port 9150 serviert (Dist-Dir
  + Catalog-Dist-Dir, siehe `config.py::_DIST_DIR`/`_CATALOG_DIST_DIR`).

Node-Gegenstück (`server.mjs`, Dev-Server :9100) und der Server-Rollen-
Überblick: siehe `../CLAUDE.md`.

**HTTP-Fallback-Modul** `fitness/http.py`: `import fitness.http as _http` —
wird von `fitness/cli.py` via `_try_http()` genutzt wenn direkte Datei-Lese
fehlschlägt. Ziel: Node-Server `:9100` (`FITNESS_NODE_PORT`).
```python
_http.session_today()        # GET /session?date=today
_http.session_get(date)      # GET /session?date=YYYY-MM-DD
_http.session_list(limit)    # GET /session/history?limit=N
_http.coverage(days)         # GET /coverage?days=N
_http.gaps(days)             # GET /coverage/gaps?days=N
_http.search(query)          # GET /exercises/search?q=...
```

---

## Python Packages (pyproject.toml)

Alle vier in `pyproject.toml` (`where=["."]`) registriert, via `uv tool install` global verfügbar:

| Package | Zweck |
|---------|-------|
| `catalog` | Katalog-KB-Tools + Agent-API — Sub-Package, siehe `catalog/CLAUDE.md` |
| `fitness_cli` | Terminal CLI + TUI (kein Server nötig) — Symlink → `fitness/`, neue Imports als `fitness.X`, nicht `fitness_cli.X` |
| `db` | SQLAlchemy ORM-Layer (models, schemas, SessionLocal) |
| `firestore_kb` | KB-Sync `catalog/kb/` → Firestore (Symlink → `catalog/firestore_kb/`) |

**`fitness_cli/`-Struktur** (Direktzugriff auf Session-JSONs, kein Server nötig):
```
fitness_cli/  (→ Symlink auf fitness/)
├── paths.py             — Pfad-Konstanten (~/.aos/fitness/sessions/ etc.)
├── constants.py         — Aktivitäts-Typen, Trainingsblock-Labels, Farben
├── data.py              — load_sessions(), sync_info(), load_all_clients()
├── render.py            — ANSI/gum Render-Helfer
└── commands/
    ├── __init__.py      — muscle_to_group(), muscle_group_label() (Normalisierung)
    ├── log.py           — Typer CLI: ls / show / week / stats / history / sync-status
    └── tui.py           — Textual TUI: FitnessTUI (5 Tabs)
```

| Befehl | Entry-Point | Funktion |
|--------|-------------|---------|
| `fitness-tui` | `fitness.commands.tui:main` | Interaktive Textual TUI (Session-Dashboard) |
| `fitness-log` | `fitness.commands.log:main` | Typer CLI (ls/show/stats/…) |
| `fitness-sync` | `fitness.commands.sync:main` | KB-Sync + Firestore-Sync (kb/pull/pull-uid/push/watch/all) |
| `fitness` | `fitness.cli:main` | Domain-CLI-Dispatcher, reicht `prod`/`dev` an `fitnessctl` durch |

`fitness/commands/`: `mail.py`, `activity.py`, `sync.py`, `log.py`, `tui.py` —
neue fachliche Sub-Commands hier als eigenes Modul + `[project.scripts]`-
Entry-Point (Muster wie diese), NICHT als Inline-Funktion in `cli.py`.

---

## Dispatcher

| Dispatcher | Typ | Funktion |
|---|---|---|
| `fitness-devctl` | python3 | Dev-Server-Controller (--user-scope: fitness-dev.service, fitness-python-backend.service) |
| `fitness-prodctl` | python3 | Prod-Controller (fitness.service, system-scope :6100, sudo für restart/stop) |
| `~/fitness/bin/fitness` | python3 | Terminal-facing Domain-CLI (session/journal/coverage/gaps/search/sync/catalog) |
| `fitnessctl` | python3 | Reiner Top-Level-Router: `fitnessctl dev <cmd>` → fitness-devctl, `fitnessctl prod <cmd>` → fitness-prodctl |

`fitness prod <cmd>`/`fitness dev <cmd>` reichen 1:1 an `fitnessctl` durch (os.execv).

---

## Alembic / SQLAlchemy — eine Schema-Quelle, zwei Schreiber

`db/models.py` (`TrainingHistory`) ist die einzige Model-Definition, Alembic
versioniert jede Änderung (`alembic revision --autogenerate` + `upgrade head`).
`fitness/catalog/api/sync_gateway.py` (Session-JSON → SQLite) und
`fitness/catalog/history.py` (CLI/TUI/`weekly.py`) nutzen beide dasselbe
ORM-Model — kein Raw-`CREATE TABLE`/`SELECT` mehr im Repo für diese Tabelle.

**Bewusster Unterschied:** `history.py` baut sich pro Aufruf eine eigene
Engine über `db.resolve_db_path()` (live aufgelöst, respektiert `HOME`/
`FITNESS_RUNTIME` zum Aufrufzeitpunkt), statt die beim Prozessstart einmalig
gebundene `db.engine`/`db.SessionLocal` zu importieren — Grund: Tests patchen
`HOME` pro Testfall, mit der gecachten Engine trafen nachfolgende Testfälle
sonst dieselbe (gelöschte) Tempdir-Datei. Für `sync_gateway.py`/`api.py` (ein
Prozess, `HOME` ändert sich nie zur Laufzeit) bleibt die gecachte `db.engine`
korrekt.

`pain`-Spalte ist aktiv genutzt (CLI `--pain`-Option, TUI-State,
`progress_hint()`) — bei Schema-Änderungen nicht stillschweigend droppen.

---

## Testing

```bash
cd ~/fitness-dev && python3 -m pytest catalog/tests/
```

~60 vorbestehende Fehler aus mehreren unabhängigen Ursachen (nicht nur
tmp-dir-Isolation): `main(argv)`-Testcalls gegen die inzwischen parameterlose
typer-`main()` (test_wger.py, test_weekly_report.py, test_preview.py),
canonical-ID-Drift (`incline_dumbbell_press` statt `041`), und
`mock.patch("catalog.X...")`-Strings die durch den `catalog`-Symlink ein
anderes Modul-Objekt patchen als `fitness.catalog.X` tatsächlich importiert
(dual-module-identity — Patch wirkt dann einfach nicht). Vor Rückschlüssen auf
eigene Änderungen: **kein `git stash`** (siehe Gotcha in `../CLAUDE.md`) —
stattdessen `git worktree add` oder gezielt Testdateien vergleichen.

---

## `fitness/catalog/core/paths.py` — Env-Loading

Lädt beim Modul-Import automatisch zwei `.env`-Dateien (`~/fitness/.env` UND
`~/.env/fitness.env`) — jedes Modul, das `core.paths` importiert (direkt/
transitiv), hat diese Variablen automatisch in `os.environ`. Keine
hartcodierten Fallback-Secrets mehr in `config.py`/`importer.py` einbauen
(`WGER_TOKEN`, `WGER_BASE`, `WGER_API_TOKEN`, `WGER_API_BASE` liegen
ausschließlich dort).
