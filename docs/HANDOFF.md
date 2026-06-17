# Handoff: AlphaOS Fitness PWA Multi-User Migration
**Datum:** Sonntag, 24. Mai 2026

## Status Quo
Die Fitness PWA wurde erfolgreich von einer monolithischen Node.js Architektur auf eine moderne, dezentrale **Firebase/Firestore** Architektur umgestellt. Das System unterstützt nun native Google-Authentifizierung und bietet eine strikte Daten-Isolation zwischen verschiedenen Klienten.

## Core Features (Neu)
- **Google Auth:** Login-Wall für Klienten. Jeder User bekommt eine eindeutige `uid`.
- **Daten-Isolation:** Alle Logs (Sessions, Body, Habits, Journal) werden unter `fitness/{uid}/...` gespeichert. Ein Klient sieht *niemals* die Daten anderer User.
- **Vollständige PWA:** Service Worker Registrierung und Manifest sind aktiv. Die App ist auf iOS/Android als Standalone-App installierbar.
- **Frontend-Logic:** Komplexe Berechnungen (Weekly Report, Muscle Coverage, CSV Export) laufen nun client-seitig in `db.js`.

## Klienten-Differenzierung & Daemon-Integration

### 1. Datenstruktur in Firestore
Die Daten liegen hierarchisch getrennt vor:
- `fitness/{client_uid}/sessions/{YYYY-MM-DD}`
- `fitness/{client_uid}/body/{YYYY-MM-DD}`
- `fitness/{client_uid}/journal/{auto_id}`
- `fitness/{client_uid}/settings/general`

### 2. Zugriff für den Trainer (Daemon)
Da der Trainer-Daemon einen **Service Account** nutzt (Admin-Rechte), kann dieser über alle UIDs hinweg iterieren oder gezielt die Daten eines Klienten abrufen, ohne dass der Klient selbst administrative Rechte benötigt.

**Empfohlenes Vorgehen für den Daemon:**
- Nutze die Firebase Admin SDK.
- Iteriere über `db.collection('fitness')`, um alle Klienten-UIDs zu finden.
- Der Daemon kann die Daten lokal in Obsidian oder SQLite spiegeln, während die PWA das primäre Interface für den Klienten bleibt.

### 3. Sicherheit (Firestore Rules)
Die aktuellen Regeln in `firestore.rules` erlauben jedem authentifizierten User den Zugriff auf seinen eigenen Pfad:
```javascript
match /fitness/{userId}/{allPaths=**} {
  allow read, write: if request.auth != null && request.auth.uid == userId;
}
```
*Hinweis: Der Daemon mit Service-Account umgeht diese Regeln automatisch.*

## Deployment
- Die App deployt automatisch via GitHub Actions bei jedem Push auf `master`.
- Wichtig: `FIREBASE_CONFIG` und `FIREBASE_SERVICE_ACCOUNT` müssen als GitHub Secrets hinterlegt sein.

---
*Handoff abgeschlossen. PWA ist bereit für den ersten Klienten-Test.*
