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
from fitness.catalog.core.muscles import iter_muscle_documents

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
            *(getattr(ex, "search_aliases", None) or []),
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

@router.get("/fitness/search")
async def fitness_search(request: Request, q: str = "", limit: int = 12, sources: str = "wger,yuhonas"):
    return await exercises_search(request, q, limit)

@router.get("/exercises/by-group")
async def exercises_by_group(group: str = ""):
    if not group:
        return {"ok": True, "exercises": []}
    
    normalized = group.lower().replace(" ", "_")
    idx = _get_index()
    local = []
    for ex in idx:
        primary = [str(x).lower() for x in (ex.primary_muscles or [])]
        secondary = [str(x).lower() for x in (ex.secondary_muscles or [])]
        tags = [str(x).lower() for x in (ex.tags or [])]
        haystack = primary + secondary + tags + [str(ex.category or "").lower()]
        if group.lower() in haystack or normalized in haystack:
            local.append({
                "id": ex.exercise_id,
                "name_en": ex.display_name or ex.exercise_id,
                "relevance": "primary"
            })
            
    if local:
        return {"ok": True, "exercises": local}
        
    # wger Fallback
    data = await _wger_get("/exerciseinfo/", f"limit=20&muscles__name_en__icontains={group}&language=2")
    exercises = []
    for e in data.get("results") or []:
        trans = next((t for t in e.get("translations", []) if t.get("language") == 2), {})
        name = trans.get("name") or e.get("name") or ""
        if name:
            exercises.append({
                "id": e.get("uuid") or str(e.get("id")),
                "name_en": name,
                "relevance": "primary",
                "source": "wger"
            })
    return {"ok": True, "exercises": exercises}

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

@router.get("/fitness/muscles/all")
def muscles_all():
    try:
        return {"ok": True, "muscles": [doc for _doc_id, doc in iter_muscle_documents()]}
    except Exception as exc:
        logger.error(f"muscles_all: {exc}")
        raise HTTPException(500, detail=str(exc))

@router.get("/fitness/muscles/viz")
def muscles_viz():
    try:
        from fitness.catalog.core.loader import load_catalog_yaml

        taxonomy = load_catalog_yaml("muscle_index.yml") or {}
        index_muscles = taxonomy.get("muscles", {}) if isinstance(taxonomy, dict) else {}

        wger: dict = {}
        for muscle_id, info in index_muscles.items():
            if not isinstance(info, dict):
                continue
            wger_id = info.get("wger_id")
            if wger_id:
                wger[muscle_id] = wger_id

        # Region je Muskel, für Coverage/Review (keine Einzelmuskelnamen im
        # Frontend — Details bleiben Sache des Learn-Tabs). Alle Top-Level-
        # Regionsdateien (kb/muscles/*.yml) fließen ein, sortiert nach
        # aufsteigender Mitgliederzahl: kleine, spezifische Dateien
        # (lats.yml, trapezius.yml, erector_spinae.yml, hamstrings.yml, ...)
        # zuerst, große Sammel-Dateien (back.yml, legs.yml, arms.yml) zuletzt
        # als Fallback für alles, was keine spezifischere Datei schon
        # zugeordnet hat. Kein hartcodiertes Ranking — die Reihenfolge ergibt
        # sich rein aus der Struktur der Dateien selbst.
        region_files = [
            data for _doc_id, data in iter_muscle_documents()
            if data.get("kb_level") == "region" and isinstance(data.get("muscles"), list)
        ]
        region_files.sort(key=lambda d: len(d["muscles"]))

        region: dict = {}
        region_labels: dict = {}
        for data in region_files:
            word = data.get("region") or data.get("doc_id") or data.get("id", "")
            if not word:
                continue
            region_labels.setdefault(word, data.get("label_de") or data.get("display_name") or word)
            for member in data["muscles"]:
                region.setdefault(member, word)

        # Einzelmuskel-Daten bleiben fürs Learn-Tab + body-muscles-Highlighter
        # (der einzige, der pro Muskel links/rechts-Segmente braucht).
        body_muscles: dict = {}
        labels: dict = {}
        for _doc_id, data in iter_muscle_documents():
            if data.get("kb_level") != "muscle":
                continue
            muscle_id = data.get("id")
            if not muscle_id:
                continue
            viz = data.get("viz") or {}
            bm = viz.get("body_muscles")
            if bm and bm.get("ids"):
                body_muscles[muscle_id] = {"view": bm["view"], "ids": bm["ids"]}
            labels[muscle_id] = data.get("label_de") or data.get("display_name") or muscle_id
        body_muscles_slugs = {k: v["ids"][0] for k, v in body_muscles.items() if v.get("ids")}
        return {
            "wger": wger, "labels": labels, "region": region, "region_labels": region_labels,
            "body_muscles": body_muscles, "body_muscles_slugs": body_muscles_slugs,
        }
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
    try:
        for doc_id, data in iter_muscle_documents():
            if id in {doc_id, data.get("id"), data.get("catalog_id")}:
                return data
    except Exception as exc:
        logger.warning(f"catalog muscle_detail {id}: {exc}")
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
        data = yaml.safe_load(f.read_text()) or {}
        exercises = data.get("exercises") if isinstance(data, dict) else None
        ex = exercises[0] if isinstance(exercises, list) and exercises else data
        from fitness.catalog.agent.inbox_actions import delete_inbox_entry
        delete_inbox_entry(f, ex if isinstance(ex, dict) else None)
    return {"ok": True}

@router.post("/fitness/inbox/{id}/reenrich")
async def inbox_reenrich(id: str, request: Request):
    """Jagt einen bestehenden Inbox-Eintrag (lokal oder Firestore-Draft aus
    einer frueheren Import-Aera) frisch durch die AI-Provider-Kette
    Gemini -> Haiku -> Codex. Ueberschreibt den KB-Draft in kb/inbox/*.yml per
    force=True (normaler Watcher-Pfad ueberspringt sonst, sobald der Draft
    schon existiert). Bei uid+doc_id im Body wird zusaetzlich das
    Firestore-Inbox-Dokument aktualisiert, damit die Coach-UI (Firebase-Modus)
    den neuen Stand sieht.
    """
    from fitness.catalog.agent.gemini import load_gemini_key
    from fitness.catalog.api.watcher import process_inbox_file_virtual, _write_back_to_firestore_inbox
    from fitness.catalog.core.resolver import resolve_query

    body = await request.json()
    display_name = body.get("display_name") or body.get("name") or id
    exercise_id = body.get("exercise_id") or body.get("id")
    uid = body.get("uid")
    doc_id = body.get("doc_id")

    if not exercise_id:
        resolution = resolve_query(display_name)
        exercise_id = resolution.canonical_id if resolution.matched else display_name

    api_key = load_gemini_key()

    process_inbox_file_virtual(exercise_id, display_name, api_key, force=True)

    safe_name = str(exercise_id).lower().replace(" ", "_")
    from fitness.catalog.core.paths import DATA_DIR
    draft_path = DATA_DIR / "inbox" / f"inbox_{safe_name}.yml"
    if not draft_path.exists():
        raise HTTPException(502, detail="gemini_enrichment_failed")

    enriched_doc = yaml.safe_load(draft_path.read_text()) or {}
    enriched_data = (enriched_doc.get("exercises") or [{}])[0]

    if uid and doc_id:
        _write_back_to_firestore_inbox(uid, doc_id, enriched_data)

    return {"ok": True, "id": id, "exercise_id": exercise_id, "enriched": enriched_data}
