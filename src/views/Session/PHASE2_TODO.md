# Session-Tab Rebuild — Phase 2: Mittel, semi-isoliert

Quelle: Haiku-Doppel-Audit 2026-09-05. Voraussetzung: [[PHASE1_TODO]]
abgeschlossen (oder zumindest nicht blockierend).

## Stücke

- [ ] **ActivityAddon.jsx + ActivitySection.jsx zusammenlegen.** Beide sind
      im Kern dieselbe Activity-Picker-UI, aber mit divergenten Defaults:
      - `ActivityAddon` kennt 9 Activity-Types, `ActivitySection` 10
        (Unterschied: "Walking" fehlt bei Addon).
      - `ActivitySection` zeigt Muscle-Target/Swim-Style nur bei
        `type === 'hiit'` bzw. `'swimming'` — bei Addon läuft das anders
        (immer sichtbar). Grund nicht dokumentiert, wirkt wie Bug/Drift.
      - Ziel: eine gemeinsame `ActivityPicker.jsx` mit einem Mode-Prop
        (`addon` vs. `standalone`/cardio), gemeinsame `ACTIVITY_TYPES`- und
        `ACTIVITY_MUSCLE_DEFAULTS`-Konstante.
      - Vor dem Merge: mit Nutzer klären, ob die Muscle-Target-Sichtbarkeits-
        Inkonsistenz ein Bug ist oder Absicht war (nicht raten).

- [ ] **SessionHeader.jsx entwirren** (~200 Z., 4 Verantwortlichkeiten in
      einer Datei):
      - Titel-Zeile + Datumslabel
      - Day-Strip (7-Tage-Auswahl)
      - Hint-Banner
      - Session-Pills + Kraft/Ausdauer-Switch
      - Portal-Overflow-Menü ("Mehr") rausziehen in Vorbereitung auf Phase 4
        (zentrales Modal-Layer) — hier nur den Portal-Call isolieren, nicht
        das gesamte Modal-System bauen.
      - Mehrfach-Datum-Parsing (mehrere Stellen parsen `date`/`dateObj`
        separat) auf eine gemeinsame Stelle reduzieren.

## Definition of Done pro Stück

1. Verhalten vorher/nachher identisch (Screenshot-Vergleich reicht,
   kein Snapshot-Test-Setup vorhanden).
2. Bei ActivityPicker-Merge: beide bisherigen Nutzungsstellen
   (Kraft-Finisher + Cardio-Mode) gegen den echten Session-JSON-Format
   getestet (`activity`-Objekt-Shape bleibt gleich).
3. Kein neues Duplicate-State eingeführt.

## Nicht in dieser Phase

ExerciseCard/ExerciseList/SessionSlots/useSession.js — siehe [[PHASE3_TODO]].
Modal-Zentralisierung komplett — siehe [[PHASE4_TODO]].
