# Architektur-Dokumentation: Dynamisches Muskel-Katalog & Analytics System

Diese Dokumentation beschreibt die bereinigte, dynamische Architektur des Muskel-Katalogs, der Firestore-Synchronisation sowie der Belastungs- & Coverage-Berechnung im AlphaOS Fitness-Ökosystem.

---

## 1. Ausgangslage & Problematik (Warum aufgeräumt werden musste)

In vorherigen Iterationen hatten KI-Agenten eine Vielzahl an doppelten, veralteten und überstrukturierten Hilfskonstrukten eingeführt:
- **Künstliche Felder in YAMLs**: `body_region` (z. B. `chest_front`), doppelgemoppelte `region`-Strings und redundante Aliase.
- **In-Memory Loader & Async-Kartenhäuser**: `getMuscleVizMap()`, `primeMuscleViz()` und `_vizCache`, die beim App-Start gesamte Collections luden und bei kleinsten Datenabweichungen abstürzten.
- **Parallelstrukturen**: `_groups.yml` und `muscle_index.yml` wurden als Fallback-Pipeline missbraucht.
- **Hartcodierte Wortlisten**: JS-Dateien enthielten riesige `raw.includes("pectoralis")` / `raw.includes("latissimus")` Listen, statt die KB dynamisch zu lesen.

---

## 2. Grundprinzip: Der Katalog deklariert sich selbst (Source of Truth)

Jede Info liegt **exakt an einer Stelle** im Verzeichnis `fitness/catalog/kb/muscles/`.
Wichtig: Der Katalog hat zwei Ebenen, und die App muss diese Ebenen getrennt
lesen.

### A. Top-Level Regionen-Dateien (`kb/muscles/*.yml`)
Dateien wie `chest.yml`, `shoulders.yml`, `calves.yml`, `hamstrings.yml`,
`upper_back.yml`, `middle_back.yml`, `lower_back.yml`, etc. deklarieren die
groben App-Regionen/Buckets:
```yaml
id: quadriceps
display_name: Quadriceps
label_de: Quadrizeps
highlight_ids: [quads-left, quads-right]
muscles:
  - 601_quadriceps_femoris
  - 601a_rectus_femoris
  - 601b_vastus_lateralis
  - 601c_vastus_medialis
  - 601d_vastus_intermedius
```
- **`muscles: [...]`**: Die Liste aller zugehörigen Muskel-IDs.
- **`legs.yml` & `back.yml`**: Dienen als bewusste Fallback-Buckets für allgemeine Übungen.
- **Bucket-Prezedenz:** kleine/spezifische Buckets gewinnen vor großen
  Sammel-Buckets. Beispiel: `quadriceps.yml` gewinnt vor `legs.yml`,
  `bizeps.yml` gewinnt vor `arms.yml`. Sammeldateien bleiben nur Fallback für
  Muskeln ohne spezifischeren Top-Level-Bucket.
- **Öffentliche Dokument-ID:** der Dateiname ohne Endung, z. B. `chest` aus
  `chest.yml`. Ein internes `id: 100_chest` darf diese Bucket-ID nicht
  ersetzen.

### B. Unter-Muskel-Dateien (`kb/muscles/<region>/<id>.yml`)
Einzelmuskel-Dateien enthalten nur noch ihre kanonischen Kerndaten (`id`, `display_name`, `label_de`, `wger_id`, `aliases`, `viz`). Keine redundanten `region:` oder `body_region:` Felder mehr.
Die `region` wird beim Sync aus dem Ordnernamen abgeleitet, z. B.
`kb/muscles/chest/101_pectoralis_major.yml` -> `region: chest`.

### C. Firestore/API-Contract
Beide Ebenen werden vollständig exportiert. Top-Level-Dateien werden als
`kb_level: region` gepusht, Unterordner-Dateien als `kb_level: muscle`.
Dadurch überschreibt `bizeps.yml` nicht mehr
`arms/402_biceps_brachii.yml`, obwohl beide historisch dasselbe `id:`-Feld
tragen können.

---

## 3. Datenfluss & Komponenten-Zusammenspiel

```mermaid
graph TD
    A["KB YAMLs (kb/muscles/*.yml + */*.yml)"] -->|1:1 Sync via firestore_push.py| B["Firestore (fitness/kb/muscles)"]
    B -->|getAllMuscles() beim App-Start| C["shared/muscle.js (setKBMuscles)"]
    C --> D["_kbRegions & _muscleToRegionMap"]
    D --> E["muscleToRegion(id)"]
    
    E --> F["Analysis & Review (getMuscleCoverage / getWeeklyReport)"]
    E --> G["Highlighter (BodyMap & DetailedMuscleMap)"]
    E --> H["Regeneration / Superkompensation (muscle_recovery)"]
```

---

## 4. Beteiligte Kernfunktionen & Module

### A. `src/lib/db/shared/muscle.js` (Zentrales Mapping)
- **`setKBMuscles(docs)`**: Wird beim Laden der KB aufgerufen. Liest die `muscles: [...]` Arrays aus den Regionen-Dateien und verknüpft jeden Unter-Muskel dynamisch mit seiner Region.
- **`getMuscleGroups()`**: Gibt alle geladenen Regionen inklusive ihrer deutschen Labels zurück.
- **`muscleToRegion(muscleId)`**: Schaut in der dynamischen KB-Map nach und gibt die Region zurück (z. B. `601a_rectus_femoris` -> `quadriceps`).
- **`muscleToGroupIds(muscleId)`**: Array-Wrapper für Coverage-Berechnungen.

### B. `src/lib/db/firestore/analysis.js` & `local/analysis.js` (Analytics)
- **`getMuscleCoverage(days)`**: Rechnet `primaryMuscles` (+1.0), `secondaryMuscles` (+0.7), `stabilizers` (+0.4) und Aktivitäten (+0.5) über `muscleToRegion()` auf die Regionen an.
- **`getCoverageGaps(days, threshold)`**: Gleicht die Punkte gegen `getMuscleGroups()` ab und ermittelt echte Versorgungslücken (z. B. Waden < 1.0).
- **`getWeeklyReport(selector)`**: Berechnet die Wochen-Analyse, Top-Übungen und die Regenerationszeit (**Superkompensation / `muscle_recovery`**) in Stunden seit der letzten Belastung pro Region.

### C. Highlighter & Detail-Komponenten
- **`BodyMap.jsx` (`react-body-highlighter`)**: Wandelt Übungen/Scores via `muscleToRegion()` in Regionen-Slugs um und zeichnet die Übersichtskarte.
- **`DetailedMuscleMap.jsx` (`react-muscle-highlighter`)**: Zeigt detaillierte Belastungsfarben pro Region.
- **`MuscleHighlightMap.jsx` (`body-muscles`)**: Ruft bei Einzelmuskel-Ansicht im Modal `getMuscle(muscleId)` ab und steuert das SVG an.

---

## 5. Vorteile des bereinigten Zustands

1. **Absolut Null Hardcoding**: Keine `raw.includes(...)`-Listen, keine Regexes, keine manuellen JS-Tabellen.
2. **Glasklare Differenzierung**: Beinstrecker (Quadrizeps) landet auf `quadriceps` und meldet keine verwirrende "Beine"-Lücke mehr, wenn Waden/Beinbeuger fehlen.
3. **Resilient & Wartungsarm**: Neue Regionen-Dateien oder Muskeln in `kb/muscles/` werden automatisch ohne JS-Codeänderung erkannt.
