# Architecture Decision Records (ADR)

Jede Entscheidung wird hier dokumentiert: was wurde entschieden, welche Alternativen
wurden verworfen, und warum. Offene Entscheidungen sind mit ⏳ markiert.

Format:
```
## #NNN Titel
Status: ✅ Entschieden | ⏳ Offen | ❌ Verworfen
Datum:  YYYY-MM-DD
```

---

## #000 AOS vs. VOS — Systemgrenze (nicht verhandelbar)

**Status:** ✅ Entschieden  
**Datum:** 2026-06-20

**Regel:** AlphaOS (AOS) und VitalOS (VOS) werden niemals vermischt.
Keine VOS-App hängt von AOS-Services ab (Core4, Bridge, Door, Game, Voice).
Keine AOS-App hängt von VOS-Services ab.

**Was das bedeutet:**
- Habits wandern NICHT in Core4, auch wenn Core4 Habit-artige Events trackt
- Journal wird NICHT an AOS-Bridge angebunden
- VOS hat keinen Zugriff auf `~/.aos/core4/`, `~/.aos/fire/`, `~/.task`
- AOS hat keinen Zugriff auf `~/.aos/fitness/`, `~/.aos/fuel/`

**Was erlaubt ist:**
VOS bedient sich der **Philosophie** von AOS:
- Standalone-Prinzip: jede App hat eigenes Backend, eigenen Port
- Pillar-Struktur: Fitness, Fuel, Relax als eigenständige Tempel
- Micro-App-Pattern: Features die groß genug sind werden eigene Apps (Journal, Habits)
- Module Federation: Apps als Remotes, Hub als Host
- `/opt/` Deploy-Konvention, systemd user-scope, 6xxx Ports

**Trennlinie:**
```
AlphaOS (AOS)          VitalOS (VOS)
────────────────────   ─────────────────────────
Core4    :6728/8728    Fitness   :6100
Door     :6400         Fuel      :7000
Game     :6500         Relax     :?
Bridge   :9080         Habits    :?
                       Journal   :?
                       VitalHub  :6200
```

Gleiche Architektur-Philosophie. Null gemeinsame Abhängigkeiten.

---

## #001 Backend-Framework: Hono

**Status:** ✅ Entschieden  
**Datum:** 2026-06-20

**Entscheidung:** **Hono** (`@hono/node-server`) ist das VOS-Standard-Framework.
Gilt für: unified-server, habits-dev, journal-dev und alle zukünftigen VOS-Backends.

**Begründung:**
- fitness-dev (größtes bestehendes Backend, 40+ Routen) läuft bereits auf Hono
- fuel-dev wird migriert — Fastify's `app.register()` ist bequem, aber kein Blocker
- Route-Modularisierung in Hono: exportierte Handler-Funktionen pro Modul, manuell registriert
- Konsistenz im VOS-Stack wichtiger als Fastify-Komfort in einem einzelnen Backend
- Neue Apps (habits-dev, journal-dev) starten direkt auf Hono — kein Legacy-Overhead

**Was das bedeutet:**
- fuel-dev's 14 Services (`nutrition-*.mjs`, `supplements-*.mjs`) werden 1:1 übernommen,
  nur Route-Registration von `app.register()` auf Hono-Style umgestellt
- Zod-Validation bleibt — Hono hat keinen nativen Zod-Provider, wird manuell eingebunden
  (`zod.safeParse()` vor Handler, wie in fuel-dev bereits genutzt)

**Verworfen:** Fastify — trotz cleanerem Plugin-System zu viel Migrations-Overhead
wenn fitness-dev (Hono) die größere Codebasis ist.

---

## #002 Frontend Data Layer: @db Adapter-Pattern

**Status:** ✅ Entschieden  
**Datum:** 2026-06-20

**Frage:** Wie wählt der Frontend-Code zwischen lokalem Backend und Firestore?

**Ist-Zustand:**
- fitness-dev: Build-Zeit Vite-Alias-Switch (`@db` → `db.js` | `db.firestore.js`)
- fuel-dev: Runtime `isCloud()` hostname-check in jeder API-Funktion

