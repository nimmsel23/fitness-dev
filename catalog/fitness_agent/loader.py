from __future__ import annotations

import shutil
from datetime import datetime
from pathlib import Path
from typing import Any

from .paths import DATA_DIR, runtime_root
from .yaml_utils import load_yaml


def catalog_path(relative_path: str) -> Path:
    """Pfad zu einer versionierten YAML-Datei in catalog/data/."""
    return DATA_DIR / relative_path


def runtime_path(relative_path: str) -> Path:
    """Pfad zu mutablem Runtime-State in ~/.aos/fitness/."""
    return runtime_root() / relative_path


def load_catalog_yaml(relative_path: str) -> Any:
    return load_yaml(catalog_path(relative_path))


def iter_catalog_yaml_files(relative_dir: str) -> list[Path]:
    directory = catalog_path(relative_dir)
    if not directory.exists():
        return []
    return sorted(p for p in directory.glob("*.yml") if p.is_file())


def load_catalog_directory_yaml(relative_dir: str) -> list[tuple[Path, Any]]:
    return [(p, load_yaml(p)) for p in iter_catalog_yaml_files(relative_dir)]


load_runtime_yaml = load_catalog_yaml
load_runtime_directory_yaml = load_catalog_directory_yaml


def backup_existing(target: Path) -> Path:
    timestamp = datetime.now().strftime("%Y%m%dT%H%M%S%f")
    backup_root = runtime_root() / "backups" / timestamp
    backup_target = backup_root / target.name
    backup_target.parent.mkdir(parents=True, exist_ok=True)
    shutil.copy2(target, backup_target)
    return backup_target
