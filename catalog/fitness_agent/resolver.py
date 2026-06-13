from __future__ import annotations

import re
import unicodedata
from dataclasses import dataclass
from pathlib import Path
from typing import Any

try:
    from rapidfuzz import fuzz, process
except ImportError:
    from difflib import SequenceMatcher
    fuzz = None
    process = None

from .loader import load_catalog_directory_yaml, load_catalog_yaml

# Smart Gym Vocabulary for Normalization
GYM_VOCAB = {
    "kh": "kurzhantel dumbbell",
    "lh": "langhantel barbell",
    "sz": "sz-hantel sz-bar",
    "db": "dumbbell kurzhantel",
    "bb": "barbell langhantel",
    "press": "drücken press",
    "bench": "bankdrücken bench",
    "incline": "schrägbank incline",
    "decline": "negativbank decline",
    "lat": "latzug lat-pulldown",
    "pullup": "klimmzug pull-up",
    "chinup": "klimmzug chin-up",
    "row": "rudern row",
    "curl": "curls curl",
    "squat": "kniebeuge squat",
    "dl": "deadlift kreuzheben",
    "bp": "benchpress bankdrücken",
    "ohp": "overheadpress überkopfdrücken",
}


from dataclasses import dataclass, field, asdict

@dataclass
class ExerciseRecord:
    exercise_id: str
    display_name: str
    source_file: str
    source: str = "expert"
    categories: list[str] = field(default_factory=list) # The network: chest, push, quadriceps...
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
    gif_url: str | None = None
    image_url: str | None = None
    wger_id: int | None = None
    wger_muscle_ids: dict | None = None
    anatomy: dict[str, Any] | None = None


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
    """Erstellt den konsolidierten Netzwerk-Index aller Übungen."""
    index: dict[str, ExerciseRecord] = {}
    
    # 1. Alle Dateien laden und Netzwerk knüpfen
    for path, document in load_catalog_directory_yaml("exercises"):
        if not isinstance(document, dict): continue
        
        ext = path.suffix # .yml (coaching) oder .yaml (anatomy)
        filename = path.name
        is_anatomy = ext == ".yaml"
        
        # Bestimme den Tier (Expert/Bulk)
        source_tier = "bulk" if filename.startswith("unreviewed_") else ("inbox" if filename.startswith("inbox_") else "expert")
        
        # Bridge Node (z.B. chest, legs)
        file_node = document.get("name") or path.stem
        exercises = document.get("exercises", [])
        if not isinstance(exercises, list): continue

        for entry in exercises:
            # A. ID-Mapping extrahieren
            ex_id = None
            entry_name = None
            
            if isinstance(entry, (str, int)):
                ex_id = str(entry).zfill(3) if isinstance(entry, int) else str(entry)
            elif isinstance(entry, dict):
                ex_id = first_text(entry, "exercise_id", "id", "canonical_id")
                entry_name = first_text(entry, "display_name", "name")
                # Fallback für nummerierte Detail-Files
                if not ex_id and path.stem.isdigit():
                    ex_id = path.stem.zfill(3)
            
            if not ex_id: continue
            if ex_id.isdigit(): ex_id = ex_id.zfill(3)

            # Record im Netzwerk holen oder anlegen
            if ex_id not in index:
                index[ex_id] = ExerciseRecord(
                    exercise_id=ex_id, 
                    display_name=entry_name or ex_id, 
                    source_file=filename, 
                    source=source_tier
                )
            
            rec = index[ex_id]

            # Verknüpfung im Netzwerk (nur für Registry-Files, nicht für Detail-Files)
            if file_node and not path.stem.isdigit() and not is_anatomy and not filename.startswith("unreviewed_"):
                if file_node not in rec.categories:
                    rec.categories.append(file_node)

            # Daten-Merge
            if is_anatomy:
                # Anatomie (.yaml) merge
                if not rec.anatomy or source_tier == "expert":
                    rec.anatomy = entry
                    if not rec.primary_muscles: rec.primary_muscles = list_of_text(entry.get("primary_muscles"))
            else:
                # Coaching / Registry (.yml) merge
                if source_tier == "expert" or (source_tier == "inbox" and rec.source == "bulk") or rec.display_name == rec.exercise_id:
                    if source_tier == "expert" or rec.source == "bulk":
                        rec.source = source_tier
                        rec.source_file = filename
                    
                    # Felder aktualisieren
                    if entry_name: rec.display_name = entry_name
                    
                    for field_name in ["german", "movement_pattern", "wger_id", "gif_url", "image_url"]:
                        val = entry.get(field_name) or entry.get(field_name.replace("_", " "))
                        if val: setattr(rec, field_name, val)

                    
                    # Listen mergen
                    for list_field in ["equipment", "aliases", "primary_muscles", "secondary_muscles", "stabilizers", "variations", "coaching_notes", "common_errors", "tags"]:
                        val = list_of_text(entry.get(list_field))
                        if val:
                            existing = getattr(rec, list_field) or []
                            setattr(rec, list_field, sorted(list(set(existing + val))))
                    
                    if entry.get("wger_muscle_ids"):
                        rec.wger_muscle_ids = entry["wger_muscle_ids"]

    return list(index.values())