**Probleme:**
- fuel-dev: Branching in jeder Funktion, hostname-Detection fragil
- fitness-dev: kein Runtime-Fallback, kein `auto`-Modus

**Entscheidung:** Adapter-Pattern mit `VITE_DATA_LAYER` env var

```
src/lib/db/
  adapter.js    ← einziger Entscheidungspunkt: VITE_DATA_LAYER
  local.js      ← alle HTTP-Calls → unified-server
  firestore.js  ← direkte Firebase SDK
```

`adapter.js`:
```js
const mode = import.meta.env.VITE_DATA_LAYER ?? 'local'
export * from mode === 'firebase'
  ? './firestore.js'
  : mode === 'auto'
    ? await detectRuntime()   // hostname-check als Fallback
    : './local.js'
```

Build-Targets:
- `VITE_DATA_LAYER=local` — Coach/lokal, unified-server
- `VITE_DATA_LAYER=firebase` — Cloud-PWA, direkte Firestore SDK
- `VITE_DATA_LAYER=auto` — Übergangsphase, runtime detection

**Vorteil:** Kein `if (isCloud())` in Funktions-Bodies, Vite tree-shakt
ungenutzten Layer raus, ein einziger Ort für die Konfiguration.

---

## #003 Module Federation: Technologie-Wahl

**Status:** ✅ Entschieden  
**Datum:** 2026-06-20

**Entscheidung:** `@originjs/vite-plugin-federation`

**Begründung:**
- Beide Apps nutzen Vite 5.4.x — kompatibel
- Kein Webpack-Overhead
- fuel-dev als Remote, fitness-dev als Host
- Shared: react, react-dom, lucide-react (Singletons)
- fuel-spezifische Deps (tanstack-query, zustand, framer-motion) bundled im Remote

**Limitierung:** Module Federation erfordert `target: 'esnext'` — IE11/ältere Browser
nicht unterstützt (für unseren Use Case irrelevant).

---

## #004 Datenpfade: Kein Merge, Symlinks

**Status:** ✅ Entschieden  
**Datum:** 2026-06-20

**Frage:** Sollen `~/.aos/fitness/` und `~/.aos/fuel/` zu `~/.aos/vitals/` zusammengeführt werden?

**Entscheidung:** Nein — beide Pfade bleiben unangetastet.

**Begründung:**
- Keine Migration bestehender Daten nötig
- Beide Backends bleiben parallel lauffähig während der Transition
- Unified-Server liest beide Pfade direkt
- Kein Datenverlustrisiko

**Zukunft:** Wenn unified-server stabil ist, kann eine optionale Migration
`~/.aos/fuel/` → `~/.aos/nutrition/` angeboten werden — aber nicht erzwungen.

---

## #005 Python catalog: Bleibt Sidecar

**Status:** ✅ Entschieden  
**Datum:** 2026-06-20

**Frage:** Wird catalog in Node.js neu geschrieben oder bleibt er Python?

**Entscheidung:** Bleibt Python-Sidecar auf :9120.

**Begründung:**
- AI-intensive Operationen (Gemini, YAML-Enrichment, Coverage-Analyse) sind in Python
  idiomatischer (pandas, PyYAML, typer)
- Catalog-Audit-Logik ist umfangreich und bereits getestet (pytest-Suite)
- Neu schreiben bringt keinen Mehrwert

**Unified-Server Verhalten:** Proxied `/agent/*` → catalog `:9120`
oder ruft ihn intern via HTTP auf. Keine direkte Integration.

---

## #006 Port-Tabelle VOS

**Status:** ✅ Entschieden  
**Datum:** 2026-06-20

**Entscheidung:** Unified-Server bekommt eigenen Port (9150/6150), bestehende
Backends bleiben während der Migration parallel erreichbar.

