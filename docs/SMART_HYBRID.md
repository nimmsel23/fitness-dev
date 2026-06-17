# Smart Hybrid — Local vs Firebase

This is how the data layer is structured. Read this before touching
`src/db.js`, `src/db.firestore.js`, `src/api.js`, `vite.config.js`, or
the alias `@db`.

---

## Core principle

**Two `db.js` files, one per deploy target, both monoliths, identical
public API.** Views import via `@db` and don't know which one they got.

```
src/db.js            ← Local-Hybrid Monolith (Node-API + localStorage mix)
src/db.firestore.js  ← Firestore Monolith (pure Firebase SDK)
```

A Vite mode alias decides which one resolves to `@db`:

```js
// vite.config.js
const isFirebase = mode === 'firebase'
alias: {
  '@db': resolve(isFirebase ? './src/db.firestore.js' : './src/db.js'),
}
```

```
npm run dev              → @db = src/db.js (local)
npm run build            → @db = src/db.js (local) → dist/
npm run build:firebase   → @db = src/db.firestore.js → dist/
npm run deploy:firebase  → build:firebase + firebase deploy --only hosting
```

---

## Local vs Firebase

|                     | Local (dev)                                       | Firebase (prod)                          |
| ------------------- | ------------------------------------------------- | ---------------------------------------- |
| Build               | `npm run dev` / `npm run build`                   | `npm run build:firebase`                 |
| URL                 | localhost:5902                                    | https://fitness-aos.web.app              |
| Backend             | Node `:9100` + tools (`:9120` resolver, wger)     | Firestore Cloud (direct)                 |
| `@db` resolves to   | `src/db.js`                                       | `src/db.firestore.js`                    |
| `isLocalMode()`     | `true`                                            | `false`                                  |
| `getUid()`          | `"local"` (stub)                                  | real Firebase UID                        |
| Auth                | stubs (instant-OK with Local-User)                | real (Google + email/password)           |
| Sessions storage    | Node `~/.aos/fitness/sessions/*.json`             | Firestore `fitness/{uid}/sessions/{date}`|
| Habits storage      | Node API + localStorage overlay                   | Firestore `fitness/{uid}/habits/*`       |
| Plan/Settings/Layout/Body/HabitJournals | localStorage only         | Firestore                                |
| KB (exercises/anatomy/muscles) | Node `:9100` + Python resolver `:9120` | Firestore `fitness/kb/*`                 |
| Coach-Backend section in Settings | shown                              | hidden                                   |

**Both are independent.** Firebase doesn't need your local Node running.
Local doesn't need Firebase. Data sync between the two (catalog pushes,
mirror-back to markdown) is done by **separate scripts you trigger as
coach**, not by the app itself.

`local = dev, firebase = prod` — **not** `local = coach, firebase = clients`.
Local is where you build and test. Firebase is the actual app you and
your client use daily. Same surface, same features. No extras on either
side.

---

## What lives where

### Always-needed contract (must match in both `db.js` files)

Public API surface. Views call these and must get the same shape back:

```
// Auth / mode
watchAuth, signIn, signInEmail, signUpEmail, signOut, getUid, isLocalMode

// Sessions
getSession, saveSession, getRecentSessions, getLatestSession,
getSessionHistory, getPlan, savePlan

// Journal
getJournal, saveJournal, updateJournal,
getHabitJournal, getHabitJournalHistory, getAllHabitJournalsForDate,
saveHabitJournal

// Habits
getHabits, addHabit, deleteHabit, updateHabit,
getHabitRecordsForDate, recordHabit, unrecordHabit

// Knowledge Base
getExercise, getAllExercises, getAnatomy, getMuscle, sendToInbox

// Analysis
getMuscleCoverage, getCoverageGaps, getWeeklyReport, getProgressTrend,
muscleToGroupIds, MUSCLE_GROUPS, ACTIVITY_MUSCLE_MAPPING

// Settings / Layout / Body
getSettings, saveSettings, getLayout, saveLayout,
getBodyEntry, saveBodyEntry, getBodyEntries

// Helpers (pure functions, identical in both)
todayISO, localToday, getWeekDates,
downloadText, num,
parseQuick, exportCsv
```

If you add a function to one file you must add it to the other. Otherwise
the firebase build breaks silently in production.

### Views are blind

Views in `src/views/*` and components in `src/components/*` import via:

```js
import { getHabits, watchAuth, ... } from "@db";   // good
import { ... } from "../../db.js";                  // also fine, same target
```

