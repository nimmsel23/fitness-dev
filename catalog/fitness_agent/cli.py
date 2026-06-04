from __future__ import annotations

import argparse
import sys
from typing import Sequence
from pathlib import Path

if __package__ in {None, ""}:
    package_root = Path(__file__).resolve().parent.parent
    if str(package_root) not in sys.path:
        sys.path.insert(0, str(package_root))
    __package__ = "fitness_agent"

import yaml

from .bootstrap import bootstrap
from .audit import (
    audit_aliases,
    audit_all,
    audit_coverage,
    audit_exercises,
    run_aliases_audit,
    run_anatomy_audit,
    run_coverage_audit,
    run_all_audits,
    status_for_exercises,
)
from .coach_sheet import build_coach_sheet, render_coach_sheet_markdown
from .coverage import calculate_coverage
from .doctor import run_doctor
from .history import ensure_history_db, log_training_entry, progress_hint, read_history
from .obsidian import export_coach_sheet_note, export_coverage_note, export_exercise_note, export_plan_note, export_teach_note, export_weekly_report_note
from .preview import preview_file, render_markdown
from .planner import build_plan
from .teaching import teach_exercise
from .wger import build_plan_wger_payload, map_wger, wger_check
from .resolver import resolve_query
from .weekly import build_weekly_coverage
from .tui import run_tui
from .watcher import run_watcher
from .importer import import_external_exercises
from .kb_sync import run_kb_sync
from .kb_sync import run_kb_sync


def build_parser() -> argparse.ArgumentParser:
    parser = argparse.ArgumentParser(prog="fitness-agent")
    subparsers = parser.add_subparsers(dest="command", required=True)

    bootstrap_parser = subparsers.add_parser("bootstrap", help="Initialize ~/.aos/fitness")
    bootstrap_parser.add_argument(
        "--force",
        action="store_true",
        help="Replace tracked YAML files after backing up the existing copies",
    )

    subparsers.add_parser("doctor", help="Check the local runtime layout")
    audit_parser = subparsers.add_parser("audit", help="Run deterministic audits")
    audit_parser.add_argument("topic", choices=["anatomy", "coverage", "aliases", "exercises", "all"], help="Audit topic")
    resolve_parser = subparsers.add_parser("resolve", help="Resolve an exercise query")
    resolve_parser.add_argument("query", help="Exercise search text")
    coverage_parser = subparsers.add_parser("coverage", help="Calculate muscle coverage")
    coverage_target = coverage_parser.add_mutually_exclusive_group(required=True)
    coverage_target.add_argument("--exercise", help="Exercise ID or query")
    coverage_target.add_argument("--week", nargs="?", const="current", help="Week selector")
    coverage_parser.add_argument("--sets", type=int, help="Number of sets")
    coverage_parser.add_argument("--rpe", type=int, help="RPE value")
    log_parser = subparsers.add_parser("log", help="Log a training set")
    log_parser.add_argument("--exercise", required=True, help="Exercise ID or query")
    log_parser.add_argument("--sets", required=True, type=int, help="Number of sets")
    log_parser.add_argument("--reps", required=True, type=int, help="Reps")
    log_parser.add_argument("--weight", required=True, type=float, help="Weight")
    log_parser.add_argument("--rpe", required=True, type=int, help="RPE value")
    log_parser.add_argument("--workout-id", help="Workout identifier")
    log_parser.add_argument("--date", help="ISO date")
    log_parser.add_argument("--notes", default="", help="Notes")
    log_parser.add_argument("--pain", default="", help="Pain notes")
    log_parser.add_argument(
        "--completion-status",
        default="completed",
        help="Completion status",
    )
    history_parser = subparsers.add_parser("history", help="Show recent training history")
    history_parser.add_argument("--exercise", required=True, help="Exercise ID or query")
    history_parser.add_argument("--limit", type=int, default=10, help="Number of recent entries")
    progress_parser = subparsers.add_parser("progress", help="Show a simple progression hint")
    progress_parser.add_argument("--exercise", required=True, help="Exercise ID or query")
    report_parser = subparsers.add_parser("report", help="Build a weekly coverage report")
    report_parser.add_argument("--week", nargs="?", const="current", default="current", help="Week selector")
    report_parser.add_argument("--export", choices=["obsidian"], help="Optional export target")
    report_parser.add_argument("--force", action="store_true", help="Overwrite the target file")
    plan_parser = subparsers.add_parser("plan", help="Build a rule-based workout plan")
    plan_parser.add_argument("--template", help="Plan template name")
    plan_parser.add_argument("--split", help="Split name")
    plan_parser.add_argument("--day", help="Training day")
    plan_parser.add_argument("--goal", help="Training goal")
    plan_parser.add_argument("--export", choices=["obsidian", "wger-json", "wger"], help="Optional export target")
    plan_parser.add_argument("--force", action="store_true", help="Overwrite the target file")
    teach_parser = subparsers.add_parser("teach", help="Render a structured anatomy lesson")
    teach_parser.add_argument("exercise_id", help="Exercise ID to teach")
    teach_parser.add_argument("--mode", choices=["trainer", "client"], default="trainer", help="Teaching mode")
    teach_parser.add_argument("--export", choices=["obsidian"], help="Optional export target")
    teach_parser.add_argument("--force", action="store_true", help="Overwrite the target file")
    coach_sheet_parser = subparsers.add_parser("coach-sheet", help="Render a coach sheet")
    coach_sheet_parser.add_argument("--exercise", required=True, help="Exercise ID or query")
    coach_sheet_parser.add_argument("--export", choices=["obsidian"], help="Optional export target")
    coach_sheet_parser.add_argument("--force", action="store_true", help="Overwrite the target file")
    tui_parser = subparsers.add_parser("tui", help="Launch the Vitaltrainer TUI")
    tui_parser.add_argument("--screen", choices=["dashboard", "browser", "plan", "lesson", "coach", "log", "history", "report", "wger"], default="dashboard", help="Initial screen")
    subparsers.add_parser("wger-check", help="Check wger connectivity and config")
    map_wger_parser = subparsers.add_parser("map-wger", help="Find or write a wger mapping")
    map_wger_parser.add_argument("--exercise", required=True, help="Exercise ID or query")
    map_wger_parser.add_argument("--write", action="store_true", help="Write the best match to wger_mapping.yml")
    export_exercise_parser = subparsers.add_parser("export-exercise", help="Export an exercise note to Obsidian")
    export_exercise_parser.add_argument("--exercise", required=True, help="Exercise ID or query")
    export_exercise_parser.add_argument("--format", default="obsidian", choices=["obsidian"], help="Export format")
    export_exercise_parser.add_argument("--force", action="store_true", help="Overwrite the target file")
    export_coverage_parser = subparsers.add_parser("export-coverage", help="Export a coverage note to Obsidian")
    export_coverage_parser.add_argument("--exercise", required=True, help="Exercise ID or query")
    export_coverage_parser.add_argument("--sets", required=True, type=int, help="Number of sets")
    export_coverage_parser.add_argument("--rpe", required=True, type=int, help="RPE value")
    export_coverage_parser.add_argument("--format", default="obsidian", choices=["obsidian"], help="Export format")
    export_coverage_parser.add_argument("--force", action="store_true", help="Overwrite the target file")
    preview_parser = subparsers.add_parser("preview", help="Preview a markdown file")
    preview_parser.add_argument("--file", required=True, help="Markdown file to preview")

    subparsers.add_parser("watch", help="Start the AI enricher watcher daemon")
    subparsers.add_parser("import", help="Bulk import exercises from external sources (wger, yuhonas)")
    kb_sync_parser = subparsers.add_parser("kb-sync", help="Synchronize the local KB to Firestore")
    kb_sync_parser.add_argument("--dry-run", action="store_true", help="Do not write to Firestore")

    return parser


