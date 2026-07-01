from __future__ import annotations

import os
from pathlib import Path


PACKAGE_ROOT = Path(__file__).resolve().parent

def _resolve_data_dir() -> Path:
    override = os.environ.get("FITNESS_AGENT_KB", "").strip()
    if override:
        return Path(override).expanduser()
    # fitness_agent/ liegt im Root von fitness-dev → fitness-dev/catalog/kb/
    candidate = PACKAGE_ROOT.parent / "catalog" / "kb"
    if candidate.exists():
        return candidate
    # Fallback: Legacy-Position innerhalb catalog/
    fallback = PACKAGE_ROOT.parent / "kb"
    if fallback.exists():
        return fallback
    return candidate  # Pfad zurückgeben auch wenn nicht vorhanden (klarerer Fehler)

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
