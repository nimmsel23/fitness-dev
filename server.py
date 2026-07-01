"""
fitness-dev FastAPI server — Prod/Tailscale Backend
Port: 9150 (läuft parallel zu server.mjs :9100, ist kein Ersatz)

Rolle:
- Prod-Backend (Tailscale-Funnel, /opt/fitness) + lokale Coach-API
- Direktimports aus fitness_agent + anatomy_kb (kein HTTP-Proxy)
- server.mjs (:9100) bleibt unverändert als Frontend-Dev-Server (Vite proxy target)

Geplant zu archivieren (NACHDEM dieser Server läuft und verifiziert ist):
- python-backend/server.py (aiohttp, Basis für diesen Server)
- catalog/fitness_agent/server.py (aiohttp, :9120, Endpoints wandern hierher)
"""
from __future__ import annotations

import asyncio
import csv
import dataclasses
import io
import json
import os
import sys
import uuid
from datetime import date, datetime, timedelta
from pathlib import Path
from typing import Any

import pandas as pd
import yaml
import uvicorn
from fastapi import FastAPI, HTTPException, Query, Request
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse
from fastapi.staticfiles import StaticFiles
from loguru import logger

# ── Sys-Path für lokale Pakete ────────────────────────────────────────────────
_HERE = Path(__file__).resolve().parent
sys.path.insert(0, str(_HERE))  # db/, firestore/, fitness_cli/, fitness_agent/, firestore_kb/

_FUEL_DEV = Path.home() / "fuel-dev"
if _FUEL_DEV.exists():
    sys.path.insert(0, str(_FUEL_DEV))

# ── DB Layer (SQLAlchemy + Alembic) ──────────────────────────────────────────
from db import SessionLocal, engine, Base
from db.models import TrainingHistory
import sqlalchemy as sa

# ── fitness_agent imports ─────────────────────────────────────────────────────
from fitness_agent.paths import runtime_root
from fitness_agent.resolver import build_exercise_index, resolve_query, find_by_id
from fitness_agent.teaching import find_lesson
from fitness_agent.planner import build_plan
from fitness_agent.weekly import build_weekly_coverage, resolve_week_selector
from fitness_agent import coverage as cov_module

# ── firestore imports ─────────────────────────────────────────────────────────
from firestore.mirror import mirror_session, mirror_journal, mirror_plan
from firestore.mirror import get_status as firestore_status
try:
    from firestore.sync import pull as firestore_pull
    _FIRESTORE_PULL_AVAILABLE = True
except ImportError:
    _FIRESTORE_PULL_AVAILABLE = False

# ── anatomy_kb imports (optional) ─────────────────────────────────────────────
try:
    sys.path.insert(0, str(_HERE / "anatomy-kb"))
    from anatomy_kb.muscle_handler import list_muscles as _anatomy_list_muscles
    from anatomy_kb.muscle_handler import get_muscle as _anatomy_get_muscle
    _ANATOMY_KB_AVAILABLE = True
except ImportError:
    _ANATOMY_KB_AVAILABLE = False

# ── Optional fuel-firestore ───────────────────────────────────────────────────
try:
    import fuel_firestore as _fuel_fs
    _FUEL_FS_AVAILABLE = True
except ImportError:
    _FUEL_FS_AVAILABLE = False

# ══════════════════════════════════════════════════════════════════════════════
# Config
# ══════════════════════════════════════════════════════════════════════════════
PORT     = int(os.environ.get("FITNESS_PYTHON_PORT", os.environ.get("FITNESS_PORT", 9150)))
HOST     = os.environ.get("FITNESS_HOST", "127.0.0.1")
RUNTIME  = runtime_root()                     # ~/.aos/fitness
SESS_ROOT = RUNTIME / "users"                 # ~/.aos/fitness/users/{uid}/sessions/
BODY_DIR  = RUNTIME / "body"
JOUR_DIR  = RUNTIME / "journal"
INBOX_DIR = _HERE / "catalog" / "kb" / "inbox"

WGER_TOKEN = os.environ.get("WGER_API_TOKEN", os.environ.get("WGER_TOKEN", "92d9ea44fc0ac065e336e9ec443a196c40c68afe"))
WGER_BASE  = os.environ.get("WGER_BASE", "http://127.0.0.1/api/v2")

_DIST_DIR  = _HERE / "dist"
_INDEX_HTML = _DIST_DIR / "index.html"

# Local habits fallback
LOCAL_HABITS_FILE = Path.home() / ".aos" / "journal" / "habits" / "definitions.json"
LOCAL_RECORDS_DIR = Path.home() / ".aos" / "journal" / "habits" / "records"

# ── SQLAlchemy — Schema via Alembic verwaltet, hier nur Verbindung prüfen ──────
# Schema-Änderungen: `python3 -m alembic revision --autogenerate -m "..."` + `upgrade head`
Base.metadata.create_all(engine)  # erstellt fehlende Tabellen bei erstem Start (Safety-Net)

# ── Exercise index (lazy, cached) ─────────────────────────────────────────────
_exercise_index: list | None = None

