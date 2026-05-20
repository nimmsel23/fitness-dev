from __future__ import annotations

import os
from pathlib import Path


PACKAGE_ROOT = Path(__file__).resolve().parent
REPO_ROOT = PACKAGE_ROOT.parent
DATA_DIR = REPO_ROOT / "data"


def runtime_root() -> Path:
    override = os.environ.get("FITNESS_AGENT_HOME", "").strip()
    if override:
        return Path(override).expanduser()
    return Path.home() / ".aos" / "fitness"


RUNTIME_SUBDIRS = [
    "exercises",
    "muscles",
    "rules",
    "maps",
    "anatomy_teaching",
    "agent-state",
    "cache",
    "backups",
    "exports",
    "exports/obsidian",
    "exports/wger",
    "exports/json",
    "exports/client_notes",
]


def seed_file_map() -> dict[str, str]:
    """Alle .yml-Dateien in DATA_DIR als relative_target → relative_source."""
    if not DATA_DIR.exists():
        return {}
    return {
        str(p.relative_to(DATA_DIR)): str(p.relative_to(DATA_DIR))
        for p in DATA_DIR.rglob("*.yml")
    }


REQUIRED_RUNTIME_FILES = [
    "config.yml",
    "maps/aliases.yml",
    "rules/program_rules.yml",
    "muscles/muscles.yml",
    "muscles/body_highlighter_bridge.yml",
    "maps/wger_mapping.yml",
]