They never check which backend is active. They just call `getHabits()`
and render the result. The mode flag `isLocalMode()` is checked in only
a few UI-divergence cases:

- `Settings/index.jsx` — shows/hides Coach-Backend admin section
- `Habits/HabitItem.jsx` — `canEdit = isLocalMode() || !isCoachHabit`

Adding more `isLocalMode()` branches in views is usually a sign of an
abstraction leak. Prefer to absorb the divergence inside `db.js`.

---

## Rules (please follow)

1. **Never put both backends in the same file.** No `if (isLocalMode())`
   branches inside `db.js` to call either Node or Firestore depending on
   mode. The whole point is two separate files.

2. **Never fractalize `db.js` into `lib/db/*` modules again.** The 2026-05
   modularization (`209cbf7`, `1b2b561`) made `sync-views.mjs` plausible
   and ate the production data layer. Monolith is intentional.

3. **`scripts/sync-views.mjs` is permanently disabled** (`3063ee9`). It
   used to copy `src/views/*` + `src/lib/db/*` → `pwa/src/*`, which
   overwrote Firestore code with Node-API code every run. If you think
   you need cross-tree sync, you don't. There is no other tree.

4. **Adding a function: do both files at once.** Public API parity is
   the contract. CI-style check: `node -e "for k in keys(db.js) { assert
   keys(db.firestore.js) includes k }"` — write this if you keep
   forgetting.

5. **Views must not bypass `@db`.** Calling `api.get('/some/node/path')`
   directly from a view breaks in firebase build (calls hit the noop
   shim, return null, silent failure). If a view needs a function, add
   it to both `db.js` files.

6. **No `@db` magic in CLAUDE.md.** The original docs talked about a
   `db.local.js` + `db.firebase.js` Vite alias swap. The actual working
   pattern is the one in this doc. CLAUDE.md should describe **this**
   architecture, not the aspiration.

---

## Critical files

| Path                           | Role                                              |
| ------------------------------ | ------------------------------------------------- |
| `src/db.js`                    | Local-Hybrid entry — currently a barrel to `src/lib/db/*`. Kept as-is during recovery; the modularization predates the smart-hybrid docs but the views work against this surface |
| `src/db.firestore.js`          | Firestore monolith — sourced 1:1 from `pwa.bak/src/lib/db/*` (last working state at `5d9086c`, before `pwa/` was dissolved) |
| `src/api.js`                   | Thin HTTP transport for the local backend. Re-exports `db.api` so the noop-shim in firebase mode flows through transparently |
| `src/firebase.js`              | Firebase Web SDK init (Firestore + Auth + Google Provider) |
| `firebase.config.js`           | Real Web SDK config (apiKey etc). Gitignored. Generate via `firebase apps:sdkconfig WEB <appId> --project fitness-aos` |
| `firebase.config.js.template`  | Empty template, committed                         |
| `firebase.json` / `.firebaserc`| Hosting config (public `dist/`) + default project `fitness-aos` |
| `vite.config.js`               | Mode-aware `@db` alias (`mode === 'firebase'`)    |
| `scripts/sync-views.mjs`       | **DISABLED**. Do not re-enable                    |
| `pwa.bak/`                     | Reference dump of last good pwa-tree from `5d9086c`. Gitignored via `*.bak`. Mining material if you need to verify a function's original Firestore implementation |

---

## Historical note (what broke)

```
2026-05-24  d9c7905   pwa/ migrates to Firestore (good)
2026-05-30  209cbf7   pwa/src/db.js fractalized into pwa/src/lib/db/* (start of the problem)
2026-06-04  5ed26c7   sync-views.mjs created — sync src→pwa (poison)
2026-06-06  1b2b561   src/db.js fractalized into src/lib/db/* (mirroring pwa fractal)
                      sync-views now has symmetric targets to corrupt
2026-06-08  2cb5de1   "v3.1 unified" — pwa/ deleted entirely
                      Firestore data layer LOST in src/
2026-06-12             this recovery: restore Firestore monolith as src/db.firestore.js,
                       wire vite mode alias, disable sync-views permanently
```

Lesson: modularization is not free. When you have two parallel
implementations of the same interface, monolith on each side is the
defensive shape. Modular pieces look symmetric across trees; a sync
script will see the symmetry and "fix" the asymmetry of intent. A
monolith file cannot be sloppily synced module-by-module — its shape
itself is the asymmetry.
