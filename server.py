"""
anatomy-kb — Knowledge API Server  :9200

Routing-Layer. Businesslogik liegt in:
  anatomy_kb/handlers.py   — HTTP-Handler
  fitness-dev/catalog/     — fitness_agent Intelligence Layer

Starten:
  python3 server.py
  python3 server.py --port 9200
"""

import sys
from pathlib import Path

from aiohttp import web
from loguru import logger

from anatomy_kb import handlers

FITNESS_DEV = Path(__file__).resolve().parent.parent / "fitness-dev" / "catalog"
sys.path.insert(0, str(FITNESS_DEV))

from fitness_agent import coverage as cov_module
from fitness_agent import planner as plan_module
from fitness_agent import resolver as res_module
from fitness_agent import teaching as teach_module
from fitness_agent.paths import runtime_root

PORT = 9200


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
    return app


if __name__ == "__main__":
    port = PORT
    if "--port" in sys.argv:
        port = int(sys.argv[sys.argv.index("--port") + 1])

    logger.info(f"anatomy-kb server :{port}")
    logger.info(f"runtime_root: {runtime_root()}")
    logger.info(f"fitness-dev: {FITNESS_DEV}")

    web.run_app(create_app(), host="0.0.0.0", port=port, access_log=None)
