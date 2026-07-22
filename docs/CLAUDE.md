# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

---

## fitness-dev: Praktisches Werkzeug der Diplom Präventiver Vitaltrainer Ausbildung

**fitness-dev** ist ein Kraft-Trainings-Tracking-System (PWA Frontend, Node.js Backend) das die Pflichtaufgaben der Fitnesstrainer-Module konkret unterstützt:
- Trainingspläne erstellen + dokumentieren
- Trainings-Logs führen + exportieren
- Anatomie-Lehre dokumentieren + verstehen
- Muskelabdeckungs-Analyse

---

## ⚠️ Session-Erkenntnisse 2026-07-22 (für Fable 5 / nächste Session)

**Wichtig:** Die Abschnitte weiter unten ("catalog/catalog/", "Katalog: ~/fitness-dev/catalog/")
beschreiben noch die **alte** Package-Struktur. Seit Commit `0875e37` ("refactor: merge
catalog into fitness package", 2026-07-11) ist das Python-Paket nach `fitness/catalog/`
umgezogen. `pyproject.toml` registriert nur noch `fitness` als Package (kein `catalog`
mehr) mit den Scripts `fitness-catalog` (`fitness.catalog.cli:main`) und
`fitness-catalog-api` (`fitness.catalog.api.api:main`). `fitness/catalog/core/paths.py`
löst `DATA_DIR` relativ zum Package auf → **`fitness/catalog/kb/` ist der live geladene
KB-Pfad**, nicht `catalog/kb/`.

**Offenes Problem — verwaister Alt-Baum:** `catalog/kb/` (Top-Level, 79 Dateien) ist beim
Merge-Commit als Kopie zurückgeblieben und wird seitdem nicht mehr gepflegt/gelesen
(Reste der kaputten `pectoralis_major_clavicular_head`-ID ohne Nummer, die dort noch
existiert). `fitness/catalog/kb/` (186 Dateien) ist die einzig aktive Kopie. Der alte
Baum sollte gelöscht werden — noch nicht erledigt, User hat zugestimmt (2026-07-22).
Vor dem Löschen: sicherstellen, dass keine Skripte/Docs noch hart auf `catalog/kb/`
verweisen (z.B. `@aliase`-Vite-Alias in `vite.config.js` zeigt aktuell noch auf
`./catalog/kb/aliases.yml` — dead path, gehört auf `./fitness/catalog/kb/aliases.yml`
korrigiert).

**Muskel-Hierarchie fehlt strukturell:** Es gibt kein `parent`/`part_of`-Feld in den
Muskel-YAMLs (`fitness/catalog/kb/muscles/**/*.yml`). Sub-Köpfe wie
`102_pectoralis_major_clavicular` (Teil von `101_pectoralis_major`) oder
`202/203/204_trapezius_upper/middle/lower` + `303_posterior_deltoid` (alle Teil des
Trapezius/Deltoideus-Komplexes) teilen sich implizit nur dieselbe `wger_id` — das ist
das einzige vorhandene Hierarchie-Signal, wird aber in `fitness/catalog/coverage.py`
(`add_role_scores`, `muscle_regions`) nicht ausgewertet. Aktuell müssen Exercise-YAMLs
redundant sowohl den Sub-Kopf als auch den Eltern-Muskel in `primary_muscles` listen,
damit Coverage-Scoring korrekt zählt (siehe Fix in `041.yml`/`102.yml`, Commit
`2429925` — Symptom war: Incline-Press/Low-to-High-Cable-Fly zählten nicht als
Chest-Primary, weil nur der Clavicular-Kopf gelistet war). **Sauberer wäre:** ein
`parent:`-Feld in den Muskel-YAMLs + Coverage-Logik, die Sub-Kopf-Scores automatisch
zum Parent hochrechnet, statt jede Exercise-Datei manuell zu duplizieren.
`wger_id` als gruppierendes Signal funktioniert nur für die grobe RBH-Body-Map-Ebene
(react-body-highlighter, siehe "Drei Body-Highlighter" weiter unten) — bei feineren
Unterscheidungen reicht wger's Taxonomie nicht mehr aus (z.B. innerhalb der
Rotatorenmanschette hat wger keine eigene ID, die Supraspinatus/Infraspinatus/Teres
minor/Subscapularis trennt — alle vier haben `wger_id: ~`). Für DetailedMuscleMap/
BodyMusclesMap (granularere Highlighter) braucht es also zusätzlich ein explizites
Parent-Feld, `wger_id` allein trägt nicht bis dorthin.

**Firestore-Inbox-Bug gefixt (Commit `4647717`):** `firestore.rules` verlangt für
Inbox-Writes von Nicht-Coach-Usern `resource.data.userId == request.auth.uid`,
`sendToInbox()` in `src/lib/db/firestore/kb.js` schrieb das Feld aber nie mit →
Permission-Denied, verschluckt im try/catch. Erklärt warum Klienten-Inbox-Einträge
nie im Coach-Tab ankamen.

**Coach-Tab in der Firebase-App weiterhin leer (Stand 2026-07-22, nach Deploy
verifiziert):** Alle drei Sub-Tabs (Katalog Browser, Klienten-Workouts,
Übungsanfragen) zeigen keine Ergebnisse, obwohl der Tab selbst sichtbar ist (Tab wird
laut User komplett ausgeblendet, wenn der eingeloggte User nicht der Coach ist — die
Sichtbarkeit ist also kein Firestore-Rules-Thema, sondern rein frontend-seitig
gegatet). Frontend-Gate in `src/App.jsx:228`:
`isLocalMode() || user?.email?.includes('alpha') || user?.uid === '59ole36uNpNwml5H6VDYCXyCME92'`
— drei Bedingungen, von denen nur die dritte (exakte UID) auch in `firestore.rules:8`
(`isCoach()`) geprüft wird. Nicht abschließend verifiziert, aber ein möglicher Grund
für "Tab sichtbar, aber alle Reads leer": Tab wird über die `email.includes('alpha')`-
Bedingung sichtbar, während die tatsächliche UID nicht mit der in `firestore.rules`
hartcodierten übereinstimmt → alle `collectionGroup`-Reads sehen dann nur eigene
Dokumente. Bitte in der Firebase Console direkt gegenprüfen, nicht neu spekulieren.
Zweiter, unabhängiger Verdacht: Katalog Browser braucht keine Coach-Rechte
(`fitness/kb/exercises` ist für alle authentifizierten User lesbar) — falls trotzdem
leer, wahrscheinlich wurde die `fitness/kb/`-Collection nie oder nicht aktuell nach
Firestore synced (Sync-Skript: `fitness/catalog/api/firestore_push.py`, liest korrekt
aus `fitness/catalog/kb/`). Prüfen ob/wann der Sync zuletzt lief.

