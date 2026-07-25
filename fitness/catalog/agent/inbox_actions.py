"""Kernlogik für Inbox-Review-Aktionen — geteilt zwischen TUI (tui.py) und
CLI (`fitness-catalog inbox ...`). Reine Funktionen ohne rich.Prompt/Confirm-
Abhaengigkeit, damit beide Oberflaechen dieselbe Logik nutzen (kein Copy-Paste
zwischen TUI und CLI, kein Drift zwischen beiden Wegen).
"""
from __future__ import annotations

from pathlib import Path
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
    if not api_key:
        raise RuntimeError("GEMINI_API_KEY fehlt")

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