def main(argv: Sequence[str] | None = None) -> int:
    args = build_parser().parse_args(argv)

    if args.command == "bootstrap":
        report = bootstrap(force=bool(args.force))
        print("Fitness Agent Bootstrap")
        for line in report:
            print(f"[{line.level}] {line.message}")
        print("Status: bootstrap complete")
        return 0

    if args.command == "doctor":
        report = run_doctor()
        print("Fitness Agent Doctor")
        for line in report.lines:
            print(f"[{line.level}] {line.message}")
        if report.has_failures:
            print("Status: FAIL")
            return 1
        if report.has_warnings:
            print("Status: WARN")
            return 0
        print("Status: OK")
        return 0

    if args.command == "audit":
        if args.topic == "anatomy":
            report = run_anatomy_audit()
            print("Fitness Agent Anatomy Audit")
            for line in report.lines:
                print(f"[{line.level}] {line.message}")
            print(f"Lessons checked: {sum(1 for line in report.lines if line.level == 'OK' and 'lesson valid' in line.message)}")
            print(f"OK: {report.ok_count}")
            print(f"WARN: {report.warn_count}")
            print(f"FAIL: {report.fail_count}")
            if report.has_failures:
                print("Status: ANATOMY_LAYER_BROKEN")
                return 1
            print("Status: ANATOMY_LAYER_USABLE")
            return 0
        if args.topic == "coverage":
            report = run_coverage_audit()
            print("Fitness Agent Coverage Audit")
            for line in report.lines:
                print(f"[{line.level}] {line.message}")
            print(f"OK: {report.ok_count}")
            print(f"WARN: {report.warn_count}")
            print(f"FAIL: {report.fail_count}")
            if report.has_failures:
                print("Status: COVERAGE_LAYER_BROKEN")
                return 1
            print("Status: COVERAGE_LAYER_USABLE")
            return 0
        if args.topic == "aliases":
            report = run_aliases_audit()
            print("Fitness Agent Aliases Audit")
            for line in report.lines:
                print(f"[{line.level}] {line.message}")
            print(f"OK: {report.ok_count}")
            print(f"WARN: {report.warn_count}")
            print(f"FAIL: {report.fail_count}")
            if report.has_failures:
                print("Status: ALIASES_LAYER_BROKEN")
                return 1
            print("Status: ALIASES_LAYER_USABLE")
            return 0
        if args.topic == "exercises":
            result = audit_exercises()
            print("Fitness Agent Exercises Audit")
            print(f"total_exercises: {result.total_exercises}")
            print(f"exercises_by_category: {yaml.safe_dump(result.exercises_by_category, sort_keys=False, allow_unicode=True).rstrip()}")
            print(f"missing_required_fields: {result.missing_required_fields}")
            print(f"duplicate_ids: {result.duplicate_ids}")
            print(f"unknown_categories: {result.unknown_categories}")
            print(f"empty_primary_muscles: {result.empty_primary_muscles}")
            print(f"empty_coaching_notes: {result.empty_coaching_notes}")
            print(f"empty_common_errors: {result.empty_common_errors}")
            for line in result.lines:
                print(f"[{line.level}] {line.message}")
            status = status_for_exercises(result)
            print(f"Status: {status}")
            return 1 if status == "FAIL" else 0
        if args.topic == "all":
            return run_all_audits()

    if args.command == "resolve":
        result = resolve_query(args.query)
        print(yaml.safe_dump(result.__dict__, sort_keys=False, allow_unicode=True).rstrip())
        return 0 if result.matched else 1

    if args.command == "coverage":
        if args.week:
            try:
                result = build_weekly_coverage(args.week)
            except ValueError as exc:
                print(f"FAIL: {exc}")
                return 1
            print(yaml.safe_dump({"weekly_coverage": result}, sort_keys=False, allow_unicode=True).rstrip())
        else:
            if args.sets is None or args.rpe is None:
                print("FAIL: --exercise requires --sets and --rpe")
                return 1
            try:
                result = calculate_coverage(args.exercise, args.sets, args.rpe)
            except ValueError as exc:
                print(f"FAIL: {exc}")
                return 1
            print(yaml.safe_dump(result, sort_keys=False, allow_unicode=True).rstrip())
        return 0

    if args.command == "log":
        try:
            result = log_training_entry(
                args.exercise,
                sets=args.sets,
                reps=args.reps,
                weight=args.weight,
                rpe=args.rpe,
                workout_id=args.workout_id,
                date=args.date,
                notes=args.notes,
                pain=args.pain,
                completion_status=args.completion_status,
            )
        except ValueError as exc:
            print(f"FAIL: {exc}")
            return 1
        print(
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
        return 0

    if args.command == "history":
        try:
            entries = read_history(args.exercise, limit=args.limit)
        except ValueError as exc:
            print(f"FAIL: {exc}")
            return 1
        print(
            yaml.safe_dump(
                {"exercise": args.exercise, "entries": entries},
                sort_keys=False,
                allow_unicode=True,
            ).rstrip()
        )
        return 0

    if args.command == "progress":
        try:
            hint = progress_hint(args.exercise)
        except ValueError as exc:
            print(f"FAIL: {exc}")
            return 1
        print(yaml.safe_dump(hint, sort_keys=False, allow_unicode=True).rstrip())
        return 0

    if args.command == "plan":
        try:
            result = build_plan(template=args.template, split=args.split, day=args.day, goal=args.goal)
        except ValueError as exc:
            print(f"FAIL: {exc}")
            return 1
        if args.export == "obsidian":
            try:
                export_result = export_plan_note(result, force=bool(args.force))
            except ValueError as exc:
                print(f"FAIL: {exc}")
                return 1
            if export_result.warning:
                print(f"WARN: {export_result.warning}")
            print(
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
            return 0
        if args.export in {"wger-json", "wger"}:
            payload = build_plan_wger_payload(result, export_format=args.export)
            warnings = payload.get("warnings", [])
            if isinstance(warnings, list):
                for warning in warnings:
                    if isinstance(warning, str) and warning.strip():
                        print(f"WARN: {warning}")
            print(yaml.safe_dump(payload, sort_keys=False, allow_unicode=True).rstrip())
            return 0
        print(yaml.safe_dump(result.__dict__, sort_keys=False, allow_unicode=True).rstrip())
        return 0

    if args.command == "teach":
        try:
            output = teach_exercise(args.exercise_id, mode=args.mode)
        except ValueError as exc:
            print(f"FAIL: {exc}")
            return 1
        if args.export == "obsidian":
            try:
                export_result = export_teach_note(args.exercise_id, mode=args.mode, force=bool(args.force))
            except ValueError as exc:
                print(f"FAIL: {exc}")
                return 1
            if export_result.warning:
                print(f"WARN: {export_result.warning}")
            print(
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
            return 0
        render_markdown(output)
        return 0

    if args.command == "coach-sheet":
        try:
            sheet = build_coach_sheet(args.exercise)
            output = render_coach_sheet_markdown(sheet)
        except ValueError as exc:
            print(f"FAIL: {exc}")
            return 1
        if args.export == "obsidian":
            try:
                export_result = export_coach_sheet_note(args.exercise, force=bool(args.force))
            except ValueError as exc:
                print(f"FAIL: {exc}")
                return 1
            if export_result.warning:
                print(f"WARN: {export_result.warning}")
        render_markdown(output)
        return 0

    if args.command == "tui":
        run_tui(initial_screen=args.screen)
        return 0

    if args.command == "wger-check":
        report = wger_check()
        print("Fitness Agent Wger Check")
        for line in report.lines:
            print(f"[{line.level}] {line.message}")
        if report.has_failures:
            print("Status: FAIL")
            return 1
        if report.has_warnings:
            print("Status: WARN")
            return 0
        print("Status: OK")
        return 0

    if args.command == "map-wger":
        try:
            result = map_wger(args.exercise, write=bool(args.write))
        except ValueError as exc:
            print(f"FAIL: {exc}")
            return 1
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
        print(yaml.safe_dump(payload, sort_keys=False, allow_unicode=True).rstrip())
        return 0

    if args.command == "export-exercise":
        try:
            result = export_exercise_note(args.exercise, force=bool(args.force))
        except ValueError as exc:
            print(f"FAIL: {exc}")
            return 1
        if result.warning:
            print(f"WARN: {result.warning}")
        print(
            yaml.safe_dump(
                {
                    "format": "obsidian",
                    "path": str(result.path),
                    "overwritten": result.overwritten,
                    "used_fallback_name": result.used_fallback_name,
                },
                sort_keys=False,
                allow_unicode=True,
            ).rstrip()
        )
        return 0

    if args.command == "report":
        try:
            weekly_coverage = build_weekly_coverage(args.week)
        except ValueError as exc:
            print(f"FAIL: {exc}")
            return 1
        payload: dict[str, object] = {"weekly_coverage": weekly_coverage}
        if args.export == "obsidian":
            try:
                weekly_coverage, export_result = export_weekly_report_note(args.week, force=bool(args.force))
            except ValueError as exc:
                print(f"FAIL: {exc}")
                return 1
            if export_result.warning:
                print(f"WARN: {export_result.warning}")
            payload["weekly_coverage"] = weekly_coverage
            payload["export"] = {
                "format": "obsidian",
                "path": str(export_result.path),
                "overwritten": export_result.overwritten,
                "used_fallback_name": export_result.used_fallback_name,
            }
        print(yaml.safe_dump(payload, sort_keys=False, allow_unicode=True).rstrip())
        return 0

    if args.command == "export-coverage":
        try:
            result = export_coverage_note(args.exercise, args.sets, args.rpe, force=bool(args.force))
        except ValueError as exc:
            print(f"FAIL: {exc}")
            return 1
        if result.warning:
            print(f"WARN: {result.warning}")
        print(
            yaml.safe_dump(
                {
                    "format": "obsidian",
                    "path": str(result.path),
                    "overwritten": result.overwritten,
                    "used_fallback_name": result.used_fallback_name,
                },
                sort_keys=False,
                allow_unicode=True,
            ).rstrip()
        )
        return 0

    if args.command == "preview":
        path = Path(args.file).expanduser()
        if not path.exists():
            print(f"FAIL: file not found: {path}")
            return 1
        result = preview_file(path)
        if result.used_glow:
            print(result.message)
            return 0
        print(path.read_text(encoding="utf-8"), end="")
        return 0

    if args.command == "kb-sync":
        try:
            run_kb_sync(dry_run=bool(args.dry_run))
            return 0
        except Exception as exc:
            print(f"FAIL: {exc}")
            return 1

    if args.command == "watch":
        try:
            run_watcher()
            return 0
        except KeyboardInterrupt:
            return 0
        except Exception as exc:
            print(f"FAIL: {exc}")
            return 1

    if args.command == "import":
        try:
            import_external_exercises()
            return 0
        except Exception as exc:
            print(f"FAIL: {exc}")
            return 1

    return 2


if __name__ == "__main__":
    raise SystemExit(main())
