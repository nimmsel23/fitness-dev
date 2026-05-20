# anatomy-kb

**Anatomy Intelligence Layer für Trainingsübungen.**

Nicht eine weitere Exercise-Datenbank — sondern die didaktische Schicht
die fehlt. Open-Source Exercise DBs (wger, yuhonas) liefern Rohdaten.
Diese KB liefert Verständnis.

## Struktur

```
anatomy-kb/
├── exercises/          # Eine YAML-Datei pro Übung
│   ├── bench_press.yml
│   ├── pull_up.yml
│   ├── squat.yml
│   ├── lunge.yml
│   └── rdl.yml
└── concepts/           # Anatomische Konzepte (Gelenke, Muskeln, Bewegungsmuster)
```

## Schema pro Übung

```yaml
exercise_id:              # snake_case ID
name:                     # Anzeigename
category:                 # push / pull / squat / hinge / carry / core
movement_pattern:         # horizontal_push / vertical_pull / bilateral_squat / ...
equipment:                # barbell / dumbbell / bodyweight / ...

simple_explanation:       # 2-3 Sätze für Laien
detailed_explanation:     # Vollständige anatomische Erklärung

joint_actions:            # Gelenke + konzentrisch/exzentrisch/statisch
muscle_roles:
  primary:                # Haupt-Krafterzeuger
  secondary:              # Synergisten
  stabilizers:            # Stabilisatoren

# optional:
body_position_effect:     # Wie Winkel/Griff/Stance die Beteiligung ändert
grip_variation_effect:    # Griffweiten-Effekte
stance_variation_effect:  # Standbreiten-Effekte

feel_cues:                # Was der Trainierende spüren sollte
coaching_cues:            # Setup + Ausführung
  setup:
  execution:

common_errors_explained:  # Fehlerbild → anatomischer Grund → Korrektur → Lehrt:
  error_id:
    description:
    anatomical_reason:
    correction:
    teaches:

quiz_prompts:             # Fragen + Antworten für Anatomie-Lernen
  - question:
    answer:
```

## Philosophie

> Open Exercise DBs = Rohmaterial  
> anatomy-kb = Coach Brain + Teaching Engine

Jede Übung beantwortet:

1. Was bewegt sich?
2. Welche Gelenke agieren?
3. Welche Muskeln erzeugen Kraft?
4. Welche Muskeln stabilisieren?
5. Was sollte der Trainierende spüren?
6. Welche Fehler passieren und warum?
7. Was lernt der Mensch über seinen Körper?

## Kern-Übungen (Seed-Set)

Diese fünf Übungen decken alle fundamentalen Bewegungsmuster ab:

| Übung | Muster | Lehrt primär |
|-------|--------|--------------|
| Bankdrücken | Horizontal Push | Pec-Schulter-Trizeps-Synergie, Scapula-Setup |
| Klimmzug | Vertical Pull | Lat-Mechanik, Scapula-Depression, Grip-Effekte |
| Kniebeuge | Bilateral Squat | Knie+Hüft-Kooperation, Beinachse, Dorsalflexion |
| Ausfallschritt | Unilateral Squat | Unilaterale Stabilität, Gluteus medius, Beinachse |
| Romanian Deadlift | Hip Hinge | Hamstring-Funktion, Hip Hinge vs Squat, neutrales Spine |
