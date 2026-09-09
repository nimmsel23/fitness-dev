"""Zentraler Resolver für Runtime-Session-JSONs.

Ersetzt den vorher in mehreren Runtime-Helpern (``user_data.py``,
``note_backfill.py``) kopierten Block ``runtime_root() / "users" / <uid> /
"sessions"`` + ``glob("*.json")`` + Ad-hoc-Datumsparsing aus dem Dateinamen.

Session-JSONs liegen **flach** als ``sessions/YYYY-MM-DD.json`` bzw.
``sessions/YYYY-MM-DD__<session_id>.json`` (Activity-/HIIT-Sidecar einer
Mehrfach-Session desselben Tages).

Bewusst **keine** Jahr/Monat-Ordnerverschachtelung: die schreibenden Stellen
(``server.mjs``, ``fitness/api/routers/sessions.py``,
``fitness/firestore/mirror.py``, ``firestore-mirror.mjs``) legen weiterhin
flach ab. Eine Verschachtelung ohne synchrone Migration bestehender Daten
**und** Umstellung aller Schreiber würde den Datenbestand spalten — siehe
``NEXT.md``. Dieser Resolver ist die Voraussetzung dafür, das später an genau
einer Stelle nachzuziehen.
"""

from __future__ import annotations

from collections.abc import Iterator
from pathlib import Path

from fitness.catalog.core.paths import runtime_root

__all__ = [
    "runtime_users_dir",
    "user_dirs",
    "user_sessions_dir",
    "session_path",
    "session_date",
    "iter_session_files",
]


def runtime_users_dir() -> Path:
    """``~/.aos/fitness/users`` (bzw. ``$FITNESS_AGENT_HOME/users``)."""
    return runtime_root() / "users"


def user_dirs(user_id: str | None = None) -> list[Path]:
    """Alle Runtime-User-Verzeichnisse, oder nur das eine benannte.

    Leere Liste, wenn das Wurzelverzeichnis fehlt oder die benannte UID kein
    Verzeichnis hat.
    """
    root = runtime_users_dir()
    if not root.exists():
        return []
    if user_id:
        one = root / user_id
        return [one] if one.is_dir() else []
    return sorted(p for p in root.iterdir() if p.is_dir())


def user_sessions_dir(user_id: str) -> Path:
    """``<users>/<uid>/sessions`` — nicht zwingend existent."""
    return runtime_users_dir() / user_id / "sessions"


def session_path(user_id: str, date: str, session_id: str | None = None) -> Path:
    """Kanonischer Pfad einer Session-JSON.

    ``date`` = ``"YYYY-MM-DD"``. Mit ``session_id`` der Sidecar-Name
    ``YYYY-MM-DD__<session_id>.json`` (die Haupt-Session des Tages trägt
    keinen Suffix) — konsistent mit ``fitness/api/config.py::_session_file``
    und ``fitness/firestore/mirror.py::mirror_session``.
    """
    stem = f"{date}__{session_id}" if session_id else date
    return user_sessions_dir(user_id) / f"{stem}.json"


def session_date(path: Path) -> str | None:
    """Datum aus dem Dateinamen (``YYYY-MM-DD`` bzw. ``YYYY-MM-DD__<id>``).

    ``None``, wenn der Name nicht mit einem ISO-Datum beginnt.
    """
    stem = path.stem.split("__", 1)[0]
    if len(stem) == 10 and stem[4] == "-" and stem[7] == "-":
        return stem
    return None


def iter_session_files(
    user_id: str | None = None,
    *,
    date_from: str | None = None,
    date_to: str | None = None,
) -> Iterator[tuple[str, Path]]:
    """Liefert ``(uid, pfad)`` je Session-JSON.

    Sortierung: nach UID, dann nach Dateiname (= chronologisch, da ISO-Datum-
    Präfix). ``date_from`` / ``date_to`` filtern **inklusiv** über das
    Namens-Datum. Dateien ohne parsebares Datum werden übersprungen
    (die Runtime-Session-Ordner enthalten ausschließlich datierte JSONs).
    """
    for udir in user_dirs(user_id):
        sdir = udir / "sessions"
        if not sdir.exists():
            continue
        for path in sorted(sdir.glob("*.json")):
            day = session_date(path)
            if day is None:
                continue
            if date_from and day < date_from:
                continue
            if date_to and day > date_to:
                continue
            yield udir.name, path
