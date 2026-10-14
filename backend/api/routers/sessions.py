from __future__ import annotations

from typing import Any

from fastapi import APIRouter, Body, Depends, Query, Request

from backend.api.deps import get_store, valid_uid
from backend.api.schemas import SessionSummary
from backend.core.store import SessionStore
from backend.services import sessions as svc

router = APIRouter(prefix="/users/{uid}/sessions", tags=["sessions"])


def _uid(uid: str, request: Request) -> str:
    return valid_uid(uid, request)


@router.get("", response_model=list[SessionSummary])
def list_sessions(request: Request, uid: str, limit: int = Query(50, ge=1, le=500),
                  since: str | None = Query(None, pattern=r"^\d{4}-\d{2}-\d{2}$"),
                  store: SessionStore = Depends(get_store)):
    return svc.list_sessions(store, _uid(uid, request), limit=limit, since=since)


@router.get("/{doc_id}")
def get_session(request: Request, uid: str, doc_id: str, store: SessionStore = Depends(get_store)):
    return svc.get_session(store, _uid(uid, request), doc_id)


@router.put("/{doc_id}")
def put_session(request: Request, uid: str, doc_id: str, body: dict[str, Any] = Body(...),
                store: SessionStore = Depends(get_store)):
    """Speichert die Session. `rev` im Body = Basis-Revision; Abweichung → 409."""
    return svc.save_session(store, _uid(uid, request), doc_id, body)
