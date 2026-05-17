# WorkoutForge

Lokale Workout-PWA mit Muskel-Visualisierung. Läuft komplett offline, kein Account, kein Cloud-Zwang.

## Stack

| Schicht | Tech |
|---------|------|
| Backend | Node.js + Express + better-sqlite3 |
| Frontend | React 18 + Vite + Tailwind CSS |
| Drag & Drop | @dnd-kit |
| PWA | vite-plugin-pwa |
| Datenbank | SQLite (873 Übungen aus yuhonas/free-exercise-db) |

## Setup

```bash
# Backend-Dependencies
npm install

# Datenbank + Übungen seeden
npm run seed

# Frontend bauen
cd client && npm install && npm run build && cd ..

# Server starten (Port 3333)
node server/index.js
```

Öffne `http://localhost:3333`.

## Entwicklung

```bash
# Backend starten
node server/index.js

# Frontend Dev-Server (Hot Reload, Port 5175)
cd client && npm run dev
```

Der Vite Dev-Server proxied `/api` → `localhost:3333`.

## Funktionen

### Workout-Verwaltung
- Workouts erstellen (Name + optionales Ziel)
- Workouts öffnen, löschen

### WorkoutBuilder
- Übungssuche (min. 2 Zeichen, debounced 180ms, Limit 12)
- Übungen hinzufügen / entfernen
- Reihenfolge per Drag & Drop
- Pro Übung: Sätze, Wdh (z.B. `8-12` / `AMRAP`), Pause (s), Gewichtstyp (`kg` / `%1RM` / `bodyweight`), Notiz
- Änderungen werden gebündelt gespeichert

### Muscle Heatmap
- Automatische Muskelverteilung aus dem aktuellen Workout
- Primäre Muskeln × Sätze = volle Last
- Sekundäre Muskeln × Sätze × 0.4 = Unterstützung
- Balkendiagramm mit deutschen Muskelnamen + Farbkodierung nach Gruppe:
  - **Blau** — Druckmuskulatur (Brust, Schulter, Trizeps)
  - **Grün** — Zugmuskulatur (Rücken, Bizeps)
  - **Orange** — Beine (Quad, Hamstrings, Glutes, Waden)
  - **Lila** — Core (Bauch, Lendenbereich)

## API

```
GET    /api/health
GET    /api/exercises?q=&muscle=&equipment=&category=&limit=&offset=
GET    /api/exercises/:id
GET    /api/exercises/meta/muscles
GET    /api/exercises/meta/equipment
GET    /api/workouts
POST   /api/workouts
GET    /api/workouts/:id
PATCH  /api/workouts/:id
DELETE /api/workouts/:id
POST   /api/workouts/:id/exercises
PATCH  /api/workouts/:id/exercises/:exId
DELETE /api/workouts/:id/exercises/:exId
PUT    /api/workouts/:id/exercises/order
```

## Datenbank

SQLite unter `db/workoutforge.sqlite`.

Tabellen: `exercises`, `workouts`, `workout_exercises`, `workout_sessions`, `session_sets`

Übungen neu seeden:
```bash
npm run seed
# oder mit lokaler Datei:
EXERCISES_FILE=./exercises.json npm run seed
```

## Roadmap

- [ ] Session-Logging (Workout ausführen, Sets live tracken)
- [ ] Wochenprogramm (Übungen auf Wochentage verteilen)
- [ ] Filter in der Suche (Muskel, Equipment, Kategorie)
- [ ] Fortschrittsdiagramme (Gewicht/Wdh über Zeit)
- [ ] Übungsdetailseite (Anleitung, Bilder)