**Cross-Repo-Symlink-Pattern (`src/views/Journal`, `src/views/Habits`,
`src/views/Learn`):** Diese drei (und nur diese drei) sind Symlinks auf
Sibling-Repos (`journal-dev`, `habits-dev`, `learn-dev`), weil `src/App.jsx` sie
per **relativem Import** einbindet (`./views/Journal/index.jsx`), was eine physische
Datei verlangt. Fuel wird dagegen rein über den `@fuel`-Vite-Alias eingebunden
(kein Symlink nötig) — ebenso wie `vitalos` und `fuel-dev` selbst `@journal`/`@habits`
als reine Alias-Imports auflösen, ohne Symlinks. Geplante Umstellung (noch nicht
umgesetzt): `App.jsx` auf `@journal`/`@habits`/`@learn`-Aliase umstellen + Symlinks
entfernen, dabei `tailwind.config.cjs`-`content`-Array um die externen Sibling-Pfade
erweitern (wie `fuel-dev/tailwind.config.cjs` es vormacht), damit weiterhin fitness-devs
**eigenes** Theme greift.

**Bekannt, nicht behoben:** `Habits`/`Journal`-Views (in `habits-dev`/`journal-dev`)
nutzen an vielen Stellen hartcodierte Fuel-Branding-Klassen (`text-orange-400`,
`bg-orange-400`, `bg-slate-900` — Standard-Tailwind-Klassen, kein Custom-Theme-Token)
statt fitness-devs `fit-*`/CSS-Variablen-Tokens. Das ist unabhängig vom
Symlink-vs-Alias-Thema und muss in `habits-dev`/`journal-dev` selbst gefixt werden.

**Vorsicht bei Cross-Repo-Pfaden generell — und was `-dev` vs. `-app` eigentlich
bedeutet (User-Klarstellung 2026-07-22):** `~/fitness-dev`, `~/journal-dev`,
`~/habits-dev`, `~/fuel-dev` sind die **dev-Branch-Arbeitskopien im Home-Root** —
für lokale Einzel-Entwicklung. `~/vitalos/fitness-app`, `~/vitalos/journal-app`,
`~/vitalos/habit-app` (Achtung: Singular "habit-app", nicht "habits-app"),
`~/vitalos/fuel-app` sind **dasselbe Repo** (gleicher `origin`), aber als
**master-Branch-Submodule** in `~/vitalos/` gecheckt out — **das ist der einzige
Ort, von dem aus tatsächlich gebaut/deployed wird.** Die `-app`-Namen markieren
absichtlich diesen Unterschied (Deploy-Artefakt vs. Dev-Checkout), keine
Inkonsistenz. **Konsequenz:** Ein hartcodierter Cross-Repo-Pfad in einer Datei,
die aus `~/vitalos` heraus gebaut wird (z.B. `fuel-dev/src/client/lib/db/index.js`,
welches `export * from "../../../../../fitness-app/..."` nutzt), soll `-app`
bleiben — das direkt auf `-dev` zurückzudrehen bricht den echten Deploy, auch wenn
es lokales Testen aus `~/fuel-dev` heraus "repariert". **Ausnahme:** `fitness-dev`
hat einen **eigenen, separaten** Firebase-Deploy (`npm run build:firebase` →
eigenes Firebase-Projekt, läuft direkt aus `~/fitness-dev`, nicht über `~/vitalos`)
— für `fitness-dev/vite.config.js` ist deshalb eine **dynamische** Auflösung
(`siblingDir()`-Helper, `fs.existsSync`-Check, bevorzugt `-app`, fällt auf `-dev`
zurück) implementiert, die in beiden Kontexten korrekt ist. Bei jedem
Cross-Repo-Pfad zuerst klären: Läuft der Build, der diese Datei tatsächlich lädt,
aus `~/vitalos` oder eigenständig aus dem Home-Root-Checkout? Erst dann patchen.

---

## Live-Firestore-Recherche 2026-07-22 (Methode + Befunde)

Ab hier wurde nicht mehr nur Code gelesen, sondern **live gegen die produktive
Firestore-DB** recherchiert, weil zwei Bug-Hypothesen (Coach-Tab leer, Brust fehlt
in "Relative Muskelbelastung") sich am Code allein nicht mehr sauber verifizieren
ließen — Vermutung ("könnte an X liegen") wurde durch echten Datenabgleich ersetzt.

**Technik — Firestore direkt abfragen:** Service-Account-Credentials liegen unter
`~/.env/firebase-fitness.json` (siehe CLAUDE.md-Abschnitt "Firestore Sync"). Damit
lässt sich mit dem `firebase-admin`-Python-Paket (bereits installiert) jederzeit
direkt gegen die Prod-DB query'en, ohne Browser/DevTools:

```python
import firebase_admin
from firebase_admin import credentials, firestore

cred = credentials.Certificate('/home/alpha/.env/firebase-fitness.json')
firebase_admin.initialize_app(cred)
db = firestore.client()

# collection_group durchsucht die Subcollection über ALLE User hinweg
docs = db.collection_group('sessions').where('date', '==', '2026-07-20').get()
for d in docs:
    print(d.reference.path, d.to_dict())
```

**Diese Technik unbedingt weiter nutzen**, bevor man bei Firestore-Bugs auf
Verdacht patcht — sie deckte zwei Bugs auf, die aus reinem Code-Lesen nicht
zweifelsfrei hervorgingen:

**Bug A — `doc.reference` statt `doc.ref` (v8- vs. v9-SDK-API):** Browser-Konsole
zeigte den echten Produktionsfehler `TypeError: Cannot read properties of
undefined (reading 'parent')` in `getGlobalInbox()`. Der Quellcode nutzte überall
`d.reference.parent?.parent?.id` — `.reference` ist die **v8/Namespaced-API**,
im tatsächlich verwendeten **v9-modularen SDK** (`import { ... } from
"firebase/firestore"`) heißt die Property auf einem `QueryDocumentSnapshot` **`.ref`**,
nicht `.reference`. `d.reference` war deshalb immer `undefined`, und `d.reference.parent`
crashte sofort — die Optional-Chaining (`?.`) davor konnte nichts retten, weil sie
erst *nach* dem ersten (nicht abgesicherten) `.reference`-Zugriff ansetzt. Betraf
`getGlobalInbox()` (sessions.js) sowie `getGlobalJournalFeed()` und
`getAllUserProfiles()` (utils.js) — insgesamt 9 Fundstellen, alle ersetzt.
Fix: Commit `c46c713`.

