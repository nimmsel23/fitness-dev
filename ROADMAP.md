# fitness-dev Roadmap

---

## Vision

**Training als angewandte Anatomie.**

fitness-dev ist kein Workout-Tracker. Es ist ein System das dir beibringt was du tust — während du es tust.

Jede Einheit ist eine Anatomie-Lektion. Der Tempel wächst mit der Ausbildung.

---

## Endgame-Stack

```
Exercise Library (YAML Katalog)
  → Muscle Coverage (welche Muskeln, wie viel)
    → Body Highlighter (visuell auf dem Körper)
      → Anatomy Teaching (warum, Gelenkaktionen, Fehlerbilder)
        → Workout Plan (Periodisierung, Progression)
          → Training Log (Session-Daten, Pflichtaufgaben-Export)
            → Obsidian (Wissensbase für Ausbildung + Coaching)
```

---

## Phasen

### Phase 1 — Fundament (jetzt)
- [x] Session Logging (Datum, Block, Ort, Dauer, Übungen, Sätze/Wdh/Gewicht)
- [x] Pflichtaufgaben CSV Export (40 Einheiten: Nr, Datum, Einheit, Ort, Dauer)
- [x] Muscle Coverage (Body Highlighter, welche Regionen diese Woche)
- [x] Katalog-Struktur (YAML: Exercises, Anatomy Teaching, Rules, Maps)
- [ ] Anatomy Teaching für Top 20 Übungen (Katalog füllen)
- [ ] Exercise Detail View (Ursprung/Ansatz, Feel Cues, Fehlerbilder)

### Phase 2 — Ausbildung (Fitnesstrainer-Module)
- [ ] Trainingsplan-Builder (PPL, Upper/Lower — aus program_rules.yml)
- [ ] Progression Tracking (Double Progression, Deload-Erkennung)
- [ ] Weekly Review mit Volumen-Analyse pro Muskelgruppe
- [ ] Obsidian Export pro Session (Anatomy Teaching integriert)
- [ ] Volume Landmarks (MV/MEV/MAV/MRV pro Muskelgruppe) — Konzept aus MyFit/Liftosaur

### Phase 3 — Personaltrainer + Prävention
- [ ] Client-Profile (individuelle Anamnese, Einschränkungen)
- [ ] Safety-Filter (Schulter, Knie, Rücken — aus safety_rules.yml)
- [ ] Seniorentrainer-Modus (altersgerechte Varianten, Sturzprophylaxe)
- [ ] Gruppen-Trainingsplan (Fläche, Equipment, Level-Mix)

### Phase 4 — Business
- [ ] Client-Tracking (Fortschritt über Monate)
- [ ] Export für Klienten-Reporting (PDF/Markdown)
- [ ] Anatomy Teaching als interaktives Lernmodul

---

## Bekannte Ressourcen

Siehe `HOT.md` — Open Source Repos, npm Module, Referenz-Apps.

Highlights:
- `wrkout/exercises.json` — 2500+ Übungen mit Medien (Public Domain)
- `recharts` — Charts für Coverage/Progression (RadarChart, LineChart)
- `Liftosaur` — beste Referenz-App (Mesozyklus, Volume Landmarks, Progressionslogik)
- Volume Landmarks Konzept (MV/MEV/MAV/MRV) aus WhyAsh5114/MyFit

---

## Nicht auf der Roadmap

- Rehabilitation (das ist Physiotherapie)
- Ernährungs-Tracking (das ist fuel-dev)
- Entspannungs-Programme (das ist relax-dev)
- Alles was über den Vitaltrainer-Scope hinausgeht
