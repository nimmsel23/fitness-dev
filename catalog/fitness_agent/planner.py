from __future__ import annotations

from collections import defaultdict
from dataclasses import dataclass
from typing import Any

from .coverage import calculate_coverage
from .loader import load_catalog_yaml
from .resolver import build_exercise_index


@dataclass
class PlanResult:
    template: str
    split: str | None
    day: str | None
    goal: str | None
    slots: list[dict[str, Any]]
    coverage_summary: dict[str, Any]


def build_plan(*, template: str | None = None, split: str | None = None, day: str | None = None, goal: str | None = None) -> PlanResult:
    rules = load_program_rules()
    template_name = resolve_template_name(template=template, split=split, day=day, rules=rules)
    template_def = find_template(template_name, rules)
    if template_def is None:
        raise ValueError(f"Unknown plan template: {template_name}")

    exercise_ids = {record.exercise_id for record in build_exercise_index()}
    selected_ids: set[str] = set()
    slots = build_slots(template_def, exercise_ids, selected_ids)
    coverage_summary = build_coverage_summary(slots, rules)
    return PlanResult(
        template=template_name,
        split=split,
        day=day,
        goal=goal,
        slots=slots,
        coverage_summary=coverage_summary,
    )


def load_program_rules() -> dict[str, Any]:
    rules = load_catalog_yaml("rules/program_rules.yml")
    if isinstance(rules, dict):
        section = rules.get("program_rules", rules)
        if isinstance(section, dict):
            return section
    raise ValueError("program_rules.yml is invalid")


def resolve_template_name(*, template: str | None, split: str | None, day: str | None, rules: dict[str, Any]) -> str:
    if template and template.strip():
        return template.strip()
    if day and day.strip():
        return f"{day.strip()}_day"
    default_split = rules.get("default_split")
    if isinstance(default_split, str) and default_split.strip():
        return default_split.strip()
    raise ValueError("No plan template provided")


def find_template(template_name: str, rules: dict[str, Any]) -> dict[str, Any] | None:
    templates = rules.get("templates", {})
    if not isinstance(templates, dict):
        return None
    template = templates.get(template_name)
    return template if isinstance(template, dict) else None


def build_slots(template_def: dict[str, Any], exercise_ids: set[str], selected_ids: set[str]) -> list[dict[str, Any]]:
    raw_slots = template_def.get("slots", [])
    if not isinstance(raw_slots, list):
        return []

    slots: list[dict[str, Any]] = []
    for slot in raw_slots:
        if not isinstance(slot, dict):
            continue
        name = slot.get("name")
        choose_from = slot.get("choose_from", [])
        if not isinstance(name, str) or not name.strip():
            continue
        if not isinstance(choose_from, list):
            choose_from = []
        available = [candidate for candidate in choose_from if isinstance(candidate, str) and candidate in exercise_ids and candidate not in selected_ids]
        selected = available[0] if available else None
        if selected:
            selected_ids.add(selected)
        slots.append(
            {
                "name": name,
                "choose_from": [candidate for candidate in choose_from if isinstance(candidate, str)],
                "selected_exercise": selected,
            }
        )
    return slots


def build_coverage_summary(slots: list[dict[str, Any]], rules: dict[str, Any]) -> dict[str, Any]:
    coverage_defaults = rules.get("coverage_defaults", {})
    default_sets = 1
    default_rpe = 8
    if isinstance(coverage_defaults, dict):
        if isinstance(coverage_defaults.get("sets"), int):
            default_sets = coverage_defaults["sets"]
        if isinstance(coverage_defaults.get("rpe"), int):
            default_rpe = coverage_defaults["rpe"]

    selected_exercises = [slot["selected_exercise"] for slot in slots if slot.get("selected_exercise")]
    muscle_scores: dict[str, float] = defaultdict(float)
    body_region_scores: dict[str, float] = defaultdict(float)
    unmapped_muscles: set[str] = set()
    selected_details: list[dict[str, Any]] = []

    for exercise_id in selected_exercises:
        coverage = calculate_coverage(exercise_id, default_sets, default_rpe)
        selected_details.append(
            {
                "exercise": coverage["exercise_id"],
                "sets": coverage["sets"],
                "rpe": coverage["rpe"],
            }
        )
        for muscle_id, score in coverage["muscle_scores"].items():
            muscle_scores[muscle_id] += score
        for region, score in coverage["body_region_scores"].items():
            body_region_scores[region] += score
        unmapped_muscles.update(coverage["unmapped_muscles"])

    return {
        "sets": default_sets,
        "rpe": default_rpe,
        "selected_exercises": selected_details,
        "muscle_scores": dict(sorted(muscle_scores.items())),
        "body_region_scores": dict(sorted(body_region_scores.items())),
        "unmapped_muscles": sorted(unmapped_muscles),
    }
