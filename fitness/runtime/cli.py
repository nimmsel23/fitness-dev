from __future__ import annotations

from pathlib import Path
from typing import Optional

import typer
import yaml
from rich.console import Console
from typing_extensions import Annotated

from fitness.runtime.sqlite_history import (
    apply_history_patches,
    delete_history_row,
    find_history_backfill_patches,
    update_history_row,
)
from fitness.runtime.user_data import (
    dataclass_payload,
    iter_session_signals,
    list_runtime_users,
    merge_day_activities,
)
from fitness.runtime.note_backfill import (
    fix_sessions,
    find_suspect_default_effort,
)
from fitness.runtime.client_session import log_workout as run_log_client_workout
from fitness.catalog.core.resolver import resolve_query as run_resolve_query, build_exercise_index

app = typer.Typer(help="Runtime user-data CRUD: Sessions/History prüfen und gezielt patchen")
console = Console()


@app.command(name="users")
def users():
    """Listet Runtime-User mit Session/Inbox/Journaling-Counts."""
    console.print(yaml.safe_dump({"users": dataclass_payload(list_runtime_users())}, sort_keys=False, allow_unicode=True).rstrip())


@app.command(name="session-signals")
def session_signals(
    uid: Annotated[Optional[str], typer.Option(help="Runtime user id / Firebase uid")] = None,
    exercise_id: Annotated[Optional[list[str]], typer.Option("--exercise-id", "-e", help="Exercise ID filter; repeatable")] = None,
    date_from: Annotated[Optional[str], typer.Option(help="ISO date lower bound")] = None,
    date_to: Annotated[Optional[str], typer.Option(help="ISO date upper bound")] = None,
):
    """Zeigt aus Session-JSONs erkannte Trainingssignale inkl. geparster Werte."""
    signals = iter_session_signals(
        user_id=uid,
        exercise_ids=set(exercise_id or []) or None,
        date_from=date_from,
        date_to=date_to,
    )
    console.print(yaml.safe_dump({"signals": dataclass_payload(signals)}, sort_keys=False, allow_unicode=True).rstrip())


@app.command(name="backfill-history")
def backfill_history(
    uid: Annotated[str, typer.Option(help="Runtime user id / Firebase uid")],
    exercise_id: Annotated[Optional[list[str]], typer.Option("--exercise-id", "-e", help="Exercise ID filter; repeatable")] = None,
    date_from: Annotated[Optional[str], typer.Option(help="ISO date lower bound")] = None,
    date_to: Annotated[Optional[str], typer.Option(help="ISO date upper bound")] = None,
    apply: Annotated[bool, typer.Option("--apply", help="Write patches to SQLite. Default is dry-run.")] = False,
    allow_nonzero: Annotated[bool, typer.Option(help="Also patch non-empty rows. Dangerous; default only patches all-zero rows.")] = False,
):
    """Backfillt History-Werte aus Session-JSONs. Dry-run ohne --apply."""
    patches = find_history_backfill_patches(
        user_id=uid,
        exercise_ids=set(exercise_id or []) or None,
        date_from=date_from,
        date_to=date_to,
        only_zero_rows=not allow_nonzero,
    )
    payload = {
        "dry_run": not apply,
        "patch_count": len(patches),
        "patches": dataclass_payload(patches),
    }
    if apply:
        payload["applied"] = apply_history_patches(patches)
    console.print(yaml.safe_dump(payload, sort_keys=False, allow_unicode=True).rstrip())


@app.command(name="merge-day-activities")
def merge_day_activities_cmd(
    uid: Annotated[Optional[str], typer.Option(help="Runtime user id / Firebase uid")] = None,
    date_from: Annotated[Optional[str], typer.Option(help="ISO date lower bound")] = None,
    date_to: Annotated[Optional[str], typer.Option(help="ISO date upper bound")] = None,
    apply: Annotated[bool, typer.Option("--apply", help="Write canonical day JSONs and delete activity-only sidecars. Default is dry-run.")] = False,
):
    """Fasst Cardio-Sidecars desselben Datums in ein Tagesdokument zusammen."""
    plans = merge_day_activities(
        user_id=uid,
        date_from=date_from,
        date_to=date_to,
        apply=apply,
    )
    console.print(yaml.safe_dump({
        "dry_run": not apply,
        "merge_count": len(plans),
        "plans": dataclass_payload(plans),
    }, sort_keys=False, allow_unicode=True).rstrip())


