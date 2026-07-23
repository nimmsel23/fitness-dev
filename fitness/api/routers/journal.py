import json
import uuid
import asyncio
from datetime import date, datetime
from fastapi import APIRouter, Request, Query, HTTPException

from fitness.api.config import (
    JOUR_DIR, LOCAL_HABITS_FILE, LOCAL_RECORDS_DIR,
    _uid_from_request, _read_json, logger
)
from db.schemas import JournalResponse
from firestore.mirror import mirror_journal

router = APIRouter()

def _today() -> str:
    return date.today().isoformat()

@router.get("/journal")
def journal_get(request: Request, date_: str = Query(None, alias="date")):
    day = date_ or _today()
    f   = JOUR_DIR / f"{day}.md"
    if not f.exists():
        raise HTTPException(404)
    return {"ok": True, "content": f.read_text(), "mtime": f.stat().st_mtime}

@router.post("/journal")
async def journal_post(request: Request, date_: str = Query(None, alias="date")):
    uid     = _uid_from_request(request)
    day     = date_ or _today()
    body    = await request.json()
    content = body.get("content", "")
    JOUR_DIR.mkdir(parents=True, exist_ok=True)
    (JOUR_DIR / f"{day}.md").write_text(content)
    asyncio.get_event_loop().run_in_executor(None, mirror_journal, day, {"text": content}, uid)
    logger.info(f"journal saved  {uid}/{day}  {len(content)}ch")
    return {"ok": True}

@router.get("/journal/list")
def journal_list():
    if not JOUR_DIR.exists():
        return {"ok": True, "entries": []}
    entries = [
        {"date": f.stem, "mtime": f.stat().st_mtime}
        for f in sorted(JOUR_DIR.glob("*.md"), reverse=True)[:50]
    ]
    return {"ok": True, "entries": entries}

@router.get("/habitsync/habits")
def habitsync_habits():
    try:
        if LOCAL_HABITS_FILE.exists():
            defs = json.loads(LOCAL_HABITS_FILE.read_text())
            defs = [h for h in defs if not h.get("deleted")]
            today = _today()
            rec_file = LOCAL_RECORDS_DIR / f"{today}.json"
            records  = json.loads(rec_file.read_text()) if rec_file.exists() else []
            done_today = {r["uuid"] for r in records}
            return [
                {**h, "records": [{"date": today, "completion": "DONE"}] if h["uuid"] in done_today else []}
                for h in defs
            ]
    except Exception as exc:
        logger.warning(f"habitsync_habits: {exc}")
    return []

@router.post("/habitsync/record/{uuid_}")
def habitsync_record(uuid_: str):
    LOCAL_RECORDS_DIR.mkdir(parents=True, exist_ok=True)
    today    = _today()
    rec_file = LOCAL_RECORDS_DIR / f"{today}.json"
    records  = json.loads(rec_file.read_text()) if rec_file.exists() else []
    if not any(r["uuid"] == uuid_ for r in records):
        records.append({"uuid": uuid_, "date": today, "completion": "DONE", "ts": datetime.utcnow().isoformat()})
        rec_file.write_text(json.dumps(records, indent=2))
    return {"ok": True}

@router.post("/habitsync/add")
async def habitsync_add(request: Request):
    body  = await request.json()
    name  = (body.get("name") or "").strip()
    icon  = body.get("icon", "Activity")
    if not name:
        raise HTTPException(400, detail="missing_name")
    habit = {"uuid": str(uuid.uuid4()), "name": name, "icon": icon, "created_at": datetime.utcnow().isoformat()}
    LOCAL_HABITS_FILE.parent.mkdir(parents=True, exist_ok=True)
    defs  = json.loads(LOCAL_HABITS_FILE.read_text()) if LOCAL_HABITS_FILE.exists() else []
    defs.append(habit)
    LOCAL_HABITS_FILE.write_text(json.dumps(defs, indent=2))
    return {"ok": True, "habit": habit}

@router.delete("/habitsync/delete/{uuid_}")
def habitsync_delete(uuid_: str):
    if not LOCAL_HABITS_FILE.exists():
        raise HTTPException(404, detail="no_habits")
    defs = json.loads(LOCAL_HABITS_FILE.read_text())
    defs = [h if h.get("uuid") != uuid_ else {**h, "deleted": True} for h in defs]
    LOCAL_HABITS_FILE.write_text(json.dumps(defs, indent=2))
    return {"ok": True}