def _get_index() -> list:
    global _exercise_index
    if _exercise_index is None:
        _exercise_index = build_exercise_index()
    return _exercise_index

# ══════════════════════════════════════════════════════════════════════════════
# Helpers
# ══════════════════════════════════════════════════════════════════════════════
def _today() -> str:
    return date.today().isoformat()

def _read_json(p: Path, fallback=None):
    try:
        return json.loads(p.read_text())
    except Exception:
        return fallback

def _write_json(p: Path, data) -> None:
    p.parent.mkdir(parents=True, exist_ok=True)
    p.write_text(json.dumps(data, indent=2, ensure_ascii=False))

def _uid_from_request(request: Request) -> str:
    uid = request.query_params.get("uid") or request.headers.get("X-User-UID", "default")
    return uid or "default"

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
    block = session.get("block", "")
    sid   = session_id or session.get("session_id")
    with SessionLocal() as db:
        # Vorherige Einträge für diesen Tag/Session löschen (idempotent)
        if sid:
            db.execute(sa.delete(TrainingHistory).where(
                TrainingHistory.date == day,
                TrainingHistory.session_id == sid,
            ))
        else:
            db.execute(sa.delete(TrainingHistory).where(
                TrainingHistory.date == day,
                sa.or_(TrainingHistory.session_id.is_(None), TrainingHistory.session_id == ""),
            ))
        db.add_all([
            TrainingHistory(
                date              = day,
                session_id        = sid,
                workout_id        = block,
                exercise_id       = ex.get("exercise_id") or ex.get("id", ""),
                display_name      = ex.get("name") or ex.get("exercise_id") or ex.get("id", ""),
                sets              = int(ex.get("sets") or 0),
                reps              = int(ex.get("reps") or 0),
                weight            = float(ex.get("weight") or 0),
                rpe               = int(ex.get("rpe") or 0),
                done              = 1 if ex.get("done") else 0,
                notes             = ex.get("note", ""),
                completion_status = "completed" if ex.get("done") else "pending",
            )
            for ex in session.get("exercises", [])
        ])
        db.commit()

def _freeze_snapshot(session: dict) -> dict:
    """Stellt sicher dass jede Session self-contained ist (snapshot_version=1)."""
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

_ROLE_W = {"primary": 1.0, "secondary": 0.5, "stabilizer": 0.2}

def _coverage_hits(uid: str, days: int) -> dict[str, float]:
    sess_dir = SESS_ROOT / uid / "sessions"
    today = date.today()
    rows: list[tuple[str, float]] = []
    for i in range(days):
        day = (today - timedelta(days=i)).isoformat()
        sess = _read_json(sess_dir / f"{day}.json") if sess_dir.exists() else None
        for ex in (sess or {}).get("exercises", []):
            for role, muscles in (
                ("primary",    ex.get("primaryMuscles") or ex.get("primary_muscles") or []),
                ("secondary",  ex.get("secondaryMuscles") or ex.get("secondary_muscles") or []),
                ("stabilizer", ex.get("stabilizers") or []),
            ):
                w = _ROLE_W[role]
                for m in muscles:
                    rows.append((cov_module.normalize_muscle_id(m), w))
    if not rows:
        return {}
    df = pd.DataFrame(rows, columns=["muscle", "weight"])
    return df.groupby("muscle")["weight"].sum().to_dict()

_DOW_DE = ["So", "Mo", "Di", "Mi", "Do", "Fr", "Sa"]
_FALLBACK_PLAN = {
    "Mo": ("Push",      ["Incline Dumbbell Press", "Dips", "Lateral Raise", "Cable Fly", "Triceps Extension"]),
    "Di": ("Pull",      ["Pull-Up", "Row", "Lat Pulldown", "Face Pull", "Biceps Curl"]),
    "Mi": ("Legs",      ["Squat", "Romanian Deadlift", "Lunge", "Leg Curl", "Calf Raise"]),
    "Do": ("Upper",     ["Bench Press", "Row", "Overhead Press", "Pulldown", "Curl"]),
    "Fr": ("Lower",     ["Deadlift", "Split Squat", "Hip Thrust", "Leg Curl", "Calf Raise"]),
    "Sa": ("Full Body", ["Squat", "Press", "Row", "Hinge", "Carry"]),
    "So": ("Recovery",  ["Mobility", "Walk", "Core Breathing"]),
}

# ── httpx client for wger proxy ───────────────────────────────────────────────
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
        except Exception:
            return {}

    async def _wger_post(path: str, body: dict) -> dict | None:
        global _httpx_client
        if _httpx_client is None:
            _httpx_client = httpx.AsyncClient(timeout=4.0)
        url = f"{WGER_BASE}{path}"
        try:
            resp = await _httpx_client.post(url, json=body, headers={"Authorization": f"Token {WGER_TOKEN}", "Content-Type": "application/json"})
            return resp.json() if resp.is_success else None
        except Exception:
            return None

    _HTTPX_AVAILABLE = True