@app.command(name="fix-notes")
def fix_notes(
    uid: Annotated[Optional[str], typer.Option(help="Runtime user id / Firebase uid; alle User wenn leer")] = None,
    apply: Annotated[bool, typer.Option("--apply", help="Write patches to session JSON. Default is dry-run.")] = False,
):
    """Laesst Haiku Session-Dateien mit leeren reps/weight oder fehlendem `block` direkt lesen
    (+ im --apply-Fall editieren) und aus den geloggten Fakten der Session selbst vervollstaendigen.
    Flaggt zusaetzlich Sessions mit vermutlich nie gesetztem RPE-Default (kein Auto-Fix, nur Hinweis)."""
    results = fix_sessions(user_id=uid, apply=apply)
    suspects = find_suspect_default_effort(user_id=uid)
    payload = {
        "dry_run": not apply,
        "session_count": len(results),
        "sessions": dataclass_payload(results),
        "suspect_default_effort": suspects,
    }
    console.print(yaml.safe_dump(payload, sort_keys=False, allow_unicode=True).rstrip())


@app.command(name="history-update")
def history_update(
    row_id: Annotated[int, typer.Argument(help="training_history row id")],
    sets: Annotated[Optional[int], typer.Option(help="New sets")] = None,
    reps: Annotated[Optional[int], typer.Option(help="New reps")] = None,
    weight: Annotated[Optional[float], typer.Option(help="New weight")] = None,
    rpe: Annotated[Optional[int], typer.Option(help="New RPE")] = None,
    notes: Annotated[Optional[str], typer.Option(help="New notes")] = None,
    pain: Annotated[Optional[str], typer.Option(help="New pain note")] = None,
    completion_status: Annotated[Optional[str], typer.Option(help="New completion status")] = None,
    done: Annotated[Optional[int], typer.Option(help="New done value, 0/1")] = None,
    apply: Annotated[bool, typer.Option("--apply", help="Write update. Default is dry-run.")] = False,
):
    """Patcht eine einzelne History-Zeile. Ohne --apply nur Vorschau."""
    fields = {
        "sets": sets,
        "reps": reps,
        "weight": weight,
        "rpe": rpe,
        "notes": notes,
        "pain": pain,
        "completion_status": completion_status,
        "done": done,
    }
    if not apply:
        console.print(yaml.safe_dump({"dry_run": True, "row_id": row_id, "fields": {k: v for k, v in fields.items() if v is not None}}, sort_keys=False, allow_unicode=True).rstrip())
        return
    try:
        result = update_history_row(row_id, fields)
    except ValueError as exc:
        console.print(f"[red]FAIL:[/red] {exc}")
        raise typer.Exit(code=1)
    console.print(yaml.safe_dump({"dry_run": False, **result}, sort_keys=False, allow_unicode=True).rstrip())


@app.command(name="history-delete")
def history_delete(
    row_ids: Annotated[list[int], typer.Argument(help="training_history row id(s)")],
    apply: Annotated[bool, typer.Option("--apply", help="Delete row. Default is dry-run.")] = False,
):
    """Löscht eine oder mehrere History-Zeilen. Ohne --apply nur Vorschau."""
    if not apply:
        console.print(yaml.safe_dump({"dry_run": True, "row_ids": row_ids, "would_delete": True}, sort_keys=False, allow_unicode=True).rstrip())
        return
    deleted_rows = []
    try:
        for row_id in row_ids:
            deleted_rows.append(delete_history_row(row_id))
    except ValueError as exc:
        console.print(f"[red]FAIL:[/red] {exc}")
        raise typer.Exit(code=1)
    console.print(yaml.safe_dump({"dry_run": False, "deleted": deleted_rows}, sort_keys=False, allow_unicode=True).rstrip())


