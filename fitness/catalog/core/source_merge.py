from __future__ import annotations

from copy import deepcopy
from typing import Any

from fitness.catalog.core.loader import load_catalog_yaml
from fitness.catalog.core.resolver import normalize_text
from fitness.catalog.core.resolver import build_exercise_index, find_by_id, resolve_query

try:
    from rapidfuzz import fuzz, process
except ImportError:
    fuzz = None
    process = None


def _entries_from_file(filename: str) -> list[dict[str, Any]]:
    # Bewusst UNGECACHT: find_source_entries() laeuft auch im langlebigen
    # fitness-api.service-Prozess, ein Prozess-weiter Cache wuerde
    # Aenderungen an unreviewed_wger.yml/unreviewed_yuhonas.yml (z.B. durch
    # "fitness sync pull") bis zum naechsten Neustart nie sehen — und
    # Test-Mocks auf load_catalog_yaml wuerden nach dem ersten Aufruf
    # ignoriert (echter Regressions-Fund, siehe test_source_merge.py).
    # Batch-Aufrufer mit vielen Records (z.B. audit/source_consistency.py)
    # sollen stattdessen einmal selbst laden und ueber find_source_entries()s
    # wger_entries/yuhonas_entries-Parameter durchreichen.
    doc = load_catalog_yaml(f"exercises/{filename}") or {}
    entries = doc.get("exercises") or []
    return [entry for entry in entries if isinstance(entry, dict)]


def _find_wger_entry(entries: list[dict[str, Any]], wger_id: Any) -> dict[str, Any] | None:
    try:
        wanted = int(wger_id)
    except (TypeError, ValueError):
        return None
    for entry in entries:
        try:
            if int(entry.get("wger_id")) == wanted:
                return entry
        except (TypeError, ValueError):
            continue
    return None


def _find_yuhonas_entry(entries: list[dict[str, Any]], yuhonas_id: Any) -> dict[str, Any] | None:
    wanted = str(yuhonas_id or "").strip()
    if not wanted:
        return None
    wanted_lower = wanted.casefold()
    for entry in entries:
        value = str(entry.get("yuhonas_id") or "").strip()
        if value and value.casefold() == wanted_lower:
            return entry
    return None


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


# Unterhalb von AUTO_MATCH_MIN_SCORE wird nie automatisch verlinkt (Gefahr
# falscher wger/yuhonas-Zuordnungen in Katalog-Seeds). Zwischen
# CANDIDATE_MIN_SCORE und AUTO_MATCH_MIN_SCORE liegende Treffer sind zu
# unsicher fuer Automatik, aber oft trotzdem der richtige Treffer (z.B.
# wger-generischer Name vs. yuhonas-geraete-praefigierter Name, "Walking
# Lunges" vs. "Barbell Walking Lunge" scort nur 68-74) — die werden als
# Kandidat fuer manuelle Bestaetigung durchgereicht (siehe find_source_entries).
AUTO_MATCH_MIN_SCORE = 86
CANDIDATE_MIN_SCORE = 65


def _best_match_scored(query: str, entries: list[dict[str, Any]]) -> tuple[dict[str, Any] | None, float]:
    normalized_query = _norm(query)
    if not normalized_query:
        return None, 0.0

    for entry in entries:
        if normalized_query in {_norm(text) for text in _candidate_texts(entry)}:
            return entry, 100.0

    if not process or not fuzz:
        return None, 0.0

    choices: dict[str, str] = {}
    choice_to_entry: dict[str, int] = {}
    for idx, entry in enumerate(entries):
        for text in _candidate_texts(entry):
            choice_key = f"{idx}:{text}"
            choices[choice_key] = text
            choice_to_entry[choice_key] = idx
    match = process.extractOne(query, choices, scorer=fuzz.token_set_ratio)
    if not match:
        return None, 0.0
    return entries[choice_to_entry[match[2]]], float(match[1])


def _best_match(query: str, entries: list[dict[str, Any]], *, min_score: int = AUTO_MATCH_MIN_SCORE) -> dict[str, Any] | None:
    entry, score = _best_match_scored(query, entries)
    if entry is not None and score >= min_score:
        return entry
    return None


