"""
fitness python-backend — unified aiohttp server
Port: 9150 (dev), ersetzt langfristig :9100 + :9120

Importiert fitness_agent + anatomy_kb direkt als Python-Module.
Kein wger zur Laufzeit — wger ist Katalogpflege-Werkzeug, nicht Request-Backend.
"""
from __future__ import annotations

import csv
import io
import json
import os
import sqlite3
import sys
from datetime import date, datetime, timedelta
from pathlib import Path

import asyncio

import aiohttp
import yaml
from aiohttp import web
from loguru import logger

# ── Sys-Path für lokale Pakete ────────────────────────────────────────────────
_HERE = Path(__file__).resolve().parent
_ROOT = _HERE.parent
sys.path.insert(0, str(_ROOT))
sys.path.insert(0, str(_ROOT / "anatomy-kb"))

from catalog.fitness_agent.paths import runtime_root
from catalog.fitness_agent.resolver import build_exercise_index, resolve_query, find_by_id, ExerciseRecord
from firestore.mirror import mirror_session, mirror_journal, mirror_plan, get_status as firestore_status
from catalog.fitness_agent.teaching import find_lesson
import dataclasses
from catalog.fitness_agent.planner import build_plan
from catalog.fitness_agent.weekly import build_weekly_coverage, resolve_week_selector
from catalog.fitness_agent.history import ensure_history_db, log_training_entry, read_history
from catalog.fitness_agent import coverage as cov_module

from anatomy_kb.muscle_handler import list_muscles, get_muscle
from anatomy_kb.handlers import exercise as anatomy_exercise_handler
from anatomy_kb.handlers import teaching as anatomy_teaching_handler

PORT      = int(os.environ.get("FITNESS_PORT", 9150))
HOST      = os.environ.get("FITNESS_HOST", "127.0.0.1")
RUNTIME   = runtime_root()
SESS_ROOT = RUNTIME / "users"
BODY_DIR  = RUNTIME / "body"
JOUR_DIR  = RUNTIME / "journal"

# ── SQLite (sync, läuft auf dem Thread-Pool) ──────────────────────────────────
DB_PATH = RUNTIME / "sessions" / "training_history.sqlite"
DB_PATH.parent.mkdir(parents=True, exist_ok=True)
_db = sqlite3.connect(str(DB_PATH), check_same_thread=False)
_db.executescript("""
  CREATE TABLE IF NOT EXISTS training_history (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    date TEXT NOT NULL,
    workout_id TEXT NOT NULL,
    exercise_id TEXT NOT NULL,
    display_name TEXT NOT NULL,
    sets INTEGER NOT NULL DEFAULT 0,
    reps INTEGER NOT NULL DEFAULT 0,
    weight REAL NOT NULL DEFAULT 0,
    rpe INTEGER NOT NULL DEFAULT 0,
    done INTEGER NOT NULL DEFAULT 0,
    notes TEXT NOT NULL DEFAULT '',
    completion_status TEXT NOT NULL DEFAULT 'completed'
  );
  CREATE INDEX IF NOT EXISTS idx_th_exercise_date
    ON training_history(exercise_id, date DESC, id DESC);
""")

def _sync_session_to_db(day: str, session: dict) -> None:
    block = session.get("block", "")
    with _db:
        _db.execute("DELETE FROM training_history WHERE date = ?", (day,))
        for ex in session.get("exercises", []):
            _db.execute(
                """INSERT INTO training_history
                   (date,workout_id,exercise_id,display_name,sets,reps,weight,rpe,done,notes,completion_status)
                   VALUES (?,?,?,?,?,?,?,?,?,?,?)""",
                (
                    day, block,
                    ex.get("exercise_id") or ex.get("id", ""),
                    ex.get("name") or ex.get("exercise_id") or ex.get("id", ""),
                    int(ex.get("sets") or 0),
                    int(ex.get("reps") or 0),
                    float(ex.get("weight") or 0),
                    int(ex.get("rpe") or 0),
                    1 if ex.get("done") else 0,
                    ex.get("note", ""),
                    "completed" if ex.get("done") else "pending",
                ),
            )

