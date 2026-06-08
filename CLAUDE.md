# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

---

## fitness-dev: Praktisches Werkzeug der Diplom Präventiver Vitaltrainer Ausbildung

**fitness-dev** ist ein Kraft-Trainings-Tracking-System (PWA Frontend, Node.js Backend) das die Pflichtaufgaben der Fitnesstrainer-Module konkret unterstützt:
- Trainingspläne erstellen + dokumentieren
- Trainings-Logs führen + exportieren
- Anatomie-Lehre dokumentieren + verstehen
- Muskelabdeckungs-Analyse

---

## Architektur: Zwei Schichten

### 1. fitness-dev (dieses Repo) — der Tempel
Node.js Backend + React Frontend. Logging, Visualisierung, Export.
Wird von **fitness-dev-coding-agent** gebaut.

### 2. catalog/fitness_agent/ — Python Tool-Set + HTTP-Server (:9120)
Python-Paket das Claude oder Gemini als Tool nutzen um den Katalog zu erweitern.
**Läuft auch als eigenständiger HTTP-Server (:9120)** — `fitness-runtime.mjs` ruft ihn via HTTP auf.

```
AI Agent (Claude / Gemini)
    ↓ ruft auf
catalog/fitness_agent/           Python Tool-Set + HTTP-Server (:9120)
    ├── resolve_query()          Exercise-Name → canonical_id
    ├── teach_exercise()         Anatomie-Lesson aus YAML rendern
    ├── log_training_entry()     Eintrag in SQLite schreiben
    ├── build_plan()             Trainingsplan generieren
    ├── audit()                  Katalog-Qualität prüfen (was fehlt?)
    ├── build_coach_sheet()      Coaching-Daten strukturiert aufbereiten
    └── map_wger()               Exercise ↔ wger_id zuordnen
    ↓ schreibt in
catalog/kb/anatomy_teaching/*.yml  Anatomie-YAML (Ursprung, Ansatz, Innervation)
catalog/kb/exercises/*.yml         Exercise-Definitionen
~/.aos/fitness/sessions/training_history.sqlite
```

Server starten: `PYTHONPATH=catalog python3 -m fitness_agent.server` (Port 9120)
Fällt der Agent aus, gibt `fitness-runtime.mjs` Fallback-Daten zurück.

**Wozu:** wger liefert Übungsname + grobe Muskelgruppe. Was fehlt:
- Anatomie-Detail (Ursprung, Ansatz, Innervation, Funktion) — Ausbildungs-Level
- Coaching-Qualität (häufige Fehler, Technik-Cues, Progressionen)
- Coverage-Granularität (primary / secondary / stabilizer auf Muskel-Ebene)
- HIT-spezifische Hinweise (Stretch-Position, Peak-Kontraktion, TuT)

**Typischer Agent-Workflow:**
```
audit --topic anatomy   → findet fehlende anatomy_teaching YAMLs
Gemini generiert YAML   → aus Ausbildungswissen (Grosser, Weineck, Gottlob)
write → catalog/kb/anatomy_teaching/<exercise_id>.yml
audit again             → validiert Struktur
teach_exercise()        → UI kann Anatomie-Layer zeigen
```

**CLI-Einstieg:** `python3 -m catalog.fitness_agent <command>`
Befehle: `audit`, `resolve`, `teach`, `log`, `history`, `report`, `plan`, `coach-sheet`, `map-wger`, `tui`

---

## Backend

**server.mjs** (Port 9100): **Hono**-Server (`@hono/node-server`)
- API-Routen: `/session`, `/journal`, `/exercises/search`, `/coverage`, `/fitness/plan`, `/fitness/weekly`, `/fitness/export`
- Static-Serving (dist/ oder public/) + SPA-Fallback
- Proxies: wger (:8000 lokal), HabitSync (:6842)
- **Dual-write**: `POST /session` schreibt JSON-File + SQLite synchron

**fitness-runtime.mjs** (Shared Runtime):
- `searchExercises()` — lokale Katalog + wger + yuhonas Integration
- `buildPlan()` — Trainingsplan-Generator (PPL, Upper/Lower, etc.)
- `getWeeklySummary()` — Wochenreport via Python weekly.py
- `exportSessionMarkdown()` — Export für Obsidian/PDF

