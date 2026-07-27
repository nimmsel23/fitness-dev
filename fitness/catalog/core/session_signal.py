from __future__ import annotations

from typing import Any
import re


def _positive_number(value: Any) -> bool:
    try:
        return float(value or 0) > 0
    except (TypeError, ValueError):
        return False


def exercise_has_training_signal(exercise: dict[str, Any]) -> bool:
    """Return true only for entries that look actually performed.

    Search/catalog template entries can appear in session JSON with empty
    `setsArray` rows. Those must not drive demand audits or proactive inbox
    enrichment.
    """
    if bool(exercise.get("done")):
        return True

    if _note_has_training_signal(exercise.get("note") or exercise.get("notes")):
        return True

    for key in ("sets", "reps", "weight", "rpe"):
        if _positive_number(exercise.get(key)):
            return True

    sets_array = exercise.get("setsArray")
    if isinstance(sets_array, list):
        for item in sets_array:
            if not isinstance(item, dict):
                continue
            for key in ("reps", "weight", "rpe"):
                if _positive_number(item.get(key)):
                    return True

    return False


def _note_has_training_signal(value: Any) -> bool:
    text = str(value or "").strip().casefold()
    if not text:
        return False
    return bool(
        re.search(r"\b\d+(?:[.,]\d+)?\s*(?:kg|kilo|x|wdh|rep|reps|wiederholung)", text)
    )
