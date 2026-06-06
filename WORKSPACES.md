# AlphaOS Unified Ecosystem: Workspaces Specification (v3.1.0-draft)

## 1. Vision & Purpose
To consolidate the AlphaOS ecosystem (Fitness-Dev, Fuel-Dev, and future modules) into a single, high-performance monorepo using **npm workspaces**. This architecture enables independent development of feature "Micro-Apps" (Tabs) while maintaining a strict unified design language and a shared data-bridge.

## 2. Monorepo Structure

```text
/
├── package.json                 # Root: Manages workspaces & shared devDependencies
├── WORKSPACES.md                # This specification
├── apps/
│   ├── coach-desktop/           # Localhost environment (Port 5902)
│   └── client-pwa/              # Firebase-deployed PWA (fitness-aos.web.app)
└── packages/
    ├── shell/                   # Core AlphaOS UI (Glass-frame, Navigation, Auth)
    ├── ui-kit/                  # Design System (Tailwind Fit-Namespace, Themes, 3D BodyMaps)
    ├── db-bridge/               # Data Abstraction Layer (Switches between local API and Firestore)
    ├── view-dashboard/          # Modular "Heute" Tab
    ├── view-session/            # Modular "Logbuch" Tab (V3 Multi-Set Support)
    ├── view-habits/             # Modular "Habits" Tab
    └── view-fuel/               # [FOR FUEL-DEV AGENT] Integrated Nutrition/Macro Tracking
```

## 3. Package Responsibilities

### `packages/db-bridge`
*   **Interface**: Provides a unified API (`getHabits()`, `saveSession()`, `getMacros()`).
*   **Drivers**: Detects environment (Local vs. Cloud) and routes calls to either the Node.js API (9100) or Firebase Firestore.
*   **State**: Manages the global date-context shared across all views.

### `packages/ui-kit`
*   **CSS**: Contains the master `styles.css` with 15+ AlphaOS Themes.
*   **Components**: Shared atomic elements (Buttons, Cards, Modals).
*   **Namespace**: All styles use the `fit-` prefix to prevent collision.

### `packages/view-*` (Micro-Apps)
*   Each Tab is an independent package with its own `package.json`.
*   Views are built to be "host-agnostic"—they consume logic from `db-bridge` and components from `ui-kit`.

## 4. Integration Guidelines for Fuel-Dev
The `fuel-dev` module should be modularized to match the **v3.0.0 architecture** established in Fitness-Dev:
1.  **Modular Views**: Break monolithic nutrition views into a folder structure (e.g., `Fuel/index.jsx`, `Fuel/MacroTracker.jsx`).
2.  **DB Abstraction**: Rely on relative imports (initially) to a `db.js` that follows the `db-bridge` interface.
3.  **Parity**: Ensure both a "Local Coach" view (deep analysis) and a "Client PWA" view (fast logging) are supported by the same code.

## 5. Current Progress
- [x] **v3.0.0 Release**: Successfully unified Fitness Local and PWA views.
- [x] **Data Layer Parity**: `src/lib/db` now supports `setsArray` (Multi-Sets).
- [ ] **Phase 1 (Next)**: Move `src/lib/db` to `packages/db-bridge`.
- [ ] **Phase 2**: Move modular views to `packages/view-*`.
- [ ] **Phase 3**: Link `view-fuel` from the Fuel-Dev project.

---
**Status**: Ready for inspection by Sub-Agents and Cross-Project synchronization.
