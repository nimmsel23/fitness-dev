"""pull/push: Firestore ↔ ~/.aos/users/<uid>/ (one-shot)"""

import json
from pathlib import Path

from ._db import get_db, ts, UID

USERS_DIR = Path.home() / ".aos" / "users"
STATE_DIR = Path.home() / ".aos" / "fitness" / "agent-state"  # state bleibt kompatibel


def _load_known(uid: str) -> set:
    state_file = STATE_DIR / f"fsm-known-journal-{uid}.json"
    return set(json.loads(state_file.read_text())) if state_file.exists() else set()

def _save_known(uid: str, ids: set):
    STATE_DIR.mkdir(parents=True, exist_ok=True)
    state_file = STATE_DIR / f"fsm-known-journal-{uid}.json"
    state_file.write_text(json.dumps(sorted(ids), indent=2))

def _load_known_habits(uid: str) -> set:
    state_file = STATE_DIR / f"fsm-known-habit-journal-{uid}.json"
    return set(json.loads(state_file.read_text())) if state_file.exists() else set()

def _save_known_habits(uid: str, ids: set):
    STATE_DIR.mkdir(parents=True, exist_ok=True)
    state_file = STATE_DIR / f"fsm-known-habit-journal-{uid}.json"
    state_file.write_text(json.dumps(sorted(ids), indent=2))


def pull() -> dict:
    db = get_db()
    total_pulled = 0
    total_skipped = 0
    total_journal = 0
    total_habit_journal = 0
    total_inbox = 0

    # Iterate over all user documents in the fitness collection
    for user_ref in db.collection("fitness").list_documents():
        uid = user_ref.id
        user_dir = USERS_DIR / uid / "fitness"
        sessions_dir = user_dir / "sessions"
        journal_dir = user_dir / "journal"
        inbox_dir = user_dir / "inbox"
        
        sessions_dir.mkdir(parents=True, exist_ok=True)
        journal_dir.mkdir(parents=True, exist_ok=True)
        inbox_dir.mkdir(parents=True, exist_ok=True)

        # logger.info(f"Syncing user: {uid}")

        # Fetch Habits for name resolution
        habit_names = {}
        try:
            for hdoc in db.collection("fitness").document(uid).collection("habits").stream():
                hdata = hdoc.to_dict()
                habit_names[hdoc.id] = hdata.get("name", "Unknown Habit")
        except Exception:
            pass

        # Pull Sessions
        for doc in db.collection("fitness").document(uid).collection("sessions").stream():
            doc_id, data = doc.id, doc.to_dict()
            actual_date = data.get("date") or doc_id.split("__")[0]
            local = sessions_dir / f"{doc_id}.json"
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

            # Unify notes into journal markdown
            notes = data.get("notes", "").strip()
            if notes:
                md_file = journal_dir / f"{actual_date}.md"
                marker = f"<!-- fssn:{doc_id} -->"
                if not (md_file.exists() and marker in md_file.read_text()):
                    block = data.get("block", "Training")
                    with md_file.open("a", encoding="utf-8") as fh:
                        fh.write(f"\n{marker}\n**Session: {block}**\n{notes}\n")

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

        # Pull Habit Journal (Memoirs — auch ohne Text-Body ziehen)
        known_habits = _load_known_habits(uid)
        for doc in db.collection("fitness").document(uid).collection("habitJournals").stream():
            if doc.id in known_habits:
                continue
            data = doc.to_dict()
            date = data.get("date", "")
            text = data.get("text", "").strip()
            coach_feedback = data.get("coachFeedback", "").strip()
            hid   = data.get("habitId", "")
            hname = habit_names.get(hid, f"Habit:{hid}")
            time  = (ts(data.get("recorded_at") or data.get("updated_at")) or "")[:16]

            if not date:
                continue

            md_file = journal_dir / f"{date}.md"
            marker  = f"<!-- fshid:{doc.id} -->"
            if md_file.exists() and marker in md_file.read_text():
                known_habits.add(doc.id)
                continue

            with md_file.open("a", encoding="utf-8") as fh:
                fh.write(f"\n{marker}\n**Habit: {hname}**")
                if time:
                    fh.write(f" _{time}_")
                fh.write(f"\n{text}\n" if text else "\n")
                if coach_feedback:
                    fh.write(f"> **Coach Feedback:** {coach_feedback}\n")
            known_habits.add(doc.id)
            total_habit_journal += 1

        # Pull Habit Records (Completions → Journal-Eintrag pro Tag)
        state_file_hr = STATE_DIR / f"fsm-known-habit-records-{uid}.json"
        known_records = set(json.loads(state_file_hr.read_text())) if state_file_hr.exists() else set()
        for doc in db.collection("fitness").document(uid).collection("habitRecords").stream():
            if doc.id in known_records:
                continue
            data  = doc.to_dict()
            date  = data.get("date", "")
            hid   = data.get("habitId", "")
            hname = habit_names.get(hid, f"Habit:{hid}")
            rec_at = (ts(data.get("recorded_at")) or "")[:16]
            completion = data.get("completion", "DONE")
            if not date:
                continue
            md_file = journal_dir / f"{date}.md"
            marker  = f"<!-- fshr:{doc.id} -->"
            if md_file.exists() and marker in md_file.read_text():
                known_records.add(doc.id)
                continue
            with md_file.open("a", encoding="utf-8") as fh:
                fh.write(f"\n{marker}\n**{hname}** {completion}")
                if rec_at:
                    fh.write(f" _{rec_at}_")
                fh.write("\n")
            known_records.add(doc.id)
            total_habit_journal += 1
        state_file_hr.parent.mkdir(parents=True, exist_ok=True)
        state_file_hr.write_text(json.dumps(sorted(known_records), indent=2))
        
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
        _save_known_habits(uid, known_habits)

    return {"sessions": total_pulled, "skipped": total_skipped, "journal": total_journal, "habit_journal": total_habit_journal, "inbox": total_inbox}


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

        # logger.info(f"Pushing sessions for user: {uid}")

        for f in sorted(sessions_dir.glob("*.json")):
            doc_id     = f.stem
            actual_date = doc_id.split("__")[0]
            local_data = json.loads(f.read_text())
            local_ts   = local_data.get("saved_at", "")
            remote     = db.collection("fitness").document(uid).collection("sessions").document(doc_id).get()
            if remote.exists:
                remote_ts = ts(remote.to_dict().get("saved_at"))
                if remote_ts and local_ts and remote_ts >= local_ts:
                    skipped += 1
                    continue
            db.collection("fitness").document(uid).collection("sessions").document(doc_id).set(
                {**local_data, "date": actual_date}
            )
            pushed += 1

    return {"sessions": pushed, "sessions_skipped": skipped}
