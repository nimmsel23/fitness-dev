"""Kernlogik für Inbox-Review-Aktionen — geteilt zwischen TUI (tui.py) und
CLI (`fitness-catalog inbox ...`). Reine Funktionen ohne rich.Prompt/Confirm-
Abhaengigkeit, damit beide Oberflaechen dieselbe Logik nutzen (kein Copy-Paste
zwischen TUI und CLI, kein Drift zwischen beiden Wegen).
"""
from __future__ import annotations

from datetime import datetime, timezone
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


def tombstones_path() -> Path:
    """Registry fuer bewusst verworfene Inbox-Drafts.

    Firestore/Runtime-Pulls koennen alte Inbox-JSONs erneut liefern. Der
    Tombstone verhindert, dass daraus wieder ein lokaler Review-Draft entsteht.
    """
    return DATA_DIR / "registry" / "inbox_tombstones.yml"


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


def _norm_key(value: Any) -> str:
    return str(value or "").strip().casefold().replace("-", "_").replace(" ", "_")


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


def _tombstone_keys(file_id: str | None, ex: dict[str, Any] | None = None) -> list[str]:
    ex = ex or {}
    keys: list[str] = []

    for value in (file_id, ex.get("exercise_id"), ex.get("id")):
        text = str(value or "")
        if not text:
            continue
        keys.append(_norm_key(text))
        if text.startswith("inbox_"):
            keys.append(_norm_key(text.removeprefix("inbox_")))
        match = re.fullmatch(r"(?:inbox_)?wger_(\d+)", text)
        if match:
            keys.append(f"wger:{match.group(1)}")

    wger_id = ex.get("wger_id")
    if wger_id:
        keys.append(f"wger:{wger_id}")

    yuhonas_id = ex.get("yuhonas_id")
    for value in _as_list(yuhonas_id):
        keys.append(f"yuhonas:{_norm_key(value)}")
        keys.append(_norm_key(value))

    for key in ("display_name", "german", "english", "name"):
        value = ex.get(key)
        if isinstance(value, str) and value:
            keys.append(f"name:{_norm_key(value)}")

    unique: list[str] = []
    seen: set[str] = set()
    for key in keys:
        if key and key not in seen:
            seen.add(key)
            unique.append(key)
    return unique


def _load_tombstones() -> dict[str, Any]:
    path = tombstones_path()
    if not path.exists():
        return {"version": 1, "tombstones": []}
    doc = load_yaml(path)
    if not isinstance(doc, dict):
        return {"version": 1, "tombstones": []}
    tombstones = doc.get("tombstones")
    if not isinstance(tombstones, list):
        doc["tombstones"] = []
    if "version" not in doc:
        doc["version"] = 1
    return doc


def _write_tombstones(doc: dict[str, Any]) -> None:
    path = tombstones_path()
    path.parent.mkdir(parents=True, exist_ok=True)
    path.write_text(yaml.dump(doc, allow_unicode=True, sort_keys=False), encoding="utf-8")


def list_inbox_tombstones() -> list[dict[str, Any]]:
    doc = _load_tombstones()
    return [entry for entry in doc.get("tombstones", []) if isinstance(entry, dict)]


def find_inbox_tombstone(tombstone_id: str) -> dict[str, Any]:
    key = _norm_key(tombstone_id)
    for entry in list_inbox_tombstones():
        candidates = [
            entry.get("id"),
            entry.get("exercise_id"),
            *(entry.get("keys") or []),
        ]
        if any(_norm_key(candidate) == key for candidate in candidates if candidate):
            return entry
    raise FileNotFoundError(f"Graveyard-Eintrag nicht gefunden: {tombstone_id}")


def remove_inbox_tombstone(tombstone_id: str) -> dict[str, Any]:
    target = find_inbox_tombstone(tombstone_id)
    doc = _load_tombstones()
    doc["tombstones"] = [
        entry for entry in doc.get("tombstones", [])
        if not isinstance(entry, dict) or entry.get("id") != target.get("id")
    ]
    _write_tombstones(doc)
    return target


def _source_exercise_for_tombstone(entry: dict[str, Any]) -> dict[str, Any] | None:
    exercise_id = entry.get("exercise_id")
    if not exercise_id:
        return None
    for source_file in ("unreviewed_wger.yml", "unreviewed_yuhonas.yml"):
        path = exercises_dir() / source_file
        if not path.exists():
            continue
        doc = load_yaml(path)
        for ex in doc.get("exercises", []) or []:
            if isinstance(ex, dict) and str(ex.get("exercise_id")) == str(exercise_id):
                return dict(ex)
    return None


