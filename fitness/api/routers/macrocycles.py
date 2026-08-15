"""Makrozyklen: Coach baut Klienten mehrwöchige Trainingsblöcke von Hand
(keine Automatik/Templates) — Woche für Woche, Tag für Tag, freie Übungswahl.

Speicherort: ~/.aos/fitness/users/<client_uid>/macrocycles/<id>.json
"""
from __future__ import annotations

from datetime import datetime
from pathlib import Path
from typing import Any
from uuid import uuid4

from fastapi import APIRouter, HTTPException, Request
from loguru import logger

from fitness.api.config import RUNTIME, _read_json, _write_json

router = APIRouter(prefix="/fitness/coach/macrocycles")


def _dir(client_uid: str) -> Path:
    return RUNTIME / "users" / client_uid / "macrocycles"


def _empty_week(week_nr: int) -> dict[str, Any]:
    return {"weekNr": week_nr, "days": {d: None for d in ("mo", "di", "mi", "do", "fr", "sa", "so")}}


@router.get("/{client_uid}")
def list_macrocycles(client_uid: str):
    dir_ = _dir(client_uid)
    if not dir_.exists():
        return {"ok": True, "macrocycles": []}
    items = []
    for f in sorted(dir_.glob("*.json")):
        m = _read_json(f)
        if m:
            items.append({k: v for k, v in m.items() if k != "weeks"} | {"weekCount": len(m.get("weeks") or [])})
    items.sort(key=lambda m: m.get("createdAt", ""), reverse=True)
    return {"ok": True, "macrocycles": items}


@router.get("/{client_uid}/{cycle_id}")
def get_macrocycle(client_uid: str, cycle_id: str):
    m = _read_json(_dir(client_uid) / f"{cycle_id}.json")
    if not m:
        raise HTTPException(404, detail="Makrozyklus nicht gefunden")
    return {"ok": True, "macrocycle": m}


@router.post("/{client_uid}")
async def create_macrocycle(client_uid: str, request: Request):
    body: dict[str, Any] = await request.json()
    name = (body.get("name") or "").strip()
    coach_uid = body.get("coachUid")
    week_count = int(body.get("weeks") or 1)
    if not name or not coach_uid:
        raise HTTPException(400, detail="name und coachUid erforderlich")
    week_count = max(1, min(week_count, 52))

    cycle_id = f"mc_{uuid4().hex[:12]}"
    record = {
        "id": cycle_id,
        "name": name,
        "clientUid": client_uid,
        "coachUid": coach_uid,
        "createdAt": datetime.now().isoformat(),
        "updatedAt": datetime.now().isoformat(),
        "weeks": [_empty_week(n) for n in range(1, week_count + 1)],
    }
    _write_json(_dir(client_uid) / f"{cycle_id}.json", record)
    logger.info(f"macrocycles: {coach_uid} → {client_uid} '{name}' ({week_count} Wochen) angelegt")
    return {"ok": True, "macrocycle": record}


@router.put("/{client_uid}/{cycle_id}")
async def update_macrocycle(client_uid: str, cycle_id: str, request: Request):
    path = _dir(client_uid) / f"{cycle_id}.json"
    existing = _read_json(path)
    if not existing:
        raise HTTPException(404, detail="Makrozyklus nicht gefunden")

    body: dict[str, Any] = await request.json()
    if "name" in body:
        existing["name"] = body["name"]
    if "weeks" in body and isinstance(body["weeks"], list):
        existing["weeks"] = body["weeks"]
    existing["updatedAt"] = datetime.now().isoformat()
    _write_json(path, existing)
    return {"ok": True, "macrocycle": existing}


@router.delete("/{client_uid}/{cycle_id}")
def delete_macrocycle(client_uid: str, cycle_id: str):
    path = _dir(client_uid) / f"{cycle_id}.json"
    if path.exists():
        path.unlink()
    return {"ok": True}
