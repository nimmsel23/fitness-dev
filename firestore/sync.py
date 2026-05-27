"""pull/push: Firestore ↔ ~/.aos/fitness/ (one-shot)"""

import json
from pathlib import Path

from loguru import logger
from ._db import get_db, ts, UID

FITNESS_DIR = Path.home() / ".aos" / "fitness"
STATE_DIR   = FITNESS_DIR / "agent-state"


def _load_known(uid: str) -> set:
    state_file = STATE_DIR / f"fsm-known-journal-{uid}.json"
    return set(json.loads(state_file.read_text())) if state_file.exists() else set()

def _save_known(uid: str, ids: set):
    STATE_DIR.mkdir(parents=True, exist_ok=True)
    state_file = STATE_DIR / f"fsm-known-journal-{uid}.json"
    state_file.write_text(json.dumps(sorted(ids), indent=2))


def pull() -> dict:
    db = get_db()
    total_pulled = 0
    total_skipped = 0
    total_journal = 0
    total_inbox = 0

    # Iterate over all user documents in the fitness collection
    for user_doc in db.collection("fitness").stream():
        uid = user_doc.id
        user_dir = FITNESS_DIR / "users" / uid
        sessions_dir = user_dir / "sessions"
        journal_dir = user_dir / "journal"
        inbox_dir = user_dir / "inbox"
        
        sessions_dir.mkdir(parents=True, exist_ok=True)
        journal_dir.mkdir(parents=True, exist_ok=True)
        inbox_dir.mkdir(parents=True, exist_ok=True)

        logger.info(f"Syncing user: {uid}")

        # Pull Sessions
        for doc in db.collection("fitness").document(uid).collection("sessions").stream():
            date, data = doc.id, doc.to_dict()
            local = sessions_dir / f"{date}.json"
            if local.exists():
                try:
                    local_data = json.loads(local.read_text())
                    local_ts  = local_data.get("saved_at", "")
                    remote_ts = ts(data.get("saved_at"))
                    if remote_ts and local_ts and local_ts >= remote_ts:
                        total_skipped += 1
                        continue
                except Exception: pass
            
            out = {k: (ts(v) if hasattr(v, "isoformat") else v) for k, v in data.items()}
            local.write_text(json.dumps(out, indent=2, ensure_ascii=False))
            total_pulled += 1

        # Pull Journal
        known = _load_known(uid)
        for doc in db.collection("fitness").document(uid).collection("journal").stream():
            if doc.id in known:
                continue
            data   = doc.to_dict()
            date   = data.get("date", "")
            text   = data.get("text", "").strip()
            time   = (ts(data.get("time")) or "")[:16]
            if not date or not text:
                continue
            
            md_file = journal_dir / f"{date}.md"
            marker  = f"<!-- fsid:{doc.id} -->"
            if md_file.exists() and marker in md_file.read_text():
                known.add(doc.id)
                continue
            
            with md_file.open("a") as fh:
                fh.write(f"\n{marker}\n**{time}** {text}\n")
            known.add(doc.id)
            total_journal += 1
        
        # Pull Inbox
        for doc in db.collection("fitness").document(uid).collection("inbox").stream():
            data = doc.to_dict()
            name = data.get("name", "unknown").replace(" ", "_")
            local = inbox_dir / f"{doc.id}_{name}.json"
            if not local.exists():
                out = {k: (ts(v) if hasattr(v, "isoformat") else v) for k, v in data.items()}
                local.write_text(json.dumps(out, indent=2, ensure_ascii=False))
                total_inbox += 1

        _save_known(uid, known)

    return {"sessions": total_pulled, "skipped": total_skipped, "journal": total_journal, "inbox": total_inbox}


def push() -> dict:
    db = get_db()
    pushed = skipped = 0
    users_dir = FITNESS_DIR / "users"
    if not users_dir.exists():
        return {"sessions": 0, "sessions_skipped": 0}

    for user_folder in users_dir.iterdir():
        if not user_folder.is_dir(): continue
        uid = user_folder.name
        sessions_dir = user_folder / "sessions"
        if not sessions_dir.exists(): continue

        logger.info(f"Pushing sessions for user: {uid}")

        for f in sorted(sessions_dir.glob("*.json")):
            date       = f.stem
            local_data = json.loads(f.read_text())
            local_ts   = local_data.get("saved_at", "")
            remote     = db.collection("fitness").document(uid).collection("sessions").document(date).get()
            if remote.exists:
                remote_ts = ts(remote.to_dict().get("saved_at"))
                if remote_ts and local_ts and remote_ts >= local_ts:
                    skipped += 1
                    continue
            db.collection("fitness").document(uid).collection("sessions").document(date).set(
                {**local_data, "date": date}
            )
            pushed += 1

    return {"sessions": pushed, "sessions_skipped": skipped}