def _candidate_queries(display_name: str, exercise_id: str | None = None, *, record: Any = None) -> list[str]:
    """`record`: optionaler, bereits aufgeloester ExerciseRecord — spart bei
    Batch-Aufrufern (die den Record schon aus einem einmaligen
    build_exercise_index()-Snapshot haben, z.B. audit/source_consistency.py)
    den teuren Rebuild des kompletten Index (~1700 Records, mehrere Sekunden)
    UND den zusaetzlichen resolve_query()-Fuzzy-Match pro Aufruf. Ohne
    Uebergabe unveraendertes Verhalten (Record wird wie bisher selbst
    aufgeloest)."""
    queries: list[str] = []
    seen: set[str] = set()

    def add(value: Any) -> None:
        text = str(value or "").strip()
        if not text:
            return
        key = text.casefold()
        if key in seen:
            return
        seen.add(key)
        queries.append(text)

    add(display_name)
    add(exercise_id)

    if record is None:
        if exercise_id:
            record = find_by_id(str(exercise_id), build_exercise_index())
        if record is None and display_name:
            resolution = resolve_query(display_name)
            if resolution.matched and resolution.canonical_id:
                record = find_by_id(resolution.canonical_id, build_exercise_index())

    if record is not None:
        english = str(record.english or "").strip()
        display = str(record.display_name or "").strip()
        equipment = [str(item).strip() for item in (record.equipment or []) if str(item).strip()]

        for value in (
            record.display_name,
            record.german,
            record.exercise_id,
            record.wger_id and f"wger_{record.wger_id}",
            record.yuhonas_id,
        ):
            add(value)
        # Erst spezifische Varianten wie "Barbell Deadlift" erzeugen, damit
        # generische Namen ("Deadlift") nicht an irgendeine yuhonas-Variante
        # mit demselben Kernwort binden (Axle/Trap/Sumo/...).
        if english:
            for gear in equipment:
                add(f"{gear} {english}")
        if display and display != english:
            for gear in equipment:
                add(f"{gear} {display}")
        add(english)
        for item in record.aliases or []:
            add(item)
        for item in record.search_aliases or []:
            add(item)

    return queries


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


