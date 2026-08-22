# fitness-dev TODO

## 🚨 High Priority (Bugs & Regressions)
- [x] **PWA Muscle Slug Support**: Refactor frontend (icons, translations, coverage) to handle new numeric-prefixed IDs (e.g. `101_pectoralis_major`).
- [x] **Desktop Layout Regression**: Improved responsiveness (md/xl breakpoints) and sidebar spacing. ✅ (Applied fixes, verify on device).
- [x] **Muscle Coverage Inconsistency**: Fixed mapping for internal IDs (e.g., 604_hamstrings) in both frontend and backend. ✅ (Applied fixes).
- [x] **Theme Persistence**: Added inline script to index.html for immediate theme application. ✅ (Fixed FOUC and inconsistency).

## 🛠 Features & Improvements
- [x] **Media Integration**: Integrate images from `yuhonas` database as fallback/static alternatives to GIFs. ✅ (850+ images added).
- [x] **ExerciseDB API**: Evaluate and potentially integrate `exercisedb-api` for even broader coverage. ✅ (Integrated hasaneyldrm dataset).
- [x] **Drag & Drop Dashboard**: Implement customizable widget layout (Ref: `react-grid-layout`). ✅ (Implemented in Dashboard.jsx).
- [ ] **Habit-Journal Modal**: Implement popup journal modal triggered from each habit.
- [ ] **PWA Offline Support**: Ensure essential features work without active connection.
- [ ] **Anatomy Teaching**: Expand deep anatomy content for all core exercises in the catalog.

## 💬 Client-Signale (aus Coaching Notes extrahiert)
Reibungspunkte in der App-Nutzung, die beim Verschriftlichen spontaner
Coaching-Erklärungen ("WhatsApp Wisdom Drops") auffielen — siehe
`fitness/catalog/CLAUDE.md`, Abschnitt "Coaching Notes Pipeline", Schritt 6.
Kein Fix-Auftrag an sich, nur Sichtbarkeit für die laufende Session-Tab-UX-
Arbeit. Quelle: `fitness/catalog/kb/coaching_notes/*.yaml` (`product_signals:`).
- [ ] **Verzögertes/gesammeltes Nachtragen von Sessions** (`hit_vs_5x5_vs_hiit`):
  Klient trägt oft erst abends/nachträglich ein statt direkt beim Training —
  mögliche Logging-Hürde im Moment des Trainings.
- [ ] **Fehlende Transparenz für Klienten, was der Coach sieht** (`hit_vs_5x5_vs_hiit`):
  Coach-Einsicht läuft nur über ein Terminal-Tool, Klient hat keine
  vergleichbare eigene Rückmeldeansicht/Fortschrittsanzeige.
- [ ] **Split-Rotation um Reisetage** (`hit_vs_5x5_vs_hiit`, niedrige Priorität):
  Klient hat sich Push/Pull/Legs-Reihenfolge um einen Wanderurlaub selbst
  ausgedacht — mögliche Opportunity für eine einfache In-App-Vorschlagslogik.

## 🏗 Architectural / Tech Debt
- [ ] **SixPackPromiseCard.jsx aus Session/ auslösen**: Hat inhaltlich nichts
  mit Session/ zu tun außer der Ordner-Verschachtelung — eigenes `views/6pack/`
  anlegen, `Session/SixPackPromiseCard.jsx` als reinen Re-Export/Barrel stehen
  lassen (User-Vorschlag 2026-08-22, bewusst zurückgestellt: "später evtl").
- [x] **Multi-Session Schema**: Migrate to `sessions/{sessionId}` structure to support multiple workouts per day.
- [ ] **Habit Tab Refactoring**: Refactor Habit Tab into a more encapsulated, app-like structure.
- [x] **Local Data Migration**: Move `data/` from repo-local to `~/.aos/fitness/`. ✅ (Implemented in server and agent).

## ✅ Completed (Recently)
- [x] **GIF Enrichment**: Automated mapping of 285+ exercises to GIF animations.
- [x] **Exercise Library Visuals**: Thumbnail previews in the Learn tab.
- [x] **Critical Bugfixes**: Fixed agent server crashes and sync errors.
- [x] **Documentation Sync**: Architecture and vision docs updated to June 2026.
