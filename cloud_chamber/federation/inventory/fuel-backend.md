# Inventur: fuel-dev Backend

> Stand: 2026-06-20  
> Quelle: `~/fuel-dev/src/server/`  
> Zweck: Vollständige Erfassung aller Assets die in den unified-server überführt werden müssen.

---

## Verzeichnisstruktur

```
fuel-dev/src/server/
├── app.mjs                          — Fastify App-Factory + Startup-Pull
├── config/
│   └── paths.mjs                    — Datenpfade, Multi-Tenant getPaths()
├── lib/
│   ├── client-manager.mjs           — Klienten-Registry (~/vital/Klienten/)
│   └── file-io.mjs                  — readJsonFile, writeJsonFile, readYamlFile, writeYamlFile
├── routes/
│   ├── health.mjs                   — GET /health
│   ├── static.mjs                   — Static File Serving (catch-all)
│   ├── fuel.mjs                     — Legacy /fuel/* Redirects
│   ├── supplement-estimate.mjs      — POST /supplements/estimate
│   ├── supplements.mjs              — CRUD /supplements/*
│   └── nutrition/
│       ├── index.mjs                — Route-Registrierung
│       ├── catalog.mjs              — GET/POST/DEL /nutrition/catalog
│       ├── log.mjs                  — GET/POST/PATCH /nutrition/log (Zod-validiert)
│       ├── journal.mjs              — GET/POST /nutrition/journal
│       ├── compose.mjs              — POST /nutrition/compose
│       ├── daily.mjs                — GET /nutrition/daily
│       ├── weekly.mjs               — GET /nutrition/weekly/:year/:week
│       ├── estimate.mjs             — POST /nutrition/estimate (Gemini)
│       └── ai-log.mjs               — POST /nutrition/ai-log
└── services/
    ├── fuel-log.mjs                 — Legacy Fuel-Log-Kompatibilität
    ├── gemini.mjs                   — Gemini API Client
    ├── nutrition-catalog.mjs        — Katalog CRUD + addOrUpdateItem
    ├── nutrition-compose.mjs        — Makro-Aggregation aus Komponenten
    ├── nutrition-db.mjs             — SQLite-Layer (nutrition.db)
    ├── nutrition-estimate-micros.mjs— Mikronährstoff-Schätzung
    ├── nutrition-estimate.mjs       — Freitext → Makros via Gemini
    ├── nutrition-journal.mjs        — Journal CRUD
    ├── nutrition-log.mjs            — Tages-Log CRUD (JSON-basiert)
    ├── nutrition-micros.mjs         — Mikronährstoff-Aggregation
    ├── nutrition-search.mjs         — OpenFoodFacts + Katalog-Search
    ├── supplements-catalog.mjs      — Supplement-Katalog CRUD (YAML)
    ├── supplements-log.mjs          — Supplement-Log CRUD (JSON)
    └── wger-search.mjs              — wger Exercise-Search
```

## Shared Utils (`fuel-dev/src/shared/`)

```
shared/
  config/
    constants.mjs     — PORT, HOST, MIME_TYPES, WGER_API_URL, OFF_API_URL, GEMINI_*
  utils/
    ids.mjs           — ID-Generierung
    utils.js          — sumMetric, formatMetric, normalizeSupplementUnit
    validation.mjs    — isISODate, todayISO, normalizeRoutedPath
```

## Catalogs (`fuel-dev/catalogs/`)

```
catalogs/
  nutrition/meals/    — YAML Mahlzeit-Definitionen (Repo-basiert, kein ~/.aos/)
  supplements/
    catalog.yaml      — Supplement-Katalog (Name, Unit, Default-Dose)
```

## Umgebungsvariablen

| Variable | Default | Quelle |
|----------|---------|--------|
| `PORT` | 9000 | constants.mjs |
| `HOST` | 127.0.0.1 | constants.mjs |
| `GEMINI_API_KEY` | — | `~/.env/fuel.env` |
| `GEMINI_MODEL` | gemini-flash-latest | `~/.env/fuel.env` |
| `AOS_FUEL_DATA_DIR` | `~/.aos/fuel` | paths.mjs |
| `FUEL_BUILD_DIR` | `fuel-dev/dist` | paths.mjs |
| `FUEL_STATIC_DIR` | `FUEL_BUILD_DIR` | paths.mjs |
| `FUEL_FIRESTORE_PING_URL` | `http://127.0.0.1:9080/api/fuel-firestore/ping` | app.mjs |
| `FUEL_CLOUD_UID` | "default" | app.mjs |
| `WGER_API_TOKEN` | hardcoded fallback | constants.mjs |

## Key Patterns

### Multi-Tenant URL Routing
```
/c/<clientId>/nutrition/log  →  normalizeRoutedPath()  →  /nutrition/log
                                req.clientId = clientId
                                req.paths = getPaths(clientId)
                                req.uid = firebase_uid || "default"
```

### Dual-Write (Log)
`POST /nutrition/log` → JSON File (`~/.aos/fuel/nutrition/YYYY-MM-DD.json`) +
SQLite (`nutrition.db`) via `nutrition-db.mjs`

### Firestore Sync
- Start: `pullFromFirestoreOnStart()` → Bridge-Ping `:9080/api/fuel-firestore/ping`
- On Write: `fireSyncPing()` in supplements-Route (fire-and-forget, 3s timeout)
- Frontend Cloud-Modus: direkter Firestore SDK Zugriff (kein Server)

### Zod-Validation
Jede POST/PATCH Route hat eigenes Zod-Schema, `safeParse()` vor Handler.

## Was in den unified-server muss

**Unbedingt:**
- Alle 14 Services (vollständig, unverändert)
- `/c/<clientId>/` Multi-Tenant Middleware
- Zod-Validation auf Route-Level
- OpenFoodFacts Search
- Gemini Makro-Schätzung (Echtzeit, in Node)
- Supplement-Tracking (Katalog + Logs + Schätzung)
- Legacy `/fuel/log` Redirect

**Pfade bereinigen:**
- `nutrition_journal/` → könnte zu `nutrition/journal/` werden (DECISION nötig)
- Catalogs: Symlink-Strategie (→ ARCHITECTURE.md §3.4)