**Bug B — `getSession(date)` vs. `listSessionsForDate(date)`:** Ausgangspunkt war
die Beobachtung, dass "Brust" im Review-Tab unter "Relative Muskelbelastung"
fehlte, obwohl der User am Montag (2 Tage zuvor) nachweislich Incline Bench Press
trainiert hatte und der Muscles-Tab (Superkompensation) das auch korrekt zeigte.
Live-Firestore-Query auf `collection_group('sessions').where('date','==','2026-07-20')`
fand das reale Dokument unter dem Pfad
`fitness/59ole36uNpNwml5H6VDYCXyCME92/sessions/2026-07-20__1784567246187` — **mit
Zeitstempel-Suffix in der Dokument-ID**, nicht unter dem reinen Datumsstring. Grund:
`useSession.js:372` (`handleNewSession()`) vergibt bei **jeder** neuen Session
`String(Date.now())` als Suffix — das ist der Standardfall, nicht nur bei echten
Mehrfach-Sessions pro Tag. `getWeeklyReport()` in `firestore/analysis.js` rief aber
`getSession(date)` auf, was **exakt** auf die Dokument-ID `date` (ohne Suffix)
matched (`getDoc(doc(db, "fitness", uid, "sessions", date))`) — fand das Dokument
nie, `getSession` fiel auf den leeren Stub `{ exercises: [] }` zurück. Betraf nicht
nur "Brust", sondern **den kompletten Trainingstag** (auch die zweite Übung dieser
Session, "Shoulder External Rotation (Cable)", fehlte). `listSessionsForDate(date)`
(genutzt vom Session-Tab selbst) macht stattdessen eine Firestore-**Query** auf das
`date`-**Feld** (`where("date","==",date)`) statt auf die Dokument-ID — funktioniert
unabhängig vom Suffix. Fix: `getWeeklyReport()`-Schleife auf `listSessionsForDate()`
umgestellt, gegen echte Daten verifiziert (Query fand das Dokument, direkter Lookup
nicht). Commit `c46c713`. **Prüfenswert für Fable 5:** ob `getMuscleCoverage()` oder
andere Firestore-Funktionen denselben `getSession(date)`-Direktlookup ohne
Suffix-Berücksichtigung verwenden — noch nicht systematisch durchsucht.

**Bug C (bestätigt, nicht gefixt) — systemische Muskel-Fehlzuordnung im
unreviewten wger-Import:** Auf Anfrage systematisch gescannt: 18 Exercises in
`fitness/catalog/kb/exercises/unreviewed_wger.yml`, deren Name auf hintere
Schulter/Außenrotation hindeutet ("rear", "reverse", "posterior", "face pull",
"external rotation"), aber `301_anterior_deltoid` als primären oder einzigen
Muskel tragen, während `303_posterior_deltoid` komplett fehlt (u.a. `wger_822
cable rear delt fly`, `wger_1555 shoulder external rotation (cable)` — letzteres
exakt die zweite Übung aus der oben untersuchten Montags-Session des Users).
**Wichtig:** Alle 18 Treffer liegen in `unreviewed_wger.yml` (Bulk-Tier) — laut
User-Vorgabe dürfen unreviewte Exercises fachlich falsch sein, das ist Teil des
Inbox/Gemini-Enrichment-Workflows (`queueForEnrichment()` in `useSession.js:210`,
nur getriggert wenn `ex.source !== 'expert'`). Der eigentliche Hebel ist **nicht**,
diese 18 Einträge einzeln zu patchen (umgeht die Inbox-Logik), sondern
sicherzustellen, dass jede geloggte unreviewte Übung zuverlässig einen
Inbox-Eintrag erzeugt — siehe Bug A/Firestore-Inbox-Fix (Commit `4647717`, User
`userId`-Feld). Scan-Skript (Python, `fitness/catalog/kb/exercises/`, alle
`.yml` außer `unreviewed_*` durchsuchen, `re.search(r'rear|reverse|posterior|
face pull|external rotation', name)` gegen `primary_muscles`/`secondary_muscles`)
ist im Session-Verlauf dokumentiert, nicht als Datei abgelegt — bei Bedarf
neu schreiben, dauert nur Sekunden.

**Gesamtbild, wie es sich nach dieser Recherche darstellt:** Der Coach-Tab war aus
mindestens drei unabhängigen Gründen leer (Bug A für Klienten-Workouts/
Übungsanfragen; vermutlich fehlender/veralteter KB-Sync für Katalog Browser, noch
nicht verifiziert; plus die eingangs vermutete, aber vom User als "kein Thema"
abgetane Coach-UID-Frage in `firestore.rules`/`App.jsx:228`, nicht abschließend
geklärt). Das Review-Tab-Problem (Bug B) war komplett unabhängig davon und hätte
mit reinem Code-Lesen ohne echten Datenabgleich vermutlich falsch diagnostiziert
werden können (die Muskel-Mapping-Funktion selbst ist tatsächlich sauber — der
Fehler lag zwei Ebenen darüber, im Session-Retrieval). **Lektion:** Bei
Firestore-Bugs, wo die Datenform selbst unklar ist (Dokument-IDs, tatsächlich
gespeicherte Feldwerte), lohnt sich die Live-Query fast immer schneller als
Code-Ferndiagnose.

**Aufgabenteilung ab 2026-07-22 (User-Vorgabe):** Claude übernimmt ab hier die
**Coach View** mit ihren 3 Sub-Tabs (Übungsanfragen/Inbox, Klienten-Workouts/Client
Feed, Katalog Browser) — offene Punkte dazu: Katalog-Browser-Leerlauf verifizieren
(KB-Sync-Stand prüfen), Coach-UID-Frage in `firestore.rules`/`App.jsx:228`
klären. **Fable 5 übernimmt die Exercise-/Muscle-Logik** — d.h. Bug C (systemische
`301_anterior_deltoid`-Fehlzuordnung im wger-Bulk-Import), die fehlende
Muskel-Hierarchie (`parent`-Feld, siehe oben), sowie generell alles rund um
`fitness/catalog/kb/exercises/` und `fitness/catalog/kb/muscles/`. Nicht
gegenseitig ins jeweils andere Themenfeld vorgreifen, außer explizit abgestimmt.

---

## Architektur: Zwei Schichten

### 1. fitness-dev (dieses Repo) — der Tempel
Node.js Backend + React Frontend. Logging, Visualisierung, Export.
Wird von **fitness-dev-coding-agent** gebaut.

### 2. catalog/catalog/ — Python Tool-Set + HTTP-Server (:9120)
Python-Paket das Claude oder Gemini als Tool nutzen um den Katalog zu erweitern.
**Läuft auch als eigenständiger HTTP-Server (:9120)** — `fitness-runtime.mjs` ruft ihn via HTTP auf.