except ImportError:
    _HTTPX_AVAILABLE = False
    async def _wger_get(path: str, qs: str = "") -> dict: return {}
    async def _wger_post(path: str, body: dict) -> dict | None: return None

# ══════════════════════════════════════════════════════════════════════════════
# App
# ══════════════════════════════════════════════════════════════════════════════
app = FastAPI(title="fitness-dev", version="2.0.0")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_methods=["*"],
    allow_headers=["*"],
)

# ══════════════════════════════════════════════════════════════════════════════
# Health
# ══════════════════════════════════════════════════════════════════════════════
@app.get("/health")
def health():
    return {"ok": True, "port": PORT, "runtime": str(RUNTIME)}

# ══════════════════════════════════════════════════════════════════════════════
# Sessions
# ══════════════════════════════════════════════════════════════════════════════
@app.get("/session")
def session_get(request: Request, date_: str = Query(None, alias="date"), id: str | None = None):
    uid  = _uid_from_request(request)
    day  = date_ or _today()
    data = _read_json(_session_file(uid, day, id))
    return {"ok": True, "data": data}

@app.post("/session")
async def session_post(request: Request, date_: str = Query(None, alias="date"), id: str | None = None):
    uid  = _uid_from_request(request)
    day  = date_ or _today()
    body = await request.json()
    session = _freeze_snapshot({**body, "date": day, "session_id": id, "saved_at": datetime.utcnow().isoformat()})
    _write_json(_session_file(uid, day, id), session)
    _sync_session_to_db(day, session, id)
    asyncio.get_event_loop().run_in_executor(None, mirror_session, day, session, uid)
    return {"ok": True, "id": id}

@app.delete("/session")
def session_delete(request: Request, date_: str = Query(None, alias="date"), id: str | None = None):
    uid = _uid_from_request(request)
    day = date_ or _today()
    f   = _session_file(uid, day, id)
    if f.exists():
        f.unlink()
    return {"ok": True}

@app.get("/sessions")
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
        sessions.append({"id": meta_sid, "date": meta_day, "block": data.get("block"), "saved_at": data.get("saved_at")})
    return {"ok": True, "sessions": sessions}

@app.get("/session/history")
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

@app.get("/session/latest")
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

@app.delete("/session/{date_path}")
def session_delete_by_date(date_path: str, request: Request, id: str | None = None):
    uid = _uid_from_request(request)
    f   = _session_file(uid, date_path, id)
    if f.exists():
        f.unlink()
    return {"ok": True}

# ══════════════════════════════════════════════════════════════════════════════
# Journal
# ══════════════════════════════════════════════════════════════════════════════
@app.get("/journal")
def journal_get(request: Request, date_: str = Query(None, alias="date")):
    day = date_ or _today()
    f   = JOUR_DIR / f"{day}.md"
    if not f.exists():
        raise HTTPException(404)
    return {"ok": True, "content": f.read_text(), "mtime": f.stat().st_mtime}

@app.post("/journal")
async def journal_post(request: Request, date_: str = Query(None, alias="date")):
    uid     = _uid_from_request(request)
    day     = date_ or _today()
    body    = await request.json()
    content = body.get("content", "")
    JOUR_DIR.mkdir(parents=True, exist_ok=True)
    (JOUR_DIR / f"{day}.md").write_text(content)
    asyncio.get_event_loop().run_in_executor(None, mirror_journal, day, {"text": content}, uid)
    return {"ok": True}

@app.get("/journal/list")
def journal_list():
    if not JOUR_DIR.exists():
        return {"ok": True, "entries": []}
    entries = [
        {"date": f.stem, "mtime": f.stat().st_mtime}
        for f in sorted(JOUR_DIR.glob("*.md"), reverse=True)[:50]
    ]
    return {"ok": True, "entries": entries}

# ══════════════════════════════════════════════════════════════════════════════
# Body metrics
# ══════════════════════════════════════════════════════════════════════════════
@app.get("/fitness/body")
def body_get(days: int = Query(30, le=365, ge=1)):
    BODY_DIR.mkdir(parents=True, exist_ok=True)
    files = sorted(BODY_DIR.glob("????-??-??.json"), reverse=True)[:days]
    return {"ok": True, "entries": [e for f in files if (e := _read_json(f))]}

@app.post("/fitness/body")
async def body_post(request: Request):
    BODY_DIR.mkdir(parents=True, exist_ok=True)
    payload  = await request.json()
    day      = payload.get("date", _today())
    f        = BODY_DIR / f"{day}.json"
    existing = _read_json(f, {"date": day})
    _write_json(f, {**existing, **payload, "updated_at": datetime.utcnow().isoformat()})
    if payload.get("weight_kg") is not None:
        asyncio.get_event_loop().run_in_executor(None, lambda: None)  # fire-and-forget via httpx below
        asyncio.create_task(_wger_post("/weightentry/", {"date": day, "weight": str(payload["weight_kg"])}))
    return {"ok": True, "day": day}

