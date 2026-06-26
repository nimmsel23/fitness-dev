from __future__ import annotations

import sys
from typing import Optional
from pathlib import Path

import yaml
import typer
from typing_extensions import Annotated

from .paths import DATA_DIR
from .bootstrap import bootstrap as run_bootstrap
from .audit import (
    run_anatomy_audit,
    run_coverage_audit,
    run_aliases_audit,
    audit_exercises,
    run_all_audits,
    status_for_exercises,
)
from .coach_sheet import build_coach_sheet, render_coach_sheet_markdown
from .coverage import calculate_coverage as run_calculate_coverage
from .doctor import run_doctor
from .history import ensure_history_db, log_training_entry as run_log_training_entry, progress_hint, read_history
from .obsidian import (
    export_coach_sheet_note,
    export_coverage_note,
    export_exercise_note,
    export_plan_note,
    export_teach_note,
    export_weekly_report_note,
)
from .preview import preview_file, render_markdown
from .planner import build_plan
from .teaching import teach_exercise
from .wger import build_plan_wger_payload, map_wger as run_map_wger, wger_check
from .resolver import resolve_query
from .weekly import build_weekly_coverage
from .tui import run_tui
from .watcher import run_watcher
from .importer import import_external_exercises
from .firestore_push import run_kb_sync, push_changed_exercises
from .rich_utils import (
    console,
    print_audit_report,
    print_bootstrap_report,
    print_doctor_report,
    print_exercise_audit,
)

app = typer.Typer(help="AlphaOS Fitness Agent CLI", add_completion=False)


@app.command()
def bootstrap(
    force: Annotated[bool, typer.Option(help="Overwrite existing files")] = False,
):
    """Initialize ~/.aos/fitness"""
    report = run_bootstrap(force=force)
    print_bootstrap_report(report)


@app.command()
def doctor():
    """Check the local runtime layout"""
    report = run_doctor()
    print_doctor_report(report)
    if report.has_failures:
        raise typer.Exit(code=1)


@app.command()
def audit(
    topic: Annotated[
        str, typer.Argument(help="Audit topic")
    ] = "all", # Defaulting to all for ease of use
):
    """Run deterministic audits"""
    if topic == "anatomy":
        report = run_anatomy_audit()
        print_audit_report(
            "Fitness Agent Anatomy Audit",
            report,
            "ANATOMY_LAYER_USABLE",
            "ANATOMY_LAYER_BROKEN",
        )
        if report.has_failures:
            raise typer.Exit(code=1)
    elif topic == "coverage":
        report = run_coverage_audit()
        print_audit_report(
            "Fitness Agent Coverage Audit",
            report,
            "COVERAGE_LAYER_USABLE",
            "COVERAGE_LAYER_BROKEN",
        )
        if report.has_failures:
            raise typer.Exit(code=1)
    elif topic == "aliases":
        report = run_aliases_audit()
        print_audit_report(
            "Fitness Agent Aliases Audit",
            report,
            "ALIASES_LAYER_USABLE",
            "ALIASES_LAYER_BROKEN",
        )
        if report.has_failures:
            raise typer.Exit(code=1)
    elif topic == "exercises":
        result = audit_exercises()
        status = status_for_exercises(result)
        print_exercise_audit(result, status)
        if status == "FAIL":
            raise typer.Exit(code=1)
    elif topic == "all":
        sys.exit(run_all_audits())
    else:
        console.print(f"[fail]Unknown audit topic:[/fail] {topic}")
        raise typer.Exit(code=1)


@app.command()
def resolve(query: str):
    """Resolve an exercise query"""
    result = resolve_query(query)
    if result.matched:
        console.print(
            yaml.safe_dump(result.__dict__, sort_keys=False, allow_unicode=True).rstrip()
        )
    else:
        console.print(f"[fail]Query not resolved:[/fail] {query}")
        raise typer.Exit(code=1)


