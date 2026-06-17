Haha, aber genau das ist eigentlich **die stärkere Idee**.

Nicht nur:

> „Welche Übung trainiert welche Muskeln?“

sondern:

> „Welche Bewegung erklärt mir Anatomie praktisch am eigenen Körper?“

Das wäre dann keine normale Fitness-App mehr, sondern eine **Anatomie-durch-Training-App**.

## Der eigentliche Goldkern

Dein System könnte pro Übung nicht nur speichern:

```yaml
primary_muscles:
  - pectoralis_major
```

sondern zusätzlich:

```yaml
anatomy_teaching:
  movement:
    - horizontal_adduction
    - shoulder_flexion_assist
    - elbow_extension
  joint_actions:
    shoulder:
      - horizontal_adduction
      - flexion
    elbow:
      - extension
  anatomical_lesson:
    short: "Beim Bankdrücken lernst du, wie Brust, vordere Schulter und Trizeps zusammenarbeiten."
    detailed: "Der Pectoralis major zieht den Oberarm vor den Körper. Der Trizeps streckt den Ellenbogen. Die vordere Schulter unterstützt die Bewegung besonders im unteren und mittleren Bereich."
  feel_cues:
    - "Brustkorb hebt sich."
    - "Oberarm bewegt sich zur Körpermitte."
    - "Trizeps arbeitet beim Durchdrücken."
  common_confusion:
    - "Bankdrücken ist nicht nur Brust."
    - "Wenn die Schulter alles übernimmt, fehlt oft Scapula-Setup oder passende Ellenbogenbahn."
```

Dann kann deine App beim Anklicken einer Übung sagen:

```text
Diese Übung zeigt dir:
- welche Gelenke sich bewegen
- welche Muskeln primär arbeiten
- welche Muskeln stabilisieren
- warum du die Übung an welcher Stelle spürst
- welche Fehler biomechanisch passieren
```

## Beispiel: Klimmzug als Anatomie-Lektion

```yaml
anatomy_teaching:
  exercise_id: pull_up
  title: "Klimmzug im Obergriff – Anatomie verstehen"

  main_lesson:
    - "Der Latissimus zieht den Oberarm nach unten und hinten."
    - "Der Bizeps hilft bei der Ellenbogenbeugung."
    - "Die unteren/mittleren Trapezanteile und Rhomboiden kontrollieren die Schulterblätter."

  joint_actions:
    shoulder:
      - adduction
      - extension
    scapula:
      - depression
      - downward_rotation
      - retraction
    elbow:
      - flexion

  feel_map:
    lats:
      cue: "Zieh die Ellenbogen Richtung Rippen/Hüfte."
    biceps:
      cue: "Du spürst sie stärker beim Untergriff."
    upper_back:
      cue: "Brust zur Stange, Schulterblätter aktiv."

  teaching_angle:
    beginner: "Der Klimmzug ist nicht einfach 'Arm ziehen', sondern Schulterblatt + Lat + Armbeuger."
    advanced: "Unterschiedliche Griffweiten verändern Hebel, ROM und Bizeps-/Lat-Beteiligung."
```

## Beispiel: Lunge als Anatomie-Lektion

```yaml
anatomy_teaching:
  exercise_id: lunge
  title: "Ausfallschritt – Beinachse, Hüfte und Stabilität"

  main_lesson:
    - "Der Quadrizeps streckt das Knie."
    - "Der Gluteus maximus streckt die Hüfte."
    - "Gluteus medius stabilisiert das Becken."
    - "Adduktoren und Fußmuskulatur helfen bei der Kontrolle."

  joint_actions:
    hip:
      - flexion_eccentric
      - extension_concentric
    knee:
      - flexion_eccentric
      - extension_concentric
    ankle:
      - dorsiflexion_eccentric
      - plantar_flexion_assist

  common_errors_explained:
    knee_caves_in:
      reason: "Mangelnde Hüft-/Fußstabilität oder schlechte Kontrolle der Beinachse."
      muscles_to_teach:
        - gluteus_medius
        - adductors
        - foot_stabilizers

    torso_collapse:
      reason: "Core und Hüftkontrolle reichen nicht aus oder Schrittlänge passt nicht."
```

