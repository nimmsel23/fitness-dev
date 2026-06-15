# View Architecture: Dashboard (Heute)

## Purpose
The primary "at-a-glance" entry point for the user. It provides a rolling overview of recent activity, muscle readiness/recovery, and habit streaks. In "Hub Mode", it serves as the central navigation menu for the mobile application.

## Components
- `index.jsx`: Orchestrates the layout (responsive grid) and data fetching for the current day. Includes the `HOME_NAV` grid for Hub-style navigation.
- `DashboardHeader.jsx`: Greeting and quick stats.
- `DashboardWidget.jsx`: Wrapper for widgets providing consistent glassmorphism and interactivity.
- `MuscleBody.jsx`: Anterior/Posterior visualization (react-body-highlighter).
- `ActivityHeatmap.jsx`: Rolling 10-day view of training frequency.
- `SessionStatus.jsx`: Quick look at the current/latest session.
- `WeightChart.jsx`: 30-day weight trend visualization.

## Navigation Modes
- **Tabs Mode (Default)**: Dashboard is the first tab in a standard bottom navbar.
- **Hub Mode (navMode: 'home')**: The bottom navbar is removed on mobile. The Dashboard features a prominent 3-column grid of "Nav Cards" (premium glassmorphism tiles) that act as entry points to other views.

## Hub UI Implementation
- Nav Cards use `HOME_NAV` (filtered `NAV_ITEMS`).
- Feature animated background glows, high-density icons, and hover-line effects.
- Optimized for one-handed thumb navigation.

## Data Flow
- Fetches data from `../../db.js` using `getRecentSessions`, `getHabits`, and `getWeeklyReport`.
- Uses `getRolling10Days` for the activity visualization.

## Parity Note
- Shared 1:1 with PWA via `@src` alias.
- Consumes local `db.js` (API) or PWA `db.js` (Firestore) transparently.