**Daten**: `~/.aos/fitness/`
- `sessions/YYYY-MM-DD.json` — Session-Logs (SOT für Node-Server)
- `sessions/training_history.sqlite` — SQLite Mirror (SOT für fitness_agent Python-Tools)
- `journal/YYYY-MM-DD.md` — Text-Notizen
- `body/YYYY-MM-DD.json` — Körpermessungen (Fitbit-Pipeline)
- `plan.json` — Aktiver Trainingsplan
- `agent-state/` — fitness_agent Runtime-State (Symlink: catalog/state)

---

## PWA / Offline

**Service Worker** (`public/sw.js`, `fitness-v1`):
- Install: `public/` statische Assets vorcachen
- GET `/session*`, `/coverage*`, `/fitness/weekly`, `/plan/today`, `/blocks` → stale-while-revalidate (Cache sofort, Netz im Hintergrund)
- Navigate → network-first + app-shell fallback
- Hashed Vite-Assets → cache-first + runtime fill
- Background Sync Tag `fitness-flush-queue` → flusht IDB-Queue beim Reconnect

**Offline-Queue** (`public/offline-queue.js`):
- IDB: `aos-offline-fitness` (stores: `queue`, `cache`)
- `window.aosOfflineQueue.fetch` — drop-in für `fetch`, von `src/api.js` genutzt
- GET offline → IDB-Cache zurückgeben statt Fehler
- POST offline → in Queue einreihen, Background Sync registrieren, 202 zurück
- Auto-flush beim `online`-Event

**Firestore Sync** (`firestore-mirror.mjs`, firebase-admin):
- Creds: `~/.env/firebase-fitness.json` (Service Account), Projekt: `fitness-aos`
- Dual-write bei `POST /session` + `POST /journal` (fire-and-forget)
- `/firestore/status` → Verbindungsstatus; `/firestore/sync` → letzte 30 Sessions pushen

---

## Frontend (React + Vite)

