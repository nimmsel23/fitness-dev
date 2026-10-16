"""Firestore-Daemon an die Lebensdauer der Console koppeln.

`fitness-log console` beobachtet Klienten-Sessions/Journal lokal (watchdog). Damit
neue Klienten-Daten aus Firestore überhaupt lokal ankommen, läuft währenddessen der
`fitness-firestore-daemon.service` (on_snapshot-Pull, user-scope):

  - Console startet  → Daemon starten, falls er nicht schon läuft
  - Console endet    → Daemon nur stoppen, wenn die Console ihn selbst gestartet hat
                       (ein vorher laufender Daemon bleibt unangetastet)

Stopp auch bei SIGTERM/SIGHUP (Terminal zu), nicht nur bei normalem Ende/Ctrl-C.
Ausgaben VOR dem Rich-Live-Start bzw. nach dessen Ende — nie währenddessen.
"""
from __future__ import annotations

import signal
import subprocess
from contextlib import contextmanager

UNIT = "fitness-firestore-daemon.service"


def _systemctl(*args: str) -> subprocess.CompletedProcess:
    return subprocess.run(["systemctl", "--user", *args], capture_output=True, text=True)


def _is_active() -> bool:
    return _systemctl("is-active", UNIT).stdout.strip() == "active"


@contextmanager
def firestore_daemon(enabled: bool = True):
    started = False
    if enabled:
        if _is_active():
            print(f"[daemon] {UNIT} läuft bereits — bleibt nach der Console an")
        else:
            r = _systemctl("start", UNIT)
            if r.returncode == 0:
                started = True
                print(f"[daemon] {UNIT} gestartet (stoppt mit der Console)")
            else:
                print(f"[daemon] {UNIT} konnte nicht gestartet werden: {r.stderr.strip() or r.stdout.strip()}")

    old = {}
    if started:
        def _exit(signum, _frame):
            raise SystemExit(0)  # → finally unten läuft
        for sig in (signal.SIGTERM, signal.SIGHUP):
            old[sig] = signal.signal(sig, _exit)
    try:
        yield started
    finally:
        for sig, handler in old.items():
            signal.signal(sig, handler)
        if started:
            r = _systemctl("stop", UNIT)
            print(f"[daemon] {UNIT} gestoppt" if r.returncode == 0
                  else f"[daemon] Stopp fehlgeschlagen: {r.stderr.strip() or r.stdout.strip()}")
