# View Architecture: Journal

> [!WARNING]
> **CODE STATE: FROZEN / DEPRECATED (Option A)**
> Future development of the Habits and Journal interfaces has been consolidated within the `cloud_chamber/journal-dev` micro-app structure. The local views under `fitness-dev/src/views/Journal/` are frozen and will eventually be removed once `journal-dev` is integrated as a Module Federation Remote.

## Purpose
Free-form text logging for daily reflections, recovery notes, or mood tracking.

## Components
- `index.jsx`: Daily view of journal entries.
- `JournalEntry.jsx`: Individual text block with timestamp.
- `JournalForm.jsx`: Input area for new reflections.
- `JournalModal.jsx`: Reusable popup for habit-specific journaling.

## Data Flow
- Local: Writes to files/API via `db.js/journal.js`.
- PWA: Writes to Firestore `journal` collection.
