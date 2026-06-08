# AlphaOS Fitness Ecosystem — Tool List

This document provides a comprehensive overview of the primary tools, libraries, and frameworks powering the AlphaOS Fitness ecosystem.

## 🛠 Tool Overview

| Tool | Category | Role in Project | Primary Benefit |
| :--- | :--- | :--- | :--- |
| **Typer** | CLI | Command-line interface logic | Type-safe, intuitive commands & auto-help |
| **Rich** | UI/UX | Terminal formatting & styling | Beautiful tables, panels, and colored output |
| **Loguru** | Logging | System & process logging | Structured, readable logs with zero boilerplate |
| **TQDM** | UX | Progress visualization | Real-time progress bars for long-running loops |
| **Halo** | UX | Terminal spinners | Elegant feedback for asynchronous operations |
| **Watchdog** | Automation | File system monitoring | Event-driven reactions to file changes |
| **Gum** | Shell UX | Interactive shell scripts | Interactive menus and glamorous scripts |
| **Rapidfuzz** | NLP | Fuzzy string matching | Smart exercise and alias resolution |
| **Wasabi** | CLI UX | Lightweight console printing | Fast, colored console output for scripts |

---

## 🐍 Python Stack (CLI & Backend)

### [Typer](https://typer.tiangolo.com/)
Modern library for building CLI applications based on Python type hints.
*   **Usage**: Powering `fitness-agent` CLI and auxiliary scripts in `scripts/`.
*   **Implementation**: Replaced `argparse` for better maintainability and developer UX.

### [Rich](https://github.com/Textualize/rich)
Rich text and beautiful formatting in the terminal.
*   **Usage**: Rendering audit reports, doctor status tables, and stylized error panels.
*   **Implementation**: Centralized in `rich_utils.py` for ecosystem-wide consistency.

### [Loguru](https://github.com/Delgan/loguru)
Simplified and powerful logging with color and structure.
*   **Usage**: Background daemons (`watcher`, `mirror`) and data processing pipelines.
*   **Implementation**: Integrated with `RichHandler` for professional console output.

### [TQDM](https://github.com/tqdm/tqdm)
Fast, extensible progress bars for loops and data processing.
*   **Usage**: `kb-sync` (Firestore sync) and bulk exercise imports.
*   **Implementation**: Visualizing batch processing of exercises, anatomy, and muscles.

### [Halo](https://github.com/manrajgrover/halo)
Beautiful terminal spinners for tasks where progress is unknown.
*   **Usage**: Firebase connection initialization and API health checks.
*   **Implementation**: Providing immediate feedback during short wait times.

### [Watchdog](https://github.com/gorakhargosh/python-watchdog)
API library and shell utilities to monitor file system events.
*   **Usage**: `ai_enricher_watcher.py` and `build-catalog.py --watch`.
*   **Implementation**: Enabling event-driven automation instead of inefficient polling.

### Infrastructure & APIs
*   **[Firebase Admin SDK](https://firebase.google.com/docs/admin/setup)**: Core integration for user data sync and Firestore KB management.
*   **[PyYAML](https://pyyaml.org/)**: Standard parser for the local Knowledge Base (KB) YAML files.
*   **[Aiohttp](https://docs.aiohttp.org/en/stable/)**: Used for asynchronous integrations and the local agent server.

---

## ⚛️ Frontend Stack (PWA)

*   **[Vite](https://vitejs.dev/)**: Next-generation frontend tooling and dev server.
*   **[React](https://reactjs.org/)**: UI library for the mobile-first dashboard and modular view system.
*   **[Tailwind CSS](https://tailwindcss.com/)**: Utility-first CSS framework for "AlphaOS" aesthetics.
*   **[Lucide Icons](https://lucide.dev/)**: Clean and consistent icon set used throughout the UI.
*   **[Recharts](https://recharts.org/)**: Composable charting library for training volume and weight analytics.
*   **[Firebase SDK](https://firebase.google.com/docs/web/setup)**: Client-side real-time data sync and hosting.

---

## 🛠 Utilities & Infrastructure

### [Gum](https://github.com/charmbracelet/gum)
Tool for glamorous shell scripts.
*   **Usage**: Interactive main menu in `fitnessctl` and service spinners.
*   **Implementation**: Providing a "TUI-like" feel to standard bash management tasks.

### External References
*   **[wger](https://wger.de/)**: Open-source fitness manager used as the primary source for muscle normalization and IDs.
*   **[Obsidian](https://obsidian.md/)**: The final destination for expert coaching notes and automated weekly training reports.
