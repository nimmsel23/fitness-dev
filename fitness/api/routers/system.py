import os
import yaml
import asyncio
from datetime import date, datetime, timedelta
from fastapi import APIRouter, Request, Query, HTTPException

from fitness.api.config import (
    PORT, RUNTIME, BODY_DIR, _HERE, _DIST_DIR, _uid_from_request, _read_json, _write_json,
    _wger_post, logger
)
from db.schemas import HealthResponse, BodyResponse

# ── firestore imports ─────────────────────────────────────────────────────────
from firestore.mirror import mirror_session
from firestore.mirror import get_status as firestore_status
try:
    from firestore.sync import pull as firestore_pull
    _FIRESTORE_PULL_AVAILABLE = True
except ImportError:
    _FIRESTORE_PULL_AVAILABLE = False

router = APIRouter()
_THEME_FILE = RUNTIME / "theme.json"

@router.post("/fitness/note-backfill")
def note_backfill(uid: str | None = None, apply: bool = False):
    """On-demand: Haiku liest Session-JSONs mit leerem reps/weight oder fehlendem block
    und schlaegt Korrekturen aus den geloggten Fakten vor; bei apply=True schreibt der
    Backend-Prozess selbst (mit .bak-Backup), Haiku editiert nichts direkt."""
    from fitness.runtime.note_backfill import fix_sessions, find_suspect_default_effort

    results = fix_sessions(user_id=uid, apply=apply)
    suspects = find_suspect_default_effort(user_id=uid)
    return {
        "dry_run": not apply,
        "session_count": len(results),
        "sessions": [r.__dict__ for r in results],
        "suspect_default_effort": suspects,
    }

def _today() -> str:
    return date.today().isoformat()

@router.get("/health", response_model=HealthResponse)
def health():
    return HealthResponse(ok=True, port=PORT, runtime=str(RUNTIME))

@router.get("/theme")
def theme_get():
    return _read_json(_THEME_FILE, {"theme": "mocha"})

@router.post("/theme")
async def theme_post(request: Request):
    body = await request.json()
    _write_json(_THEME_FILE, body)
    return {"ok": True}

@router.get("/fitness/body", response_model=BodyResponse)
def body_get(days: int = Query(30, le=365, ge=1)):
    BODY_DIR.mkdir(parents=True, exist_ok=True)
    files = sorted(BODY_DIR.glob("????-??-??.json"), reverse=True)[:days]
    return {"ok": True, "entries": [e for f in files if (e := _read_json(f))]}

@router.post("/fitness/body")
async def body_post(request: Request):
    BODY_DIR.mkdir(parents=True, exist_ok=True)
    payload  = await request.json()
    day      = payload.get("date", _today())
    f        = BODY_DIR / f"{day}.json"
    existing = _read_json(f, {"date": day})
    _write_json(f, {**existing, **payload, "updated_at": datetime.utcnow().isoformat()})
    if payload.get("weight_kg") is not None:
        asyncio.create_task(_wger_post("/weightentry/", {"date": day, "weight": str(payload["weight_kg"])}))
        logger.info(f"body saved  {day}  weight={payload['weight_kg']}kg  → wger sync")
    else:
        logger.info(f"body saved  {day}")
    return {"ok": True, "day": day}

@router.get("/firestore/status")
def fs_status():
    return firestore_status()

@router.post("/firestore/sync")
def fs_sync(request: Request):
    uid      = _uid_from_request(request)
    sess_root = RUNTIME / "users"
    sess_dir = sess_root / uid / "sessions"
    if not sess_dir.exists():
        return {"ok": True, "synced": 0}
    files = sorted(sess_dir.glob("*.json"), reverse=True)[:30]
    count = 0
    for f in files:
        sess = _read_json(f)
        if not sess:
            continue
        base = f.name.removesuffix(".json")
        day = base.split("__")[0]
        mirror_session(day, sess, uid)
        count += 1
    logger.info(f"firestore/sync  {uid}  {count} sessions")
    return {"ok": True, "synced": count}

@router.post("/firestore/pull")
def fs_pull(request: Request):
    uid = _uid_from_request(request)
    if not uid or uid == "default":
        raise HTTPException(400, detail="uid Pflicht (kein default). Via ?uid=... oder X-User-UID Header.")
    status = firestore_status()
    if not status.get("ok"):
        raise HTTPException(503, detail="Firestore nicht verbunden")
    if not _FIRESTORE_PULL_AVAILABLE:
        raise HTTPException(503, detail="firestore.sync.pull nicht verfügbar")
    sess_root = RUNTIME / "users"
    sess_dir = sess_root / uid / "sessions"
    sess_dir.mkdir(parents=True, exist_ok=True)
    try:
        result = firestore_pull()
        logger.info(f"firestore/pull  {uid}  {result}")
        return {"ok": True, **result}
    except Exception as exc:
        logger.error(f"firestore/pull {uid}: {exc}")
        raise HTTPException(500, detail=str(exc))

@router.get("/fitness/config")
def fitness_config():
    try:
        config = _read_json(_HERE.parent / "catalog" / "config.yml") or {}
    except Exception as exc:
        logger.warning(f"fitness_config: {exc}")
        config = {}
    return {"ok": True, "config": config, "source": "local_yaml"}

@router.post("/fitness/config")
async def fitness_config_post(request: Request):
    body = await request.json()
    _write_json(_HERE.parent / "catalog" / "config.yml", body)
    return {"ok": True}