@app.command()
def coverage(
    exercise: Annotated[Optional[str], typer.Option(help="Exercise ID or query")] = None,
    week: Annotated[Optional[str], typer.Option(help="Week selector (e.g. 2024-W10)")] = None,
    sets: Annotated[Optional[int], typer.Option(help="Number of sets")] = None,
    rpe: Annotated[Optional[int], typer.Option(help="RPE value")] = None,
):
    """Calculate muscle coverage"""
    if week:
        try:
            result = build_weekly_coverage(week)
            console.print(yaml.safe_dump({"weekly_coverage": result}, sort_keys=False, allow_unicode=True).rstrip())
        except ValueError as exc:
            console.print(f"[fail]FAIL:[/fail] {exc}")
            raise typer.Exit(code=1)
    elif exercise:
        if sets is None or rpe is None:
            console.print("[fail]FAIL:[/fail] --exercise requires --sets and --rpe")
            raise typer.Exit(code=1)
        try:
            result = run_calculate_coverage(exercise, sets, rpe)
            console.print(yaml.safe_dump(result, sort_keys=False, allow_unicode=True).rstrip())
        except ValueError as exc:
            console.print(f"[fail]FAIL:[/fail] {exc}")
            raise typer.Exit(code=1)
    else:
        console.print("[fail]FAIL:[/fail] Provide either --exercise or --week")
        raise typer.Exit(code=1)


@app.command()
def log(
    exercise: Annotated[str, typer.Option(help="Exercise ID or query")],
    sets: Annotated[int, typer.Option(help="Number of sets")],
    reps: Annotated[int, typer.Option(help="Reps")],
    weight: Annotated[float, typer.Option(help="Weight")],
    rpe: Annotated[int, typer.Option(help="RPE value")],
    workout_id: Annotated[Optional[str], typer.Option(help="Workout identifier")] = None,
    date: Annotated[Optional[str], typer.Option(help="ISO date")] = None,
    notes: Annotated[str, typer.Option(help="Notes")] = "",
    pain: Annotated[str, typer.Option(help="Pain notes")] = "",
    completion_status: Annotated[str, typer.Option(help="Completion status")] = "completed",
):
    """Log a training set"""
    try:
        result = run_log_training_entry(
            exercise,
            sets=sets,
            reps=reps,
            weight=weight,
            rpe=rpe,
            workout_id=workout_id,
            date=date,
            notes=notes,
            pain=pain,
            completion_status=completion_status,
        )
        console.print(
            yaml.safe_dump(
                {
                    "exercise_id": result.exercise_id,
                    "display_name": result.display_name,
                    "workout_id": result.workout_id,
                    "row_id": result.row_id,
                    "db_path": str(ensure_history_db()),
                },
                sort_keys=False,
                allow_unicode=True,
            ).rstrip()
        )
    except ValueError as exc:
        console.print(f"[fail]FAIL:[/fail] {exc}")
        raise typer.Exit(code=1)


@app.command()
def history(
    exercise: Annotated[str, typer.Option(help="Exercise ID or query")],
    limit: Annotated[int, typer.Option(help="Number of recent entries")] = 10,
):
    """Show recent training history"""
    try:
        entries = read_history(exercise, limit=limit)
        console.print(
            yaml.safe_dump(
                {"exercise": exercise, "entries": entries},
                sort_keys=False,
                allow_unicode=True,
            ).rstrip()
        )
    except ValueError as exc:
        console.print(f"[fail]FAIL:[/fail] {exc}")
        raise typer.Exit(code=1)


@app.command()
def progress(
    exercise: Annotated[str, typer.Option(help="Exercise ID or query")],
):
    """Show a simple progression hint"""
    try:
        hint = progress_hint(exercise)
        console.print(yaml.safe_dump(hint, sort_keys=False, allow_unicode=True).rstrip())
    except ValueError as exc:
        console.print(f"[fail]FAIL:[/fail] {exc}")
        raise typer.Exit(code=1)


@app.command()
def report(
    week: Annotated[str, typer.Option(help="Week selector")] = "current",
    export: Annotated[Optional[str], typer.Option(help="Optional export target")] = None,
    force: Annotated[bool, typer.Option(help="Overwrite the target file")] = False,
):
    """Build a weekly coverage report"""
    try:
        if export == "obsidian":
            weekly_coverage, export_result = export_weekly_report_note(week, force=force)
            payload = {
                "weekly_coverage": weekly_coverage,
                "export": {
                    "format": "obsidian",
                    "path": str(export_result.path),
                    "overwritten": export_result.overwritten,
                    "used_fallback_name": export_result.used_fallback_name,
                }
            }
            if export_result.warning:
                console.print(f"[warn]WARN:[/warn] {export_result.warning}")
        else:
            weekly_coverage = build_weekly_coverage(week)
            payload = {"weekly_coverage": weekly_coverage}
        
        console.print(yaml.safe_dump(payload, sort_keys=False, allow_unicode=True).rstrip())
    except ValueError as exc:
        console.print(f"[fail]FAIL:[/fail] {exc}")
        raise typer.Exit(code=1)