```
AI Agent (Claude / Gemini)
    ↓ ruft auf
catalog/catalog/           Python Tool-Set + HTTP-Server (:9120)
    ├── resolve_query()          Exercise-Name → canonical_id
    ├── teach_exercise()         Anatomie-Lesson aus YAML rendern
    ├── log_training_entry()     Eintrag in SQLite schreiben
    ├── build_plan()             Trainingsplan generieren
    ├── audit()                  Katalog-Qualität prüfen (was fehlt?)
    ├── build_coach_sheet()      Coaching-Daten strukturiert aufbereiten
    └── map_wger()               Exercise ↔ wger_id zuordnen
    ↓ schreibt in
catalog/kb/anatomy_teaching/*.yml  Anatomie-YAML (Ursprung, Ansatz, Innervation)
catalog/kb/exercises/*.yml         Exercise-Definitionen
~/.aos/fitness/sessions/training_history.sqlite
```

Server starten: `PYTHONPATH=catalog python3 -m catalog.server` (Port 9120)
Fällt der Agent aus, gibt `fitness-runtime.mjs` Fallback-Daten zurück.

**Wozu:** wger liefert Übungsname + grobe Muskelgruppe. Was fehlt:
- Anatomie-Detail (Ursprung, Ansatz, Innervation, Funktion) — Ausbildungs-Level
- Coaching-Qualität (häufige Fehler, Technik-Cues, Progressionen)
- Coverage-Granularität (primary / secondary / stabilizer auf Muskel-Ebene)
- HIT-spezifische Hinweise (Stretch-Position, Peak-Kontraktion, TuT)

**Typischer Agent-Workflow:**
```
audit --topic anatomy   → findet fehlende anatomy_teaching YAMLs
Gemini generiert YAML   → aus Ausbildungswissen (Grosser, Weineck, Gottlob)
write → catalog/kb/anatomy_teaching/<exercise_id>.yml
audit again             → validiert Struktur
teach_exercise()        → UI kann Anatomie-Layer zeigen
```

**CLI-Einstieg:** `python3 -m catalog.catalog <command>`
Befehle: `audit`, `resolve`, `teach`, `log`, `history`, `report`, `plan`, `coach-sheet`, `map-wger`, `export-wger-index`, `tui`

---

## Backend

**Server-Rollen auf einen Blick:**

| Datei | Port | Typ | Rolle |
|-------|------|-----|-------|
| `server.mjs` | 9100 | Node/Hono | **DEV-Server** — Vite-Proxy-Target, Frontend-Dev |
| `catalog/api.py` | 9150 | Python/FastAPI | **Prod-Backend** — Tailscale-Funnel, Direktimports |

**catalog/api.py** (Port 9150): **FastAPI/uvicorn** — Prod/Tailscale Backend
- Direktimports aus `catalog` + `anatomy_kb`
- Alle API-Routen: sessions, journal, body, exercises, coverage, plan, weekly, exports, firestore, habitsync
- Port: `FITNESS_PYTHON_PORT` env (default 9150)
- Starten: `python3 -m catalog.api serve` or `fitness-agent-api serve` or via `fitness-devctl start --no-node`
- Service: `fitness-python-backend.service`

**server.mjs** (Port 9100): **Hono**-Server (`@hono/node-server`) — DEV-Server
- API-Routen: `/session`, `/journal`, `/exercises/search`, `/coverage`, `/fitness/plan`, `/fitness/weekly`, `/fitness/export`, `/fitness/body`
- Static-Serving (dist/ oder public/) + SPA-Fallback
- Proxies: wger (lokal), HabitSync (:6842)
- **Dual-write**: `POST /session` schreibt JSON-File + SQLite synchron
- **wger Gewichtssync**: `POST /fitness/body` mit `weight_kg` → schreibt Body-JSON + pusht `POST /api/v2/weightentry/` zu wger (fire-and-forget). Token: `WGER_API_TOKEN` env oder Hardcode in Zeile 20. Base-URL: `WGER_BASE` env (Standard `:8000`, wger läuft auf `:80` wenn Override-Port nicht greift).

**fitness-runtime.mjs** (Shared Runtime):
- `searchExercises()` — lokale Katalog + wger + yuhonas Integration
- `buildPlan()` — Trainingsplan-Generator (PPL, Upper/Lower, etc.)
- `getWeeklySummary()` — Wochenreport via Python weekly.py
- `exportSessionMarkdown()` — Export für Obsidian/PDF

**Daten**: `~/.aos/fitness/`
- `sessions/YYYY-MM-DD.json` — Session-Logs (SOT für Node-Server)
- `sessions/training_history.sqlite` — SQLite Mirror (SOT für catalog Python-Tools)
- `journal/YYYY-MM-DD.md` — Text-Notizen
- `body/YYYY-MM-DD.json` — Körpermessungen (Fitbit-Pipeline)
- `plan.json` — Aktiver Trainingsplan
- `agent-state/` — catalog Runtime-State (Symlink: catalog/state)

---

## PWA / Offline

**Service Worker** (`public/sw.js`, `fitness-v1`):
- Install: `public/` statische Assets vorcachen
- GET `/session*`, `/coverage*`, `/fitness/weekly`, `/plan/today`, `/blocks` → stale-while-revalidate (Cache sofort, Netz im Hintergrund)
- Navigate → network-first + app-shell fallback
- Hashed Vite-Assets → cache-first + runtime fill
- Background Sync Tag `fitness-flush-queue` → flusht IDB-Queue beim Reconnect

**Offline-Queue** (`public/offline-queue.js`):
- IDB: `aos-offline-fitness` (stores: `queue`, `cache`)
- `window.aosOfflineQueue.fetch` — drop-in für `fetch`, von `src/api.js` genutzt
- GET offline → IDB-Cache zurückgeben statt Fehler
- POST offline → in Queue einreihen, Background Sync registrieren, 202 zurück
- Auto-flush beim `online`-Event

**Firestore Sync** (`firestore-mirror.mjs`, firebase-admin):
- Creds: `~/.env/firebase-fitness.json` (Service Account), Projekt: `fitness-aos`
- Dual-write bei `POST /session` + `POST /journal` (fire-and-forget)
- `/firestore/status` → Verbindungsstatus; `/firestore/sync` → letzte 30 Sessions pushen
- `firestore-sync.mjs` wurde entfernt (war Node-Bridge zu Python, nicht mehr nötig)

---

## Frontend (React + Vite)

**Tabs (NAV_ITEMS, `src/constants/NavigationItems.js`):**

