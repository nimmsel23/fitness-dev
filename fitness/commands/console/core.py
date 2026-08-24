"""Verdrahtet Watcher + Gap-Loop + Rich-Live-Rendering. Einstieg: run()."""
from __future__ import annotations

import queue as _queue
import threading as _threading

import typer
from loguru import logger

from ...data import load_client_registry
from ...render import c
from .events import event_line
from .gap_check import gap_check_loop
from .watcher import SessionJournalHandler


def _analyze_session(events: "_queue.Queue[str]", name: str, session: dict) -> None:
    from fitness.catalog.agent.coach_ai import draft_session_feedback

    def _run() -> None:
        try:
            feedback = draft_session_feedback(session)
        except Exception as exc:
            logger.exception(f"console Feedback-Entwurf fehlgeschlagen fuer '{name}' — Session-Watch laeuft weiter")
            events.put(event_line("red", "Fehler", name, f"Feedback-Entwurf: {exc}"))
            return
        if feedback:
            events.put(event_line("green", "KI-Feedback-Vorschlag", name, feedback))

    _threading.Thread(target=_run, daemon=True).start()


def _setup_file_logging() -> None:
    # Rich's Live-Rendering nimmt exklusiv den Terminal-Stream in Beschlag.
    # loguru's Default-Sink schreibt auf stderr — landet ein Traceback dort
    # waehrend Live aktiv ist, zerreisst das die Panel-Neuzeichnung (Symptom:
    # doppelte/verschobene Boxen, sieht wie ein Haenger aus, ist aber nur ein
    # Rendering-Konflikt). Fix: waehrend der Konsolen-Session in eine Datei
    # loggen, nicht auf den Terminal-Stream.
    from ...catalog.core.paths import runtime_root

    log_dir = runtime_root() / "logs"
    log_dir.mkdir(parents=True, exist_ok=True)
    logger.remove()
    logger.add(log_dir / "console.log", rotation="1 MB", retention=3, level="INFO")


def run(gap_check_interval: int) -> None:
    from watchdog.observers import Observer
    from rich.console import Console as RichConsole
    from rich.live import Live
    from rich.panel import Panel

    _setup_file_logging()

    registry = load_client_registry()
    if not registry:
        print(c("yellow", "  Keine Klienten in ~/Klienten/ registriert."))
        raise typer.Exit(1)

    from ...catalog.core.paths import runtime_root
    watch_root = runtime_root() / "users"

    events: "_queue.Queue[str]" = _queue.Queue()

    handler = SessionJournalHandler(
        events,
        registry,
        on_session=lambda uid, name, session: _analyze_session(events, name, session),
    )

    observer = Observer()
    observer.schedule(handler, str(watch_root), recursive=True)
    observer.start()

    _threading.Thread(
        target=gap_check_loop,
        args=(registry, events, gap_check_interval),
        daemon=True,
    ).start()

    rich_console = RichConsole()
    lines: list[str] = [c("dim", "Live-Konsole gestartet — wartet auf neue Logs (Ctrl+C zum Beenden)")]

    try:
        with Live(Panel("\n".join(lines), title="Fitness Console"), console=rich_console, refresh_per_second=2) as live:
            while True:
                try:
                    line = events.get(timeout=0.5)
                    lines.append(line)
                    del lines[:-40]
                    live.update(Panel("\n".join(lines), title="Fitness Console"))
                except _queue.Empty:
                    continue
    except KeyboardInterrupt:
        observer.stop()
    observer.join()
