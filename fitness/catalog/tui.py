"""
Fitness Agent TUI — Rich-basierte interaktive Terminal-UI
"""
from __future__ import annotations

import sys
import yaml
import os
import subprocess
from pathlib import Path
from typing import Any

if __package__ in {None, ""}:
    package_root = Path(__file__).resolve().parent.parent
    if str(package_root) not in sys.path:
        sys.path.insert(0, str(package_root))
    __package__ = "catalog"

from rich import box
from rich.columns import Columns
from rich.console import Console
from rich.panel import Panel
from rich.prompt import Confirm, Prompt
from rich.table import Table
from rich.text import Text

from fitness.catalog.core.paths import DATA_DIR, runtime_root
from fitness.catalog.core.rich_utils import console
from fitness.catalog.core.yaml_utils import load_yaml


# ─── Layout helpers ────────────────────────────────────────────────────────

_LOGO = "[bold green]FITNESS AGENT[/bold green]"


def _header(screen: str, sub: str = "") -> None:
    console.clear()
    line = Text()
    line.append("  ◆ ", style="bold green")
    line.append("FITNESS AGENT", style="bold white")
    line.append("  /  ", style="dim")
    line.append(screen, style="bold cyan")
    if sub:
        line.append(f"  —  {sub}", style="dim")
    console.print(line)
    console.print("─" * min(console.width, 80), style="dim green")
    console.print()


def _nav(**items: str) -> None:
    parts = [f"[bold green]{k}[/bold green] [dim]{v}[/dim]" for k, v in items.items()]
    console.print("  " + "   ".join(parts))
    console.print()


def _pause() -> None:
    try:
        Prompt.ask("  [dim]↵ weiter[/dim]", default="")
    except (EOFError, KeyboardInterrupt):
        pass


# ─── Dashboard ─────────────────────────────────────────────────────────────

def screen_dashboard() -> str:
    _header("Dashboard")

    # Exercise index stats
    try:
        from fitness.catalog.core.resolver import build_exercise_index
        idx = build_exercise_index()
        by_source: dict[str, int] = {}
        for ex in idx:
            s = getattr(ex, "source", None) or "unknown"
            by_source[s] = by_source.get(s, 0) + 1

        t = Table(box=box.SIMPLE, show_header=True, header_style="bold green",
                  title="Exercise Index", title_style="bold")
        t.add_column("Quelle", style="bold")
        t.add_column("Exercises", justify="right")
        for src, cnt in sorted(by_source.items(), key=lambda x: -x[1]):
            t.add_row(src, str(cnt))
        t.add_row("[dim]Total[/dim]", f"[bold]{len(idx)}[/bold]")
        console.print(t)
    except Exception as exc:
        console.print(f"[red]Index-Fehler: {exc}[/red]")

    # Inbox status
    exercises_dir = DATA_DIR / "exercises"
    unreviewed = list(exercises_dir.glob("inbox_*.yml"))
    pending_jsons = list((runtime_root() / "users" / "default" / "inbox").glob("*.json"))

    if unreviewed or pending_jsons:
        t2 = Table(box=box.SIMPLE, show_header=False, title="Inbox", title_style="bold yellow")
        t2.add_column("State", style="yellow")
        t2.add_column("", justify="right")
        if pending_jsons:
            t2.add_row("new  (warten auf Gemini)", str(len(pending_jsons)))
        if unreviewed:
            t2.add_row("unreviewed  (warten auf Review)", f"[bold yellow]{len(unreviewed)}[/bold yellow]")
        console.print(t2)
    else:
        console.print(Panel("[green]Inbox leer[/green]", title="Inbox", border_style="dim"))

    console.print()
    _nav(**{"1": "Inbox", "2": "Browser", "3": "Plan", "4": "Lesson", "5": "History", "q": "Quit"})

    choice = Prompt.ask("  [bold]>[/bold]", choices=["1", "2", "3", "4", "5", "q"], default="q")
    return {"1": "inbox", "2": "browser", "3": "plan", "4": "lesson", "5": "history", "q": "quit"}[choice]


# ─── Inbox ─────────────────────────────────────────────────────────────────

