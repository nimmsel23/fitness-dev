# Inventur: fitness-dev Backend

> Stand: 2026-06-20  
> Quelle: `~/fitness-dev/server.mjs` + `catalog/fitness_agent/`  
> Zweck: Vollständige Erfassung aller Assets die in den unified-server überführt werden müssen.

---

## Hauptdatei: server.mjs (Hono, :9100)

Single-file Backend — alle Routen inline, keine Route-Module.

**Imports/Abhängigkeiten:**
```
@hono/node-server        — HTTP-Server
hono                     — Router + c.json()
better-sqlite3           — SQLite (training_history.sqlite)
js-yaml                  — YAML-Katalog lesen
firebase-admin           — Firestore Sync
```

**Datenpfade in server.mjs:**
```js
DATA_DIR     = ~/.aos/fitness/
SESSIONS_DIR = ~/.aos/fitness/sessions/
JOURNAL_DIR  = ~/.aos/fitness/journal/
BODY_DIR     = ~/.aos/fitness/body/
DB_PATH      = ~/.aos/fitness/sessions/training_history.sqlite
PLAN_PATH    = ~/.aos/fitness/plan.json
THEME_FILE   = ~/.aos/fitness/theme.json
```

**Vollständige Route-Inventur:**

| Method | Path | Beschreibung |
|--------|------|-------------|
| GET | `/health` | Server-Status + SQLite-Check |
| GET | `/exercises/search?q=&source=` | Search: lokal + wger + yuhonas |
| GET | `/exercises/by-group` | Exercises gruppiert nach Muskelgruppe |
| GET | `/exercise/:id/teaching` | Anatomie-Lesson aus anatomy_teaching YAML |
| GET | `/fitness/plan?template=&split=` | Plan-Generator via fitness_agent |
| GET | `/fitness/weekly?week=` | Wochenreport via Python weekly.py |
| POST | `/fitness/export` | Export: session/plan/sheet/lesson |
| GET | `/fitness/body?date=` | Körper-Messungen |
| POST | `/fitness/body` | Körper-Messung speichern |
| GET | `/fitness/clients` | Klienten-Liste aus YAML-Config |
| GET | `/fitness/inbox` | Neue Exercise-Einträge (Genehmigungsqueue) |
| POST | `/fitness/inbox/:id/approve` | Exercise genehmigen + in KB schreiben |
| DEL | `/fitness/inbox/:id` | Exercise ablehnen |
| GET | `/fitness/config` | Aktuelle Config (catalog/config.yml) |
| GET | `/fitness/search?q=` | Alias → canonical search |
| GET | `/fitness/exercises/all` | Alle Exercises aus KB |
| GET | `/fitness/muscles` | Muskel-Taxonomie (muscles.yml) |
| GET | `/fitness/muscles/:id` | Einzelner Muskel mit Exercises |
| GET | `/habitsync/habits` | HabitSync-Proxy (:6842) |
| POST | `/habitsync/record/:uuid` | Habit tracken |
| POST | `/habitsync/add` | Neues Habit anlegen |
| DEL | `/habitsync/delete/:uuid` | Habit löschen |
| GET | `/plan/today` | Heutiger Block aus plan.json |
| GET | `/blocks` | Alle Blocks aus plan.json |
| GET | `/session?date=&id=` | Session laden |
| GET | `/sessions?date=` | Alle Sessions eines Tages |
| POST | `/session?date=&id=` | Session speichern (dual-write) |
| DEL | `/session?date=&id=` | Session löschen |
| GET | `/session/history?limit=` | Letzte N Sessions |
| GET | `/session/latest` | Letzte Session |
| GET | `/journal?date=` | Journal-Eintrag laden |
| POST | `/journal` | Journal-Eintrag speichern + Firestore |
| GET | `/journal/list` | Journal-Einträge (letzte 30 Tage) |
| GET | `/coverage/detailed?days=` | Muscle Coverage Analyse |
| GET | `/coverage/anatomy` | Anatomie Coverage-Status |
| GET | `/coverage/gaps` | Muskelgruppen mit Lücken |
| GET | `/export/csv` | Sessions als CSV |
| GET | `/export/pflichtaufgabe` | Ausbildungs-Export (Markdown) |
| GET | `/theme` | UI-Theme laden |
| POST | `/theme` | UI-Theme speichern |
| GET | `/firestore/status` | Firebase-Verbindungsstatus |
| POST | `/firestore/sync` | Letzte 30 Sessions → Firestore |

## Python Sidecar: fitness_agent (:9120)

Eigenständiger aiohttp-Server. Server.mjs proxied bestimmte Calls dorthin.

**Datei:** `catalog/fitness_agent/server.py`