| Tab-ID | Label | View | Anmerkung |
|--------|-------|------|-----------|
| `dash` | Heute | `src/views/Dashboard/` | Standard-Einstieg |
| `session` | Training | `src/views/Session/` | Workout-Logging mit Live-BodyMap |
| `habits` | Habits | `src/views/Habits/` | HabitSync-Integration |
| `journal` | Journal | `src/views/Journal/` | Text-Notizen |
| `review` | Review | `src/views/WeeklyReview/` | Charts + Wochenrückblick |
| `learn` | Lernen | `src/views/Learn/` | Anatomie-Lehre (catalog/kb) |
| `settings` | Setup | `src/views/Settings/` | Themes, Split, Nav-Modus etc. |

**Versteckte Views (nicht in Nav, per URL `#coach` erreichbar):**
- `src/views/Coach/` — AI Coach Tab (`#coach`)
- `src/views/AppGate.jsx` — Hub-Homescreen (nur in `navMode=home` als `#gate`)

**Nicht verlinkte Views (Code vorhanden, kein aktiver Tab):**
- `src/views/Inbox/` — Exercise-Inbox (Genehmigung neuer KB-Einträge)

**Aktive Sub-Views (kein eigener Haupt-Tab, aber eingebunden):**
- `src/views/Muscles/` — Superkompensations-Analyse + Body-Map (AKTIV als Subtab `muscles` in WeeklyReview).
  ⚠️ NIEMALS als "inaktiv" markieren — bewusst nicht als Haupt-Tab, aber aktives Main-Feature.
  Eigene Sub-Komponenten: MuscleAnalysis, MuscleBodyMap, MuscleDetailedMap, MuscleInsights, MuscleHeader.

