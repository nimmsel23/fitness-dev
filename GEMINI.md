# AlphaOS Fitness Ecosystem — Project Instructions

This document serves as the foundational mandate for the development and maintenance of the AlphaOS Fitness ecosystem. It defines the architectural vision, engineering standards, and the "big picture" of the multi-tenant coaching platform.

## 1. Vision & Big Picture
A unified fitness ecosystem serving two primary roles:
1.  **Clients (PWA)**: An "always-on" mobile-first front door for fitness logging, habit tracking, and learning, powered by Firebase.
2.  **Coach (Localhost)**: A professional command center for analysis, client management (EspoCRM), exercise curation (wger), and AI-driven content enrichment.

## 2. Core Architecture

### Frontend: Firebase PWA (`/pwa`)
*   **Tech Stack**: React, Tailwind CSS, Lucide Icons, Recharts.
*   **Authentication**: Google Auth / Email-Password via Firebase Auth.
*   **Persistence**: Multi-tenant data structure in Firestore (partitioned by User UID).
*   **Aesthetics**: "AlphaOS" design language—Glassmorphism, high density, JetBrains Mono for data, and consistent 15+ themes (Nordic, Dracula, etc.).
*   **Desktop Mode**: Fixed sidebar navigation (`lg` breakpoint), responsive 3-column dashboard, and side-by-side split views for learning/journaling.

### Backend & Sync (`/firestore`, `server.mjs`)
*   **Local Server**: Hono-based Node.js server for local development and local tool integration.
*   **Multi-User Sync**: Python-based sync engine (`firestore/sync.py`) that pulls data from ALL clients into structured local storage: `~/.aos/fitness/users/{UID}/`.
*   **Inbox Bridge**: PWA logs "new exercises" into a Firestore `inbox` collection per user, which is pulled locally for AI processing.

### Integration Points
*   **wger**: Master exercise database for curation.
*   **HabitSync**: External habit management API integration.
*   **Anatomy-KB**: Dedicated repository (`~/anatomy-kb`) for deep biomechanical data (Origin, Insertion, Innervation) and anatomical error analysis. Serves as the source for `muscles` and `anatomy` collections in Firestore.
*   **EspoCRM**: Targeted for future client/contact lifecycle management linked to Firestore UIDs.
*   **AI Enricher**: Gemini-powered worker that generates anatomy data and coaching notes from user-submitted inbox entries.

## 3. Engineering Standards

### CSS & Styling
*   **Tailwind Namespace**: Use the `fit` namespace (e.g., `text-fit-accent`, `bg-fit-card`) to map directly to project-wide CSS variables.
*   **Theme Parity**: Ensure any UI changes support the full theme list defined in `pwa/src/App.jsx`.
*   **Density**: Maintain root project spacing standards (`1rem` / `1.25rem` padding/radii) to ensure professional visual consistency.

### Component Logic
*   **Strength vs. Cardio**: Automatically distinguish between strength sessions (exercise counts) and cardio/activities (duration/icons).
*   **Heatmaps**: Use rolling 10-day (Dashboard) and 28-day (Habits) views instead of fixed ISO weeks for better recency focus.

### Data Flow
*   **Local-First / Cloud-Synced**: Local saves should dual-write to SQLite/JSON and mirror to Firestore when connected.
*   **Bridge Triggering**: Use Firestore collections as asynchronous bridges between mobile clients and local coach tools.

## 4. Repository Structure
*   `/pwa`: The Firebase-deployed React application.
*   `/src`: Local development views and components (parity targets).
*   `/firestore`: Python modules for sync, mirroring, and CLI operations.
*   `/catalog/kb`: The local knowledge base for anatomy and exercises (YAML).
*   `/arena`: Specialized muscle visualization/gamification module.

## 5. Development Workflow
1.  **Edit PWA**: Implement features in `/pwa`.
2.  **Sync Parity**: Update corresponding components in `/src` to maintain the local-development target.
3.  **Deploy**: Use `npm run deploy --prefix pwa` for Firebase Hosting updates.
4.  **Anatomy Parity**: When adding exercises, ensure deep anatomy is enriched in `~/anatomy-kb` and passes `./anatomy-agent audit all` before syncing to Firestore.
5.  **Document**: Update this `GEMINI.md` when architectural shifts occur.
