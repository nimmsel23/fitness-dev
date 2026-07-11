"""
anatomy-kb — Knowledge API Server  :9200

Routing-Layer. Businesslogik liegt in:
  anatomy_kb/handlers.py   — HTTP-Handler
  fitness-dev/catalog/     — catalog Intelligence Layer

Starten:
  python3 server.py
  python3 server.py --port 9200
"""

import sys
from pathlib import Path

from aiohttp import web
from loguru import logger

from anatomy_kb import handlers
from anatomy_kb import firestore_handler as fs
from anatomy_kb import muscle_handler as mh
from anatomy_kb import db_handler as dbh
from anatomy_kb.config import CATALOG_DIR

_agent_available = False
cov_module = plan_module = res_module = teach_module = runtime_root = None

if CATALOG_DIR and CATALOG_DIR.exists():
    sys.path.insert(0, str(CATALOG_DIR.parent))  # fitness-dev/ (für firestore/)
    sys.path.insert(0, str(CATALOG_DIR))          # catalog/ (für catalog)
    try:
        from catalog import coverage as cov_module
        from catalog import planner as plan_module
        from catalog import resolver as res_module
        from catalog import teaching as teach_module
        from catalog.core.paths import runtime_root
        _agent_available = True
    except ImportError as e:
        logger.warning(f"catalog nicht verfügbar — Agent-Features deaktiviert ({e})")
else:
    logger.warning("fitness-dev/catalog nicht gefunden — anatomy-kb läuft ohne Agent-Features")

PORT = 9200
PUBLIC = Path(__file__).resolve().parent / "public"


def create_app() -> web.Application:
    app = web.Application()

    # Module via app-Context injizieren — Handler importieren nichts direkt
    app["modules"] = {
        "resolver": res_module,
        "coverage": cov_module,
        "teaching": teach_module,
        "planner": plan_module,
        "runtime_root": runtime_root,
    }

    app.router.add_get("/health",                          handlers.health)
    app.router.add_get("/api/exercises",                   handlers.exercises)
    app.router.add_get("/api/exercise/{id}",               handlers.exercise)
    app.router.add_get("/api/exercise/{id}/teaching",      handlers.teaching)
    app.router.add_get("/api/exercise/{id}/coverage",      handlers.coverage)
    app.router.add_get("/api/exercise/{id}/bodymap",       handlers.bodymap)
    app.router.add_get("/api/resolve",                     handlers.resolve)
    app.router.add_post("/api/plan/generate",              handlers.plan_generate)
    app.router.add_post("/api/firestore/sync",             fs.sync_all)
    app.router.add_post("/api/firestore/sync/exercises",   fs.sync_exercises_handler)
    app.router.add_post("/api/firestore/sync/muscles",     fs.sync_muscles_handler)
    app.router.add_post("/api/firestore/sync/anatomy",     fs.sync_anatomy_handler)
    app.router.add_post("/api/firestore/sync/index",       fs.sync_index_handler)
    app.router.add_get("/api/firestore/status",            fs.status)
    app.router.add_get("/api/muscles",                     mh.list_muscles)
    app.router.add_get("/api/muscles/{muscle_id}",         mh.get_muscle)
    app.router.add_post("/api/muscles/enrich",             mh.enrich_muscles)
    app.router.add_post("/api/muscles/push",               mh.push_to_teaching)
    app.router.add_post("/api/db/sync",                    dbh.sync)
    app.router.add_get("/api/db/status",                   dbh.status)
    app.router.add_get("/api/db/query",                    dbh.query)
    if PUBLIC.exists():
        async def _index(request):
            return web.FileResponse(PUBLIC / "index.html")
        app.router.add_get("/", _index)
        app.router.add_static("/", PUBLIC)
    return app


if __name__ == "__main__":
    port = PORT
    if "--port" in sys.argv:
        port = int(sys.argv[sys.argv.index("--port") + 1])

    logger.info(f"anatomy-kb server :{port}")
    logger.info(f"runtime_root: {runtime_root()}")
    logger.info(f"fitness-agent: {FITNESS_DEV}")

    web.run_app(create_app(), host="0.0.0.0", port=port, access_log=None)
