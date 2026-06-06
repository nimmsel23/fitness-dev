# View Architecture: Dashboard (Heute)

## Purpose
The primary "at-a-glance" entry point for the user. It provides a rolling overview of recent activity, muscle readiness/recovery, and habit streaks.

## Components
- `index.jsx`: Orchestrates the layout (responsive grid) and data fetching for the current day.
- `DashboardHeader.jsx`: Greeting and quick stats.
- `MuscleStatus.jsx`: Visual indicator of muscle volume/recovery based on the last 7-10 days.
- `ActivityHeatmap.jsx`: Rolling 10-day view of training frequency.
- `SessionStatus.jsx`: Quick look at the last session's performance.

## Data Flow
- Fetches data from `../../db.js` using `getRecentSessions`, `getHabits`, and `getWeeklyReport`.
- Uses `getRolling10Days` for the activity visualization.

## Parity Note
- Shared 1:1 with PWA via `@src` alias.
- Consumes local `db.js` (API) or PWA `db.js` (Firestore) transparently.