# ── Helpers ───────────────────────────────────────────────────────────────────
def _today() -> str:
    return date.today().isoformat()

def _session_file(uid: str, day: str, sid: str | None) -> Path:
    fname = f"{day}__{sid}.json" if sid else f"{day}.json"
    return SESS_ROOT / uid / "sessions" / fname

def _parse_session_fname(fname: str) -> tuple[str, str | None]:
    base = fname.removesuffix(".json")
    parts = base.split("__", 1)
    return parts[0], parts[1] if len(parts) > 1 else None

def _read_json(p: Path, fallback=None):
    try:
        return json.loads(p.read_text())
    except Exception:
        return fallback

def _write_json(p: Path, data) -> None:
    p.parent.mkdir(parents=True, exist_ok=True)
    p.write_text(json.dumps(data, indent=2, ensure_ascii=False))

def _uid(req: web.Request) -> str:
    return req.rel_url.query.get("uid") or req.headers.get("X-User-UID", "default")

def _json(data, status=200) -> web.Response:
    return web.Response(
        text=json.dumps(data, ensure_ascii=False),
        status=status,
        content_type="application/json",
    )

# ── CORS middleware ───────────────────────────────────────────────────────────
@web.middleware
async def cors(req: web.Request, handler):
    if req.method == "OPTIONS":
        return web.Response(headers={
            "Access-Control-Allow-Origin": "*",
            "Access-Control-Allow-Methods": "GET,POST,DELETE,OPTIONS",
            "Access-Control-Allow-Headers": "Content-Type,X-User-UID",
        })
    resp = await handler(req)
    resp.headers["Access-Control-Allow-Origin"] = "*"
    return resp

# ═════════════════════════════════════════════════════════════════════════════
# Health
# ═════════════════════════════════════════════════════════════════════════════
async def handle_health(req: web.Request) -> web.Response:
    return _json({"ok": True, "port": PORT, "runtime": str(RUNTIME)})

# ═════════════════════════════════════════════════════════════════════════════
# Sessions
# ═════════════════════════════════════════════════════════════════════════════
async def handle_session_get(req: web.Request) -> web.Response:
    uid  = _uid(req)
    day  = req.rel_url.query.get("date", _today())
    sid  = req.rel_url.query.get("id")
    data = _read_json(_session_file(uid, day, sid))
    return _json({"ok": True, "data": data})

async def handle_session_post(req: web.Request) -> web.Response:
    uid  = _uid(req)
    day  = req.rel_url.query.get("date", _today())
    sid  = req.rel_url.query.get("id")
    body = await req.json()
    session = {**body, "date": day, "session_id": sid, "saved_at": datetime.utcnow().isoformat()}
    _write_json(_session_file(uid, day, sid), session)
    _sync_session_to_db(day, session)
    loop = asyncio.get_event_loop()
    loop.run_in_executor(None, mirror_session, day, session, uid)
    return _json({"ok": True, "id": sid})

async def handle_session_delete(req: web.Request) -> web.Response:
    uid = _uid(req)
    day = req.rel_url.query.get("date", _today())
    sid = req.rel_url.query.get("id")
    f   = _session_file(uid, day, sid)
    if f.exists():
        f.unlink()
    return _json({"ok": True})

async def handle_sessions_list(req: web.Request) -> web.Response:
    uid = _uid(req)
    day = req.rel_url.query.get("date", _today())
    d   = SESS_ROOT / uid / "sessions"
    if not d.exists():
        return _json({"ok": True, "sessions": []})
    sessions = []
    for f in sorted(d.glob(f"{day}*.json")):
        meta_day, meta_sid = _parse_session_fname(f.name)
        data = _read_json(f, {})
        sessions.append({
            "id": meta_sid, "date": meta_day,
            "block": data.get("block"), "saved_at": data.get("saved_at"),
        })
    return _json({"ok": True, "sessions": sessions})