**src/views/** (jede View ist ein Unterverzeichnis mit `index.jsx` + Sub-Komponenten):
- Dashboard/ — Überblick + heute's Plan + Activity-Heatmap
- Session/ — Workout-Logging (mit Live-BodyMap für done exercises)
- Journal/ — Text-Notizen
- Muscles/ — Body-Map + Coverage-Analyse
- Learn/ — Anatomie-Lehre (aus catalog/kb/anatomy_teaching/)
- WeeklyReview/ — Wochenrückblick + Charts
- Habits/ — HabitSync-Integration
- Settings/ — User-Prefs (Theme, Split, HIT-Mode, Gym Mode)
- Inbox/ — Neue Übungen prüfen + genehmigen (`/fitness/inbox`)

**src/components/**:
- `layout/` — Sidebar, MobileNav, MobileHeader
- `common/` — ErrorBoundary, UserProfile
- `dashboard/` — Dashboard-spezifische Komponenten (ActivityHeatmap, etc.)
- ExerciseSearch.jsx, BodyMap.jsx, PlanBuilder.jsx, HabitWidget.jsx u.a. (flat, shared)

**src/lib/db/** — Dual DB-Layer:
- `local/` — API-Layer für lokalen Node-Server (sessions, journal, habits, kb, ...)
- `firebase/` — API-Layer für Firestore (gleiche Datei-Struktur)
- `@db` Vite-Alias zeigt auf `src/db.local.js` (lokal) oder `src/db.firebase.js` (PWA-Build)

Port 5902 (dev), Proxy zu Backend API-Routen.

**BodyMap in Session:** Zeigt nur Muskeln von Exercises mit `done: true`. Kein Preview, kein Plan — nur was bereits abgehakt ist.

**Swipe-Navigation** (Mobile): Links/Rechts wischen wechselt zwischen Views (minSwipeDistance: 70px).

**Gym Mode**: `layoutScale` (50–150%) skaliert `document.documentElement.fontSize` — für große Gym-Displays.

**Zwei Build-Modi:**
- Default (lokal/Coach): `@db` → `src/db.local.js`, `__IS_COACH__ = true`
- PWA (Firebase): `cd pwa && npm run build` — eigenes package.json, `@db` → `src/db.firebase.js`, nutzt `src/` via `@src` Alias

---

## Katalog: ~/fitness-dev/catalog/

```
~/fitness-dev/catalog/
├─ config.yml
├─ data_source_priority.yml
├─ kb/                             — Knowledge Base (eigentlicher SOT-Ordner)
│  ├─ exercises/
│  │  ├─ chest.yml, back.yml, ...  — Exercise-Definitionen (canonical IDs)
│  ├─ anatomy_teaching/            — Anatomie-YAML (vom AI-Agent befüllt, ~28 Dateien)
│  │  ├─ barbell_row.yml, ...      — Ursprung, Ansatz, Innervation, Funktion
│  ├─ maps/
│  │  ├─ aliases.yml               — Freie Eingaben → canonical_id
│  │  ├─ wger_mapping.yml          — custom_id ↔ wger_id
│  │  └─ external_db_mapping.yml   — custom_id ↔ yuhonas_id
│  ├─ muscles/
│  │  ├─ muscles.yml               — Muskel-Taxonomie
│  │  ├─ muscle_coverage_rules.yml — Gewichtungen (primary/secondary/stabilizer)
│  │  └─ body_highlighter_bridge.yml — Muskeln → visuelle Körperregionen (enabled: false)
│  └─ rules/
│     ├─ program_rules.yml
│     ├─ progression_rules.yml
│     └─ safety_rules.yml
├─ fitness_agent/                  — Python Tool-Set + Server (siehe oben)
└─ tests/                          — Pytest-Suite (resolver, coverage, planner, teaching, weekly)
```

---

## Datenquellen-Integration

**Priorität**: custom_yaml (Semantic Truth) > wger (Backend) + yuhonas (Ergänzung)

**wger** (:8000, lokal): Primäres Backend für Exercise Master Data. Vollständig integriert.

**yuhonas** (free-exercise-db): Bilder + Form-Videos, alternative Namen. Ergänzung zu wger.

**custom_yaml** (Katalog): Semantic Source of Truth. Anatomie-Lehre. Überschreibt bei Konflikt.

---

## Commands

| Befehl | Zweck |
|--------|-------|
| `npm run dev` | Backend (9100) + Vite DevServer (5902) mit HMR |
| `npm run ui:dev` | Nur Vite DevServer (Port 5902) |
| `npm run build` | Production-Build in `dist/` |
| `npm run build:catalog` | Katalog → ~/.aos/fitness/workouts/catalog.json |
| `./fitnessctl start` | API (:9100) + fitness_agent (:9120) starten |
| `./fitnessctl status` | Status-Übersicht aller Services (gum-Tabelle) |
| `./fitnessctl kb-sync` | catalog/kb → Firestore pushen |
| `./fitnessctl session today` | Heutige Session anzeigen |
| `./fitnessctl coverage [DAYS]` | Muskelabdeckung der letzten N Tage |
| `cd pwa && npm run dev` | Firebase PWA Dev-Server |
| `cd pwa && npm run deploy` | Firebase PWA bauen + deployen |

---

## API-Referenz

| Endpoint | Methode | Beschreibung |
|----------|---------|-------------|
| `/health` | GET | Server-Status |
| `/exercise/:id/teaching` | GET | Anatomy-Lesson aus catalog/kb/anatomy_teaching/ |
| `/session?date=YYYY-MM-DD` | GET/POST | Tageslog — POST macht dual-write (JSON + SQLite) |
| `/session/history?limit=10` | GET | Letzte N Sessions |
| `/exercises/search?q=...` | GET | Search lokal + wger + yuhonas |
| `/coverage/detailed?days=7` | GET | Muscle-Coverage (letzte N Tage) |
| `/fitness/plan?template=ppl&split=6` | GET | Trainingsplan-Generator |
| `/fitness/weekly?week=2025-W45` | GET | Wochenreport (week: "current" oder "YYYY-Www") |
| `/fitness/export` | POST | Session/Plan/Sheet/Lesson-Export |
| `/theme` | GET/POST | UI-Theme-Pref |
| `/firestore/status` | GET | Firestore-Verbindungsstatus (`{ ok, project }`) |
| `/firestore/sync` | POST | Letzte 30 Sessions → Firestore pushen |

---

## Design-Patterns

**Session-Format** (`~/.aos/fitness/sessions/YYYY-MM-DD.json`):
```json
{
  "date": "2026-05-17",
  "block": "Push",
  "exercises": [
    {
      "exercise_id": "barbell_bench",
      "id": "barbell_bench",
      "name": "Barbell Bench Press",
      "sets": "",
      "reps": "",
      "weight": "",
      "note": "",
      "primaryMuscles": ["Chest"],
      "secondaryMuscles": ["Shoulders", "Triceps"],
      "isHIT": true,
      "done": true
    }
  ],
  "effort": 8,
  "mood": "",
  "notes": "",
  "saved_at": "2026-05-17T18:30:00Z"
}
```

`sets`/`reps`/`weight` sind Strings (leer wenn nicht eingetragen). `isHIT` kennzeichnet HIT-Trainingseinheiten (kein Satz/Wdh-Tracking, Training bis zum Muskelversagen).

**Muscle-Normalisierung**: wger → internal IDs (chest, back, shoulders, arms, core, glutes, quads, hamstrings, calves)

**Response Pattern**: `{ ok: true, data: {...} }` oder `{ ok: false, error: "..." }`

---

## Testing

**Python (catalog/fitness_agent):** Pytest-Suite in `catalog/tests/` — deckt resolver, coverage, planner, teaching, weekly, obsidian, wger ab.
```bash
cd ~/fitness-dev && python3 -m pytest catalog/tests/
```

**Node/Frontend:** Kein strukturierter Test-Suite. Manuelle Tests über Web-UI:
- Session-Logging auf `/session`-View testen
- Exercise-Suche mit `/exercises/search` validieren
- Coverage-Daten unter `/coverage/detailed` prüfen
- Anatomy-Lehre im `/learn` oder `/session/exercise/:id` anzeigen

---

## Abhängigkeiten

- **wger lokal** (:8000) — primäres Backend, lokal gehostet
- **yuhonas_free_exercise_db** — optional, Bilder + Varianten
- **better-sqlite3** — dual-write SQLite im Node-Server
- **React** ^18.3, **Vite** ^5.4, **TailwindCSS** ^3.4
- **react-body-highlighter** ^2.0.5 — Body-Map UI
- **recharts** — Charts (WeightChart, Coverage-Trends)

---

## Workflow

1. **Ausbildung läuft** — User macht Fitnesstrainer-Module, Pflichtaufgaben
2. **User loggt Sessions** — über Session-View, dual-write in JSON + SQLite
3. **AI Agent erweitert Katalog** — nutzt catalog/fitness_agent/ Tools:
   - `audit anatomy` → findet fehlende Übungen
   - Gemini generiert YAML → catalog/kb/anatomy_teaching/
   - `map-wger` → verknüpft Übungen mit wger-IDs
4. **fitness-dev zeigt es** — Anatomie-Layer, Coverage-Analyse, BodyMap
5. **Loop** — mehr Logs → bessere Coverage-Analyse → bessere Vorschläge

---

## anatomy-kb (verwandtes Repo: ~/anatomy-kb, :9200)

Separates Projekt, aber direkt mit fitness-dev verknüpft. Muskel-Anatomie-Layer der Ausbildung.

```
anatomy-kb/muscles/*.yml       — Ein File pro Muskel (origin, insertion, innervation, function)
anatomy-kb/catalog-index.json  — Muscle Registry (wger_id als Anker)
anatomy-kb/server.py           — aiohttp Server (:9200)
```

**Daten-Stack:**
```
wger (:8000) + yuhonas
    ↓
catalog/kb/exercises/          — Base-Layer (name, wger_id, muscle_roles)
    ↓
catalog/kb/anatomy_teaching/   — Teaching-Layer (joint_actions, errors, cues, quiz)
    ↑ push_to_teaching()
anatomy-kb/muscles/            — Muskel-Layer (origin, insertion, innervation)
    ↑ Gemini-Enrichment aus Ausbildungswissen
```

---

## Status

- ✅ Backend + API (Node.js, Port 9100)
- ✅ fitness_agent Server (:9120, aiohttp)
- ✅ Frontend Views (Dashboard, Session, Journal, Muscles, Learn, Weekly, Habits, Settings, Inbox)
- ✅ Swipe-Navigation + Gym Mode (layout scaling)
- ✅ Shared src/ für lokal + PWA (via @src Alias)
- ✅ Dual DB-Layer (src/lib/db/local/ + src/lib/db/firebase/)
- ✅ wger Integration (vollständig als Backend)
- ✅ yuhonas Integration (Bilder, Varianten)
- ✅ Katalog-Struktur in catalog/kb/ (Exercises, Anatomy Teaching, Rules, Maps)
- ✅ Pytest-Suite (catalog/tests/)
- ✅ Session dual-write (JSON + SQLite via better-sqlite3)
- ✅ BodyMap in Session-View (nur done exercises)
- ✅ Gmail-Pipeline (bin/fitness-mail, Fitbit-Daten)
- ✅ Firestore Sync (`/firestore/status` + `/firestore/sync`, firebase-admin, Creds: `~/.env/firebase-fitness.json`)
- ✅ PWA Offline-Unterstützung (SW + IndexedDB offline-queue)
- ✅ pwa/ Unterpaket (Firebase PWA, eigenes package.json)
- ✅ anatomy-kb Integration (~/anatomy-kb, :9200)
- ⏳ AI Agent Workflow (Gemini → anatomy_teaching YAML-Generierung)
- ⏳ body_highlighter_bridge.yml enabled: true (granulare Muskel-Visualisierung)
- ⏳ Coverage-Granularität (primary/secondary/stabilizer)
- ⏳ Anatomie-Lehre für alle Übungen (~28 von ~50+ im Katalog)
- ⏳ npm workspaces (root + pwa/ + arena/ als Workspace-Pakete)

---

## Code-Review 2026-06-07: catalog/fitness_agent

### Kritische Bugs (sofort fixen)

**server.py** — `import yaml` fehlt (wird in `handle_inbox_approve` auf Zeile ~289 genutzt). Crash beim `/inbox/{id}/approve` Endpoint. Außerdem `from loguru import logger` fehlt in server.py (verwendet auf Zeilen ~309, ~314).

**kb_sync.py** — `log_err()` ist undefiniert (Zeile ~178). Sollte `logger.error()` sein. Crash beim KB-Sync.

**server.py `handle_export`** — `data['query']`, `data['plan']` etc. ohne `.get()` → `KeyError` wenn Client-Body unvollständig. Alle `data[key]`-Zugriffe auf `data.get(key)` umstellen.

### Duplikationen (medium, aufräumen)

- `normalize_text()` ist identisch in `resolver.py` und `wger.py` definiert → in `yaml_utils.py` oder eigenes `utils.py` zentralisieren.
- `load_runtime_config()` identisch in `wger.py` und `obsidian.py` → zentral in `paths.py`.
- `find_exercise()` / `find_by_id()` ähnliche Logik in `coach_sheet.py`, `obsidian.py`, `wger.py`.
- `load_muscle_taxonomy()` doppelt in `audit.py` und `coverage.py`.
- `format_list()` doppelt in `obsidian.py` und `coach_sheet.py`.

### Architektur-Beobachtungen

- Modul-Aufteilung insgesamt sauber: Server, CLI, Tools klar getrennt.
- `auditor.py` vs `audit.py`: `auditor.py` ist Writer (Bericht erstellen), `audit.py` ist CLI-Command. Trennung macht Sinn.
- `ingestor.py` wird nur von `watcher.py` genutzt — kein toter Code.
- Lokaler Import in `watcher.py` in while-Schleife (Zeile ~232): Anti-Pattern, funktioniert aber.
- `history.py` hat keinen `UNIQUE`-Constraint auf `training_history` — parallele Schreiber könnten Duplikate erzeugen. `INSERT OR IGNORE` prüfen.

### HTTP-Endpoint-Status (server.py :9120)

Alle Endpoints bis auf `POST /export/{kind}` und `POST /inbox/{id}/approve` sind fehlerfrei. Die beiden sind durch obige Bugs betroffen.
