# View Architecture: Settings (Hybrid Control)

## Purpose
Manages user preferences and system configuration. Unified aesthetics with environment-specific power.

## Features
- **Theme System**: Full access to 15+ AlphaOS themes (Nordic, Dracula, Honey, etc.).
- **Training Logic**: Toggle for `HIT Mode` (Recovery-focus) vs `Volume Mode`.
- **Coach Intelligence (Local Only)**: 
    - Port checks for `fitness-dev` and `wger`.
    - Manual Firestore Sync trigger.
    - System path information (~/.aos/fitness/).

## Logic
- Consumes and updates settings via `db.js` (`getSettings`, `saveSettings`).
- Local version maps these to `localStorage` (via `user.js` lib).
