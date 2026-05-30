"""
Firestore Handler — anatomy-kb → Firestore fitness-aos

Endpoints:
  POST /api/firestore/sync                    alles
  POST /api/firestore/sync/exercises          exercises aus fitness-dev catalog
  POST /api/firestore/sync/muscles            muscles/*.yml → fitness/kb/muscles/
  POST /api/firestore/sync/anatomy            anatomy_teaching/*.yml → fitness/kb/anatomy/
  GET  /api/firestore/status                  letzter Sync-Status

?dry=1 für Dry-Run.
Credentials: ~/.env/firebase-fitness.json
"""
from __future__ import annotations

import asyncio
import json
import os
from datetime import datetime
from pathlib import Path

import yaml
from aiohttp import web
from loguru import logger

CRED_PATH = Path.home() / ".env" / "firebase-fitness.json"
FITNESS_DEV = Path(__file__).parent.parent.parent / "fitness-dev"
CATALOG_EXERCISES = FITNESS_DEV / "catalog" / "kb" / "exercises"
ANATOMY_TEACHING = FITNESS_DEV / "catalog" / "kb" / "anatomy_teaching"
MUSCLES_DIR = Path(__file__).parent.parent / "muscles"

_last: dict = {}


def _init_firebase():
    import firebase_admin
    from firebase_admin import credentials, firestore as fs
    if firebase_admin._apps:
        return fs.client()
    cred_file = Path(os.environ.get("GOOGLE_APPLICATION_CREDENTIALS", str(CRED_PATH)))
    if not cred_file.exists():
        raise FileNotFoundError(f"Service Account fehlt: {cred_file}")
    firebase_admin.initialize_app(credentials.Certificate(str(cred_file)), {"projectId": "fitness-aos"})
    return fs.client()


def _sync_exercises(db, dry_run: bool = False) -> dict:
    """fitness-dev/catalog/kb/exercises/*.yml → Firestore fitness/kb/exercises/{id}"""
    counts = {"ok": 0, "skip": 0, "error": 0}
    col = db.collection("fitness").document("kb").collection("exercises")
    for yml in sorted(CATALOG_EXERCISES.glob("*.yml")):
        try:
            doc = yaml.safe_load(yml.read_text(encoding="utf-8"))
        except Exception:
            counts["skip"] += 1
            continue
        if not isinstance(doc, dict):
            counts["skip"] += 1
            continue
        for ex in doc.get("exercises", []):
            ex_id = ex.get("exercise_id") or ex.get("id")
            if not ex_id:
                counts["skip"] += 1
                continue
            if dry_run:
                logger.info(f"[dry] exercises/{ex_id}")
                counts["ok"] += 1
                continue
            try:
                col.document(ex_id).set({k: v for k, v in ex.items() if v is not None})
                logger.info(f"exercises/{ex_id}")
                counts["ok"] += 1
            except Exception as exc:
                logger.error(f"exercises/{ex_id}: {exc}")
                counts["error"] += 1
    return counts


