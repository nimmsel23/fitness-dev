import csv
import io
import pandas as pd
import dataclasses
import asyncio
from datetime import date, datetime, timedelta
from typing import Any
from fastapi import APIRouter, Request, Query, HTTPException

from fitness.api.config import (
    RUNTIME, SESS_ROOT, _uid_from_request, _read_json, _write_json,
    _last_dates, _record_to_dict, logger
)
from db.schemas import (
    CoachFeedResponse, CoachProfilesResponse, CoachFeedbackRequest,
    CoverageDetailedResponse, CoverageAnatomyResponse, CoverageGapsResponse
)
from fitness.catalog import coverage as cov_module
from fitness.catalog.planner import build_plan
from fitness.catalog.weekly import build_weekly_coverage, resolve_week_selector
from firestore.mirror import mirror_session

router = APIRouter()

# Constants / Fallbacks
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
_ROLE_W = {"primary": 1.0, "secondary": 0.5, "stabilizer": 0.2}

def _today() -> str:
    return date.today().isoformat()

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


# ── Coach Feed & Profiles ───────────────────────────────────────────────────
@router.get("/fitness/coach/feed", response_model=CoachFeedResponse)
def coach_feed(limit: int = 100):
    if not SESS_ROOT.exists():
        return {"ok": True, "feed": []}
    
    uids = [
        d.name for d in SESS_ROOT.iterdir()
        if d.is_dir() and d.name not in ("default", "kb")
    ]
    
    feed = []
    for uid in uids:
        sess_dir = SESS_ROOT / uid / "sessions"
        if not sess_dir.exists():
            continue
        
        for f in sess_dir.glob("*.json"):
            if "history" in f.name:
                continue
            
            data = _read_json(f)
            if not data:
                continue
            
            date_str = f.name.replace(".json", "")
            day = date_str.split("__")[0]
            
            feed.append({
                "id": f"{uid}__{date_str}",
                "userId": uid,
                "date": data.get("date") or day,
                "exercises": data.get("exercises") or [],
                "effort": data.get("effort"),
                "mood": data.get("mood") or "",
                "notes": data.get("notes") or "",
                "coachFeedback": data.get("coachFeedback") or "",
                "type": "workout"
            })
            
    feed.sort(key=lambda x: x["date"], reverse=True)
    return {"ok": True, "feed": feed[:limit]}

@router.get("/fitness/coach/profiles", response_model=CoachProfilesResponse)
def coach_profiles():
    if not SESS_ROOT.exists():
        return {"ok": True, "profiles": {}}
    
    uids = [
        d.name for d in SESS_ROOT.iterdir()
        if d.is_dir() and d.name not in ("default", "kb")
    ]
    
    profiles = {}
    for uid in uids:
        sess_dir = SESS_ROOT / uid / "sessions"
        display_name = uid[:8]
        if sess_dir.exists():
            files = sorted(sess_dir.glob("*.json"), reverse=True)
            if files:
                last_sess = _read_json(files[0])
                if last_sess:
                    if last_sess.get("user_name"):
                        display_name = last_sess["user_name"]
                    elif last_sess.get("user_email"):
                        display_name = last_sess["user_email"]
        profiles[uid] = {"displayName": display_name, "uid": uid}
        
    return {"ok": True, "profiles": profiles}

@router.post("/fitness/coach/feedback")
def coach_feedback(body: CoachFeedbackRequest):
    clean_session_id = body.sessionId.replace(f"{body.userId}__", "")
    sess_file = SESS_ROOT / body.userId / "sessions" / f"{clean_session_id}.json"
    
    if not sess_file.exists():
        raise HTTPException(status_code=404, detail="session not found")
        
    data = _read_json(sess_file, {})
    data["coachFeedback"] = body.text
    data["feedbackAt"] = datetime.utcnow().isoformat() + "Z"
    _write_json(sess_file, data)
    
    # Mirror feedback to Firestore in background
    day = clean_session_id.split("__")[0]
    asyncio.get_event_loop().run_in_executor(None, mirror_session, day, data, body.userId)
    
    return {"ok": True}


# ── Plan & Blocks ────────────────────────────────────────────────────────────
@router.get("/plan/today")
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

@router.get("/blocks")
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

@router.get("/fitness/plan")
@router.post("/fitness/plan")
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
    except Exception as exc:
        logger.error(f"fitness_plan: {exc}")
        raise HTTPException(500, detail=str(exc))

@router.get("/fitness/weekly")
def fitness_weekly(week: str = "current"):
    try:
        result = build_weekly_coverage(resolve_week_selector(week))
        return {"ok": True, **result}
    except Exception as exc:
        logger.error(f"fitness_weekly {week}: {exc}")
        raise HTTPException(500, detail=str(exc))


# ── Coverage ─────────────────────────────────────────────────────────────────
@router.get("/coverage/detailed", response_model=CoverageDetailedResponse)
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

@router.get("/coverage/anatomy", response_model=CoverageAnatomyResponse)
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

@router.get("/coverage/gaps", response_model=CoverageGapsResponse)
def coverage_gaps(request: Request, days: int = Query(7, le=90, ge=1)):
    uid  = _uid_from_request(request)
    hits = _coverage_hits(uid, days)
    taxonomy = cov_module.load_muscle_taxonomy()
    gaps = [
        {"id": mid, "name_en": info.get("name_en", mid), "name_de": info.get("name_de", mid), "totalScore": 0}
        for mid, info in taxonomy.items()
        if hits.get(mid, 0) < 0.5
    ]
    return {"ok": True, "days": days, "gaps": gaps}


# ── Exports ──────────────────────────────────────────────────────────────────
@router.get("/export/csv")
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

@router.get("/export/pflichtaufgabe")
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

@router.post("/fitness/export/{kind}")
async def fitness_export(kind: str, request: Request):
    """Export session / plan / weekly / exercise_sheet / exercise_lesson → Obsidian/PDF."""
    data = await request.json()
    try:
        from fitness.catalog.agent.obsidian import (
            export_coach_sheet_note, export_teach_note,
            export_plan_note, export_weekly_report_note,
        )
    except ImportError as e:
        raise HTTPException(500, detail=f"obsidian module not available: {e}")

    if kind == "session":
        session = data.get("session") or data
        try:
            from fitness.catalog.agent.obsidian import export_session_note
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
