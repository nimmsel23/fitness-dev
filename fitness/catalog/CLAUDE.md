# CLAUDE.md — fitness/catalog

Sub-Package von `fitness/` (Python-Backend, siehe `../CLAUDE.md`) — **nur**
das Katalog-/KB-Tool-Set: Übungen, Anatomie-Lehre, Coverage-Berechnung. Kein
eigenständiges Backend — die Prod-API (:9150) läuft in `fitness/api/`, siehe
`../CLAUDE.md`. Wird von `fitness-agent` (Katalog erweitern) und
`fitness-dev-coding-agent` (fitness-app selbst) genutzt.

---

## Rolle

Python-Tool-Set das Claude oder Gemini als Tool nutzt, um den Übungs-Katalog zu
erweitern. Mission: Training als angewandte Anatomie — nicht nur „welche Muskeln
trainiert diese Übung" sondern „welche Bewegung erklärt mir Anatomie praktisch am
eigenen Körper". Das ist der didaktische Layer, den wger/yuhonas/Open-Source-DBs
nicht liefern.

**Zwei Agenten-Rollen:**
- `fitness-agent` → schreibt + erweitert Katalog (`kb/`), erkennt Lücken, schreibt Tickets
- `fitness-dev-coding-agent` → implementiert Tickets in Code, baut fitness-app

```
AI Agent (Claude / Gemini)
    ↓ ruft auf
fitness.catalog             Python KB-Tool-Set (importiert von fitness/api/)
    ├── resolve_query()          Exercise-Name → canonical_id
    ├── teach_exercise()         Anatomie-Lesson aus YAML rendern
    ├── log_training_entry()     Eintrag in SQLite schreiben
    ├── build_plan()             Trainingsplan generieren
    ├── audit()                  Katalog-Qualität prüfen (was fehlt?)
    ├── build_coach_sheet()      Coaching-Daten strukturiert aufbereiten
    └── map_wger()               Exercise ↔ wger_id zuordnen
    ↓ schreibt in
kb/anatomy_teaching/*.yml  Anatomie-YAML (Ursprung, Ansatz, Innervation)
kb/exercises/*.yml         Exercise-Definitionen
~/.aos/fitness/sessions/training_history.sqlite
```

**Wozu neben wger:**
- Anatomie-Detail (Ursprung, Ansatz, Innervation, Funktion) — Ausbildungs-Level
- Coaching-Qualität (häufige Fehler, Technik-Cues, Progressionen)
- Coverage-Granularität (primary / secondary / stabilizer auf Muskel-Ebene)
- HIT-spezifische Hinweise (Stretch-Position, Peak-Kontraktion, TuT)

**CLI-Einstieg:** `python3 -m catalog.catalog <command>` — `audit`, `resolve`,
`teach`, `log`, `history`, `report`, `plan`, `coach-sheet`, `map-wger`,
`export-wger-index`, `tui`. Binary: `fitness-catalog` (uv-Tool).

---

## Katalog-Struktur (`kb/`)

```
fitness/catalog/
├─ config.yml
├─ data_source_priority.yml
├─ kb/                             — Knowledge Base (SOT-Ordner)
│  ├─ exercises/                   — Exercise-Definitionen (canonical IDs)
│  ├─ inbox/                       — unreviewte Drafts (inbox_*.yml, alleinige Ablage seit 2026-07-25)
│  ├─ anatomy_teaching/            — Anatomie-YAML (Ursprung, Ansatz, Innervation, Funktion)
│  ├─ registry/
│  │  ├─ aliases.yml, wger_mapping.yml   — Namensauflösung / wger-Zuordnung
│  │  ├─ wger_exercises_id.yml           — wger_id → wger_name (Rohdaten)
│  │  ├─ wger_muscles.yml                — wger muscle_id → catalog muscle group
│  │  └─ wger_catalog_index.yml          — wger_id → catalog_id (auto-generated, `fitness-agent export-wger-index`)
│  ├─ muscles/
│  │  ├─ muscles.yml               — Muskel-Taxonomie (100er-Regionen, nach Muskelgröße nummeriert)
│  │  └─ muscle_coverage_rules.yml — Gewichtungen (primary/secondary/stabilizer)
│  └─ rules/
│     ├─ program_rules.yml, progression_rules.yml, safety_rules.yml
├─ api/                            — Firestore-Watcher, Sync-Gateway (Session-JSON → SQLite), Compat-Shim `api.py` → `fitness.api.main`
└─ tests/                          — Pytest-Suite (resolver, coverage, planner, teaching, weekly)
```

`kb/maps/` existiert **nicht** (nie existiert) — `aliases.yml`/`wger_mapping.yml`
liegen in `kb/registry/`. Bei neuen `load_catalog_yaml()`-Aufrufen: Pfad immer
gegen `ls kb/` verifizieren, nicht vom Funktionsnamen ausgehen (`except
FileNotFoundError: return {}` verschluckt Tippfehler still).