def _sync_muscles(db, dry_run: bool = False) -> dict:
    """anatomy-kb/muscles/*.yml → Firestore fitness/kb/muscles/{muscle_id} AND fitness/kb/muscles/{rbh_slug}"""
    from .muscle_store import load_index
    index = load_index()
    
    counts = {"ok": 0, "skip": 0, "error": 0}
    col = db.collection("fitness").document("kb").collection("muscles")
    
    # Store data by slug for merging
    slug_docs: dict[str, dict] = {}
    
    for yml in sorted(MUSCLES_DIR.glob("*.yml")):
        try:
            doc = yaml.safe_load(yml.read_text(encoding="utf-8"))
        except Exception:
            counts["skip"] += 1
            continue
        if not isinstance(doc, dict):
            counts["skip"] += 1
            continue
        muscle_id = doc.get("muscle_id", yml.stem)
        meta = index.get(muscle_id, {})
        
        if not doc.get("origin"):
            counts["skip"] += 1
            continue
            
        # Enrich with index metadata
        sync_doc = {**doc}
        for field in ["rbh_slugs", "name_de", "name_en", "latin", "wger_id", "is_front"]:
            if field in meta and (not sync_doc.get(field) or sync_doc.get(field) == ""):
                sync_doc[field] = meta[field]
        
        # 1. Sync by canonical muscle_id
        if dry_run:
            logger.info(f"[dry] muscles/{muscle_id}")
            counts["ok"] += 1
        else:
            try:
                col.document(muscle_id).set({k: v for k, v in sync_doc.items() if v is not None})
                counts["ok"] += 1
            except Exception as exc:
                logger.error(f"muscles/{muscle_id}: {exc}")
                counts["error"] += 1

        # 2. Collect for slug-based sync
        base_slugs = sync_doc.get("rbh_slugs") or []
        
        # Expand base slugs to include -left and -right variants
        expanded_slugs = []
        for s in base_slugs:
            expanded_slugs.append(s)
            expanded_slugs.append(f"{s}-left")
            expanded_slugs.append(f"{s}-right")
            
        for slug in expanded_slugs:
            if slug not in slug_docs:
                slug_docs[slug] = {
                    "display_name": sync_doc.get("name_de") or sync_doc.get("name_en") or slug.replace("-left", "").replace("-right", "").replace("-", " ").title(),
                    "latin_name": sync_doc.get("latin"),
                    "origin": sync_doc.get("origin"),
                    "insertion": sync_doc.get("insertion"),
                    "innervation": sync_doc.get("innervation"),
                    "function": sync_doc.get("function"),
                    "is_slug_group": True,
                    "muscles": [muscle_id]
                }
            else:
                # Merge logic for groups (e.g. chest = pectoralis + serratus)
                existing = slug_docs[slug]
                if muscle_id not in existing["muscles"]:
                    existing["muscles"].append(muscle_id)
                for field in ["origin", "insertion", "innervation", "function"]:
                    if sync_doc.get(field) and sync_doc[field] not in existing[field]:
                        existing[field] += f"\n\n---\n\n{sync_doc[field]}"

    # 3. Sync slug-based documents
    for slug, data in slug_docs.items():
        if dry_run:
            logger.info(f"[dry] muscles/slug:{slug}")
            counts["ok"] += 1
        else:
            try:
                col.document(slug).set(data)
                logger.info(f"muscles/slug:{slug}")
                counts["ok"] += 1
            except Exception as exc:
                logger.error(f"muscles/slug:{slug}: {exc}")
                counts["error"] += 1
                
    return counts


def _sync_anatomy(db, dry_run: bool = False) -> dict:
    """fitness-dev/catalog/kb/anatomy_teaching/*.yml → Firestore fitness/kb/anatomy/{exercise_id}"""
    counts = {"ok": 0, "skip": 0, "error": 0}
    col = db.collection("fitness").document("kb").collection("anatomy")
    for yml in sorted(ANATOMY_TEACHING.glob("*.yml")):
        try:
            doc = yaml.safe_load(yml.read_text(encoding="utf-8"))
        except Exception:
            counts["skip"] += 1
            continue
        if not isinstance(doc, dict):
            counts["skip"] += 1
            continue

        # lessons-Format: mehrere exercises pro File
        if "lessons" in doc:
            for lesson in doc.get("lessons", []):
                ex_id = lesson.get("exercise_id")
                if not ex_id:
                    counts["skip"] += 1
                    continue
                if dry_run:
                    logger.info(f"[dry] anatomy/{ex_id}")
                    counts["ok"] += 1
                    continue
                try:
                    col.document(ex_id).set(lesson)
                    logger.info(f"anatomy/{ex_id}")
                    counts["ok"] += 1
                except Exception as exc:
                    logger.error(f"anatomy/{ex_id}: {exc}")
                    counts["error"] += 1
        else:
            ex_id = doc.get("exercise_id", yml.stem)
            if dry_run:
                logger.info(f"[dry] anatomy/{ex_id}")
                counts["ok"] += 1
                continue
            try:
                col.document(ex_id).set(doc)
                logger.info(f"anatomy/{ex_id}")
                counts["ok"] += 1
            except Exception as exc:
                logger.error(f"anatomy/{ex_id}: {exc}")
                counts["error"] += 1
    return counts