async def handle_session_history(req: web.Request) -> web.Response:
    uid   = _uid(req)
    limit = int(req.rel_url.query.get("limit", 10))
    d     = SESS_ROOT / uid / "sessions"
    if not d.exists():
        return _json({"ok": True, "sessions": []})
    files = sorted(d.glob("*.json"), reverse=True)[:limit]
    out   = []
    for f in files:
        meta_day, meta_sid = _parse_session_fname(f.name)
        out.append({"date": meta_day, "id": meta_sid, **(_read_json(f) or {})})
    return _json({"ok": True, "sessions": out})

async def handle_session_latest(req: web.Request) -> web.Response:
    uid = _uid(req)
    d   = SESS_ROOT / uid / "sessions"
    if not d.exists():
        return _json({"ok": False}, 404)
    files = sorted(d.glob("*.json"), reverse=True)
    if not files:
        return _json({"ok": False}, 404)
    data = _read_json(files[0])
    day, _ = _parse_session_fname(files[0].name)
    return _json({"ok": True, "session": {"date": day, "data": data}})

# ═════════════════════════════════════════════════════════════════════════════
# Journal
# ═════════════════════════════════════════════════════════════════════════════
async def handle_journal_get(req: web.Request) -> web.Response:
    day = req.rel_url.query.get("date", _today())
    f   = JOUR_DIR / f"{day}.md"
    if not f.exists():
        return _json({"ok": False}, 404)
    return _json({"ok": True, "content": f.read_text(), "mtime": f.stat().st_mtime})

async def handle_journal_post(req: web.Request) -> web.Response:
    day     = req.rel_url.query.get("date", _today())
    body    = await req.json()
    content = body.get("content", "")
    JOUR_DIR.mkdir(parents=True, exist_ok=True)
    (JOUR_DIR / f"{day}.md").write_text(content)
    await mirror_journal(day, {"text": content}, uid)
    return _json({"ok": True})

async def handle_journal_list(req: web.Request) -> web.Response:
    if not JOUR_DIR.exists():
        return _json({"ok": True, "entries": []})
    entries = [
        {"date": f.stem, "mtime": f.stat().st_mtime}
        for f in sorted(JOUR_DIR.glob("*.md"), reverse=True)[:50]
    ]
    return _json({"ok": True, "entries": entries})

# ═════════════════════════════════════════════════════════════════════════════
# Body metrics
# ═════════════════════════════════════════════════════════════════════════════
async def handle_body_get(req: web.Request) -> web.Response:
    days   = min(365, int(req.rel_url.query.get("days", 30)))
    BODY_DIR.mkdir(parents=True, exist_ok=True)
    files  = sorted(BODY_DIR.glob("????-??-??.json"), reverse=True)[:days]
    return _json({"ok": True, "entries": [_read_json(f) for f in files if _read_json(f)]})

async def handle_body_post(req: web.Request) -> web.Response:
    BODY_DIR.mkdir(parents=True, exist_ok=True)
    payload  = await req.json()
    day      = payload.get("date", _today())
    f        = BODY_DIR / f"{day}.json"
    existing = _read_json(f, {"date": day})
    _write_json(f, {**existing, **payload, "updated_at": datetime.utcnow().isoformat()})
    return _json({"ok": True, "day": day})

# ═════════════════════════════════════════════════════════════════════════════
# Exports (CSV)
# ═════════════════════════════════════════════════════════════════════════════
def _last_dates(n: int) -> list[str]:
    today = date.today()
    return [(today - timedelta(days=i)).isoformat() for i in range(n - 1, -1, -1)]

