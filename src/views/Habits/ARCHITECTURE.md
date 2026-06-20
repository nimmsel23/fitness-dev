# View Architecture: Habits (Gewohnheiten)

> [!WARNING]
> **CODE STATE: FROZEN / DEPRECATED (Option A)**
> Future development of the Habits and Journal interfaces has been consolidated within the `cloud_chamber/journal-dev` micro-app structure. The local views under `fitness-dev/src/views/Habits/` are frozen and will eventually be removed once `journal-dev` is integrated as a Module Federation Remote.

## Purpose
High-frequency tracking of non-workout behaviors (e.g., Hydration, Sleep, Creatine). Designed for friction-less "one-tap" completion.

## Components
- `index.jsx`: Manage habit list and date selection.
- `HabitItem.jsx`: Individual habit card with toggle and edit logic. Supports "Coach Habits" (local intelligence).
- `HabitSidebar.jsx`: Journaling and history for a specific habit.
- `HabitStats.jsx`: 28-day rolling heatmap for streaks.

## Data Flow
- Unified through `../../db.js`.
- Local: Syncs with `habitsync` docker-app/API.
- PWA: Directly interacts with Firestore.

## Features
- **Coach Habits**: Identified by `source: 'coach'`, these are suggested/mandated by the trainer.
- **Rolling View**: Always shows the last 28 days for maximum recency focus.