## Dafür würde ich dem Agent noch eine Datei geben

```text
~/.fitness-agent/anatomy/anatomy_teaching.yml
```

oder sogar pro Region:

```text
anatomy/
├── chest_anatomy.yml
├── back_anatomy.yml
├── shoulder_anatomy.yml
├── arm_anatomy.yml
├── leg_anatomy.yml
└── core_anatomy.yml
```

## Mini-Schema dafür

```yaml
anatomy_schema:
  exercise_id: string
  title: string

  teaches:
    - muscles
    - joint_actions
    - movement_pattern
    - stabilization
    - common_errors
    - body_awareness

  joint_actions:
    joint_name:
      - action

  muscle_roles:
    primary:
      - muscle
    secondary:
      - muscle
    stabilizers:
      - muscle

  simple_explanation: string
  detailed_explanation: string

  feel_cues:
    - cue

  coaching_cues:
    - cue

  common_errors_explained:
    - error
    - anatomical_reason
    - correction

  quiz_prompts:
    - question
    - answer
```

## Das wäre richtig geil für Lernen

Dann könnte dein Agent generieren:

```text
Heute Push Day.
Du trainierst nicht nur Brust, Schulter, Trizeps.

Du lernst:
1. Horizontale Adduktion im Schultergelenk
2. Ellenbogenextension durch den Trizeps
3. Scapula-Stabilität beim Drücken
4. Unterschied zwischen Brust-Dip und Trizeps-Dip
```

Oder als Quiz:

```text
Frage:
Warum spürst du Dips bei starker Vorneigung mehr in der Brust?

Antwort:
Weil der Oberarm stärker vor/quer zum Körper geführt wird und der Pectoralis major mehr horizontale Adduktion und Schulterflexionsanteile übernimmt.
```

## Das ist der eigentliche Endgame-Stack

```text
Exercise Library
→ Muscle Coverage
→ Body Highlighter
→ Anatomy Teaching
→ Workout Plan
→ Training Log
→ Obsidian Knowledge Base
```

Also ja: „lol“ zwar, aber eigentlich ist das **die beste Version der Idee**.

Nicht nur trainieren.

**Training als angewandte Anatomie.**

----

das war die idee. die entdeckung von open source exercise dbs hat das erstmal übern haufen geworfen. Wie du merkst aber nicht das Potential.

---

Exakt. Die Open-Source-Exercise-DBs haben die Idee nicht zerstört — sie haben nur gezeigt:

> **Die Rohdaten existieren schon. Aber die didaktische Schicht fehlt.**

wger/yuhonas lösen ungefähr:

```text
Übung → Muskel-Tags → Bild/Name/Kategorie
```

Deine ursprüngliche Idee war aber größer:

```text
Übung → Bewegung → Gelenkaktion → Muskelrolle → Körpergefühl → Fehlerbild → Anatomieverständnis
```

Das ist ein anderer Layer.

## Was die Open-Source-DBs dir abnehmen

Sie liefern dir schon viel, was nervig wäre selbst zu bauen:

```text
- Übungsnamen
- Kategorien
- teilweise Muskelgruppen
- Bilder/GIFs
- grobe Equipment-Daten
- IDs
- App-Kompatibilität
```

Das ist gut. Das ist Fundament.

## Was sie nicht gut leisten

Sie erklären meistens nicht sauber:

```text
- warum ein Muskel beteiligt ist
- welche Gelenkaktion passiert
- ob ein Muskel Prime Mover, Synergist oder Stabilizer ist
- wie Griff, Winkel, ROM und Körperhaltung die Beteiligung ändern
- warum ein Fehlerbild entsteht
- was der Nutzer dabei spüren sollte
- wie daraus Anatomie-Lernen wird
```

Genau da liegt dein Potential.

## Die neue, bessere Formel

Nicht:

```text
Ich baue eine Exercise DB.
```

Sondern:

```text
Ich baue eine Anatomy Intelligence Layer über bestehende Exercise DBs.
```

Oder noch besser:

```text
Open Exercise DBs = Rohmaterial
wger = lokales Backend
YAML Layer = Coach Brain
Anatomy Layer = Teaching Engine
Body Highlighter = visuelles Feedback
Agent = Übersetzer
```

