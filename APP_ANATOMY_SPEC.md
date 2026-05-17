# Vitaltrainer App - Anatomy Layer Spec

## Purpose

Die Anatomy Layer ist die didaktische Schicht uber der Exercise Library.

Sie beantwortet nicht nur, was eine Ubung ist, sondern was sie lehrt.

## Scope

Diese Schicht ist fur:

- Bewegungsmuster
- Gelenkaktionen
- Muskelrollen
- Korpergefuhl
- Fehlerbilder
- Coaching Cues
- Lernfragen
- kurze anatomische Erklarungen

## Position in der Systemkette

```text
wger / yuhonas / custom YAML
  -> Exercise Identity
  -> Anatomy Layer
  -> Coverage Layer
  -> Coaching Layer
  -> Export / Log / Review
```

## Core Questions

Jede Ubung soll mindestens diese Fragen beantworten:

1. Welche Bewegung findet statt?
2. Welche Gelenke arbeiten?
3. Welche Muskeln erzeugen Kraft?
4. Welche Muskeln stabilisieren?
5. Welche Korperregion wird sichtbar belastet?
6. Was sollte der Trainierende spuren?
7. Welche Fehlerbilder treten auf?
8. Warum treten sie auf?
9. Wie coacht man die Ubung einfach und sicher?
10. Was lernt ein Vitaltrainer daraus?

## Learning Modes

### Quick

- kurze Erklarung
- 3 Coaching Cues
- 1 typischer Fehler

### Trainer

- Bewegungsmuster
- Gelenkaktionen
- Muskelrollen
- Fehlerbilder mit Ursachen
- Coaching-Sprache

### Anatomy

- tieferer biomechanischer Kontext
- Prime Mover / Synergist / Stabilizer
- Variationseffekte
- Quizfragen

### Client

- einfache Sprache
- sichere Ausfuhrung
- Spurchues
- was man vermeiden soll

## Suggested Folder

```text
~/.fitness-agent/
├── exercises/
├── muscles/
├── anatomy_teaching/
├── rules/
├── maps/
├── state/
└── exports/
```

## Anatomy Schema

```yaml
anatomy_lesson_schema:
  exercise_id: string
  title: string
  region: string

  learning_goal:
    short: string
    detailed: string

  movement_pattern:
    primary: string
    secondary:
      - string

  joint_actions:
    joint:
      eccentric:
        - action
      concentric:
        - action
      stabilization:
        - action

  muscle_roles:
    prime_movers:
      - muscle
    synergists:
      - muscle
    stabilizers:
      - muscle

  body_highlighter_regions:
    primary:
      - region
    secondary:
      - region
    light:
      - region

  trainer_explanation:
    simple: string
    technical: string
    client_friendly: string

  feel_cues:
    - cue

  coaching_cues:
    - cue

  common_errors:
    - error: string
      anatomical_reason: string
      correction: string
      coaching_cue: string

  variations_teach:
    - variation: string
      lesson: string

  quiz:
    - question: string
      answer: string
```

## Minimum Viable Set

Der erste funktionsfahige Satz fur `.fitness-agent` ist:

- `exercises/*.yml`
- `rules/program_rules.yml`
- `maps/aliases.yml`
- `muscles/muscles.yml`
- `muscles/muscle_coverage_rules.yml`
- `muscles/body_highlighter_bridge.yml`
- `anatomy_teaching/*.yml`
- `state/`
- `exports/`

## Setup Principle

Wenn die Anatomie-Layer noch nicht komplett ist, darf der Agent mit einer reduzierten lokalen YAML-Mode arbeiten.

Wichtig ist:

- strukturell vorbereitet
- erweiterbar
- versionierbar
- klar getrennt von Rohdaten
- ohne die Exercise Library zu uberladen
