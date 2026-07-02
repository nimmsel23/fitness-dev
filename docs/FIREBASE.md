# Firebase — AlphaOS Fitness

Stand: 2026-07-02

Firebase-Projekt: **fitness-aos** (GCP, eur3)
PWA: **https://fitness-aos.web.app**
Single-User: `uid = "default"`

---

## Architektur & Struktur (Safe-Production-Pipeline)

Um ein versehentliches Überschreiben der Produktion oder SW-Cache-Verschmutzung zu verhindern, gilt folgende Struktur:

*   **`~/fitness-dev`**: Entwicklungs-Workspace. Alle Test-Deployments erfolgen hier ausschließlich über Vorschaukanäle (`npm run build:preview`). Direkte Produktions-Deploys sind hier über einen Safety-Lock blockiert.
*   **`~/fitness`**: Release-Vessel. Enthält symbolische Links auf den Build-Output (`dist-firebase/`) und die Konfigurationen aus `fitness-dev`. Der echte Produktions-Deploy wird ausschließlich von hier aus gestartet.

---

## Datenmodell (Firestore)

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
      "done": true
    }
  ],
  "effort": 8,
  "mood": "",
  "notes": "",
  "saved_at": "<Firestore Timestamp>"
}
```

---

## Sync-Architektur

### Lokal → Firestore (automatisch)

**Node-Server** (`firestore-mirror.mjs`): spiegelt jeden `POST /session` und `POST /journal` fire-and-forget nach Firestore.

**Python-Backend** (`firestore/mirror.py`): äquivalente Push-Funktionen für den Python-Server:
- `mirror_session(date, session, uid)` → `fitness/{uid}/sessions/{date}`
- `mirror_journal(date, entry, uid)` → `fitness/{uid}/journal/{date}`
- `mirror_plan(plan, uid)` → `fitness/{uid}/plan/active`
- `get_status()` → Verbindungsstatus

Beide nutzen `~/.env/firebase-fitness.json` als Service-Account.

### Firestore → Lokal

*   **Live (Daemon)**: `python -m firestore.mirror` (WebSocket sync).
*   **One-Shot**: `fitness-sync pull` / `push` / `sync`.

---

## Deployment & PWA

Die PWA-Sourcen liegen direkt im Root von `fitness-dev`.

### Deployment-Workflow (Safe-Pipeline)

1.  **Preview**: `npm run preview-firebase` (Baut nach `~/fitness/dist-firebase` und erstellt temporären Link).
2.  **Live**: `npm run deploy-firebase` (Baut und rollt Hosting + Rules/Indexes aus).

### Automatisierung

*   **GitHub Actions**: `.github/workflows/deploy-pwa.yml` (CI/CD Deploy aus Root).
*   **Git Hook**: `.git/hooks/post-commit` (Automatischer Deploy bei Frontend-Änderungen).

### Konfiguration

*   **Rules**: `firestore.rules` (Root)
*   **Indexes**: `firestore.indexes.json` (Root)
*   **Hosting**: `firebase.json` (Root/Release Vessel)

---

## Credentials

| Datei | Zweck |
|-------|-------|
| `~/.env/firebase-fitness.json` | Service Account (Python + local Mirror) |
| `firebase.config.js` | Web-App Config (gitignored) |
| GitHub Secrets | `FIREBASE_CONFIG`, `FIREBASE_SERVICE_ACCOUNT` |
