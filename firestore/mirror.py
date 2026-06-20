"""Firestore Mirror Daemon — on_snapshot, alle Collections

Lauscht auf Änderungen in:
  fitness/<uid>/sessions/
  fitness/<uid>/journal/
  fitness/<uid>/habits/
  fitness/<uid>/habitJournals/
  fitness/<uid>/habitRecords/

Schreibt lokal nach ~/.aos/users/<uid>/fitness/
"""

import json
import threading
from pathlib import Path

from loguru import logger
from rich.console import Console
from rich.logging import RichHandler

from ._db import get_db, ts, UID

def _user_dir() -> Path:
    uid_file = Path.home() / ".aos" / "users" / ".active-uid"
    uid = uid_file.read_text().strip() if uid_file.exists() else UID
    return Path.home() / ".aos" / "users" / uid / "fitness"

USER_DIR   = _user_dir()
SESSIONS   = USER_DIR / "sessions"
JOURNAL    = USER_DIR / "journal"
HABITS_DIR = USER_DIR / "habits"
STATE_DIR  = Path.home() / ".aos" / "fitness" / "agent-state"
STATE_FILE = STATE_DIR / "fsm-known-journal.json"

console = Console()
_lock = threading.Lock()


def _load_known(path: Path) -> set:
    return set(json.loads(path.read_text())) if path.exists() else set()

def _save_known(path: Path, ids: set):
    path.parent.mkdir(parents=True, exist_ok=True)
    path.write_text(json.dumps(sorted(ids), indent=2))


# ── Sessions ──────────────────────────────────────────────────────────────────

def on_session(col_snapshot, changes, read_time):
    for change in changes:
        if change.type.name not in ("ADDED", "MODIFIED"):
            continue
        doc_id, data = change.document.id, change.document.to_dict()
        SESSIONS.mkdir(parents=True, exist_ok=True)
        local = SESSIONS / f"{doc_id}.json"
        if local.exists() and change.type.name == "MODIFIED":
            local_ts  = json.loads(local.read_text()).get("saved_at", "")
            remote_ts = ts(data.get("saved_at"))
            if remote_ts and local_ts and local_ts >= remote_ts:
                continue
        out = {k: (ts(v) if hasattr(v, "isoformat") else v) for k, v in data.items()}
        local.write_text(json.dumps(out, indent=2, ensure_ascii=False))
        logger.success(f"session ← {doc_id}")


# ── Journal ───────────────────────────────────────────────────────────────────

_known_journal_path = STATE_DIR / f"fsm-known-journal.json"
_known_journal = _load_known(_known_journal_path)

def on_journal(col_snapshot, changes, read_time):
    global _known_journal
    for change in changes:
        if change.type.name != "ADDED":
            continue
        doc_id = change.document.id
        with _lock:
            if doc_id in _known_journal:
                continue
            _known_journal.add(doc_id)
            _save_known(_known_journal_path, _known_journal)
        data = change.document.to_dict()
        date = data.get("date", "")
        text = data.get("text", "").strip()
        time = (ts(data.get("time")) or "")[:16]
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


# ── Habits (Definitionen) ─────────────────────────────────────────────────────

def on_habits(col_snapshot, changes, read_time):
    HABITS_DIR.mkdir(parents=True, exist_ok=True)
    defs_file = HABITS_DIR / "definitions.json"
    defs = json.loads(defs_file.read_text()) if defs_file.exists() else []
    defs_map = {h["uuid"]: h for h in defs}
    changed = False
    for change in changes:
        if change.type.name not in ("ADDED", "MODIFIED"):
            continue
        doc_id = change.document.id
        data   = change.document.to_dict()
        entry  = {
            "uuid":       doc_id,
            "name":       data.get("name", ""),
            "icon":       data.get("icon", "Activity"),
            "deleted":    bool(data.get("deleted", False)),
            "created_at": ts(data.get("created_at")) or "",
        }
        defs_map[doc_id] = entry
        changed = True
        logger.success(f"habit ← {data.get('name', doc_id)}")
    if changed:
        defs_file.write_text(json.dumps(list(defs_map.values()), indent=2, ensure_ascii=False))


# ── HabitRecords (Completions) ────────────────────────────────────────────────

_known_hr_path = STATE_DIR / f"fsm-known-habit-records-{UID}.json"
_known_hr = _load_known(_known_hr_path)

