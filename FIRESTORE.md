# Firestore — fitness-dev

Stand: 2026-05-21

Firebase-Projekt: **fitness-aos** (GCP, eur3)
PWA: **https://fitness-aos.web.app**
Single-User: `uid = "default"`

---

## Datenmodell

```
fitness/
├── default/
│   ├── sessions/{date}         Session-Log (YYYY-MM-DD)
│   ├── journal/{auto-id}       Text-Notizen
│   ├── plan                    Aktiver Trainingsplan
│   └── body/{date}             Körpermessungen (Fitbit-Pipeline)
└── kb/
    ├── exercises/{exercise_id} Exercise-Definitionen (aus catalog/kb)
    └── anatomy/{exercise_id}   Anatomy Teaching (aus catalog/kb)
```

### Session-Dokument

```json
{
  "date": "2026-05-20",
  "block": "Push",
  "exercises": [
    {
      "exercise_id": "barbell_bench",
      "name": "Bankdrücken",
      "sets": "4", "reps": "8", "weight": "80",
      "primaryMuscles": ["Chest"],
      "secondaryMuscles": ["Shoulders", "Triceps"],
      "isHIT": false,
      "done": true        // immer true — post-workout logging, keine Checkbox
    }
  ],
  "effort": 8,
  "mood": "",
  "notes": "",
  "saved_at": "<Firestore Timestamp>"
}
```

### Journal-Dokument

```json
{
  "date": "2026-05-20",
  "text": "...",
  "tags": [],
  "time": "2026-05-20T14:30:00.000Z",
  "created_at": "<Firestore Timestamp>"
}
```

---

## Sync-Architektur

### Lokal → Firestore (automatisch)

`firestore-mirror.mjs` ist in `server.mjs` importiert.
Jeder `POST /session` und `POST /journal` schreibt fire-and-forget nach Firestore.
Lokales Verhalten bleibt unverändert — Firestore ist Side-Effect.

Konfig: `~/.env/firebase-fitness.json` (Service Account).
Fehlt die Datei → stiller Skip, kein Crash.

### Firestore → Lokal

**Live (Daemon):**

```bash
python -m firestore.mirror
```

Hält per WebSocket eine Verbindung zu Firestore offen.
`on_snapshot` feuert sofort wenn die PWA eine Session oder ein Journal schreibt.
Callbacks schreiben direkt in `~/.aos/fitness/`.

Konfliktlösung: `saved_at` Timestamp — neuere Version gewinnt.
Journal-Duplikat-Schutz: `<!-- fsid:{id} -->` Marker in der .md + State-File.

**One-Shot:**

```bash
fitness-sync pull    # Firestore → lokal
fitness-sync push    # lokal → Firestore (sessions)
fitness-sync sync    # beides
```

### Node → Python Bridge

`firestore-sync.mjs` erlaubt server.mjs den Python-Sync zu triggern:

```js
import { syncPull, syncPush } from "./firestore-sync.mjs";
syncPull();  // spawnt: python -m firestore.sync_cli pull
```

---

## Python-Modul (firestore/)

```
firestore/
├── __init__.py       pull(), push() exports
├── _db.py            Firebase-Init (Singleton), ts() Helper
├── sync.py           pull/push Logik
├── sync_cli.py       CLI entry für python -m firestore.sync_cli
└── mirror.py         on_snapshot Daemon
```

Abhängigkeiten: `firebase-admin`, `loguru`

---

## KB Sync (catalog/kb → Firestore)

Die Knowledge Base (`catalog/kb/`) wird einmalig oder bei Änderungen nach
`fitness/kb/` in Firestore gespiegelt:

```bash
python -m catalog.fitness_agent kb-sync          # alle
python -m catalog.fitness_agent kb-sync --dry    # dry-run
```

Script: `catalog/fitness_agent/kb_sync.py`
Stand 2026-05-20: 41 exercises + 51 anatomy lessons in Firestore.

---

## PWA (pwa/)

React + Vite + Firebase Hosting. Kein lokaler Server.
Daten-Layer: `pwa/src/db.js` — alle Reads/Writes direkt gegen Firestore.

**Deploy:** Push auf `master` mit Änderungen in `pwa/**` triggert GitHub Actions
(`.github/workflows/deploy-pwa.yml`) → Firebase Hosting.

**Firestore Rules:** `pwa/firestore.rules` — Single-User, `allow read, write: if true`.

**Composite Index:** `pwa/firestore.indexes.json` — `date ASC + time DESC` (journal-Query).

Rules + Indexes werden automatisch via GitHub Actions deployed (`--only hosting,firestore:rules,firestore:indexes`).

**Tabs:** Training · Journal · Muskeln · Lernen · Woche (kein separater Heute-Tab).

---

## Credentials

| Datei | Zweck |
|-------|-------|
| `~/.env/firebase-fitness.json` | Service Account (Python + firestore-mirror.mjs) |
| `pwa/src/firebase.config.js` | Web-App Config (gitignored, via GitHub Secret im CI) |

GitHub Secrets:
- `FIREBASE_CONFIG` → Inhalt von `firebase.config.js`
- `FIREBASE_SERVICE_ACCOUNT` → Service Account JSON für `firebase-tools deploy`