def screen_inbox() -> str:
    exercises_dir = DATA_DIR / "exercises"
    files = sorted(exercises_dir.glob("inbox_*.yml"))

    _header("Inbox", f"{len(files)} unreviewed")

    if not files:
        console.print(Panel("[green]Inbox leer — nichts zu reviewen.[/green]", border_style="dim"))
        console.print()
        _nav(**{"b": "zurück"})
        Prompt.ask("  [bold]>[/bold]", choices=["b"], default="b")
        return "dashboard"

    t = Table(box=box.SIMPLE, show_header=True, header_style="bold")
    t.add_column("#", style="dim", width=4)
    t.add_column("Datei", style="cyan", no_wrap=True)
    t.add_column("Name")
    t.add_column("Muskeln", style="dim")

    items: list[tuple[Path, str]] = []
    for i, f in enumerate(files, 1):
        try:
            doc = load_yaml(f)
            ex = (doc.get("exercises") or [{}])[0]
            name = ex.get("display_name") or ex.get("german") or ex.get("name") or ""
            muscles = ", ".join((ex.get("primary_muscles") or [])[:3])
        except Exception:
            name = ""
            muscles = ""
        label = f.stem.replace("inbox_", "").replace("_", " ")
        items.append((f, label))
        t.add_row(str(i), f.stem, name or label, muscles)

    console.print(t)
    console.print()
    _nav(**{f"1–{len(items)}": "Detail öffnen", "b": "zurück"})

    choices = [str(i) for i in range(1, len(items) + 1)] + ["b"]
    choice = Prompt.ask("  [bold]>[/bold]", choices=choices, default="b")

    if choice == "b":
        return "dashboard"

    return _inbox_detail(files[int(choice) - 1])


def _inbox_detail(f: Path) -> str:
    _header("Inbox Detail", f.stem)

    try:
        doc = load_yaml(f)
        ex = (doc.get("exercises") or [{}])[0]
    except Exception as exc:
        console.print(f"[red]Ladefehler: {exc}[/red]")
        _pause()
        return "inbox"

    name = ex.get("display_name") or ex.get("german") or ex.get("name") or f.stem

    # Main fields
    scalar_fields = ["exercise_id", "category", "type", "movement_pattern", "source"]
    list_fields = ["equipment", "primary_muscles", "secondary_muscles", "stabilizers"]

    lines = []
    for field in scalar_fields:
        val = ex.get(field)
        if val:
            lines.append(f"[dim]{field:22}[/dim] [bold]{val}[/bold]")
    for field in list_fields:
        val = ex.get(field)
        if val and isinstance(val, list):
            lines.append(f"[dim]{field:22}[/dim] {', '.join(str(v) for v in val)}")

    console.print(Panel(
        "\n".join(lines) if lines else "[dim]keine Felder[/dim]",
        title=f"[bold cyan]{name}[/bold cyan]",
        border_style="cyan",
    ))

    if ex.get("coaching_notes"):
        console.print(Panel(
            "\n".join(f"• {n}" for n in ex["coaching_notes"]),
            title="Coaching Notes", border_style="green dim",
        ))

    if ex.get("common_errors"):
        console.print(Panel(
            "\n".join(f"• {e}" for e in ex["common_errors"]),
            title="Common Errors", border_style="red dim",
        ))

    console.print()
    _nav(**{"a": "Approve → expert", "e": "Bearbeiten", "r": "Neu anreichern (Gemini)", "f": "Feedback geben", "d": "Löschen", "b": "zurück"})
    choice = Prompt.ask("  [bold]>[/bold]", choices=["a", "e", "r", "f", "d", "b"], default="b")

    if choice == "a":
        _approve(f, ex)
    elif choice == "e":
        editor = os.environ.get("EDITOR", "nano")
        subprocess.call([editor, str(f)])
        return _inbox_detail(f)
    elif choice == "r":
        _reenrich(f, ex, name)
        return _inbox_detail(f)
    elif choice == "f":
        _feedback_reenrich(f, ex, name)
        return _inbox_detail(f)
    elif choice == "d":
        if Confirm.ask(f"  [red]Wirklich löschen: {f.name}?[/red]"):
            f.unlink()
            console.print(f"  [green]✓ Gelöscht[/green]")
            _pause()

    return "inbox"


