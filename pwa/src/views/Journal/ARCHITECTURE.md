# Journal Module Architecture

This folder contains the modularized components for the unified Journal view. The refactoring split the monolithic `Journal.jsx` into focused, reusable components.

## Component Structure

- **`index.jsx`**: The main container component. Manages core state (date, entries, habits, loading, modal selection) and coordinates data fetching from `db.js`.
- **`JournalHeader.jsx`**: Handles the relative date display and navigation controls (Previous/Next day).
- **`JournalForm.jsx`**: The sticky reflection input area.
- **`JournalTimeline.jsx`** (Implicit in index): Renders the chronologically sorted entries.
- **`JournalEntry.jsx`**: Represents a single entry card in the timeline. Handles specialized rendering for Habit, Workout, and regular Journal logs.
- **`JournalModal.jsx`**: The detailed, immersive view for a single reflection, including all metadata and coach feedback.

## Data Flow

1.  **State Management**: `index.jsx` holds the current date and the unified list of entries fetched from multiple Firestore collections.
2.  **Persistence**: Sub-components communicate actions (like saving or opening a modal) back to handlers in `index.jsx`.
3.  **Unification**: Logic in `index.jsx` fetches `journal`, `habitJournals`, and `sessions` to create a comprehensive daily log.

## Standalone Usage
This module is also used as the core for the **Journal Solo** application found in `pwa/standalone/journal/`.
