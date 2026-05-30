# Habits Module Architecture

This folder contains the modularized components for the Habit tracking view. The refactoring split the monolithic `Habits.jsx` into focused, reusable components to improve maintainability and readability.

## Component Structure

- **`index.jsx`**: The main container component. Manages the core state (habits, loading, sidebar selection, date picking) and coordinates data fetching from `db.js`.
- **`HabitForm.jsx`**: Handles the creation of new habits, including name input and icon selection.
- **`HabitList.jsx`** (Implicit in index): Renders the collection of active habits.
- **`HabitItem.jsx`**: Represents a single habit row. Handles inline editing (name/icon), quick completion toggling, and deletion.
- **`HabitSidebar.jsx`**: The detail view for a selected habit. Includes:
    -   An interactive 28-day heatmap for date selection.
    -   A status toggle for the selected date.
    -   A daily journal/reflection text area with auto-save and `Ctrl+Enter` support.
- **`HabitStats.jsx`**: Displays motivational messages and the today-completion progress bar.
- **`utils.js`**: Shared constants (icons, labels) and helper functions (date calculations).

## Data Flow

1.  **State Management**: `index.jsx` holds the master list of habits and the currently selected habit/date.
2.  **Persistence**: All components call back to handlers in `index.jsx`, which then interface with `pwa/src/db.js` for Firestore operations.
3.  **Journaling**: Journal entries are scoped to `habitId_date` and are managed via `getHabitJournal` and `saveHabitJournal`.

## Future Enhancements
- Mobile push notification integration (e.g., via FCM or Email-to-Push bridge).
- Expanded analytics for habit streaks and historical consistency.
