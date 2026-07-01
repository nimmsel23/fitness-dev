from __future__ import annotations

import os
from pathlib import Path


PACKAGE_ROOT = Path(__file__).resolve().parent

def _resolve_data_dir() -> Path:
    override = os.environ.get("FITNESS_AGENT_KB", "").strip()
    if override:
        return Path(override).expanduser()
    # Source-Installation: catalog/fitness_agent/ → catalog/kb/
    candidate = PACKAGE_ROOT.parent / "kb"
    if candidate.exists():
        return candidate
    # Fallback für uv tool install: ~/fitness-dev/catalog/kb/
    fallback = Path.home() / "fitness-dev" / "catalog" / "kb"
    return fallback

DATA_DIR = _resolve_data_dir()


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
