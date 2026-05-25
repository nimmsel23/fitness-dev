# Report: Muscle Coverage & Recovery Logic (Firebase PWA)

Dieses Dokument analysiert die aktuelle Implementierung der Muskel-Coverage und Ruhezeit-Berechnung in der Fitness PWA. Es dient als Grundlage für die Anpassung des lokalen `kb-enricher` im `fitness_agent`.

## 1. Datenfluss & Datenquellen (Pipeline)

1.  **Lokal (SSOT):** YAML-Dateien in `catalog/kb/exercises/`.
2.  **Sync:** `kb_sync.py` transformiert YAML -> Firestore (`fitness/kb/exercises/{id}`).
3.  **PWA-Load:** `db.js` lädt alle Übungen via `getAllExercises()` in eine Map (`kbMap`).
4.  **Enrichment:** Da Sessions oft nur den Namen der Übung speichern, reichert die PWA die Session-Daten *on-the-fly* mit den Muskel-Tags aus der `kbMap` an.

## 2. Zuordnungs-Logik (Mapping)

Die Zuordnung von spezifischen Muskeln (z.B. "Pectoralis major") zu Hauptgruppen erfolgt zweistufig:

### A. Gruppen-Definition (`db.js`)
Die Konstante `MUSCLE_GROUPS` definiert Keywords für jede Hauptgruppe:
```javascript
const MUSCLE_GROUPS = {
  chest: ["pecs", "chest", "pectoralis"],
  legs: ["legs", "squat", "deadlift", "lunge"],
  // ...
};
```

### B. Matching-Funktion (`muscleToGroupIds`)
Diese Funktion prüft sowohl den **Muskel-Tag** als auch den **Übungs-Namen** gegen die Keywords.
- **Wichtig:** Sie gibt nun ein **Array** von Gruppen zurück (Multi-Group Support).
- **Fallback:** Wenn keine Muskel-Tags vorhanden sind, wird nur der Name gegen die Keywords geprüft.

## 3. Berechnungs-Modelle

### A. Coverage-Gaps (Heute-Tab)
- **Logik:** Sucht in den letzten 7 Tagen nach Sessions.
- **Score:** Jede Übung (done) gibt `+1` Hit für jede betroffene Gruppe.
- **Gap:** Wenn Hit-Summe < 1 für eine Gruppe -> Anzeige als "Lücke".

### B. BodyMap (Visuell)
- **Aggregation:** `exercisesToModelData` sammelt Scores in `rbhScores`.
- **Gewichtung:** Primäre Muskeln = `+2`, Sekundäre = `+1`.
- **Mapping:** Nutzt `LABEL_TO_GROUP` in `BodyMap.jsx` (muss synchron zu `MUSCLE_GROUPS` in `db.js` gehalten werden).

### C. Recovery (Weekly Review)
- **Automatisierung:** Erkennt dominanten Muskel einer Session für das Split-Label.
- **Per-Muskel Rest:** Berechnet für jeden Muskel der Session die Stunden seit dem letzten Vorkommen in der 120-Tage-Historie.

## 4. Aktuelle Schwachstellen (Warum es "cooked" wirken kann)

1.  **Redundante Mappings:** Es gibt zwei Mappings (`db.js` vs. `BodyMap.jsx`). Wenn eine neue Gruppe lokal im `kb-enricher` erfunden wird, bleibt die Anzeige im Dashboard grau, bis beide JS-Dateien manuell aktualisiert werden.
2.  **Namens-Abhängigkeit:** Die Fallback-Logik verlässt sich stark auf den Namen. Wenn eine Übung in der KB falsch benannt ist (z.B. "Deadlift" ohne "Legs" Keyword), schlägt das Mapping fehl.
3.  **Score-Akkumulation:** Die Gewichtung (2 für Primär, 1 für Sekundär) in der `BodyMap` ist rein visuell und wird in der Gap-Analyse (`db.js`) bisher nicht identisch abgebildet (dort zählt jeder Treffer als 1).

## 5. Empfehlung für kb-enricher / fitness_agent

Um die PWA stabil zu machen, sollte der `kb-enricher`:
1.  **Zentrales Mapping exportieren:** Ideal wäre eine `mapping.json` in der KB, die von der PWA geladen wird, anstatt hardcodierte JS-Konstanten zu nutzen.
2.  **Tags erzwingen:** Der Enricher sollte sicherstellen, dass jede Übung mindestens einen Primär-Tag aus einer validierten Liste hat.
3.  **Split-Inferenz:** Die automatische Split-Erkennung in `db.js` könnte verbessert werden, wenn die KB bereits "Split-Vorschläge" für Übungskombinationen mitliefert.

---
*Erstellt am 25. Mai 2026 für die Weiterentwicklung des fitness_agent.*