def _prompt_exercises_interactive() -> list[dict]:
    """Fragt Übungen/Sätze interaktiv ab, matcht jede gegen den Katalog (inkl. unreviewed wger-Einträge)."""
    records = build_exercise_index()
    exercises: list[dict] = []
    console.print("[bold]Übungen eingeben — leerer Name = fertig[/bold]")
    while True:
        name = typer.prompt("Übung", default="", show_default=False).strip()
        if not name:
            break

        result = run_resolve_query(name, records)
        exercise_id: Optional[str] = None
        display_name = name
        primary: list[str] = []
        secondary: list[str] = []
        extra: dict = {}

        if result.matched:
            console.print(
                f"  → Katalog-Match: [bold]{result.display_name}[/bold] "
                f"(id={result.canonical_id}, quelle={result.source}, confidence={result.confidence})"
            )
            if typer.confirm("  Übernehmen?", default=True):
                exercise_id = result.canonical_id
                display_name = result.display_name or name
                record = next((r for r in records if r.exercise_id == exercise_id), None)
                if record:
                    primary = record.primary_muscles or []
                    secondary = record.secondary_muscles or []
                if exercise_id and (exercise_id.startswith("wger_") or exercise_id.startswith("yuhonas_")):
                    extra = {"inferred": True, "review_state": "unreviewed"}
        else:
            console.print(f"  [yellow]Kein Katalog-Match für '{name}'[/yellow]")
            if result.suggestions:
                sugg = ", ".join(s.get("display_name", "") for s in result.suggestions[:3] if s.get("display_name"))
                if sugg:
                    console.print(f"  Vorschläge: {sugg}")

        sets: list[dict] = []
        set_no = 1
        while True:
            reps = typer.prompt(f"    Satz {set_no} — Reps (leer = fertig)", default="", show_default=False).strip()
            if not reps:
                break
            weight = typer.prompt(f"    Satz {set_no} — Gewicht", default="", show_default=False).strip()
            sets.append({"reps": reps, "weight": weight})
            set_no += 1

        note = typer.prompt("  Notiz (optional)", default="", show_default=False).strip()

        exercises.append({
            "name": display_name,
            "id": exercise_id,
            "primaryMuscles": primary,
            "secondaryMuscles": secondary,
            "setsArray": sets,
            "source": "manual",
            "note": note,
            **extra,
        })
        console.print("")
    return exercises


@app.command(name="log-client-workout")
def log_client_workout(
    client: Annotated[str, typer.Option(help="Klienten-Slug, z.B. jakob-stadler (~/Klienten/<slug>/)")],
    exercises_file: Annotated[Optional[Path], typer.Option("--exercises-file", help="JSON-Datei mit Übungsliste. Ohne Angabe: interaktiver Prompt")] = None,
    date: Annotated[Optional[str], typer.Option(help="ISO-Datum, Default heute")] = None,
    block: Annotated[str, typer.Option(help="Trainingsblock, z.B. Push/Pull/Full Body")] = "",
    duration: Annotated[str, typer.Option(help="Dauer in Minuten")] = "",
    location: Annotated[str, typer.Option(help="Ort, z.B. Fitnessstudio-Name")] = "",
):
    """Workout für einen Klienten loggen (POST an fitness-api :9150 falls firebase_uid vorhanden, sonst lokal staged).

    Runtime-User-Daten-Schreibvorgang — gehört fachlich hierher, nicht ins
    Katalog-KB-Tool-Set (verschoben aus fitness/catalog/cli.py, siehe
    catalog/CLAUDE.md: "Kein user-data hier").
    """
    if exercises_file:
        import json as _json
        exercises = _json.loads(exercises_file.read_text())
    else:
        exercises = _prompt_exercises_interactive()
        if not exercises:
            console.print("[red]FAIL:[/red] Keine Übungen eingegeben, abgebrochen.")
            raise typer.Exit(code=1)
    try:
        result = run_log_client_workout(
            client, exercises, day=date, block=block, duration=duration, location=location
        )
    except FileNotFoundError as exc:
        console.print(f"[red]FAIL:[/red] {exc}")
        raise typer.Exit(code=1)
    except Exception as exc:
        console.print(f"[red]FAIL:[/red] {exc}")
        raise typer.Exit(code=1)

    if result["mode"] == "api":
        console.print(f"[green]OK:[/green] Session gespeichert via API (uid={result['uid']})")
    else:
        console.print(f"[yellow]STAGED:[/yellow] Kein firebase_uid für '{client}' — lokal abgelegt: {result['path']}")
        console.print("  Noch NICHT in der App sichtbar. Nach Firebase-User-Anlage erneut mit gesetztem firebase_uid loggen (oder migrieren).")