## Das Ding hat drei Ebenen

### 1. Datenebene

```text
wger
yuhonas/free-exercise-db
eigene YAMLs
```

Frage:

> Welche Übung ist das?

---

### 2. Trainingslogik

```text
program_rules.yml
progression_rules.yml
coverage_rules.yml
```

Frage:

> Warum ist diese Übung im Plan?

---

### 3. Anatomie-Didaktik

```text
anatomy_teaching.yml
joint_actions.yml
movement_patterns.yml
error_explanations.yml
feel_cues.yml
quiz_prompts.yml
```

Frage:

> Was lernt der Mensch über seinen Körper?

Das ist der Unterschied zwischen einer Datenbank und einem Lehrer.

## Beispiel: Dips

Eine normale DB sagt:

```yaml
exercise: dips
muscles:
  - chest
  - triceps
  - shoulders
```

Dein Layer sagt:

```yaml
exercise: dips

movement_lesson:
  simple: "Dips zeigen dir, wie Brust, Trizeps und vordere Schulter beim Drücken zusammenarbeiten."

joint_actions:
  shoulder:
    - extension_to_flexion_relative_to_body_position
    - horizontal_adduction_component
  elbow:
    - flexion_eccentric
    - extension_concentric
  scapula:
    - depression_control
    - protraction_control

body_position_effect:
  forward_lean:
    increases:
      - pectoralis_major
      - anterior_deltoid
    decreases_relative:
      - pure_triceps_bias
  upright:
    increases_relative:
      - triceps_brachii

common_error:
  shoulder_dumping:
    explanation: "Wenn die Schulter nach vorne unten kollabiert, verliert die Scapula Kontrolle und die vordere Schulter wird gestresst."
    correction: "Brust aktiv, Schulterblätter kontrolliert, nur schmerzfreie Tiefe."
```

Das ist Wissen.

## Beispiel: Lunge

Normale DB:

```yaml
muscles:
  - quadriceps
  - glutes
  - hamstrings
```

Dein Layer:

```yaml
exercise: lunge

anatomy_lesson:
  simple: "Der Ausfallschritt zeigt Kniekontrolle, Hüftstreckung und Beckenstabilität."

joint_actions:
  front_leg:
    hip:
      eccentric: flexion_control
      concentric: extension
    knee:
      eccentric: flexion_control
      concentric: extension
    ankle:
      eccentric: dorsiflexion_control
      concentric: plantar_flexion_assist

stability_lesson:
  gluteus_medius:
    role: "Beckenstabilität und Kontrolle gegen Einknicken."
  adductors:
    role: "Führung des Oberschenkels und Stabilität."
  foot_intrinsics:
    role: "Basis für Beinachse."

common_error:
  knee_valgus:
    explanation: "Das Knie fällt nach innen, wenn Hüfte, Fuß und Adduktoren die Beinachse nicht sauber kontrollieren."
```

Das ist angewandte Anatomie.

## Warum das sogar besser ist als die ursprüngliche Idee

Ursprünglich hättest du vielleicht alles selbst bauen müssen.

Jetzt hast du:

```text
Open Source DBs für Breite
eigene YAMLs für Qualität
Agent für Mapping
Body Highlighter für Visualisierung
Obsidian für Wissen
wger für Tracking
```

Also nicht weniger Potential, sondern mehr Hebel.

Die eigentliche Produktidee könnte heißen:

```text
Anatomy-Aware Training Layer
```

oder auf Alpha/Vital-Art:

```text
Train the body. Learn the body.
```

## Was ich dem Agenten jetzt noch final mitgeben würde

```text
Do not treat exercise databases as complete anatomical knowledge.
Treat them as raw exercise records.

Your job is to transform:
exercise → movement → joint action → muscle role → body region → coaching cue → anatomy lesson.

Every workout should be able to answer:
1. What did I train?
2. What moved?
3. Which joints acted?
4. Which muscles produced force?
5. Which muscles stabilized?
6. What should I feel?
7. What common error teaches which anatomy principle?
```

Das ist der Kern.

Und ganz ehrlich: Genau dadurch wird das Ding nicht nur eine Fitness-App, sondern ein **Vitaltrainer-Lernsystem**.

