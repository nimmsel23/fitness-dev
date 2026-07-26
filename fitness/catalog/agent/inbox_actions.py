"""Kernlogik für Inbox-Review-Aktionen — geteilt zwischen TUI (tui.py) und
CLI (`fitness-catalog inbox ...`). Reine Funktionen ohne rich.Prompt/Confirm-
Abhaengigkeit, damit beide Oberflaechen dieselbe Logik nutzen (kein Copy-Paste
zwischen TUI und CLI, kein Drift zwischen beiden Wegen).
"""
from __future__ import annotations

from pathlib import Path
import re
from typing import Any

import yaml

from fitness.catalog.core.paths import DATA_DIR
from fitness.catalog.core.yaml_utils import load_yaml
from fitness.catalog.agent.gemini import load_gemini_key, call_gemini, review_with_haiku


def inbox_dir() -> Path:
    """kb/inbox/ - alleinige Ablage fuer unreviewte Drafts (inbox_*.yml)."""
    return DATA_DIR / "inbox"


def exercises_dir() -> Path:
    """kb/exercises/ - Ziel fuer approvte/canonical Exercise-Dateien."""
    return DATA_DIR / "exercises"


def list_inbox_files() -> list[Path]:
    # Fallback auf kb/exercises/ falls dort noch (alte) Drafts liegen, siehe
    # tui.py::_find_inbox_files() fuer denselben Grund.
    return sorted(list(inbox_dir().glob("inbox_*.yml")) + list(exercises_dir().glob("inbox_*.yml")))


def load_inbox_entry(file_id: str) -> tuple[Path, dict[str, Any]]:
    """Laedt einen Inbox-Draft anhand seiner file_id (z.B. "inbox_wger_851",
    mit oder ohne .yml-Endung). Wirft FileNotFoundError/ValueError bei Problemen.
    """
    stem = file_id[:-4] if file_id.endswith(".yml") else file_id
    f = inbox_dir() / f"{stem}.yml"
    if not f.exists():
        f = exercises_dir() / f"{stem}.yml"
    if not f.exists():
        raise FileNotFoundError(f"Inbox-Datei nicht gefunden: {stem}.yml")
    doc = load_yaml(f)
    exercises = doc.get("exercises") or [{}]
    ex = exercises[0]
    if not ex:
        raise ValueError(f"{f.name}: kein exercises[0]-Eintrag")
    return f, ex


def display_name_of(ex: dict[str, Any], fallback: str) -> str:
    return ex.get("display_name") or ex.get("german") or ex.get("name") or fallback


def _append_unique(target: list[Any], values: list[Any]) -> None:
    seen = {str(item) for item in target if item is not None}
    for value in values:
        if value is None or value == "":
            continue
        key = str(value)
        if key in seen:
            continue
        target.append(value)
        seen.add(key)


def _as_list(value: Any) -> list[Any]:
    if isinstance(value, list):
        return value
    if value is None or value == "":
        return []
    return [value]


def _infer_source_refs(f: Path, ex: dict[str, Any]) -> tuple[list[int], list[str], list[str]]:
    """Preserve external source identity when a draft becomes an expert entry.

    The coach-facing exercise keeps its clean local ID/name. Raw source IDs stay
    in hidden search/merge fields so Firestore/search can suppress duplicate
    wger/yuhonas imports without exposing their names in the UI.
    """
    wger_ids: list[int] = []
    yuhonas_ids: list[str] = []
    search_aliases: list[str] = []

    candidates = [f.stem, ex.get("exercise_id"), ex.get("id")]
    for value in candidates:
        text = str(value or "")
        match = re.fullmatch(r"(?:inbox_)?wger_(\d+)", text)
        if match:
            wger_ids.append(int(match.group(1)))
            search_aliases.append(f"wger_{match.group(1)}")
        if text.startswith("yuhonas_"):
            search_aliases.append(text)
        if text.startswith("inbox_yuhonas_"):
            search_aliases.append(text.removeprefix("inbox_"))

    existing_wger_id = ex.get("wger_id")
    if existing_wger_id:
        try:
            wger_ids.append(int(existing_wger_id))
            search_aliases.append(f"wger_{int(existing_wger_id)}")
        except (TypeError, ValueError):
            pass

    for value in _as_list(ex.get("yuhonas_id")):
        yuhonas_ids.append(str(value))
        search_aliases.append(str(value))

    for key in ("display_name", "german", "english", "name"):
        value = ex.get(key)
        if isinstance(value, str) and value:
            search_aliases.append(value)

    return wger_ids, yuhonas_ids, search_aliases


