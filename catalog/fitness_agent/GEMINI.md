# Fitness Agent — Subdirectory Instructions

This directory contains the Python-based expert system for the AlphaOS Fitness ecosystem. It handles catalog management, biomechanical audits, and synchronization between local YAML files and Firestore.

## Core Mandates

### 1. CLI Usage
- **Primary Entry Point**: Use the `fitness-agent` command (installed via the package) or `python3 -m fitness_agent`.
- **Key Commands**:
    - `kb-sync`: Synchronizes local YAML data to Firestore.
    - `audit all`: Runs biomechanical, anatomy, and alias checks.
    - `doctor`: Validates the local runtime environment.

### 2. Biomechanical Integrity
- All new exercises or modifications MUST pass the `audit` check.
- **Normalization**: Muscle IDs must align with `muscles.yml` (wger-mapped).
- **Rules**: Biomechanical logic is defined in `catalog/kb/rules/biomechanics.yml`.

### 3. Data Flow
- **Local Expert**: The `watcher.py` process monitors user input and performs AI enrichment via Gemini.
- **Expert-Wins**: Local "Expert Tier" data always takes precedence over "Bulk Layer" data during sync.

## Architecture

- `audit.py`: Deterministic biomechanical auditing engine.
- `kb_sync.py`: Hash-based synchronization logic for Firestore.
- `resolver.py`: Semantic search and exercise resolution.
- `watcher.py`: Real-time monitoring for AI enrichment.

## Extension Rules

- When adding new modules, follow the existing pattern of using `typer` for CLI commands and `loguru` for logging.
- Maintain compatibility with the `Cloud Chamber` architecture (Firestore as a bridge).
- Ensure all YAML parsing uses the utility functions in `yaml_utils.py` to maintain consistency.
