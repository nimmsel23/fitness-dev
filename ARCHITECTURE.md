# fitness-dev — Architektur

Stand: 2026-05-18

---

## Stack

```
React + Vite        :5902 (dev)     ~/fitness-dev/src/
Node.js Server      :9100           ~/fitness-dev/server.mjs
YAML Katalog        —               ~/fitness-dev/catalog/
Session-Daten       —               ~/fitness-dev/data/
```

---

## Server (server.mjs)

Node.js HTTP-Server, kein Framework.

| Endpoint | Methode | Beschreibung |
|----------|---------|-------------|
| `/health` | GET | Status |
| `/session?date=` | GET/POST | Tages-Session (Übungen, Block, Ort, Dauer, Notes) |
| `/session/history?limit=` | GET | Letzte N Sessions |
| `/session/latest` | GET | Neueste Session |
| `/exercises/search?q=` | GET | Suche lokal + wger + yuhonas |
| `/coverage/detailed?days=` | GET | Muscle-Coverage mit Gewichtung |
| `/coverage/gaps?days=` | GET | Untertrainierte Muskelgruppen |
| `/blocks` | GET | Split-Labels (Push/Pull/Legs etc.) |
| `/plan/today?date=` | GET | Plan-Hint für heute |
| `/export/csv?days=` | GET | CSV pro Übung (detailliert) |
| `/export/pflichtaufgabe` | GET | CSV pro Einheit (Datum, Block, Ort, Dauer) |
| `/fitness/export` | POST | Markdown-Export (Obsidian, Coach Sheet, Plan) |
| `/theme` | GET/POST | UI-Theme |

---

## Frontend (src/)

```
src/views/
├─ Dashboard.jsx      — Überblick, heutiger Plan, Coverage-Summary
├─ Session.jsx        — Workout-Logging (Block, Ort, Dauer, Übungen, Export)
├─ Journal.jsx        — Text-Notizen
├─ Muscles.jsx        — Body-Map + Coverage-Analyse
├─ Learn.jsx          — Anatomy Teaching, Exercise Details
└─ WeeklyReview.jsx   — Wochenreport

src/components/
├─ ExerciseSearch.jsx      — Suche lokal + wger + yuhonas
├─ BodyMap.jsx             — react-body-highlighter
├─ PlanBuilder.jsx         — Trainingsplanung
├─ HabitWidget.jsx         — HabitSync-Integration
└─ ExerciseInsightModal.jsx — Anatomy Teaching Modal
```

---

## Datenschichten

Drei Quellen, eine Hierarchie:

```
custom_yaml (Semantic Truth)     ~/fitness-dev/catalog/
  ↑ überschreibt bei Konflikt
wger (:8000, lokal)              Exercise Master Data, Tracking Backend
  ↑ ergänzt
yuhonas/free-exercise-db         Bilder, alternative Namen, Varianten
```

**Was jede Schicht liefert:**

| Schicht | Liefert | Fehlt |
|---------|---------|-------|
| wger + yuhonas | Namen, Muskel-Tags, Bilder, IDs | Gelenkaktionen, Fehlerbilder, Feel Cues, didaktischer Layer |
| custom_yaml | Anatomy Teaching, Bewegungsmuster, Coaching Notes | — das ist der Wert |

---

## Katalog (~/fitness-dev/catalog/)

```
catalog/
├─ config.yml
├─ data_source_priority.yml
├─ exercises/                    — Exercise-Definitionen (canonical IDs)
├─ anatomy_teaching/             — Didaktischer Layer pro Übung
├─ maps/
│  ├─ aliases.yml                — Freie Eingabe → canonical_id
│  ├─ wger_mapping.yml           — wger Muscle-ID (1–16) → interne catalog Muscle-ID ✓ befüllt
│  └─ external_db_mapping.yml    — custom_id ↔ yuhonas_id (Placeholder)
├─ muscles/
│  ├─ muscles.yml                — Muskel-Taxonomie (22 granulare IDs)
│  ├─ muscle_coverage_rules.yml  — primary 1.0 / secondary 0.5 / stabilizer 0.2 + RPE-Faktoren
│  └─ body_highlighter_bridge.yml — Muskeln → visuelle Body-Regionen (enabled: false)
└─ rules/
   ├─ program_rules.yml          — PPL, Sätze/Wdh, Periodisierung
   ├─ progression_rules.yml      — Double Progression, Deload
   └─ safety_rules.yml           — Kontraindikationen, Joint-Schutz
```

