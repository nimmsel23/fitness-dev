"""
Firestore Handler — catalog/kb/ → Firestore fitness/kb/

Endpoints (via server.py):
  POST /api/firestore/sync            exercises + anatomy
  POST /api/firestore/sync/exercises  nur exercises
  POST /api/firestore/sync/anatomy    nur anatomy
  GET  /api/firestore/status          letzter Sync-Status

?dry=1 für Dry-Run (kein Schreiben, nur Logging).

Credentials: ~/.env/firebase-fitness.json
Oder: GOOGLE_APPLICATION_CREDENTIALS env var
"""
from __future__ import annotations

import asyncio
from datetime import datetime

from aiohttp import web
from loguru import logger

from fitness_agent.kb_sync import _init_firebase, run_kb_sync, sync_anatomy, sync_exercises

_last: dict = {}


def _dry(req: web.Request) -> bool:
    return req.rel_url.query.get("dry") == "1"


def _ok(data) -> web.Response:
    import json
    return web.Response(text=json.dumps(data, ensure_ascii=False), content_type="application/json")


def _err(msg: str, status: int = 500) -> web.Response:
    import json
    return web.Response(text=json.dumps({"error": msg}), content_type="application/json", status=status)


async def sync_all(request: web.Request) -> web.Response:
    dry = _dry(request)
    logger.info(f"firestore sync all dry={dry}")
    try:
        loop = asyncio.get_event_loop()
        await loop.run_in_executor(None, lambda: run_kb_sync(dry_run=dry))
        _last.update({"at": datetime.now().isoformat(), "status": "ok", "dry": dry})
        return _ok({"ok": True, "dry": dry, "at": _last["at"]})
    except Exception as exc:
        logger.error(exc)
        _last.update({"at": datetime.now().isoformat(), "status": "error", "error": str(exc)})
        return _err(str(exc))


async def sync_exercises_handler(request: web.Request) -> web.Response:
    dry = _dry(request)
    try:
        loop = asyncio.get_event_loop()
        db = await loop.run_in_executor(None, _init_firebase)
        counts = await loop.run_in_executor(None, lambda: sync_exercises(db, dry_run=dry))
        return _ok({"ok": True, "counts": counts, "dry": dry})
    except Exception as exc:
        logger.error(exc)
        return _err(str(exc))


async def sync_anatomy_handler(request: web.Request) -> web.Response:
    dry = _dry(request)
    try:
        loop = asyncio.get_event_loop()
        db = await loop.run_in_executor(None, _init_firebase)
        counts = await loop.run_in_executor(None, lambda: sync_anatomy(db, dry_run=dry))
        return _ok({"ok": True, "counts": counts, "dry": dry})
    except Exception as exc:
        logger.error(exc)
        return _err(str(exc))


async def status(request: web.Request) -> web.Response:
    return _ok({"ok": True, "last_sync": _last or None})
