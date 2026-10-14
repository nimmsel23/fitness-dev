"""fitsync CLI."""
from __future__ import annotations

import os
from pathlib import Path
from typing import Optional

import typer
from loguru import logger

from backend.sync import logsetup
from backend.core.clients import load_clients
from backend.sync.lock import AlreadyRunning, single_instance
from backend.sync.pull import pull_sessions
from backend.core.store import SessionStore

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
    from backend.sync import notify
    from backend.sync import source

    registry = load_clients()
    uids = list(uid)
    if clients:
        uids += [u for u, c in registry.items() if not c.is_coach]
    if not uids:
        uids = [resolve_uid(None)]
    uids = list(dict.fromkeys(uids))

    jsonl = logsetup.setup(log_dir or root / "logs", verbose)
    logger.info(f"pull sessions uids={len(uids)} root={root} dry_run={dry_run} notify={notify_} log={jsonl}")
    store = SessionStore(root)

    def run_all() -> int:
        errors = 0
        for u in uids:
            report = pull_sessions(u, source.firestore_sessions(u), store, dry_run=dry_run)
            errors += report.errors
            client = registry.get(u)
            if notify_ and client and client.is_coach:
                logger.debug(f"notify {u[:8]}: Coach-UID, eigene Workouts werden nicht gemeldet")
            elif notify_:
                try:  # eine Meldung darf das Pullen der übrigen Klienten nie verhindern
                    notify.notify_changes(client.name if client else u[:8], u, report.changes,
                                          send=notify.send_desktop, dry_run=dry_run)
                except Exception as exc:
                    errors += 1
                    logger.error(f"notify {u[:8]} fehlgeschlagen: {type(exc).__name__}: {exc}")
        return errors

    try:
        if dry_run:  # schreibt nichts -> kein Lock nötig
            errors = run_all()
        else:
            with single_instance(root / ".fitsync" / "fitsync.lock"):
                errors = run_all()
    except AlreadyRunning as exc:
        logger.error(f"läuft bereits (Lock {exc}) — abgebrochen")
        raise typer.Exit(2)
    raise typer.Exit(1 if errors else 0)
