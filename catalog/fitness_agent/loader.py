from __future__ import annotations

from pathlib import Path
from typing import Any

from .paths import runtime_root
from .yaml_utils import load_yaml


def runtime_path(relative_path: str) -> Path:
    return runtime_root() / relative_path


def load_runtime_yaml(relative_path: str) -> Any:
    return load_yaml(runtime_path(relative_path))


def iter_runtime_yaml_files(relative_dir: str) -> list[Path]:
    directory = runtime_path(relative_dir)
    if not directory.exists():
        return []
    return sorted(path for path in directory.glob("*.yml") if path.is_file())


def load_runtime_directory_yaml(relative_dir: str) -> list[tuple[Path, Any]]:
    documents: list[tuple[Path, Any]] = []
    for path in iter_runtime_yaml_files(relative_dir):
        documents.append((path, load_yaml(path)))
    return documents
