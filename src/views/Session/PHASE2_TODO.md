# Session-Tab Rebuild — Phase 2: Mittel, semi-isoliert

Quelle: Haiku-Doppel-Audit 2026-09-05. Voraussetzung: [[PHASE1_TODO]]
abgeschlossen (oder zumindest nicht blockierend).

## Stücke

- [x] **ActivityAddon.jsx + ActivitySection.jsx zusammenlegen.** Beide sind
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
      - **Update 2026-09-05 (Sonnet-Agent, struktureller Teilschritt):**
        `ActivityPicker.jsx` angelegt und `ActivityAddon.jsx`/
        `ActivitySection.jsx` zu dünnen Re-Exports mit `mode="addon"` bzw.
        `mode="standalone"` gemacht — verhaltensidentisch zu vorher,
        `ADDON_TYPES`-Export (weiter von `SessionSlots.jsx` +
        `ActivityAddonHistory.jsx` genutzt) bleibt erhalten. Dabei auch
        festgestellt: die "9 vs 10 Activity-Types"-Diagnose oben ist
        **stale** — beide Listen enthielten zum Zeitpunkt des Merges
        bereits identische 10 Werte (inkl. "walking"), nur die
        Anzeige-Reihenfolge unterscheidet sich (in `ActivityPicker.jsx` als
        `ADDON_ORDER`/`STANDALONE_ORDER` erhalten). Die
        Muscle-Target/Swim-Style-Sichtbarkeits-Inkonsistenz besteht dagegen
        unverändert fort.
      - **Nutzer-Entscheidung 2026-09-05:** explizit NICHT angleichen.
        Button-Reihenfolge bleibt pro Modus unterschiedlich ("So lassen").
        Bei der Muscle-Target/Swim-Style-Sichtbarkeit auf Nachfrage, ob
        Cardio-Mode analog zum Addon erweitert werden soll (Muscle-Target
        auch bei Laufen/Radfahren/etc. zeigen): "nein nicht angleichen".
        Beide Modi bleiben damit bewusst mit unterschiedlichem
        Sichtbarkeits-Verhalten bestehen — kein Bug, kein weiterer
        Handlungsbedarf. Punkt ist damit abgeschlossen.

- [x] **SessionHeader.jsx entwirren** (~200 Z., 4 Verantwortlichkeiten in
      einer Datei). Erledigt 2026-09-05: reines Aufsplitten, kein
      Verhaltensunterschied.
      - Titel-Zeile + Datumslabel + Day-Strip + Hint-Banner bleiben direkt
        in `SessionHeader.jsx` (Composer-Rolle).
      - Portal-Overflow-Menü ("Mehr" → Session-Details/Übungsquellen) nach
        `SessionHeaderMenu.jsx` extrahiert — 1:1-Kopie inkl. `createPortal`,
        eigener lokaler `moreOpen`-State. Vorbereitung für Phase 4
        (zentrales Modal-Layer), hier nur der Portal-Call isoliert, kein
        neues Modal-System gebaut.
      - Session-Pills (Multi-Session-Switcher, +/Löschen) + Kraft/Ausdauer-
        Mode-Switch nach `SessionModeAndPills.jsx` extrahiert.
      - Mehrfach-Datum-Parsing (`new Date(d + 'T12:00:00')` unabhängig in
        `SessionHeader.jsx` und `useDayStrip.js`) auf `parseLocalDate()` in
        `utils.js` reduziert, beide Stellen nutzen jetzt den Helper.

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
