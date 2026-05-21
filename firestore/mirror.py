"""on_snapshot Daemon: Firestore → ~/.aos/fitness/ (event-driven)

python -m firestore.mirror
"""

import json
import sys
import threading
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


known_journal = _load_known()
known_lock    = threading.Lock()


def on_session(col_snapshot, changes, read_time):
    for change in changes:
        if change.type.name not in ("ADDED", "MODIFIED"):
            continue
        date, data = change.document.id, change.document.to_dict()
        SESSIONS.mkdir(parents=True, exist_ok=True)
        local = SESSIONS / f"{date}.json"
        if local.exists() and change.type.name == "MODIFIED":
            local_ts  = json.loads(local.read_text()).get("saved_at", "")
            remote_ts = ts(data.get("saved_at"))
            if remote_ts and local_ts and local_ts >= remote_ts:
                continue
        out = {k: (ts(v) if hasattr(v, "isoformat") else v) for k, v in data.items()}
        local.write_text(json.dumps(out, indent=2, ensure_ascii=False))
        logger.success(f"session ← {date}")


def on_journal(col_snapshot, changes, read_time):
    global known_journal
    for change in changes:
        if change.type.name != "ADDED":
            continue
        doc_id = change.document.id
        with known_lock:
            if doc_id in known_journal:
                continue
            known_journal.add(doc_id)
            _save_known(known_journal)
        data    = change.document.to_dict()
        date    = data.get("date", "")
        text    = data.get("text", "").strip()
        time    = (ts(data.get("time")) or "")[:16]
        if not date or not text:
            continue
        JOURNAL.mkdir(parents=True, exist_ok=True)
        md_file = JOURNAL / f"{date}.md"
        marker  = f"<!-- fsid:{doc_id} -->"
        if md_file.exists() and marker in md_file.read_text():
            continue
        with md_file.open("a") as fh:
            fh.write(f"\n{marker}\n**{time}** {text}\n")
        logger.success(f"journal ← {date}  {text[:60]}")


def main():
    logger.remove()
    logger.add(sys.stderr, format="<green>{time:HH:mm:ss}</green> <level>{message}</level>")
    db = get_db()
    w1 = db.collection("fitness").document(UID).collection("sessions").on_snapshot(on_session)
    w2 = db.collection("fitness").document(UID).collection("journal").on_snapshot(on_journal)
    logger.info(f"Listening → fitness/{UID}/sessions + journal")
    try:
        threading.Event().wait()
    except KeyboardInterrupt:
        w1.unsubscribe()
        w2.unsubscribe()


if __name__ == "__main__":
    main()
