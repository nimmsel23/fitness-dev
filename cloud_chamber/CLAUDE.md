# cloud_chamber/ — VitalOS Shell

VitalOS ist die unified PWA-Shell für alle VOS-Apps. Deployed auf `vitalos.web.app`.
Firebase-Projekt: `fitness-aos`. Alle Apps teilen denselben Firestore.

---

## Verzeichnisstruktur

```
cloud_chamber/
  vitalos/             — VitalOS Shell (React + Vite, deployed zu vitalos.web.app)
  journal-vos/         — Journal + Habits Source (via @journal-vos Alias in vitalos)
  learn-vos/           — Learn Source (via @learn-vos Alias in vitalos)
  fitness-vos/         — Fitness Source (Referenz-Kopie aus fitness-dev/src)
  habit-vos/           — Habits Source (eigenständige Kopie)
  federation/          — Shims + Legacy Module Federation Experimente
  vos_deploy/          — Python Deploy-Helfer (Firebase, Git)
  public/              — Shared Assets (manifest.json, Icons)
  rules/               — Firestore Security Rules
  docs/                — Architektur-Doku
  firestore_watcher.py — Firestore Change Listener
  analytics_watcher.py — Analytics Listener
  list_users.py        — Nutzer-Listing
  set_admin.py         — Admin-Rechte setzen
```

---

## VitalOS Shell (`vitalos/`)

### Navigation

Zwei Ebenen:

**Haupt-Nav** (immer sichtbar in Sidebar + MobileNav):

| Tab | Inhalt |
|-----|--------|
| `fitness` | FitnessApp — eigene Sub-Nav: Heute / Training / Review |
| `fuel` | FuelWrapper → FuelApp (fuel-dev Shim) — eigene Sub-Nav: Dashboard / Food / Kalender / Supps / Mikros |
| `journal` | JournalView aus journal-vos |
| `habits` | HabitsView aus journal-vos |
| `learn` | LearnView aus learn-vos |
| `settings` | VitalOS Settings |

**Sub-Nav** (in Desktop-Sidebar wenn Sub-App aktiv):
- Shell-Modus (journal/habits/learn/settings): fette Haupt-Nav, keine Sub-Nav
- Sub-App-Modus (fitness/fuel): schmale Icon-Row als Haupt-Nav + fette Sub-Nav darunter

### Build & Deploy

```bash
cd cloud_chamber/vitalos

npm run build           # Lokaler Build → dist/
npm run build:firebase  # Firebase Build → dist-firebase/ (SW-Version + manifest bump)

firebase deploy --only hosting:vitalos   # → vitalos.web.app
```

### Zwei Build-Modi

| Modus | `@db` Alias | Output |
|-------|-------------|--------|
| lokal (`npm run build`) | `src/db.js` (Node-Server :9100) | `dist/` |
| firebase (`--mode firebase`) | `src/db.firestore.js` (Firestore SDK) | `dist-firebase/` |

### Vite Alias-Architektur (`vite.config.js`)

```
@src          → vitalos/src/
@db           → vitalos/src/db.js  (oder db.firestore.js im firebase-mode)
@utils        → vitalos/src/lib/utils.js
@fuel         → fuel-dev/src/client/
fuel/FuelApp  → federation/FuelApp.jsx  (Shim ohne SW-Registration)
@journal-vos  → journal-vos/src/           (Legacy — wird durch @view/* ersetzt)
@learn-vos    → learn-vos/src/             (Legacy — wird durch @view/* ersetzt)
```

**Tab-Source-Aliases** (eine Zeile = ein Tab, Herkunft sofort sichtbar):

```
@view/dashboard  → vitalos/src/views/Dashboard/          vitalos-spezifisch
@view/session    → fitness-dev/src/views/Session/         fitness-dev SSOT
@view/review     → vitalos/src/views/WeeklyReview/        vitalos-spezifisch
@view/muscles    → vitalos/src/views/Muscles/             vitalos-spezifisch
@view/learn      → fitness-dev/src/views/Learn/           fitness-dev SSOT
@view/journal    → journal-vos/src/views/Journal/         journal-vos → fitness-dev symlink
@view/habits     → journal-vos/src/views/Habits/          journal-vos → fitness-dev symlink
@view/settings   → vitalos/src/views/Settings/            vitalos-spezifisch
@view/coach      → vitalos/src/views/Coach/               vitalos-spezifisch
```

**Regel:** Neue Tabs bekommen einen `@view/<name>` Alias. Herkunft (vitalos vs. fitness-dev vs. journal-vos) im Kommentar.