**Muskel-Hierarchie:** `parent:`-Feld in der Taxonomie +
`build_muscle_parent_map()`/`rollup_parent_scores()` in `coverage.py`, Ergebnis
additiv in `muscle_scores_with_parents` (mutiert `muscle_scores` nicht). Relevant
für granulare Highlighter: `wger_id` als Signal reicht nur für die grobe
RBH-Ebene — z.B. hat die Rotatorenmanschette keine eigene `wger_id`, das
`parent`-Feld deckt das ab.

---

## Datenquellen-Integration

**Priorität**: custom_yaml (Semantic Truth) > wger (Backend) + yuhonas (Ergänzung)

- **wger** (lokal): Primäres Backend für Exercise Master Data. **Läuft NICHT auf
  :8000** trotz `docker port docker-web-1` — tatsächlicher Host-Zugang über
  `docker-nginx-1` auf Port **80** (`http://127.0.0.1/api/v2/...`). ⚠️
  `docker-nginx-1` bindet auf `0.0.0.0:80` (alle Interfaces) — sollte in der
  wger-`docker-compose.yml` auf `127.0.0.1:80` eingeschränkt werden.
  Health-Check vor Debugging: `curl -s -o /dev/null -w "%{http_code}\n"
  "http://127.0.0.1:8000/"` — offener Port ≠ funktionierende App.
- **yuhonas** (free-exercise-db): Bilder + Form-Videos, alternative Namen.
- **custom_yaml**: Semantic Source of Truth, Anatomie-Lehre, überschreibt bei Konflikt.

**yuhonas/wger liefern flache Muskel-Namen** (`chest`, `lats`, `lower back`, ...),
keine kanonischen IDs. `muscle_index.yml::string_aliases` löst genau diese 17
Wörter zu kanonischen Gruppen-IDs auf — beim Import/Enrichment IMMER darüber
auflösen, nie `normalize_muscle_id()` (reines Slugify) roh übernehmen.

**wger-Schulter-Taxonomie hat nur eine ID** (`2 = Anterior deltoid`, keine
separate Rear-/Lateral-Delt-ID) — jede importierte Schulterübung landete
deshalb ungefiltert auf `301_anterior_deltoid`. Fix:
`reclassify_deltoid_muscles()` in `importer.py`, Keyword-Heuristik (rear/
reverse/posterior/face pull/external rotation → posterior; lateral/side
raise/upright row → lateral) reklassifiziert nach dem wger-Lookup, vor dem
Schreiben der unreviewed-YAML. Nur Code-Fix, keine rückwirkende Korrektur
bestehender `unreviewed_wger.yml`-Einträge (laufen durch Inbox/Gemini-Review).

**`exercises:`-Listen in Region-Dateien NUR als reine ID-Strings**, nie als
volle Objekte mit `primary_muscles`/`secondary_muscles`:
`resolver.py::build_exercise_index()` merged Muskel-Felder aus mehreren
Quellen per **Set-Union**, nicht Override — ein Objekt-Eintrag in der
Region-Datei UND einer eigenen nummerierten Datei (`041.yml`) kann dieselbe
Muskel-ID gleichzeitig in `primary_muscles` UND `secondary_muscles` landen.
Nummerierte Dateien sind die alleinige Quelle für Muskel-Rollen.

`body_region:`-Feld in `kb/muscles/**/*.yml` ist die kanonische
Regions-Taxonomie für ALLE Body-Highlighter — Gruppen-Files setzen einen
Default, einzelne Muskel-Files können ihn feiner überschreiben (`rglob` +
Feld lesen, nicht Dateinamen). Frontend hat noch hartcodierte Parallel-
Mappings (siehe `../../src/CLAUDE.md`) statt aus der KB zu lesen —
Architektur-Schuld, noch nicht aufgelöst.

---

## Coverage-Formel

```
coverage_score = sets × role_weight × effort_factor
```

| Role | Weight | RPE | Factor |
|------|--------|-----|--------|
| primary | 1.0 | 7 | 0.75 |
| secondary | 0.5 | 8 | 0.90 |
| stabilizer | 0.2 | 9 | 1.00 |
| minor | 0.1 | 10 | 1.05 |

## Canonical Flow / Exercise Matching

```
User Input → Alias Resolver (aliases.yml) → canonical exercise_id
→ Custom YAML Lookup → Muscle Taxonomy → Coverage Rules → Program Rules
→ Workout Generation → wger Mapping → Export / Logging → History → Progression
```

Matching-Reihenfolge: exakte canonical ID → `aliases.yml` → deutscher Name →
englischer Name → Fuzzy → wger lokal → yuhonas. Bei Unklarheit: 2–3 Treffer mit
Confidence zurückgeben, nicht raten.

