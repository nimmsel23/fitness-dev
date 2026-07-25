"""Firestore Mirror Daemon — on_snapshot, alle Collections

Lauscht auf Änderungen in:
  fitness/<uid>/sessions/
  fitness/<uid>/journal/
  fitness/<uid>/habits/
  fitness/<uid>/habitJournals/
  fitness/<uid>/habitRecords/
  fitness/<uid>/inbox/            — Coach-Inbox (Exercise-Review-Drafts)
  nutrition/<uid>/logs/           — Fuel-Nährwert-Logs
  supplements/<uid>/logs/         — Fuel-Supplement-Logs
  supplements/<uid>/meta/catalog  — Fuel-Supplement-Katalog

Schreibt lokal nach ~/.aos/users/<uid>/fitness/ (Inbox landet zusätzlich
physisch unter runtime_root()/users/<uid>/inbox/, siehe fitness/catalog/
api/watcher.py — beide Pfade sind derselbe Ort, ~/.aos/users/<uid>/fitness
ist nur ein Symlink darauf) bzw. via firestore.fuel-Pfadhelfer nach
~/.aos/fuel/.
"""

import json
import threading
from pathlib import Path

import yaml
from loguru import logger
from rich.console import Console
from rich.logging import RichHandler

from ._db import get_db, ts, UID
from .fuel import _data_dir, _nutrition_path, _supplements_path, _supplements_catalog_path, _strip_meta, _write_json

def _user_dir() -> Path:
    uid_file = Path.home() / ".aos" / "users" / ".active-uid"
    uid = uid_file.read_text().strip() if uid_file.exists() else UID
    return Path.home() / ".aos" / "users" / uid / "fitness"

USER_DIR   = _user_dir()
SESSIONS   = USER_DIR / "sessions"
JOURNAL    = USER_DIR / "journal"
HABITS_DIR = USER_DIR / "habits"
INBOX_DIR  = USER_DIR / "inbox"
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
        # sync_gateway: Firestore-Pfad → SQLite (Python-only write, kein server.mjs beteiligt)
        day = doc_id.split("__")[0]
        sid = doc_id.split("__")[1] if "__" in doc_id else None
        try:
            from catalog.api.sync_gateway import sync_session as _gw_sync
            n = _gw_sync(day, out, session_id=sid)
            logger.debug(f"sync_gateway ← {doc_id}  {n} rows")
        except Exception as exc:
            logger.warning(f"sync_gateway {doc_id}: {exc}")


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


# ── Inbox (Coach-Review-Drafts) ───────────────────────────────────────────────

def on_inbox(col_snapshot, changes, read_time):
    for change in changes:
        if change.type.name != "ADDED":
            continue
        doc_id, data = change.document.id, change.document.to_dict()
        name = str(data.get("name", "unknown")).replace(" ", "_")
        INBOX_DIR.mkdir(parents=True, exist_ok=True)
        local = INBOX_DIR / f"{doc_id}_{name}.json"
        if local.exists():
            continue
        out = {k: (ts(v) if hasattr(v, "isoformat") else v) for k, v in data.items()}
        local.write_text(json.dumps(out, indent=2, ensure_ascii=False))
        logger.success(f"inbox ← {name} ({doc_id})")


# ── KB Exercises (Coach-Approvals aus dem Firebase-Inbox-Tab) ────────────────
#
# approveInbox() (src/lib/db/firestore/inbox.js) schreibt bei Approval NUR nach
# Firestore: fitness/kb/exercises/{exId} (source: "approved") +
# fitness/{uid}/inbox/{id}.status = "approved". Ohne diesen Listener bleibt der
# lokale Katalog (fitness/catalog/kb/) davon komplett unberührt — der nächste
# "fitness sync kb"-Push (One-Way lokal→Firestore) würde die approved Version
# sogar wieder mit dem alten unreviewten Stand überschreiben. Dieser Listener
# schließt den Kreis event-getrieben (on_snapshot, kein Polling):
#   1. approved Exercise → lokale Sammel-Datei kb/exercises/approved_from_firebase.yml
#   2. zugehöriger kb/inbox/inbox_*.yml-Draft wird lokal gelöscht (reviewt, fertig)

from fitness.catalog.core.paths import DATA_DIR as _CATALOG_DATA_DIR

_APPROVED_FILE = _CATALOG_DATA_DIR / "exercises" / "approved_from_firebase.yml"


def _slugify(name: str) -> str:
    return str(name or "").lower().replace(" ", "_")


def _remove_inbox_draft(exercise_id: str, display_name: str) -> None:
    inbox_dir = _CATALOG_DATA_DIR / "inbox"
    if not inbox_dir.exists():
        return
    candidates = {f"inbox_{_slugify(exercise_id)}.yml", f"inbox_{_slugify(display_name)}.yml"}
    for f in inbox_dir.glob("inbox_*.yml"):
        if f.name in candidates:
            f.unlink()
            logger.info(f"inbox draft entfernt (approved): {f.name}")


