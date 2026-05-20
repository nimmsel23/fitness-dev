"""
Lädt alle Exercise-YAMLs aus dem exercises/-Verzeichnis.

Verzeichnis-Konvention:
  ~/anatomy-kb/exercises/<exercise_id>.yml

Jede Datei wird beim ersten Zugriff geladen und im Speicher gecacht.
reload() leert den Cache — nützlich für Live-Reload ohne Server-Neustart.
"""

from pathlib import Path
from typing import Optional

import yaml
from loguru import logger

_cache: dict[str, dict] = {}
_exercises_dir: Optional[Path] = None


def init(exercises_dir: Path) -> None:
    """Setzt das Exercises-Verzeichnis und leert den Cache."""
    global _exercises_dir
    _exercises_dir = exercises_dir
    _cache.clear()
    logger.info(f"loader: exercises_dir={exercises_dir}")


def _dir() -> Path:
    if _exercises_dir is None:
        raise RuntimeError("loader.init() wurde noch nicht aufgerufen")
    return _exercises_dir


def load_all() -> dict[str, dict]:
    """Lädt alle YAMLs und gibt {exercise_id: data} zurück."""
    if _cache:
        return _cache

    path = _dir()
    if not path.exists():
        logger.warning(f"exercises_dir existiert nicht: {path}")
        return {}

    for yml_file in sorted(path.glob("*.yml")):
        exercise_id = yml_file.stem
        try:
            data = yaml.safe_load(yml_file.read_text())
            if data and isinstance(data, dict):
                _cache[exercise_id] = data
        except yaml.YAMLError as e:
            logger.error(f"YAML-Fehler in {yml_file.name}: {e}")

    logger.info(f"loader: {len(_cache)} Übungen geladen")
    return _cache


def load_one(exercise_id: str) -> Optional[dict]:
    """Gibt eine einzelne Übung zurück oder None wenn nicht gefunden."""
    all_exercises = load_all()
    return all_exercises.get(exercise_id)


def reload() -> None:
    """Leert den In-Memory-Cache. Nächster Zugriff lädt neu von Disk."""
    _cache.clear()
    logger.info("loader: cache geleert")


def list_ids() -> list[str]:
    """Gibt alle bekannten exercise_ids zurück."""
    return sorted(load_all().keys())