Build: `npm run build:catalog` → `~/.aos/fitness/workouts/catalog.json`

**Muscle-Mapping Hierarchie:**
Session-JSONs speichern Muscle-Namen als Strings (wger `name_en`: `"Chest"`, `"Lats"`, `"Lower back"` etc.).
`muscleToGroupId()` in server.mjs mappt diese auf interne Gruppen-IDs für Coverage-Berechnung.
`wger_mapping.yml` mappt numerische wger IDs → granulare catalog-IDs (für zukünftigen wger-Sync).

---

## Anatomy Teaching Schema

```yaml
anatomy_teaching:
  exercise_id: string
  title: string

  main_lesson:
    - string

  joint_actions:
    joint_name:
      - flexion_concentric
      - extension_eccentric
      - stabilization

  muscle_roles:
    primary: [muscle]
    secondary: [muscle]
    stabilizers: [muscle]

  feel_map:
    muscle_name:
      cue: string

  simple_explanation: string
  detailed_explanation: string
  coaching_cues: [string]

  common_errors_explained:
    error_name:
      reason: string
      muscles_to_teach: [muscle]
      correction: string

  variations_teach:
    variation_name:
      teaches: string

  quiz_prompts:
    - question: string
      answer: string
```

---

## BodyMap (react-body-highlighter) — Zwei Stufen

**Stufe 1: Basis-Visualisierung — aktiv, fertig implementiert.**

`BodyMap.jsx` nutzt `react-body-highlighter` und rendert anterior + posterior Körpermodell.
Datenfluss:

```
Session-Exercises (done: true)
  ↓ exercisesToModelData()    [BodyMap.jsx]
  ├─ Pfad A (präzise):  wger_muscle_ids.primary/secondary → WGER_TO_RBH → RBH-Muskelname
  └─ Pfad B (Fallback): primaryMuscles/secondaryMuscles (Strings) → LABEL_TO_GROUP → GROUP_TO_RBH → RBH-Muskelname
  ↓
react-body-highlighter <Model>  (anterior oder posterior)
```

`WGER_TO_RBH` mappt wger-Muscle-IDs 1–16 direkt auf RBH-Muskelregionen.
Primary-Muscles zählen doppelt (`score +2`), Secondary einfach (`+1`). `frequency` steuert die Einfärbungsintensität.

Eingebunden in `Session.jsx` — zeigt ausschließlich Muskeln von Übungen mit `done: true`.
Auch in `Muscles.jsx` über den `groupScores`-Pfad (Coverage-View, Legacy-Fallback).

---

**Stufe 2: Granulare Muskel-Visualisierung — noch nicht aktiv.**

`catalog/kb/muscles/body_highlighter_bridge.yml` (`enabled: false`) ist die Konfiguration für eine
zukünftige Erweiterung: Mapping von granularen Katalog-Muskel-IDs (aus `muscles.yml`, 22 IDs wie
`pectoralis_major`, `anterior_deltoid`) auf RBH-Regionen — statt der groben Gruppen-Strings.

Sobald aktiviert: `muscle_coverage_rules.yml` liefert primary/secondary/stabilizer-Gewichtungen
aus dem Katalog-YAML, statt aus wger-IDs oder Session-Strings. Vorteil: Anatomie-Präzision auf
Einzelmuskel-Ebene, konsistent mit dem Anatomy-Teaching-Layer.

