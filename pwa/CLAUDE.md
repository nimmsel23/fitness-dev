# Fitness PWA — Firebase Standalone

Kraft-Tracking PWA. Kein lokaler Server. Daten in Firestore.
Entspricht funktional der fitness-dev localhost-Version.

---

## Architektur

```
src/
├── App.jsx              Root — Navigation (6 Views)
├── db.js                Firestore Data Layer — einzige Datenquelle
├── firebase.js          Firebase App + Firestore-Instanz
├── firebase.config.js   Credentials (.gitignore, NIE committen)
├── main.jsx             React mount
├── styles.css           Styles
└── views/
    ├── Dashboard.jsx    Heute — aktuelle Session + Plan
    ├── Session.jsx      Training-Log + BodyMap (done exercises)
    ├── Journal.jsx      Text-Notizen
    ├── Muscles.jsx      BodyMap + Coverage letzte 7 Tage
    ├── Learn.jsx        Anatomie-Lehre aus Firestore KB
    └── WeeklyReview.jsx Wochenrückblick + Chart
```

---

## Datenmodell (Firestore)

```
fitness/{uid}/sessions/{date}   → { date, block, exercises, effort, mood, notes, saved_at }
fitness/{uid}/plan              → { today: { block, exercises[] }, week: {...} }
fitness/{uid}/journal/{id}      → { date, text, tags, time, created_at }
fitness/{uid}/body/{date}       → Körpermessungen (Fitbit-Pipeline)
fitness/kb/exercises/{id}       → Exercise-Definitionen (sync aus catalog/kb)
fitness/kb/anatomy/{id}         → Anatomy Teaching (sync aus catalog/kb)
```

`uid = "default"` — Single-User, kein Auth.

---

## KB Sync (catalog/kb → Firestore)

Die Knowledge Base lebt in `fitness-dev/catalog/kb/`.
Ein Sync-Script (TODO) pushed Änderungen nach Firestore:
```
fitness/kb/exercises/{exercise_id}  ← catalog/kb/exercises/*.yml
fitness/kb/anatomy/{exercise_id}    ← catalog/kb/anatomy_teaching/*.yml
```

Bis dahin: Exercises manuell in Firestore anlegen oder Script bauen.

---

## Setup

```bash
# 1. Dependencies
cd ~/fitness/pwa && npm install

# 2. Firebase-Projekt anlegen (einmalig)
firebase projects:create fitness-aos --display-name "Fitness AOS"

# 3. Web-App registrieren + Config ausgeben
firebase apps:create WEB "Fitness PWA" --project fitness-aos
firebase apps:sdkconfig WEB <appId>

# 4. Config eintragen
cp src/firebase.config.js.template src/firebase.config.js
# → Werte aus Schritt 3 eintragen

# 5. Firestore aktivieren (Europa)
firebase firestore:databases:create --location=eur3 --project fitness-aos

# 6. Projekt setzen
firebase use fitness-aos

# 7. Dev-Server
npm run dev

# 8. Deploy
npm run deploy
```

---

## Verhältnis zu fitness-dev (lokal)

| fitness-dev lokal | pwa/ Firebase |
|-------------------|---------------|
| Node.js :9100 | Firebase Hosting (statisch) |
| JSON + SQLite | Firestore |
| catalog/kb/ direkt | fitness/kb/* in Firestore |
| wger lokal | entfällt |

Kein Sync zwischen lokal und Firebase — zwei unabhängige Instanzen.
