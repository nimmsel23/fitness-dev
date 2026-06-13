# fitness-dev TODO

## 🚨 High Priority (Bugs & Regressions)
- [ ] **Desktop Layout Regression**: Sidebar and Main Content interaction on desktop is still conflicting (navigation elements sometimes appearing in incorrect columns or overlapping).
- [ ] **Muscle Coverage Inconsistency**: Dashboard (Heute) tab indicates "Hamstrings" and "Calves" as "Coverage Gaps" despite backend fixes.
- [ ] **Theme Persistence**: Themes inconsistently apply on desktop browsers (investigate style loading/caching).

## 🛠 Features & Improvements
- [ ] **Media Integration**: Integrate images from `yuhonas` database as fallback/static alternatives to GIFs.
- [ ] **ExerciseDB API**: Evaluate and potentially integrate `exercisedb-api` for even broader coverage.
- [ ] **Drag & Drop Dashboard**: Implement customizable widget layout (Ref: `react-grid-layout`).
- [ ] **Habit-Journal Modal**: Implement popup journal modal triggered from each habit.
- [ ] **PWA Offline Support**: Ensure essential features work without active connection.
- [ ] **Anatomy Teaching**: Expand deep anatomy content for all core exercises in the catalog.

## 🏗 Architectural / Tech Debt
- [ ] **Multi-Session Schema**: Migrate to `sessions/{sessionId}` structure to support multiple workouts per day.
- [ ] **Habit Tab Refactoring**: Refactor Habit Tab into a more encapsulated, app-like structure.
- [ ] **Local Data Migration**: Move `data/` from repo-local to `~/.aos/fitness/` (Started).

## ✅ Completed (Recently)
- [x] **GIF Enrichment**: Automated mapping of 285+ exercises to GIF animations.
- [x] **Exercise Library Visuals**: Thumbnail previews in the Learn tab.
- [x] **Critical Bugfixes**: Fixed agent server crashes and sync errors.
- [x] **Documentation Sync**: Architecture and vision docs updated to June 2026.
