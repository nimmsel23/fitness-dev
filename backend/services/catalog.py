"""Übungskatalog: Suche und Einzelabruf (dünner Wrapper um fitness.catalog)."""
from __future__ import annotations

from typing import Any

from backend.services.analytics import _resources


class ExerciseNotFound(LookupError):
    pass


def _row(ex) -> dict[str, Any]:
    return {
        "exercise_id": ex.exercise_id,
        "display_name": ex.display_name or ex.exercise_id,
        "german": ex.german or None,
        "category": ex.category or None,
        "primary_muscles": ex.primary_muscles or [],
        "secondary_muscles": ex.secondary_muscles or [],
        "equipment": ex.equipment or [],
        "source": "expert" if "expert" in (ex.tags or []) else "local",
    }


def search(q: str, limit: int = 12) -> dict[str, Any]:
    q = (q or "").strip().lower()
    limit = max(1, min(limit, 50))
    if not q:
        return {"results": [], "total": 0}
    hits = []
    for ex in _resources()["records"]:
        fields = [ex.exercise_id, ex.display_name, ex.german, *(ex.aliases or []), *(ex.search_aliases or []), *(ex.tags or [])]
        if any(q in str(f).lower() for f in fields if f):
            hits.append(_row(ex))
    return {"results": hits[:limit], "total": len(hits)}


def get(exercise_id: str) -> dict[str, Any]:
    from fitness.catalog.core.resolver import find_by_id

    ex = find_by_id(exercise_id, _resources()["records"])
    if ex is None:
        raise ExerciseNotFound(exercise_id)
    return {**_row(ex), "movement_pattern": ex.movement_pattern or None,
            "stabilizers": ex.stabilizers or [], "instructions": ex.instructions or [],
            "common_errors": ex.common_errors or [], "coaching_notes": ex.coaching_notes or []}
