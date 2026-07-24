from __future__ import annotations

from typing import Any

from fitness.catalog.core.loader import load_catalog_yaml, load_catalog_directory_yaml, catalog_path
from fitness.catalog.core.yaml_utils import load_yaml
from fitness.catalog.agent.teaching import parse_lesson_document


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
    """Gibt die gültigen Body-Regionen zurück, gesammelt aus dem body_region-Feld
    aller muscles/**/*.yml (Gruppen-Files + feinere Overrides in Unterordnern)."""
    region_dir = catalog_path("muscles")
    skip = {"muscle_index"}
    regions: set[str] = set()
    for yml_file in region_dir.rglob("*.yml"):
        if yml_file.name.startswith("_") or yml_file.stem in skip:
            continue
        document = load_yaml(yml_file)
        if not isinstance(document, dict):
            continue
        body_region = document.get("body_region")
        if isinstance(body_region, str) and body_region.strip():
            regions.add(body_region.strip())
    return regions if regions else None
