"""FastAPI router for anatomy-specific enrichment actions.

This keeps the HTTP namespace `/fitness/anatomy/*`, but writes through the
catalog SSOT (`fitness.catalog.muscles_store`). It replaces the old
`anatomy-kb` muscle-enrichment endpoint without reintroducing a second data
home beside `fitness/catalog/kb`.
"""
from __future__ import annotations

from fastapi import APIRouter, HTTPException

from fitness.anatomy import gemini as anatomy_gemini
from fitness.catalog import muscles_store

router = APIRouter(prefix="/fitness/anatomy")


@router.post("/muscles/enrich")
async def enrich_muscle(muscle_id: str, force: bool = False):
    """Füllt origin/insertion/innervation/function via Gemini, wenn leer (oder force=True)."""
    doc = muscles_store.load_muscle(muscle_id)
    if doc is None:
        raise HTTPException(404, detail=f"Muskel nicht gefunden: {muscle_id}")

    if doc.get("origin") and not force:
        return {"ok": True, "skipped": True, "reason": "already_enriched", "muscle_id": muscle_id}

    api_key, model = anatomy_gemini.load_env()
    if not api_key:
        raise HTTPException(500, detail="GEMINI_API_KEY fehlt in ~/.env/gemini.env")

    latin = doc.get("label_lat") or doc.get("display_name") or muscle_id
    prompt = anatomy_gemini.MUSCLE_PROMPT.format(latin=latin, muscle_id=muscle_id)

    response = anatomy_gemini.call_with_fallback(prompt, api_key, model)
    if not response:
        raise HTTPException(502, detail="Gemini-Aufruf fehlgeschlagen (alle Fallback-Modelle)")

    parsed = anatomy_gemini.parse_response(response)
    if not parsed.get("origin"):
        raise HTTPException(502, detail="Gemini-Antwort ohne 'origin' — YAML-Parse vermutlich fehlgeschlagen")

    path, _ = muscles_store.update_muscle(muscle_id, parsed, force=force)
    return {"ok": True, "muscle_id": muscle_id, "path": str(path), "data": parsed}