| App | Dev-Port | Prod-Port | Notiz |
|-----|----------|-----------|-------|
| fitness-dev | 9100 | 6100 | bestehend, bleibt während Migration |
| fuel-dev | 9000 | 7000 | bestehend, bleibt während Migration |
| relax-dev | 9123 | TBD | bestehend |
| **unified-server** | **9150** | **6150** | neu, ersetzt 9100+9000 langfristig |
| journal-dev | 9170 | 6170 | Journal + Habits (→ ADR #010) |
| VitalHub | — | 6200 | statisch, nur Serving (→ ADR #008) |
| catalog | 9120 | — | Python Sidecar, nur localhost |
| HabitSync | 6842 | 6842 | Docker, bestehend |

**Begründung 9150/6150:**
- Kein Konflikt mit bestehenden Services
- Während Migration: 9100 (fitness) + 9000 (fuel) + 9150 (unified) parallel lauffähig
- Pattern: neue VOS-Apps in 916x/617x Range, Abstand zu bestehenden

---

## #007 Gemini Integration: Hybrid

**Status:** ✅ Entschieden  
**Datum:** 2026-06-20

**Entscheidung:** Hybrid (Option C) — Echtzeit-Schätzung in Node, Catalog-Enrichment in Python.

| Use Case | Wo | Begründung |
|----------|-----|-----------|
| Makro-Schätzung aus Freitext | Node (`gemini.mjs`) | Echtzeit, <2s erwartet |
| Supplement-Schätzung | Node (`gemini.mjs`) | Echtzeit |
| Anatomy-YAML Enrichment | Python (catalog) | Darf langsam sein, braucht pandas/PyYAML |
| Catalog-Audit + Gap-Finding | Python (catalog) | Batch, nicht Echtzeit |

**Konsequenz:** `gemini.mjs` aus fuel-dev wird 1:1 in unified-server übernommen.
Python-Sidecar bleibt für Catalog-Operationen (ADR #005 bestätigt).

---

## #008 Deployment-Stufenplan: /opt/vitals/ → Module Federation → Firebase

**Status:** ✅ Entschieden  
**Datum:** 2026-06-20

**Ziel (unveränderlich):** Module Federation — fuel-dev als Vite Remote, fitness-dev als
Host, fuel's UI als echter eingebetteter Tab in fitness-dev. Firebase Hosting als
Cloud-Deployment (fuel-aos.web.app als Remote-URL).

**Stufe 1 — /opt/vitals/ (Zwischenschritt, NICHT das Ziel):**

Drei separate SPAs hinter einem gemeinsamen Einstiegspunkt. Kein echter Tab-Embed —
fuel läuft weiterhin als eigenständige SPA unter `/fuel/`, nicht als Komponente in fitness.

```
/opt/vitals/
  server.mjs        ← Hono Hub-Server (Port 6200)
  fitness/          ← fitness-dev/dist-vitals/ (base: /fitness/)
  fuel/             ← fuel-dev/dist-vitals/    (base: /fuel/)
  relax/            ← relax-dev/dist-vitals/   (base: /relax/)
```

Zweck: sofort nutzbarer gemeinsamer Einstieg, lokales Deployment ohne Cloud-Abhängigkeit,
während Module Federation noch nicht aktiviert ist.

**Stufe 2 — Module Federation (das eigentliche Ziel):**

```
fitness-dev (Host)
  └── /fuel Tab → lazy import('fuel/FuelApp')   ← echter React-Embed
      FuelApp.jsx (in cloud_chamber/federation/) ← bereits vorhanden
      FuelTab.jsx (in cloud_chamber/federation/) ← bereits vorhanden
```

Deployment lokal: fuel-dev baut `dist-federation/`, fitness-dev konsumiert
`remoteEntry.js` von dort.

**Stufe 3 — Firebase Hosting:**

```
fitness-aos.web.app  ← Host-Build
fuel-aos.web.app     ← Remote-Build (remoteEntry.js öffentlich erreichbar)
```

`fitness.host.vite.config.js` → `remotes.fuel` auf Firebase URL umstellen.

**Was /opt/vitals/ NICHT ist:**
- Kein Ersatz für Module Federation
- Kein unified Frontend (drei SPAs, nicht eine)
- Kein finales Deployment-Ziel

**Reihenfolge:**
```
Jetzt:       /opt/vitals/ Hub (Stufe 1) — drei SPAs, ein Port
Nächstes:    Module Federation aktivieren (Stufe 2) — echter Tab-Embed
Langfristig: Firebase Hosting (Stufe 3) — Cloud-Deploy
```

---

## #009 Habits → Feature in journal-dev ❌ nicht eigenständige App

**Status:** ✅ Revidiert (ersetzt durch ADR #010)  
**Datum:** 2026-06-20 → revidiert 2026-06-20

**Ursprüngliche Entscheidung:** Habits als eigenständige VOS Micro-App.

**Revision:** Habits ist ein **Feature von journal-dev**, keine eigene App.

**Begründung:**
- Habits und Journal sind dasselbe tägliche Check-in:
  "Was habe ich gemacht?" (Habits) + "Wie war es?" (Journal) gehören zusammen
- Habit-Tracking ohne Reflexion ist bloßes Abhaken — das Journal gibt Kontext
- Die bestehende `HabitJournalModal`-Komponente in fitness-dev zeigt: die Verbindung
  ist bereits im aktuellen Code angelegt
- Weniger Apps = weniger Overhead, journal-dev wird dadurch vollständiger

**Was journal-dev damit enthält:** → ADR #010

---

## #010 journal-dev — Journal + Habits als unified Daily App

**Status:** ✅ Entschieden  
**Datum:** 2026-06-20

**Entscheidung:** journal-dev ist die unified tägliche Reflexions-App für VOS.
Sie enthält **Journal + Habits** als zwei Seiten derselben Sache.

**Was journal-dev enthält:**

| Feature | Herkunft | Beschreibung |
|---------|----------|-------------|
| Journal-Einträge | fitness-dev + fuel-dev | Markdown, Datums-Navigation, History |
| Habit-Tracking | fitness-dev (HabitSync) | Check-In, 28-Tage-Rolling, Stats |
| Habit-Journal | fitness-dev (HabitJournalModal) | Bereits verknüpft im bestehenden Code |
| Domain-Tags | neu | Einträge als fitness / fuel / relax / allgemein tagbar |

**Was NICHT passiert:**
- Kein Verbleib in fitness-dev oder fuel-dev
- Keine Integration in AOS (ADR #000)
- Keine separate habits-dev App (ADR #009)

**Ziel-Architektur:**
```
journal-dev
  Frontend (React + Vite)       — Module Federation Remote → VitalHub Tab
  Backend (Node.js, Hono)       — Port 9170 dev / 6170 prod
  HabitSync Proxy → :6842       — Docker bleibt, journal-dev proxied
  Datenpfad: ~/.aos/journal/
    YYYY-MM-DD.md               — Tages-Journal (domain-tagged Frontmatter)
    habits/                     — Habit-Definitionen + Logs
  /opt/vitals/journal/          — Hub-Eintrag
```

**Migration:**
```
~/.aos/fitness/journal/         → ~/.aos/journal/ (mit tag: fitness)
~/.aos/fuel/nutrition_journal/  → ~/.aos/journal/ (mit tag: fuel)
HabitSync :6842                 → bleibt, journal-dev proxied
```

---

## #011 PWA-Strategie: Welche Apps bekommen Offline-Support?

**Status:** ✅ Entschieden  
**Datum:** 2026-06-20

**Frage:** Nicht jede VOS Micro-App braucht einen vollständigen Service Worker.
Welche Apps bekommen PWA-Offline-Support, welche nicht?

**Entscheidung:**

| App | PWA / Offline | Begründung |
|-----|--------------|-----------|
| fitness-dev | ✅ ja (bereits vorhanden) | Gym-Nutzung ohne WLAN |
| fuel-dev | ✅ ja (bereits vorhanden, fuel-aos.web.app) | Mobile, unterwegs loggen |
| journal-dev | ✅ ja | Tagebuch-Einträge offline schreiben |
| habits-dev | ⏳ optional | Einfache Checkboxen, kurze Sessions, WLAN meist vorhanden |
| relax-dev | ⏳ optional | Physio-Anleitungen könnten offline sinnvoll sein |
| VitalHub | ❌ nein | Nur Navigation/Einstieg, kein Offline-Usecase |
| unified-server | ❌ nein | Backend, kein Frontend |

**Offline-Queue Pattern** (aus fitness-dev, übernehmen für alle PWA-Apps):
- IDB Queue für POST-Requests wenn offline
- stale-while-revalidate für GET-Requests
- Background Sync Tag `<app>-flush-queue`

---

## #012 Multi-Tenant Scope: Nur Fuel, oder VOS-weit?

**Status:** ✅ Entschieden  
**Datum:** 2026-06-20

**Frage:** fuel-dev hat `/c/<clientId>/` Multi-Tenant Routing für Vitaltrainer-Klienten.
Soll das in andere VOS-Apps übernommen werden?

**Entscheidung:** Multi-Tenant bleibt **fuel-dev-spezifisch** (Ernährungsberatung).
Andere VOS-Apps (fitness, journal, habits, relax) sind Single-User.

**Begründung:**
- Vitaltrainer-Kontext: Klienten bekommen Ernährungspläne → Fuel multi-tenant logisch
- Fitness-Tracking, Journal, Habits sind persönliche Tools — kein Klienten-Usecase
- unified-server übernimmt die Middleware optional, fitness-Domain ignoriert `clientId`

**Ausnahme:** Wenn relax-dev Physio-Pläne für Klienten bekommt, kann
Multi-Tenant dort nachgerüstet werden (gleiche Middleware, opt-in).

---

## #013 HabitSync Docker-Dependency entfällt — journal-dev speichert nativ

**Status:** ✅ Entschieden  
**Datum:** 2026-06-20

**Frage:** Braucht journal-dev HabitSync (:6842, Docker) als externes Backend?

**Entscheidung:** Nein. journal-dev speichert Habit-Daten nativ in JSON-Files.
Kein Docker, kein externer Service, keine Netzwerk-Abhängigkeit.

**Auslöser der Erkenntnis:**
Die Firebase-Variante von journal-dev würde Habits direkt in Firestore schreiben —
HabitSync ist dort strukturell nicht vorgesehen. Wenn die Cloud-Variante ohne HabitSync
auskommt, gibt es keinen Grund warum die lokale Variante davon abhängen sollte.

**Native Dateistruktur:**
```
~/.aos/journal/
  YYYY-MM-DD.md                    — Journal-Einträge
  habits/
    definitions.json               — [{uuid, name, icon, deleted, created_at}]
    records/
      YYYY-MM-DD.json              — [{uuid, date, completion:'DONE', ts}]
```

**Route-API bleibt identisch** (`/habitsync/*`) — fitness-dev Frontend-Komponenten
funktionieren ohne Änderungen weiter, nur das Backend dahinter ist ausgetauscht.

**Was das für andere Apps bedeutet:**
- fitness-dev: `/habitsync/*` Proxy auf :6842 bleibt vorerst (eigene Entscheidung, eigener ADR)
- journal-dev: komplett standalone, kein HabitSync nötig
- Firebase-Variante: Firestore direkt, kein HabitSync, kein lokaler Server

**Verworfen:** HabitSync als Dependency — widerspricht dem VOS Standalone-Prinzip
(jede App hat eigenes Backend, keine externen Service-Abhängigkeiten).

---

## #014 VitalOS als cloud_chamber-Root + eigene SW/Manifest

**Status:** ✅ Entschieden  
**Datum:** 2026-06-21

**Hintergrund:** VitalOS (ehemals `fitness-dev`-Shell mit `root: fitness-dev/`) wurde in
`cloud_chamber/vitalos/` ausgelagert. Der Vite-Build braucht `root: cloud_chamber/`, damit
Imports aus journal-dev/, federation/ etc. ohne Symlinks aufgelöst werden.

**Entscheidungen:**
- `root: cloud_chamber/` in `vitalos/vite.config.js`
- `cloud_chamber/public/` → eigene Icons, SW (`vitalos-v*`), Manifest
- SW-Version + Manifest-Version werden beim Build automatisch via `sed` auf Unix-Timestamp gesetzt —
  kein manuelles Versioning, kein separater Hook
- Icon: Dunkles Rechteck, "V"-Form mit Gradient (blau→violett) + EKG-Puls-Linie (SVG)
- Tailwind-Bug-Workaround: `tailwindcss({ config: resolve(...) })` explizit im css.postcss Block,
  weil Tailwind content-paths relativ zum CWD auflöst, nicht relativ zum Config-File

**Verworfen:**
- `fitness-v57` als SW für VitalOS — war fitness-dev's SW, nicht VitalOS-spezifisch
- `publicDir` explizit setzen — Vite defaultet sauber auf `{root}/public/`

---

## #015 journal/fuel/learn direkt in VitalOS bundeln

**Status:** ✅ Entschieden  
**Datum:** 2026-06-21–22

**Hintergrund:** Im Browser erschienen `Failed to resolve module specifier 'fuel/FuelApp'` und
ähnliche Fehler auf fitness-vos.web.app, weil die Federation-Remotes nicht korrekt geladen
wurden (falsche dist deployed, Site-Mismatch zwischen journal-vos ↔ journal-aos).

**Problem mit Remote-Entries:**
Der Browser muss zur Laufzeit `https://fuel-vos.web.app/remoteEntry.js` laden. Wenn der
Build fehlerhaft deployed wurde, die remoteEntry.js fehlt, oder Cache-Probleme auftreten,
erscheint ein weißer Screen ohne Fehlermeldung.

**Lösung — Alias statt Remote:**
```js
// vitalos/vite.config.js — immer aktiv (nicht nur dev)
'journal/JournalApp': resolve(FED_DIR, 'JournalApp.jsx'),
'fuel/FuelApp':       resolve(FED_DIR, 'FuelApp.jsx'),
'learn/LearnApp':     resolve(FED_DIR, 'LearnApp.jsx'),
'@fuel':              resolve(FUEL_ROOT, 'src/client'),
```

Vite löst diese Specifier zur Build-Zeit auf → direkte Chunks im VitalOS-Bundle.
Die `Suspense`-Wrapper in den Shell-Komponenten bleiben — sie laden jetzt lokale Chunks
statt Remote-Module, was genauso funktioniert.

**Ergebnis:**
- `JournalApp-*.js` (49 kB), `FuelApp-*.js` (33 kB), `LearnApp-*.js` (64 kB) — alle direkt gebundelt
- Kein remoteEntry.js für diese drei Apps notwendig
- `journal-vos.web.app` und `fuel-vos.web.app` und `learn-vos.web.app` als Deploy-Targets
  bleiben für standalone PWA-Builds erhalten (unabhängig von VitalOS)

**@db Kontext-Resolver:** JournalApp.jsx importiert `@db` — in VitalOS würde das normalerweise
auf vitalos' db.firestore.js zeigen. Custom Vite-Plugin `journalDbPlugin` fängt `@db`-Imports
ab, die aus `/journal-dev/`-Dateien kommen, und leitet sie auf journal-dev's eigene db um.

**Fitness bleibt Remote:** `fitness/FitnessApp` ist weiterhin ein Federation-Remote
(`https://fitness-vos.web.app/remoteEntry.js`) — zu groß für direktes Bundling sinnvoll,
und der fitness-remote Build funktioniert stabil.

**Verworfen:**
- iframe-Embed — keine React-Integration, kein shared State möglich
- remoteEntry.js ohne iframe — war der ursprüngliche Ansatz, scheiterte an Site-Mismatch-Bugs
- journal-standalone + journal-remote in selber dist — React-Bundling-Konflikt bei kombinierten Builds

---

## #016 journal-vos.web.app als neue Federation-Site

**Status:** ✅ Entschieden  
**Datum:** 2026-06-21

**Hintergrund:** `journal-aos.web.app` war die standalone Journal-PWA. `deploy:journal` in
vitalos/package.json hat irrtümlich eine stub-HTML der federation-Remote dort deployed.

**Lösung:**
- `journal-aos.web.app` bleibt standalone PWA (dist-firebase/)
- `journal-vos.web.app` neue Site für Federation-Remote (dist-federation/) — `firebase.remote.json`
- `journal-vos.web.app` wird nur gebaut wenn man tatsächlich das Remote nutzen will
  (was nach ADR #015 nicht mehr der Fall ist für VitalOS)

**Lernpunkt:** Zwei völlig verschiedene Build-Outputs (`dist-firebase/` vs. `dist-federation/`)
dürfen nie auf dieselbe Firebase-Hosting-Site deployed werden.