def on_kb_exercises(col_snapshot, changes, read_time):
    for change in changes:
        if change.type.name not in ("ADDED", "MODIFIED"):
            continue
        data = change.document.to_dict()
        if data.get("source") != "approved":
            continue
        ex_id = data.get("exercise_id") or data.get("id") or change.document.id
        display_name = data.get("display_name") or data.get("name") or ex_id

        _APPROVED_FILE.parent.mkdir(parents=True, exist_ok=True)
        doc = yaml.safe_load(_APPROVED_FILE.read_text(encoding="utf-8")) if _APPROVED_FILE.exists() else None
        if not isinstance(doc, dict):
            doc = {"name": "approved_from_firebase", "description": "Coach-approved via Firebase Inbox", "exercises": []}
        exercises = doc.setdefault("exercises", [])
        clean = {k: v for k, v in data.items() if not hasattr(v, "isoformat")}
        for i, existing in enumerate(exercises):
            if (existing.get("exercise_id") or existing.get("id")) == ex_id:
                exercises[i] = clean
                break
        else:
            exercises.append(clean)
        with _APPROVED_FILE.open("w", encoding="utf-8") as fh:
            yaml.safe_dump(doc, fh, allow_unicode=True, sort_keys=False)

        _remove_inbox_draft(ex_id, display_name)
        logger.success(f"kb exercise ← approved: {display_name} ({ex_id})")


# ── Fuel (Nutrition / Supplements) ────────────────────────────────────────────

def on_nutrition(col_snapshot, changes, read_time):
    data_dir = _data_dir(UID)
    for change in changes:
        if change.type.name not in ("ADDED", "MODIFIED"):
            continue
        doc_id, data = change.document.id, change.document.to_dict()
        _write_json(_nutrition_path(doc_id, data_dir), _strip_meta(data))
        logger.success(f"nutrition ← {doc_id}")


def on_supplements(col_snapshot, changes, read_time):
    data_dir = _data_dir(UID)
    for change in changes:
        if change.type.name not in ("ADDED", "MODIFIED"):
            continue
        doc_id, data = change.document.id, change.document.to_dict()
        _write_json(_supplements_path(doc_id, data_dir), _strip_meta(data))
        logger.success(f"supplements ← {doc_id}")


def on_supplements_catalog(doc_snapshot, changes, read_time):
    if not doc_snapshot:
        return
    data_dir = _data_dir(UID)
    doc = doc_snapshot[0]
    if not doc.exists:
        return
    _write_json(_supplements_catalog_path(data_dir), _strip_meta(doc.to_dict()))
    logger.success("supplements catalog ← updated")


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
        ref.collection("inbox").on_snapshot(on_inbox),
        db.collection("fitness").document("kb").collection("exercises").on_snapshot(on_kb_exercises),
        db.collection("nutrition").document(UID).collection("logs").on_snapshot(on_nutrition),
        db.collection("supplements").document(UID).collection("logs").on_snapshot(on_supplements),
        db.collection("supplements").document(UID).collection("meta").document("catalog").on_snapshot(on_supplements_catalog),
    ]
    logger.info(f"Listening → fitness/{UID}/ [sessions|journal|habits|habitRecords|habitJournals|inbox]")
    logger.info("Listening → fitness/kb/exercises [approved]")
    logger.info(f"Listening → nutrition/{UID}/logs, supplements/{UID}/logs+meta")
    logger.info(f"Mirror → {USER_DIR} (+ {_data_dir(UID)} für Fuel)")
    try:
        threading.Event().wait()
    except KeyboardInterrupt:
        for w in watchers:
            w.unsubscribe()


if __name__ == "__main__":
    main()


# ── Push-Stubs (fire-and-forget, für python-backend/server.py) ────────────────

from datetime import datetime

def mirror_session(date: str, session: dict, uid: str = UID) -> None:
    try:
        db = get_db()
        out = {**session, "date": date, "saved_at": datetime.utcnow().isoformat()}
        db.collection("fitness").document(uid).collection("sessions").document(date).set(out)
    except Exception as e:
        logger.warning(f"mirror_session fehler: {e}")

def mirror_journal(date: str, entry: dict, uid: str = UID) -> None:
    try:
        db = get_db()
        db.collection("fitness").document(uid).collection("journal").add(
            {**entry, "date": date, "time": datetime.utcnow().isoformat()}
        )
    except Exception as e:
        logger.warning(f"mirror_journal fehler: {e}")

def mirror_plan(plan: dict, uid: str = UID) -> None:
    try:
        db = get_db()
        db.collection("fitness").document(uid).collection("plan").document("active").set(
            {**plan, "updated_at": datetime.utcnow().isoformat()}
        )
    except Exception as e:
        logger.warning(f"mirror_plan fehler: {e}")

def get_status() -> dict:
    try:
        db = get_db()
        return {"ok": True, "project": db._client.project}
    except Exception:
        return {"ok": False, "project": None}
