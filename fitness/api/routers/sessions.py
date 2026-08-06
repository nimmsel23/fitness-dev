import asyncio
from datetime import datetime
from typing import Any
from fastapi import APIRouter, Request, Query, HTTPException

from fitness.api.config import (
    SESS_ROOT, _uid_from_request, date, _read_json, _write_json,
    _session_file, _parse_session_fname, _freeze_snapshot, _sync_session_to_db,
    logger
)
from db.schemas import SessionResponse, SyncRequest, SyncResponse
from fitness.firestore.mirror import mirror_session
from fitness.catalog.core.session_signal import exercise_has_training_signal

router = APIRouter()

def _today() -> str:
    return date.today().isoformat()


def _performed_exercises(session: dict[str, Any]) -> list[dict[str, Any]]:
    return [
        ex for ex in (session.get("exercises") or [])
        if isinstance(ex, dict) and exercise_has_training_signal(ex)
    ]


def _is_activity_only(session: dict[str, Any]) -> bool:
    return bool(session.get("activity")) and not _performed_exercises(session)


def _merge_activity_addon(base: dict[str, Any], incoming: dict[str, Any], source_id: str | None) -> dict[str, Any]:
    activity = incoming.get("activity")
    if not isinstance(activity, dict) or not activity:
        return base

    merged = dict(base)
    activity_entry = dict(activity)
    if source_id:
        activity_entry.setdefault("_source_id", source_id)

    addons = [
        dict(a) for a in (merged.get("activityAddons") or [])
        if isinstance(a, dict)
    ]
    if merged.get("activity") and all(a != merged["activity"] for a in addons):
        addons.insert(0, dict(merged["activity"]))

    signature = (
        activity_entry.get("type"),
        activity_entry.get("duration"),
        activity_entry.get("notes"),
        activity_entry.get("swimStyle"),
        activity_entry.get("muscleTarget"),
    )
    if not any((
        a.get("type"),
        a.get("duration"),
        a.get("notes"),
        a.get("swimStyle"),
        a.get("muscleTarget"),
    ) == signature for a in addons):
        addons.append(activity_entry)

    merged["activityAddons"] = addons
    merged.setdefault("activity", addons[0])
    if not _performed_exercises(merged):
        merged["sessionMode"] = "cardio"
        merged["activity"] = addons[0]
    return merged

@router.get("/session", response_model=SessionResponse)
def session_get(request: Request, date_: str = Query(None, alias="date"), id: str | None = None):
    uid  = _uid_from_request(request)
    day  = date_ or _today()
    data = _read_json(_session_file(uid, day, id))
    return SessionResponse(ok=True, session=data, date=day)

@router.post("/session")
async def session_post(request: Request, date_: str = Query(None, alias="date"), id: str | None = None):
    uid  = _uid_from_request(request)
    day  = date_ or _today()
    body = await request.json()

    if _is_activity_only(body):
        canonical = _session_file(uid, day, None)
        existing = _read_json(canonical, {}) if canonical.exists() else {}
        base = existing if isinstance(existing, dict) and existing else {**body, "exercises": []}
        session = _freeze_snapshot({
            **_merge_activity_addon(base, body, id),
            "date": day,
            "session_id": None,
            "saved_at": datetime.utcnow().isoformat(),
        })
        _write_json(canonical, session)
        if id:
            sidecar = _session_file(uid, day, id)
            if sidecar.exists():
                sidecar.unlink()
        _sync_session_to_db(day, session, None)
        asyncio.get_event_loop().run_in_executor(None, mirror_session, day, session, uid)
        logger.info(f"session activity merged  {uid}/{day}  activity={body.get('activity', {}).get('type','')}")
        return {"ok": True, "id": None, "merged": True}

    session = _freeze_snapshot({**body, "date": day, "session_id": id, "saved_at": datetime.utcnow().isoformat()})
    n_ex = len(session.get("exercises", []))
    _write_json(_session_file(uid, day, id), session)
    _sync_session_to_db(day, session, id)
    asyncio.get_event_loop().run_in_executor(None, mirror_session, day, session, uid)
    logger.info(f"session saved  {uid}/{day}  block={session.get('block','')}  exercises={n_ex}")
    return {"ok": True, "id": id}