# ══════════════════════════════════════════════════════════════════════════════
# Exercise search + detail + teaching
# ══════════════════════════════════════════════════════════════════════════════
@app.get("/exercises/search")
async def exercises_search(q: str = "", limit: int = Query(12, le=50)):
    if not q:
        return {"ok": True, "results": []}
    # Local catalog first
    result = resolve_query(q)
    if hasattr(result, "suggestions") and result.suggestions:
        return {"ok": True, "results": result.suggestions[:limit]}
    # wger fallback
    if len(q) >= 2:
        data = await _wger_get("/exerciseinfo/", f"limit={limit}&name__search={q}&language=2")
        results = []
        for e in (data.get("results") or []):
            trans = next((t for t in (e.get("translations") or []) if t.get("language") == 2), (e.get("translations") or [{}])[0])
            name = trans.get("name", "")
            if not name:
                continue
            results.append({
                "id":               e.get("uuid") or str(e.get("id", "")),
                "name":             name,
                "category":         (e.get("category") or {}).get("name", ""),
                "primaryMuscles":   [(m.get("name_en") or m.get("name", "")) for m in (e.get("muscles") or []) if m.get("name_en") or m.get("name")],
                "secondaryMuscles": [(m.get("name_en") or m.get("name", "")) for m in (e.get("muscles_secondary") or []) if m.get("name_en") or m.get("name")],
                "source": "wger",
            })
        return {"ok": True, "source": "wger", "results": results}
    return {"ok": True, "results": []}

@app.get("/fitness/exercises/all")
def exercises_all():
    idx = _get_index()
    return {"ok": True, "exercises": [_record_to_dict(r) for r in idx]}

@app.get("/fitness/resolve")
def fitness_resolve(q: str = ""):
    if not q:
        return {"ok": False, "error": "missing q"}
    result = resolve_query(q)
    data = dataclasses.asdict(result) if dataclasses.is_dataclass(result) else dict(result)
    if getattr(result, "canonical_id", None):
        rec = find_by_id(result.canonical_id, _get_index())
        if rec:
            data["exercise"] = _record_to_dict(rec)
            data["lesson"]   = find_lesson(result.canonical_id)
    return data

@app.get("/exercise/{id}")
def exercise_detail(id: str):
    ex = find_by_id(id, _get_index())
    if not ex:
        raise HTTPException(404, detail="not_found")
    result = _record_to_dict(ex)
    result["lesson"] = find_lesson(id)
    return {"ok": True, "exercise": result}

@app.get("/exercise/{id}/teaching")
def exercise_teaching(id: str):
    lesson = find_lesson(id)
    if not lesson:
        raise HTTPException(404, detail="no_lesson")
    return {"ok": True, "lesson": lesson}

# ══════════════════════════════════════════════════════════════════════════════
# Muscles (anatomy_kb direct import)
# ══════════════════════════════════════════════════════════════════════════════
@app.get("/fitness/muscles")
async def muscles_list(request: Request):
    if _ANATOMY_KB_AVAILABLE:
        # anatomy_kb handlers expect aiohttp Request — call the data layer directly
        try:
            from anatomy_kb.muscle_handler import load_muscles
            data = load_muscles()
            return data
        except Exception:
            pass
    # Fallback: catalog fitness_agent muscles YAML
    try:
        from fitness_agent.loader import load_catalog_yaml
        muscles = load_catalog_yaml("muscles/muscle_index.yml")
        return muscles
    except Exception as e:
        raise HTTPException(502, detail=str(e))

@app.get("/fitness/muscles/viz")
def muscles_viz():
    """Viz-Mapping: muscle_id → rbh slug / body_muscles ids."""
    try:
        from fitness_agent.loader import load_catalog_yaml
        from fitness_agent.yaml_utils import load_yaml
        from fitness_agent.paths import DATA_DIR as _FA_DATA

        rbh: dict = {}
        body_muscles: dict = {}
        muscles_dir = _FA_DATA / "muscles"
        for yml in sorted(muscles_dir.glob("*/*.yml")):
            data = load_yaml(yml)
            if not data:
                continue
            muscle_id = data.get("id")
            viz = data.get("viz")
            if not viz or not muscle_id:
                continue
            rbh_slug = viz.get("rbh")
            bm = viz.get("body_muscles")
            keys = [muscle_id] + [a.lower() for a in (data.get("aliases") or [])]
            for k in keys:
                if rbh_slug:
                    rbh[k] = rbh_slug
                if bm and bm.get("ids"):
                    body_muscles[k] = {"view": bm["view"], "ids": bm["ids"]}
        body_muscles_slugs = {k: v["ids"][0] for k, v in body_muscles.items() if v.get("ids")}
        return {"rbh": rbh, "body_muscles": body_muscles, "body_muscles_slugs": body_muscles_slugs}
    except Exception as e:
        raise HTTPException(500, detail=str(e))

@app.get("/fitness/muscles/{id}")
async def muscle_detail(id: str):
    if _ANATOMY_KB_AVAILABLE:
        try:
            from anatomy_kb.muscle_handler import load_muscles
            data = load_muscles()
            muscle = (data.get("muscles") or {}).get(id)
            if muscle:
                return muscle
        except Exception:
            pass
    raise HTTPException(404, detail="not_found")