def _run_sync(dry_run: bool = False) -> dict:
    db = _init_firebase()
    return {
        "exercises": _sync_exercises(db, dry_run=dry_run),
        "muscles":   _sync_muscles(db, dry_run=dry_run),
        "anatomy":   _sync_anatomy(db, dry_run=dry_run),
        "index":     _sync_index(db, dry_run=dry_run),
    }


def _sync_index(db, dry_run: bool = False) -> dict:
    """catalog-index.json → Firestore fitness/kb/index/catalog"""
    from pathlib import Path
    import json
    
    index_file = Path(__file__).parent.parent / "catalog-index.json"
    counts = {"ok": 0, "skip": 0, "error": 0}
    
    if not index_file.exists():
        logger.error(f"Index-Datei nicht gefunden: {index_file}")
        counts["error"] += 1
        return counts
        
    try:
        data = json.loads(index_file.read_text(encoding="utf-8"))
        col = db.collection("fitness").document("kb").collection("index")
        
        if dry_run:
            logger.info(f"[dry] index/catalog (v{data.get('version')})")
            counts["ok"] += 1
        else:
            col.document("catalog").set(data)
            logger.info(f"index/catalog (v{data.get('version')})")
            counts["ok"] += 1
    except Exception as exc:
        logger.error(f"index/catalog: {exc}")
        counts["error"] += 1
        
    return counts


# --- HTTP Helpers ---

def _dry(req: web.Request) -> bool:
    return req.rel_url.query.get("dry") == "1"

def _ok(data) -> web.Response:
    return web.Response(text=json.dumps(data, ensure_ascii=False), content_type="application/json")

def _err(msg: str, status: int = 500) -> web.Response:
    return web.Response(text=json.dumps({"error": msg}), content_type="application/json", status=status)


# --- Endpoints ---

async def sync_all(request: web.Request) -> web.Response:
    dry = _dry(request)
    logger.info(f"firestore sync all dry={dry}")
    try:
        result = await asyncio.get_event_loop().run_in_executor(None, lambda: _run_sync(dry_run=dry))
        _last.update({"at": datetime.now().isoformat(), "status": "ok", "dry": dry, **result})
        return _ok({"ok": True, "dry": dry, "at": _last["at"], **result})
    except Exception as exc:
        logger.error(exc)
        _last.update({"at": datetime.now().isoformat(), "status": "error", "error": str(exc)})
        return _err(str(exc))


async def sync_exercises_handler(request: web.Request) -> web.Response:
    dry = _dry(request)
    try:
        db = await asyncio.get_event_loop().run_in_executor(None, _init_firebase)
        counts = await asyncio.get_event_loop().run_in_executor(None, lambda: _sync_exercises(db, dry_run=dry))
        return _ok({"ok": True, "counts": counts, "dry": dry})
    except Exception as exc:
        logger.error(exc)
        return _err(str(exc))


async def sync_muscles_handler(request: web.Request) -> web.Response:
    dry = _dry(request)
    try:
        db = await asyncio.get_event_loop().run_in_executor(None, _init_firebase)
        counts = await asyncio.get_event_loop().run_in_executor(None, lambda: _sync_muscles(db, dry_run=dry))
        return _ok({"ok": True, "counts": counts, "dry": dry})
    except Exception as exc:
        logger.error(exc)
        return _err(str(exc))


async def sync_anatomy_handler(request: web.Request) -> web.Response:
    dry = _dry(request)
    try:
        db = await asyncio.get_event_loop().run_in_executor(None, _init_firebase)
        counts = await asyncio.get_event_loop().run_in_executor(None, lambda: _sync_anatomy(db, dry_run=dry))
        return _ok({"ok": True, "counts": counts, "dry": dry})
    except Exception as exc:
        logger.error(exc)
        return _err(str(exc))


async def sync_index_handler(request: web.Request) -> web.Response:
    dry = _dry(request)
    try:
        db = await asyncio.get_event_loop().run_in_executor(None, _init_firebase)
        counts = await asyncio.get_event_loop().run_in_executor(None, lambda: _sync_index(db, dry_run=dry))
        return _ok({"ok": True, "counts": counts, "dry": dry})
    except Exception as exc:
        logger.error(exc)
        return _err(str(exc))


async def status(request: web.Request) -> web.Response:
    return _ok({"ok": True, "last_sync": _last or None})