@router.delete("/session")
def session_delete(request: Request, date_: str = Query(None, alias="date"), id: str | None = None):
    uid = _uid_from_request(request)
    day = date_ or _today()
    f   = _session_file(uid, day, id)
    if f.exists():
        f.unlink()
        logger.info(f"session deleted  {uid}/{day}")
    return {"ok": True}

@router.get("/sessions")
def sessions_list(request: Request, date_: str = Query(None, alias="date")):
    uid = _uid_from_request(request)
    day = date_ or _today()
    d   = SESS_ROOT / uid / "sessions"
    if not d.exists():
        return {"ok": True, "sessions": []}
    sessions = []
    for f in sorted(d.glob(f"{day}*.json")):
        meta_day, meta_sid = _parse_session_fname(f.name)
        data = _read_json(f, {})
        entry = dict(data)
        entry.update({
            "id": meta_sid,
            "date": meta_day,
            "block": data.get("block"),
            "saved_at": data.get("saved_at"),
        })
        if not isinstance(entry.get("exercises"), list):
            entry["exercises"] = []
        sessions.append(entry)
    return {"ok": True, "sessions": sessions}

@router.get("/session/history")
def session_history(request: Request, limit: int = 10):
    uid   = _uid_from_request(request)
    d     = SESS_ROOT / uid / "sessions"
    if not d.exists():
        return {"ok": True, "sessions": []}
    files = sorted(d.glob("*.json"), reverse=True)[:limit]
    out   = []
    for f in files:
        meta_day, meta_sid = _parse_session_fname(f.name)
        out.append({"date": meta_day, "id": meta_sid, **(_read_json(f) or {})})
    return {"ok": True, "sessions": out}

@router.get("/session/latest")
def session_latest(request: Request):
    uid   = _uid_from_request(request)
    d     = SESS_ROOT / uid / "sessions"
    if not d.exists():
        raise HTTPException(404)
    files = sorted(d.glob("*.json"), reverse=True)
    if not files:
        raise HTTPException(404)
    data = _read_json(files[0])
    day, _ = _parse_session_fname(files[0].name)
    return {"ok": True, "session": {"date": day, "data": data}}

@router.delete("/session/{date_path}")
def session_delete_by_date(date_path: str, request: Request, id: str | None = None):
    uid = _uid_from_request(request)
    f   = _session_file(uid, date_path, id)
    if f.exists():
        f.unlink()
        logger.info(f"session deleted  {uid}/{date_path}")
    return {"ok": True}

@router.post("/internal/sync/session", response_model=SyncResponse)
async def internal_sync_session(body: SyncRequest):
    try:
        n = _sync_session_to_db(body.date, body.session, session_id=body.session_id)
        return SyncResponse(ok=True, synced=n, date=body.date)
    except Exception as exc:
        logger.error(f"internal_sync_session: {exc}")
        return SyncResponse(ok=False, synced=0, date=body.date)

@router.get("/fitness/clients")
def clients(request: Request):
    if not SESS_ROOT.exists():
        return {"ok": True, "clients": []}
    result = []
    for uid_dir in SESS_ROOT.iterdir():
        if not uid_dir.is_dir() or uid_dir.name in ("default", "kb"):
            continue
        name     = uid_dir.name[:8]
        sess_dir = uid_dir / "sessions"
        if sess_dir.exists():
            files = sorted(sess_dir.glob("*.json"), reverse=True)
            if files:
                last = _read_json(files[0])
                if last and last.get("user_name"):
                    name = last["user_name"]
        result.append({"uid": uid_dir.name, "name": name})
    return {"ok": True, "clients": result}
