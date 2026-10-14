"""Desktop-Benachrichtigung für eingehende Klienten-Workouts (notify-send → swaync)."""
from __future__ import annotations

import os
import subprocess
from pathlib import Path
from datetime import datetime, timedelta, timezone
from typing import Callable

from loguru import logger

from backend.core.conflict import _as_datetime
from backend.sync.pull import Change

LOGO = Path(__file__).resolve().parent / "assets" / "logo.png"   # Fitness-App-Icon (Hantel)
APP_NAME = "Fitness Sync"
MODES = {"strength": "Kraft", "cardio": "Cardio"}
Sender = Callable[[str, str], bool]


def send_desktop(title: str, body: str) -> bool:
    env = {**os.environ}
    env.setdefault("DBUS_SESSION_BUS_ADDRESS", f"unix:path=/run/user/{os.getuid()}/bus")
    try:
        subprocess.run(["notify-send", f"--app-name={APP_NAME}", f"--icon={LOGO}", title, body],
                       env=env, timeout=3, check=True)
        return True
    except Exception as exc:
        logger.warning(f"notify-send fehlgeschlagen: {exc}")
        return False


def describe(data: dict) -> str:
    parts = [data.get("date") or ""]
    mode = data.get("sessionMode")
    if mode:
        parts.append(MODES.get(mode, str(mode)))
    for key in ("block", "trainingsart"):
        if data.get(key):
            parts.append(str(data[key]))
            break
    n = len(data.get("exercises") or [])
    if n:
        parts.append(f"{n} Übungen")
    if data.get("duration"):
        parts.append(str(data["duration"]))
    if data.get("effort") not in (None, ""):
        parts.append(f"Effort {data['effort']}")
    line = " · ".join(p for p in parts if p)
    notes = (data.get("notes") or "").strip().replace("\n", " ")
    if notes:
        line += "\n" + (notes[:80] + "…" if len(notes) > 80 else notes)
    return line


def _is_recent(data: dict, now: datetime, max_age_days: int) -> bool:
    when = _as_datetime(data.get("saved_at")) or _as_datetime(data.get("date"))
    return True if when is None else now - when <= timedelta(days=max_age_days)


def notify_changes(
    name: str,
    uid: str,
    changes: list[Change],
    *,
    send: Sender,
    dry_run: bool = False,
    max_individual: int = 3,
    max_age_days: int = 3,
    now: datetime | None = None,
) -> int:
    """Gibt die Zahl der (versuchten) Benachrichtigungen zurück.

    * Nur kürzlich gespeicherte Workouts (saved_at binnen `max_age_days`) — ein
      erster Pull eines neuen Klienten soll nicht das ganze Archiv melden.
    * Mehr als `max_individual` Treffer → eine Sammelmeldung statt Dauerfeuer.
    """
    now = now or datetime.now(timezone.utc)
    recent = [c for c in changes if _is_recent(c.data, now, max_age_days)]
    if len(recent) < len(changes):
        logger.bind(event="notify", uid=uid, skipped_old=len(changes) - len(recent)).debug(
            f"notify {name}: {len(changes) - len(recent)} ältere Workouts nicht gemeldet"
        )
    if not recent:
        return 0

    if len(recent) <= max_individual:
        messages = [
            (f"{name}: Workout {'eingegangen' if c.action == 'angelegt' else 'aktualisiert'}",
             describe(c.data), c.doc_id) for c in recent
        ]
    else:
        days = ", ".join(sorted({c.data.get("date") or c.doc_id for c in recent})[-5:])
        messages = [(f"{name}: {len(recent)} Workouts eingegangen", days, None)]

    for title, body, doc_id in messages:
        sent = False if dry_run else send(title, body)
        logger.bind(event="notify", uid=uid, doc_id=doc_id, title=title, body=body,
                    sent=sent, dry_run=dry_run).info(
            f"{'[dry-run] würde melden' if dry_run else ('gemeldet' if sent else 'Meldung fehlgeschlagen')}: {title}{' — ' + body.splitlines()[0] if body.strip() else ''}"
        )
    return len(messages)
