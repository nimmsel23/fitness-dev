# anatomy-kb

**Anatomy Intelligence Layer — Vitaltrainer Ausbildung (Dipl. Präventiver Vitaltrainer, FlexyFit Wien)**

Kein weiteres Exercise-DB. Ein didaktischer Layer der beantwortet:
*Was bewegt sich? Welche Muskeln erzeugen Kraft? Ursprung, Ansatz, Innervation — warum?*

```
anatomy-kb (:9200)
     ↓ liest
fitness-dev/catalog/kb/        Exercise-Definitionen + Anatomy-Teaching YAMLs
     ↓ liest
~/.aos/fitness/                Runtime-State (SQLite, Scores, Exports)
     ↓ proxied über
wger (:8000)                   Exercise Master Data + Muskelgraph
```

---

## Starten

```bash
kbctl start       # Server :9200 im Hintergrund
kbctl status      # PID + Uptime
kbctl health      # /health prüfen
kbctl stop        # Server runter
kbctl logs        # live log
```

---

## CLI — anatomy-agent

### Lernen

```bash
anatomy-agent teach bench_press          # Erklärung, Gelenke, Muskeln, Cues
anatomy-agent errors pull_up             # Fehlerbilder mit anatomischer Begründung
anatomy-agent quiz squat                 # Quiz — Enter zum Aufdecken
anatomy-agent quiz squat --reveal        # Alle Antworten sofort
```

### Flashcard-Modus (Ursprung & Ansatz)

```bash
anatomy-agent flashcard                  # alle verfügbaren Muskeln
anatomy-agent flashcard --exercise pull_up   # nur Klimmzug-Muskeln
anatomy-agent flashcard --weak           # nur Muskeln unter 60% Trefferquote
anatomy-agent flashcard --limit 10       # max. 10 Karten
```

Flow pro Karte:
1. Muskelname + lateinisch sehen
2. `Enter` → Ursprung aufdecken
3. `Enter` → Ansatz aufdecken
4. `1` Gewusst / `2` Unsicher / `3` Falsch / `q` Beenden

Scores werden in `~/.aos/fitness/anatomy-scores.json` gespeichert.
`--weak` filtert Muskeln mit unter 60% Trefferquote — Spaced Repetition ohne Overhead.

### Übungen durchsuchen

```bash
anatomy-agent list                       # alle Übungen als Tabelle
anatomy-agent pick                       # fzf-Auswahl → teach
anatomy-agent show bench_press           # YAML-Rohdaten
```

### Katalog erweitern

**Aus Ausbildungsnotizen (Obsidian Vault):**
```bash
anatomy-agent ingest Klimmzug
anatomy-agent ingest "Vorgebeugtes Rudern" --exercise barbell_row
anatomy-agent ingest /pfad/zur/datei.md --dry-run
```

Liest die Vault-MD, strippt Obsidian-Wikilinks, schickt den Inhalt an Gemini.
Gemini extrahiert `muscle_anatomy` + `common_errors_explained` aus deinen eigenen Notizen.
Du bestätigst mit `y` — Lernschritt durch Lesen.
Nach dem Speichern wird das MD-Frontmatter mit `anatomy_kb: {exercise_id, ingested, fields}` aktualisiert.

**Nur Ursprung/Ansatz via Gemini (ohne Vault-Notiz):**
```bash
anatomy-agent enrich bench_press
anatomy-agent enrich squat --force       # überschreibt bestehende Daten
anatomy-agent enrich rdl --dry-run       # nur anzeigen
```

### Qualitätssicherung

```bash
anatomy-agent audit                      # anatomy + exercises
anatomy-agent audit anatomy              # nur Teaching-Layer
anatomy-agent audit exercises            # nur Exercise-Definitionen
```

### System

```bash
anatomy-agent serve                      # API-Server starten (alternativ zu kbctl)
anatomy-agent doctor                     # Health-Check aller Komponenten
anatomy-agent reload                     # YAML-Cache leeren (kein Restart nötig)
```

---

## API (:9200)

| Endpoint | Beschreibung |
|----------|-------------|
| `GET /health` | Server-Status |
| `GET /api/exercises` | Alle Übungen |
| `GET /api/exercise/{id}` | Eine Übung |
| `GET /api/exercise/{id}/teaching` | Anatomy-Teaching (`?mode=trainer\|client`) |
| `GET /api/exercise/{id}/coverage` | Muscle-Coverage (`?sets=3&rpe=7`) |
| `GET /api/exercise/{id}/bodymap` | BodyMap-Regions |
| `GET /api/resolve?q=...` | Alias/Fuzzy-Resolver |
| `POST /api/plan/generate` | Trainingsplan |

---

## Vault-Integration

Vault-Root: `~/Dokumente/Vitaltrainer/Dipl.HealthPersonalTrainer/Übungen/`
Oder: `ANATOMY_KB_VAULT=/pfad anatomy-agent ingest ...`

`anatomy-agent ingest` liest:
- YAML-Frontmatter Tags (`tags: [#PULL, #RÜCKEN]`)
- Inline-Hashtags (`#compound-movement #prüfungsrelevant`)
- Obsidian-Wikilinks werden automatisch aufgelöst

