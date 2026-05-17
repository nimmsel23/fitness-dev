# WorkoutForge Changelog

## [0.1.0] - 2026-03-20

### Neu
- Express + better-sqlite3 Backend (Port 3333)
- 873 Übungen geseedet (yuhonas/free-exercise-db, englische Namen)
- Workout CRUD (erstellen, öffnen, löschen)
- WorkoutBuilder: Übungssuche (min. 2 Zeichen, debounced), Drag & Drop Reihenfolge
- ExerciseRow: Sätze, Wdh, Pause, Gewichtstyp, Notiz, Effort (to_failure etc.), RIR, Tempo, Drop Set
- MuscleHeatmap: absolute Prozentwerte (alle Muskeln zusammen = 100%), Formel sets × reps_mittelwert
- muscles.js: vollständige Muskelkarte DE (Druck/Zug/Beine/Core/Sonstige)
- 5 vorgefertigte Workouts via YAML + Seeder: HIT Fullbody A+B, PPL Push/Pull/Legs A
- PWA-Manifest (vite-plugin-pwa)
- SPA-Fallback: `app.use()` statt `app.get("*")` (Node v25 Kompatibilität)

### Bekannte Probleme
- Übungsnamen englisch
- Vorgefertigte Workouts generisch, nicht Coach-tauglich
- UI noch kein produktiver Zustand
- better-sqlite3 Binding muss manuell aus `/home/alpha/node_modules/` kopiert werden wenn `npm install` fehlschlägt

### Infrastruktur
- `npm run seed` — Übungen seeden
- `npm run seed:workouts` — Beispiel-Workouts seeden
- Vite Dev-Server Port 5175, proxy → 3333
