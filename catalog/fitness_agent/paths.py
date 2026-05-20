from __future__ import annotations

import os
from pathlib import Path


PACKAGE_ROOT = Path(__file__).resolve().parent
REPO_ROOT = PACKAGE_ROOT.parent
DATA_DIR = REPO_ROOT / "kb"


def runtime_root() -> Path:
    override = os.environ.get("FITNESS_AGENT_HOME", "").strip()
    if override:
        return Path(override).expanduser()
    return Path.home() / ".aos" / "fitness"


RUNTIME_SUBDIRS = [
    "agent-state",
    "cache",
    "backups",
    "exports",
    "exports/obsidian",
    "exports/wger",
    "exports/json",
    "exports/client_notes",
]

REQUIRED_RUNTIME_FILES = [
    "agent-state/training_history.sqlite",
]