Nach dem Speichern im YAML wird das Frontmatter der MD-Datei ergänzt:
```yaml
anatomy_kb:
  exercise_id: pull_up
  ingested: 2026-05-20
  fields: [muscle_anatomy, common_errors_explained, vault_tags]
```

---

## YAML-Schema (exercises/)

Seed-Übungen: `bench_press`, `pull_up`, `squat`, `lunge`, `rdl`

```yaml
exercise_id: pull_up
name: Klimmzug (Overhand)
category: pull
movement_pattern: vertical_pull

simple_explanation: ...
detailed_explanation: ...

joint_actions:
  shoulder:
    concentric: [adduction, extension]
    eccentric: [flexion_control]
  scapula:
    concentric: [depression, retraction]

muscle_roles:
  primary: [latissimus_dorsi]
  secondary: [biceps_brachii, teres_major]
  stabilizers: [trapezius_lower, rhomboids, rotator_cuff, core]

muscle_anatomy:                          # via enrich oder ingest befüllt
  latissimus_dorsi:
    latin: "Musculus latissimus dorsi"
    origin: "Processus spinosi T7–T12, Fascia thoracolumbalis, Crista iliaca"
    insertion: "Crista tuberculi minoris humeri"
    innervation: "N. thoracodorsalis (C6–C8)"
    function_in_exercise: "Hauptmotor der Adduktion und Extension des Humerus"

common_errors_explained:                 # via ingest aus Vault befüllt
  shoulder_elevation:
    description: "Schultern hochziehen statt Depression"
    anatomical_reason: "..."
    correction: "..."
    teaches: [scapular_depression, trapezius_lower]

vault_tags: [pull, rücken, compound-movement, prüfungsrelevant]

feel_cues: [...]
coaching_cues:
  setup: [...]
  execution: [...]
quiz_prompts:
  - question: "..."
    answer: "..."
```

---

## Struktur

```
anatomy-kb/
├── server.py                    # Thin aiohttp Router
├── kbctl                        # Server-Kontrolle (start/stop/status/health/logs)
├── anatomy-agent                # Typer CLI Dispatcher (35 Zeilen)
├── anatomy_kb/
│   ├── commands/
│   │   ├── _helpers.py          # Shared state (ROOT, EXERCISES_DIR, loader)
│   │   ├── browse.py            # list, pick, show
│   │   ├── teach.py             # teach
│   │   ├── learn.py             # errors, quiz
│   │   ├── flashcard.py         # flashcard (Ursprung/Ansatz Lernmodus)
│   │   ├── enrich.py            # enrich (Gemini → muscle_anatomy)
│   │   ├── ingest.py            # ingest (Vault MD → Gemini → YAML)
│   │   ├── audit.py             # audit
│   │   ├── serve.py             # serve
│   │   └── system.py            # reload, doctor
│   ├── gemini.py                # Gemini REST API + Fallback-Chain + Prompts
│   ├── vault.py                 # Vault-Utils, Tag-Extraktion, Frontmatter-Update
│   ├── display.py               # Rich-Anzeige (Tabellen, YAML-Save)
│   ├── handlers.py              # HTTP-Handler (zustandslos)
│   ├── loader.py                # YAML-Cache
│   └── models.py                # Exercise + MuscleRoles Dataclasses
└── exercises/                   # Seed-YAMLs (5 Übungen)
    ├── bench_press.yml
    ├── pull_up.yml
    ├── squat.yml
    ├── lunge.yml
    └── rdl.yml
```

---

## Gemini-Integration

Config: `~/.env/gemini.env` — `GEMINI_API_KEY` + `GEMINI_MODEL=gemini-2.5-flash`

Fallback-Chain bei 503/429: `gemini-2.5-flash` → `gemini-2.0-flash` → `gemini-2.0-flash-001` → `gemini-flash-lite-latest`

---

## Git Hooks

**pre-commit** (anatomy-kb): Blockiert Commit bei YAML-FAILs im Anatomy-Audit.
Läuft nur wenn `*.yml`-Dateien staged sind.

**post-commit** (anatomy-kb): Auto-committet `fitness-dev/catalog/kb/` Änderungen
mit Message `auto: kb sync von anatomy-kb — <letzter commit>`.

---

## Workflow

```bash
# 1. Vault-Notiz einlesen (eigene Ausbildungsnotizen als Quelle)
anatomy-agent ingest Klimmzug --exercise pull_up

# 2. Bestätigen → YAML + MD-Frontmatter aktualisiert

# 3. Flashcard-Session
anatomy-agent flashcard --exercise pull_up

# 4. Nach mehreren Sessions: nur schwache Muskeln
anatomy-agent flashcard --weak

# 5. Qualität prüfen
anatomy-agent audit
```

---

## Philosophie

> Open Exercise DBs = Rohmaterial
> anatomy-kb = didaktischer Layer + Knowledge API

Jede Übung beantwortet:
1. Was bewegt sich?
2. Welche Gelenke agieren (konzentrisch / exzentrisch / statisch)?
3. Welche Muskeln erzeugen Kraft — und wo setzen sie an?
4. Welche Muskeln stabilisieren?
5. Was sollte der Trainierende spüren?
6. Welche Fehler passieren — und warum anatomisch?
7. Was lernt der Mensch über seinen Körper?