# ══════════════════════════════════════════════════════════════════════════════
# Plan + Blocks + Weekly
# ══════════════════════════════════════════════════════════════════════════════
@app.get("/plan/today")
def plan_today(date_: str = Query(None, alias="date")):
    day  = date_ or _today()
    dow  = _DOW_DE[datetime.fromisoformat(day + "T12:00:00").weekday() + 1 % 7]
    plan = _read_json(RUNTIME / "plan.json")
    if plan:
        match = next((e for e in plan.get("einheiten", []) if dow in (e.get("days") or [])), None)
        if match:
            exercises = [
                u["name"]
                for a in match.get("abschnitte", [])
                for u in (a.get("übungen") or a.get("uebungen") or [])
            ]
            return {"ok": True, "suggestion": {"day": dow, "block": match["name"], "exercises": exercises}}
    block, exercises = _FALLBACK_PLAN.get(dow, ("Full Body", ["Squat", "Press", "Row"]))
    return {"ok": True, "suggestion": {"day": dow, "block": block, "exercises": exercises}}

@app.get("/blocks")
def blocks():
    defaults = [
        {"id": "push",  "label": "Push",  "muscle_groups": ["chest", "shoulders", "arms"]},
        {"id": "pull",  "label": "Pull",  "muscle_groups": ["back", "arms"]},
        {"id": "legs",  "label": "Legs",  "muscle_groups": ["quads", "hamstrings", "glutes", "calves"]},
        {"id": "upper", "label": "Upper", "muscle_groups": ["chest", "back", "shoulders", "arms"]},
        {"id": "lower", "label": "Lower", "muscle_groups": ["quads", "hamstrings", "glutes", "calves"]},
    ]
    plan = _read_json(RUNTIME / "plan.json")
    for unit in (plan or {}).get("einheiten", []):
        bid = unit.get("name", "").strip().lower().replace(" ", "_")
        if not bid:
            continue
        existing = next((b for b in defaults if b["id"] == bid), None)
        if existing:
            existing["muscle_groups"] = list(set(existing["muscle_groups"] + (unit.get("muscle_groups") or [])))
        else:
            defaults.append({"id": bid, "label": unit.get("name", bid), "muscle_groups": unit.get("muscle_groups") or []})
    return {"ok": True, "blocks": defaults}

@app.get("/fitness/plan")
@app.post("/fitness/plan")
async def fitness_plan(request: Request, template: str = "", split: str = "", day: str = "", goal: str = ""):
    params: dict = {}
    if request.method == "POST":
        try:
            params = await request.json()
        except Exception:
            params = {}
    else:
        params = {"template": template, "split": split, "day": day, "goal": goal}
    try:
        result = build_plan(params)
        return {"ok": True, "plan": _record_to_dict(result) if dataclasses.is_dataclass(result) else result}
    except Exception as e:
        raise HTTPException(500, detail=str(e))

@app.get("/fitness/weekly")
def fitness_weekly(week: str = "current"):
    try:
        result = build_weekly_coverage(resolve_week_selector(week))
        return {"ok": True, **result}
    except Exception as e:
        raise HTTPException(500, detail=str(e))

# ══════════════════════════════════════════════════════════════════════════════
# Coverage
# ══════════════════════════════════════════════════════════════════════════════
@app.get("/coverage/detailed")
def coverage_detailed(request: Request, days: int = Query(7, le=90, ge=1)):
    uid  = _uid_from_request(request)
    hits = _coverage_hits(uid, days)
    taxonomy = cov_module.load_muscle_taxonomy()
    result = []
    for mid, score in sorted(hits.items(), key=lambda x: -x[1]):
        info = taxonomy.get(mid, {})
        result.append({
            "id": mid,
            "name_en": info.get("name_en", mid),
            "name_de": info.get("name_de", mid),
            "totalScore": round(score, 2),
        })
    return {"ok": True, "days": days, "muscles": result}

@app.get("/coverage/anatomy")
def coverage_anatomy(request: Request, days: int = Query(7, le=90, ge=1)):
    uid      = _uid_from_request(request)
    sess_dir = SESS_ROOT / uid / "sessions"
    today    = date.today()
    rows: list[dict] = []
    for i in range(days):
        day  = (today - timedelta(days=i)).isoformat()
        sess = _read_json(sess_dir / f"{day}.json") if sess_dir.exists() else None
        for ex in (sess or {}).get("exercises", []):
            for role, muscles in (
                ("primary",    ex.get("primaryMuscles") or ex.get("primary_muscles") or []),
                ("secondary",  ex.get("secondaryMuscles") or ex.get("secondary_muscles") or []),
                ("stabilizer", ex.get("stabilizers") or []),
            ):
                for m in muscles:
                    rows.append({"muscle": cov_module.normalize_muscle_id(m), "name_en": m, "role": role, "w": _ROLE_W[role]})
    if not rows:
        return {"ok": True, "days": days, "muscles": []}
    df = pd.DataFrame(rows)
    pivot = df.pivot_table(index="muscle", columns="role", values="w", aggfunc="sum", fill_value=0).reset_index()
    pivot.columns.name = None
    for col in ("primary", "secondary", "stabilizer"):
        if col not in pivot.columns:
            pivot[col] = 0.0
    pivot = pivot.join(df.groupby("muscle")["name_en"].first(), on="muscle")
    pivot["primaryHits"]   = pivot["primary"].round(2)
    pivot["secondaryHits"] = pivot["secondary"].round(2)
    pivot["totalScore"]    = (pivot["primary"] + pivot["secondary"] + pivot["stabilizer"]).round(2)
    pivot = pivot.sort_values("totalScore", ascending=False)
    out = pivot[["muscle", "name_en", "primaryHits", "secondaryHits", "totalScore"]].rename(columns={"muscle": "id"}).to_dict("records")
    return {"ok": True, "days": days, "muscles": out}

