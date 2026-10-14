# Routen-Mapping alt → neu

Stand: Fork-Baseline `8f8b734` + Umstellung. Quelle der alten Routen: `src/lib/db/local/*`, `src/views/*`, `catalog-ui/src/*`.
Neue Routen: OpenAPI des Backends (`/openapi.json`, Typen in `src/lib/api/schema.d.ts`).
**Lücke** = kein Pendant im neuen Backend → Details und Wunschformat in [BACKEND-GAPS.md](BACKEND-GAPS.md).

## App (`src/`, lokaler Modus)

| Alte Route | Neue Route | Status | Wo |
|---|---|---|---|
| `GET /session?date=&id=` → `{data}` | `GET /api/users/{uid}/sessions/{doc_id}` (nackte Session) | umgestellt | `local/sessions.js::getSession` |
| `POST /session?date=&id=` | `PUT /api/users/{uid}/sessions/{doc_id}` (rev-Schutz, 409) | umgestellt | `local/sessions.js::saveSession` |
| `GET /sessions?date=` → `{sessions}` | `GET …/sessions?since=` + je Treffer `GET …/{doc_id}` | umgestellt (N+1) | `listSessionsForDate` |
| `GET /session/history?limit=` → `{sessions}` (volle Sessions) | `GET …/sessions?limit=` + je Treffer `GET …/{doc_id}` | umgestellt (N+1, Lücke #3) | `getRecentSessions` und alles darauf (`getSessionHistory`, `getExerciseHistory`, …) |
| `DELETE /session?date=&id=` | – | **Lücke #1** | `deleteSession` |
| `DELETE /session/activity?date=&index=` | – | **Lücke #2** | `deleteActivityAddon` |
| `GET /fitness/plan?template=…` → `{ok, plan}` | `GET /api/plan?template=&split=&day=&goal=` (Hülle `{ok, plan}` im Adapter) | umgestellt | `getPlanSuggestion({…})` |
| `GET /plan/today?date=` | – | **Lücke #4** | `getPlanSuggestion(date)` |
| `GET /fitness/search?q=&limit=&sources=` | `GET /api/catalog/exercises?q=&limit=` (ohne `sources`, Lücke #6) | umgestellt | `local/kb.js::searchExercises` |
| `GET /fitness/exercises/all` | – | **Lücke #5** | `getAllExercises`, Auswertungen (`analysis.js`) |
| `GET /fitness/exercises/{id}` / `all`-Suche | `GET /api/catalog/exercises/{id}` | umgestellt (reduzierte Felder, Lücke #6) | `getExercise` |
| `GET /fitness/coach/profiles` | `GET /api/clients` (Mapping auf `{uid:{displayName,uid,slug}}`) | umgestellt | `local/coach.js::getAllUserProfiles` |
| `GET /health` (Settings) | `GET /api/health` | umgestellt | `views/Settings/index.jsx` |
| `GET /firestore/status`, `POST /firestore/sync` (Push nach Firestore) | – (`POST /api/sync/pull` ist die Gegenrichtung) | **Lücke #7** | `views/Settings/index.jsx` |
| `GET/POST /fitness/body` | – | **Lücke #8** | `local/user.js` |
| `GET/POST /journal`, `GET /journal/list` | – | **Lücke #9** | `local/journal.js` |
| `/routines…` (CRUD, Exercises, Order) | – | **Lücke #10** | `local/coach.js`, `views/Plan/*` |
| `/workouts…` (CRUD, Exercises, Sets) | – | **Lücke #11** | `local/coach.js`, `views/Plan/WorkoutSession.jsx` |
| `/fitness/plans/assigned`, `…/completions`, `/fitness/coach/plans/…` | – | **Lücke #12** | `local/assignedPlans.js` |
| `/fitness/coach/macrocycles/{uid}` | – | **Lücke #13** | `local/macrocycles.js` |
| `/fitness/coach/feed`, `/fitness/coach/feedback`, `/fitness/coach/habit-cycle/{uid}` | – | **Lücke #14** | `local/coach.js` |
| `/fitness/inbox…` (Liste, queue, merge-candidates, approve, reenrich, link-source, merge-duplicates, DELETE) | – | **Lücke #15** | `local/inbox.js` |
| `/fitness/config`, `/exercise/{id}/teaching` (GET/POST), `POST /fitness/exercises/{id}` | – | **Lücke #16** | `local/kb.js` |
| `POST /fitness/export`, `GET /export/csv` | – | **Lücke #17** | `local/utils.js` |
| `GET /fitness/analytics/dashboard` | – | **Lücke #18** | `local/analysis.js::getDashboardAnalytics` |
| `GET /exercises` (Plan), `/theme`, `/blocks` | – | unklar/ungenutzt, nicht geprüft | `views/Plan/api.js` |
| `/tours/strava`, `/sixpack` | bleibt Node-Server (`server.mjs`, :9100) | nicht Teil des Python-Backends | Vite-Proxy `NODE` |

## Catalog-UI (`catalog-ui/`, Übersetzungstabelle in `src/api.js`)

| Alte Route | Neue Route | Status |
|---|---|---|
| `GET /health` | `GET /api/health` | umgestellt |
| `GET /exercises/search?q=` | `GET /api/catalog/exercises?q=` | umgestellt |
| `GET /exercise/{id}` → `{exercise}` | `GET /api/catalog/exercises/{id}` (Hülle im Adapter) | umgestellt |
| `POST /fitness/plan` `{template, goal}` → `{ok, plan}` | `GET /api/plan?template=&goal=` | umgestellt |
| `GET /fitness/weekly?week=` → `{ok, …}` | `GET /api/users/{uid}/analytics/weekly?week=` (UID = aktiver Coach) | umgestellt |
| `GET /fitness/exercises/all` | – | **Lücke #5** |
| `GET /coverage/detailed`, `/coverage/gaps` | – (`analytics/coverage` hat anderes Format) | **Lücke #19** |
| `POST /fitness/export/{weekly,plan,sheet,lesson}` | – | **Lücke #17** |
| `/fitness/inbox…` | – | **Lücke #15** |

## Firebase-Modus
Unberührt: `@db` → `src/lib/db/index.firestore.app.js`, kein Backend im Pfad. Einzige Änderung im Umfeld: Service Worker (s. README).