def _reenrich(f: Path, ex: dict, name: str, feedback: str | None = None) -> None:
    """Jagt einen bestehenden Inbox-Draft nochmal frisch durch Gemini —
    für Alt-Einträge aus einer frueheren Import-Aera, deren Schema/Qualitaet
    nicht mehr zum aktuellen Approve-Pfad passt. Ueberschreibt den Draft
    in-place, macht vorher ein Backup. Optional mit Coach-Feedback (freier
    Text), das Gemini zwingend bei der Neufassung beruecksichtigen muss
    (z.B. kritisierte Formulierungen wie "bequem"/"Polster" vermeiden).
    """
    from fitness.catalog.agent.gemini import load_gemini_key, call_gemini

    api_key = load_gemini_key()
    if not api_key:
        console.print("  [red]GEMINI_API_KEY fehlt — kann nicht neu anreichern.[/red]")
        _pause()
        return

    prompt_label = "Mit Feedback neu anreichern" if feedback else "Bestehenden Draft ueberschreiben und neu anreichern"
    if not Confirm.ask(f"  [yellow]{prompt_label}: {name}?[/yellow]"):
        return

    ex_id = ex.get("exercise_id") or ex.get("id") or f.stem.replace("inbox_", "")
    safe_name = str(ex_id).lower().replace(" ", "_")

    console.print("  [dim]Frage Gemini an…[/dim]")
    enriched = call_gemini(name, safe_name, api_key, existing_data=ex, feedback=feedback)

    if not enriched:
        console.print("  [red]Gemini-Anreicherung fehlgeschlagen — Draft unveraendert.[/red]")
        _pause()
        return

    f.with_suffix(".yml.bak").write_text(f.read_text())

    if "stabilizers" not in enriched: enriched["stabilizers"] = []
    if "variations" not in enriched: enriched["variations"] = []
    enriched["source"] = "unreviewed"

    description = f"Reenriched (Coach-Feedback) fuer: {name}" if feedback else f"Neu angereichert (manueller Re-Enrich) fuer: {name}"
    wrapper = {
        "name": f.stem,
        "description": description,
        "exercises": [enriched],
    }
    f.write_text(yaml.dump(wrapper, allow_unicode=True, sort_keys=False))

    console.print(f"  [green]✓ Neu angereichert: {f.name}[/green]")
    _pause()


def _feedback_reenrich(f: Path, ex: dict, name: str) -> None:
    """Fragt den Coach nach freiem Text-Feedback zum Draft (z.B. "bequem und
    Polster passen mir nicht") und schickt es direkt an Gemini, statt die
    Formulierung manuell im Editor zu aendern.
    """
    console.print()
    feedback = Prompt.ask("  [bold]Was stoert dich am aktuellen Entwurf?[/bold]")
    if not feedback.strip():
        console.print("  [dim]Kein Feedback eingegeben — abgebrochen.[/dim]")
        _pause()
        return
    _reenrich(f, ex, name, feedback=feedback.strip())


def _approve(f: Path, ex: dict) -> None:
    ex_id = ex.get("exercise_id") or ex.get("id")
    if not ex_id:
        console.print("  [red]Fehler: keine exercise_id[/red]")
        _pause()
        return

    if ex_id.startswith("inbox_"):
        ex_id = ex_id.replace("inbox_", "")
        ex["exercise_id"] = ex_id
        ex["id"] = ex_id

    ex["source"] = "expert"

    exercises_dir = DATA_DIR / "exercises"
    detail_path = exercises_dir / f"{ex_id}.yml"

    if detail_path.exists():
        detail_path.with_suffix(".yml.bak").write_text(detail_path.read_text())

    display_name = ex.get("display_name") or ex.get("german") or ex.get("name") or ex_id
    detail_doc = {
        "exercise_id": ex_id,
        "description": f"Expert details for {display_name}",
        "exercises": [ex],
    }
    detail_path.write_text(
        yaml.dump(detail_doc, allow_unicode=True, sort_keys=False, default_flow_style=False)
    )
    f.unlink()

    console.print(f"  [green]✓ Approved → {detail_path.name}[/green]")
    _pause()


# ─── Browser ───────────────────────────────────────────────────────────────

def screen_browser() -> str:
    _header("Browser", "Suche im Exercise Index")
    query = Prompt.ask("  [bold]Suche[/bold]", default="")
    if not query.strip():
        return "dashboard"

    _header("Browser", f"'{query}'")

    try:
        from fitness.catalog.core.resolver import build_exercise_index, candidate_texts, normalize_text
        idx = build_exercise_index()
        q = normalize_text(query)
        results = [ex for ex in idx if any(q in normalize_text(t) for t in candidate_texts(ex))]

        if not results:
            console.print(f"  [yellow]Keine Treffer für '{query}'[/yellow]")
        else:
            t = Table(box=box.SIMPLE, show_header=True, header_style="bold")
            t.add_column("#", width=4, style="dim")
            t.add_column("ID", style="cyan")
            t.add_column("Name", style="bold")
            t.add_column("Source", style="dim")
            t.add_column("Primary", style="dim")

            for i, ex in enumerate(results[:25], 1):
                muscles = ", ".join((ex.primary_muscles or [])[:2])
                t.add_row(str(i), ex.exercise_id, ex.display_name or "", ex.source or "", muscles)

            console.print(t)
            if len(results) > 25:
                console.print(f"  [dim]... {len(results) - 25} weitere[/dim]")
    except Exception as exc:
        console.print(f"  [red]Fehler: {exc}[/red]")

    console.print()
    _nav(**{"s": "neue Suche", "b": "zurück"})
    choice = Prompt.ask("  [bold]>[/bold]", choices=["s", "b"], default="b")
    return "browser" if choice == "s" else "dashboard"