@app.get("/coverage/gaps")
def coverage_gaps(request: Request, days: int = Query(7, le=90, ge=1)):
    uid      = _uid_from_request(request)
    hits     = _coverage_hits(uid, days)
    taxonomy = cov_module.load_muscle_taxonomy()
    gaps = [
        {"id": mid, "name_en": info.get("name_en", mid), "name_de": info.get("name_de", mid), "totalScore": 0}
        for mid, info in taxonomy.items()
        if hits.get(mid, 0) < 0.5
    ]
    return {"ok": True, "days": days, "gaps": gaps}

# ══════════════════════════════════════════════════════════════════════════════
# Inbox
# ══════════════════════════════════════════════════════════════════════════════
@app.get("/fitness/inbox")
def inbox_list():
    if not INBOX_DIR.exists():
        return {"ok": True, "items": []}
    items = []
    for f in sorted(INBOX_DIR.glob("inbox_*.yml")):
        try:
            data = yaml.safe_load(f.read_text()) or {}
            items.append({"id": f.stem, "file": f.name, **data})
        except Exception:
            pass
    return {"ok": True, "items": items}

@app.post("/fitness/inbox/queue")
async def inbox_queue(request: Request):
    body = await request.json()
    INBOX_DIR.mkdir(parents=True, exist_ok=True)
    item_id = f"inbox_{datetime.utcnow().strftime('%Y%m%d_%H%M%S')}_{uuid.uuid4().hex[:6]}"
    f = INBOX_DIR / f"{item_id}.yml"
    f.write_text(yaml.dump({**body, "queued_at": datetime.utcnow().isoformat()}, allow_unicode=True))
    return {"ok": True, "id": item_id}

@app.post("/fitness/inbox/{id}/approve")
def inbox_approve(id: str):
    f = INBOX_DIR / f"{id}.yml"
    if not f.exists():
        raise HTTPException(404, detail="not_found")
    data = yaml.safe_load(f.read_text()) or {}
    data["status"] = "approved"
    data["approved_at"] = datetime.utcnow().isoformat()
    f.write_text(yaml.dump(data, allow_unicode=True))
    return {"ok": True, "id": id}

@app.delete("/fitness/inbox/{id}")
def inbox_delete(id: str):
    f = INBOX_DIR / f"{id}.yml"
    if f.exists():
        f.unlink()
    return {"ok": True}

# ══════════════════════════════════════════════════════════════════════════════
# Clients
# ══════════════════════════════════════════════════════════════════════════════
@app.get("/fitness/clients")
def clients():
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

# ══════════════════════════════════════════════════════════════════════════════
# Theme
# ══════════════════════════════════════════════════════════════════════════════
_THEME_FILE = RUNTIME / "theme.json"

@app.get("/theme")
def theme_get():
    return _read_json(_THEME_FILE, {"theme": "mocha"})

@app.post("/theme")
async def theme_post(request: Request):
    body = await request.json()
    _write_json(_THEME_FILE, body)
    return {"ok": True}

# ══════════════════════════════════════════════════════════════════════════════
# Exports (CSV)
# ══════════════════════════════════════════════════════════════════════════════
@app.get("/export/csv")
def export_csv(request: Request, days: int = Query(14, le=365, ge=1), mode: str = "simple"):
    uid      = _uid_from_request(request)
    sess_dir = SESS_ROOT / uid / "sessions"
    is_det   = mode == "detailed"
    header   = ["date", "block", "location", "duration_min", "exercise", "sets_summary", "weight_max_kg", "note", "effort"] if is_det \
               else ["date", "block", "exercise", "note", "effort"]
    buf = io.StringIO()
    w   = csv.writer(buf, quoting=csv.QUOTE_ALL)
    w.writerow(header)
    for day in _last_dates(days):
        sess = _read_json(sess_dir / f"{day}.json") if sess_dir.exists() else None
        if not sess:
            continue
        block    = sess.get("block", "")
        effort   = sess.get("effort", "")
        location = sess.get("location", "")
        duration = sess.get("duration", "")
        for ex in sess.get("exercises", []):
            sets_arr = ex.get("setsArray") or []
            sets_summary = (
                " / ".join(
                    (f"{s['reps']}@{s['weight']}kg" if s.get("weight") else str(s["reps"]))
                    for s in sets_arr
                ) if sets_arr else (f"{ex.get('sets','')}×{ex.get('reps','')}" if ex.get("sets") else "")
            )
            weight_max = (
                max((float(s.get("weight") or 0) for s in sets_arr), default=0) or ""
            ) if sets_arr else ex.get("weight", "")
            if is_det:
                w.writerow([day, block, location, str(duration), ex.get("name", ""), sets_summary, str(weight_max), ex.get("note", ""), str(effort)])
            else:
                w.writerow([day, block, ex.get("name", ""), ex.get("note", ""), str(effort)])
    return {"ok": True, "filename": f"fitness-{days}d-{mode}-{_today()}.csv", "csv": buf.getvalue()}

