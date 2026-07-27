from __future__ import annotations

import json
from dataclasses import asdict, dataclass
from datetime import datetime
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


@dataclass
class ActivityMergePlan:
    user_id: str
    date: str
    canonical_file: str
    sidecar_files: list[str]
    activities: list[dict[str, Any]]
    applied: bool


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


def _session_date(path: Path) -> str | None:
    stem = path.stem
    if len(stem) >= 10 and stem[:10].count("-") == 2:
        return stem[:10]
    return None


def _performed_exercises(session: dict[str, Any]) -> list[dict[str, Any]]:
    return [
        exercise for exercise in (session.get("exercises") or [])
        if isinstance(exercise, dict) and exercise_has_training_signal(exercise)
    ]


def _is_activity_only(session: dict[str, Any]) -> bool:
    return bool(session.get("activity")) and not _performed_exercises(session)


def _same_activity(left: dict[str, Any], right: dict[str, Any]) -> bool:
    keys = ("type", "duration", "notes", "swimStyle", "muscleTarget")
    return tuple(str(left.get(k, "")) for k in keys) == tuple(str(right.get(k, "")) for k in keys)


def _merge_activity(base: dict[str, Any], incoming: dict[str, Any], source_stem: str) -> dict[str, Any]:
    activity = incoming.get("activity")
    if not isinstance(activity, dict) or not activity:
        return base

    merged = dict(base)
    addons = [
        dict(a) for a in (merged.get("activityAddons") or [])
        if isinstance(a, dict)
    ]
    if isinstance(merged.get("activity"), dict) and not any(_same_activity(a, merged["activity"]) for a in addons):
        addons.insert(0, dict(merged["activity"]))

    entry = dict(activity)
    entry.setdefault("_source_stem", source_stem)
    if not any(_same_activity(a, entry) for a in addons):
        addons.append(entry)

    merged["activityAddons"] = addons
    if not isinstance(merged.get("activity"), dict) or not merged.get("activity"):
        merged["activity"] = addons[0]
    if not _performed_exercises(merged):
        merged["sessionMode"] = "cardio"
        merged["activity"] = addons[0]
        merged.setdefault("exercises", [])
    return merged


def merge_day_activities(
    *,
    user_id: str | None = None,
    date_from: str | None = None,
    date_to: str | None = None,
    apply: bool = False,
) -> list[ActivityMergePlan]:
    """Merge local activity-only sidecar JSONs into one canonical day document."""
    users_dir = runtime_root() / "users"
    if not users_dir.exists():
        return []
    user_dirs = [users_dir / user_id] if user_id else sorted(p for p in users_dir.iterdir() if p.is_dir())
    plans: list[ActivityMergePlan] = []

    for user_dir in user_dirs:
        sessions_dir = user_dir / "sessions"
        if not sessions_dir.exists():
            continue
        by_date: dict[str, list[Path]] = {}
        for path in sorted(sessions_dir.glob("*.json")):
            d = _session_date(path)
            if not d:
                continue
            if date_from and d < date_from:
                continue
            if date_to and d > date_to:
                continue
            by_date.setdefault(d, []).append(path)

        for d, paths in by_date.items():
            loaded: list[tuple[Path, dict[str, Any]]] = []
            for path in paths:
                try:
                    data = json.loads(path.read_text(encoding="utf-8"))
                except Exception:
                    continue
                if isinstance(data, dict):
                    loaded.append((path, data))
            sidecars = [(p, s) for p, s in loaded if "__" in p.stem and _is_activity_only(s)]
            if not sidecars:
                continue

            canonical = sessions_dir / f"{d}.json"
            if canonical.exists():
                try:
                    base = json.loads(canonical.read_text(encoding="utf-8"))
                except Exception:
                    base = {}
            else:
                base = {**sidecars[0][1], "date": d, "session_id": None, "exercises": []}

            merged = dict(base)
            for path, session in loaded:
                if _is_activity_only(session):
                    merged = _merge_activity(merged, session, path.stem)
            merged["date"] = d
            merged["session_id"] = None
            if apply:
                merged["saved_at"] = datetime.utcnow().isoformat()
                canonical.write_text(json.dumps(merged, indent=2, ensure_ascii=False), encoding="utf-8")
                for path, _session in sidecars:
                    if path != canonical and path.exists():
                        path.unlink()

            plans.append(
                ActivityMergePlan(
                    user_id=user_dir.name,
                    date=d,
                    canonical_file=str(canonical),
                    sidecar_files=[str(path) for path, _session in sidecars],
                    activities=[
                        dict(session.get("activity") or {}, _source_stem=path.stem)
                        for path, session in loaded
                        if _is_activity_only(session)
                    ],
                    applied=apply,
                )
            )
    return plans


def dataclass_payload(items: list[Any]) -> list[dict[str, Any]]:
    return [asdict(item) for item in items]
