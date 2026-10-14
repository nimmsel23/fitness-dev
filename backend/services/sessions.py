"""Sessions: Listen, Lesen, Speichern (JSON ist die Quelle, rev-Konfliktschutz)."""
from __future__ import annotations

import re
from datetime import datetime, timezone
from typing import Any

from backend.core.conflict import rev_of
from backend.core.store import SessionStore

_DOC_ID_RE = re.compile(r"^(\d{4}-\d{2}-\d{2})(?:__([A-Za-z0-9_.\-]+))?$")


class SessionNotFound(LookupError):
    pass


class InvalidSession(ValueError):
    pass


class RevConflict(Exception):
    def __init__(self, current_rev: int):
        super().__init__(f"rev-Konflikt: gespeichert ist rev {current_rev}")
        self.current_rev = current_rev


class StoredSessionCorrupt(RuntimeError):
    pass


def parse_doc_id(doc_id: str) -> tuple[str, str | None]:
    m = _DOC_ID_RE.match(doc_id)
    if not m:
        raise InvalidSession(f"ungültige Session-ID: {doc_id!r} (erwartet YYYY-MM-DD oder YYYY-MM-DD__<id>)")
    return m.group(1), m.group(2)


def summarize(doc_id: str, data: dict[str, Any]) -> dict[str, Any]:
    day, sid = parse_doc_id(doc_id)
    return {
        "doc_id": doc_id,
        "date": data.get("date") or day,
        "session_id": sid,
        "session_mode": data.get("sessionMode"),
        "block": data.get("block") or None,
        "trainingsart": data.get("trainingsart") or None,
        "exercises": len(data.get("exercises") or []),
        "effort": data.get("effort"),
        "duration": data.get("duration") or None,
        "rev": rev_of(data),
        "saved_at": data.get("saved_at"),
    }


def list_sessions(store: SessionStore, uid: str, *, limit: int = 50, since: str | None = None) -> list[dict[str, Any]]:
    """Neueste zuerst. Defekte/nicht parsebare Dateien werden übersprungen (nicht fatal)."""
    out = []
    for doc_id in store.list_ids(uid):
        data, err = store.read(uid, doc_id)
        if data is None:
            continue
        item = summarize(doc_id, data)
        if since and str(item["date"]) < since:
            continue
        out.append(item)
    out.sort(key=lambda s: (str(s["date"]), str(s["saved_at"] or "")), reverse=True)
    return out[:limit]


def get_session(store: SessionStore, uid: str, doc_id: str) -> dict[str, Any]:
    parse_doc_id(doc_id)
    data, err = store.read(uid, doc_id)
    if err:
        raise StoredSessionCorrupt(f"{doc_id}: {err}")
    if data is None:
        raise SessionNotFound(doc_id)
    return data


def save_session(
    store: SessionStore, uid: str, doc_id: str, body: dict[str, Any], *, now: datetime | None = None
) -> dict[str, Any]:
    """Speichert eine Session.

    * `rev` im Body ist die Basis-Revision des Clients. Ist sie gesetzt und weicht von der
      gespeicherten ab → RevConflict (HTTP 409). Fehlt sie → letzter Schreiber gewinnt.
    * rev wird serverseitig hochgezählt, saved_at serverseitig gesetzt (echte Editierzeit).
    """
    day, sid = parse_doc_id(doc_id)
    if body.get("date") not in (None, "", day):
        raise InvalidSession(f"date {body.get('date')!r} passt nicht zur Session-ID {doc_id!r}")
    if "exercises" in body and not isinstance(body["exercises"], list):
        raise InvalidSession("exercises muss eine Liste sein")
    expected = body.get("rev")
    if expected is not None:
        try:
            expected = int(expected)
        except (TypeError, ValueError):
            raise InvalidSession("rev muss eine Zahl sein") from None

    now = now or datetime.now(timezone.utc)
    with store.write_lock():
        stored, err = store.read(uid, doc_id)
        if err:
            raise StoredSessionCorrupt(f"{doc_id}: {err}")
        stored_rev = rev_of(stored) if stored else 0
        if expected is not None and expected != stored_rev:
            raise RevConflict(stored_rev)
        new = {**body, "date": day, "rev": stored_rev + 1, "saved_at": now.isoformat()}
        if sid and not new.get("session_id"):
            new["session_id"] = sid
        store.write(uid, doc_id, new)
    return new
