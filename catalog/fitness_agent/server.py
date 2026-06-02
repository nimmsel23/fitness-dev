from __future__ import annotations

import json
from dataclasses import asdict
from typing import Any

from aiohttp import web

from .resolver import build_exercise_index, resolve_query, find_by_id
from .loader import load_catalog_yaml, load_runtime_yaml
from .paths import DATA_DIR
from .teaching import load_all_lessons, find_lesson
from .planner import build_plan
from .weekly import build_weekly_coverage, resolve_week_selector
from .history import read_history_range
from .obsidian import export_coach_sheet_note, export_teach_note, export_plan_note, export_weekly_report_note


async def handle_index(request: web.Request) -> web.Response:
    return web.json_response({
        "name": "Fitness Agent Exercise KB Server",
        "version": "0.1.0",
        "endpoints": [
            "/exercises",
            "/exercise/{id}",
            "/resolve?q=...",
            "/muscles",
            "/taxonomy",
            "/snapshot",
            "/plan",
            "/weekly?week=...",
            "/export/{kind}"
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
    
    lesson = find_lesson(exercise_id)
    result = asdict(record)
    result["lesson"] = lesson
    
    return web.json_response(result)


async def handle_resolve(request: web.Request) -> web.Response:
    query = request.query.get("q", "")
    if not query:
        return web.json_response({"error": "Missing query parameter 'q'"}, status=400)
    
    result = resolve_query(query)
    data = asdict(result)
    
    if result.matched and result.canonical_id:
        record = find_by_id(result.canonical_id, build_exercise_index())
        if record:
            data["exercise"] = asdict(record)
            data["lesson"] = find_lesson(result.canonical_id)
            
    return web.json_response(data)


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


def unwrap(section: Any) -> Any:
    if isinstance(section, dict) and len(section) == 1:
        only = next(iter(section.values()))
        if isinstance(only, dict):
            return only
    return section


async def handle_snapshot(request: web.Request) -> web.Response:
    try:
        snapshot = {
            "config": load_runtime_yaml("config.yml"),
            "aliases": load_runtime_yaml("maps/aliases.yml"),
            "program_rules": unwrap(load_runtime_yaml("rules/program_rules.yml")),
            "progression_rules": unwrap(load_runtime_yaml("rules/progression_rules.yml")),
            "safety_rules": unwrap(load_runtime_yaml("rules/safety_rules.yml")),
            "muscles": unwrap(load_runtime_yaml("muscles/muscles.yml")),
            "muscle_coverage_rules": unwrap(load_runtime_yaml("muscles/muscle_coverage_rules.yml")),
            "body_highlighter_bridge": unwrap(load_runtime_yaml("muscles/body_highlighter_bridge.yml")),
            "wger_mapping": unwrap(load_runtime_yaml("maps/wger_mapping.yml")),
            "external_db_mapping": unwrap(load_runtime_yaml("maps/external_db_mapping.yml")),
            "exercises": [asdict(r) for r in build_exercise_index()],
            "lessons": load_all_lessons(),
        }
        return web.json_response(snapshot)
    except Exception as e:
        return web.json_response({"error": str(e)}, status=500)


async def handle_plan(request: web.Request) -> web.Response:
    try:
        # Use query params or POST body
        if request.method == "POST":
            data = await request.json()
        else:
            data = request.query
            
        plan = build_plan(
            template=data.get("template"),
            split=data.get("split"),
            day=data.get("day"),
            goal=data.get("goal")
        )
        return web.json_response(asdict(plan))
    except Exception as e:
        return web.json_response({"error": str(e)}, status=500)


async def handle_weekly(request: web.Request) -> web.Response:
    try:
        week_selector = request.query.get("week", "current")
        week = build_weekly_coverage(week_selector)
        bounds = resolve_week_selector(week_selector)
        entries = read_history_range(bounds["date_from"], bounds["date_to"])
        
        # In a real scenario, we might want to enrich entries here too, 
        # but let's stick to what WEEKLY_SCRIPT does for now.
        return web.json_response({
            **week,
            "week_selector": week_selector,
            "bounds": bounds,
            "entries": entries
        })
    except Exception as e:
        return web.json_response({"error": str(e)}, status=500)


async def handle_export(request: web.Request) -> web.Response:
    try:
        kind = request.match_info.get("kind")
        data = await request.json()
        force = bool(data.get("force"))
        
        result = None
        if kind == 'exercise_sheet':
            result = export_coach_sheet_note(data['query'], force=force)
        elif kind == 'exercise_lesson':
            result = export_teach_note(data['exercise_id'], mode=data.get('mode', 'trainer'), force=force)
        elif kind == 'plan':
            result = export_plan_note(data['plan'], force=force)
        elif kind == 'weekly':
            _, result = export_weekly_report_note(data.get('week_selector', 'current'), force=force)
        else:
            return web.json_response({"error": f"Unknown export kind: {kind}"}, status=400)
            
        return web.json_response({
            'path': str(result.path),
            'used_fallback_name': bool(getattr(result, 'used_fallback_name', False)),
            'overwritten': bool(getattr(result, 'overwritten', False)),
            'warning': getattr(result, 'warning', None),
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
        web.get("/snapshot", handle_snapshot),
        web.get("/plan", handle_plan),
        web.post("/plan", handle_plan),
        web.get("/weekly", handle_weekly),
        web.post("/export/{kind}", handle_export),
    ])
    
    return app


def main():
    app = create_app()
    web.run_app(app, host="0.0.0.0", port=9120)


if __name__ == "__main__":
    main()
