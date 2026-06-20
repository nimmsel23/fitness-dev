# Learn Module Architecture (Anatomy Explorer)

This folder contains the modularized components for the exercise library and deep anatomical learning module.

## Component Structure

- **`index.jsx`**: Main container. Manages core state (selected exercise, search query, loading states for both library and anatomy details).
- **`ExerciseLibrary.jsx`**: Renders the searchable list of exercises, including "Recently Trained" quick-access buttons and result counting.
- **`AnatDetail.jsx`**: The focused detail view for an exercise. Displays:
    - Primary and Secondary muscle groups.
    - Trainer explanations (client-friendly).
    - Biomechanical data (Origin, Insertion, Function).
    - Coaching notes.
- **`ARCHITECTURE.md`**: This documentation.

## Data Flow

1.  **Selection**: Clicking an exercise in `ExerciseLibrary` updates the `selected` state in `index.jsx`.
2.  **Detail Fetching**: An effect in `index.jsx` detects the change and fetches deep anatomy data from `getAnatomy(id)`.
    - **Local**: Calls `/exercise/:id/teaching` from the local Node server.
    - **PWA**: Calls Firestore.
3.  **Visualization**: Data is passed to `AnatDetail` for rendering.

## Synergy with Anatomy-KB
This module is the primary consumer of the biomechanical data managed in the `~/anatomy-kb` repository. Whenever the KB agent enriches a muscle or exercise, it propagates here via Firestore synchronization.

## Future Plans
- **Muscle-to-Exercise Navigation**: Clicking a muscle in the detail view should jump to a filtered list of all exercises targeting that specific muscle.
- **Anatomical Diagrams**: Integrating SVG diagrams for origin/insertion points.
