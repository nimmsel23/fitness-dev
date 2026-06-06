# View Architecture: Session (Logbuch) - V2 Modular

## Purpose
The core workout logging interface. Optimized for both rapid entry (Gym) and deep analysis (Post-Workout/Coach).

## Components
- `index.jsx`: State owner for the session. Handles logic for "Super-Version" intelligence (Obsidian, Gaps, Plan-Hints).
- `ExerciseSection.jsx`: Orchestrates the list of exercises and the `ExerciseSearch/QuickInput`.
- `ExerciseItem.jsx`: Multi-set support (`setsArray`). Displays "Local Intelligence" (Previous performance + Muscle Tags).
- `SessionSidebar.jsx`: Meta-data (Location, Duration) and specialized Exports (Obsidian Sync).
- `ActivitySection.jsx`: Logging for non-strength activities (Cardio/Wandern).
- `DateHeader.jsx`: Navigation between training days.

## Intelligence Features (Local Super-Version)
- **Obsidian Sync**: Direct export to local markdown vault.
- **BodyMap**: Anterior/Posterior visualization of current session's impact.
- **PrevMap Comparison**: Shows the exact weight/reps of the *last* time this exercise was performed.
- **Gap Analysis**: Real-time feedback on muscle group coverage.

## Data Format
- Uses `setsArray: [{reps, weight}, ...]` for modern multi-set tracking.
- Backward compatibility for flat `sets/reps` via `calculateExVolume`.
