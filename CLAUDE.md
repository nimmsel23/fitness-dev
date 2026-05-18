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

### 2. catalog/fitness_agent/ — das Tool-Set für AI-Agenten
Python-Paket das Claude oder Gemini als Tool nutzen um den Katalog zu erweitern.
**Kein eigenständiger Agent** — ein Tool-Set das von einem AI-Agenten aufgerufen wird.

```
AI Agent (Claude / Gemini)
    ↓ ruft auf
catalog/fitness_agent/           Python Tool-Set
    ├── resolve_query()          Exercise-Name → canonical_id
    ├── teach_exercise()         Anatomie-Lesson aus YAML rendern
    ├── log_training_entry()     Eintrag in SQLite schreiben
    ├── build_plan()             Trainingsplan generieren
    ├── audit()                  Katalog-Qualität prüfen (was fehlt?)
    ├── build_coach_sheet()      Coaching-Daten strukturiert aufbereiten
    └── map_wger()               Exercise ↔ wger_id zuordnen
    ↓ schreibt in
catalog/anatomy_teaching/*.yml   Anatomie-YAML (Ursprung, Ansatz, Innervation)
catalog/exercises/*.yml          Exercise-Definitionen
~/.aos/fitness/sessions/training_history.sqlite
```

**Wozu:** wger liefert Übungsname + grobe Muskelgruppe. Was fehlt:
- Anatomie-Detail (Ursprung, Ansatz, Innervation, Funktion) — Ausbildungs-Level
- Coaching-Qualität (häufige Fehler, Technik-Cues, Progressionen)
- Coverage-Granularität (primary / secondary / stabilizer auf Muskel-Ebene)
- HIT-spezifische Hinweise (Stretch-Position, Peak-Kontraktion, TuT)

**Typischer Agent-Workflow:**
```
audit --topic anatomy   → findet fehlende anatomy_teaching YAMLs
Gemini generiert YAML   → aus Ausbildungswissen (Grosser, Weineck, Gottlob)
write → catalog/anatomy_teaching/<exercise_id>.yml
audit again             → validiert Struktur
teach_exercise()        → UI kann Anatomie-Layer zeigen
```

**CLI-Einstieg:** `python3 -m catalog.fitness_agent <command>`
Befehle: `audit`, `resolve`, `teach`, `log`, `history`, `report`, `plan`, `coach-sheet`, `map-wger`, `tui`

---

## Backend

**server.mjs** (Port 9100): Node.js HTTP-Server
- API-Routen: `/session`, `/journal`, `/exercises/search`, `/coverage`, `/fitness/plan`, `/fitness/weekly`, `/fitness/export`
- Static-Serving (dist/ oder public/)
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

## Frontend (React + Vite)

**src/views/**:
- Dashboard.jsx — Überblick + heute's Plan
- Session.jsx — Workout-Logging (mit Live-BodyMap für done exercises)
- Journal.jsx — Text-Notizen
- Muscles.jsx — Body-Map + Coverage-Analyse
- Learn.jsx — Anatomie-Lehre
- WeeklyReview.jsx — Wochenreport

**src/components/**:
- ExerciseSearch.jsx — Search lokal + wger + yuhonas
- BodyMap.jsx — react-body-highlighter (Muskelabdeckung, anterior + posterior)
- PlanBuilder.jsx — Trainingsplanung
- HabitWidget.jsx — HabitSync-Integration

Port 5902 (dev), Proxy zu Backend API-Routen.

**BodyMap in Session.jsx:** Zeigt nur Muskeln von Exercises mit `done: true`. Kein Preview, kein Plan — nur was bereits abgehakt ist.

---

## Katalog: ~/fitness-dev/catalog/

```
~/fitness-dev/catalog/
├─ config.yml
├─ data_source_priority.yml
├─ exercises/
│  ├─ chest.yml, back.yml, ...     — Exercise-Definitionen (canonical IDs)
├─ anatomy_teaching/               — Anatomie-YAML (vom AI-Agent befüllt)
│  ├─ barbell_row.yml, ...         — Ursprung, Ansatz, Innervation, Funktion
├─ maps/
│  ├─ aliases.yml                  — Freie Eingaben → canonical_id
│  ├─ wger_mapping.yml             — custom_id ↔ wger_id
│  └─ external_db_mapping.yml      — custom_id ↔ yuhonas_id
├─ muscles/
│  ├─ muscles.yml                  — Muskel-Taxonomie
│  ├─ muscle_coverage_rules.yml    — Gewichtungen (primary/secondary/stabilizer)
│  └─ body_highlighter_bridge.yml  — Muskeln → visuelle Körperregionen (enabled: false)
├─ rules/
│  ├─ program_rules.yml
│  ├─ progression_rules.yml
│  └─ safety_rules.yml
└─ fitness_agent/                  — Python Tool-Set für AI-Agenten (siehe oben)
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

---

## API-Referenz

| Endpoint | Methode | Beschreibung |
|----------|---------|-------------|
| `/health` | GET | Server-Status |
| `/session?date=YYYY-MM-DD` | GET/POST | Tageslog — POST macht dual-write (JSON + SQLite) |
| `/session/history?limit=10` | GET | Letzte N Sessions |
| `/exercises/search?q=...` | GET | Search lokal + wger + yuhonas |
| `/coverage/detailed?days=7` | GET | Muscle-Coverage (letzte N Tage) |
| `/fitness/plan?template=ppl&split=6` | GET | Trainingsplan-Generator |
| `/fitness/weekly?week=2025-W45` | GET | Wochenreport (week: "current" oder "YYYY-Www") |
| `/fitness/export` | POST | Session/Plan/Sheet/Lesson-Export |
| `/theme` | GET/POST | UI-Theme-Pref |

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

Kein strukturierter Test-Suite. Manuelle Tests über Web-UI:
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
   - Gemini generiert YAML → catalog/anatomy_teaching/
   - `map-wger` → verknüpft Übungen mit wger-IDs
4. **fitness-dev zeigt es** — Anatomie-Layer, Coverage-Analyse, BodyMap
5. **Loop** — mehr Logs → bessere Coverage-Analyse → bessere Vorschläge

---

## Status

- ✅ Backend + API (Node.js, Port 9100)
- ✅ Frontend Views (Dashboard, Session, Journal, Muscles, Learn, Weekly)
- ✅ wger Integration (vollständig als Backend)
- ✅ yuhonas Integration (Bilder, Varianten)
- ✅ Katalog-Struktur (Exercises, Anatomy Teaching, Rules, Maps)
- ✅ Session dual-write (JSON + SQLite via better-sqlite3)
- ✅ BodyMap in Session-View (nur done exercises)
- ✅ Gmail-Pipeline (bin/fitness-mail, Fitbit-Daten)
- ⏳ AI Agent Workflow (Gemini → anatomy_teaching YAML-Generierung)
- ⏳ body_highlighter_bridge.yml enabled: true (granulare Muskel-Visualisierung)
- ⏳ Coverage-Granularität (primary/secondary/stabilizer)
- ⏳ Anatomie-Lehre für alle Übungen
- ⏳ PWA Offline-Unterstützung
