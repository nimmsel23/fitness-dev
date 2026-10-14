"""Plan-Generator (dünner Wrapper um fitness.catalog.planner)."""
from __future__ import annotations

import dataclasses
from typing import Any


class UnknownTemplate(LookupError):
    pass


def list_templates() -> dict[str, Any]:
    from fitness.catalog.planner import load_program_rules

    rules = load_program_rules()
    return {"default": rules.get("default_template"), "templates": sorted((rules.get("templates") or {}).keys())}


def build(template: str | None = None, split: str | None = None, day: str | None = None, goal: str | None = None) -> dict[str, Any]:
    from fitness.catalog.planner import build_plan

    clean = lambda v: (v or "").strip() or None  # noqa: E731
    try:
        result = build_plan(template=clean(template), split=clean(split), day=clean(day), goal=clean(goal))
    except ValueError as exc:
        msg = str(exc)
        if msg.startswith("Unknown plan template"):
            raise UnknownTemplate(msg) from None
        raise
    return dataclasses.asdict(result) if dataclasses.is_dataclass(result) else dict(result)
