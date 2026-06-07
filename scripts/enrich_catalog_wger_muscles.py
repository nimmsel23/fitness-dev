#!/usr/bin/env python3
"""
Reichert catalog/kb/exercises/*.yml mit wger_muscle_ids an.
Kuratierte Mapping-Tabelle (exercise_id → wger muscle IDs) statt unsicheres Name-Matching.

wger muscle IDs (/api/v2/muscle/):
  1  Biceps brachii       7  Gastrocnemius    13 Brachialis
  2  Anterior deltoid     8  Gluteus maximus  14 Obliquus externus
  3  Serratus anterior    9  Trapezius        15 Soleus
  4  Pectoralis major    10  Quadriceps       16 Erector spinae
  5  Triceps brachii     11  Biceps femoris
  6  Rectus abdominis    12  Latissimus dorsi
"""
from __future__ import annotations

from pathlib import Path
from typing import Optional

import yaml
import typer
from loguru import logger
from rich.console import Console
from rich.table import Table
from rich.panel import Panel

app = typer.Typer(help="Enrich exercise catalog with wger muscle IDs")
console = Console()

# exercise_id → {primary: [wger muscle IDs], secondary: [wger muscle IDs]}
MUSCLE_MAP: dict[str, dict[str, list[int]]] = {
    # ── Chest ──────────────────────────────────────────────────────────────────
    "incline_dumbbell_press":   {"primary": [4],     "secondary": [2, 5]},
    "dips_chest":               {"primary": [4, 5],  "secondary": [2]},
    "cable_fly":                {"primary": [4, 3],  "secondary": [2]},
    "pec_deck":                 {"primary": [4],     "secondary": [3]},

    # ── Back ───────────────────────────────────────────────────────────────────
    "pull_up":                  {"primary": [12],    "secondary": [1, 9]},
    "chin_up":                  {"primary": [12, 1], "secondary": [9]},
    "lat_pulldown":             {"primary": [12],    "secondary": [1, 9]},
    "barbell_row":              {"primary": [12, 9], "secondary": [1, 16]},
    "chest_supported_row":      {"primary": [12, 9], "secondary": [1]},
    "t_bar_row":                {"primary": [12, 9], "secondary": [1, 16]},

    # ── Shoulders ──────────────────────────────────────────────────────────────
    "overhead_press":           {"primary": [2],     "secondary": [5, 9]},
    "dumbbell_shoulder_press":  {"primary": [2],     "secondary": [5]},
    "lateral_raise":            {"primary": [2],     "secondary": []},
    "face_pull":                {"primary": [9],     "secondary": [2]},
    "rear_delt_fly":            {"primary": [9],     "secondary": [2]},

    # ── Arms ───────────────────────────────────────────────────────────────────
    "overhead_triceps_extension": {"primary": [5],   "secondary": []},
    "cable_pushdown":           {"primary": [5],     "secondary": []},
    "skull_crusher":            {"primary": [5],     "secondary": []},
    "close_grip_bench_press":   {"primary": [5],     "secondary": [4, 2]},
    "barbell_curl":             {"primary": [1],     "secondary": [13]},
    "incline_dumbbell_curl":    {"primary": [1],     "secondary": [13]},
    "hammer_curl":              {"primary": [13, 1], "secondary": []},
    "preacher_curl":            {"primary": [1],     "secondary": []},

    # ── Legs ───────────────────────────────────────────────────────────────────
    "back_squat":               {"primary": [10],    "secondary": [8, 11]},
    "front_squat":              {"primary": [10],    "secondary": [8]},
    "leg_press":                {"primary": [10],    "secondary": [8]},
    "leg_extension":            {"primary": [10],    "secondary": []},
    "deadlift":                 {"primary": [16, 8], "secondary": [12, 11]},
    "romanian_deadlift":        {"primary": [11, 8], "secondary": [16]},
    "leg_curl":                 {"primary": [11],    "secondary": []},
    "hip_thrust":               {"primary": [8],     "secondary": [11]},
    "bulgarian_split_squat":    {"primary": [10, 8], "secondary": [11]},
    "lunge":                    {"primary": [10, 8], "secondary": [11]},
    "calf_raise":               {"primary": [7],     "secondary": [15]},

    # ── Core ───────────────────────────────────────────────────────────────────
    "hanging_leg_raise":        {"primary": [6],     "secondary": [14]},
    "cable_crunch":             {"primary": [6],     "secondary": [14]},
    "ab_wheel":                 {"primary": [6],     "secondary": [14, 3]},
    "plank":                    {"primary": [14, 6], "secondary": [1, 10, 5]},
    "pallof_press":             {"primary": [14],    "secondary": [6]},
    "side_plank":               {"primary": [14],    "secondary": [6]},
}


def process_file(path: Path, dry_run: bool) -> tuple[int, int]:
    with open(path, encoding="utf-8") as f:
        data = yaml.safe_load(f)

    exercises = data.get("exercises", [])
    updated = 0
    skipped = 0

    for ex in exercises:
        eid = ex.get("exercise_id", "")
        mapping = MUSCLE_MAP.get(eid)
        if mapping is None:
            skipped += 1
            continue
        ex["wger_muscle_ids"] = mapping
        updated += 1

    if updated and not dry_run:
        with open(path, "w", encoding="utf-8") as f:
            yaml.dump(data, f, allow_unicode=True, sort_keys=False,
                      default_flow_style=False, width=120)
    
    return updated, skipped


@app.command()
def enrich(
    catalog_dir: Optional[Path] = typer.Option(
        Path(__file__).resolve().parent.parent / "catalog" / "kb" / "exercises",
        help="Directory containing exercise YAML files"
    ),
    dry_run: bool = typer.Option(False, "--dry-run", help="Do not write changes to files"),
):
    """Reichert catalog/kb/exercises/*.yml mit wger_muscle_ids an."""
    
    if dry_run:
        console.print(Panel("[bold yellow]DRY RUN — No files will be modified[/bold yellow]"))

    table = Table(title="Muscle Enrichment Progress", box=None)
    table.add_column("File", style="cyan")
    table.add_column("Updated", style="green", justify="right")
    table.add_column("Skipped", style="dim", justify="right")

    total_updated = 0
    total_skipped = 0
    
    for yml in sorted(catalog_dir.glob("*.yml")):
        updated, skipped = process_file(yml, dry_run)
        table.add_row(yml.name, str(updated), str(skipped))
        total_updated += updated
        total_skipped += skipped

    console.print(table)
    
    status_msg = f"[bold green]✓ Enrichment complete![/bold green]\nTotal Updated: {total_updated}\nTotal Skipped: {total_skipped}"
    console.print(Panel(status_msg, expand=False))


if __name__ == "__main__":
    app()