# ─── Plan ──────────────────────────────────────────────────────────────────

def screen_plan() -> str:
    _header("Plan Generator", "Regel-basierter Trainingsplan")

    template = Prompt.ask("  [bold]Template[/bold]", default="push_day")
    goal = Prompt.ask("  [bold]Goal[/bold]", default="hypertrophy")

    _header("Plan", f"{template} / {goal}")

    try:
        from fitness.catalog.planner import build_plan
        result = build_plan(template=template, goal=goal)
        blocks = result.blocks if hasattr(result, "blocks") else []

        if not blocks:
            console.print(yaml.dump(result.__dict__, allow_unicode=True, sort_keys=False))
        else:
            for block in blocks:
                t = Table(title=block.get("name", "Block"), box=box.SIMPLE, show_header=True)
                t.add_column("Exercise", style="bold")
                t.add_column("Sets", justify="right")
                t.add_column("Reps", justify="right")
                t.add_column("Hinweis", style="dim")
                for ex in block.get("exercises", []):
                    t.add_row(
                        ex.get("display_name", ex.get("exercise_id", "")),
                        str(ex.get("sets", "")),
                        str(ex.get("reps", "")),
                        ex.get("note", ""),
                    )
                console.print(t)
    except Exception as exc:
        console.print(f"  [red]Fehler: {exc}[/red]")

    console.print()
    _nav(**{"p": "neuer Plan", "b": "zurück"})
    choice = Prompt.ask("  [bold]>[/bold]", choices=["p", "b"], default="b")
    return "plan" if choice == "p" else "dashboard"


# ─── Lesson ────────────────────────────────────────────────────────────────

def screen_lesson() -> str:
    _header("Anatomy Lesson", "Lerneinheit")
    exercise_id = Prompt.ask("  [bold]Exercise ID[/bold]", default="")
    if not exercise_id.strip():
        return "dashboard"

    _header("Lesson", exercise_id)

    try:
        from fitness.catalog.agent.teaching import teach_exercise
        from fitness.catalog.preview import render_markdown
        output = teach_exercise(exercise_id)
        render_markdown(output)
    except Exception as exc:
        console.print(f"  [red]Fehler: {exc}[/red]")

    console.print()
    _nav(**{"l": "neue Lesson", "b": "zurück"})
    choice = Prompt.ask("  [bold]>[/bold]", choices=["l", "b"], default="b")
    return "lesson" if choice == "l" else "dashboard"


# ─── History ───────────────────────────────────────────────────────────────

def screen_history() -> str:
    _header("Training History", "Letzte Einträge")
    exercise = Prompt.ask("  [bold]Exercise[/bold]", default="")
    if not exercise.strip():
        return "dashboard"

    _header("History", exercise)

    try:
        from fitness.catalog.history import read_history
        entries = read_history(exercise, limit=15)

        if not entries:
            console.print(f"  [yellow]Keine Einträge für '{exercise}'[/yellow]")
        else:
            t = Table(box=box.SIMPLE, show_header=True, header_style="bold")
            t.add_column("Datum", style="dim")
            t.add_column("Sets", justify="right")
            t.add_column("Reps", justify="right")
            t.add_column("Gewicht", justify="right", style="bold")
            t.add_column("RPE", justify="right")
            for e in entries:
                t.add_row(
                    str(e.get("date", "")),
                    str(e.get("sets", "")),
                    str(e.get("reps", "")),
                    str(e.get("weight", "")),
                    str(e.get("rpe", "")),
                )
            console.print(t)
    except Exception as exc:
        console.print(f"  [red]Fehler: {exc}[/red]")

    console.print()
    _nav(**{"h": "neue Abfrage", "b": "zurück"})
    choice = Prompt.ask("  [bold]>[/bold]", choices=["h", "b"], default="b")
    return "history" if choice == "h" else "dashboard"


# ─── Router ────────────────────────────────────────────────────────────────

_SCREENS = {
    "dashboard": screen_dashboard,
    "inbox": screen_inbox,
    "browser": screen_browser,
    "plan": screen_plan,
    "lesson": screen_lesson,
    "history": screen_history,
}


def run_tui(initial_screen: str = "dashboard") -> None:
    screen = initial_screen if initial_screen in _SCREENS else "dashboard"
    while screen != "quit":
        fn = _SCREENS.get(screen, screen_dashboard)
        try:
            screen = fn()
        except KeyboardInterrupt:
            break
        except Exception as exc:
            console.print(f"\n  [red bold]Fehler in '{screen}': {exc}[/red bold]")
            _pause()
            screen = "dashboard"
    console.print("\n  [dim]Tschüss![/dim]\n")
