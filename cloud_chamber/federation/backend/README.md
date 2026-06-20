# Unified Backend — Arbeitsverzeichnis

> Hier entsteht der unified-server. Noch leer — wird Route für Route befüllt.
> Keine Datei hier ist "fertig" bevor sie in ARCHITECTURE.md + DECISIONS.md dokumentiert ist.

## Status

⏳ Wartet auf Framework-Entscheidung (DECISIONS.md #001)

## Geplante Struktur

```
backend/
  server.mjs              ← Entry Point (Port: 9150 dev)
  config/
    paths.mjs             ← Unified Datenpfade (~/.aos/fitness/ + ~/.aos/fuel/)
    constants.mjs         ← Ports, Umgebungsvariablen, MIME-Types
  lib/
    file-io.mjs           ← readJsonFile, writeJsonFile, readYamlFile (aus fuel-dev)
    sqlite.mjs            ← SQLite-Setup (fitness + nutrition DBs)
    gemini.mjs            ← Gemini API Client (aus fuel-dev)
    firestore.mjs         ← Firebase Admin Setup (aus fitness-dev)
    client-manager.mjs    ← Multi-Tenant (aus fuel-dev)
  middleware/
    tenant.mjs            ← /c/<clientId>/ Routing (aus fuel-dev)
    paths.mjs             ← req.paths inject
  routes/
    health.mjs
    fitness/
      sessions.mjs
      exercises.mjs
      coverage.mjs
      journal.mjs
      body.mjs
      export.mjs
      plan.mjs
      inbox.mjs
    nutrition/
      log.mjs
      catalog.mjs
      journal.mjs
      search.mjs
      estimate.mjs        ← Gemini Makro-Schätzung
      weekly.mjs
      compose.mjs
    supplements/
      catalog.mjs
      log.mjs
      estimate.mjs
    habitsync/
      proxy.mjs           ← Proxy → :6842
    firestore/
      sync.mjs
    theme.mjs
    legacy/
      fuel.mjs            ← /fuel/* Redirects
  services/
    [aus fuel-dev übernehmen, minimal anpassen]
```

## Deployment-Optionen (dokumentiert, noch nicht entschieden)

### Option A: /opt/ (lokal, wie bestehende Services)
```
/opt/vitals/              ← Vite-Build Output
vitals.service            ← systemd user-scope
Port: 6150
```
Gleiche Struktur wie `core4.service` (:6728), `door.service` (:6400), `game.service` (:6500).
Kein Firebase nötig. Lokal + Tailscale-Funnel für Mobile-Zugriff.

### Option B: Firebase Hosting + Module Federation Remote
```
fitness-aos.web.app       ← Host (fitness-dev)
fuel-aos.web.app/...      ← Remote (fuel-dev Komponenten)
```
Firestore als Datenlayer, kein lokaler Node-Server für Cloud-User.

### Option C: Hybrid (empfohlen für Übergangsphase)
```
/opt/vitals/ (lokal)  ←→  Firestore (Cloud-Sync)
```
Coach-Maschine nutzt `/opt/vitals/`, Mobile/Klienten nutzen Firebase PWA.
Unified-Server schreibt dual (lokal + Firestore). Entspricht dem bestehenden
fitness-dev + fuel-dev Pattern — nur vereint.

**Tendenz:** Option C — entspricht dem AlphaOS-Prinzip (alles läuft standalone,
Cloud ist Sync-Layer nicht Abhängigkeit).
