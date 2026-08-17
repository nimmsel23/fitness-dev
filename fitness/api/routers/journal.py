import asyncio
from datetime import date
from fastapi import APIRouter, Request, Query, HTTPException

from fitness.api.config import (
    JOUR_DIR, SESS_ROOT,
    _uid_from_request, _read_json, logger
)
from db.schemas import JournalResponse
from fitness.firestore.mirror import mirror_journal

router = APIRouter()

def _today() -> str:
    return date.today().isoformat()

def _require_uid(request: Request) -> str:
    uid = _uid_from_request(request)
    if not uid or uid == "default":
        raise HTTPException(400, detail="uid Pflicht. Aktive UID fehlt; via ?uid=... oder X-User-UID Header senden.")
    return uid

def _journal_dir(uid: str):
    return SESS_ROOT / uid / "journal"

@router.get("/journal")
def journal_get(request: Request, date_: str = Query(None, alias="date")):
    uid = _uid_from_request(request)
    day = date_ or _today()
    # Pro-uid-Ordner zuerst (mehrere echte Klienten teilen sich sonst denselben
    # globalen JOUR_DIR und überschreiben sich gegenseitig für dasselbe Datum)
    # — JOUR_DIR bleibt als Legacy-Fallback für Einträge von vor diesem Fix.
    f = _journal_dir(uid) / f"{day}.md"
    if not f.exists():
        f = JOUR_DIR / f"{day}.md"
    if not f.exists():
        raise HTTPException(404)
    return {"ok": True, "content": f.read_text(), "mtime": f.stat().st_mtime}

@router.post("/journal")
async def journal_post(request: Request, date_: str = Query(None, alias="date")):
    uid     = _require_uid(request)
    day     = date_ or _today()
    body    = await request.json()
    content = body.get("content", "")
    dir_ = _journal_dir(uid)
    dir_.mkdir(parents=True, exist_ok=True)
    (dir_ / f"{day}.md").write_text(content)
    asyncio.get_event_loop().run_in_executor(None, mirror_journal, day, {"text": content}, uid)
    logger.info(f"journal saved  {uid}/{day}  {len(content)}ch")
    return {"ok": True}

@router.get("/journal/list")
def journal_list(request: Request):
    uid = _uid_from_request(request)
    dirs = [d for d in (_journal_dir(uid), JOUR_DIR) if d.exists()]
    seen: dict[str, float] = {}
    for dir_ in dirs:
        for f in dir_.glob("*.md"):
            mtime = f.stat().st_mtime
            if f.stem not in seen or mtime > seen[f.stem]:
                seen[f.stem] = mtime
    entries = [
        {"date": day, "mtime": mtime}
        for day, mtime in sorted(seen.items(), key=lambda kv: kv[0], reverse=True)[:50]
    ]
    return {"ok": True, "entries": entries}

