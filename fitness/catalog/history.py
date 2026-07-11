from __future__ import annotations

import sqlite3
from contextlib import closing
from dataclasses import dataclass
from datetime import datetime
from pathlib import Path
from typing import Any

from fitness.catalog.core.paths import runtime_root
from fitness.catalog.core.resolver import resolve_query


DB_FILENAME = "training_history.sqlite"


@dataclass
class TrainingLogResult:
    exercise_id: str
    display_name: str
    workout_id: str
    row_id: int


def history_db_path() -> Path:
    return Path.home() / ".aos" / "fitness" / "sessions" / DB_FILENAME


def ensure_history_db() -> Path:
    db_path = history_db_path()
    db_path.parent.mkdir(parents=True, exist_ok=True)
    with closing(sqlite3.connect(db_path)) as connection:
        connection.execute(
            """
            CREATE TABLE IF NOT EXISTS training_history (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                date TEXT NOT NULL,
                workout_id TEXT NOT NULL,
                exercise_id TEXT NOT NULL,
                display_name TEXT NOT NULL,
                sets INTEGER NOT NULL,
                reps INTEGER NOT NULL,
                weight REAL NOT NULL,
                rpe INTEGER NOT NULL,
                done INTEGER NOT NULL DEFAULT 0,
                notes TEXT NOT NULL DEFAULT '',
                pain TEXT NOT NULL DEFAULT '',
                completion_status TEXT NOT NULL DEFAULT 'completed'
            )
            """
        )
        columns = {row[1] for row in connection.execute("PRAGMA table_info(training_history)").fetchall()}
        if "done" not in columns:
            connection.execute("ALTER TABLE training_history ADD COLUMN done INTEGER NOT NULL DEFAULT 0")
        connection.execute(
            "CREATE INDEX IF NOT EXISTS idx_training_history_exercise_date ON training_history(exercise_id, date DESC, id DESC)"
        )
        connection.commit()
    return db_path


def log_training_entry(
    exercise_query: str,
    *,
    sets: int,
    reps: int,
    weight: float,
    rpe: int,
    workout_id: str | None = None,
    date: str | None = None,
    notes: str = "",
    pain: str = "",
    completion_status: str = "completed",
    done: bool = False,
) -> TrainingLogResult:
    resolution = resolve_query(exercise_query)
    if not resolution.matched or not resolution.canonical_id:
        raise ValueError(f"Unknown exercise: {exercise_query}")

    display_name = resolution.display_name or resolution.canonical_id
    db_path = ensure_history_db()
    entry_date = date or datetime.now().date().isoformat()
    entry_workout_id = workout_id or datetime.now().strftime("workout-%Y%m%dT%H%M%S")

    with closing(sqlite3.connect(db_path)) as connection:
        cursor = connection.execute(
            """
            INSERT INTO training_history (
                date, workout_id, exercise_id, display_name, sets, reps, weight, rpe, done, notes, pain, completion_status
            ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
            """,
            (
                entry_date,
                entry_workout_id,
                resolution.canonical_id,
                display_name,
                sets,
                reps,
                weight,
                rpe,
                1 if done else 0,
                notes or "",
                pain or "",
                completion_status or "completed",
            ),
        )
        connection.commit()

    return TrainingLogResult(
        exercise_id=resolution.canonical_id,
        display_name=display_name,
        workout_id=entry_workout_id,
        row_id=int(cursor.lastrowid),
    )


def read_history(exercise_query: str, limit: int = 10) -> list[dict[str, Any]]:
    resolution = resolve_query(exercise_query)
    if not resolution.matched or not resolution.canonical_id:
        raise ValueError(f"Unknown exercise: {exercise_query}")

    db_path = ensure_history_db()
    with closing(sqlite3.connect(db_path)) as connection:
        connection.row_factory = sqlite3.Row
        rows = connection.execute(
            """
            SELECT date, workout_id, exercise_id, display_name, sets, reps, weight, rpe, done, notes, pain, completion_status
            FROM training_history
            WHERE exercise_id = ?
            ORDER BY date DESC, id DESC
            LIMIT ?
            """,
            (resolution.canonical_id, limit),
        ).fetchall()
    return [dict(row) for row in rows]


def read_history_range(date_from: str, date_to: str) -> list[dict[str, Any]]:
    db_path = ensure_history_db()
    with closing(sqlite3.connect(db_path)) as connection:
        connection.row_factory = sqlite3.Row
        rows = connection.execute(
            """
            SELECT date, workout_id, exercise_id, display_name, sets, reps, weight, rpe, done, notes, pain, completion_status
            FROM training_history
            WHERE date BETWEEN ? AND ?
            ORDER BY date DESC, id DESC
            """,
            (date_from, date_to),
        ).fetchall()
    return [dict(row) for row in rows]


def progress_hint(exercise_query: str) -> dict[str, Any]:
    entries = read_history(exercise_query, limit=5)
    if not entries:
        return {
            "exercise_id": resolve_query(exercise_query).canonical_id if resolve_query(exercise_query).matched else None,
            "suggestion": "No history yet",
            "reason": "Log at least one session first.",
        }

    latest = entries[0]
    reps = int(latest["reps"])
    rpe = int(latest["rpe"])
    pain = str(latest.get("pain", "")).strip()

    if pain:
        return {
            "exercise_id": latest["exercise_id"],
            "suggestion": "Use caution",
            "reason": "Pain was noted in the latest entry.",
        }

    if rpe <= 8 and reps >= 10:
        return {
            "exercise_id": latest["exercise_id"],
            "suggestion": "Increase load slightly",
            "reason": "Top reps were achieved at target RPE.",
        }

    if reps < 8:
        return {
            "exercise_id": latest["exercise_id"],
            "suggestion": "Keep load",
            "reason": "Reps are below the simple progression threshold.",
        }

    return {
        "exercise_id": latest["exercise_id"],
        "suggestion": "Keep load",
        "reason": "No clear progression signal yet.",
    }
