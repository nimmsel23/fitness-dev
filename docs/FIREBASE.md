# Firebase — AlphaOS Fitness

Stand: 2026-06-13

Firebase-Projekt: **fitness-aos** (GCP, eur3)
PWA: **https://fitness-aos.web.app**
Single-User: `uid = "default"`

---

## Architektur & Struktur

Das Projekt nutzt eine **Safe-Production-Pipeline** zur Trennung von Entwicklung und Release.

*   **`~/fitness-dev`**: Arbeits-Repository. Enthält Sourcecode (`src/`), Konfigurationen und lokale Datenbanken.
*   **`~/fitness`**: Release-Vessel. Dient als staging area für den Firebase-Deploy. Enthält den Build-Output in `dist-firebase/`.

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

`firestore-mirror.mjs` (in `server.mjs`) spiegelt jeden `POST /session` und `POST /journal` Side-Effect-mäßig nach Firestore.

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
