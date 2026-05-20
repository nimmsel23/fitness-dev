# Consolidation Report — fitness-dev

**Datum:** 2026-05-20  
**Scope:** ~/fitness-dev/ (read-only Analyse)  
**Zweck:** Single Source of Truth identifizieren, Duplikate dokumentieren, Empfehlungen geben

---

## 1. Was das System tatsächlich ist

Kein Fitness-Agent der gebaut werden muss — ein bestehendes System:

```
React/Vite App       (src/)
  ↓
Exercise Intelligence Layer  (catalog/)
  ↓
Python Runtime/Operator      (catalog/fitness_agent/)
  ↓
wger Backend                 (lokal, optional)
```

Reifegrad:
- App (React/Vite): 7/10 — Dashboard, Session, Learn, Muscles, WeeklyReview, BodyMap
- Exercise Intelligence Layer: 8/10 — 40 Übungen, 20 Anatomy-Teaching-YAMLs, Muscle-Taxonomy, Alias-System
- Python Agent: 7/10 — audit, coverage, doctor, planner, resolver, teaching, wger, obsidian
- Datenorganisation: 4/10 — **das ist der eigentliche Flaschenhals**

---

## 2. Das Duplikat-Problem

### 2a. Doppelte Verzeichnisstruktur

Jedes Datenverzeichnis existiert zweimal:

| Verzeichnis            | Dateien | Status              |
|------------------------|---------|---------------------|
| `catalog/exercises/`   | 6 YAMLs | **NEUER** (mehr Übungen) |
| `catalog/data/exercises/` | 6 YAMLs | canonical laut paths.py |
| `catalog/muscles/`     | 3 YAMLs | identisch            |
| `catalog/data/muscles/`   | 3 YAMLs | canonical laut paths.py |
| `catalog/maps/`        | 3 YAMLs | identisch            |
| `catalog/data/maps/`      | 3 YAMLs | canonical laut paths.py |
| `catalog/rules/`       | 3 YAMLs | identisch            |
| `catalog/data/rules/`     | 3 YAMLs | canonical laut paths.py |
| `catalog/anatomy_teaching/`      | 20 YAMLs | identisch (bis auf 1 fehlend) |
| `catalog/data/anatomy_teaching/` | 21 (20 YAMLs + 1 MD) | canonical laut paths.py |

**Kritisch:** `catalog/exercises/` ist NEUER als `catalog/data/exercises/`:
- `chest.yml`: catalog/ hat mehr Übungen (inkl. incline_dumbbell_press)
- `arms.yml`: catalog/ hat mehr Übungen (inkl. overhead_triceps_extension)
- `back.yml`: catalog/ hat mehr Übungen

Das heißt: der Agent liest via `paths.py → DATA_DIR` veraltete Daten, obwohl die neueren Daten in `catalog/exercises/` liegen.

### 2b. Root-Level Legacy-Dateien

Diese Dateien im `catalog/`-Root sind veraltete Vorläufer der Subdirectory-Struktur:

```
catalog/muscles.yaml            → abgelöst durch catalog/muscles/muscles.yml
catalog/program_rules.yaml      → abgelöst durch catalog/rules/program_rules.yml
catalog/body_highlighter_bridge.yml → abgelöst durch catalog/muscles/body_highlighter_bridge.yml
catalog/muscle_coverage_rules.yml   → abgelöst durch catalog/muscles/muscle_coverage_rules.yml
catalog/Top-Exercises-by-Muscle-Group.yaml  → unklar (kein Konsument bekannt)
```

### 2c. Sonstige Duplikat-Dateien

```
AGENT.md + AGENT.md.bak + AGENT2.md + AGENTS.md       → nur einer gültig?
ARCHITECTURE.md + ARCHITECTURE.md.bak
CLAUDE.md + CLAUDE.md.bak
VISION.md + VISION.md.bak
server.mjs + server.mjs.bak
vite.config.js + vite.config.js.bak
catalog/fitness_agent/resolver.py + resolver.py.bak
catalog/fitness_agent/history.py + history.py.bak
catalog/maps/wger_mapping.yml.bak
```

---

## 3. Was paths.py als canonical definiert

`catalog/fitness_agent/paths.py` Zeile 9:
```python
DATA_DIR = REPO_ROOT / "data"   # = catalog/data/
```

**Das ist die einzige Stelle im Code die entscheidet was der Agent liest.**

Alle `SEED_FILE_MAP`-Einträge zeigen auf `catalog/data/`.

