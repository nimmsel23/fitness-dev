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
Befehle: `audit`, `resolve`, `teach`, `log`, `history`, `report`, `plan`, `coach-sheet`, `map-wger`, `export-wger-index`, `tui`

---

## Backend

**server.mjs** (Port 9100): **Hono**-Server (`@hono/node-server`)
- API-Routen: `/session`, `/journal`, `/exercises/search`, `/coverage`, `/fitness/plan`, `/fitness/weekly`, `/fitness/export`, `/fitness/body`
- Static-Serving (dist/ oder public/) + SPA-Fallback
- Proxies: wger (lokal), HabitSync (:6842)
- **Dual-write**: `POST /session` schreibt JSON-File + SQLite synchron
- **wger Gewichtssync**: `POST /fitness/body` mit `weight_kg` → schreibt Body-JSON + pusht `POST /api/v2/weightentry/` zu wger (fire-and-forget). Token: `WGER_API_TOKEN` env oder Hardcode in Zeile 20. Base-URL: `WGER_BASE` env (Standard `:8000`, wger läuft auf `:80` wenn Override-Port nicht greift).

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

**Tabs (NAV_ITEMS, `src/constants/NavigationItems.js`):**

| Tab-ID | Label | View | Anmerkung |
|--------|-------|------|-----------|
| `dash` | Heute | `src/views/Dashboard/` | Standard-Einstieg |
| `session` | Training | `src/views/Session/` | Workout-Logging mit Live-BodyMap |
| `habits` | Habits | `src/views/Habits/` | HabitSync-Integration |
| `journal` | Journal | `src/views/Journal/` | Text-Notizen |
| `review` | Review | `src/views/WeeklyReview/` | Charts + Wochenrückblick |
| `learn` | Lernen | `src/views/Learn/` | Anatomie-Lehre (catalog/kb) |
| `settings` | Setup | `src/views/Settings/` | Themes, Split, Nav-Modus etc. |

**Versteckte Views (nicht in Nav, per URL `#coach` erreichbar):**
- `src/views/Coach/` — AI Coach Tab (`#coach`)
- `src/views/AppGate.jsx` — Hub-Homescreen (nur in `navMode=home` als `#gate`)

**Nicht verlinkte Views (Code vorhanden, kein aktiver Tab):**
- `src/views/Inbox/` — Exercise-Inbox (Genehmigung neuer KB-Einträge)

**Aktive Sub-Views (kein eigener Haupt-Tab, aber eingebunden):**
- `src/views/Muscles/` — Superkompensations-Analyse + Body-Map (AKTIV als Subtab `muscles` in WeeklyReview).
  ⚠️ NIEMALS als "inaktiv" markieren — bewusst nicht als Haupt-Tab, aber aktives Main-Feature.
  Eigene Sub-Komponenten: MuscleAnalysis, MuscleBodyMap, MuscleDetailedMap, MuscleInsights, MuscleHeader.