@app.command()
def plan(
    template: Annotated[Optional[str], typer.Option(help="Plan template name")] = None,
    split: Annotated[Optional[str], typer.Option(help="Split name")] = None,
    day: Annotated[Optional[str], typer.Option(help="Training day")] = None,
    goal: Annotated[Optional[str], typer.Option(help="Training goal")] = None,
    export: Annotated[Optional[str], typer.Option(help="Optional export target")] = None,
    force: Annotated[bool, typer.Option(help="Overwrite the target file")] = False,
):
    """Build a rule-based workout plan"""
    try:
        result = build_plan(template=template, split=split, day=day, goal=goal)
        if export == "obsidian":
            export_result = export_plan_note(result, force=force)
            if export_result.warning:
                console.print(f"[warn]WARN:[/warn] {export_result.warning}")
            console.print(
                yaml.safe_dump(
                    {
                        "format": "obsidian",
                        "path": str(export_result.path),
                        "overwritten": export_result.overwritten,
                        "used_fallback_name": export_result.used_fallback_name,
                    },
                    sort_keys=False,
                    allow_unicode=True,
                ).rstrip()
            )
        elif export in {"wger-json", "wger"}:
            payload = build_plan_wger_payload(result, export_format=export)
            warnings = payload.get("warnings", [])
            if isinstance(warnings, list):
                for warning in warnings:
                    if isinstance(warning, str) and warning.strip():
                        console.print(f"[warn]WARN:[/warn] {warning}")
            console.print(yaml.safe_dump(payload, sort_keys=False, allow_unicode=True).rstrip())
        else:
            console.print(yaml.safe_dump(result.__dict__, sort_keys=False, allow_unicode=True).rstrip())
    except ValueError as exc:
        console.print(f"[fail]FAIL:[/fail] {exc}")
        raise typer.Exit(code=1)


@app.command()
def teach(
    exercise_id: str,
    mode: Annotated[str, typer.Option(help="Teaching mode")] = "trainer",
    export: Annotated[Optional[str], typer.Option(help="Optional export target")] = None,
    force: Annotated[bool, typer.Option(help="Overwrite the target file")] = False,
):
    """Render a structured anatomy lesson"""
    try:
        if export == "obsidian":
            export_result = export_teach_note(exercise_id, mode=mode, force=force)
            if export_result.warning:
                console.print(f"[warn]WARN:[/warn] {export_result.warning}")
            console.print(
                yaml.safe_dump(
                    {
                        "format": "obsidian",
                        "path": str(export_result.path),
                        "overwritten": export_result.overwritten,
                        "used_fallback_name": export_result.used_fallback_name,
                    },
                    sort_keys=False,
                    allow_unicode=True,
                ).rstrip()
            )
        else:
            output = teach_exercise(exercise_id, mode=mode)
            render_markdown(output)
    except ValueError as exc:
        console.print(f"[fail]FAIL:[/fail] {exc}")
        raise typer.Exit(code=1)


@app.command()
def coach_sheet(
    exercise: Annotated[str, typer.Option(help="Exercise ID or query")],
    export: Annotated[Optional[str], typer.Option(help="Optional export target")] = None,
    force: Annotated[bool, typer.Option(help="Overwrite the target file")] = False,
):
    """Render a coach sheet"""
    try:
        if export == "obsidian":
            export_result = export_coach_sheet_note(exercise, force=force)
            if export_result.warning:
                console.print(f"[warn]WARN:[/warn] {export_result.warning}")
        else:
            sheet = build_coach_sheet(exercise)
            output = render_coach_sheet_markdown(sheet)
            render_markdown(output)
    except ValueError as exc:
        console.print(f"[fail]FAIL:[/fail] {exc}")
        raise typer.Exit(code=1)


@app.command()
def tui(
    screen: Annotated[str, typer.Option(help="Initial screen")] = "dashboard",
):
    """Launch the Vitaltrainer TUI"""
    run_tui(initial_screen=screen)