@app.get("/export/pflichtaufgabe")
def export_pflichtaufgabe(request: Request):
    uid      = _uid_from_request(request)
    sess_dir = SESS_ROOT / uid / "sessions"
    files    = sorted(sess_dir.glob("*.json")) if sess_dir.exists() else []
    records  = []
    for nr, f in enumerate(files, 1):
        sess = _read_json(f)
        if not sess:
            continue
        try:
            y, m, d = f.stem.split("-")
        except ValueError:
            continue
        records.append({
            "Nr": nr,
            "Datum": f"{d}.{m}.{y}",
            "Trainingsart": sess.get("trainingsart") or sess.get("block", ""),
            "Ort": sess.get("location", ""),
            "Dauer (min)": sess.get("duration", ""),
        })
    if not records:
        return {"ok": True, "filename": f"trainingsprotokoll-pflichtaufgabe-{_today()}.csv", "csv": "", "count": 0}
    csv_str = pd.DataFrame(records).to_csv(index=False)
    return {"ok": True, "filename": f"trainingsprotokoll-pflichtaufgabe-{_today()}.csv", "csv": csv_str, "count": len(records)}

@app.post("/fitness/export/{kind}")
async def fitness_export(kind: str, request: Request):
    """Export session / plan / weekly / exercise_sheet / exercise_lesson → Obsidian/PDF."""
    data = await request.json()
    try:
        from fitness_agent.obsidian import (
            export_coach_sheet_note, export_teach_note,
            export_plan_note, export_weekly_report_note,
        )
    except ImportError as e:
        raise HTTPException(500, detail=f"obsidian module not available: {e}")

    if kind == "session":
        # session export via fitness_agent session markdown
        session = data.get("session") or data
        try:
            from fitness_agent.obsidian import export_session_note
            result = export_session_note(session)
        except (ImportError, AttributeError):
            result = {"note": json.dumps(session, indent=2)}
        return {"ok": True, "kind": kind, **result}

    if kind == "exercise_sheet":
        query = str(data.get("query") or data.get("exercise_id") or "").strip()
        if not query:
            raise HTTPException(400, detail="missing_query")
        result = export_coach_sheet_note(query, force=bool(data.get("force")))
        return {"ok": True, "kind": kind, **result}

    if kind == "exercise_lesson":
        exercise_id = str(data.get("exercise_id") or "").strip()
        if not exercise_id:
            raise HTTPException(400, detail="missing_exercise_id")
        result = export_teach_note(exercise_id, mode=data.get("mode", "trainer"), force=bool(data.get("force")))
        return {"ok": True, "kind": kind, **result}

    if kind == "plan":
        plan_data = data.get("plan") or build_plan(data.get("plan_options") or data)
        result = export_plan_note(plan_data, force=bool(data.get("force")))
        return {"ok": True, "kind": kind, **result}

    if kind == "weekly":
        result = export_weekly_report_note(week_selector=data.get("week_selector", "current"), force=bool(data.get("force")))
        return {"ok": True, "kind": kind, **result}

    raise HTTPException(400, detail="unknown_export_kind")

# ══════════════════════════════════════════════════════════════════════════════
# HabitSync (lokaler Fallback, Firestore-first via server.mjs-Logik)
# ══════════════════════════════════════════════════════════════════════════════
@app.get("/habitsync/habits")
def habitsync_habits():
    try:
        if LOCAL_HABITS_FILE.exists():
            defs = json.loads(LOCAL_HABITS_FILE.read_text())
            defs = [h for h in defs if not h.get("deleted")]
            today = _today()
            rec_file = LOCAL_RECORDS_DIR / f"{today}.json"
            records  = json.loads(rec_file.read_text()) if rec_file.exists() else []
            done_today = {r["uuid"] for r in records}
            return [
                {**h, "records": [{"date": today, "completion": "DONE"}] if h["uuid"] in done_today else []}
                for h in defs
            ]
    except Exception:
        pass
    return []

@app.post("/habitsync/record/{uuid_}")
def habitsync_record(uuid_: str):
    LOCAL_RECORDS_DIR.mkdir(parents=True, exist_ok=True)
    today    = _today()
    rec_file = LOCAL_RECORDS_DIR / f"{today}.json"
    records  = json.loads(rec_file.read_text()) if rec_file.exists() else []
    if not any(r["uuid"] == uuid_ for r in records):
        records.append({"uuid": uuid_, "date": today, "completion": "DONE", "ts": datetime.utcnow().isoformat()})
        rec_file.write_text(json.dumps(records, indent=2))
    return {"ok": True}

