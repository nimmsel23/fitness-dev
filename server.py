"""
anatomy-kb API Server

Port:  9200  (Dev)
Stack: aiohttp + PyYAML + loguru

Endpoints:
  GET /health
  GET /api/exercises                    — Liste aller Übungen (summary)
  GET /api/exercise/{id}                — Vollständige Übungs-Daten
  GET /api/exercise/{id}/teaching       — Nur Anatomy-Teaching-Felder
  GET /api/exercise/{id}/errors         — Nur common_errors_explained
  GET /api/exercise/{id}/quiz           — Nur quiz_prompts
  POST /api/reload                      — Cache leeren (kein Neustart nötig)

Starten:
  python3 server.py
  python3 server.py --port 9200
"""

import json
import sys
from pathlib import Path

from aiohttp import web
from loguru import logger

from anatomy_kb import loader
from anatomy_kb.models import Exercise

PORT = 9200
EXERCISES_DIR = Path(__file__).parent / "exercises"


# --- Helpers -----------------------------------------------------------------

def json_response(data: dict | list, status: int = 200) -> web.Response:
    return web.Response(
        text=json.dumps(data, ensure_ascii=False, indent=2),
        content_type="application/json",
        status=status,
    )


def _get_exercise(exercise_id: str) -> Exercise | None:
    data = loader.load_one(exercise_id)
    if data is None:
        return None
    return Exercise.from_dict(data)


# --- Handlers ----------------------------------------------------------------

async def handle_health(request: web.Request) -> web.Response:
    return json_response({
        "status": "ok",
        "exercises": len(loader.list_ids()),
        "ids": loader.list_ids(),
    })


async def handle_exercises(request: web.Request) -> web.Response:
    """Listet alle Übungen als kompakte Summaries."""
    all_data = loader.load_all()
    summaries = [
        Exercise.from_dict(d).to_summary()
        for d in all_data.values()
    ]
    return json_response(summaries)


async def handle_exercise(request: web.Request) -> web.Response:
    """Gibt die vollständigen YAML-Daten einer Übung zurück."""
    exercise_id = request.match_info["id"]
    exercise = _get_exercise(exercise_id)
    if exercise is None:
        return json_response({"error": f"Übung nicht gefunden: {exercise_id}"}, status=404)
    return json_response(exercise.to_full())


async def handle_teaching(request: web.Request) -> web.Response:
    """Gibt nur die Anatomy-Teaching-relevanten Felder zurück."""
    exercise_id = request.match_info["id"]
    exercise = _get_exercise(exercise_id)
    if exercise is None:
        return json_response({"error": f"Übung nicht gefunden: {exercise_id}"}, status=404)

    raw = exercise.raw
    teaching = {
        "exercise_id": exercise.exercise_id,
        "name": exercise.name,
        "simple_explanation": exercise.simple_explanation,
        "detailed_explanation": exercise.detailed_explanation,
        "joint_actions": raw.get("joint_actions"),
        "muscle_roles": raw.get("muscle_roles"),
        "feel_cues": exercise.feel_cues,
        "coaching_cues": raw.get("coaching_cues"),
    }
    # Variations falls vorhanden
    for variation_key in (
        "body_position_effect", "grip_variation_effect",
        "stance_variation_effect", "lunge_variation_effect",
        "rdl_vs_deadlift",
    ):
        if variation_key in raw:
            teaching[variation_key] = raw[variation_key]

    return json_response(teaching)


async def handle_errors(request: web.Request) -> web.Response:
    """Gibt nur common_errors_explained zurück."""
    exercise_id = request.match_info["id"]
    exercise = _get_exercise(exercise_id)
    if exercise is None:
        return json_response({"error": f"Übung nicht gefunden: {exercise_id}"}, status=404)

    errors = exercise.raw.get("common_errors_explained")
    if not errors:
        return json_response({"exercise_id": exercise_id, "common_errors_explained": {}})
    return json_response({"exercise_id": exercise_id, "common_errors_explained": errors})


async def handle_quiz(request: web.Request) -> web.Response:
    """Gibt quiz_prompts zurück."""
    exercise_id = request.match_info["id"]
    exercise = _get_exercise(exercise_id)
    if exercise is None:
        return json_response({"error": f"Übung nicht gefunden: {exercise_id}"}, status=404)

    prompts = exercise.raw.get("quiz_prompts") or []
    return json_response({"exercise_id": exercise_id, "quiz_prompts": prompts})


async def handle_reload(request: web.Request) -> web.Response:
    """Leert den YAML-Cache. Nützlich nach Änderungen an Exercise-Dateien."""
    loader.reload()
    return json_response({"status": "reloaded", "exercises": len(loader.list_ids())})


# --- App Factory -------------------------------------------------------------

def create_app() -> web.Application:
    loader.init(EXERCISES_DIR)

    app = web.Application()
    app.router.add_get("/health", handle_health)
    app.router.add_get("/api/exercises", handle_exercises)
    app.router.add_get("/api/exercise/{id}", handle_exercise)
    app.router.add_get("/api/exercise/{id}/teaching", handle_teaching)
    app.router.add_get("/api/exercise/{id}/errors", handle_errors)
    app.router.add_get("/api/exercise/{id}/quiz", handle_quiz)
    app.router.add_post("/api/reload", handle_reload)
    return app


# --- Entry Point -------------------------------------------------------------

if __name__ == "__main__":
    port = PORT
    if "--port" in sys.argv:
        idx = sys.argv.index("--port")
        port = int(sys.argv[idx + 1])

    logger.info(f"anatomy-kb server startet auf ::{port}")
    logger.info(f"exercises_dir: {EXERCISES_DIR}")

    app = create_app()
    web.run_app(app, host="0.0.0.0", port=port, access_log=None)
