# View Architecture: Journal

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