@app.command(name="wger-check")
def command_wger_check():
    """Check wger connectivity and config"""
    report = wger_check()
    print_doctor_report(report)
    if report.has_failures:
        raise typer.Exit(code=1)


@app.command()
def map_wger(
    exercise: Annotated[str, typer.Option(help="Exercise ID or query")],
    write: Annotated[bool, typer.Option(help="Write the best match to wger_mapping.yml")] = False,
):
    """Find or write a wger mapping"""
    try:
        result = run_map_wger(exercise, write=write)
        payload = {
            "exercise_id": result.exercise_id,
            "display_name": result.display_name,
            "wger_enabled": result.wger_enabled,
            "base_url": result.base_url,
            "token_present": result.token_present,
            "matches": [
                {
                    "wger_id": match.wger_id,
                    "name": match.name,
                    "confidence": match.confidence,
                    "matched_on": match.matched_on,
                }
                for match in result.matches
            ],
            "selected_match": (
                {
                    "wger_id": result.selected_match.wger_id,
                    "name": result.selected_match.name,
                    "confidence": result.selected_match.confidence,
                    "matched_on": result.selected_match.matched_on,
                }
                if result.selected_match
                else None
            ),
            "written": result.written,
            "mapping_path": result.mapping_path,
            "warning": result.warning,
        }
        console.print(yaml.safe_dump(payload, sort_keys=False, allow_unicode=True).rstrip())
    except ValueError as exc:
        console.print(f"[fail]FAIL:[/fail] {exc}")
        raise typer.Exit(code=1)


@app.command()
def export_exercise(
    exercise: Annotated[str, typer.Option(help="Exercise ID or query")],
    format: Annotated[str, typer.Option(help="Export format")] = "obsidian",
    force: Annotated[bool, typer.Option(help="Overwrite the target file")] = False,
):
    """Export an exercise note to Obsidian"""
    try:
        result = export_exercise_note(exercise, force=force)
        if result.warning:
            console.print(f"[warn]WARN:[/warn] {result.warning}")
        console.print(
            yaml.safe_dump(
                {
                    "format": format,
                    "path": str(result.path),
                    "overwritten": result.overwritten,
                    "used_fallback_name": result.used_fallback_name,
                },
                sort_keys=False,
                allow_unicode=True,
            ).rstrip()
        )
    except ValueError as exc:
        console.print(f"[fail]FAIL:[/fail] {exc}")
        raise typer.Exit(code=1)


@app.command()
def export_coverage(
    exercise: Annotated[str, typer.Option(help="Exercise ID or query")],
    sets: Annotated[int, typer.Option(help="Number of sets")],
    rpe: Annotated[int, typer.Option(help="RPE value")],
    format: Annotated[str, typer.Option(help="Export format")] = "obsidian",
    force: Annotated[bool, typer.Option(help="Overwrite the target file")] = False,
):
    """Export a coverage note to Obsidian"""
    try:
        result = export_coverage_note(exercise, sets, rpe, force=force)
        if result.warning:
            console.print(f"[warn]WARN:[/warn] {result.warning}")
        console.print(
            yaml.safe_dump(
                {
                    "format": format,
                    "path": str(result.path),
                    "overwritten": result.overwritten,
                    "used_fallback_name": result.used_fallback_name,
                },
                sort_keys=False,
                allow_unicode=True,
            ).rstrip()
        )
    except ValueError as exc:
        console.print(f"[fail]FAIL:[/fail] {exc}")
        raise typer.Exit(code=1)


@app.command()
def preview(
    file: Annotated[str, typer.Option(help="Markdown file to preview")],
):
    """Preview a markdown file"""
    path = Path(file).expanduser()
    if not path.exists():
        console.print(f"[fail]FAIL:[/fail] file not found: {path}")
        raise typer.Exit(code=1)
    result = preview_file(path)
    if result.used_glow:
        console.print(result.message)
    else:
        console.print(path.read_text(encoding="utf-8"), end="")


@app.command()
def watch():
    """Start the AI enricher watcher daemon"""
    try:
        run_watcher()
    except KeyboardInterrupt:
        pass
    except Exception as exc:
        console.print(f"[fail]FAIL:[/fail] {exc}")
        raise typer.Exit(code=1)


