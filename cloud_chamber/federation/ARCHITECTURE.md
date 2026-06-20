# VitalOS — Architektur-Dokument

> **Zweck dieses Dokuments:** Definition von VitalOS als System + vollständige Inventur
> der bestehenden Apps + Design des zukünftigen vereinten Backends.
> Alles was hier steht ist entweder dokumentierter Ist-Zustand oder eine explizit
> getroffene Design-Entscheidung (→ DECISIONS.md).

---

## 0. Was ist VitalOS (VOS)?

VitalOS ist das eigenständige System für Körper, Gesundheit und Vitalität.
Es ist **kein Teil von AlphaOS** — es bedient sich dessen Philosophie,
teilt aber keine Services, Daten oder Abhängigkeiten.

### 0.1 Systemgrenze

```
AlphaOS (AOS)                    VitalOS (VOS)
─────────────────────────────    ─────────────────────────────────
Core4   (Habit/Domain Tracking)  Fitness  (Training, Anatomie, Katalog)
Door    (Wochenplanung)          Fuel     (Ernährung, Supplements)
Game    (Frame/Fire/Focus Maps)  Relax    (Physio, Regeneration)
Voice   (Session-Arbeit)         Habits   (VOS-eigener Habit Tracker)
Bridge  (API-Gateway)            Journal  (domain-übergreifendes Journal)
                                 VitalHub (gemeinsamer Einstieg)
```

