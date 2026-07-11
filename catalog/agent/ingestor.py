from __future__ import annotations

import json
import sqlite3
from contextlib import closing
from pathlib import Path
from typing import Any

from catalog.core.paths import runtime_root
from catalog.history import ensure_history_db, log_training_entry
from catalog.core.resolver import resolve_query
from catalog.core.loader import load_catalog_directory_yaml

def ingest_all_sessions():
    users_dir = runtime_root() / "users"
    if not users_dir.exists():
        return
    
    db_path = ensure_history_db()
    
    # We use a set of known (workout_id, exercise_id, date) to avoid duplicates
    # or we can use a simpler approach: tracking which session files we already processed.
    # For now, let's use a simple "INSERT OR IGNORE" logic if we had a unique constraint,
    # but the current schema doesn't have one. 
    # Let's add a unique constraint to training_history if possible, or check before insert.
    
    processed_count = 0
    for uid_dir in users_dir.iterdir():
        if not uid_dir.is_dir():
            continue
        sessions_dir = uid_dir / "sessions"
        if not sessions_dir.exists():
            continue
            
        for session_file in sessions_dir.glob("*.json"):
            try:
                session_data = json.loads(session_file.read_text())
                date = session_file.stem
                exercises = session_data.get("exercises", [])
                
                for ex in exercises:
                    # Ingest each exercise entry
                    # Check if already exists
                    if not is_already_ingested(db_path, date, ex.get("id"), session_data.get("block")):
                        log_training_entry(
                            exercise_query=ex.get("name") or ex.get("id"),
                            sets=int(ex.get("sets", 0)),
                            reps=int(ex.get("reps", 0)),
                            weight=float(ex.get("weight", 0)),
                            rpe=int(ex.get("rpe", 0)),
                            workout_id=session_data.get("block", "Session"),
                            date=date,
                            done=bool(ex.get("done", False))
                        )
                        processed_count += 1
            except Exception:
                continue
    return processed_count

def is_already_ingested(db_path: Path, date: str, exercise_id: str, workout_id: str) -> bool:
    with closing(sqlite3.connect(db_path)) as conn:
        res = conn.execute(
            "SELECT 1 FROM training_history WHERE date = ? AND exercise_id = ? AND workout_id = ? LIMIT 1",
            (date, exercise_id, workout_id)
        ).fetchone()
        return res is not None

def get_top_unreviewed_exercises(limit: int = 5, days: int = 28) -> list[tuple[str, int]]:
    """Returns a list of (exercise_id, usage_count) for exercises that are currently 'unreviewed',
    focusing on the most recent sessions.
    """
    db_path = ensure_history_db()
    
    # 1. Get usage counts within the time window
    with closing(sqlite3.connect(db_path)) as conn:
        usage = conn.execute(
            f"SELECT exercise_id, COUNT(*) as count FROM training_history "
            f"WHERE date >= date('now', '-{days} days') "
            f"GROUP BY exercise_id ORDER BY count DESC"
        ).fetchall()
    
    # 2. Filter for unreviewed exercises and those not already in the inbox
    unreviewed_ids = set()
    for path, doc in load_catalog_directory_yaml("exercises"):
        # We look for unreviewed tag or the unreviewed_ prefix in the file name
        if "unreviewed" in path.name:
            for ex in doc.get("exercises", []):
                unreviewed_ids.add(ex.get("exercise_id") or ex.get("id"))
    
    results = []
    for ex_id, count in usage:
        if ex_id in unreviewed_ids:
            # Also check if it's already in the inbox (inbox_{ex_id}.yml)
            inbox_file = Path(f"catalog/kb/exercises/inbox_{ex_id}.yml")
            if not inbox_file.exists():
                results.append((ex_id, count))
                if len(results) >= limit:
                    break
    return results