def on_habit_records(col_snapshot, changes, read_time):
    global _known_hr
    for change in changes:
        if change.type.name != "ADDED":
            continue
        doc_id = change.document.id
        with _lock:
            if doc_id in _known_hr:
                continue
            _known_hr.add(doc_id)
        data       = change.document.to_dict()
        date       = data.get("date", "")
        habit_id   = data.get("habitId", "")
        completion = data.get("completion", "DONE")
        rec_at     = (ts(data.get("recorded_at")) or "")[:16]
        if not date or not habit_id:
            continue

        # Records-File für diesen Tag aktualisieren
        HABITS_DIR.mkdir(parents=True, exist_ok=True)
        rec_dir  = HABITS_DIR / "records"
        rec_dir.mkdir(parents=True, exist_ok=True)
        rec_file = rec_dir / f"{date}.json"
        records  = json.loads(rec_file.read_text()) if rec_file.exists() else []
        if not any(r.get("uuid") == habit_id for r in records):
            records.append({"uuid": habit_id, "date": date, "completion": completion, "ts": rec_at})
            rec_file.write_text(json.dumps(records, indent=2, ensure_ascii=False))

        # Journal-Markdown
        JOURNAL.mkdir(parents=True, exist_ok=True)
        md_file = JOURNAL / f"{date}.md"
        marker  = f"<!-- fshr:{doc_id} -->"
        if not (md_file.exists() and marker in md_file.read_text()):
            with md_file.open("a", encoding="utf-8") as fh:
                fh.write(f"\n{marker}\n")
                if rec_at:
                    fh.write(f"**{habit_id}** {completion} _{rec_at}_\n")
                else:
                    fh.write(f"**{habit_id}** {completion}\n")
        with _lock:
            _save_known(_known_hr_path, _known_hr)
        logger.success(f"habit_record ← {date} {habit_id}")


# ── HabitJournals (Memoirs) ───────────────────────────────────────────────────

_known_hj_path = STATE_DIR / f"fsm-known-habit-journal-{UID}.json"
_known_hj = _load_known(_known_hj_path)

def on_habit_journals(col_snapshot, changes, read_time):
    global _known_hj
    for change in changes:
        if change.type.name not in ("ADDED", "MODIFIED"):
            continue
        doc_id = change.document.id
        with _lock:
            if doc_id in _known_hj:
                continue
            _known_hj.add(doc_id)
        data     = change.document.to_dict()
        date     = data.get("date", "")
        text     = data.get("text", "").strip()
        habit_id = data.get("habitId", "")
        feedback = data.get("coachFeedback", "").strip()
        if not date:
            continue
        JOURNAL.mkdir(parents=True, exist_ok=True)
        md_file = JOURNAL / f"{date}.md"
        marker  = f"<!-- fshid:{doc_id} -->"
        if md_file.exists() and marker in md_file.read_text():
            with _lock:
                _save_known(_known_hj_path, _known_hj)
            continue
        with md_file.open("a", encoding="utf-8") as fh:
            fh.write(f"\n{marker}\n**Habit: {habit_id}**\n")
            if text:
                fh.write(f"{text}\n")
            if feedback:
                fh.write(f"> **Coach Feedback:** {feedback}\n")
        with _lock:
            _save_known(_known_hj_path, _known_hj)
        logger.success(f"habit_journal ← {date} {habit_id} {text[:40]}")


# ── Main ──────────────────────────────────────────────────────────────────────

def main():
    logger.remove()
    logger.add(
        RichHandler(console=console, rich_tracebacks=True),
        format="{message}", level="INFO",
    )
    db  = get_db()
    ref = db.collection("fitness").document(UID)
    watchers = [
        ref.collection("sessions").on_snapshot(on_session),
        ref.collection("journal").on_snapshot(on_journal),
        ref.collection("habits").on_snapshot(on_habits),
        ref.collection("habitRecords").on_snapshot(on_habit_records),
        ref.collection("habitJournals").on_snapshot(on_habit_journals),
    ]
    logger.info(f"Listening → fitness/{UID}/ [sessions|journal|habits|habitRecords|habitJournals]")
    logger.info(f"Mirror → {USER_DIR}")
    try:
        threading.Event().wait()
    except KeyboardInterrupt:
        for w in watchers:
            w.unsubscribe()


if __name__ == "__main__":
    main()
