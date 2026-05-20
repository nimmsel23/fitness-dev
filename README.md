# anatomy-kb

**Knowledge API + Anatomy Teaching Layer für Trainingsübungen.**

Separates Repo für die Fitness-Säule des Vitaltrainer-Systems.
Kein Ersatz für wger — ein didaktischer Layer darüber.

```
anatomy-kb (dieses Repo)     :9200
     ↓
fitness-dev/catalog/         Intelligence Layer (resolver, coverage, teaching, planner)
     ↓
~/.aos/fitness/              Runtime-Daten
     ↓
wger Backend                 Exercise IDs, Muscle Graph, Body Highlighter
```

Analog geplant: `fuel-kb`, `relax-kb`.

## Starten

```bash
kbctl start       # Server :9200 hoch
kbctl status      # PID + Uptime
kbctl health      # /health prüfen
kbctl stop        # Server runter
kbctl logs        # live log
```

## API

```
GET  /health
GET  /api/exercises
GET  /api/exercise/{id}
GET  /api/exercise/{id}/teaching     ?mode=trainer|client
GET  /api/exercise/{id}/coverage     ?sets=3&rpe=7
GET  /api/exercise/{id}/bodymap
GET  /api/resolve                    ?q=kh+schraegbank
POST /api/plan/generate              {template, split, day, goal}
```

## CLI (anatomy-agent)

```bash
anatomy-agent list
anatomy-agent pick                   # fzf-Auswahl → teach
anatomy-agent teach bench_press
anatomy-agent errors pull_up
anatomy-agent quiz squat --reveal
anatomy-agent serve                  # Server starten (alternativ zu kbctl)
anatomy-agent doctor                 # Health-Check
```

## Struktur

```
anatomy-kb/
├── server.py               # Thin Router — nur Routing + Modul-Injection
├── kbctl                   # Server-Kontrolle (start/stop/status/health/logs)
├── anatomy-agent           # Typer CLI Dispatcher
├── anatomy_kb/
│   ├── handlers.py         # HTTP-Handler (zustandslos, testbar)
│   ├── loader.py           # YAML-Loader für lokale exercises/ (Standalone-Modus)
│   └── models.py           # Exercise + MuscleRoles Dataclasses
└── exercises/              # Anatomy-Teaching-YAMLs (Seed-Set, didaktischer Layer)
    ├── bench_press.yml
    ├── pull_up.yml
    ├── squat.yml
    ├── lunge.yml
    └── rdl.yml
```

## Anatomy-Teaching-Schema

```yaml
exercise_id:              # snake_case ID
name:                     # Anzeigename
category:                 # push / pull / squat / hinge / carry / core
movement_pattern:

simple_explanation:       # 2-3 Sätze für Laien
detailed_explanation:     # Vollständige anatomische Erklärung

joint_actions:            # Gelenke + konzentrisch/exzentrisch/statisch
muscle_roles:
  primary:
  secondary:
  stabilizers:

body_position_effect:     # Wie Winkel/Griff/Stance die Beteiligung ändert
feel_cues:                # Was der Trainierende spüren sollte
coaching_cues:
  setup:
  execution:

common_errors_explained:
  error_id:
    description:
    anatomical_reason:
    correction:
    teaches:

quiz_prompts:
  - question:
    answer:
```

## Philosophie

> Open Exercise DBs = Rohmaterial
> anatomy-kb = didaktischer Layer + Knowledge API

Jede Übung beantwortet:

1. Was bewegt sich?
2. Welche Gelenke agieren?
3. Welche Muskeln erzeugen Kraft?
4. Welche Muskeln stabilisieren?
5. Was sollte der Trainierende spüren?
6. Welche Fehler passieren und warum?
7. Was lernt der Mensch über seinen Körper?

## Seed-Übungen

| Übung | Muster | Lehrt primär |
|-------|--------|--------------|
| Bankdrücken | Horizontal Push | Pec-Schulter-Trizeps, Scapula-Setup |
| Klimmzug | Vertical Pull | Lat-Mechanik, Scapula-Depression |
| Kniebeuge | Bilateral Squat | Knie+Hüft-Kooperation, Beinachse |
| Ausfallschritt | Unilateral Squat | Gluteus medius, Beinachsen-Kontrolle |
| Romanian Deadlift | Hip Hinge | Hamstring-Funktion, Hip Hinge vs Squat |
