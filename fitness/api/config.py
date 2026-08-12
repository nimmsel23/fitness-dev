import os
import sys
import json
import dataclasses
import asyncio
from pathlib import Path
from datetime import date, datetime, timedelta
from typing import Any
from loguru import logger

# ── Sys-Path for local modules ────────────────────────────────────────────────
_HERE = Path(__file__).resolve().parent
sys.path.insert(0, str(_HERE.parent))  # adds fitness/ to path (gives db/, firestore/, catalog/)

_FUEL_DEV = Path.home() / "fuel-dev"
if _FUEL_DEV.exists():
    sys.path.insert(0, str(_FUEL_DEV))

# ── Core Paths ────────────────────────────────────────────────────────────────
from fitness.catalog.core.paths import runtime_root

PORT     = int(os.environ.get("FITNESS_PYTHON_PORT", os.environ.get("FITNESS_PORT", 9150)))
HOST     = os.environ.get("FITNESS_HOST", "127.0.0.1")
RUNTIME  = runtime_root()                     # ~/.aos/fitness
SESS_ROOT = RUNTIME / "users"                 # ~/.aos/fitness/users/{uid}/sessions/
BODY_DIR  = RUNTIME / "body"
JOUR_DIR  = RUNTIME / "journal"
INBOX_DIR = _HERE.parent / "catalog" / "kb" / "inbox"

WGER_TOKEN = os.environ.get("WGER_API_TOKEN", os.environ.get("WGER_TOKEN", ""))
WGER_BASE  = os.environ.get("WGER_BASE", "")

# ── Frontend Dist Directories ──────────────────────────────────────────────────
# 1. Main Fitness SPA Build (served at root / and hash routes like /#coach)
_DIST_DIR = _HERE.parent.parent / "dist"
_INDEX_HTML = _DIST_DIR / "index.html"

# 2. Standalone Catalog-UI Build (served explicitly at /catalog-ui)
_CATALOG_DIST_DIR = _HERE.parent / "catalog" / "dist"
_CATALOG_INDEX_HTML = _CATALOG_DIST_DIR / "index.html"


# Local habits fallback
LOCAL_HABITS_FILE = Path.home() / ".aos" / "journal" / "habits" / "definitions.json"
LOCAL_RECORDS_DIR = Path.home() / ".aos" / "journal" / "habits" / "records"

# ── helper imports ────────────────────────────────────────────────────────────
from db import SessionLocal, engine, Base
from db.models import TrainingHistory
from fitness.catalog.api.sync_gateway import sync_session as _gw_sync

# ── JSON Helper Functions ─────────────────────────────────────────────────────
def _read_json(p: Path, fallback=None):
    try:
        return json.loads(p.read_text())
    except Exception:
        return fallback

def _write_json(p: Path, data) -> None:
    p.parent.mkdir(parents=True, exist_ok=True)
    p.write_text(json.dumps(data, indent=2, ensure_ascii=False))

def _active_uid_fallback() -> str | None:
    for key in ("FITNESS_UID", "AOS_UID"):
        value = (os.environ.get(key) or "").strip()
        if value and value != "default":
            return value
    uid_file = Path.home() / ".aos" / "users" / ".active-uid"
    try:
        value = uid_file.read_text().strip()
    except Exception:
        value = ""
    return value if value and value != "default" else None

def _uid_from_request(request) -> str:
    uid = (request.query_params.get("uid") or request.headers.get("X-User-UID") or "").strip()
    if uid and uid != "default":
        return uid
    return _active_uid_fallback() or "default"

def _session_file(uid: str, day: str, sid: str | None) -> Path:
    fname = f"{day}__{sid}.json" if sid else f"{day}.json"
    return SESS_ROOT / uid / "sessions" / fname

def _parse_session_fname(fname: str) -> tuple[str, str | None]:
    base = fname.removesuffix(".json")
    parts = base.split("__", 1)
    return parts[0], parts[1] if len(parts) > 1 else None

def _record_to_dict(r) -> dict:
    return dataclasses.asdict(r) if dataclasses.is_dataclass(r) else dict(r)

def _last_dates(n: int) -> list[str]:
    today = date.today()
    return [(today - timedelta(days=i)).isoformat() for i in range(n - 1, -1, -1)]

def _sync_session_to_db(day: str, session: dict, session_id: str | None = None) -> None:
    _gw_sync(day, session, session_id=session_id)

def _freeze_snapshot(session: dict) -> dict:
    exercises = [
        {
            **ex,
            "name": ex.get("name") or ex.get("exercise_id") or ex.get("id") or "Unknown",
            "exercise_id_at_log": ex.get("exercise_id") or ex.get("id") or None,
            "primaryMuscles": ex.get("primaryMuscles") if isinstance(ex.get("primaryMuscles"), list) else [],
            "secondaryMuscles": ex.get("secondaryMuscles") if isinstance(ex.get("secondaryMuscles"), list) else [],
        }
        for ex in (session.get("exercises") or [])
    ]
    return {**session, "exercises": exercises, "snapshot_version": 1}

# ── HTTPX wger client ─────────────────────────────────────────────────────────
try:
    import httpx
    _httpx_client: httpx.AsyncClient | None = None

    async def _wger_get(path: str, qs: str = "") -> dict:
        global _httpx_client
        if _httpx_client is None:
            _httpx_client = httpx.AsyncClient(timeout=4.0)
        url = f"{WGER_BASE}{path}?format=json{'&' + qs if qs else ''}"
        try:
            resp = await _httpx_client.get(url, headers={"Authorization": f"Token {WGER_TOKEN}"})
            return resp.json() if resp.is_success else {}
        except Exception as exc:
            logger.warning(f"wger GET {path}: {exc}")
            return {}

    async def _wger_post(path: str, body: dict) -> dict | None:
        global _httpx_client
        if _httpx_client is None:
            _httpx_client = httpx.AsyncClient(timeout=4.0)
        url = f"{WGER_BASE}{path}"
        try:
            resp = await _httpx_client.post(url, json=body, headers={"Authorization": f"Token {WGER_TOKEN}", "Content-Type": "application/json"})
            return resp.json() if resp.is_success else None
        except Exception as exc:
            logger.warning(f"wger POST {path}: {exc}")
            return None

    _HTTPX_AVAILABLE = True
except ImportError:
    _HTTPX_AVAILABLE = False
    async def _wger_get(path: str, qs: str = "") -> dict: return {}
    async def _wger_post(path: str, body: dict) -> dict | None: return None

async def close_httpx_client():
    global _httpx_client
    if _HTTPX_AVAILABLE and _httpx_client is not None:
        await _httpx_client.aclose()
        _httpx_client = None


# ── Exercise index (lazy, cached) ─────────────────────────────────────────────
from fitness.catalog.core.resolver import build_exercise_index

_exercise_index: list | None = None

def _get_index() -> list:
    global _exercise_index
    if _exercise_index is None:
        _exercise_index = build_exercise_index()
    return _exercise_index