## Agent-Prioritäten / Nicht erlaubt

- Custom YAML gewinnt bei Trainingslogik — überschreibt wger bei Konflikt
- Stable canonical IDs — nie durch wger-IDs ersetzen
- Unsichere Mappings als `inferred: true` markieren, nie stillschweigend speichern
- Backup vor Writes auf user-owned YAMLs
- **Nicht erlaubt:** zufällige Übungsauswahl, wger blind vertrauen, canonical
  IDs löschen/durch wger-IDs ersetzen, YAMLs ohne Backup überschreiben,
  Trainingshistorie verlieren, Muskelbeteiligung binär bewerten
  (Stabilizer ≠ Primary), Schmerz ignorieren

---

## anatomy-kb (Git Subtree, `../../anatomy-kb/`, :9200)

Muskel-Anatomie-Layer der Ausbildung, eigene `CLAUDE.md` dort. Daten-Stack:

```
wger + yuhonas → kb/exercises/ (Base-Layer) → kb/anatomy_teaching/ (Teaching-Layer)
    ↑ push_to_teaching()
anatomy-kb/muscles/ (Muskel-Layer: origin, insertion, innervation)
    ↑ Gemini-Enrichment aus Ausbildungswissen
```

---

## Gemini-Fallstricke (`fitness/catalog/agent/gemini.py`)

1. API-Key aus `.env`/Shell-Env kann Anführungszeichen enthalten
   (`GEMINI_API_KEY="..."` → wörtlich mit Quotes übernommen ohne Strip) →
   "API key not valid".
2. `gemini-2.0-flash` hat auf manchen Keys Kontingent 0 (`RESOURCE_EXHAUSTED`)
   — `gemini-2.5-flash` (AlphaOS-Konvention, `~/.env/gemini.env: GEMINI_MODEL`)
   ist der richtige Default.

---

## Exercise-Enrichment (Gemini, Watcher)

Läuft als `fitness-enricher.service` (systemd --user, `python3 -m catalog
watch` → `api/watcher.py`). Beobachtet `runtime_root()/users/*/inbox/*.json`
(= `~/.aos/fitness/users/*/inbox/`). `~/.aos/users/<uid>/fitness` ist NUR ein
Symlink auf `~/.aos/fitness/users/<uid>` — beide Pfade sind dieselben Daten.
**Gotcha:** `Path.glob("**/...")` folgt in Python 3.13+ standardmäßig keinen
Symlinks — ein Scan über `~/.aos/users/` mit `**` findet deshalb nichts, über
den physischen `runtime_root()/users`-Pfad schon.

Nach Anreicherung schreibt der Watcher `status: 'ai_enriched'` + `enriched`
zurück ins ursprüngliche `fitness/{uid}/inbox/{doc_id}`-Dokument (sonst bleibt
die Coach-Inbox-UI für immer beim `pending_review`-Platzhalter hängen —
`approveInbox()` erwartet das `enriched`-Feld).

**Coach-Approval-Rückkanal:** `firestore/mirror.py` läuft als Daemon
(`fitness-firestore-daemon.service`, `on_snapshot`-basiert, Realtime-Push von
Google — kein Polling, kein Funnel nötig). Listener `on_kb_exercises` auf
`fitness/kb/exercises`: bei `ADDED`/`MODIFIED` mit `source == "approved"` wird
die Übung nach `kb/exercises/approved_from_firebase.yml` gemergt (per
`exercise_id`, keine Duplikate) und der zugehörige `kb/inbox/inbox_*.yml`-
Draft lokal gelöscht. `iter_catalog_yaml_files()` (`core/loader.py`) globbt
beim nächsten `fitness sync kb`-Push automatisch mit.

Vier Inbox-Ablageorte im Code (lokal `kb/inbox/*.yml`, Watcher-beobachteter
`~/.aos/fitness/users/*/inbox/`, Firestore `fitness/{uid}/inbox`-Collection,
`fitness/api/config.py::INBOX_DIR`) — Konsolidierung noch offen, bei Änderung
alle vier synchron halten.

---

## Datei-Backups & parallele Sessions

- Nach mehreren Edits an `kb/**/*.yml`: `find kb -name "*.bak" -delete` —
  Edits erzeugen wiederholt Backup-Dateien, vor jedem Commit aufräumen.
- Mehrere Claude-Sessions laufen praktisch immer parallel an diesem Repo
  (`ps aux | grep claude` zeigt üblicherweise mehrere Prozesse). Vor dem
  Anfassen gemeinsam genutzter Dateien (`kb/inbox_*.yml` etc.):
  `git log --oneline -5 -- <pfad>` prüfen — ein frischer Commit einer anderen
  Session ist kein Fehler.
