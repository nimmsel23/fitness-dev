"""fitsync CLI."""
from __future__ import annotations

import os
from pathlib import Path
from typing import Optional

import typer
from loguru import logger

from backend.sync import logsetup
from backend.core.clients import load_clients
from backend.sync.lock import AlreadyRunning
from backend.sync.runner import resolve_targets, run_pull

sync_app = typer.Typer(no_args_is_help=True, help="Firestore ↔ lokal (Fitness Sync)")
pull_app = typer.Typer(no_args_is_help=True, help="Daten aus Firestore holen")
sync_app.add_typer(pull_app, name="pull")

DEFAULT_ROOT = Path(os.environ.get("FITNESS_DATA_ROOT", Path.home() / ".aos" / "fitness"))


def resolve_uid(explicit: str | None) -> str:
    """--uid > FITNESS_UID > ~/.aos/users/.active-uid. Kein stiller Hardcode-Fallback."""
    candidates = [explicit, os.environ.get("FITNESS_UID")]
    uid_file = Path.home() / ".aos" / "users" / ".active-uid"
    if uid_file.exists():
        candidates.append(uid_file.read_text().strip())
    for c in candidates:
        if c and c.strip() and c.strip() != "default":
            return c.strip()
    raise typer.BadParameter("keine UID: --uid angeben oder FITNESS_UID setzen")


@pull_app.command("sessions")
def pull_sessions_cmd(
    uid: list[str] = typer.Option([], "--uid", help="Firebase-UID, mehrfach möglich (sonst FITNESS_UID/.active-uid)"),
    clients: bool = typer.Option(False, "--clients", help="alle Klienten aus ~/Klienten (ohne Coach)"),
    notify_: bool = typer.Option(False, "--notify", help="Desktop-Meldung für eingehende Klienten-Workouts"),
    dry_run: bool = typer.Option(False, "--dry-run", help="nur entscheiden und loggen, nichts schreiben/melden"),
    root: Path = typer.Option(DEFAULT_ROOT, "--root", help="Datenwurzel (enthält users/<uid>/sessions)"),
    log_dir: Optional[Path] = typer.Option(None, "--log-dir", help="Standard: <root>/logs"),
    verbose: bool = typer.Option(False, "-v", "--verbose", help="auch übersprungene Dokumente auf der Konsole"),
):
    """Sessions aus Firestore nach <root>/users/<uid>/sessions holen."""
    registry = load_clients()
    uids = resolve_targets(list(uid), clients, registry) or [resolve_uid(None)]

    jsonl = logsetup.setup(log_dir or root / "logs", verbose)
    logger.info(f"pull sessions uids={len(uids)} root={root} dry_run={dry_run} notify={notify_} log={jsonl}")
    try:
        outcome = run_pull(root=root, uids=uids, registry=registry, notify_=notify_, dry_run=dry_run)
    except AlreadyRunning as exc:
        logger.error(f"läuft bereits (Lock {exc}) — abgebrochen")
        raise typer.Exit(2)
    errors = outcome.errors
    raise typer.Exit(1 if errors else 0)
