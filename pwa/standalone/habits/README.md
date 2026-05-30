# Habits Solo (Standalone PWA)

This is a focused, lightweight version of the AlphaOS Habits module, designed to run as an independent application. It reuses the core logic and components from the main Fitness PWA but provides a distraction-free environment for habit tracking.

## Purpose

- **Focus**: Quick access to daily routines and reflections without the full fitness logging suite.
- **Performance**: Faster initial load by excluding heavy libraries (like Recharts) used in other parts of the ecosystem.
- **Independence**: Can be added to the mobile home screen as a separate icon.

## Architecture

- **Host**: `HabitApp.jsx` acts as a lightweight wrapper that provides Firebase Auth and the AlphaOS Theme System.
- **Component Reuse**: It directly imports the modularized components from `pwa/src/views/Habits/`.
- **Database**: Shares the same Firestore backend via `pwa/src/db.js`.

## Build & Deployment

This application is configured as a secondary entry point in the main `vite.config.js`. 

- **Entry Point**: `pwa/standalone/habits/index.html`
- **Build Output**: Located at `dist/standalone/habits/index.html` after running `npm run build`.
- **Firebase Hosting**: Deployed alongside the main app. Accessible via the path `/standalone/habits/index.html`.

## Development

To modify the logic or UI, edit the components in `pwa/src/views/Habits/`. Changes will propagate to both the main Fitness PWA and this Solo app.