def restore_inbox_tombstone(tombstone_id: str) -> Path:
    """Stellt einen Graveyard-Eintrag als Inbox-Draft wieder her und entfernt
    danach den Tombstone. Wenn die Bulk-Quelle nicht mehr vorhanden ist, wird ein
    minimaler Draft aus dem Tombstone erzeugt, damit der Coach ihn reviewen kann.
    """
    entry = find_inbox_tombstone(tombstone_id)
    stem = str(entry.get("id") or f"inbox_{entry.get('exercise_id')}")
    if not stem.startswith("inbox_"):
        stem = f"inbox_{stem}"
    target = inbox_dir() / f"{stem}.yml"
    if target.exists():
        raise FileExistsError(f"Inbox-Datei existiert bereits: {target.name}")

    ex = _source_exercise_for_tombstone(entry)
    if ex is None:
        ex = {
            "exercise_id": entry.get("exercise_id") or stem.removeprefix("inbox_"),
            "display_name": entry.get("display_name") or stem,
            "source": "unreviewed",
            "primary_muscles": [],
            "secondary_muscles": [],
            "stabilizers": [],
        }
    ex["source"] = "unreviewed"

    wrapper = {
        "name": stem,
        "description": f"Restored from graveyard: {entry.get('display_name') or stem}",
        "restored_at": datetime.now(timezone.utc).isoformat(),
        "graveyard_entry": entry,
        "exercises": [ex],
    }
    target.parent.mkdir(parents=True, exist_ok=True)
    target.write_text(yaml.dump(wrapper, allow_unicode=True, sort_keys=False), encoding="utf-8")
    remove_inbox_tombstone(stem)
    return target


def write_inbox_tombstone(
    file_id: str | Path,
    ex: dict[str, Any] | None = None,
    reason: str = "deleted_inbox",
) -> None:
    stem = file_id.stem if isinstance(file_id, Path) else str(file_id).removesuffix(".yml")
    keys = _tombstone_keys(stem, ex)
    if not keys:
        return

    doc = _load_tombstones()
    tombstones = doc["tombstones"]
    existing_keys: set[str] = set()
    for entry in tombstones:
        if isinstance(entry, dict):
            existing_keys.update(str(key) for key in entry.get("keys", []) if key)
    if any(key in existing_keys for key in keys):
        return

    tombstones.append({
        "id": stem,
        "exercise_id": (ex or {}).get("exercise_id") or (ex or {}).get("id"),
        "display_name": display_name_of(ex or {}, stem),
        "reason": reason,
        "created_at": datetime.now(timezone.utc).isoformat(),
        "keys": keys,
    })

    _write_tombstones(doc)


def is_inbox_tombstoned(file_id: str | Path, ex: dict[str, Any] | None = None) -> bool:
    stem = file_id.stem if isinstance(file_id, Path) else str(file_id).removesuffix(".yml")
    keys = set(_tombstone_keys(stem, ex))
    if not keys:
        return False
    doc = _load_tombstones()
    for entry in doc.get("tombstones", []):
        if not isinstance(entry, dict):
            continue
        if keys.intersection(str(key) for key in entry.get("keys", []) if key):
            return True
    return False


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

    approved_at = datetime.now(timezone.utc).isoformat()
    ex["source"] = "expert"
    ex["approved_at"] = approved_at
    _merge_source_refs(f, ex)

    detail_path = exercises_dir() / f"{ex_id}.yml"
    if detail_path.exists():
        detail_path.with_suffix(".yml.bak").write_text(detail_path.read_text())

    display_name = display_name_of(ex, ex_id)
    detail_doc = {
        "exercise_id": ex_id,
        "description": f"Expert details for {display_name}",
        "approved_at": approved_at,
        "exercises": [ex],
    }
    detail_path.write_text(
        yaml.dump(detail_doc, allow_unicode=True, sort_keys=False, default_flow_style=False)
    )
    f.unlink()
    return ex_id


def delete_inbox_entry(f: Path, ex: dict[str, Any] | None = None) -> None:
    write_inbox_tombstone(f, ex, reason="deleted_inbox")
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
    enriched_at = datetime.now(timezone.utc).isoformat()
    enriched["source"] = "unreviewed"
    enriched["enriched_at"] = enriched_at

    description = (
        f"Reenriched (Coach-Feedback) fuer: {name}" if feedback
        else f"Neu angereichert (manueller Re-Enrich) fuer: {name}"
    )
    wrapper = {"name": f.stem, "description": description, "enriched_at": enriched_at, "exercises": [enriched]}
    f.write_text(yaml.dump(wrapper, allow_unicode=True, sort_keys=False))

    return {"enriched": enriched, "haiku_applied": haiku_applied}