def _merge_source_refs(f: Path, ex: dict[str, Any]) -> None:
    wger_ids, yuhonas_ids, inferred_aliases = _infer_source_refs(f, ex)

    if wger_ids and not ex.get("wger_id"):
        ex["wger_id"] = wger_ids[0]

    external_ids = ex.get("external_ids")
    if not isinstance(external_ids, dict):
        external_ids = {}
    if wger_ids:
        wger_values = _as_list(external_ids.get("wger"))
        _append_unique(wger_values, wger_ids)
        external_ids["wger"] = wger_values
    if yuhonas_ids:
        yuhonas_values = _as_list(external_ids.get("yuhonas"))
        _append_unique(yuhonas_values, yuhonas_ids)
        external_ids["yuhonas"] = yuhonas_values
    if external_ids:
        ex["external_ids"] = external_ids

    search_aliases = _as_list(ex.get("search_aliases"))
    _append_unique(search_aliases, inferred_aliases)
    if search_aliases:
        ex["search_aliases"] = search_aliases


def approve_inbox_entry(f: Path, ex: dict[str, Any]) -> str:
    """Approved einen Inbox-Draft -> `{ex_id}.yml` (Expert-Tier). Gibt die
    finale exercise_id zurueck. Wirft ValueError wenn keine exercise_id da ist.
    """
    ex_id = ex.get("exercise_id") or ex.get("id")
    if not ex_id:
        raise ValueError("keine exercise_id im Draft")

    if ex_id.startswith("inbox_"):
        ex_id = ex_id.replace("inbox_", "")
        ex["exercise_id"] = ex_id
        ex["id"] = ex_id

    ex["source"] = "expert"
    _merge_source_refs(f, ex)

    detail_path = exercises_dir() / f"{ex_id}.yml"
    if detail_path.exists():
        detail_path.with_suffix(".yml.bak").write_text(detail_path.read_text())

    display_name = display_name_of(ex, ex_id)
    detail_doc = {
        "exercise_id": ex_id,
        "description": f"Expert details for {display_name}",
        "exercises": [ex],
    }
    detail_path.write_text(
        yaml.dump(detail_doc, allow_unicode=True, sort_keys=False, default_flow_style=False)
    )
    f.unlink()
    return ex_id


def delete_inbox_entry(f: Path) -> None:
    f.unlink()


def reenrich_inbox_entry(
    f: Path,
    ex: dict[str, Any],
    name: str,
    feedback: str | None = None,
    use_haiku_review: bool = True,
) -> dict[str, Any]:
    """Jagt einen bestehenden Inbox-Draft frisch durch Gemini (optional mit
    Coach-Feedback), laesst Haiku als zweite Meinung gegenpruefen (best-effort,
    siehe review_with_haiku()), und schreibt den Draft ueberschreibend
    zurueck (Backup vorher). Wirft RuntimeError bei Konfigurations-/API-Fehlern.

    Rueckgabe: {"enriched": dict, "haiku_applied": bool}
    """
    api_key = load_gemini_key()

    ex_id = ex.get("exercise_id") or ex.get("id") or f.stem.replace("inbox_", "")
    safe_name = str(ex_id).lower().replace(" ", "_")

    enriched = call_gemini(name, safe_name, api_key, existing_data=ex, feedback=feedback)
    if not enriched:
        raise RuntimeError("Gemini-Anreicherung fehlgeschlagen")

    haiku_applied = False
    if use_haiku_review:
        reviewed = review_with_haiku(enriched, feedback=feedback)
        if reviewed:
            enriched = reviewed
            haiku_applied = True

    f.with_suffix(".yml.bak").write_text(f.read_text())

    if "stabilizers" not in enriched: enriched["stabilizers"] = []
    if "variations" not in enriched: enriched["variations"] = []
    enriched["source"] = "unreviewed"

    description = (
        f"Reenriched (Coach-Feedback) fuer: {name}" if feedback
        else f"Neu angereichert (manueller Re-Enrich) fuer: {name}"
    )
    wrapper = {"name": f.stem, "description": description, "exercises": [enriched]}
    f.write_text(yaml.dump(wrapper, allow_unicode=True, sort_keys=False))

    return {"enriched": enriched, "haiku_applied": haiku_applied}