def resolve_query(query: str) -> ResolveResult:
    records = build_exercise_index()
    normalized_query = normalize_text(query, smart=True)
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
        # Rapidfuzz scores are 0-100
        confidence = "high" if fuzzy_match.score >= 90 else ("medium" if fuzzy_match.score >= 75 else "low")
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
            result[normalize_text(alias, smart=True)] = canonical_id
    return result


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
            if normalized_query == normalize_text(candidate, smart=True):
                return record
    return None


@dataclass
class FuzzyMatch:
    record: ExerciseRecord
    score: float


def find_fuzzy_match(normalized_query: str, records: list[ExerciseRecord]) -> tuple[FuzzyMatch | None, list[dict[str, str]]]:
    if not records:
        return None, []

    # Prepare candidates: map normalized text to records
    candidate_map: dict[str, ExerciseRecord] = {}
    for r in records:
        for text in candidate_texts(r):
            norm = normalize_text(text, smart=True)
            if norm not in candidate_map:
                candidate_map[norm] = r

    choices = list(candidate_map.keys())
    
    if process and fuzz:
        # Use Rapidfuzz extract for speed and better scoring
        # token_set_ratio is good for "kh bankdrücken" vs "bankdrücken kurzhantel"
        results = process.extract(normalized_query, choices, scorer=fuzz.token_set_ratio, limit=5)
        
        if not results:
            return None, []

        scored = [FuzzyMatch(record=candidate_map[res[0]], score=res[1]) for res in results]
        suggestions = suggestions_from_scored(scored[:3])
        
        best = scored[0]
        # Threshold for matching
        if best.score < 80:
            return None, suggestions
            
        return best, suggestions
    else:
        # Fallback to difflib
        from difflib import SequenceMatcher
        scored_fallback: list[FuzzyMatch] = []
        for norm, record in candidate_map.items():
            score = SequenceMatcher(None, normalized_query, norm).ratio() * 100
            scored_fallback.append(FuzzyMatch(record=record, score=score))
        
        scored_fallback.sort(key=lambda x: x.score, reverse=True)
        suggestions = suggestions_from_scored(scored_fallback[:3])
        
        if not scored_fallback or scored_fallback[0].score < 60:
            return None, suggestions
            
        return scored_fallback[0], suggestions


def suggestions_for_unknown(normalized_query: str, records: list[ExerciseRecord]) -> list[dict[str, str]]:
    _, suggestions = find_fuzzy_match(normalized_query, records)
    return suggestions


def suggestions_from_scored(scored: list[FuzzyMatch]) -> list[dict[str, str]]:
    seen = set()
    unique_suggestions = []
    for item in scored:
        if item.record.exercise_id not in seen:
            seen.add(item.record.exercise_id)
            unique_suggestions.append({
                "canonical_id": item.record.exercise_id,
                "display_name": item.record.display_name,
            })
    return unique_suggestions



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


def normalize_text(text: str, smart: bool = False) -> str:
    if not text:
        return ""
        
    normalized = unicodedata.normalize("NFKD", text)
    stripped = "".join(char for char in normalized if not unicodedata.combining(char))
    # Keep alphanumeric and spaces
    collapsed = re.sub(r"[^a-zA-Z0-9]+", " ", stripped.casefold())
    words = collapsed.split()
    
    if smart:
        # Apply Gym Vocabulary substitutions
        words = [GYM_VOCAB.get(w, w) for w in words]
        
    return " ".join(words)
