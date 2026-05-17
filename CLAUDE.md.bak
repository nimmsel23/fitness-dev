# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

---

## fitness-dev: Praktisches Werkzeug der Diplom Präventiver Vitaltrainer Ausbildung

**fitness-dev** ist ein Kraft-Trainings-Tracking-System (PWA Frontend, Node.js Backend) das die Pflichtaufgaben der Fitnesstrainer-Module konkret unterstützt:
- Trainingspläne erstellen + dokumentieren
- Trainings-Logs führen + exportieren
- Anatomie-Lehre dokumentieren + verstehen
- Muskelabdeckungs-Analyse

Entwickelt von **fitness-dev-coding-agent** basierend auf Tickets von **fitness-agent** (Skill).

---

## Backend

**server.mjs** (Port 9100): Node.js HTTP-Server
- API-Routen: `/session`, `/journal`, `/exercises/search`, `/coverage`, `/fitness/plan`, `/fitness/weekly`, `/fitness/export`
- Static-Serving (dist/ oder public/)
- Proxies: wger (:8000 lokal), HabitSync (:6842)

**fitness-runtime.mjs** (Shared Runtime):
- `searchExercises()` — lokale Katalog + wger + yuhonas Integration
- `buildPlan()` — Trainingsplan-Generator (PPL, Upper/Lower, etc.)
- `getWeeklySummary()` — Wochenreport
- `exportSessionMarkdown()` — Export für Obsidian/PDF

**Daten**: `~/.aos/fitness/`
- `workouts/catalog.json` — Exercise-Items (aus ~/fitness-dev/catalog/)
- `workouts/logs/YYYY-MM-DD.json` — Daily session logs
- `journal/YYYY-MM-DD.md` — Text-Notizen
- `plan.json` — Aktiver Trainingsplan

---

## Frontend (React + Vite)