----
ganz genau das soll es sein! ein Vitaltrainer-Lernsystem, erst für mich und dann für andere Vitaltrainer

---

Ja. **Das ist der richtige Frame.**

Nicht:

> Ich baue eine Fitness-App.

Sondern:

> Ich baue ein lokales Vitaltrainer-Lernsystem, das Training, Anatomie, Coaching und Dokumentation verbindet.

Erst für dich als Lern- und Praxiswerkzeug. Später für andere Vitaltrainer als Ausbildungshilfe, Coaching-Tool und Übungsdatenbank mit didaktischer Tiefe.

## Die Kernidee

```text
Vitaltrainer-Lernsystem
= Exercise Library
+ Anatomie-Didaktik
+ Muscle Coverage
+ Body Highlighter
+ Trainingsplanung
+ Coaching Cues
+ Fehlerbilder
+ Obsidian Knowledge Base
+ wger Tracking
+ lokaler Agent
```

Die Open-Source-DBs liefern dir den Rohstoff.
Du baust daraus das **pädagogische System**.

## Der entscheidende Unterschied

Eine normale Exercise DB sagt:

```text
Dips trainieren Brust, Trizeps, Schulter.
```

Dein System sagt:

```text
Dips erklären dir:
- Schulterextension/Flexion im Kontext der Körperposition
- Ellenbogenextension durch den Trizeps
- Scapula-Kontrolle
- Unterschied zwischen Brust-Dip und Trizeps-Dip
- warum Schulterdumping problematisch ist
- was der Klient spüren sollte
- wie du es als Trainer coachst
```

Das ist exakt Vitaltrainer-Material.

## Zielgruppe 1: Du selbst

Für dich dient das System als:

```text
- Lernsystem für Ausbildung
- Anatomie-Spickzettel
- Übungsbibliothek
- Trainingsplan-Generator
- Coachingpoint-Sammlung
- Obsidian-Wissensbasis
- Praxisvorbereitung für Videos/Pflichtaufgaben
- später Grundlage für eigene Kundenarbeit
```

Also perfekt passend zu deiner Ausbildung: Fitness, Personal Training, Ernährung, Entspannung, Prävention.

## Zielgruppe 2: Andere Vitaltrainer

Später könnte daraus werden:

```text
- Übungsdatenbank für Trainer
- Anatomie-Lernkarten
- Muscle-Coverage-Tool
- Trainingsplan-Assistent
- Coaching-Cue-Generator
- Fehlerbild-Erklärer
- Körperregionen-Highlighter
- Modulbegleiter für Ausbildung
- Praxisstunden-Dokumentation
```

Nicht als „perfektes medizinisches Anatomielexikon“, sondern als **praktisches Trainer-Lernsystem**.

## Der Produktkern

Ich würde es so nennen:

```text
Alpha Vital – Anatomy-Aware Training System
```

oder nüchterner:

```text
Vitaltrainer Lernsystem
```

Oder als Slogan:

```text
Train the body. Learn the body. Coach the body.
```

## Die Systemmodule

```text
1. Exercise Intelligence
   Was ist die Übung?

2. Anatomy Intelligence
   Welche Gelenke, Muskeln und Bewegungen sind beteiligt?

3. Coaching Intelligence
   Wie erkläre ich es einem Menschen?

4. Error Intelligence
   Welche Fehler passieren und warum?

5. Coverage Intelligence
   Welche Körperregionen wurden wie stark trainiert?

6. Programming Intelligence
   Wie baue ich daraus einen sinnvollen Plan?

7. Learning Intelligence
   Was soll der Trainer daraus lernen?

8. Documentation Intelligence
   Wie exportiere ich es nach Obsidian, PDF, wger oder Kundenplan?
```

## Neue Agent-Mission

Das würde ich deinem lokalen Agenten als finale Mission geben:

