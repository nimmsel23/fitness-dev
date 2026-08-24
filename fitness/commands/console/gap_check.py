"""Periodischer Trainingsluecken-Check ueber alle Klienten.

**Root-Cause-Fix (2026-08-24):** vorher gab es pro Klient KEINE
Fehlerbehandlung — flog irgendwo (kaputte Journal-Datei, Firestore-Timeout,
Gemini-Fehler in check_training_gap) eine Exception, starb der komplette
Daemon-Thread lautlos und lief nie wieder (`fitness-log console` schien dann
"nur bis zum letzten Klienten in Registry-Reihenfolge zu kommen" und danach
nichts mehr zu tun). Jetzt: try/except PRO Klient, Fehler werden geloggt statt
den Loop zu killen, ein einzelner defekter Klienten-Datensatz blockiert die
anderen nicht mehr.
"""
from __future__ import annotations

import queue as _queue
import time

from loguru import logger

from ...paths import AOS_USERS
from .events import event_line


def gap_check_loop(
    registry: dict,
    events: "_queue.Queue[str]",
    interval: int,
) -> None:
    from fitness.catalog.agent.coach_ai import check_training_gap

    while True:
        for meta in registry.values():
            name = meta.get("name", "?")
            try:
                _check_one_client(meta, events, check_training_gap)
            except Exception as exc:
                logger.exception(f"console gap-check fehlgeschlagen fuer Klient '{name}' — ueberspringe, Loop laeuft weiter")
                events.put(event_line("red", "Fehler", name, f"Gap-Check: {exc}"))
        time.sleep(interval)


def _check_one_client(meta: dict, events: "_queue.Queue[str]", check_training_gap) -> None:
    uids = meta.get("uids") or [meta.get("uid")]
    name = meta["name"]

    last_date = None
    for uid in uids:
        sdir = AOS_USERS / uid / "fitness" / "sessions"
        if not sdir.exists():
            continue
        dates = sorted((f.stem[:10] for f in sdir.glob("*.json") if len(f.stem) >= 10), reverse=True)
        if dates and (last_date is None or dates[0] > last_date):
            last_date = dates[0]

    journal_text = ""
    for uid in uids:
        jdir = AOS_USERS / uid / "fitness" / "journal"
        if not jdir.exists():
            continue
        for jf in sorted(jdir.glob("*.md"), reverse=True)[:5]:
            journal_text += jf.read_text(encoding="utf-8") + "\n"

    result = check_training_gap(name, last_date, journal_text)
    if result and not result.get("explained"):
        gap_label = f"Trainingsluecke ({result.get('days_gap', '?')}d)"
        events.put(event_line("red", gap_label, name, result.get("reason", "")))