**src/shell/** — vitalos-spezifische Shell-Komponenten (Sidebar, VitalOSSidebar). Nicht aus fitness-dev.

**src/components/, src/lib/** — Symlinks auf fitness-dev/src/. Wenn ein Component für vitalos angepasst werden muss: in `src/shell/components/` legen, Import anpassen, Symlink bleibt für alle anderen.

**journalDbPlugin**: Intercepts `@db`-Imports aus `/journal-vos/`-Dateien → leitet auf
`journal-vos/src/db.js` (oder `db.firestore.js`) um. Fitness-Context und Journal-Context
bekommen so je eigenen DB-Adapter im selben Bundle.

**dedupe**: `react`, `react-dom`, `@tanstack/react-query` — verhindert doppelte
React-Instanzen wenn fuel-dev Components eingebunden werden.

### State-Management

Sub-Tab-State lebt in `App.jsx` und wird nach unten durchgereicht:

```
App.jsx
  fitnessTab / setFitnessTab  → FitnessApp (subTab/onSubTab)
  fuelTab / setFuelTab        → FuelWrapper (subTab/onSubTab) → Zustand-Store (@fuel/store.js)
  SUB_NAV[tab]                → Sidebar (subNav/subTab/onSubTab)
```

FuelWrapper synct bidirektional: Sidebar-Klick → Zustand-Store, interne Fuel-Navigation → `onSubTab` zurück zu App.

### Mobile Layout System

Zwei Mobile-Layouts, umschaltbar via Settings → Advanced → Mobile Layout (gespeichert in `localStorage`):

| Layout | Komponente | Beschreibung |
|--------|-----------|--------------|
| `classic` | `MobileNav.jsx` | Bottom-Bar Navigation (bisheriges Layout) |
| `fuel` | `FuelMobileLayout.jsx` | Glassmorphism Header + horizontale Pill-Tabs in Thumb-Zone + AnimatePresence |

**`src/shell/layout/MobileShell.jsx`** — Switcher-Component. Rendert je nach `mobileLayout`-Prop entweder `FuelMobileLayout` oder `MobileNav`. Modular: beide Layouts bleiben parallel erhalten.

**`FuelMobileLayout`** — Inspiration: fuel-dev Frontend. Der Header-Card schiebt die Pill-Tabs ergonomisch in den Daumen-Bereich. `framer-motion` für Tab-Transitions (`AnimatePresence mode="wait"`).

**`Views`** (in `App.jsx`) — internes Helper-Component das View-Rendering für beide Layout-Pfade dedupliziert. `compact`-Prop reduziert Padding im Fuel-Layout.

### Firebase Auth

- Alle Apps teilen dieselbe Firebase-Instanz (`fitness-aos`)
- `fuel-dev/src/client/lib/firebase.js`: `getApps().length > 0` → kein Re-Init
- `FuelWrapper` wartet auf `getAuth().currentUser` bevor FuelApp gemounted wird
- COOP-Header `same-origin-allow-popups` in `firebase.json` (Chrome-Warnung beim Popup-Close ist cosmetic)
- Authorized Domains: vitalos.web.app, fitness-vos.web.app, fuel-vos.web.app, journal-vos.web.app

---

## Micro-App Sources

### `journal-vos/src/views/`
- `Journal/` — Tages-Journal (Markdown)
- `Habits/` — Habit-Tracking mit Konsistenz-Grid, Journal-Modal, Coach-Feedback
  - Mobile: HabitSidebar als Bottom Sheet (`max-h-[85dvh]`, slide von unten)
  - Desktop: HabitSidebar als rechtes Panel (`sm:w-80 lg:w-96`)

### `learn-vos/src/views/`
- `Learn/` — Anatomie-Lehre aus `catalog/kb/anatomy_teaching/`

---

## `federation/` — Shims

`federation/FuelApp.jsx` ist der aktive Shim für VitalOS:
- Kein `createRoot`, kein `useRegisterSW`, kein eigenständiger Auth-Flow
- Importiert fuel-dev Internals via `@fuel` Alias
- Wraps in eigenen `QueryClientProvider` (fuel braucht keinen von VitalOS)
- Alias in vite.config.js: `fuel/FuelApp` → `federation/FuelApp.jsx`

Die restlichen Dateien (`*.remote.vite.config.js`, `*.bak`) sind Legacy aus dem
Module-Federation-Experiment. Nicht löschen, aber auch nicht aktiv nutzen.

---

## Systemgrenze (nicht verhandelbar)

AlphaOS (Core4, Bridge, Door, Game) ≠ VitalOS (Fitness, Fuel, Journal, Habits, Learn).
Kein geteilter Code, keine gemeinsamen Ports, nur gemeinsame Philosophie.

---

## Arbeitsregeln

- Änderungen an VOS-Views in `journal-vos/`, `learn-vos/` — nicht in `vitalos/src/` direkt
- Fitness-Views leben in `vitalos/src/views/` (aus fitness-dev kopiert, weiterentwickelt hier)
- `federation/FuelApp.jsx` ist der Canonical Fuel-Shim — bei fuel-dev Änderungen prüfen ob Shim noch passt
- Firebase-Version muss in `fitness-dev/package.json` und `fuel-dev/package.json` übereinstimmen (aktuell: `^11`)
- Build vor Deploy immer prüfen (`✓ built in Xs` ohne Fehler)