@app.command(name="import")
def command_import():
    """Bulk import exercises from external sources (wger, yuhonas)"""
    try:
        import_external_exercises()
    except Exception as exc:
        console.print(f"[fail]FAIL:[/fail] {exc}")
        raise typer.Exit(code=1)


@app.command(name="push")
def firestore_push(
    dry_run: Annotated[bool, typer.Option(help="Do not write to Firestore")] = False,
):
    """Push local catalog KB → Firestore"""
    try:
        run_kb_sync(dry_run=dry_run)
    except Exception as exc:
        console.print(f"[fail]FAIL:[/fail] {exc}")
        raise typer.Exit(code=1)


@app.command(name="push-changed")
def firestore_push_changed(
    since: Annotated[str, typer.Option(help="Git-Ref (default: HEAD~1)")] = "HEAD~1",
    until: Annotated[str, typer.Option(help="Git-Ref (default: HEAD)")] = "HEAD",
    dry_run: Annotated[bool, typer.Option(help="Do not write to Firestore")] = False,
):
    """Pusht nur die in einem Git-Range geänderten Exercise-IDs.

    Quota-schonende Alternative zu `push` für kleine Catalog-Patches.
    Default: letzter Commit (HEAD~1..HEAD).
    """
    try:
        result = push_changed_exercises(since_ref=since, until_ref=until, dry_run=dry_run)
        console.print(f"[ok]✓[/ok] {result}")
    except Exception as exc:
        console.print(f"[fail]FAIL:[/fail] {exc}")
        raise typer.Exit(code=1)


@app.command(name="alias-add")
def alias_add(
    exercise_id: Annotated[str, typer.Argument(help="Exercise ID (z.B. 301)")],
    aliases: Annotated[Optional[list[str]], typer.Argument(help="Aliases (optional, sonst Gemini/manuell)")] = None,
):
    """Alias(e) in Exercise-YAML schreiben — Gemini-Vorschlag oder manuelle Eingabe"""
    from .watcher import load_gemini_key

    yml_path = DATA_DIR / "exercises" / f"{exercise_id}.yml"
    if not yml_path.exists():
        console.print(f"[fail]FAIL:[/fail] {yml_path} nicht gefunden")
        raise typer.Exit(code=1)

    data = yaml.safe_load(yml_path.read_text())
    exercises = data.get("exercises") or []
    if not exercises:
        console.print(f"[fail]FAIL:[/fail] Keine exercises-Liste in {yml_path.name}")
        raise typer.Exit(code=1)
    ex = exercises[0]
    existing = ex.get("aliases") or []

    if aliases:
        proposed = aliases
    else:
        from .gemini import load_gemini_key, suggest_aliases, suggest_aliases_cli
        name = ex.get("german") or exercise_id
        api_key = load_gemini_key()
        proposed = None
        if api_key:
            console.print(f"[info]Gemini:[/info] Schlage Aliases vor für '{name}'...")
            proposed = suggest_aliases(ex, api_key)
        if proposed is None:
            console.print(f"[info]CLI:[/info] Gemini nicht verfügbar — versuche Claude/Codex...")
            proposed = suggest_aliases_cli(ex)
        if proposed:
            console.print(f"  Vorschläge: {proposed}")
            raw = typer.prompt("Übernehmen? [Enter=ja, neue Liste kommagetrennt, 's'=skip]", default="")
            if raw.strip().lower() == "s":
                console.print("Skip.")
                return
            if raw.strip():
                proposed = [a.strip() for a in raw.split(",") if a.strip()]
        else:
            console.print("[warn]WARN:[/warn] Kein AI-Vorschlag verfügbar — manuelle Eingabe")
            proposed = None

        if proposed is None:
            raw = typer.prompt("Aliases (kommagetrennt, 's'=skip)")
            if raw.strip().lower() == "s":
                console.print("Skip.")
                return
            proposed = [a.strip() for a in raw.split(",") if a.strip()]

    backup = yml_path.with_suffix(".yml.bak")
    backup.write_text(yml_path.read_text())

    added = [a for a in proposed if a not in existing]
    ex["aliases"] = existing + added
    yml_path.write_text(yaml.dump(data, allow_unicode=True, sort_keys=False, default_flow_style=False))
    console.print(f"[ok]OK:[/ok] {exercise_id} — aliases: {ex['aliases']}")
    if added:
        console.print(f"  Neu: {added}")


def main():
    app()


if __name__ == "__main__":
    main()
