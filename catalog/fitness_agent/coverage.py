from __future__ import annotations

from collections import defaultdict
from typing import Any

from .loader import load_catalog_yaml
from .resolver import build_exercise_index, resolve_query

ROLE_WEIGHTS = {
    "primary": 1.0,
    "secondary": 0.5,
    "stabilizer": 0.2,
}


def calculate_coverage(exercise_query: str, sets: int, rpe: int) -> dict[str, Any]:
    resolution = resolve_query(exercise_query)
    if not resolution.matched or not resolution.canonical_id:
        raise ValueError(f"Unknown exercise: {exercise_query}")

    exercise = find_exercise(resolution.canonical_id)
    if exercise is None:
        raise ValueError(f"Exercise not found: {resolution.canonical_id}")

    taxonomy = load_muscle_taxonomy()
    alias_map = build_muscle_alias_map(taxonomy)
    bridge = load_body_highlighter_bridge()
    rules = load_coverage_rules()
    effort_factor = effort_factor_for_rpe(rpe, rules)

    muscle_scores: dict[str, float] = defaultdict(float)
    add_role_scores(muscle_scores, exercise.primary_muscles or [], sets, ROLE_WEIGHTS["primary"], effort_factor, alias_map)
    add_role_scores(muscle_scores, exercise.secondary_muscles or [], sets, ROLE_WEIGHTS["secondary"], effort_factor, alias_map)
    add_role_scores(muscle_scores, exercise.stabilizers or [], sets, ROLE_WEIGHTS["stabilizer"], effort_factor, alias_map)

    body_region_scores: dict[str, float] = defaultdict(float)
    unmapped_muscles: list[str] = []

    for muscle_id, score in muscle_scores.items():
        regions = muscle_regions(muscle_id, taxonomy, bridge)
        if regions:
            for region in regions:
                body_region_scores[region] += score
        else:
            unmapped_muscles.append(muscle_id)

    return {
        "exercise_query": exercise_query,
        "exercise_id": exercise.exercise_id,
        "display_name": exercise.display_name,
        "sets": sets,
        "rpe": rpe,
        "effort_factor": effort_factor,
        "muscle_scores": dict(sorted(muscle_scores.items())),
        "body_region_scores": dict(sorted(body_region_scores.items())),
        "unmapped_muscles": sorted(unmapped_muscles),
    }


def find_exercise(exercise_id: str):
    for record in build_exercise_index():
        if record.exercise_id == exercise_id:
            return record
    return None


def add_role_scores(muscle_scores: dict[str, float], muscles: list[str], sets: int, role_weight: float, effort_factor: float, alias_map: dict[str, str] | None = None) -> None:
    for muscle_id in muscles:
        resolved = resolve_muscle_id(muscle_id, alias_map) if alias_map else normalize_muscle_id(muscle_id)
        muscle_scores[resolved] += sets * role_weight * effort_factor


def normalize_muscle_id(name: str) -> str:
    """Konvertiert Muskelnamen in eine kanonische ID (lowercase, snake_case)."""
    import re
    import unicodedata

    if not name:
        return ""

    normalized = unicodedata.normalize("NFKD", name)
    stripped = "".join(char for char in normalized if not unicodedata.combining(char))
    collapsed = re.sub(r"[^a-zA-Z0-9]+", "_", stripped.casefold())
    return collapsed.strip("_")


def build_muscle_alias_map(taxonomy: dict[str, dict[str, Any]]) -> dict[str, str]:
    """Baut eine Map von plain/display Namen auf numbered taxonomy IDs.

    Erlaubt Lookup von z.B. 'gluteus_maximus', 'Glutes', 'glutes' → '601_gluteus_maximus'.
    """
    import re
    alias_map: dict[str, str] = {}
    for muscle_id, data in taxonomy.items():
        if re.match(r'^\d00_', muscle_id):
            continue
        alias_map[muscle_id] = muscle_id
        suffix = re.sub(r'^\d+_', '', muscle_id)
        if suffix:
            alias_map[suffix] = muscle_id
        for field in ("label_en", "label_de", "display_name"):
            val = data.get(field, "")
            if isinstance(val, str) and val:
                norm = normalize_muscle_id(val)
                if norm:
                    alias_map.setdefault(norm, muscle_id)
    return alias_map


def resolve_muscle_id(raw: str, alias_map: dict[str, str]) -> str:
    """Gibt die numbered taxonomy ID zurück, oder den normalisierten Rohwert wenn nicht gefunden."""
    norm = normalize_muscle_id(raw)
    return alias_map.get(norm, norm)


def load_muscle_taxonomy() -> dict[str, dict[str, Any]]:
    taxonomy = load_catalog_yaml("muscles/muscle_index.yml")
    if not isinstance(taxonomy, dict):
        return {}
    muscles = taxonomy.get("muscles", {})
    if not isinstance(muscles, dict):
        return {}
    result: dict[str, dict[str, Any]] = {}
    for muscle_id, data in muscles.items():
        if isinstance(muscle_id, str) and isinstance(data, dict):
            result[muscle_id] = data
    return result


def load_coverage_rules() -> dict[str, Any]:
    rules = load_catalog_yaml("muscles/muscle_coverage_rules.yml")
    if isinstance(rules, dict):
        return rules.get("coverage_rules", rules) if isinstance(rules.get("coverage_rules", rules), dict) else {}
    return {}


def load_body_highlighter_bridge() -> dict[str, list[str]]:
    # Bridge file is optional — body_region is already present in individual muscle YAMLs
    try:
        bridge = load_catalog_yaml("muscles/body_highlighter_bridge.yml")
    except FileNotFoundError:
        return {}
    if not isinstance(bridge, dict):
        return {}
    raw_bridge = bridge.get("bridge", bridge)
    if not isinstance(raw_bridge, dict):
        return {}
    mapping = raw_bridge.get("muscle_to_region", {})
    if not isinstance(mapping, dict):
        return {}
    result: dict[str, list[str]] = {}
    for muscle_id, region in mapping.items():
        if not isinstance(muscle_id, str):
            continue
        if isinstance(region, str) and region.strip():
            result[muscle_id] = [region.strip()]
        elif isinstance(region, list):
            regions = [item.strip() for item in region if isinstance(item, str) and item.strip()]
            if regions:
                result[muscle_id] = regions
    return result


def effort_factor_for_rpe(rpe: int, rules: dict[str, Any]) -> float:
    factors = rules.get("effort_factors_by_rpe", {})
    if isinstance(factors, dict):
        factor = factors.get(rpe)
        if isinstance(factor, (int, float)):
            return float(factor)
        factor = factors.get(str(rpe))
        if isinstance(factor, (int, float)):
            return float(factor)
    default_factor = rules.get("default_effort_factor", 1.0)
    return float(default_factor) if isinstance(default_factor, (int, float)) else 1.0


def muscle_regions(muscle_id: str, taxonomy: dict[str, dict[str, Any]], bridge: dict[str, list[str]]) -> list[str]:
    if muscle_id in bridge:
        return bridge[muscle_id]
    muscle = taxonomy.get(muscle_id)
    if not muscle:
        return []
    region = muscle.get("body_region")
    if isinstance(region, str) and region.strip():
        return [region.strip()]
    return []
