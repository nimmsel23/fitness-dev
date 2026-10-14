from __future__ import annotations

from fastapi import APIRouter, Query

from backend.services import catalog

router = APIRouter(prefix="/catalog", tags=["catalog"])


@router.get("/exercises")
def search(q: str = Query("", description="Suchbegriff (ID, Name, Alias, Tag)"), limit: int = Query(12, ge=1, le=50)):
    return catalog.search(q, limit)


@router.get("/exercises/{exercise_id}")
def get_exercise(exercise_id: str):
    return catalog.get(exercise_id)
