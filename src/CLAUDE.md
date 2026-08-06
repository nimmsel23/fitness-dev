# CLAUDE.md — fitness-app/src

React + Vite Frontend. Übergeordneter Kontext: `../CLAUDE.md` (Repo-Root),
Python-Backend-Details: `../fitness/CLAUDE.md` (API/Dispatcher) und
`../fitness/catalog/CLAUDE.md` (KB/Katalog-Tool-Set).

---

## Tabs (`NAV_ITEMS`, `constants/NavigationItems.js`)

| Tab-ID | Label | View | Anmerkung |
|--------|-------|------|-----------|
| `dash` | Heute | `views/Dashboard/` | Standard-Einstieg |
| `session` | Training | `views/Session/` | Workout-Logging mit Live-BodyMap |
| `habits` | Habits | `views/Habits/` | HabitSync-Integration |
| `journal` | Journal | `views/Journal/` | Text-Notizen |
| `review` | Review | `views/WeeklyReview/` | Charts + Wochenrückblick |
| `learn` | Lernen | `views/Learn/` | Anatomie-Lehre (aus `fitness/catalog/kb/`) |
| `settings` | Setup | `views/Settings/` | Themes, Split, Nav-Modus etc. |

**Versteckte Views** (nicht in Nav, per URL erreichbar): `views/Coach/`
(`#coach`), `views/AppGate.jsx` (Hub-Homescreen, nur `navMode=home` als `#gate`).

**Nicht verlinkt** (Code vorhanden, kein aktiver Tab): `views/Inbox/`
(Exercise-Inbox, Genehmigung neuer KB-Einträge).

**Aktive Sub-View ohne eigenen Haupt-Tab:** `views/Muscles/` —
Superkompensations-Analyse + Body-Map, AKTIV als Subtab `muscles` in
WeeklyReview. ⚠️ NIEMALS als "inaktiv" markieren. Sub-Komponenten:
MuscleAnalysis, MuscleBodyMap, MuscleDetailedMap, MuscleInsights, MuscleHeader.

**Cross-Repo-Symlink-Pattern** (`views/Journal`, `views/Habits`, `views/Learn`):
Symlinks auf Sibling-Repos (`journal-dev`, `habits-dev`, `learn-dev`), weil
`App.jsx` sie per relativem Import einbindet (`./views/Journal/index.jsx`), was
eine physische Datei verlangt. Fuel dagegen rein über `@fuel`-Vite-Alias (kein
Symlink). Geplante Umstellung (noch nicht umgesetzt): `App.jsx` auf
`@journal`/`@habits`/`@learn`-Aliase umstellen + Symlinks entfernen, dabei
`tailwind.config.cjs`-`content`-Array um die externen Sibling-Pfade erweitern
(wie `fuel-dev/tailwind.config.cjs`), damit fitness-devs eigenes Theme greift.
`Habits`/`Journal`-Views nutzen an vielen Stellen hartcodierte Fuel-Branding-
Klassen (`text-orange-400` etc.) statt `fit-*`-Tokens — unabhängig vom
Symlink-Thema, muss in `habits-dev`/`journal-dev` selbst gefixt werden.

---

## Struktur

**`components/`**:
- `layout/` — Sidebar (Desktop), MobileNav (Bottom-Bar)
- `common/` — ErrorBoundary, UserProfile
- `dashboard/` — ActivityHeatmap, DashboardWidget, MuscleCoverage, SessionStatus u.a.
- Flat (shared): ExerciseSearchOverlay, BodyMap, PlanBuilder, HabitWidget, ExerciseInsightModal, WeightChart, AnatomyDetailModal

**`lib/db/`** — Dual DB-Layer (flach, kein Local/Firebase-Unterverzeichnis):
- `core.js` — api helpers (fetch Wrapper), auth stubs (lokal), `isLocalMode()`, `watchAuth()`
- `sessions.js` — getSession, saveSession, getRecentSessions, getProgressTrend, getPlan, getPlanSuggestion
- `journal.js` — getJournal, saveJournal, getJournalHistory
- `habits.js` — getHabits, recordHabit, unrecordHabit
- `kb.js` — getExercise, getAllExercises, searchExercises, getAnatomy
- `analysis.js` — getDashboardAnalytics, getMuscleCoverage, getWeeklyReport, getCoverageGaps
- `user.js` — getSettings, saveSettings, getBodyEntry, getBodyEntries
- `utils.js` — parseQuick, exportCsv

