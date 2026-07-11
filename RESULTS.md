# AlphaOS Fitness Ecosystem — Multi-Session Schema (2026-06-20)

We have successfully migrated the training session storage and UI to support multiple workouts per day (using unique session suffixes, e.g., `sessions/{date}__{id}`).

* **SQLite Schema Migration**: Added the `session_id TEXT` column to the local SQLite database in `server.mjs` with an automated `ALTER TABLE` try-catch block for clean backward compatibility.
* **Local Node API Updates**: Adjusted `syncSessionToDb` to clear and write entries using the specific `session_id`, preventing workouts on the same day from overwriting each other.
* **Firestore Dual-Write Updates**: Updated `mirrorSession` inside `firestore-mirror.mjs` to target suffixed document paths (`date__id`).
* **Python Sync Logic**: Refactored `firestore/sync.py` to correctly parse suffixes in `pull()` and `push()` to isolate JSON log files, while keeping daily markdown notes grouped under the main date log (e.g. `2026-06-20.md`).
* **Frontend UI Switcher**: Integrated `sessionId` and `daySessions` states in `src/views/Session/index.jsx`. Added a sleek session switcher card under the calendar bar, letting users toggle between workouts, start a new workout (`+ Neues Workout`), or delete additional workouts.

---

# AlphaOS Fitness Ecosystem — Theme & Settings Restructuring

We have successfully completed the modular refactoring of the Settings Tab and the cleanup/expansion of the theme system.

## 1. Theme Updates (in `src/constants/Themes.js` and `src/styles/themes/`)
* **Removed (11 obsolete/generic themes):** `sweet`, `sweet-purple`, `sweet-mars`, `sweet-amber-blue`, `slate`, `zinc`, `snow`, `mint`, `rose`, `gold`, `cyan`
* **Added (4 premium, custom themes):**
  * **Kanagawa:** Warm Japanese dark theme with sakura pink accent (`#e46876`)
  * **Everforest:** Moss green accented hard dark theme (`#a7c080`)
  * **Oxocarbon:** Precision IBM carbon dark with technical blue accent (`#78a9ff`)
  * **Paper:** Warm, readable cream writing light theme with warm brown accent (`#7c5c3a`)
* **Adjusted / Fixed Themes:**
  * **Gruvbox:** Corrected background hierarchy and true cream/yellow text colors.
  * **Solarized & Solarized Dark:** Precise Ethan Schoonover bases applied to optimize contrast and element layers.
  * **Homunculus:** Shifted to deep earthy tones and blood red accent.
  * **Nothing:** Reines Monochrom-Void (pure black background and clean white text/accents).
  * **Midnight:** Deep midnight blue with personalized indicator shades.

## 2. Modular Settings View (`src/views/Settings/`)
The settings panel has been split into dedicated, self-contained sub-sections:
* **AppearanceSection:** Handles themes (dark/light lists), Circadian settings, layout scaling, and gender selection.
* **TrainingSection:** Allows setting split preferences, cycle lengths, location defaults, and dashboard highlighter mode (`body` vs. `react-muscle-highlighter`).
* **LocalDevSection:** Exposes local server endpoints and sync configurations for advanced debugging.

---

# AlphaOS Fitness Ecosystem — Bugfix: Touch-Stepper Weight Precedence (2026-07-11)

Fixed a precedence bug in `ExerciseCard.jsx` where clicking on step buttons (`+2.5` / `-2.5`) for weights did not register when the weight field already had a value. Added parentheses around `parseFloat(raw) || 0` so `delta` is correctly added.

