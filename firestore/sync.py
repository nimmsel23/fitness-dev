"""pull/push: Firestore ↔ ~/.aos/fitness/ (one-shot)"""

import json
from pathlib import Path

from loguru import logger
from ._db import get_db, ts, UID

FITNESS_DIR = Path.home() / ".aos" / "fitness"
SESSIONS    = FITNESS_DIR / "sessions"
JOURNAL     = FITNESS_DIR / "journal"
STATE_FILE  = FITNESS_DIR / "agent-state" / "fsm-known-journal.json"


def _load_known() -> set:
    return set(json.loads(STATE_FILE.read_text())) if STATE_FILE.exists() else set()

def _save_known(ids: set):
    STATE_FILE.parent.mkdir(parents=True, exist_ok=True)
    STATE_FILE.write_text(json.dumps(sorted(ids), indent=2))


def pull() -> dict:
    db = get_db()
    sessions_pulled = sessions_skipped = 0
    SESSIONS.mkdir(parents=True, exist_ok=True)

    for doc in db.collection("fitness").document(UID).collection("sessions").stream():
        date, data = doc.id, doc.to_dict()
        local = SESSIONS / f"{date}.json"
        if local.exists():
            local_ts  = json.loads(local.read_text()).get("saved_at", "")
            remote_ts = ts(data.get("saved_at"))
            if remote_ts and local_ts and local_ts >= remote_ts:
                sessions_skipped += 1
                continue
        out = {k: (ts(v) if hasattr(v, "isoformat") else v) for k, v in data.items()}
        local.write_text(json.dumps(out, indent=2, ensure_ascii=False))
        logger.info(f"session ← {date}")
        sessions_pulled += 1

    known = _load_known()
    journal_pulled = 0
    JOURNAL.mkdir(parents=True, exist_ok=True)

    for doc in db.collection("fitness").document(UID).collection("journal").stream():
        if doc.id in known:
            continue
        data   = doc.to_dict()
        date   = data.get("date", "")
        text   = data.get("text", "").strip()
        time   = (ts(data.get("time")) or "")[:16]
        if not date or not text:
            continue
        md_file = JOURNAL / f"{date}.md"
        marker  = f"<!-- fsid:{doc.id} -->"
        if md_file.exists() and marker in md_file.read_text():
            known.add(doc.id)
            continue
        with md_file.open("a") as fh:
            fh.write(f"\n{marker}\n**{time}** {text}\n")
        known.add(doc.id)
        logger.info(f"journal ← {date}")
        journal_pulled += 1

    _save_known(known)
    return {"sessions": sessions_pulled, "sessions_skipped": sessions_skipped, "journal": journal_pulled}


def push() -> dict:
    db = get_db()
    pushed = skipped = 0
    if not SESSIONS.exists():
        return {"sessions": 0, "sessions_skipped": 0}

    for f in sorted(SESSIONS.glob("*.json")):
        date       = f.stem
        local_data = json.loads(f.read_text())
        local_ts   = local_data.get("saved_at", "")
        remote     = db.collection("fitness").document(UID).collection("sessions").document(date).get()
        if remote.exists:
            remote_ts = ts(remote.to_dict().get("saved_at"))
            if remote_ts and local_ts and remote_ts >= local_ts:
                skipped += 1
                continue
        db.collection("fitness").document(UID).collection("sessions").document(date).set(
            {**local_data, "date": date}
        )
        logger.info(f"session → {date}")
        pushed += 1

    return {"sessions": pushed, "sessions_skipped": skipped}
