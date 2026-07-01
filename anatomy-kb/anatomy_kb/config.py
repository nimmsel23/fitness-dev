"""Central path resolver for anatomy-kb.

Works in two layouts:
  Subtree:  ~/fitness-dev/anatomy-kb/   (anatomy-kb is child of fitness-dev)
  Sibling:  ~/anatomy-kb/ next to ~/fitness-dev/   (legacy)

Override via env: ANATOMY_KB_FITNESS_DEV=/path/to/fitness-dev
"""
from __future__ import annotations

import os
from pathlib import Path

# anatomy-kb package root (this file lives in anatomy_kb/)
ANATOMY_KB_ROOT = Path(__file__).resolve().parent.parent


def get_fitness_dev() -> Path | None:
    if env := os.environ.get("ANATOMY_KB_FITNESS_DEV"):
        p = Path(env)
        if (p / "catalog" / "kb").exists():
            return p

    # Subtree layout: anatomy-kb/ is direct child of fitness-dev/
    candidate = ANATOMY_KB_ROOT.parent
    if (candidate / "catalog" / "kb").exists():
        return candidate

    # Legacy sibling layout: ~/anatomy-kb/ next to ~/fitness-dev/
    candidate = ANATOMY_KB_ROOT.parent / "fitness-dev"
    if (candidate / "catalog" / "kb").exists():
        return candidate

    return None


FITNESS_DEV = get_fitness_dev()
CATALOG_DIR = FITNESS_DEV / "catalog" if FITNESS_DEV else None
CATALOG_EXERCISES = FITNESS_DEV / "catalog" / "kb" / "exercises" if FITNESS_DEV else None
ANATOMY_TEACHING = FITNESS_DEV / "catalog" / "kb" / "anatomy_teaching" if FITNESS_DEV else None