Das bedeutet aktuell:
- Agent → liest `catalog/data/exercises/` (VERALTET)
- Mensch editiert → wahrscheinlich `catalog/exercises/` (AKTUELL)
- Divergenz wächst still

---

## 4. Welche Dateien Generated vs Owned sind

| Datei | Typ |
|-------|-----|
| `catalog/data/*` | **Source of Truth laut paths.py** — aber veraltet |
| `catalog/exercises/*` | Manuell gepflegt — aktueller Stand |
| `catalog/anatomy_teaching/*` | Manuell gepflegt — identisch mit data/ |
| `arena/dist/*` | Generated (Vite Build) — nicht editieren |
| `arena/public/data/anatomy.json` | Generated via `scripts/sync-data.mjs` |
| `arena/public/data/exercise-muscle-db.json` | Generated via `scripts/sync-data.mjs` |
| `catalog/fitness_agent/__pycache__/*` | Generated — in .gitignore |

---

## 5. Runtime vs Source Trennung

```
Source (Git):
  ~/fitness-dev/catalog/           ← Repo

Runtime (User):
  ~/.fitness-agent/                ← Bootstrap-Kopie der catalog/data/ Seed-Dateien
  ~/.aos/fitness/                  ← State, Exports (aus paths.py runtime_root())
```

Die Trennung ist konzeptionell klar — aber durch die Duplikate unklar welches `catalog/` der Seed ist.

---

## 6. Entscheidungspfad (was zu klären ist)

**Eine Entscheidung löst alles:**

> Ist `catalog/data/` oder `catalog/` (ohne data) der canonical Seed?

**Option A — `catalog/data/` bleibt canonical:**
- `catalog/exercises/` → in `catalog/data/exercises/` mergen (neuere Übungen rüberziehen)
- `catalog/exercises/`, `catalog/muscles/` etc. → löschen
- Root-Level `.yaml`-Dateien → löschen

**Option B — `catalog/` (flat, ohne data/) wird canonical:**
- `paths.py` Zeile 9 ändern: `DATA_DIR = REPO_ROOT` statt `REPO_ROOT / "data"`
- `catalog/data/` komplett löschen
- Root-Level `.yaml`-Dateien → löschen

**Empfehlung: Option A** — `catalog/data/` ist bereits dokumentiert in paths.py als Wahrheit, Bootstrap und Tests bauen darauf auf. Die neueren Übungen aus `catalog/exercises/` einmalig in `catalog/data/exercises/` mergen, dann `catalog/exercises/` entfernen.

---

## 7. Empfohlene Schritte (in dieser Reihenfolge)

1. **Entscheidung treffen** welche Option (A oder B)
2. **Diff klären**: `catalog/exercises/` vs `catalog/data/exercises/` — die Delta-Übungen prüfen und in canonical mergen
3. **Stale Duplikate entfernen**: `catalog/exercises/`, `catalog/muscles/`, `catalog/maps/`, `catalog/rules/`, `catalog/anatomy_teaching/` (das nicht-canonical Set)
4. **Root-Level Legacy bereinigen**: `muscles.yaml`, `program_rules.yaml`, `body_highlighter_bridge.yml`, `muscle_coverage_rules.yml`
5. **`.bak`-Dateien löschen** (alle — Backup-Zweck ist in Git)
6. **`anatomy-kb/` einordnen**: Die neuen bench_press/pull_up/squat/lunge/rdl YAMLs aus `~/anatomy-kb/exercises/` sind im anderen Schema (pro-Übung einzeln). Entweder als Ergänzung zu `catalog/data/anatomy_teaching/` mergen oder als separates Experiment belassen.

---

## 8. Was NICHT fehlt

- Kein neuer Agent nötig
- Keine neue Daten-Infrastruktur nötig
- Keine neue App-Architektur nötig

Was fehlt: **Klarheit welche Datei Wahrheit ist.**

---

## 9. Zusammenfassung

```
Engpass:     catalog/data/ (paths.py canonical) vs catalog/ (aktueller Inhalt)
Lösung:      Eine der beiden Strukturen auflösen — 30 Minuten Arbeit
Vorher:      Diff-Übungen aus catalog/exercises/ sichten und entscheiden ob behalten

Danach:
  catalog/data/    = einzige Wahrheit
  fitness_agent/   = liest daraus
  App (React)      = liest über server.mjs aus catalog/data/
  anatomy-kb/      = separates Experiment oder merge in catalog/data/anatomy_teaching/
```
