# Handoff Report: fitness-pwa Firebase — Port von fitness-dev
**Datum:** 2026-05-20
**Für:** Gemini (Google Cloud Shell)

---

## Aufgabe

Portiere die Views von `fitness-dev/src/views/` nach `fitness-dev/pwa/src/views/`.
Die UI-Logik bleibt identisch. Nur die Datenschicht wechselt: `fetch('/api/...')` → Firestore `db.js`.

---

## Ein Repo

Alles liegt in **`~/fitness-dev/`** (`github.com/nimmsel23/fitness-dev`):

```
fitness-dev/
├── src/views/          ← Quelle (Node.js API-Calls)
├── pwa/src/views/      ← Ziel (Firestore db.js-Calls) — aktuell Stubs
├── pwa/src/db.js       ← Firestore Data Layer
├── firestore-mirror.mjs ← dual-write: Node → Firestore (Session + Journal)
└── server.mjs          ← lokaler Node-Server :9100 (unverändert)
```

**Deployed:** https://fitness-aos.web.app (auto-deploy bei push via `.github/workflows/deploy-pwa.yml`)

---

## Dual-Write bereits aktiv

`server.mjs` schreibt Sessions und Journal automatisch nach Firestore:
- `POST /session` → JSON + SQLite + **Firestore** (`fitness/default/sessions/{date}`)
- `POST /journal` → Markdown-File + **Firestore** (`fitness/default/journal/{auto-id}`)

D.h. ab sofort landen alle lokalen Trainings-Saves auch in Firestore.

---

## Verfügbare db.js Funktionen

```js
// Sessions
getSession(date)               // → { date, block, exercises[], effort, mood, notes }
saveSession(date, sessionData) // → { ok: true }
getRecentSessions(n)           // → Session[]

// Plan
getPlan()
savePlan(plan)

// Journal
getJournal(date)               // → Entry[]
saveJournal(date, text, tags)

// Body
getBodyEntry(date)

// Knowledge Base (Firestore)
getExercise(exerciseId)
getAllExercises()               // → Exercise[]
getAnatomy(exerciseId)

// KB Sync Trigger (anatomy-kb Server lokal)
triggerKbSync({ dry })         // → POST :9200/api/firestore/sync
```

---

## Was zu portieren ist

| View | Quelle | Hauptänderung |
|------|--------|---------------|
| Dashboard.jsx | `src/views/Dashboard.jsx` | `fetch('/session')` → `getSession()` + `getPlan()` |
| Session.jsx | `src/views/Session.jsx` | `fetch('/session', POST)` → `saveSession()` |
| Journal.jsx | `src/views/Journal.jsx` | `fetch('/journal')` → `getJournal()` + `saveJournal()` |
| Muscles.jsx | `src/views/Muscles.jsx` | `fetch('/coverage/detailed')` → `getRecentSessions()` client-seitig |
| Learn.jsx | `src/views/Learn.jsx` | `fetch('/exercises/search')` → `getAllExercises()` + `getAnatomy()` |
| WeeklyReview.jsx | `src/views/WeeklyReview.jsx` | `fetch('/fitness/weekly')` → `getRecentSessions()` client-seitig |

---

## Einschränkungen

| Feature | Status in PWA |
|---------|--------------|
| Coverage (weighted) | ❌ anatomy-kb :9200 lokal only → frequency-Annäherung |
| wger Exercise-Suche | ❌ lokal only → nur Firestore KB (`getAllExercises()`) |
| BodyMap | ✅ react-body-highlighter, gleich wie fitness-dev |
| KB Lessons | ✅ wenn KB-Sync gelaufen ist (`triggerKbSync()`) |

---

## Deploy

```bash
cd ~/fitness-dev/pwa
npm run build
git add -A && git commit -m "..." && git push
# → GitHub Actions: .github/workflows/deploy-pwa.yml → fitness-aos.web.app
```

---

## Session-Format (identisch lokal + Firestore)

```json
{
  "date": "2026-05-20",
  "block": "Push",
  "exercises": [
    {
      "exercise_id": "incline_dumbbell_press",
      "name": "Schrägbankdrücken",
      "sets": "3", "reps": "8", "weight": "30",
      "primaryMuscles": ["Chest"],
      "secondaryMuscles": ["Shoulders", "Triceps"],
      "isHIT": false,
      "done": true
    }
  ],
  "effort": 8,
  "mood": "",
  "notes": "",
  "saved_at": "..."
}
```
