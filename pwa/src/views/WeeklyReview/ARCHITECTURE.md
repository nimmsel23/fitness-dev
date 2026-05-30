# Weekly Review Module Architecture

This folder contains the modularized components for the Weekly Performance Review view.

## Component Structure

- **`index.jsx`**: Main container. Manages state for the selected week, loading status, and coordinate data fetching from `getWeeklyReport`.
- **`ReviewHeader.jsx`**: The top section with "Performance Review" title and the week selection input.
- **`ReviewOverview.jsx`**: Displays core metrics like total session count and volume/recovery focus (HIT mode).
- **`ReviewInsights.jsx`**: Shows textual recommendations and lists "Coverage Gaps" (untrained muscle regions).
- **`ReviewMuscleImpact.jsx`**: Visualizes relative muscle load using bar charts.
- **`ReviewSessionList.jsx`**: A chronological list (reversed) of sessions in the selected week with date cards and recovery indicators.
- **`utils.js`**: Helper functions like `formatVolume`.

## Data Flow

1.  **Selection**: User changes the `week` in `ReviewHeader`.
2.  **Fetching**: `index.jsx` triggers a re-fetch via `db.js` (`getWeeklyReport`).
3.  **Distribution**: Data is passed down to specialized presentational components.
4.  **Navigation**: `ReviewSessionList` uses `onNavigate` to jump to specific session details in the main app.