| Endpoint | Methode | Funktion |
|----------|---------|---------|
| `/health` | GET | Sidecar-Status |
| `/resolve` | POST | Alias → canonical_id |
| `/teach` | POST | Anatomie-Lesson rendern |
| `/log` | POST | Training-Eintrag in SQLite |
| `/history` | GET | Training-History |
| `/report` | GET | Coverage-Report |
| `/plan` | POST | Trainingsplan generieren |
| `/coach-sheet` | POST | Coaching-Daten strukturiert |
| `/map-wger` | POST | Exercise ↔ wger_id |
| `/audit` | POST | Katalog-Qualität prüfen |
| `/inbox` | GET | Inbox-Queue |
| `/inbox/:id/approve` | POST | Exercise genehmigen |
| `/inbox/:id` | DEL | Exercise ablehnen |
| `/export/:kind` | POST | Export |

## catalog/kb/ — Knowledge Base

```
catalog/kb/
  exercises/
    chest.yml, back.yml, shoulders.yml, arms.yml,
    legs.yml, core.yml, cardio.yml, ...
  anatomy_teaching/
    barbell_row.yml, barbell_bench.yml, ...  (~28 Dateien)
  maps/
    aliases.yml                — Freie Namen → canonical_id
    wger_mapping.yml           — canonical_id ↔ wger_id
    external_db_mapping.yml    — canonical_id ↔ yuhonas_id
  muscles/
    muscles.yml                — Muskel-Taxonomie
    muscle_coverage_rules.yml  — Gewichtungen (primary/secondary/stabilizer)
    body_highlighter_bridge.yml— Muskeln → visuelle Körperregionen
  rules/
    program_rules.yml
    progression_rules.yml
    safety_rules.yml
```

## Externe Abhängigkeiten (Node-Layer)

| Abhängigkeit | Port | Zweck |
|--------------|------|-------|
| wger lokal | :8000 | Exercise Master Data (vollständig) |
| yuhonas (free-exercise-db) | statisch | Bilder + Varianten |
| fitness_agent Python | :9120 | Catalog-Operationen, AI-Layer |
| HabitSync | :6842 | Habit-Tracking Proxy |
| firebase-admin | — | Firestore Sync (Creds: `~/.env/firebase-fitness.json`) |

## Dual-Write Pattern (Session)

```
POST /session
  → writeFileSync(sessions/YYYY-MM-DD.json)   — SOT
  → db.prepare(INSERT INTO...).run()           — SQLite Mirror
  → firestore.collection('sessions').doc()     — fire-and-forget
```

## SQLite Schema (training_history.sqlite)

Wird von `better-sqlite3` in server.mjs inline erstellt:
```sql
CREATE TABLE IF NOT EXISTS training_history (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  date TEXT NOT NULL,
  exercise_id TEXT NOT NULL,
  exercise_name TEXT,
  sets TEXT, reps TEXT, weight TEXT,
  primary_muscles TEXT,
  secondary_muscles TEXT,
  block TEXT,
  is_hit INTEGER DEFAULT 0,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP
)
```
(Kein UNIQUE-Constraint — mögliche Duplikate bei parallelen Writes, bekanntes Issue)

## Umgebungsvariablen

| Variable | Default | Quelle |
|----------|---------|--------|
| `PORT` | 9100 | server.mjs |
| `AOS_FITNESS_DATA_DIR` | `~/.aos/fitness` | server.mjs |
| `FIREBASE_CREDENTIALS` | `~/.env/firebase-fitness.json` | server.mjs |
| `FITNESS_AGENT_URL` | `http://localhost:9120` | server.mjs |
| `WGER_URL` | `http://localhost:8000` | server.mjs |
| `HABITSYNC_URL` | `http://localhost:6842` | server.mjs |

## Was in den unified-server muss

**Unbedingt:**
- Session Dual-Write (JSON + SQLite + Firestore)
- Exercise-Catalog YAML-Layer (Alias-Resolver, Teaching, Coverage)
- Anatomy-Teaching Route (`/exercise/:id/teaching`)
- Coverage-Berechnung (`/coverage/*`)
- Python Sidecar Proxy (`/agent/*` → :9120)
- HabitSync Proxy
- Firestore Sync (`/firestore/status`, `/firestore/sync`)
- Body-Tracking Routen
- Export-Routen (CSV, Pflichtaufgabe, Markdown)

**Refactor-Kandidaten beim Merge:**
- Server.mjs ist eine einzige große Datei — Route-Modularisierung überfällig
- SQLite Schema: UNIQUE-Constraint auf `(date, exercise_id, created_at)` ergänzen
- HabitSync-Proxy kann zu eigenem Route-Modul werden
