from __future__ import annotations

import os
import shutil
from dataclasses import dataclass
from datetime import datetime
from pathlib import Path

from .paths import DATA_DIR, RUNTIME_SUBDIRS, seed_file_map, runtime_root


@dataclass
class BootstrapEvent:
    level: str
    message: str


def bootstrap(force: bool = False) -> list[BootstrapEvent]:
    events: list[BootstrapEvent] = []
    runtime = runtime_root()
    ensure_runtime_layout(events)

    for relative_target, relative_source in seed_file_map().items():
        source = DATA_DIR / relative_source
        target = runtime / relative_target
        copied = copy_seed_file(source, target, force=force)
        if copied is None:
            events.append(BootstrapEvent("OK", f"{relative_target} already exists"))
        elif copied:
            events.append(BootstrapEvent("OK", f"{relative_target} installed"))
        else:
            events.append(BootstrapEvent("WARN", f"{relative_target} source missing"))

    return events


def ensure_runtime_layout(events: list[BootstrapEvent]) -> None:
    runtime = runtime_root()
    runtime.mkdir(parents=True, exist_ok=True)
    events.append(BootstrapEvent("OK", f"{runtime} exists"))
    for relative_dir in RUNTIME_SUBDIRS:
        directory = runtime / relative_dir
        directory.mkdir(parents=True, exist_ok=True)


def copy_seed_file(source: Path, target: Path, *, force: bool) -> bool | None:
    if not source.exists():
        return False

    target.parent.mkdir(parents=True, exist_ok=True)

    if target.exists() and not force:
        return None

    if target.exists() and force:
        backup_existing(target)

    temp_path = target.parent / f".{target.name}.tmp-{os.getpid()}"
    try:
        shutil.copy2(source, temp_path)
        os.replace(temp_path, target)
    finally:
        if temp_path.exists():
            temp_path.unlink(missing_ok=True)
    return True


def backup_existing(target: Path) -> Path:
    timestamp = datetime.now().strftime("%Y%m%dT%H%M%S%f")
    runtime = runtime_root()
    backup_root = runtime / "backups" / timestamp
    backup_target = backup_root / target.relative_to(runtime)
    backup_target.parent.mkdir(parents=True, exist_ok=True)
    shutil.copy2(target, backup_target)
    return backup_target