**`@db` Vite-Alias** (`vite.config.js`):
- Default-Build: `@db` → `src/db.js` (Barrel für `lib/db/*.js`, alle Calls → Node-Server :9100, lokal/Coach, kein Auth-Gate)
- Firebase-Build (`npm run build:firebase`): `@db` → `src/db.firestore.js` (Single-File, direkte Firestore SDK), Output nach `~/fitness/dist-firebase/`

Dev-Port 5902, Proxy zu Backend-API-Routen (:9100).

**BodyMap in Session:** Zeigt nur Muskeln von Exercises mit `done: true`. Kein
Preview, kein Plan — nur was bereits abgehakt ist.

---

## Drei Body-Highlighter (NICHT verwechseln)

| Bibliothek | Komponente | Datenformat | Verwendet in |
|------------|------------|-------------|--------------|
| `react-body-highlighter` | `BodyMap.jsx` | `[{ slug, muscles: [slug], frequency: 1–4 }]` | Dashboard MuscleBody, Muscles/MuscleBodyMap |
| `react-muscle-highlighter` | `DetailedMuscleMap.jsx` | `[{ slug, color: '#hex' }]` | Dashboard MuscleBody, Muscles/MuscleDetailedMap |
| `body-muscles` BodyChart | `BodyMusclesMap.jsx` | `{ [granularId]: { intensity: 0–10, selected: bool } }` | Learn/Explorer |

**groupScores** ist das interne Format zwischen DB-Layer und Komponenten:
`{ [groupName]: { score: 1–4, color: '#hex' } }` — score für RBH frequency,
color für react-muscle-highlighter direkt.

**Stale-Doc-Fund (2026-08-06):** Dieser Absatz behauptete bis eben, `lib/muscleMapping.js`
(RBH_SLUGS/SLUG_TO_GROUP) sei noch aktiv und hartcodiert — die Datei existiert
im laufenden Code längst nicht mehr, abgelöst durch `lib/muscleMap.js`
(`useMuscleMap()`), das live von `/fitness/muscles/viz` (`fitness/api/routers/
exercises.py`) liest, welches wiederum dynamisch aus `kb/muscles/*.yml`
aufbaut (`iter_muscle_documents()`, `muscle_index.yml`) — keine Region-Priorität
hartcodiert, sortiert nach aufsteigender Mitgliederzahl der Region-Bucket-
Dateien (kleine/spezifische zuerst, `back.yml`/`legs.yml` als Fallback zuletzt).
`src/views/Muscles/AUDIT.md` und `fitness/catalog/ARCHITECTURE.md` hatten diesen
Übergang bereits korrekt festgehalten — nur diese eine Datei war seit dem
Refactor nie nachgezogen worden. Lehre: Doku-Claims zu Architektur-Schuld vor
dem Weiterverwenden gegen den aktuellen Code prüfen, auch wenn andere Docs im
selben Repo sich widersprechen könnten (ein einzelnes CLAUDE.md ist keine
verlässliche SOT für sich allein).

---

## Superkompensation — HIT-Zeitfenster

| Phase | Zeitfenster | score | color |
|-------|-------------|-------|-------|
| Stark belastet | 0–3 Tage | 1 | `#ef4444` |
| Erholung | 3–7 Tage | 2 | `#f59e0b` |
| Superkompensation (Peak) | 7–14 Tage | 3 | `#22c55e` |
| Fenster schließt sich | 14–21 Tage | 4 | `#3b82f6` |

Cardio: kürzer (≤1d→1, ≤4d→2, ≤10d→3, kein Blau). Kraft überschreibt Cardio am
selben Tag. Implementiert in `buildLastTrainedMap()` + `superKompFreq()` in
`components/dashboard/MuscleBody.jsx`.