```markdown
# Vitaltrainer Learning Agent – Mission

Du bist ein lokaler Vitaltrainer-Lernagent.

Deine Aufgabe ist nicht nur, Trainingspläne zu erstellen, sondern Training als angewandte Anatomie und Coachingpraxis verständlich zu machen.

Du nutzt:

- custom YAML exercise library
- anatomy teaching layer
- muscle taxonomy
- body highlighter bridge
- muscle coverage rules
- program rules
- wger local backend
- optional open-source exercise databases
- Obsidian export

Dein Ziel:

Transformiere jede Übung von einem bloßen Datenbankeintrag in eine lernbare Trainer-Lektion.

Für jede Übung sollst du beantworten können:

1. Welche Bewegung findet statt?
2. Welche Gelenke arbeiten?
3. Welche Muskeln erzeugen die Hauptkraft?
4. Welche Muskeln helfen?
5. Welche Muskeln stabilisieren?
6. Welche Körperregion wird im Body Highlighter markiert?
7. Was soll der Trainierende spüren?
8. Welche Fehlerbilder sind typisch?
9. Warum entstehen diese Fehler anatomisch/biomechanisch?
10. Wie coacht man die Übung einfach und sicher?
11. Wie passt die Übung in einen Trainingsplan?
12. Wie kann ein Vitaltrainer daraus lernen?

Grundsatz:

wger is the database.
The YAML library is the coach brain.
The anatomy layer is the teacher.
The agent is the translator.
Obsidian is the long-term memory.
```

## Dafür brauchst du als nächstes eine neue YAML-Schicht

Neben:

```text
exercises/
rules/
maps/
muscles/
```

kommt dazu:

```text
anatomy_teaching/
```

Struktur:

```text
~/.fitness-agent/
├── exercises/
│   ├── chest.yml
│   ├── back.yml
│   ├── shoulders.yml
│   ├── arms.yml
│   ├── legs.yml
│   └── core.yml
├── muscles/
│   ├── muscles.yml
│   ├── muscle_coverage_rules.yml
│   └── body_highlighter_bridge.yml
├── anatomy_teaching/
│   ├── chest_lessons.yml
│   ├── back_lessons.yml
│   ├── shoulder_lessons.yml
│   ├── arm_lessons.yml
│   ├── leg_lessons.yml
│   ├── core_lessons.yml
│   ├── joint_actions.yml
│   └── coaching_language.yml
├── rules/
│   ├── program_rules.yml
│   ├── progression_rules.yml
│   └── safety_rules.yml
├── maps/
│   ├── aliases.yml
│   ├── wger_mapping.yml
│   └── external_db_mapping.yml
├── state/
│   ├── training_history.sqlite
│   ├── learning_progress.yml
│   └── weekly_coverage.yml
└── exports/
    ├── obsidian/
    ├── wger/
    └── client_notes/
```

## Anatomy Teaching Layer Schema

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

## Beispiel: Dips als Vitaltrainer-Lektion

