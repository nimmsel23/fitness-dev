import yaml
import uuid
from datetime import datetime
from fastapi import APIRouter, Request, Query, HTTPException
from typing import Any

from fitness.api.config import (
    INBOX_DIR, _uid_from_request, _read_json, _record_to_dict, _get_index,
    _wger_get, logger
)
from db.schemas import ExerciseSearchResponse, MusclesResponse

# ── catalog imports ─────────────────────────────────────────────────────
from fitness.catalog.core.resolver import resolve_query, find_by_id
from fitness.catalog.agent.teaching import find_lesson

# ── Optional anatomy_kb ───────────────────────────────────────────────────────
import sys
from pathlib import Path
_ROOT = Path(__file__).resolve().parent.parent.parent.parent
_ANATOMY_KB_PATH = _ROOT / "anatomy-kb"
if _ANATOMY_KB_PATH.exists():
    sys.path.insert(0, str(_ANATOMY_KB_PATH))
    _ANATOMY_KB_AVAILABLE = True
else:
    _ANATOMY_KB_AVAILABLE = False

router = APIRouter()

@router.get("/exercises/search", response_model=ExerciseSearchResponse)
async def exercises_search(request: Request, q: str = "", limit: int = 12):
    limit = min(limit, 50)
    if len(q) < 1:
        return {"ok": True, "results": [], "total": 0}

    # 1. Lokale Catalog-Suche
    idx = _get_index()
    results = []
    
    # Simple substring search over index
    qn = q.lower()
    for ex in idx:
        fields = [
            ex.exercise_id or "",
            ex.display_name or "",
            ex.german or "",
            *(ex.aliases or []),
            *(ex.tags or []),
        ]
        if any(qn in f.lower() for f in fields if f):
            results.append({
                "exercise_id":      ex.exercise_id,
                "display_name":     ex.display_name or ex.exercise_id,
                "primary_muscles":   ex.primary_muscles or [],
                "secondary_muscles": ex.secondary_muscles or [],
                "source":            "expert" if "expert" in (ex.tags or []) else "local",
            })
            
    if results:
        return {"ok": True, "results": results[:limit], "total": len(results)}

    # 2. wger Fallback
    if len(q) >= 2:
        data = await _wger_get("/exerciseinfo/", f"limit={limit}&name__search={q}&language=2")
        results = []
        for e in data.get("results") or []:
            trans = next((t for t in e.get("translations", []) if t.get("language") == 2), {})
            name = trans.get("name") or e.get("name") or ""
            if not name:
                continue
            results.append({
                "exercise_id":       e.get("uuid") or str(e.get("id")),
                "display_name":      name,
                "category":          (e.get("category") or {}).get("name", ""),
                "primaryMuscles":    [(m.get("name_en") or m.get("name", "")) for m in (e.get("muscles") or []) if m.get("name_en") or m.get("name")],
                "secondaryMuscles":  [(m.get("name_en") or m.get("name", "")) for m in (e.get("muscles_secondary") or []) if m.get("name_en") or m.get("name")],
                "source":            "wger",
            })
        return {"ok": True, "results": results, "total": len(results)}
        
    return {"ok": True, "results": []}

@router.get("/fitness/exercises/all")
def exercises_all():
    idx = _get_index()
    return {"ok": True, "exercises": [_record_to_dict(r) for r in idx]}

@router.get("/fitness/resolve")
def fitness_resolve(q: str = ""):
    if not q:
        return {"ok": False, "error": "missing q"}
    result = resolve_query(q)
    data = dataclasses.asdict(result) if hasattr(result, "canonical_id") else dict(result)
    if getattr(result, "canonical_id", None):
        rec = find_by_id(result.canonical_id, _get_index())
        if rec:
            data["exercise"] = _record_to_dict(rec)
            data["lesson"]   = find_lesson(result.canonical_id)
    return data

@router.get("/exercise/{id}")
def exercise_detail(id: str):
    ex = find_by_id(id, _get_index())
    if not ex:
        raise HTTPException(404, detail="not_found")
    result = _record_to_dict(ex)
    result["lesson"] = find_lesson(id)
    return {"ok": True, "exercise": result}

@router.get("/exercise/{id}/teaching")
def exercise_teaching(id: str):
    lesson = find_lesson(id)
    if not lesson:
        raise HTTPException(404, detail="no_lesson")
    return {"ok": True, "lesson": lesson}

@router.get("/fitness/muscles")
async def muscles_list():
    if _ANATOMY_KB_AVAILABLE:
        try:
            from anatomy_kb.muscle_handler import load_muscles
            return load_muscles()
        except Exception as exc:
            logger.warning(f"anatomy_kb.load_muscles failed, fallback: {exc}")
    try:
        from fitness.catalog.core.loader import load_catalog_yaml
        muscles = load_catalog_yaml("muscles/muscle_index.yml")
        return muscles
    except Exception as exc:
        logger.error(f"muscles_list: {exc}")
        raise HTTPException(502, detail=str(exc))

@router.get("/fitness/muscles/viz")
def muscles_viz():
    try:
        from fitness.catalog.core.loader import load_catalog_yaml
        from fitness.catalog.core.yaml_utils import load_yaml
        from fitness.catalog.core.paths import DATA_DIR as _FA_DATA

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
    except Exception as exc:
        logger.error(f"muscles_viz: {exc}")
        raise HTTPException(500, detail=str(exc))

@router.get("/fitness/muscles/{id}")
async def muscle_detail_anatomy(id: str):
    if _ANATOMY_KB_AVAILABLE:
        try:
            from anatomy_kb.muscle_handler import load_muscles
            data = load_muscles()
            muscle = (data.get("muscles") or {}).get(id)
            if muscle:
                return muscle
        except Exception as exc:
            logger.warning(f"muscle_detail {id}: {exc}")
    raise HTTPException(404, detail="not_found")

@router.get("/fitness/inbox")
def inbox_list():
    if not INBOX_DIR.exists():
        return {"ok": True, "items": []}
    items = []
    for f in sorted(INBOX_DIR.glob("inbox_*.yml")):
        try:
            data = yaml.safe_load(f.read_text()) or {}
            items.append({"id": f.stem, "file": f.name, **data})
        except Exception as exc:
            logger.warning(f"inbox_list {f.name}: {exc}")
    return {"ok": True, "items": items}

@router.post("/fitness/inbox/queue")
async def inbox_queue(request: Request):
    body = await request.json()
    INBOX_DIR.mkdir(parents=True, exist_ok=True)
    item_id = f"inbox_{datetime.utcnow().strftime('%Y%m%d_%H%M%S')}_{uuid.uuid4().hex[:6]}"
    f = INBOX_DIR / f"{item_id}.yml"
    f.write_text(yaml.dump({**body, "queued_at": datetime.utcnow().isoformat()}, allow_unicode=True))
    return {"ok": True, "id": item_id}

@router.post("/fitness/inbox/{id}/approve")
def inbox_approve(id: str):
    f = INBOX_DIR / f"{id}.yml"
    if not f.exists():
        raise HTTPException(404, detail="not_found")
    data = yaml.safe_load(f.read_text()) or {}
    data["status"] = "approved"
    data["approved_at"] = datetime.utcnow().isoformat()
    f.write_text(yaml.dump(data, allow_unicode=True))
    return {"ok": True, "id": id}

@router.delete("/fitness/inbox/{id}")
def inbox_delete(id: str):
    f = INBOX_DIR / f"{id}.yml"
    if f.exists():
        f.unlink()
    return {"ok": True}
