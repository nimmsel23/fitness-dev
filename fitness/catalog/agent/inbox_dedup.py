"""Duplikat-Erkennung + Merge fuer die Firestore-Coach-Inbox
(`fitness/{uid}/inbox`) — das "Doppelte-Kontakte-zusammenfuehren?"-Muster
vom Smartphone, nur fuer Exercise-Inbox-Drafts.

Ursache der Duplikate: vor dem Session-Save-Fix (siehe
`fitness/api/routers/sessions.py::_queue_unreviewed_enrichment`) und dem
Resolver-Dedup-Fix (`fitness/catalog/core/resolver.py`) konnten fuer
dieselbe reale Uebung mehrfach separate Inbox-Docs entstehen (wger- und
yuhonas-Quelle nie gemerged, oder wiederholtes Queueing bei jedem Loggen).
Reine Erkennungs-/Merge-Logik hier, keine Confirm/Print-Abhaengigkeit —
CLI-Layer in `cli.py::inbox_dedupe_cmd`.
"""
from __future__ import annotations

import re
from typing import Any

from fitness.firestore.kb import get_db

# Listen-Felder: bei Merge Union statt Ueberschreiben.
_LIST_FIELDS = (
    "coaching_notes", "common_errors", "primary_muscles", "secondary_muscles",
    "stabilizers", "equipment", "tags", "aliases", "search_aliases",
    "instructions", "images",
)


def _norm_name(value: str) -> str:
    return re.sub(r"[^a-z0-9]+", " ", str(value or "").strip().lower()).strip()


def _doc_display_name(data: dict[str, Any]) -> str | None:
    enriched = data.get("enriched") or {}
    return (
        data.get("display_name") or data.get("name")
        or enriched.get("display_name") or enriched.get("name")
    )


def _richness_score(data: dict[str, Any]) -> tuple[int, int, str]:
    """Sortierschluessel fuer den Survivor: mehr ausgefuellte Felder im
    'enriched'-Draft gewinnt, bei Gleichstand der juengere Zeitstempel."""
    enriched = data.get("enriched") or {}
    filled = sum(1 for v in enriched.values() if v)
    has_enriched = 1 if data.get("enriched") else 0
    received_at = str(data.get("received_at") or "")
    return (has_enriched, filled, received_at)


def find_duplicate_groups() -> list[list[dict[str, Any]]]:
    """Gruppiert alle Inbox-Docs (ueber alle User) nach normalisiertem
    Namen. Gibt nur Gruppen mit >1 Eintrag zurueck, absteigend nach
    Groesse sortiert."""
    db = get_db()
    docs = list(db.collection_group("inbox").stream())

    groups: dict[str, list[dict[str, Any]]] = {}
    for doc in docs:
        data = doc.to_dict() or {}
        if data.get("status") in ("merged_duplicate",):
            continue
        name = _doc_display_name(data)
        if not name:
            continue
        key = _norm_name(name)
        if not key:
            continue
        parent_user = doc.reference.parent.parent
        entry = {
            "_ref": doc.reference,
            "_uid": parent_user.id if parent_user else None,
            "_doc_id": doc.id,
            **data,
        }
        groups.setdefault(key, []).append(entry)

    duplicates = [g for g in groups.values() if len(g) > 1]
    duplicates.sort(key=len, reverse=True)
    return duplicates


def plan_merge(group: list[dict[str, Any]]) -> dict[str, Any]:
    """Entscheidet Survivor + gemergte Daten fuer eine Duplikat-Gruppe,
    schreibt noch nichts. Rueckgabe: {"survivor": doc, "losers": [...],
    "merged_enriched": {...}}."""
    ordered = sorted(group, key=_richness_score, reverse=True)
    survivor, *losers = ordered

    merged: dict[str, Any] = dict(survivor.get("enriched") or {})
    for loser in losers:
        loser_enriched = loser.get("enriched") or {}
        for key, value in loser_enriched.items():
            if key in _LIST_FIELDS:
                existing = merged.get(key) or []
                if not isinstance(existing, list):
                    existing = [existing]
                incoming = value if isinstance(value, list) else ([value] if value else [])
                combined = list(existing)
                for item in incoming:
                    if item not in combined:
                        combined.append(item)
                if combined:
                    merged[key] = combined
            elif not merged.get(key) and value:
                merged[key] = value

    return {"survivor": survivor, "losers": losers, "merged_enriched": merged}


def apply_merge(plan: dict[str, Any]) -> None:
    """Schreibt den gemergten Survivor zurueck, markiert Losers als
    'merged_duplicate' (soft — kein Hard-Delete, reversibel: Status
    manuell zuruecksetzen stellt den alten Zustand wieder her). Bewusst
    NICHT 'rejected', damit ein Merge nicht wie eine Coach-Entscheidung
    aussieht."""
    survivor = plan["survivor"]
    losers = plan["losers"]
    merged_enriched = plan["merged_enriched"]

    if merged_enriched != (survivor.get("enriched") or {}):
        survivor["_ref"].update({"enriched": merged_enriched})

    for loser in losers:
        loser["_ref"].update({
            "status": "merged_duplicate",
            "merged_into": survivor["_doc_id"],
        })
