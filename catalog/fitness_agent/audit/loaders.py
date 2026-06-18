from __future__ import annotations

from typing import Any

from ..loader import load_catalog_yaml, load_catalog_directory_yaml
from ..coverage import load_body_highlighter_bridge
from ..teaching import parse_lesson_document


def load_all_anatomy_lessons() -> list[dict[str, Any]]:
    lessons: list[dict[str, Any]] = []
    for path, document in load_catalog_directory_yaml("anatomy_teaching"):
        if path.name in {"chest_lessons.yml", "joint_actions.yml", "coaching_language.yml"}:
            continue
        lessons.extend(parse_lesson_document(document))
    return lessons


def load_legacy_lesson_ids() -> set[str]:
    try:
        document = load_catalog_yaml("anatomy_teaching/chest_lessons.yml")
    except FileNotFoundError:
        return set()
    return {
        str(lesson.get("exercise_id", "")).strip()
        for lesson in parse_lesson_document(document)
        if str(lesson.get("exercise_id", "")).strip()
    }


def load_aliases_document() -> dict[str, Any] | None:
    try:
        aliases = load_catalog_yaml("maps/aliases.yml")
    except FileNotFoundError:
        return None
    if not isinstance(aliases, dict):
        return None
    return aliases


def load_body_regions() -> set[str] | None:
    """Gibt None zurück wenn body_highlighter_bridge nicht existiert oder deaktiviert ist."""
    try:
        document = load_catalog_yaml("muscles/body_highlighter_bridge.yml")
    except FileNotFoundError:
        return None
    if isinstance(document, dict):
        bridge_section = document.get("bridge", {})
        if isinstance(bridge_section, dict) and not bridge_section.get("enabled", False):
            return None
    bridge = load_body_highlighter_bridge()
    regions: set[str] = set()
    for value in bridge.values():
        if isinstance(value, list):
            for item in value:
                if isinstance(item, str) and item.strip():
                    regions.add(item.strip())
    if isinstance(document, dict):
        bridge_section = document.get("bridge", {})
        if isinstance(bridge_section, dict):
            for item in bridge_section.get("body_regions", []):
                if isinstance(item, str) and item.strip():
                    regions.add(item.strip())
    return regions
