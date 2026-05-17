from __future__ import annotations

import os
from pathlib import Path


PACKAGE_ROOT = Path(__file__).resolve().parent
REPO_ROOT = PACKAGE_ROOT.parent
DATA_DIR = REPO_ROOT / "data"


def runtime_root() -> Path:
    override = os.environ.get("FITNESS_AGENT_HOME", "").strip()
    if override:
        return Path(override).expanduser()
    return Path.home() / ".fitness-agent"

RUNTIME_SUBDIRS = [
    "exercises",
    "muscles",
    "rules",
    "maps",
    "anatomy_teaching",
    "state",
    "cache",
    "backups",
    "exports",
    "exports/obsidian",
    "exports/wger",
    "exports/json",
    "exports/client_notes",
]

SEED_FILE_MAP = {
    "config.yml": "config.yml",
    "exercises/chest.yml": "exercises/chest.yml",
    "exercises/back.yml": "exercises/back.yml",
    "exercises/shoulders.yml": "exercises/shoulders.yml",
    "exercises/arms.yml": "exercises/arms.yml",
    "exercises/legs.yml": "exercises/legs.yml",
    "exercises/core.yml": "exercises/core.yml",
    "muscles/muscles.yml": "muscles/muscles.yml",
    "muscles/muscle_coverage_rules.yml": "muscles/muscle_coverage_rules.yml",
    "muscles/body_highlighter_bridge.yml": "muscles/body_highlighter_bridge.yml",
    "rules/program_rules.yml": "rules/program_rules.yml",
    "rules/progression_rules.yml": "rules/progression_rules.yml",
    "rules/safety_rules.yml": "rules/safety_rules.yml",
    "maps/aliases.yml": "maps/aliases.yml",
    "maps/wger_mapping.yml": "maps/wger_mapping.yml",
    "maps/external_db_mapping.yml": "maps/external_db_mapping.yml",
    "anatomy_teaching/chest_lessons.yml": "anatomy_teaching/chest_lessons.yml",
    "anatomy_teaching/incline_dumbbell_press.yml": "anatomy_teaching/incline_dumbbell_press.yml",
    "anatomy_teaching/cable_fly.yml": "anatomy_teaching/cable_fly.yml",
    "anatomy_teaching/lateral_raise.yml": "anatomy_teaching/lateral_raise.yml",
    "anatomy_teaching/overhead_triceps_extension.yml": "anatomy_teaching/overhead_triceps_extension.yml",
    "anatomy_teaching/cable_pushdown.yml": "anatomy_teaching/cable_pushdown.yml",
    "anatomy_teaching/close_grip_bench_press.yml": "anatomy_teaching/close_grip_bench_press.yml",
    "anatomy_teaching/chin_up.yml": "anatomy_teaching/chin_up.yml",
    "anatomy_teaching/chest_supported_row.yml": "anatomy_teaching/chest_supported_row.yml",
    "anatomy_teaching/barbell_row.yml": "anatomy_teaching/barbell_row.yml",
    "anatomy_teaching/rear_delt_fly.yml": "anatomy_teaching/rear_delt_fly.yml",
    "anatomy_teaching/face_pull.yml": "anatomy_teaching/face_pull.yml",
    "anatomy_teaching/hammer_curl.yml": "anatomy_teaching/hammer_curl.yml",
    "anatomy_teaching/deadlift.yml": "anatomy_teaching/deadlift.yml",
    "anatomy_teaching/romanian_deadlift.yml": "anatomy_teaching/romanian_deadlift.yml",
    "anatomy_teaching/hip_thrust.yml": "anatomy_teaching/hip_thrust.yml",
    "anatomy_teaching/leg_curl.yml": "anatomy_teaching/leg_curl.yml",
    "anatomy_teaching/calf_raise.yml": "anatomy_teaching/calf_raise.yml",
    "anatomy_teaching/lunge.yml": "anatomy_teaching/lunge.yml",
}

REQUIRED_RUNTIME_FILES = [
    "config.yml",
    "maps/aliases.yml",
    "rules/program_rules.yml",
    "muscles/muscles.yml",
    "muscles/body_highlighter_bridge.yml",
    "maps/wger_mapping.yml",
]
