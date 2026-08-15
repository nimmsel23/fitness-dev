"""CRUD für Muskel-KB-Dateien (fitness/catalog/kb/muscles/**/*.yml).

Liest über fitness.catalog.core.muscles (einziger YAML-Parser für diesen Baum),
ergänzt nur das, was das reine Read-Modul dort nicht brauchte: Einzel-Lookup per
ID + Schreiben (origin/insertion/innervation/function-Enrichment).
"""
from __future__ import annotations

from pathlib import Path
from typing import Any, Optional

import yaml

from fitness.catalog.core.muscles import (
    build_muscle_document,
    iter_muscle_documents,
    iter_muscle_files,
    load_muscle_index,
)

# Felder, die build_muscle_document() zur Laufzeit berechnet (kb_level, region, ...)
# und NICHT mit zurück in die YAML-Datei geschrieben werden dürfen.
_COMPUTED_FIELDS = {"doc_id", "kb_level", "region", "catalog_id"}


def list_muscles() -> list[str]:
    """Alle Einzelmuskel-IDs (ohne Region-Sammeldateien wie 'back.yml')."""
    return sorted(doc_id for doc_id, doc in iter_muscle_documents() if doc.get("kb_level") == "muscle")


def _find_muscle_path(muscle_id: str) -> Optional[Path]:
    for path in iter_muscle_files():
        if path.stem == muscle_id:
            return path
    return None


def load_muscle(muscle_id: str) -> Optional[dict[str, Any]]:
    path = _find_muscle_path(muscle_id)
    if not path:
        return None
    built = build_muscle_document(path, load_muscle_index())
    return built[1] if built else None


def save_muscle(muscle_id: str, data: dict[str, Any]) -> Path:
    path = _find_muscle_path(muscle_id)
    if not path:
        raise FileNotFoundError(
            f"Keine KB-Datei für Muskel-ID '{muscle_id}' unter fitness/catalog/kb/muscles/"
        )
    clean = {k: v for k, v in data.items() if k not in _COMPUTED_FIELDS}
    path.write_text(
        yaml.dump(clean, allow_unicode=True, default_flow_style=False, sort_keys=False),
        encoding="utf-8",
    )
    return path


def update_muscle(muscle_id: str, anatomy: dict[str, Any], force: bool = False) -> tuple[Path, bool]:
    """Mergt Anatomy-Felder (origin/insertion/innervation/function) in die bestehende Datei."""
    existing = load_muscle(muscle_id)
    if existing is None:
        raise FileNotFoundError(f"Keine KB-Datei für Muskel-ID '{muscle_id}'")
    if force or not existing.get("origin"):
        for field in ("origin", "insertion", "innervation", "function"):
            if anatomy.get(field):
                existing[field] = anatomy[field]
    return save_muscle(muscle_id, existing), True
