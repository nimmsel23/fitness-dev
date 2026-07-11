from __future__ import annotations

from typing import Any

from fitness.catalog.core.resolver import build_exercise_index, resolve_query
from fitness.catalog.agent.teaching import find_lesson


def build_coach_sheet(exercise_query: str) -> dict[str, Any]:
    resolution = resolve_query(exercise_query)
    if not resolution.matched or not resolution.canonical_id:
        raise ValueError(f"Unknown exercise: {exercise_query}")

    record = find_exercise(resolution.canonical_id)
    if record is None:
        raise ValueError(f"Exercise not found: {resolution.canonical_id}")

    lesson = find_lesson(record.exercise_id)
    lesson_payload = extract_lesson_payload(lesson)

    coaching_notes = list(record.coaching_notes or [])
    common_errors = list(record.common_errors or [])

    return {
        "exercise_id": record.exercise_id,
        "display_name": record.display_name,
        "german": record.german,
        "category": record.source_file.removesuffix(".yml"),
        "movement_pattern": first_value(record, "movement_pattern"),
        "equipment": first_value(record, "equipment", default=[]),
        "primary_muscles": record.primary_muscles or [],
        "secondary_muscles": record.secondary_muscles or [],
        "stabilizers": record.stabilizers or [],
        "coaching_notes": coaching_notes,
        "common_errors": common_errors,
        "lesson": lesson,
        "lesson_payload": lesson_payload,
        "feel_cues": lesson_payload.get("feel_cues", []),
        "client_friendly": lesson_payload.get("client_friendly", ""),
        "trainer_simple": lesson_payload.get("trainer_simple", ""),
        "trainer_technical": lesson_payload.get("trainer_technical", ""),
        "short_trainer_checklist": build_trainer_checklist(coaching_notes, common_errors, lesson_payload),
    }


def render_coach_sheet_markdown(sheet: dict[str, Any]) -> str:
    lines: list[str] = []
    lines.append(f"# Coach Sheet – {sheet['german'] or sheet['display_name']}")
    lines.append("")
    lines.append("## Kurzbeschreibung")
    lines.append(f"- Exercise ID: {sheet['exercise_id']}")
    lines.append(f"- Kategorie: {sheet['category']}")
    lines.append(f"- Bewegungsmuster: {sheet['movement_pattern']}")
    lines.append(f"- Equipment: {format_list(sheet['equipment'])}")
    lines.append("")
    lines.append("## Zielmuskeln")
    lines.append(f"- Primär: {format_list(sheet['primary_muscles'])}")
    lines.append(f"- Sekundär: {format_list(sheet['secondary_muscles'])}")
    lines.append(f"- Stabilisatoren: {format_list(sheet['stabilizers'])}")
    lines.append("")
    lines.append("## Coaching Points")
    for item in sheet["coaching_notes"]:
        lines.append(f"- {item}")
    if not sheet["coaching_notes"]:
        lines.append("- Keine Angaben")
    lines.append("")
    lines.append("## Häufige Fehler")
    for item in sheet["common_errors"]:
        lines.append(f"- {item}")
    if not sheet["common_errors"]:
        lines.append("- Keine Angaben")
    lines.append("")
    lines.append("## Anatomische Erklärung")
    lesson = sheet["lesson"]
    if lesson:
        lines.append(f"- {stringify(sheet.get('trainer_simple'))}")
        lines.append(f"- {stringify(sheet.get('trainer_technical'))}")
    else:
        lines.append("- Keine Anatomy-Lesson vorhanden.")
    lines.append("")
    lines.append("## Klientenfreundliche Sprache")
    if sheet["client_friendly"]:
        lines.append(f"- {sheet['client_friendly']}")
    else:
        lines.append("- Keine Angaben")
    lines.append("")
    lines.append("## Trainer-Checkliste")
    for item in sheet["short_trainer_checklist"]:
        lines.append(f"- {item}")
    return "\n".join(lines).strip() + "\n"


def extract_lesson_payload(lesson: dict[str, Any] | None) -> dict[str, Any]:
    if not isinstance(lesson, dict):
        return {}
    trainer = lesson.get("trainer_explanation", {})
    if not isinstance(trainer, dict):
        trainer = {}
    return {
        "feel_cues": as_lines(lesson.get("feel_cues")),
        "client_friendly": stringify(trainer.get("client_friendly")),
        "trainer_simple": stringify(trainer.get("simple")),
        "trainer_technical": stringify(trainer.get("technical")),
    }


def build_trainer_checklist(coaching_notes: list[Any], common_errors: list[Any], lesson: dict[str, Any]) -> list[str]:
    checklist: list[str] = []
    for note in coaching_notes[:2]:
        checklist.append(f"Coaching Note: {note}")
    for error in common_errors[:2]:
        checklist.append(f"Watch: {error}")
    for cue in as_lines(lesson.get("feel_cues"))[:2]:
        checklist.append(f"Feel Cue: {cue}")
    if not checklist:
        checklist.append("No checklist items available.")
    return checklist


def find_exercise(exercise_id: str):
    for record in build_exercise_index():
        if record.exercise_id == exercise_id:
            return record
    return None


def first_value(record: Any, field_name: str, default: Any = "") -> Any:
    value = getattr(record, field_name, default)
    if value is None:
        return default
    return value


def as_lines(value: Any) -> list[str]:
    if not isinstance(value, list):
        return []
    return [str(item) for item in value if str(item).strip()]


def format_list(values: list[Any]) -> str:
    if not values:
        return "[]"
    return ", ".join(str(value) for value in values)


def stringify(value: Any) -> str:
    if value is None:
        return ""
    return str(value)
