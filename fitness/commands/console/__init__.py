"""fitness.commands.console — Live-Coach-TUI Subpackage.

Beobachtet Klienten-Sessions/Journal-Eintraege in Echtzeit (watchdog) und
laesst Zwei-KI-Analyse (fitness/catalog/agent/coach_ai.py) darueberlaufen:
Trainingsluecken-Check + Auto-Feedback-Entwuerfe.

Module:
  events.py       — Event-Queue-Eintrag-Formatierung, Klienten-Name-Lookup
  watcher.py       — watchdog FileSystemEventHandler (Session/Journal-Aenderungen)
  gap_check.py     — periodischer Trainingsluecken-Check, ein Fehler pro Klient
                      darf den Loop nie mehr komplett stoppen (siehe Docstring dort)
  core.py          — verdrahtet Watcher + Gap-Loop + Rich-Live-Rendering, run()

`fitness/commands/log.py::cmd_console` ruft nur noch `run()` auf.
"""
from .core import run

__all__ = ["run"]
