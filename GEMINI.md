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

### Backend (`server.mjs`)
*   **Local Server**: Hono-based Node.js server (`server.mjs`) used strictly for local development and local tool integration. In production (Firebase build), the frontend communicates directly with Firestore and no intermediate backend is used.

### Integration Points
*   **3-Tier Exercise Catalog**: 
    - **Expert Tier**: Curated indices and deep detail files.
    - **Bulk Layer**: 1850+ unreviewed exercises (wger/yuhonas).
    - **Lab (Inbox)**: AI-powered staging area for elevation.
*   **wger**: Master database and ID source for muscle normalization.
*   **Anatomy-KB**: Source for deep biomechanical facts and `anatomy` teaching data.

## 3. Engineering Standards

### Biomechanical Integrity
*   **Auditor Compliance**: All approved exercises must pass the biomechanical consistency check (correct muscles for given patterns).
*   **Normalization**: Always use wger-mapped IDs from `muscles.yml` for muscle associations.

### Data Flow
*   **Expert-Wins Sync**: The `kb_sync` pipeline ensures Tier-1 data (Expert) always overwrites Tier-2 data (Bulk) in Firestore.

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
*   `/catalog/kb`: The local knowledge base for anatomy and exercises (YAML).
*   `/arena`: Specialized muscle visualization/gamification module.

## 5. Development Workflow
1.  **Edit PWA**: Implement features in `/pwa`.
2.  **Sync Parity**: Update corresponding components in `/src` to maintain the local-development target.
3.  **Deploy**: Use `npm run deploy --prefix pwa` for Firebase Hosting updates.
4.  **Anatomy Parity**: When adding exercises, ensure deep anatomy is enriched in `~/anatomy-kb` and passes `./anatomy-agent audit all` before syncing to Firestore. Use the `anatomy-agent` skill for deep knowledge ingestion.
5.  **Data Persistence**: Local dev uses `server.mjs` (SQLite/JSON). Prod uses direct Firebase SDK access.
6.  **Document**: Update this `GEMINI.md` when architectural shifts occur.

## 6. Future Roadmap & Experiments
*   **Anatomy Learning**: Integrating `body-muscles` (70+ regions) into the `Learn` view for deep anatomical education and interaction.

## 7. Document History
*   2026-07-25: Enabled Dual-Frontend serving in FastAPI backend (`fitness/api/main.py`), serving the main SPA at `/` and the isolated `catalog-ui` at `/catalog-ui`. Refactored catalog `aliases.py` auditor to directly audit `german`, `english`, and `aliases` fields from index `ExerciseRecord`s.
*   2026-06-12: Fixed bugs in `catalog/server.py` and `kb_sync.py`. Updated documentation to reflect `react-muscle-highlighter` integration and finalized `data/` directory location.
*   2026-05-28: Integrated `react-muscle-highlighter` in `Muscles` tab (detailed view) with toggle support. Retained `react-body-highlighter` for dashboard.

