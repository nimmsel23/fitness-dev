# Muscles Module Architecture

This folder contains the modularized components for the Muscle Analysis and Supercompensation view.

## Component Structure

- **`index.jsx`**: Main container. Manages core state (days, loading, HIT vs Volume mode, detailed map toggle) and coordinates data fetching and analysis logic.
- **`MuscleHeader.jsx`**: Displays the view title and provides controls for time range selection and map toggling.
- **`MuscleBodyMap.jsx`**: Renders the standard front/back body heatmap using `BodyMap`.
- **`MuscleDetailedMap.jsx`**: Renders the more granular anatomical map using `react-muscle-highlighter`.
- **`MuscleAnalysis.jsx`**: Provides a textual breakdown of muscle status (HIT) or load intensity (Volume).
- **`MuscleInsights.jsx`**: Offers smart coaching advice based on the calculated muscle states.

## Data Flow

1.  **Analysis**: The `useEffect` in `index.jsx` performs complex calculations to determine muscle "last seen" times and cumulative volume.
2.  **Visualization**: The results are passed down to map and analysis components for rendering.
3.  **Modes**: The UI dynamically adapts based on whether `hitMode` is active.

## Future Plans
- **Anatomy Explorer**: Linking individual muscles to deep anatomical data (Origin, Insertion, Innervation).
- **Exercise Integration**: Ability to click a muscle and see related exercises from the Knowledge Base.
