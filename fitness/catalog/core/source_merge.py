from __future__ import annotations

from copy import deepcopy
from typing import Any

from fitness.catalog.core.loader import load_catalog_yaml
from fitness.catalog.core.resolver import normalize_text

try:
    from rapidfuzz import fuzz, process
except ImportError:
    fuzz = None
    process = None


def _entries_from_file(filename: str) -> list[dict[str, Any]]:
    doc = load_catalog_yaml(f"exercises/{filename}") or {}
    entries = doc.get("exercises") or []
    return [entry for entry in entries if isinstance(entry, dict)]


def _candidate_texts(entry: dict[str, Any]) -> list[str]:
    values: list[str] = []
    for key in ("display_name", "german", "english", "name", "exercise_id", "id"):
        value = entry.get(key)
        if isinstance(value, str) and value.strip():
            values.append(value.strip())
    for key in ("aliases", "search_aliases"):
        value = entry.get(key)
        if isinstance(value, list):
            values.extend(str(item).strip() for item in value if str(item).strip())
    return values


def _norm(value: str) -> str:
    return normalize_text(value, smart=True)


def _best_match(query: str, entries: list[dict[str, Any]], *, min_score: int = 86) -> dict[str, Any] | None:
    normalized_query = _norm(query)
    if not normalized_query:
        return None

    for entry in entries:
        if normalized_query in {_norm(text) for text in _candidate_texts(entry)}:
            return entry

    if not process or not fuzz:
        return None

    choices: dict[int, str] = {}
    for idx, entry in enumerate(entries):
        texts = _candidate_texts(entry)
        if texts:
            choices[idx] = texts[0]
    match = process.extractOne(query, choices, scorer=fuzz.token_set_ratio)
    if not match or match[1] < min_score:
        return None
    return entries[match[2]]


def _merged_external_id_map(wger: dict[str, Any] | None, yuhonas: dict[str, Any] | None) -> dict[str, list[Any]]:
    out: dict[str, list[Any]] = {}
    if wger:
        wger_ids: list[Any] = []
        if wger.get("wger_id") not in (None, ""):
            wger_ids.append(wger.get("wger_id"))
        existing = (wger.get("external_ids") or {}).get("wger") if isinstance(wger.get("external_ids"), dict) else None
        if isinstance(existing, list):
            for item in existing:
                if item not in wger_ids:
                    wger_ids.append(item)
        if wger_ids:
            out["wger"] = wger_ids
    if yuhonas:
        yuhonas_ids: list[Any] = []
        if yuhonas.get("yuhonas_id") not in (None, ""):
            yuhonas_ids.append(yuhonas.get("yuhonas_id"))
        existing = (yuhonas.get("external_ids") or {}).get("yuhonas") if isinstance(yuhonas.get("external_ids"), dict) else None
        if isinstance(existing, list):
            for item in existing:
                if item not in yuhonas_ids:
                    yuhonas_ids.append(item)
        if yuhonas_ids:
            out["yuhonas"] = yuhonas_ids
    return out


def _merge_list_fields(*values: Any) -> list[Any]:
    out: list[Any] = []
    for value in values:
        items = value if isinstance(value, list) else ([] if value in (None, "") else [value])
        for item in items:
            if item not in out:
                out.append(item)
    return out


def build_external_seed(display_name: str, exercise_id: str | None = None) -> dict[str, Any] | None:
    wger_entry = None
    yuhonas_entry = None
    queries = [q for q in [display_name, exercise_id] if isinstance(q, str) and q.strip()]

    wger_entries = _entries_from_file("unreviewed_wger.yml")
    yuhonas_entries = _entries_from_file("unreviewed_yuhonas.yml")

    for query in queries:
        wger_entry = wger_entry or _best_match(query, wger_entries)
        yuhonas_entry = yuhonas_entry or _best_match(query, yuhonas_entries)

    if not wger_entry and not yuhonas_entry:
        return None

    base = deepcopy(wger_entry or yuhonas_entry or {})
    canonical_id = (
        exercise_id
        or base.get("exercise_id")
        or (yuhonas_entry or {}).get("exercise_id")
        or (wger_entry or {}).get("exercise_id")
    )
    merged = {
        "exercise_id": canonical_id,
        "id": canonical_id,
        "display_name": (wger_entry or {}).get("display_name") or (yuhonas_entry or {}).get("display_name") or display_name,
        "german": (wger_entry or {}).get("german") or (yuhonas_entry or {}).get("german") or display_name,
        "english": (wger_entry or {}).get("english") or (yuhonas_entry or {}).get("english") or (yuhonas_entry or {}).get("display_name") or display_name,
        "category": (wger_entry or {}).get("category") or (yuhonas_entry or {}).get("category"),
        "equipment": _merge_list_fields((wger_entry or {}).get("equipment"), (yuhonas_entry or {}).get("equipment")),
        "primary_muscles": _merge_list_fields((wger_entry or {}).get("primary_muscles"), (yuhonas_entry or {}).get("primary_muscles")),
        "secondary_muscles": _merge_list_fields((wger_entry or {}).get("secondary_muscles"), (yuhonas_entry or {}).get("secondary_muscles")),
        "stabilizers": _merge_list_fields((wger_entry or {}).get("stabilizers"), (yuhonas_entry or {}).get("stabilizers")),
        "instructions": deepcopy((yuhonas_entry or {}).get("instructions")) or [],
        "images": deepcopy((yuhonas_entry or {}).get("images")) or [],
        "coaching_notes": _merge_list_fields((wger_entry or {}).get("coaching_notes"), (yuhonas_entry or {}).get("coaching_notes")),
        "original_description": deepcopy((wger_entry or {}).get("original_description")) or deepcopy((yuhonas_entry or {}).get("original_description")),
        "wger_id": (wger_entry or {}).get("wger_id"),
        "wger_muscle_ids": deepcopy((wger_entry or {}).get("wger_muscle_ids")),
        "yuhonas_id": (yuhonas_entry or {}).get("yuhonas_id"),
        "external_ids": _merged_external_id_map(wger_entry, yuhonas_entry),
        "tags": _merge_list_fields((wger_entry or {}).get("tags"), (yuhonas_entry or {}).get("tags")),
        "search_aliases": _merge_list_fields((wger_entry or {}).get("search_aliases"), (yuhonas_entry or {}).get("search_aliases")),
        "aliases": _merge_list_fields((wger_entry or {}).get("aliases"), (yuhonas_entry or {}).get("aliases")),
    }
    if wger_entry and yuhonas_entry:
        merged["tags"] = _merge_list_fields(merged.get("tags"), ["merged_external", "wger", "yuhonas"])
    return {key: value for key, value in merged.items() if value not in (None, "", [], {})}
