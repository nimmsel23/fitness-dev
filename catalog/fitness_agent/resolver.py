from __future__ import annotations

from dataclasses import dataclass
from difflib import SequenceMatcher
from pathlib import Path
from typing import Any

from .loader import load_catalog_directory_yaml, load_catalog_yaml


@dataclass
class ExerciseRecord:
    exercise_id: str
    display_name: str
    source_file: str
    german: str = ""
    movement_pattern: str = ""
    equipment: list[str] | None = None
    aliases: list[str] | None = None
    primary_muscles: list[str] | None = None
    secondary_muscles: list[str] | None = None
    stabilizers: list[str] | None = None
    variations: list[str] | None = None
    coaching_notes: list[str] | None = None
    common_errors: list[str] | None = None
    tags: list[str] | None = None
    wger_muscle_ids: dict | None = None


@dataclass
class ResolveResult:
    query: str
    matched: bool
    canonical_id: str | None
    display_name: str | None
    source: str
    confidence: str
    suggestions: list[dict[str, str]]


def build_exercise_index() -> list[ExerciseRecord]:
    records: list[ExerciseRecord] = []
    for path, document in load_catalog_directory_yaml("exercises"):
        records.extend(parse_exercise_document(path, document))
    return records


def resolve_query(query: str) -> ResolveResult:
    records = build_exercise_index()
    normalized_query = normalize_text(query)
    alias_map = load_alias_map()

    exact = find_exact_id(query, records)
    if exact:
        return matched_result(query, exact, "canonical_id", "high", [])

    alias_match = alias_map.get(normalized_query)
    if alias_match:
        record = find_by_id(alias_match, records)
        if record:
            return matched_result(query, record, "alias", "high", [])

    name_match = find_name_match(normalized_query, records)
    if name_match:
        return matched_result(query, name_match, "name", "high", [])

    fuzzy_match, suggestions = find_fuzzy_match(normalized_query, records)
    if fuzzy_match:
        confidence = "medium" if fuzzy_match.score >= 0.75 else "low"
        return matched_result(query, fuzzy_match.record, "fuzzy", confidence, suggestions)

    return ResolveResult(
        query=query,
        matched=False,
        canonical_id=None,
        display_name=None,
        source="none",
        confidence="low",
        suggestions=suggestions_for_unknown(normalized_query, records),
    )


def load_alias_map() -> dict[str, str]:
    try:
        aliases = load_catalog_yaml("maps/aliases.yml")
    except FileNotFoundError:
        return {}
    if not isinstance(aliases, dict):
        return {}
    raw_aliases = aliases.get("aliases", aliases)
    if not isinstance(raw_aliases, dict):
        return {}
    result: dict[str, str] = {}
    for alias, canonical_id in raw_aliases.items():
        if isinstance(alias, str) and isinstance(canonical_id, str):
            result[normalize_text(alias)] = canonical_id
    return result


def parse_exercise_document(path: Path, document: Any) -> list[ExerciseRecord]:
    if not isinstance(document, dict):
        return []
    exercises = document.get("exercises", [])
    if not isinstance(exercises, list):
        return []
    records: list[ExerciseRecord] = []
    for entry in exercises:
        if not isinstance(entry, dict):
            continue
        exercise_id = first_text(entry, "exercise_id", "id", "canonical_id")
        display_name = first_text(entry, "display_name", "name", "title") or exercise_id
        if not exercise_id:
            continue
        german = first_text(entry, "german", "de", "german_name")
        movement_pattern = first_text(entry, "movement_pattern")
        equipment = list_of_text(entry.get("equipment"))
        aliases = list_of_text(entry.get("aliases"))
        primary_muscles = list_of_text(entry.get("primary_muscles"))
        secondary_muscles = list_of_text(entry.get("secondary_muscles"))
        stabilizers = list_of_text(entry.get("stabilizers"))
        variations = list_of_text(entry.get("variations"))
        coaching_notes = list_of_text(entry.get("coaching_notes"))
        common_errors = list_of_text(entry.get("common_errors"))
        tags = list_of_text(entry.get("tags"))
        wger_muscle_ids = entry.get("wger_muscle_ids") or None
        records.append(
            ExerciseRecord(
                exercise_id=exercise_id,
                display_name=display_name,
                source_file=path.name,
                german=german,
                movement_pattern=movement_pattern,
                equipment=equipment,
                aliases=aliases,
                primary_muscles=primary_muscles,
                secondary_muscles=secondary_muscles,
                stabilizers=stabilizers,
                variations=variations,
                coaching_notes=coaching_notes,
                common_errors=common_errors,
                tags=tags,
                wger_muscle_ids=wger_muscle_ids,
            )
        )
    return records