async def handle_export_csv(req: web.Request) -> web.Response:
    uid      = _uid(req)
    days     = min(365, max(1, int(req.rel_url.query.get("days", 14))))
    sess_dir = SESS_ROOT / uid / "sessions"
    buf      = io.StringIO()
    w        = csv.writer(buf, quoting=csv.QUOTE_ALL)
    w.writerow(["date","block","location","duration_min","exercise","hit","sets","reps","weight","note","effort"])
    for day in _last_dates(days):
        sess = _read_json(sess_dir / f"{day}.json") if sess_dir.exists() else None
        if not sess:
            continue
        block    = sess.get("block", "")
        effort   = sess.get("effort", "")
        location = sess.get("location", "")
        duration = sess.get("duration", "")
        for ex in sess.get("exercises", []):
            is_hit = ex.get("isHIT", False)
            w.writerow([
                day, block, location, str(duration),
                ex.get("name", ""), "1" if is_hit else "",
                "" if is_hit else str(ex.get("sets", "")),
                "" if is_hit else str(ex.get("reps", "")),
                str(ex.get("weight", "")),
                ex.get("note", ""), str(effort),
            ])
    return _json({"ok": True, "filename": f"fitness-{days}d-{_today()}.csv", "csv": buf.getvalue()})

async def handle_export_pflichtaufgabe(req: web.Request) -> web.Response:
    uid      = _uid(req)
    sess_dir = SESS_ROOT / uid / "sessions"
    buf      = io.StringIO()
    w        = csv.writer(buf, quoting=csv.QUOTE_ALL)
    w.writerow(["Nr","Datum","Trainingsart","Ort","Dauer (min)"])
    files    = sorted(sess_dir.glob("*.json")) if sess_dir.exists() else []
    for nr, f in enumerate(files, 1):
        sess = _read_json(f)
        if not sess:
            continue
        y, m, d = f.stem.split("-")
        w.writerow([
            str(nr), f"{d}.{m}.{y}",
            sess.get("trainingsart") or sess.get("block", ""),
            sess.get("location", ""),
            str(sess.get("duration", "")),
        ])
    return _json({"ok": True, "filename": f"trainingsprotokoll-{_today()}.csv", "csv": buf.getvalue(), "count": len(files)})

# ═════════════════════════════════════════════════════════════════════════════
# Exercises (via fitness_agent)
# ═════════════════════════════════════════════════════════════════════════════
_exercise_index: list | None = None

def _get_index() -> list:
    global _exercise_index
    if _exercise_index is None:
        _exercise_index = build_exercise_index()
    return _exercise_index

def _record_to_dict(r) -> dict:
    return dataclasses.asdict(r) if dataclasses.is_dataclass(r) else dict(r)

async def handle_exercises_search(req: web.Request) -> web.Response:
    q     = req.rel_url.query.get("q", "")
    limit = min(int(req.rel_url.query.get("limit", 12)), 50)
    if not q:
        return _json({"ok": True, "results": []})
    result = resolve_query(q)
    hits   = result.suggestions[:limit] if hasattr(result, "suggestions") else []
    return _json({"ok": True, "results": hits})

async def handle_exercises_all(req: web.Request) -> web.Response:
    idx = _get_index()
    return _json({"ok": True, "exercises": [_record_to_dict(r) for r in idx]})

async def handle_exercise_detail(req: web.Request) -> web.Response:
    ex_id = req.match_info["id"]
    ex    = find_by_id(ex_id, _get_index())
    if not ex:
        return _json({"ok": False, "error": "not_found"}, 404)
    return _json({"ok": True, "exercise": _record_to_dict(ex)})

async def handle_exercise_teaching(req: web.Request) -> web.Response:
    ex_id  = req.match_info["id"]
    lesson = find_lesson(ex_id)
    if not lesson:
        return _json({"ok": False, "error": "no_lesson"}, 404)
    return _json({"ok": True, "lesson": lesson})

# ═════════════════════════════════════════════════════════════════════════════
# Muscles (via anatomy_kb)
# ═════════════════════════════════════════════════════════════════════════════
async def handle_muscles(req: web.Request) -> web.Response:
    return await list_muscles(req)

async def handle_muscle_detail(req: web.Request) -> web.Response:
    return await get_muscle(req)