**src/components/**:
- `layout/` — Sidebar (Desktop), MobileNav (Bottom-Bar)
- `common/` — ErrorBoundary, UserProfile
- `dashboard/` — ActivityHeatmap, DashboardWidget, MuscleCoverage, SessionStatus u.a.
- Flat (shared): ExerciseSearchOverlay, BodyMap, PlanBuilder, HabitWidget, ExerciseInsightModal, WeightChart, AnatomyDetailModal

**src/lib/db/** — Dual DB-Layer (flache Struktur, kein Local/Firebase Unterverzeichnis):
- `core.js` — api helpers (fetch Wrapper), auth stubs (lokal), `isLocalMode()`, `watchAuth()`
- `sessions.js` — getSession, saveSession, getRecentSessions, getProgressTrend, getPlan, getPlanSuggestion
- `journal.js` — getJournal, saveJournal, getJournalHistory
- `habits.js` — getHabits, recordHabit, unrecordHabit
- `kb.js` — getExercise, getAllExercises, searchExercises, getAnatomy
- `analysis.js` — getDashboardAnalytics, getMuscleCoverage, getWeeklyReport, getCoverageGaps
- `user.js` — getSettings, saveSettings, getBodyEntry, getBodyEntries
- `utils.js` — parseQuick, exportCsv

**`@db` Vite-Alias** (in `vite.config.js`):
- Default-Build: `@db` → `src/db.js` (Barrel für src/lib/db/*.js, alle Calls → Node-Server :9100)
- Firebase-Build (`--mode firebase`): `@db` → `src/db.firestore.js` (Single-File, direkte Firestore SDK)

Port 5902 (dev), Proxy zu Backend API-Routen (:9100).

**BodyMap in Session:** Zeigt nur Muskeln von Exercises mit `done: true`. Kein Preview, kein Plan — nur was bereits abgehakt ist.

## Drei Body-Highlighter (NICHT verwechseln)

| Bibliothek | Komponente | Datenformat | Verwendet in |
|------------|------------|-------------|--------------|
| `react-body-highlighter` | `BodyMap.jsx` | `[{ slug, muscles: [slug], frequency: 1–4 }]` | Dashboard MuscleBody, Muscles/MuscleBodyMap |
| `react-muscle-highlighter` | `DetailedMuscleMap.jsx` | `[{ slug, color: '#hex' }]` | Dashboard MuscleBody, Muscles/MuscleDetailedMap |
| `body-muscles` BodyChart | `BodyMusclesMap.jsx` | `{ [granularId]: { intensity: 0–10, selected: bool } }` | Learn/Explorer |

**groupScores** ist das interne Format zwischen DB-Layer und Komponenten:
`{ [groupName]: { score: 1–4, color: '#hex' } }` — score für RBH frequency, color für react-muscle-highlighter direkt.

## Superkompensation — korrekte HIT-Zeitfenster

| Phase | Zeitfenster | score | color |
|-------|-------------|-------|-------|
| Stark belastet | 0–3 Tage | 1 | `#ef4444` |
| Erholung | 3–7 Tage | 2 | `#f59e0b` |
| Superkompensation (Peak) | 7–14 Tage | 3 | `#22c55e` |
| Fenster schließt sich | 14–21 Tage | 4 | `#3b82f6` |

Cardio: kürzer (≤1d→1, ≤4d→2, ≤10d→3, kein Blau). Kraft überschreibt Cardio am selben Tag.
Implementiert in: `buildLastTrainedMap()` + `superKompFreq()` in `src/components/dashboard/MuscleBody.jsx`

**Swipe-Navigation** (Mobile): Links/Rechts wischen wechselt zwischen Views (minSwipeDistance: 75px, mit jank-freiem vertikalen Scroll-Lock und intelligentem Ausschluss von horizontal scrollbaren oder interaktiven Elementen).

**Gym Mode**: `layoutScale` (50–150%) skaliert `document.documentElement.fontSize` — für große Gym-Displays.

**Zwei Build-Modi:**
- Default (lokal/Coach): `npm run build` → `@db` = `src/db.js` (lokal, kein Auth-Gate)
- Firebase PWA: `npm run build:firebase` → `@db` = `src/db.firestore.js`, Output nach `~/fitness/dist-firebase/`

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
│  ├─ registry/
│  │  ├─ wger_exercises_id.yml     — wger_id → wger_name (824 Einträge, Rohdaten)
│  │  ├─ wger_muscles.yml          — wger muscle_id → catalog muscle group
│  │  └─ wger_catalog_index.yml    — wger_id → catalog_id (Merge-Kontrakt, auto-generated)
│  │                                 Nur kuratierte Exercises (nicht unreviewed_*).
│  │                                 Regenerieren: fitness-agent export-wger-index
│  ├─ muscles/
│  │  ├─ muscles.yml               — Muskel-Taxonomie
│  │  ├─ muscle_coverage_rules.yml — Gewichtungen (primary/secondary/stabilizer)
│  │  └─ body_highlighter_bridge.yml — ENTFERNT (body_region direkt in Muskel-YAMLs)
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
| `/fitness/plan?template=ppl&split=6` | GET | Trainingsplan-Generator |
| `/fitness/weekly?week=2025-W45` | GET | Wochenreport (week: "current" oder "YYYY-Www") |
| `/fitness/export` | POST | Session/Plan/Sheet/Lesson-Export |
| `/theme` | GET/POST | UI-Theme-Pref |
| `/fitness/body?days=30` | GET | Körpermessungen (Gewicht, BMI, Schritte, Schlaf, HR) der letzten N Tage |
| `/fitness/body` | POST | Body-Eintrag speichern + wger-Gewichtssync (wenn `weight_kg` vorhanden) |
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

## fitness_cli/ — Python CLI & TUI Package

Direkter Dateizugriff auf Session-JSONs — kein Server nötig.

```
fitness_cli/
├── __init__.py          — Package-Root
├── __main__.py          — python -m fitness_cli [log|tui]
├── paths.py             — Pfad-Konstanten (~/.aos/fitness/sessions/ etc.)
├── constants.py         — Aktivitäts-Typen, Trainingsblock-Labels, Farben
├── data.py              — load_sessions(), sync_info(), load_all_clients()
├── render.py            — ANSI/gum Render-Helfer (für fitness-log)
└── commands/
    ├── __init__.py      — muscle_to_group(), muscle_group_label() (Normalisierung)
    ├── log.py           — Typer CLI: ls / show / week / stats / history / sync-status
    └── tui.py           — Textual TUI: FitnessTUI (5 Tabs: Log, Woche, Stats, Sync, Clients)
```

**Binaries in `bin/`:**

| Befehl | Entry-Point | Funktion |
|--------|-------------|---------|
| `fitness-tui` | `fitness_cli.commands.tui:main` | Interaktive Textual TUI |
| `fitness-log` | `fitness_cli.commands.log` | Typer CLI (ls/show/stats/…) |
| `fitness` | `bin/fitness` | Top-Level Dispatcher (dev/prod Server-Steuerung) |

**Muscle-Normalisierung** (`commands/__init__.py`): `muscle_to_group(name)` mappt rohe Session-Muskelnamen (`"201_latissimus_dorsi"`, `"Back"`, `"back"`) auf kanonische Gruppen (`"back"`) via Präfix-Range. `muscle_group_label(group)` gibt den deutschen Anzeigenamen zurück (`"Rücken"`).

---

## Testing

**Python (catalog/fitness_agent):** Pytest-Suite in `catalog/tests/` — deckt resolver, coverage, planner, teaching, weekly, obsidian, wger ab.
```bash
cd ~/fitness-dev && python3 -m pytest catalog/tests/
```

**Node/Frontend:** Kein strukturierter Test-Suite. Manuelle Tests über Web-UI:
- Session-Logging auf `/session`-View testen
- Exercise-Suche mit `/exercises/search` validieren
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

## fitness_agent: Kern-Logik

**Mission:** Training als angewandte Anatomie — nicht nur „welche Muskeln trainiert diese Übung" sondern „welche Bewegung erklärt mir Anatomie praktisch am eigenen Körper". Das ist der didaktische Layer den wger, yuhonas und alle Open-Source-DBs nicht liefern.

**Zwei Agenten-Rollen:**
- `fitness-agent` → schreibt + erweitert Katalog (`catalog/`), erkennt Lücken, schreibt Tickets
- `fitness-dev-coding-agent` → implementiert Tickets in Code, baut fitness-dev

### Canonical Flow

```
User Input
→ Alias Resolver        aliases.yml
→ canonical exercise_id
→ Custom YAML Lookup    catalog/kb/exercises/
→ Muscle Taxonomy       muscles.yml
→ Coverage Rules        muscle_coverage_rules.yml
→ Program Rules         program_rules.yml
→ Workout Generation
→ wger Mapping          wger_mapping.yml
→ Export / Logging
→ History Update
→ Progression
```

### Exercise Matching Hierarchie

1. Exakte canonical ID
2. `aliases.yml`
3. Deutscher Name
4. Englischer Name
5. Fuzzy Matching
6. wger lokal
7. yuhonas

Wenn unklar: 2–3 Treffer mit Confidence zurückgeben — nicht raten.

### Coverage-Formel

```
coverage_score = sets × role_weight × effort_factor
```

| Role | Weight | RPE | Factor |
|------|--------|-----|--------|
| primary | 1.0 | 7 | 0.75 |
| secondary | 0.5 | 8 | 0.90 |
| stabilizer | 0.2 | 9 | 1.00 |
| minor | 0.1 | 10 | 1.05 |

### Übungsreihenfolge (generierte Pläne)

1. Schwere Compound Lifts
2. Sekundäre Compounds
3. Maschinen / stabilere Hypertrophy-Arbeit
4. Isolation
5. Prehab / Core / Finisher

### Agent-Prioritäten

- Custom YAML gewinnt bei Trainingslogik — überschreibt wger bei Konflikt
- Stable canonical IDs — nie durch wger-IDs ersetzen
- Jede Übungswahl muss begründbar sein (Muskelgruppe, Bewegungsmuster, Ziel)
- Progression über Novelty — nicht ständig neue Übungen einbauen
- Unsichere Mappings als `inferred: true` markieren, nie stillschweigend speichern
- Backup vor Writes auf user-owned YAMLs

### Nicht erlaubt

- Zufällige Übungsauswahl
- wger blind vertrauen
- Eigene canonical IDs löschen oder durch wger-IDs ersetzen
- YAMLs ohne Backup überschreiben
- Trainingshistorie verlieren
- Muskelbeteiligung binär bewerten (Stabilizer ≠ Primary)
- Schmerz ignorieren

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
- ✅ Firebase PWA: Sourcen direkt im Root, `npm run build:firebase` → `~/fitness/dist-firebase/` (pwa/ als pwa.bak/ archiviert)
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

---

## Dispatcher

Jedes neue Skript/Tool in diesem Repo gehört als Option in den zentralen Dispatcher — nicht als loses Standalone-Script.
Bei Bash vs. Python: Python bevorzugen. Deps: `typer` + `loguru` + `gum`-Fallback für TUI.
Referenz-Implementierung: `~/aos-dev/bin/bridge-devctl menu`

| Dispatcher | Typ | Funktion |
|---|---|---|
| `fitness-devctl` | python3 | **Server-Controller** (start/stop/restart/status/logs/deploy → /opt) — **bevorzugter Einstieg für alles Servermässige** |
| `~/fitness/bin/fitness` | python3 | **Terminal-facing dispatcher** im PATH (session/journal/coverage/gaps/search/stats) |
| `fitnessctl` | bash | Legacy domain CLI (catalog, sessions, coverage, gaps, search) |

`fitness-devctl` = reiner Service-Controller + Deploy. Neues Skript mit Serverlogik → hierher.
`~/fitness/bin/fitness` = Day-to-day Domain-CLI. Liest direkt aus `~/.aos/fitness/sessions/` — kein laufender Server nötig. Neue fachliche Sub-Commands → hierher (typer).
`fitnessctl` (bash) ist legacy — wird langfristig durch `fitness` + `fitness-devctl` abgelöst.

### HTTP-Fallback-Modul

`fitness_cli/http.py` — sauberes Python-Modul (`import fitness_cli.http as _http`).
Wird von `bin/fitness` via `_try_http()` aufgerufen wenn direkte Datei-Lese fehlschlägt.
Ziel: Node-Server `:9100` (env: `FITNESS_NODE_PORT`).

```python
from fitness_cli import http as _http
_http.session_today()        # GET /session?date=today
_http.session_get(date)      # GET /session?date=YYYY-MM-DD
_http.session_list(limit)    # GET /session/history?limit=N
_http.coverage(days)         # GET /coverage?days=N
_http.gaps(days)             # GET /coverage/gaps?days=N
_http.search(query)          # GET /exercises/search?q=...
```