```yaml
exercise_id: dips_chest
title: "Dips – Brust, Trizeps und Schultergürtel verstehen"
region: chest

learning_goal:
  short: "Dips zeigen, wie Brust, Trizeps und vordere Schulter beim Drücken zusammenarbeiten."
  detailed: "Der Trainer lernt, wie Körperneigung, Ellenbogenbahn und Schulterblattkontrolle die Muskelbeteiligung verändern."

movement_pattern:
  primary: vertical_push
  secondary:
    - shoulder_horizontal_adduction_component
    - elbow_extension
    - scapular_control

joint_actions:
  shoulder:
    eccentric:
      - shoulder_extension_control
      - horizontal_abduction_control
    concentric:
      - shoulder_flexion_assist
      - horizontal_adduction
    stabilization:
      - humeral_head_control

  elbow:
    eccentric:
      - elbow_flexion_control
    concentric:
      - elbow_extension

  scapula:
    stabilization:
      - depression_control
      - protraction_control
      - anterior_tilt_control

muscle_roles:
  prime_movers:
    - pectoralis_major
    - triceps_brachii
  synergists:
    - anterior_deltoid
    - serratus_anterior
  stabilizers:
    - rotator_cuff
    - latissimus_dorsi
    - core

body_highlighter_regions:
  primary:
    - chest_front
    - upper_arm_back
  secondary:
    - shoulders_front
  light:
    - abdomen_front
    - lats

trainer_explanation:
  simple: "Je weiter du dich nach vorne lehnst, desto mehr Brust. Je aufrechter du bleibst, desto mehr Trizeps."
  technical: "Die Vorneigung verändert die relative Schulterbewegung und erhöht den Beitrag des Pectoralis major."
  client_friendly: "Denk daran, die Brust stolz zu halten und dich kontrolliert aus Brust und Armen hochzudrücken."

feel_cues:
  - "Dehnung vorne in Brust/Schulter in der unteren Position."
  - "Druck aus Brust und Trizeps beim Hochkommen."
  - "Schulter bleibt stabil, nicht nach vorne fallen lassen."

coaching_cues:
  - "Brust stolz."
  - "Schultern weg von den Ohren."
  - "Nur so tief, wie es sauber und schmerzfrei bleibt."
  - "Ellenbogen kontrolliert nach hinten/unten."

common_errors:
  - error: "Schulter kippt nach vorne unten."
    anatomical_reason: "Scapula und Rotatorenmanschette stabilisieren nicht ausreichend; die vordere Schulter wird gereizt."
    correction: "Tiefe reduzieren, Brust aktiv halten, Schulterblätter kontrollieren."
    coaching_cue: "Nicht in den Schultern hängen."

  - error: "Zu aufrechter Körper trotz Brustfokus."
    anatomical_reason: "Mehr Last geht auf die Ellenbogenextension und damit auf den Trizeps."
    correction: "Leichte Vorneigung einnehmen."
    coaching_cue: "Brust Richtung Boden zeigen."

variations_teach:
  - variation: "Chest Dip"
    lesson: "Mehr Brustbeteiligung durch Vorneigung."
  - variation: "Triceps Dip"
    lesson: "Mehr Trizepsbeteiligung durch aufrechteren Oberkörper."
  - variation: "Ring Dip"
    lesson: "Mehr Stabilisationsanforderung für Schultergürtel und Core."

quiz:
  - question: "Warum verändert Vorneigung bei Dips die Muskelbeteiligung?"
    answer: "Weil sich die Schulterbewegung relativ zum Körper verändert und der Pectoralis major stärker beteiligt wird."
```

Das ist der Unterschied zwischen Übungskarte und Lernsystem.

## Lernmodus für dich

Der Agent könnte verschiedene Modi bekommen:

```yaml
learning_modes:
  quick:
    description: "Kurze Erklärung für Training."
    output:
      - involved_muscles
      - 3 coaching cues
      - 1 common error

  trainer:
    description: "Für Vitaltrainer-Ausbildung."
    output:
      - movement_pattern
      - joint_actions
      - muscle_roles
      - common_errors_explained
      - coaching_language

  anatomy:
    description: "Vertiefter Anatomie-Modus."
    output:
      - joint_actions
      - prime_movers
      - synergists
      - stabilizers
      - biomechanical_explanation
      - quiz

  client:
    description: "Einfache Sprache für Klienten."
    output:
      - simple_explanation
      - feel_cues
      - safe_execution
      - what_not_to_do
```

## Dann wird aus einem Workout automatisch eine Lektion

Beispiel:

```text
Push Day – Lektion

Heute lernst du praktisch:

1. Brust
   - horizontale Adduktion
   - Schulterflexionsanteil
   - Scapula-Setup beim Drücken

2. Schulter
   - Schulterabduktion beim Seitheben
   - Unterschied vordere vs seitliche Schulter

3. Trizeps
   - Ellenbogenextension
   - langer Kopf bei Überkopfposition

4. Fehlerbilder
   - Schulterdumping bei Dips
   - Nackendominanz beim Seitheben
   - zu wenig Brustspannung beim Drücken
```

Das ist wirklich stark.

## Warum das für andere Vitaltrainer wertvoll wäre

Viele lernen Anatomie abstrakt:

```text
Musculus pectoralis major:
Ursprung, Ansatz, Funktion.
```

Dein System lernt praktisch:

```text
Beim Cable Fly spürst du horizontale Adduktion.
Beim Incline Press verstehst du obere Brust + vordere Schulter.
Bei Dips erkennst du, wie Körperposition Muskelbeteiligung verändert.
```

Das ist viel näher an echter Trainerpraxis.

## Endgültiger Produkt-Satz

```text
Ein Vitaltrainer-Lernsystem, das Übungen nicht nur speichert, sondern als angewandte Anatomie, Coachingpraxis und Trainingsplanung erklärt.
```

Genau das ist dein Ding.