**src/components/**:
- `layout/` — Sidebar (Desktop), MobileNav (Bottom-Bar)
- `common/` — ErrorBoundary, UserProfile
- `dashboard/` — ActivityHeatmap, DashboardWidget, MuscleCoverage, SessionStatus u.a.
- Flat (shared): ExerciseSearchOverlay, BodyMap, PlanBuilder, HabitWidget, ExerciseInsightModal, WeightChart, AnatomyDetailModal

**src/lib/db/** — Dual DB-Layer (flache Struktur, kein Local/Firebase Unterverzeichnis):
- `core.js` — api helpers (fetch Wrapper), auth stubs (lokal), `isLocalMode()`, `watchAuth()`
- `sessions.js` — getSession, saveSession, getRecentSessions, getProgressTrend, getPlan, getPlanSuggestion
- `journal.js` — getJournal, saveJournal, getJournalHistory
- `habits.js` — getHabits, recordHabit, unrecordHabit
- `kb.js` — getExercise, getAllExercises, searchExercises, getAnatomy
- `analysis.js` — getDashboardAnalytics, getMuscleCoverage, getWeeklyReport, getCoverageGaps
- `user.js` — getSettings, saveSettings, getBodyEntry, getBodyEntries
- `utils.js` — parseQuick, exportCsv

**`@db` Vite-Alias** (in `vite.config.js`):
- Default-Build: `@db` → `src/db.js` (Barrel für src/lib/db/*.js, alle Calls → Node-Server :9100)
- Firebase-Build (`--mode firebase`): `@db` → `src/db.firestore.js` (Single-File, direkte Firestore SDK)

Port 5902 (dev), Proxy zu Backend API-Routen (:9100).

**BodyMap in Session:** Zeigt nur Muskeln von Exercises mit `done: true`. Kein Preview, kein Plan — nur was bereits abgehakt ist.

## Drei Body-Highlighter (NICHT verwechseln)

| Bibliothek | Komponente | Datenformat | Verwendet in |
|------------|------------|-------------|--------------|
| `react-body-highlighter` | `BodyMap.jsx` | `[{ slug, muscles: [slug], frequency: 1–4 }]` | Dashboard MuscleBody, Muscles/MuscleBodyMap |
| `react-muscle-highlighter` | `DetailedMuscleMap.jsx` | `[{ slug, color: '#hex' }]` | Dashboard MuscleBody, Muscles/MuscleDetailedMap |
| `body-muscles` BodyChart | `BodyMusclesMap.jsx` | `{ [granularId]: { intensity: 0–10, selected: bool } }` | Learn/Explorer |

**groupScores** ist das interne Format zwischen DB-Layer und Komponenten:
`{ [groupName]: { score: 1–4, color: '#hex' } }` — score für RBH frequency, color für react-muscle-highlighter direkt.

## Superkompensation — korrekte HIT-Zeitfenster

| Phase | Zeitfenster | score | color |
|-------|-------------|-------|-------|
| Stark belastet | 0–3 Tage | 1 | `#ef4444` |
| Erholung | 3–7 Tage | 2 | `#f59e0b` |
| Superkompensation (Peak) | 7–14 Tage | 3 | `#22c55e` |
| Fenster schließt sich | 14–21 Tage | 4 | `#3b82f6` |

Cardio: kürzer (≤1d→1, ≤4d→2, ≤10d→3, kein Blau). Kraft überschreibt Cardio am selben Tag.
Implementiert in: `buildLastTrainedMap()` + `superKompFreq()` in `src/components/dashboard/MuscleBody.jsx`

**Swipe-Navigation** (Mobile): Links/Rechts wischen wechselt zwischen Views (minSwipeDistance: 75px, mit jank-freiem vertikalen Scroll-Lock und intelligentem Ausschluss von horizontal scrollbaren oder interaktiven Elementen).

**Gym Mode**: `layoutScale` (50–150%) skaliert `document.documentElement.fontSize` — für große Gym-Displays.

**Zwei Build-Modi:**
- Default (lokal/Coach): `npm run build` → `@db` = `src/db.js` (lokal, kein Auth-Gate)
- Firebase PWA: `npm run build:firebase` → `@db` = `src/db.firestore.js`, Output nach `~/fitness/dist-firebase/`

---

## Katalog: ~/fitness-dev/catalog/

```
~/fitness-dev/catalog/
├─ config.yml
├─ data_source_priority.yml
├─ kb/                             — Knowledge Base (eigentlicher SOT-Ordner)
│  ├─ exercises/
│  │  ├─ chest.yml, back.yml, ...  — Exercise-Definitionen (canonical IDs)
│  ├─ anatomy_teaching/            — Anatomie-YAML (vom AI-Agent befüllt, ~28 Dateien)
│  │  ├─ barbell_row.yml, ...      — Ursprung, Ansatz, Innervation, Funktion
│  ├─ maps/
│  │  ├─ aliases.yml               — Freie Eingaben → canonical_id
│  │  ├─ wger_mapping.yml          — custom_id ↔ wger_id
│  │  └─ external_db_mapping.yml   — custom_id ↔ yuhonas_id
│  ├─ registry/
│  │  ├─ wger_exercises_id.yml     — wger_id → wger_name (824 Einträge, Rohdaten)
│  │  ├─ wger_muscles.yml          — wger muscle_id → catalog muscle group
│  │  └─ wger_catalog_index.yml    — wger_id → catalog_id (Merge-Kontrakt, auto-generated)
│  │                                 Nur kuratierte Exercises (nicht unreviewed_*).
│  │                                 Regenerieren: fitness-agent export-wger-index
│  ├─ muscles/
│  │  ├─ muscles.yml               — Muskel-Taxonomie
│  │  ├─ muscle_coverage_rules.yml — Gewichtungen (primary/secondary/stabilizer)
│  │  └─ body_highlighter_bridge.yml — ENTFERNT (body_region direkt in Muskel-YAMLs)
│  └─ rules/
│     ├─ program_rules.yml
│     ├─ progression_rules.yml
│     └─ safety_rules.yml
├─ catalog/                  — Python Tool-Set + Server (siehe oben)
└─ tests/                          — Pytest-Suite (resolver, coverage, planner, teaching, weekly)
```

---

## Datenquellen-Integration

**Priorität**: custom_yaml (Semantic Truth) > wger (Backend) + yuhonas (Ergänzung)

**wger** (:8000, lokal): Primäres Backend für Exercise Master Data. Vollständig integriert.

**yuhonas** (free-exercise-db): Bilder + Form-Videos, alternative Namen. Ergänzung zu wger.

**custom_yaml** (Katalog): Semantic Source of Truth. Anatomie-Lehre. Überschreibt bei Konflikt.

---

## Commands

| Befehl | Zweck |
|--------|-------|
| `npm run dev` | Backend (9100) + Vite DevServer (5902) mit HMR |
| `npm run ui:dev` | Nur Vite DevServer (Port 5902) |
| `npm run build` | Production-Build in `dist/` |
| `npm run build:catalog` | Katalog → ~/.aos/fitness/workouts/catalog.json |
| `./fitnessctl start` | API (:9100) + catalog (:9120) starten |
| `./fitnessctl status` | Status-Übersicht aller Services (gum-Tabelle) |
| `./fitnessctl kb-sync` | catalog/kb → Firestore pushen |
| `./fitnessctl session today` | Heutige Session anzeigen |
| `./fitnessctl coverage [DAYS]` | Muskelabdeckung der letzten N Tage |
| `cd pwa && npm run dev` | Firebase PWA Dev-Server |
| `cd pwa && npm run deploy` | Firebase PWA bauen + deployen |

---

## API-Referenz

| Endpoint | Methode | Beschreibung |
|----------|---------|-------------|
| `/health` | GET | Server-Status |
| `/exercise/:id/teaching` | GET | Anatomy-Lesson aus catalog/kb/anatomy_teaching/ |
| `/session?date=YYYY-MM-DD` | GET/POST | Tageslog — POST macht dual-write (JSON + SQLite) |
| `/session/history?limit=10` | GET | Letzte N Sessions |
| `/exercises/search?q=...` | GET | Search lokal + wger + yuhonas |
| `/fitness/plan?template=ppl&split=6` | GET | Trainingsplan-Generator |
| `/fitness/weekly?week=2025-W45` | GET | Wochenreport (week: "current" oder "YYYY-Www") |
| `/fitness/export` | POST | Session/Plan/Sheet/Lesson-Export |
| `/theme` | GET/POST | UI-Theme-Pref |
| `/fitness/body?days=30` | GET | Körpermessungen (Gewicht, BMI, Schritte, Schlaf, HR) der letzten N Tage |
| `/fitness/body` | POST | Body-Eintrag speichern + wger-Gewichtssync (wenn `weight_kg` vorhanden) |
| `/firestore/status` | GET | Firestore-Verbindungsstatus (`{ ok, project }`) |
| `/firestore/sync` | POST | Letzte 30 Sessions → Firestore pushen |

---

## Design-Patterns

**Session-Format** (`~/.aos/fitness/sessions/YYYY-MM-DD.json`):
```json
{
  "date": "2026-05-17",
  "block": "Push",
  "exercises": [
    {
      "exercise_id": "barbell_bench",
      "id": "barbell_bench",
      "name": "Barbell Bench Press",
      "sets": "",
      "reps": "",
      "weight": "",
      "note": "",
      "primaryMuscles": ["Chest"],
      "secondaryMuscles": ["Shoulders", "Triceps"],
      "isHIT": true,
      "done": true
    }
  ],
  "effort": 8,
  "mood": "",
  "notes": "",
  "saved_at": "2026-05-17T18:30:00Z"
}
```

`sets`/`reps`/`weight` sind Strings (leer wenn nicht eingetragen). `isHIT` kennzeichnet HIT-Trainingseinheiten (kein Satz/Wdh-Tracking, Training bis zum Muskelversagen).

**Muscle-Normalisierung**: wger → internal IDs (chest, back, shoulders, arms, core, glutes, quads, hamstrings, calves)

**Response Pattern**: `{ ok: true, data: {...} }` oder `{ ok: false, error: "..." }`

---

## Python Packages (pyproject.toml)

Alle vier Packages sind in `pyproject.toml` (`where=["."]`) registriert und via `uv tool install` global verfügbar:

| Package | Zweck |
|---------|-------|
| `catalog` | Katalog-Tools + Agent-API (Kern-Paket) |
| `fitness_cli` | Terminal CLI + TUI (kein Server nötig) |
| `db` | SQLAlchemy ORM-Layer (models, schemas, SessionLocal) |
| `firestore_kb` | KB-Sync catalog/kb/ → Firestore (Symlink → catalog/firestore_kb/) |

---

## fitness_cli/ — Python CLI & TUI Package

Direkter Dateizugriff auf Session-JSONs — kein Server nötig.

```
fitness_cli/
├── __init__.py          — Package-Root
├── __main__.py          — python -m fitness_cli [log|tui]
├── paths.py             — Pfad-Konstanten (~/.aos/fitness/sessions/ etc.)
├── constants.py         — Aktivitäts-Typen, Trainingsblock-Labels, Farben
├── data.py              — load_sessions(), sync_info(), load_all_clients()
├── render.py            — ANSI/gum Render-Helfer (für fitness-log)
└── commands/
    ├── __init__.py      — muscle_to_group(), muscle_group_label() (Normalisierung)
    ├── log.py           — Typer CLI: ls / show / week / stats / history / sync-status
    └── tui.py           — Textual TUI: FitnessTUI (5 Tabs: Log, Woche, Stats, Sync, Clients)
```

**Binaries in `bin/`:**

| Befehl | Entry-Point | Funktion |
|--------|-------------|---------|
| `fitness-tui` | `fitness_cli.commands.tui:main` | Interaktive Textual TUI |
| `fitness-log` | `fitness_cli.commands.log` | Typer CLI (ls/show/stats/…) |
| `fitness` | `bin/fitness` | Top-Level Dispatcher (dev/prod Server-Steuerung) |

**Muscle-Normalisierung** (`commands/__init__.py`): `muscle_to_group(name)` mappt rohe Session-Muskelnamen (`"201_latissimus_dorsi"`, `"Back"`, `"back"`) auf kanonische Gruppen (`"back"`) via Präfix-Range. `muscle_group_label(group)` gibt den deutschen Anzeigenamen zurück (`"Rücken"`).

---

## Testing

**Python (catalog/catalog):** Pytest-Suite in `catalog/tests/` — deckt resolver, coverage, planner, teaching, weekly, obsidian, wger ab.
```bash
cd ~/fitness-dev && python3 -m pytest catalog/tests/
```

**Node/Frontend:** Kein strukturierter Test-Suite. Manuelle Tests über Web-UI:
- Session-Logging auf `/session`-View testen
- Exercise-Suche mit `/exercises/search` validieren
- Anatomy-Lehre im `/learn` oder `/session/exercise/:id` anzeigen

---

## Abhängigkeiten

- **wger lokal** (:8000) — primäres Backend, lokal gehostet
- **yuhonas_free_exercise_db** — optional, Bilder + Varianten
- **better-sqlite3** — dual-write SQLite im Node-Server
- **React** ^18.3, **Vite** ^5.4, **TailwindCSS** ^3.4
- **react-body-highlighter** ^2.0.5 — Body-Map UI
- **recharts** — Charts (WeightChart, Coverage-Trends)

---

## Workflow

1. **Ausbildung läuft** — User macht Fitnesstrainer-Module, Pflichtaufgaben
2. **User loggt Sessions** — über Session-View, dual-write in JSON + SQLite
3. **AI Agent erweitert Katalog** — nutzt catalog/catalog/ Tools:
   - `audit anatomy` → findet fehlende Übungen
   - Gemini generiert YAML → catalog/kb/anatomy_teaching/
   - `map-wger` → verknüpft Übungen mit wger-IDs
4. **fitness-dev zeigt es** — Anatomie-Layer, Coverage-Analyse, BodyMap
5. **Loop** — mehr Logs → bessere Coverage-Analyse → bessere Vorschläge

---

## catalog: Kern-Logik

**Mission:** Training als angewandte Anatomie — nicht nur „welche Muskeln trainiert diese Übung" sondern „welche Bewegung erklärt mir Anatomie praktisch am eigenen Körper". Das ist der didaktische Layer den wger, yuhonas und alle Open-Source-DBs nicht liefern.

**Zwei Agenten-Rollen:**
- `fitness-agent` → schreibt + erweitert Katalog (`catalog/`), erkennt Lücken, schreibt Tickets
- `fitness-dev-coding-agent` → implementiert Tickets in Code, baut fitness-dev

### Canonical Flow

```
User Input
→ Alias Resolver        aliases.yml
→ canonical exercise_id
→ Custom YAML Lookup    catalog/kb/exercises/
→ Muscle Taxonomy       muscles.yml
→ Coverage Rules        muscle_coverage_rules.yml
→ Program Rules         program_rules.yml
→ Workout Generation
→ wger Mapping          wger_mapping.yml
→ Export / Logging
→ History Update
→ Progression
```

### Exercise Matching Hierarchie

1. Exakte canonical ID
2. `aliases.yml`
3. Deutscher Name
4. Englischer Name
5. Fuzzy Matching
6. wger lokal
7. yuhonas

Wenn unklar: 2–3 Treffer mit Confidence zurückgeben — nicht raten.

### Coverage-Formel

```
coverage_score = sets × role_weight × effort_factor
```

| Role | Weight | RPE | Factor |
|------|--------|-----|--------|
| primary | 1.0 | 7 | 0.75 |
| secondary | 0.5 | 8 | 0.90 |
| stabilizer | 0.2 | 9 | 1.00 |
| minor | 0.1 | 10 | 1.05 |

### Übungsreihenfolge (generierte Pläne)

1. Schwere Compound Lifts
2. Sekundäre Compounds
3. Maschinen / stabilere Hypertrophy-Arbeit
4. Isolation
5. Prehab / Core / Finisher

### Agent-Prioritäten

- Custom YAML gewinnt bei Trainingslogik — überschreibt wger bei Konflikt
- Stable canonical IDs — nie durch wger-IDs ersetzen
- Jede Übungswahl muss begründbar sein (Muskelgruppe, Bewegungsmuster, Ziel)
- Progression über Novelty — nicht ständig neue Übungen einbauen
- Unsichere Mappings als `inferred: true` markieren, nie stillschweigend speichern
- Backup vor Writes auf user-owned YAMLs

### Nicht erlaubt

- Zufällige Übungsauswahl
- wger blind vertrauen
- Eigene canonical IDs löschen oder durch wger-IDs ersetzen
- YAMLs ohne Backup überschreiben
- Trainingshistorie verlieren
- Muskelbeteiligung binär bewerten (Stabilizer ≠ Primary)
- Schmerz ignorieren

---

## anatomy-kb (Git Subtree: anatomy-kb/, :9200)

Ehemaliges separates Projekt, jetzt als Git Subtree direkt in fitness-dev integriert. Muskel-Anatomie-Layer der Ausbildung.

```
anatomy-kb/muscles/*.yml       — Ein File pro Muskel (origin, insertion, innervation, function)
anatomy-kb/catalog-index.json  — Muscle Registry (wger_id als Anker)
anatomy-kb/server.py           — aiohttp Server (:9200)
```

**Daten-Stack:**
```
wger (:8000) + yuhonas
    ↓
catalog/kb/exercises/          — Base-Layer (name, wger_id, muscle_roles)
    ↓
catalog/kb/anatomy_teaching/   — Teaching-Layer (joint_actions, errors, cues, quiz)
    ↑ push_to_teaching()
anatomy-kb/muscles/            — Muskel-Layer (origin, insertion, innervation)
    ↑ Gemini-Enrichment aus Ausbildungswissen
```

---

## Status

- ✅ DEV-Server (Node.js, Port 9100) — server.mjs, Hono, Vite-Proxy-Target
- ✅ Python Prod-Backend (FastAPI, Port 9150) — server.py, Tailscale-Funnel
- ✅ catalog Server (:9120, aiohttp) — wird archiviert sobald server.py verifiziert
- ✅ python-backend/ archiviert (archive/python-backend/) — abgelöst durch server.py
- ✅ Frontend Views (Dashboard, Session, Journal, Muscles, Learn, Weekly, Habits, Settings, Inbox)
- ✅ Swipe-Navigation + Gym Mode (layout scaling)
- ✅ Shared src/ für lokal + PWA (via @src Alias)
- ✅ Dual DB-Layer (src/lib/db/local/ + src/lib/db/firebase/)
- ✅ wger Integration (vollständig als Backend)
- ✅ yuhonas Integration (Bilder, Varianten)
- ✅ Katalog-Struktur in catalog/kb/ (Exercises, Anatomy Teaching, Rules, Maps)
- ✅ Pytest-Suite (catalog/tests/)
- ✅ Session dual-write (JSON + SQLite via better-sqlite3)
- ✅ BodyMap in Session-View (nur done exercises)
- ✅ Gmail-Pipeline (bin/fitness-mail, Fitbit-Daten)
- ✅ Firestore Sync (`/firestore/status` + `/firestore/sync`, firebase-admin, Creds: `~/.env/firebase-fitness.json`)
- ✅ PWA Offline-Unterstützung (SW + IndexedDB offline-queue)
- ✅ Firebase PWA: Sourcen direkt im Root, `npm run build:firebase` → `~/fitness/dist-firebase/` (pwa/ als pwa.bak/ archiviert)
- ✅ anatomy-kb Integration (als Git Subtree integriert, :9200)
- ⏳ AI Agent Workflow (Gemini → anatomy_teaching YAML-Generierung)
- ⏳ body_highlighter_bridge.yml enabled: true (granulare Muskel-Visualisierung)
- ⏳ Coverage-Granularität (primary/secondary/stabilizer)
- ⏳ Anatomie-Lehre für alle Übungen (~28 von ~50+ im Katalog)
- ⏳ npm workspaces (root + pwa/ + arena/ als Workspace-Pakete)

---

## Code-Review 2026-06-07: catalog/catalog

### Kritische Bugs (sofort fixen)

**catalog/catalog/server.py** (:9120) — `import yaml` fehlt (wird in `handle_inbox_approve` auf Zeile ~289 genutzt). Crash beim `/inbox/{id}/approve` Endpoint. Außerdem `from loguru import logger` fehlt (verwendet auf Zeilen ~309, ~314).

**kb_sync.py** — `log_err()` ist undefiniert (Zeile ~178). Sollte `logger.error()` sein. Crash beim KB-Sync.

**catalog/catalog/server.py `handle_export`** — `data['query']`, `data['plan']` etc. ohne `.get()` → `KeyError` wenn Client-Body unvollständig. Alle `data[key]`-Zugriffe auf `data.get(key)` umstellen.

### Duplikationen (medium, aufräumen)

- `normalize_text()` ist identisch in `resolver.py` und `wger.py` definiert → in `yaml_utils.py` oder eigenes `utils.py` zentralisieren.
- `load_runtime_config()` identisch in `wger.py` und `obsidian.py` → zentral in `paths.py`.
- `find_exercise()` / `find_by_id()` ähnliche Logik in `coach_sheet.py`, `obsidian.py`, `wger.py`.
- `load_muscle_taxonomy()` doppelt in `audit.py` und `coverage.py`.
- `format_list()` doppelt in `obsidian.py` und `coach_sheet.py`.

### Architektur-Beobachtungen

- Modul-Aufteilung insgesamt sauber: Server, CLI, Tools klar getrennt.
- `auditor.py` vs `audit.py`: `auditor.py` ist Writer (Bericht erstellen), `audit.py` ist CLI-Command. Trennung macht Sinn.
- `ingestor.py` wird nur von `watcher.py` genutzt — kein toter Code.
- Lokaler Import in `watcher.py` in while-Schleife (Zeile ~232): Anti-Pattern, funktioniert aber.
- `history.py` hat keinen `UNIQUE`-Constraint auf `training_history` — parallele Schreiber könnten Duplikate erzeugen. `INSERT OR IGNORE` prüfen.

### HTTP-Endpoint-Status (catalog/catalog/server.py :9120)

Alle Endpoints bis auf `POST /export/{kind}` und `POST /inbox/{id}/approve` sind fehlerfrei. Die beiden sind durch obige Bugs betroffen.

---

## Dispatcher

Jedes neue Skript/Tool in diesem Repo gehört als Option in den zentralen Dispatcher — nicht als loses Standalone-Script.
Bei Bash vs. Python: Python bevorzugen. Deps: `typer` + `loguru` + `gum`-Fallback für TUI.
Referenz-Implementierung: `~/aos-dev/bin/bridge-devctl menu`

| Dispatcher | Typ | Funktion |
|---|---|---|
| `fitness-devctl` | python3 | **Server-Controller** (start/stop/restart/status/logs/deploy → /opt) — **bevorzugter Einstieg für alles Servermässige** |
| `~/fitness/bin/fitness` | python3 | **Terminal-facing dispatcher** im PATH (session/journal/coverage/gaps/search/stats) |
| `fitnessctl` | bash | Legacy domain CLI (catalog, sessions, coverage, gaps, search) |

`fitness-devctl` = reiner Service-Controller + Deploy. Neues Skript mit Serverlogik → hierher.
`~/fitness/bin/fitness` = Day-to-day Domain-CLI. Liest direkt aus `~/.aos/fitness/sessions/` — kein laufender Server nötig. Neue fachliche Sub-Commands → hierher (typer).
`fitnessctl` (bash) ist legacy — wird langfristig durch `fitness` + `fitness-devctl` abgelöst.

### HTTP-Fallback-Modul

`fitness_cli/http.py` — sauberes Python-Modul (`import fitness_cli.http as _http`).
Wird von `bin/fitness` via `_try_http()` aufgerufen wenn direkte Datei-Lese fehlschlägt.
Ziel: Node-Server `:9100` (env: `FITNESS_NODE_PORT`).

```python
from fitness_cli import http as _http
_http.session_today()        # GET /session?date=today
_http.session_get(date)      # GET /session?date=YYYY-MM-DD
_http.session_list(limit)    # GET /session/history?limit=N
_http.coverage(days)         # GET /coverage?days=N
_http.gaps(days)             # GET /coverage/gaps?days=N
_http.search(query)          # GET /exercises/search?q=...
```

---

## Git Status (2026-07-20)

**Lokales Repo:**
- **dev branch** — aktiver Entwicklungs-Branch (2026-07-20: TUI Import-Fix gepusht)
- **master branch** — Produktions-Branch (gemergt von dev, 2 Commits ahead von origin/master)

**vitalos Meta-Repo:**
- ⚠️ **fitness-app Submodul-Pointer beschädigt** — detached HEAD, geänderte Dateien (public/manifest.json, public/sw.js)
- Status: 2 Commits ahead von origin/master
- Notwendig: Submodul-Pointer aktualisieren oder Abhängigkeiten klären
