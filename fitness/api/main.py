import uvicorn
import typer
from typing_extensions import Annotated
from contextlib import asynccontextmanager
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles
from fastapi.responses import JSONResponse
from loguru import logger

from fitness.api.config import (
    PORT, HOST, RUNTIME, _DIST_DIR, _INDEX_HTML, close_httpx_client, Base, engine
)
from fitness.api.routers.sessions import router as sessions_router
from fitness.api.routers.journal import router as journal_router
from fitness.api.routers.exercises import router as exercises_router
from fitness.api.routers.coaching import router as coaching_router
from fitness.api.routers.system import router as system_router

@asynccontextmanager
async def lifespan(app: FastAPI):
    logger.info(f"fitness-dev Modular FastAPI Server :{PORT}")
    logger.info(f"runtime  {RUNTIME}")
    logger.info(f"db       {engine.url}")
    yield
    await close_httpx_client()

app = FastAPI(
    title="fitness-dev Modular Backend API",
    version="3.0.0",
    description="Refactored modular FastAPI backend for AlphaOS Fitness Ecosystem.",
    lifespan=lifespan,
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_methods=["*"],
    allow_headers=["*"],
)

# Register routers
app.include_router(sessions_router)
app.include_router(journal_router)
app.include_router(exercises_router)
app.include_router(coaching_router)
app.include_router(system_router)

# ── Static / SPA-Fallback — must be registered last ───────────────────────────
if (_DIST_DIR / "assets").exists():
    app.mount("/assets", StaticFiles(directory=str(_DIST_DIR / "assets")), name="assets")

@app.get("/{path:path}")
async def spa_fallback(path: str):
    if not _INDEX_HTML.exists():
        return JSONResponse({"error": "No dist/ found — run npm run build"}, status_code=503)
    from fastapi.responses import FileResponse
    candidate = _DIST_DIR / path
    if candidate.exists() and candidate.is_file():
        return FileResponse(str(candidate))
    return FileResponse(str(_INDEX_HTML))

# ── CLI Runner ────────────────────────────────────────────────────────────────
cli = typer.Typer(add_completion=False)

@cli.command()
def serve(
    port: Annotated[int, typer.Option("--port", "-p", help="Port to bind")] = PORT,
    host: Annotated[str, typer.Option("--host", help="Host address to bind")] = HOST,
    reload: Annotated[bool, typer.Option("--reload", help="Enable uvicorn auto-reload")] = False,
):
    logger.info(f"fitness-dev FastAPI :{port}")
    uvicorn.run(
        "fitness.api.main:app",
        host=host,
        port=port,
        reload=reload,
        app_dir=str(_DIST_DIR.parent),
    )

def main():
    Base.metadata.create_all(engine)
    cli()

if __name__ == "__main__":
    main()
