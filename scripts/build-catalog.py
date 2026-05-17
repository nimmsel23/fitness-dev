#!/usr/bin/env python3
"""
Build fitness workout catalog from fitness-agent YAML sources.
Exports to ~/.aos/fitness/workouts/catalog.json
"""

import json
import sys
import yaml
from pathlib import Path

def build_catalog():
    """Load all exercise YAMLs and build unified catalog."""

    fitness_agent_root = Path.home() / ".fitness-agent"
    exercises_dir = fitness_agent_root / "exercises"

    if not exercises_dir.exists():
        print(f"❌ exercises directory not found: {exercises_dir}", file=sys.stderr)
        return False

    catalog = {
        "version": "0.1.0",
        "generated_from": "fitness-agent YAML",
        "exercises": []
    }

    # Load all YAML files from exercises/
    for yml_file in sorted(exercises_dir.glob("*.yml")):
        try:
            with open(yml_file, "r", encoding="utf-8") as f:
                data = yaml.safe_load(f)

            if not data or "exercises" not in data:
                continue

            for ex in data["exercises"]:
                catalog["exercises"].append({
                    "id": ex.get("exercise_id") or ex.get("id"),
                    "name": ex.get("name") or ex.get("display_name"),
                    "name_de": ex.get("display_name") or ex.get("german"),
                    "category": ex.get("category"),
                    "type": ex.get("type"),  # compound, isolation
                    "movement_pattern": ex.get("movement_pattern"),
                    "equipment": ex.get("equipment") or [],
                    "primary_muscles": ex.get("primary_muscles") or [],
                    "secondary_muscles": ex.get("secondary_muscles") or [],
                    "stabilizers": ex.get("stabilizers") or [],
                    "variations": ex.get("variations") or [],
                    "aliases": ex.get("aliases") or [],
                    "coaching_notes": ex.get("coaching_notes") or [],
                    "common_errors": ex.get("common_errors") or [],
                    "tags": ex.get("tags") or [],
                    "wger_id": ex.get("wger_id"),  # if available
                    "difficulty": ex.get("difficulty", "intermediate"),
                    "default_sets": ex.get("default_sets", 3),
                    "default_reps": ex.get("default_reps", 8),
                })
        except Exception as e:
            print(f"⚠️  Error loading {yml_file.name}: {e}", file=sys.stderr)
            continue

    if not catalog["exercises"]:
        print("❌ No exercises found in YAML files", file=sys.stderr)
        return False

    # Write to target
    aos_root = Path.home() / ".aos" / "fitness" / "workouts"
    aos_root.mkdir(parents=True, exist_ok=True)

    catalog_file = aos_root / "catalog.json"
    with open(catalog_file, "w", encoding="utf-8") as f:
        json.dump(catalog, f, indent=2, ensure_ascii=False)

    print(f"✅ Catalog built: {len(catalog['exercises'])} exercises")
    print(f"📝 Saved to: {catalog_file}")

    return True

if __name__ == "__main__":
    success = build_catalog()
    sys.exit(0 if success else 1)