# ═════════════════════════════════════════════════════════════════════════════
# Plan + Blocks
# ═════════════════════════════════════════════════════════════════════════════
_DOW_DE = ["So","Mo","Di","Mi","Do","Fr","Sa"]
_FALLBACK = {
    "Mo": ("Push",      ["Incline Dumbbell Press","Dips","Lateral Raise","Cable Fly","Triceps Extension"]),
    "Di": ("Pull",      ["Pull-Up","Row","Lat Pulldown","Face Pull","Biceps Curl"]),
    "Mi": ("Legs",      ["Squat","Romanian Deadlift","Lunge","Leg Curl","Calf Raise"]),
    "Do": ("Upper",     ["Bench Press","Row","Overhead Press","Pulldown","Curl"]),
    "Fr": ("Lower",     ["Deadlift","Split Squat","Hip Thrust","Leg Curl","Calf Raise"]),
    "Sa": ("Full Body", ["Squat","Press","Row","Hinge","Carry"]),
    "So": ("Recovery",  ["Mobility","Walk","Core Breathing"]),
}

async def handle_plan_today(req: web.Request) -> web.Response:
    day  = req.rel_url.query.get("date", _today())
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
            return _json({"ok": True, "suggestion": {"day": dow, "block": match["name"], "exercises": exercises}})
    block, exercises = _FALLBACK.get(dow, ("Full Body", ["Squat","Press","Row"]))
    return _json({"ok": True, "suggestion": {"day": dow, "block": block, "exercises": exercises}})