**Was `enabled: false` bedeutet:** Der Code-Pfad existiert noch nicht. `body_highlighter_bridge.yml`
ist eine Planungsdatei, kein Toggle. Aktivieren erfordert einen neuen Datenpfad in `BodyMap.jsx`
und `server.mjs` (Coverage-Endpoint muss granulare Katalog-IDs zurückgeben).

---

## Session-Format (data/sessions/YYYY-MM-DD.json)

```json
{
  "date": "2026-05-17",
  "block": "Push",
  "location": "Gym",
  "duration": 60,
  "exercises": [
    {
      "name": "Bankdrücken",
      "sets": 4,
      "reps": 8,
      "weight": 80,
      "primaryMuscles": ["chest"],
      "secondaryMuscles": ["triceps", "shoulders"],
      "done": true,
      "rpe": 8
    }
  ],
  "effort": 8,
  "notes": "",
  "saved_at": "2026-05-17T18:30:00Z"
}
```

---

## Firestore (Firebase PWA + Bisync)

Details → [FIRESTORE.md](FIRESTORE.md)

```
fitness-dev/
├── firestore/                    Python-Modul (sync-Logik)
│   ├── _db.py                    Firebase-Init, shared
│   ├── sync.py                   pull/push one-shot
│   ├── sync_cli.py               CLI entry (python -m firestore.sync_cli)
│   └── mirror.py                 on_snapshot Daemon
├── firestore-mirror.mjs          Node: lokal → Firestore (server.mjs import)
├── firestore-sync.mjs            Node: spawnt Python pull/push
└── pwa/                          Firebase PWA (fitness-aos.web.app)
```

| Richtung | Mechanismus | Trigger |
|----------|-------------|---------|
| lokal → Firestore | `firestore-mirror.mjs` | automatisch bei POST /session + /journal |
| Firestore → lokal (live) | `python -m firestore.mirror` | on_snapshot Daemon |
| Firestore → lokal (once) | `fitness-sync pull` | manuell |
| lokal → Firestore (once) | `fitness-sync push` | manuell |

---

## Externe Services

| Service | Port | Zweck |
|---------|------|-------|
| wger (Docker) | :8000 | Exercise Master Data — 845 Exercises, 16 Muscles mit stabilen IDs |
| HabitSync | :6842 | HabitWidget Integration |

**wger Muscle-IDs** (stabil, für wger_mapping.yml):
`1` Biceps · `2` Anterior deltoid · `4` Pectoralis major · `5` Triceps · `6` Rectus abdominis
`7` Gastrocnemius · `8` Gluteus maximus · `9` Trapezius · `10` Quads · `11` Hamstrings
`12` Latissimus dorsi · `13` Brachialis · `14` Obliques · `15` Soleus · `16` Erector spinae

---

## Body Data (fitness-mail)

Fitbit-Daten via IMAP-Poller (`bin/fitness-mail`), Systemd-Timer 2× täglich (11:00 + 19:00).

```
~/.aos/fitness/body/YYYY-MM-DD.json
  weight_kg, bmi, body_fat_pct, lean_mass_kg
  steps, active_min, calories_burned, distance_km
  sleep_h, sleep_score, sleep_deep_min, sleep_rem_min
  resting_hr
  weekly_steps, weekly_distance_km, weekly_active_min, weekly_calories_avg
```

Endpoint: `GET /fitness/body?days=N` (von WeightChart.jsx genutzt, shared mit fuel-dev + relax-dev).

---

## Commands

| Befehl | Zweck |
|--------|-------|
| `npm run dev` | Backend (:9100) + Vite (:5902) |
| `npm run ui:dev` | Nur Vite |
| `npm run build` | Production Build → dist/ |
| `npm run build:catalog` | Katalog → ~/.aos/fitness/workouts/catalog.json |
| `fitnessctl start/stop/status` | Server-Management |