**Firestore-Session-Lookup:** `getWeeklyReport()` (`lib/db/firestore/analysis.js`)
muss `listSessionsForDate(date)` (Query auf das `date`-**Feld**) nutzen, nicht
`getSession(date)` (Direkt-Lookup auf die Dokument-ID) — `useSession.js`
(`handleNewSession()`) vergibt bei **jeder** neuen Session `String(Date.now())`
als ID-Suffix (Standardfall, nicht nur Mehrfach-Sessions), ein Direkt-Lookup auf
die reine Datums-ID findet das Dokument deshalb nie und fällt still auf den
leeren Stub `{ exercises: [] }` zurück.

**Firebase v9-modulares SDK:** `QueryDocumentSnapshot.ref`, nicht `.reference`
(das ist die alte v8/Namespaced-API und im v9-Import immer `undefined` —
Optional-Chaining danach rettet nichts, weil der Crash beim ersten
ungesicherten Zugriff selbst passiert).

**Firestore-Inbox-Writes:** `sendToInbox()` (`lib/db/firestore/kb.js`) muss das
`userId`-Feld mitschreiben — `firestore.rules` verlangt für Inbox-Writes von
Nicht-Coach-Usern `resource.data.userId == request.auth.uid`, sonst
Permission-Denied (leicht im try/catch verschluckt).

---

## Swipe / Gym Mode

**Swipe-Navigation** (Mobile): Links/Rechts wischen wechselt zwischen Views
(minSwipeDistance: 75px, jank-freier vertikaler Scroll-Lock, schließt
horizontal scrollbare/interaktive Elemente aus).

**Gym Mode**: `layoutScale` (50–150%) skaliert `document.documentElement.fontSize`
— für große Gym-Displays.

---

## PWA / Offline

**Service Worker** (`public/sw.js`, `fitness-v1`):
- Install: `public/` statische Assets vorcachen
- GET `/session*`, `/coverage*`, `/fitness/weekly`, `/plan/today`, `/blocks` → stale-while-revalidate
- Navigate → network-first + app-shell fallback
- Hashed Vite-Assets → cache-first + runtime fill
- Background Sync Tag `fitness-flush-queue` → flusht IDB-Queue beim Reconnect

**Offline-Queue** (`public/offline-queue.js`):
- IDB: `aos-offline-fitness` (stores: `queue`, `cache`)
- `window.aosOfflineQueue.fetch` — drop-in für `fetch`, von `api.js` genutzt
- GET offline → IDB-Cache zurückgeben statt Fehler
- POST offline → in Queue einreihen, Background Sync registrieren, 202 zurück
- Auto-flush beim `online`-Event

**Firestore Sync** (`firestore-mirror.mjs`, firebase-admin, Node-seitig):
- Creds: `~/.env/firebase-fitness.json` (Service Account), Projekt: `fitness-aos`
- Dual-write bei `POST /session` + `POST /journal` (fire-and-forget)
- `/firestore/status` → Verbindungsstatus; `/firestore/sync` → letzte 30 Sessions pushen

---

## Session-JSON-Format

`~/.aos/fitness/sessions/YYYY-MM-DD.json` — das Objekt, das Session-View
speichert/lädt:
```json
{
  "date": "2026-05-17",
  "block": "Push",
  "exercises": [
    {
      "exercise_id": "barbell_bench",
      "id": "barbell_bench",
      "name": "Barbell Bench Press",
      "sets": "", "reps": "", "weight": "", "note": "",
      "primaryMuscles": ["Chest"],
      "secondaryMuscles": ["Shoulders", "Triceps"],
      "isHIT": true,
      "done": true
    }
  ],
  "effort": 8, "mood": "", "notes": "",
  "saved_at": "2026-05-17T18:30:00Z"
}
```
`sets`/`reps`/`weight` sind Strings (leer wenn nicht eingetragen). `isHIT`
kennzeichnet HIT-Trainingseinheiten (kein Satz/Wdh-Tracking, Training bis zum
Muskelversagen).

**Response Pattern** (API): `{ ok: true, data: {...} }` oder `{ ok: false, error: "..." }`
