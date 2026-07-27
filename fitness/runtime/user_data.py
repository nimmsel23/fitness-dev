from __future__ import annotations

import json
from dataclasses import asdict, dataclass
from pathlib import Path
from typing import Any

from fitness.catalog.core.paths import runtime_root
from fitness.catalog.core.session_signal import exercise_has_training_signal, training_values


@dataclass
class RuntimeUser:
    user_id: str
    sessions: int
    inbox: int
    journals: int
    path: str


@dataclass
class SessionSignal:
    user_id: str
    date: str
    session_file: str
    exercise_id: str
    display_name: str
    values: dict[str, Any]
    note: str
    done: bool


def list_runtime_users() -> list[RuntimeUser]:
    users_dir = runtime_root() / "users"
    if not users_dir.exists():
        return []
    users: list[RuntimeUser] = []
    for user_dir in sorted(p for p in users_dir.iterdir() if p.is_dir()):
        users.append(
            RuntimeUser(
                user_id=user_dir.name,
                sessions=len(list((user_dir / "sessions").glob("*.json"))) if (user_dir / "sessions").exists() else 0,
                inbox=len(list((user_dir / "inbox").glob("*.json"))) if (user_dir / "inbox").exists() else 0,
                journals=len(list((user_dir / "journal").glob("*.md"))) if (user_dir / "journal").exists() else 0,
                path=str(user_dir),
            )
        )
    return users


def iter_session_signals(
    *,
    user_id: str | None = None,
    exercise_ids: set[str] | None = None,
    date_from: str | None = None,
    date_to: str | None = None,
) -> list[SessionSignal]:
    users_dir = runtime_root() / "users"
    if not users_dir.exists():
        return []
    user_dirs = [users_dir / user_id] if user_id else sorted(p for p in users_dir.iterdir() if p.is_dir())
    signals: list[SessionSignal] = []
    for user_dir in user_dirs:
        sessions_dir = user_dir / "sessions"
        if not sessions_dir.exists():
            continue
        for session_file in sorted(sessions_dir.glob("*.json")):
            date = session_file.stem.split("__")[0]
            if date_from and date < date_from:
                continue
            if date_to and date > date_to:
                continue
            try:
                data = json.loads(session_file.read_text(encoding="utf-8"))
            except Exception:
                continue
            exercises = data.get("exercises", []) if isinstance(data, dict) else []
            for exercise in exercises:
                if not isinstance(exercise, dict) or not exercise_has_training_signal(exercise):
                    continue
                exercise_id = str(exercise.get("exercise_id") or exercise.get("id") or "").strip()
                if not exercise_id:
                    continue
                if exercise_ids and exercise_id not in exercise_ids:
                    continue
                signals.append(
                    SessionSignal(
                        user_id=user_dir.name,
                        date=date,
                        session_file=str(session_file),
                        exercise_id=exercise_id,
                        display_name=str(exercise.get("name") or exercise_id),
                        values=training_values(exercise),
                        note=str(exercise.get("note") or exercise.get("notes") or ""),
                        done=bool(exercise.get("done")),
                    )
                )
    return signals


def dataclass_payload(items: list[Any]) -> list[dict[str, Any]]:
    return [asdict(item) for item in items]