def find_exact_id(query: str, records: list[ExerciseRecord]) -> ExerciseRecord | None:
    query_text = query.strip()
    for record in records:
        if record.exercise_id == query_text:
            return record
    return None


def find_by_id(exercise_id: str, records: list[ExerciseRecord]) -> ExerciseRecord | None:
    for record in records:
        if record.exercise_id == exercise_id:
            return record
    return None


def find_name_match(normalized_query: str, records: list[ExerciseRecord]) -> ExerciseRecord | None:
    for record in records:
        for candidate in candidate_texts(record):
            if normalized_query == normalize_text(candidate):
                return record
    return None


@dataclass
class FuzzyMatch:
    record: ExerciseRecord
    score: float


def find_fuzzy_match(normalized_query: str, records: list[ExerciseRecord]) -> tuple[FuzzyMatch | None, list[dict[str, str]]]:
    scored: list[FuzzyMatch] = []
    for record in records:
        best_score = 0.0
        for candidate in candidate_texts(record):
            score = SequenceMatcher(None, normalized_query, normalize_text(candidate)).ratio()
            if score > best_score:
                best_score = score
        if best_score > 0:
            scored.append(FuzzyMatch(record=record, score=best_score))
    scored.sort(key=lambda item: item.score, reverse=True)
    suggestions = suggestions_from_scored(scored[:3])
    if not scored:
        return None, suggestions
    best = scored[0]
    if best.score < 0.6:
        return None, suggestions
    return best, suggestions


def suggestions_for_unknown(normalized_query: str, records: list[ExerciseRecord]) -> list[dict[str, str]]:
    _, suggestions = find_fuzzy_match(normalized_query, records)
    return suggestions


def suggestions_from_scored(scored: list[FuzzyMatch]) -> list[dict[str, str]]:
    return [
        {
            "canonical_id": item.record.exercise_id,
            "display_name": item.record.display_name,
        }
        for item in scored
    ]


def matched_result(query: str, record: ExerciseRecord, source: str, confidence: str, suggestions: list[dict[str, str]]) -> ResolveResult:
    return ResolveResult(
        query=query,
        matched=True,
        canonical_id=record.exercise_id,
        display_name=record.display_name,
        source=source,
        confidence=confidence,
        suggestions=suggestions,
    )


def candidate_texts(record: ExerciseRecord) -> list[str]:
    texts = [record.exercise_id, record.display_name]
    if record.german:
        texts.append(record.german)
    if record.aliases:
        texts.extend(record.aliases)
    return texts


def first_text(entry: dict[str, Any], *keys: str) -> str:
    for key in keys:
        value = entry.get(key)
        if isinstance(value, str) and value.strip():
            return value.strip()
    return ""


def list_of_text(value: Any) -> list[str] | None:
    if not isinstance(value, list):
        return None
    items = [item.strip() for item in value if isinstance(item, str) and item.strip()]
    return items or None


def normalize_text(text: str) -> str:
    import re
    import unicodedata

    normalized = unicodedata.normalize("NFKD", text)
    stripped = "".join(char for char in normalized if not unicodedata.combining(char))
    collapsed = re.sub(r"[^a-zA-Z0-9]+", " ", stripped.casefold())
    return " ".join(collapsed.split())