def find_source_entries(
    display_name: str,
    exercise_id: str | None = None,
    *,
    record: Any = None,
    wger_entries: list[dict[str, Any]] | None = None,
    yuhonas_entries: list[dict[str, Any]] | None = None,
) -> dict[str, Any]:
    """Sucht die rohen wger-/yuhonas-Einzeleintraege (aus `unreviewed_wger.yml`
    / `unreviewed_yuhonas.yml`) fuer eine Uebung, per ID-Hinweis (falls schon
    ein Katalog-Record existiert) oder Namens-Fuzzy-Match. Liefert beide roh
    und getrennt zurueck (`{"wger": entry|None, "yuhonas": entry|None}`) —
    keine Feld-Verschmelzung, das macht ausschliesslich `build_external_seed()`
    fuer neue Katalog-Seeds. Fuer Anzeige/Attribution ("wger sagt X, yuhonas
    sagt Y") ist dies die richtige Quelle, nicht `build_external_seed()`.

    Zusaetzlich liefert die Rueckgabe `wger_candidate`/`yuhonas_candidate`
    (entry|None) + `wger_candidate_score`/`yuhonas_candidate_score`
    (float|None): Treffer zwischen CANDIDATE_MIN_SCORE und
    AUTO_MATCH_MIN_SCORE, die zu unsicher fuer automatisches Verlinken sind,
    aber fuer eine manuelle Bestaetigung (CLI/Coach-Review) taugen. Nur
    gesetzt, wenn der jeweilige `wger`/`yuhonas`-Key None ist.

    `record`: optionaler, bereits aufgeloester ExerciseRecord — siehe
    `_candidate_queries()`, spart Batch-Aufrufern den wiederholten teuren
    build_exercise_index()-Rebuild.

    `wger_entries`/`yuhonas_entries`: optional bereits geladene Rohlisten —
    spart Batch-Aufrufern (z.B. audit/source_consistency.py ueber ~40
    Records) das wiederholte Neu-Laden derselben zwei YAML-Dateien. Ohne
    Uebergabe unveraendertes Verhalten (frischer Load pro Aufruf, siehe
    `_entries_from_file()`)."""
    wger_entry = None
    yuhonas_entry = None
    wger_candidate: dict[str, Any] | None = None
    yuhonas_candidate: dict[str, Any] | None = None
    wger_candidate_score = 0.0
    yuhonas_candidate_score = 0.0
    queries = _candidate_queries(display_name, exercise_id, record=record)

    if wger_entries is None:
        wger_entries = _entries_from_file("unreviewed_wger.yml")
    if yuhonas_entries is None:
        yuhonas_entries = _entries_from_file("unreviewed_yuhonas.yml")

    if record is None and exercise_id:
        record = find_by_id(str(exercise_id), build_exercise_index())
    wger_hints: list[Any] = []
    yuhonas_hints: list[Any] = []

    if record is not None:
        if record.wger_id not in (None, ""):
            wger_hints.append(record.wger_id)
        if record.external_ids and isinstance(record.external_ids, dict):
            wger_hints.extend((record.external_ids.get("wger") or []))
            yuhonas_hints.extend((record.external_ids.get("yuhonas") or []))
        if record.yuhonas_id not in (None, ""):
            yuhonas_hints.append(record.yuhonas_id)

    for hint in wger_hints:
        wger_entry = wger_entry or _find_wger_entry(wger_entries, hint)
    for hint in yuhonas_hints:
        yuhonas_entry = yuhonas_entry or _find_yuhonas_entry(yuhonas_entries, hint)

    for query in queries:
        if wger_entry is None:
            cand, score = _best_match_scored(query, wger_entries)
            if cand is not None and score >= AUTO_MATCH_MIN_SCORE:
                wger_entry = cand
            elif cand is not None and score >= CANDIDATE_MIN_SCORE and score > wger_candidate_score:
                wger_candidate, wger_candidate_score = cand, score
        if yuhonas_entry is None:
            cand, score = _best_match_scored(query, yuhonas_entries)
            if cand is not None and score >= AUTO_MATCH_MIN_SCORE:
                yuhonas_entry = cand
            elif cand is not None and score >= CANDIDATE_MIN_SCORE and score > yuhonas_candidate_score:
                yuhonas_candidate, yuhonas_candidate_score = cand, score

    return {
        "wger": wger_entry,
        "yuhonas": yuhonas_entry,
        "wger_candidate": None if wger_entry is not None else wger_candidate,
        "yuhonas_candidate": None if yuhonas_entry is not None else yuhonas_candidate,
        "wger_candidate_score": None if wger_entry is not None or wger_candidate is None else wger_candidate_score,
        "yuhonas_candidate_score": None if yuhonas_entry is not None or yuhonas_candidate is None else yuhonas_candidate_score,
    }


def build_external_seed(display_name: str, exercise_id: str | None = None) -> dict[str, Any] | None:
    found = find_source_entries(display_name, exercise_id)
    wger_entry = found["wger"]
    yuhonas_entry = found["yuhonas"]

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
        "instructions": deepcopy((yuhonas_entry or {}).get("instructions")) or deepcopy((yuhonas_entry or {}).get("coaching_notes")) or [],
        "images": deepcopy((yuhonas_entry or {}).get("images")) or [],
        "coaching_notes": _merge_list_fields((wger_entry or {}).get("coaching_notes"), (yuhonas_entry or {}).get("coaching_notes")),
        "original_description": (
            deepcopy((wger_entry or {}).get("original_description"))
            or deepcopy((yuhonas_entry or {}).get("original_description"))
            or _merge_list_fields((wger_entry or {}).get("coaching_notes"))
            or _merge_list_fields((yuhonas_entry or {}).get("instructions"))
            or _merge_list_fields((yuhonas_entry or {}).get("coaching_notes"))
        ),
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
