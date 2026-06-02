from __future__ import annotations

import json
from dataclasses import asdict
from typing import Any

from aiohttp import web

from .resolver import build_exercise_index, resolve_query, find_by_id
from .loader import load_catalog_yaml
from .paths import DATA_DIR


async def handle_index(request: web.Request) -> web.Response:
    return web.json_response({
        "name": "Fitness Agent Exercise KB Server",
        "version": "0.1.0",
        "endpoints": [
            "/exercises",
            "/exercise/{id}",
            "/resolve?q=...",
            "/muscles",
            "/taxonomy"
        ]
    })


async def handle_exercises(request: web.Request) -> web.Response:
    records = build_exercise_index()
    return web.json_response([asdict(r) for r in records])


async def handle_exercise_detail(request: web.Request) -> web.Response:
    exercise_id = request.match_info.get("id")
    if not exercise_id:
        return web.json_response({"error": "Missing exercise ID"}, status=400)
    
    records = build_exercise_index()
    record = find_by_id(exercise_id, records)
    
    if not record:
        return web.json_response({"error": f"Exercise {exercise_id} not found"}, status=404)
    
    return web.json_response(asdict(record))


async def handle_resolve(request: web.Request) -> web.Response:
    query = request.query.get("q", "")
    if not query:
        return web.json_response({"error": "Missing query parameter 'q'"}, status=400)
    
    result = resolve_query(query)
    return web.json_response(asdict(result))


async def handle_muscles(request: web.Request) -> web.Response:
    try:
        muscles = load_catalog_yaml("muscles/muscles.yml")
        return web.json_response(muscles)
    except Exception as e:
        return web.json_response({"error": str(e)}, status=500)


async def handle_taxonomy(request: web.Request) -> web.Response:
    try:
        taxonomy = load_catalog_yaml("muscles/muscles.yml")
        rules = load_catalog_yaml("muscles/muscle_coverage_rules.yml")
        bridge = load_catalog_yaml("muscles/body_highlighter_bridge.yml")
        return web.json_response({
            "muscles": taxonomy,
            "rules": rules,
            "bridge": bridge
        })
    except Exception as e:
        return web.json_response({"error": str(e)}, status=500)


@web.middleware
async def cors_middleware(request: web.Request, handler: Any) -> web.StreamResponse:
    if request.method == "OPTIONS":
        response = web.Response(status=204)
    else:
        response = await handler(request)
    
    response.headers["Access-Control-Allow-Origin"] = "*"
    response.headers["Access-Control-Allow-Methods"] = "GET, POST, OPTIONS"
    response.headers["Access-Control-Allow-Headers"] = "Content-Type, Authorization"
    return response


def create_app() -> web.Application:
    app = web.Application(middlewares=[cors_middleware])
    
    app.add_routes([
        web.get("/", handle_index),
        web.get("/exercises", handle_exercises),
        web.get("/exercise/{id}", handle_exercise_detail),
        web.get("/resolve", handle_resolve),
        web.get("/muscles", handle_muscles),
        web.get("/taxonomy", handle_taxonomy),
    ])
    
    return app


def main():
    app = create_app()
    web.run_app(app, host="0.0.0.0", port=9120)


if __name__ == "__main__":
    main()