Gleiche Philosophie — null gemeinsame Abhängigkeiten. (→ DECISIONS.md #000)

### 0.2 VOS Philosophie (von AOS übernommen)

- **Standalone:** Jede App hat eigenes Backend, eigenen Port, eigenen Deploy
- **Pillar-Struktur:** Fitness, Fuel, Relax als drei gleichwertige Tempel
- **Micro-App-Pattern:** Features die groß genug sind werden eigene Apps
- **Module Federation:** Apps als Vite Remotes, VitalHub als Host
- **`/opt/` Deploy:** systemd user-scope, 6xxx Ports, Tailscale-Funnel
- **`~/.aos/` Datenpfade:** VOS-eigene Unterordner, kein Overlap mit AOS

### 0.3 VOS App-Landschaft (Ziel)

| App | Domain | Dev-Port | Prod-Port | Status |
|-----|--------|----------|-----------|--------|
| fitness-dev | Training, Anatomie, Katalog | 9100 | 6100 | ✅ aktiv |
| fuel-dev | Ernährung, Supplements | 9000 | 7000 | ✅ aktiv |
| relax-dev | Physio, Regeneration | 9123 | TBD | ✅ aktiv |
| journal-dev | Journal + Habits (tägliches Check-in) | 9170 | 6170 | ⏳ geplant |
| vitals-hub | Gemeinsamer Einstieg | — | 6200 | ⏳ in Vorbereitung |

### 0.4 Was aus bestehenden Apps herausgelöst wird

fitness-dev enthält Features die zu groß für Side-Features sind:

| Feature | Aktuell | Ziel |
|---------|---------|------|
| Session + Coverage + Anatomie | fitness-dev | bleibt in fitness-dev |
| Dashboard + Weekly Review | fitness-dev | bleibt in fitness-dev |
| **Habits + Journal** | Tabs in fitness-dev | → journal-dev (ADR #009 + #010) |

fuel-dev:
| Feature | Aktuell | Ziel |
|---------|---------|------|
| Nutrition + Supplements | fuel-dev | bleibt in fuel-dev |
| **Journal** | `/nutrition/journal` in fuel-dev | → journal-dev (ADR #010) |

### 0.5 Datenpfade (VOS)

```
~/.aos/
  fitness/
    sessions/         — Training-Logs (JSON + SQLite)
    body/             — Körpermessungen
    plan.json         — Aktiver Trainingsplan
  fuel/
    nutrition/        — Tages-Ernährungslogs + SQLite
    supplements/      — Supplement-Logs
  journal/            — ⏳ unified (ersetzt fitness/journal/ + fuel/nutrition_journal/)
  habits/             — ⏳ VOS Habit-Daten (habits-dev)
  relax/              — ⏳ Physio-Daten (relax-dev)
```

---

## 1. Ist-Zustand: Zwei aktive Backends

### 1.1 fitness-dev Backend

**Framework:** Hono (`@hono/node-server`)  
**Port:** 9100 (dev), 6100 (prod `/opt/fitness/`)  
**Datei:** `~/fitness-dev/server.mjs`  
**Python Sidecar:** fitness_agent `:9120` (`catalog/fitness_agent/server.py`)

**Datenpfade:**
```
~/.aos/fitness/
  sessions/YYYY-MM-DD.json      — Session-Logs (SOT)
  sessions/training_history.sqlite — SQLite Mirror
  journal/YYYY-MM-DD.md         — Text-Notizen
  body/YYYY-MM-DD.json          — Körpermessungen
  plan.json                     — Aktiver Trainingsplan
  agent-state/                  — fitness_agent State
~/fitness-dev/catalog/kb/       — YAML Knowledge Base
  exercises/*.yml               — Exercise-Definitionen
  anatomy_teaching/*.yml        — Anatomie-Lehr-Layer
  maps/                         — Aliases, wger-Mapping, yuhonas-Mapping
  muscles/                      — Muskel-Taxonomie + Coverage-Rules
  rules/                        — Programm-, Progressions-, Safety-Regeln
```

**Vollständige Route-Liste:**
```
GET  /health
GET  /exercises/search?q=
GET  /exercises/by-group
GET  /exercise/:id/teaching
GET  /fitness/plan?template=&split=
GET  /fitness/weekly?week=
POST /fitness/export
GET  /fitness/body?date=
POST /fitness/body
GET  /fitness/clients
GET  /fitness/inbox
POST /fitness/inbox/:id/approve
DEL  /fitness/inbox/:id
GET  /fitness/config
GET  /fitness/search?q=
GET  /fitness/exercises/all
GET  /fitness/muscles
GET  /fitness/muscles/:id
GET  /habitsync/habits
POST /habitsync/record/:uuid
POST /habitsync/add
DEL  /habitsync/delete/:uuid
GET  /plan/today
GET  /blocks
GET  /session?date=&id=
GET  /sessions?date=
POST /session?date=&id=
DEL  /session?date=&id=
GET  /session/history?limit=
GET  /session/latest
GET  /journal?date=
POST /journal
GET  /journal/list
GET  /coverage/detailed?days=
GET  /coverage/anatomy
GET  /coverage/gaps
GET  /export/csv
GET  /export/pflichtaufgabe
GET  /theme
POST /theme
GET  /firestore/status
POST /firestore/sync
```

**Externe Abhängigkeiten:**
- wger lokal `:8000` — Exercise Master Data
- yuhonas (free-exercise-db) — Bilder + Varianten
- fitness_agent Python `:9120` — Catalog-Operationen
- Firebase Admin SDK — Firestore Sync (Creds: `~/.env/firebase-fitness.json`)
- HabitSync `:6842` — Proxy

**Dual-Write Pattern:**
`POST /session` → JSON File + SQLite synchron → Firestore fire-and-forget

---

### 1.2 fuel-dev Backend

**Framework:** Fastify  
**Port:** 9000 (dev), 7000 (prod `/opt/fuel/`)  
**Datei:** `~/fuel-dev/src/server/app.mjs`  
**Entry:** `~/fuel-dev/src/server/server.mjs`

**Datenpfade:**
```
~/.aos/fuel/
  nutrition/YYYY-MM-DD.json         — Tages-Ernährungslog
  nutrition/nutrition.db            — SQLite
  nutrition_journal/YYYY-MM-DD.md   — Text-Notizen
  supplements/logs/YYYY-MM-DD.json  — Supplement-Logs
  supplements/                      — Supplement-Daten
  users/<firebase_uid>/             — Multi-Tenant Datenpfad (Klienten)
~/fuel-dev/catalogs/
  nutrition/meals/                  — YAML Mahlzeit-Kataloge (Repo-basiert)
  supplements/catalog.yaml          — Supplement-Katalog
~/vital/Klienten/<clientId>/
  client.json                       — Klienten-Metadaten (firebase_uid, etc.)
```

**Vollständige Route-Liste:**
```
GET  /health
GET  /nutrition/log?date=
POST /nutrition/log          — { date, meal } | { catalog_item_id } | { delete_meal_id } | { water_ml }
PATCH /nutrition/log         — { date, meal_id, meal, new_date? }
GET  /nutrition/catalog
POST /nutrition/catalog      — { item }
DEL  /nutrition/catalog/:id
GET  /nutrition/search?q=&limit=
GET  /nutrition/journal?date=
POST /nutrition/journal      — { date, content }
GET  /nutrition/daily?date=
GET  /nutrition/weekly/:year/:week
POST /nutrition/compose      — Mahlzeit aus Komponenten berechnen
POST /nutrition/estimate     — Gemini: Freitext → Makros
POST /nutrition/ai-log       — AI-gesteuertes Logging
GET  /supplements/catalog
POST /supplements/catalog    — { name, unit, default_dose, ... }
GET  /supplements/log?date=
POST /supplements/log        — { date, intake } | { date, delete_id }
POST /supplements/estimate   — Supplement-Schätzung via AI
GET  /fuel/log?date=         — Legacy-Redirect → /nutrition/log
POST /fuel/log               — Legacy-Redirect → /nutrition/log
```

**Services (14 Dateien in `src/server/services/`):**
```
fuel-log.mjs              — Legacy Fuel-Log Kompatibilität
gemini.mjs                — Gemini API Client (GEMINI_API_KEY aus ~/.env/fuel.env)
nutrition-catalog.mjs     — Katalog CRUD (YAML-basiert)
nutrition-compose.mjs     — Zusammengesetztes Mahlzeit-Berechnung
nutrition-db.mjs          — SQLite-Layer (nutrition.db)
nutrition-estimate-micros.mjs — Mikronährstoff-Schätzung
nutrition-estimate.mjs    — Gemini Makro-Schätzung aus Freitext
nutrition-journal.mjs     — Journal CRUD
nutrition-log.mjs         — Tages-Log CRUD (JSON + SQLite dual-write)
nutrition-micros.mjs      — Mikronährstoff-Aggregation
nutrition-search.mjs      — OpenFoodFacts + lokaler Katalog-Search
supplements-catalog.mjs   — Supplement-Katalog CRUD
supplements-log.mjs       — Supplement-Log CRUD
wger-search.mjs           — wger Exercise-Search (für Kontext)
```

**Externe Abhängigkeiten:**
- OpenFoodFacts API — Produkt-Suche
- Gemini API — Makro-/Supplement-Schätzung (`~/.env/fuel.env`)
- wger lokal `:8000` — Exercise-Search (Kontext)
- Firebase Firestore — via Bridge-Ping (`:9080/api/fuel-firestore/ping`)
- Klienten-Registry — `~/vital/Klienten/` (vital-Projekt)

**Multi-Tenant Pattern:**
URL-Prefix `/c/<clientId>/` → `normalizeRoutedPath()` → `getPaths(clientId)` → andere `baseDir`

**Startup-Sync:**
Server zieht beim Start Daten von Firestore via Bridge-Ping (fire-and-forget, 5s timeout)

---

## 2. Was beide teilen

| Aspekt | fitness-dev | fuel-dev | Gemeinsam |
|--------|-------------|----------|-----------|
| Datenformat | JSON Files + SQLite | JSON Files + SQLite | ✅ `~/.aos/` Basis |
| YAML Catalogs | `catalog/kb/` | `catalogs/` | ✅ YAML als SOT |
| Gemini | via Python fitness_agent | direkt in Node (gemini.mjs) | ✅ gleicher Key |
| wger | vollständig integriert | nur Search | teilweise |
| Firebase | firebase-admin (sync) | Bridge-Ping (sync) | ✅ Firestore als Cloud-Layer |
| Auth | kein Auth-Gate (lokal) | kein Auth-Gate (lokal) | ✅ lokal = kein Auth |
| Zod Validation | fitness_agent (Python) | Fastify-Routen | verschieden |
| Framework | Hono | Fastify | verschieden |
| Port-Konvention | 9100/6100 | 9000/7000 | beide in AOS-Range |

---

## 3. Zukünftiges Backend — Design

### 3.1 Ziel

Ein einziges Node.js-Backend das beide Domains bedient:

```
unified-server (Port: 9200 dev / 6200 prod)
├── /session/*          — Fitness-Domain (aus fitness-dev)
├── /exercise/*         — Fitness-Domain
├── /coverage/*         — Fitness-Domain
├── /fitness/*          — Fitness-Domain
├── /nutrition/*        — Fuel-Domain (aus fuel-dev)
├── /supplements/*      — Fuel-Domain
├── /journal/*          — beide Domains (unified)
├── /body/*             — Fitness + Fuel (Körper-Daten)
├── /health             — unified health-check
└── /api/vitals/*       — zukünftig: aggregierte Vitaldaten
```

### 3.2 Framework-Entscheidung (offen)

→ Siehe `DECISIONS.md` #001

Kandidaten:
- **Hono** (fitness-dev Standard) — moderner, leichter, TypeScript-first
- **Fastify** (fuel-dev Standard) — reiferes Plugin-Ecosystem, Zod-Integration besser

### 3.3 Datenpfad-Strategie

```
~/.aos/
  fitness/sessions/     — bleibt (fitness-dev kompatibel)
  fitness/journal/      — bleibt
  fitness/body/         — bleibt
  fuel/nutrition/       — bleibt (fuel-dev kompatibel)
  fuel/supplements/     — bleibt
  fuel/nutrition_journal/ — migriert → fuel/journal/ (sync mit fitness)
```

Beide Domains schreiben in ihre eigenen Unterordner — keine Migration nötig.

### 3.4 Catalog-Strategie

```
unified-catalog/
  fitness/kb/           — Symlink → ~/fitness-dev/catalog/kb/
  nutrition/meals/      — Symlink → ~/fuel-dev/catalogs/nutrition/meals/
  nutrition/supplements/ — Symlink → ~/fuel-dev/catalogs/supplements/
```

Catalogs bleiben in ihren Repos bis zur vollständigen Vereinigung.

### 3.5 Frontend @db Adapter

Siehe `DECISIONS.md` #002 — Adapter-Pattern ersetzt sowohl den Alias-Switch
von fitness-dev als auch den `isCloud()` hostname-check von fuel-dev.

```
src/lib/db/
  adapter.js      ← VITE_DATA_LAYER env var → wählt Implementation
  local.js        ← HTTP → unified-server
  firestore.js    ← direkte Firebase SDK
```

### 3.6 Python Sidecar

`fitness_agent` (:9120) bleibt als eigenständiger Sidecar bestehen.
Der unified-server proxied `/agent/*` oder ruft ihn intern auf.
Kein Merge in Node — Python bleibt für AI-intensive Catalog-Operationen.

### 3.7 Multi-Tenant (fuel-dev Klienten-Feature)

Das `/c/<clientId>/` Pattern von fuel-dev wird übernommen.
fitness-dev kennt es aktuell nicht — Entscheidung: unified-server bekommt
optionales clientId-Routing als Middleware, fitness-Domain ignoriert es standardmäßig.

---

## 4. Migrations-Roadmap

```
Phase 1 (jetzt)     — Inventur + Module Federation Setup (cloud_chamber/federation/)
Phase 2             — Unified-Backend Skeleton in cloud_chamber/federation/backend/
Phase 3             — Route-by-Route Migration (nutrition zuerst, dann fitness)
Phase 4             — Frontend @db Adapter (beide Apps teilen einen Data Layer)
Phase 5             — Einzelner Deploy-Prozess, einzelner Port
```

---

## 5. Was NICHT verloren gehen darf

Von **fuel-dev:**
- Multi-Tenant Klienten-Routing (`/c/<clientId>/`)
- Gemini-Schätzung (Freitext → Makros, Supplement-Schätzung)
- OpenFoodFacts Integration
- Zod-Validation auf Route-Level
- Supplement-Tracking komplett (Katalog + Logs + Schätzung)
- Legacy `/fuel/log` Redirect-Kompatibilität
- Firestore Startup-Pull

Von **fitness-dev:**
- Exercise-Catalog (YAML KB) mit Alias-Resolver
- Anatomy-Teaching Layer (catalog/kb/anatomy_teaching/)
- coverage_score Berechnung (primary/secondary/stabilizer)
- Python fitness_agent Sidecar Architektur
- Dual-Write Session (JSON + SQLite synchron)
- wger vollständige Integration (nicht nur Search)
- yuhonas Integration
- HabitSync Proxy
- PWA Offline-Queue + Service Worker
- Firebase Firestore Sync (nicht nur Bridge-Ping)
