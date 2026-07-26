# Body-Highlighter — Architektur

Drei unabhängige Libraries zeigen Muskelbelastung im Körperbild. Sie sind NICHT
austauschbar (unterschiedliche Slug-Vokabulare, unterschiedliche Granularität)
und wurden bis 2026-07-26 über eine hartcodierte, bei jeder Katalog-Umnummerierung
veraltende ID→Slug-Tabelle (`src/lib/muscleMapping.js`) bedient — diese Datei
ist gelöscht und darf nicht wiederkommen. Jede neue Zuordnung MUSS live aus der
KB abgeleitet werden (Endpoint `GET /fitness/muscles/viz`, Firestore-Collection
`fitness/kb/muscles`), nie als literale Tabelle im Code stehen.

## Die drei Libraries

| Library | Komponente | Datenformat | Granularität |
|---|---|---|---|
| `react-body-highlighter` | `BodyMap.jsx` | `[{ name, muscles: [slug], frequency }]` | grob (~19 Slugs, keine Chest-Anteile, keine Front/Rear-Delt-Trennung außer front/back-deltoids) |
| `react-muscle-highlighter` | `DetailedMuscleMap.jsx` | `[{ slug, color }]` | grob, eigenes Vokabular (`deltoids` statt front/back-deltoids) |
| `body-muscles` | `MuscleHighlightMap.jsx` | `{ view, ids: [...] }` pro Aufruf | fein (links/rechts, mehrere Segmente pro Muskel) |

## Woher jede Library ihre Daten bekommt

**RBH und RMH brauchen KEINE Einzelmuskel-Auflösung.** Beide sind zu grob, um
z.B. Pectoralis-Sternal- von -Clavicular-Kopf zu unterscheiden — deshalb reicht
ihnen das **Region-Wort** (`"chest"`, `"back"`, `"shoulders"`, ...), das direkt
aus den Top-Level-Regionsdateien abgeleitet wird (`kb/muscles/*.yml`, z.B.
`chest.yml` mit `id: 100_chest` + `muscles: [...]`-Mitgliederliste). Das Wort
`"chest"` ist zugleich exakt der RBH-Slug — reine Wiederverwendung, keine
Übersetzungstabelle. RMH bekommt dasselbe Wort (leichte Abweichungen wie
`deltoids` statt `front-deltoids` werden nicht übersetzt, sondern bleiben
ungehighlightet — ehrlich statt erfunden).

**body-muscles braucht die Einzelmuskel-Files**, weil es links/rechts +
mehrere Segmente pro Muskel kennt (`viz.body_muscles.ids`, z.B.
`["chest-upper-left", "chest-upper-right"]`). Das steht nur in den
individuellen Dateien unter `kb/muscles/<region>/<id>.yml`, nicht in den
Top-Level-Regionsdateien.

## Live-Endpoint: `GET /fitness/muscles/viz`

```
{
  "wger": { "101_pectoralis_major": 4, ... },       // Catalog-Detail (wger-Abgleich), NICHT fürs Grouping
  "region": { "101_pectoralis_major": "chest", ... },// RBH/RMH-Grundlage
  "wger_to_rbh": { "4": "chest", ... },              // für Übungen mit nur wger_muscle_ids, ohne Katalog-ID
  "labels": { "101_pectoralis_major": "Großer Brustmuskel", ... },
  "body_muscles": { "101_pectoralis_major": { view, ids: [...] } },
  "body_muscles_slugs": { "101_pectoralis_major": "chest-upper-left" }
}
```

Lokal: `fitness/api/routers/exercises.py::muscles_viz()` liest `kb/muscles/*.yml`
+ `kb/muscles/*/*.yml` direkt. Firebase: `src/lib/db/firestore/kb.js::getMuscleVizMap()`
liest die Firestore-Collection `fitness/kb/muscles` (gepusht von
`firestore_push.py::sync_muscles()`, Quelle: `muscle_index.yml`). Beide Wege
geben dasselbe Shape zurück, konsumiert wird es über `@db`, nie direkt fest verdrahtet.

## Coverage-Gruppe (Review-Tab "Coverage-Lücken") ist etwas ANDERES

Die Highlighter (oben) brauchen grobe Regionswörter. Die Coverage-Lücken-Anzeige
braucht das Gegenteil: maximale Präzision, keine Reduktion. Deshalb ist die
Coverage-Gruppe dort **die Muskel-ID selbst** (`muscleToGroupIds()` in
`src/lib/db/shared/muscle.js` gibt einfach `[muscleId]` zurück) — kein
`wger_id`, kein Regionswort. Die durchnummerierten Einzelmuskel-IDs sind die
eigentliche Masse/das Detail des Katalogs; die Nummern genügen laut
Katalog-Design als Gruppierung. `wger_id` (1-16) ist umgekehrt das grobe
Makro/Skelett für den Python-Import/-Abgleich mit wger — nicht die
Gruppierungs-Ebene fürs Frontend.

Cardio-Aktivitäten (`ACTIVITY_MUSCLE_GROUPS`) kennen nur grobe Regionswörter
(keine Einzelmuskel-Daten möglich). Damit sie trotzdem in dieselbe
muskel-ID-genaue Coverage-Zählung einfließen, expandiert
`regionToGroupIds(word)` das Regionswort zurück auf alle Muskel-IDs dieser
Region (reiner Lookup im schon geladenen `region`-Dict, keine eigene Tabelle).

## Regel für zukünftige Änderungen

Wenn ein Highlighter falsch aussieht: zuerst prüfen, ob die KB-Datei
(Region-Datei oder Einzelmuskel-Datei) das richtige Feld hat — NICHT eine neue
Übersetzungstabelle im JS/Python-Code schreiben. Die einzigen legitimen
Konstanten im Code sind Dinge, die eine externe Library selbst fest vorgibt
und idealerweise von ihr exportiert werden (z.B. `MuscleType` aus
`react-body-highlighter` in `BodyMap.jsx`) — niemals eine von Hand erfundene
ID→Slug- oder Gruppe→Slug-Zuordnung.