@app.post("/habitsync/add")
async def habitsync_add(request: Request):
    body  = await request.json()
    name  = (body.get("name") or "").strip()
    icon  = body.get("icon", "Activity")
    if not name:
        raise HTTPException(400, detail="missing_name")
    habit = {"uuid": str(uuid.uuid4()), "name": name, "icon": icon, "created_at": datetime.utcnow().isoformat()}
    LOCAL_HABITS_FILE.parent.mkdir(parents=True, exist_ok=True)
    defs  = json.loads(LOCAL_HABITS_FILE.read_text()) if LOCAL_HABITS_FILE.exists() else []
    defs.append(habit)
    LOCAL_HABITS_FILE.write_text(json.dumps(defs, indent=2))
    return {"ok": True, "habit": habit}

@app.delete("/habitsync/delete/{uuid_}")
def habitsync_delete(uuid_: str):
    if not LOCAL_HABITS_FILE.exists():
        raise HTTPException(404, detail="no_habits")
    defs = json.loads(LOCAL_HABITS_FILE.read_text())
    defs = [h if h.get("uuid") != uuid_ else {**h, "deleted": True} for h in defs]
    LOCAL_HABITS_FILE.write_text(json.dumps(defs, indent=2))
    return {"ok": True}

# ══════════════════════════════════════════════════════════════════════════════
# Firestore
# ══════════════════════════════════════════════════════════════════════════════
@app.get("/firestore/status")
def fs_status():
    return firestore_status()

@app.post("/firestore/sync")
def fs_sync(request: Request):
    uid      = _uid_from_request(request)
    sess_dir = SESS_ROOT / uid / "sessions"
    if not sess_dir.exists():
        return {"ok": True, "synced": 0}
    files = sorted(sess_dir.glob("*.json"), reverse=True)[:30]
    count = 0
    for f in files:
        sess = _read_json(f)
        if not sess:
            continue
        day, _ = _parse_session_fname(f.name)
        mirror_session(day, sess, uid)
        count += 1
    return {"ok": True, "synced": count}

@app.post("/firestore/pull")
def fs_pull(request: Request):
    uid = _uid_from_request(request)
    if not uid or uid == "default":
        raise HTTPException(400, detail="uid Pflicht (kein default). Via ?uid=... oder X-User-UID Header.")
    status = firestore_status()
    if not status.get("ok"):
        raise HTTPException(503, detail="Firestore nicht verbunden")
    if not _FIRESTORE_PULL_AVAILABLE:
        raise HTTPException(503, detail="firestore.sync.pull nicht verfügbar")
    sess_dir = SESS_ROOT / uid / "sessions"
    sess_dir.mkdir(parents=True, exist_ok=True)
    try:
        result = firestore_pull()
        return {"ok": True, **result}
    except Exception as e:
        raise HTTPException(500, detail=str(e))

# ══════════════════════════════════════════════════════════════════════════════
# Fitness config (snapshot der katalog-Daten)
# ══════════════════════════════════════════════════════════════════════════════
@app.get("/fitness/config")
def fitness_config():
    try:
        config = _read_json(_HERE / "catalog" / "config.yml") or {}
    except Exception:
        config = {}
    return {"ok": True, "config": config, "source": "local_yaml"}

@app.post("/fitness/config")
async def fitness_config_post(request: Request):
    body = await request.json()
    _write_json(_HERE / "catalog" / "config.yml", body)
    return {"ok": True}

# ══════════════════════════════════════════════════════════════════════════════
# Static / SPA-Fallback — muss als letztes registriert werden
# ══════════════════════════════════════════════════════════════════════════════
if (_DIST_DIR / "assets").exists():
    app.mount("/assets", StaticFiles(directory=str(_DIST_DIR / "assets")), name="assets")

@app.get("/{path:path}")
async def spa_fallback(path: str):
    if not _INDEX_HTML.exists():
        return JSONResponse({"error": "No dist/ found — run npm run build"}, status_code=503)
    from fastapi.responses import FileResponse
    # Serve actual static files if they exist
    candidate = _DIST_DIR / path
    if candidate.exists() and candidate.is_file():
        return FileResponse(str(candidate))
    return FileResponse(str(_INDEX_HTML))

# ══════════════════════════════════════════════════════════════════════════════
# Entry point
# ══════════════════════════════════════════════════════════════════════════════
if __name__ == "__main__":
    import typer

    cli = typer.Typer(add_completion=False)

    @cli.command()
    def serve(
        port: int = typer.Option(PORT, "--port", "-p"),
        host: str = typer.Option(HOST, "--host"),
        reload: bool = typer.Option(False, "--reload"),
    ):
        logger.info(f"fitness-dev FastAPI :{port}")
        uvicorn.run(
            "server:app",
            host=host,
            port=port,
            reload=reload,
            app_dir=str(_HERE),
        )

    cli()