**src/views/**:
- Dashboard.jsx — Überblick + heute's Plan
- Session.jsx — Workout-Logging
- Journal.jsx — Text-Notizen
- Muscles.jsx — Body-Map + Coverage-Analyse
- Learn.jsx — Video/Tipps (Anatomie-Lehre)
- WeeklyReview.jsx — Wochenreport

**src/components/**:
- ExerciseSearch.jsx — Search lokal + wger + yuhonas
- BodyMap.jsx — react-body-highlighter (Muskelabdeckung)
- PlanBuilder.jsx — Trainingsplanung
- HabitWidget.jsx — HabitSync-Integration

Port 5902 (dev), Proxy zu Backend API-Routen.

---

## Katalog: ~/fitness-dev/catalog/

**Owner**: fitness-agent (Skill, schreibt YAML)

```
~/fitness-dev/catalog/
├─ config.yml                      — Konfiguration
├─ data_source_priority.yml        — Datenquellen (wger + yuhonas komplementär)
├─ exercises/
│  ├─ chest.yml, back.yml, ...     — Exercise-Definitionen (canonical IDs)
├─ anatomy_teaching/
│  ├─ barbell_row.yml, ...         — Anatomie-Lehre (Ansatz, Ursprung, Bewegungsmuster)
├─ maps/
│  ├─ aliases.yml                  — Freie Eingaben → canonical_id
│  ├─ wger_mapping.yml             — custom_id ↔ wger_id
│  └─ external_db_mapping.yml      — custom_id ↔ yuhonas_id
├─ muscles/
│  ├─ muscles.yml                  — Muskel-Taxonomie
│  ├─ muscle_coverage_rules.yml    — Gewichtungen (primary/secondary/stabilizer)
│  └─ body_highlighter_bridge.yml  — Muskeln → visuelle Körperregionen
└─ rules/
   ├─ program_rules.yml            — Push/Pull/Legs, Sätze/Wiederholungen, Progression
   ├─ progression_rules.yml        — Double Progression, Deload-Regeln
   └─ safety_rules.yml             — Joint-Schutz, Kontra-Indikationen
```

---

## Datenquellen-Integration

**Priorität**: custom_yaml (Semantic Truth) > wger (Backend) + yuhonas (Ergänzung)

**wger** (:8000, lokal):
- Primäres Backend für Exercise Master Data
- App-Bridge: Logs, Routinen, History
- Vollständig integriert (nicht optional)

**yuhonas** (free-exercise-db):
- Bilder + Form-Videos (wo wger keine hat)
- Alternative Namen + Varianten
- Ergänzung zu wger, kein Fallback

**custom_yaml** (Katalog):
- Semantic Source of Truth
- Anatomie-Lehre (was wger/yuhonas nicht zeigen)
- Überschreibt bei Konflikt

---

## Commands

| Befehl | Zweck |
|--------|-------|
| `npm run dev` | Startet Backend (9100) + Vite DevServer (5902) mit HMR |
| `npm run ui:dev` | Nur Vite DevServer (Port 5902) |
| `npm run build` | Production-Build in `dist/` |
| `npm run preview` | Preview des gebauten Output |
| `npm run build:catalog` | Build Katalog aus ~/fitness-dev/catalog/ → ~/.aos/fitness/workouts/catalog.json |

---

## API-Referenz

| Endpoint | Methode | Beschreibung |
|----------|---------|-------------|
| `/health` | GET | Server-Status |
| `/session?date=YYYY-MM-DD` | GET/POST | Tageslog (Exercises, Block, Notes) |
| `/session/history?limit=10` | GET | Letzte N Sessions |
| `/exercises/search?q=...` | GET | Search lokal + wger + yuhonas |
| `/coverage/detailed?days=7` | GET | Muscle-Coverage (letzte N Tage) |
| `/fitness/plan?template=ppl&split=6` | GET | Trainingsplan-Generator |
| `/fitness/weekly?week=current` | GET | Wochenreport |
| `/fitness/export` | POST | Session/Plan/Sheet/Lesson-Export |
| `/theme` | GET/POST | UI-Theme-Pref |

---

## Design-Patterns

**Session-Format** (YYYY-MM-DD.json):
```json
{
  "date": "2026-05-17",
  "block": "Push",
  "exercises": [
    {
      "exercise_id": "barbell_bench",
      "name": "Barbell Bench Press",
      "sets": 5,
      "reps": 5,
      "weight": 100,
      "unit": "kg",
      "primaryMuscles": ["Pectoralis major"],
      "secondaryMuscles": ["Anterior Deltoid"],
      "done": true,
      "rpe": 8
    }
  ],
  "effort": 8,
  "saved_at": "2026-05-17T18:30:00Z"
}
```

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
- **fitness-agent** (Skill) — Katalog-Manager, schreibt ~/fitness-dev/catalog/ + Tickets
- **fitness-dev-coding-agent** — implementiert Tickets, baut Code
- **React** ^18.3, **Vite** ^5.4, **TailwindCSS** ^3.4
- **react-body-highlighter** ^2.0.5 — Body-Map UI

---

## Workflow

1. **Ausbildung läuft** — User macht Fitnesstrainer-Module, Pflichtaufgaben
2. **fitness-agent hilft** — Schreibt Katalog (YAML), erkennt Lücken, schreibt Tickets
3. **fitness-dev wird gebaut** — fitness-dev-coding-agent implementiert Tickets
4. **User nutzt fitness-dev** — Trainingspläne erstellen, Logs führen, Anatomie lernen
5. **Loop** — Neue Lücken → neue Tickets → neue Features

---

## Status

- ✅ Backend Grundstruktur
- ✅ Frontend Views (Dashboard, Session, Journal, Muscles, Learn, Weekly)
- ✅ wger Integration (vollständig als Backend)
- ✅ yuhonas Integration (Bilder, Varianten)
- ✅ Katalog-Struktur (Exercises, Anatomy Teaching, Rules, Maps)
- ⏳ CLI (`fitness` Python/Typer)
- ⏳ Anatomie-Lehre für alle Übungen
- ⏳ PWA offline-Unterstützung