async def handle_blocks(req: web.Request) -> web.Response:
    defaults = [
        {"id": "push",  "label": "Push",  "muscle_groups": ["chest","shoulders","arms"]},
        {"id": "pull",  "label": "Pull",  "muscle_groups": ["back","arms"]},
        {"id": "legs",  "label": "Legs",  "muscle_groups": ["quads","hamstrings","glutes","calves"]},
        {"id": "upper", "label": "Upper", "muscle_groups": ["chest","back","shoulders","arms"]},
        {"id": "lower", "label": "Lower", "muscle_groups": ["quads","hamstrings","glutes","calves"]},
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
    return _json({"ok": True, "blocks": defaults})

async def handle_plan_generate(req: web.Request) -> web.Response:
    params = await req.json() if req.can_read_body else {}
    result = build_plan(params)
    return _json({"ok": True, "plan": result})

async def handle_weekly(req: web.Request) -> web.Response:
    selector = req.rel_url.query.get("week", "current")
    try:
        result = build_weekly_coverage(resolve_week_selector(selector))
        return _json({"ok": True, **result})
    except Exception as e:
        return _json({"ok": False, "error": str(e)}, 500)

# ═════════════════════════════════════════════════════════════════════════════
# Inbox
# ═════════════════════════════════════════════════════════════════════════════
_INBOX_DIR = _ROOT / "catalog" / "kb" / "inbox"

async def handle_inbox_list(req: web.Request) -> web.Response:
    if not _INBOX_DIR.exists():
        return _json({"ok": True, "items": []})
    items = []
    for f in sorted(_INBOX_DIR.glob("inbox_*.yml")):
        try:
            data = yaml.safe_load(f.read_text()) or {}
            items.append({"id": f.stem, "file": f.name, **data})
        except Exception:
            pass
    return _json({"ok": True, "items": items})

async def handle_inbox_approve(req: web.Request) -> web.Response:
    item_id = req.match_info["id"]
    f       = _INBOX_DIR / f"{item_id}.yml"
    if not f.exists():
        return _json({"ok": False, "error": "not_found"}, 404)
    data    = yaml.safe_load(f.read_text()) or {}
    data["status"] = "approved"
    data["approved_at"] = datetime.utcnow().isoformat()
    f.write_text(yaml.dump(data, allow_unicode=True))
    return _json({"ok": True, "id": item_id})

async def handle_inbox_delete(req: web.Request) -> web.Response:
    item_id = req.match_info["id"]
    f       = _INBOX_DIR / f"{item_id}.yml"
    if f.exists():
        f.unlink()
    return _json({"ok": True})


# ═════════════════════════════════════════════════════════════════════════════
# Clients
# ═════════════════════════════════════════════════════════════════════════════
async def handle_clients(req: web.Request) -> web.Response:
    if not SESS_ROOT.exists():
        return _json({"ok": True, "clients": []})
    clients = []
    for uid_dir in SESS_ROOT.iterdir():
        if not uid_dir.is_dir() or uid_dir.name in ("default", "kb"):
            continue
        name = uid_dir.name[:8]
        sess_dir = uid_dir / "sessions"
        if sess_dir.exists():
            files = sorted(sess_dir.glob("*.json"), reverse=True)
            if files:
                last = _read_json(files[0])
                if last and last.get("user_name"):
                    name = last["user_name"]
        clients.append({"uid": uid_dir.name, "name": name})
    return _json({"ok": True, "clients": clients})

# ═════════════════════════════════════════════════════════════════════════════
# App factory
# ═════════════════════════════════════════════════════════════════════════════
def create_app() -> web.Application:
    app = web.Application(middlewares=[cors])
    app.router.add_route("GET",    "/health",                    handle_health)

    # Sessions
    app.router.add_route("GET",    "/session",                   handle_session_get)
    app.router.add_route("POST",   "/session",                   handle_session_post)
    app.router.add_route("DELETE", "/session",                   handle_session_delete)
    app.router.add_route("GET",    "/sessions",                  handle_sessions_list)
    app.router.add_route("GET",    "/session/history",           handle_session_history)
    app.router.add_route("GET",    "/session/latest",            handle_session_latest)

    # Journal
    app.router.add_route("GET",    "/journal",                   handle_journal_get)
    app.router.add_route("POST",   "/journal",                   handle_journal_post)
    app.router.add_route("GET",    "/journal/list",              handle_journal_list)

    # Body
    app.router.add_route("GET",    "/fitness/body",              handle_body_get)
    app.router.add_route("POST",   "/fitness/body",              handle_body_post)

    # Exports
    app.router.add_route("GET",    "/export/csv",                handle_export_csv)
    app.router.add_route("GET",    "/export/pflichtaufgabe",     handle_export_pflichtaufgabe)

    # Exercises
    app.router.add_route("GET",    "/exercises/search",          handle_exercises_search)
    app.router.add_route("GET",    "/fitness/exercises/all",     handle_exercises_all)
    app.router.add_route("GET",    "/exercise/{id}",             handle_exercise_detail)
    app.router.add_route("GET",    "/exercise/{id}/teaching",    handle_exercise_teaching)

    # Muscles
    app.router.add_route("GET",    "/fitness/muscles",           handle_muscles)
    app.router.add_route("GET",    "/fitness/muscles/{id}",      handle_muscle_detail)

    # Plan + Blocks
    app.router.add_route("GET",    "/plan/today",                handle_plan_today)
    app.router.add_route("GET",    "/blocks",                    handle_blocks)
    app.router.add_route("GET",    "/fitness/plan",              handle_plan_generate)
    app.router.add_route("POST",   "/fitness/plan",              handle_plan_generate)
    app.router.add_route("GET",    "/fitness/weekly",            handle_weekly)

    # Inbox
    app.router.add_route("GET",    "/fitness/inbox",             handle_inbox_list)
    app.router.add_route("POST",   "/fitness/inbox/{id}/approve",handle_inbox_approve)
    app.router.add_route("DELETE", "/fitness/inbox/{id}",        handle_inbox_delete)

    # Firestore
    app.router.add_route("GET",    "/firestore/status",
                         lambda r: _json(firestore_status()))

    # Clients
    app.router.add_route("GET",    "/fitness/clients",           handle_clients)

    return app


if __name__ == "__main__":
    import typer

    cli = typer.Typer(add_completion=False)

    @cli.command()
    def serve(
        port: int = typer.Option(PORT, "--port", "-p"),
        host: str = typer.Option(HOST, "--host"),
    ):
        logger.info(f"fitness-backend :{port}")
        web.run_app(create_app(), host=host, port=port, access_log=None)

    cli()
