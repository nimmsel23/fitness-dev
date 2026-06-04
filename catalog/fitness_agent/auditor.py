from __future__ import annotations

from pathlib import Path
from typing import Any

from .loader import load_catalog_yaml
from .resolver import build_exercise_index, normalize_text

def load_biomechanical_rules() -> dict[str, Any]:
    try:
        return load_catalog_yaml("rules/biomechanics.yml")
    except FileNotFoundError:
        return {}

def run_biomechanical_audit() -> list[str]:
    """Runs biomechanical consistency checks against the exercise catalog.
    Returns a list of warning messages.
    """
    rules = load_biomechanical_rules()
    if not rules:
        return ["WARN: Biomechanical rules file missing."]
    
    mp_rules = rules.get("movement_pattern_rules", {})
    iso_rules = rules.get("isolation_rules", {})
    
    warnings = []
    exercises = build_exercise_index()
    
    for ex in exercises:
        # 1. Check Movement Pattern Consistency
        mp = ex.movement_pattern
        if mp in mp_rules:
            rule = mp_rules[mp]
            required = rule.get("required_primary", [])
            primary = [normalize_text(m) for m in (ex.primary_muscles or [])]
            
            # Check if at least one of the required muscles is present as primary
            if not any(normalize_text(req) in primary for req in required):
                warnings.append(
                    f"BIOMECH: {ex.exercise_id} has pattern '{mp}' but missing expected primary muscles "
                    f"({', '.join(required)}). Found: {', '.join(primary) or 'none'}."
                )
        
        # 2. Check Isolation vs Compound
        ex_type = getattr(ex, "type", "unknown")
        primary_count = len(ex.primary_muscles or [])
        if ex_type == "isolation":
            max_p = iso_rules.get("max_primary_muscles", 2)
            if primary_count > max_p:
                warnings.append(
                    f"BIOMECH: {ex.exercise_id} is marked as 'isolation' but has {primary_count} primary muscles "
                    f"(expected <= {max_p})."
                )
        
        # 3. Check for obvious contradictions (e.g. Primary vs Secondary overlap)
        primary_set = set(ex.primary_muscles or [])
        secondary_set = set(ex.secondary_muscles or [])
        overlap = primary_set.intersection(secondary_set)
        if overlap:
            warnings.append(
                f"BIOMECH: {ex.exercise_id} has muscles listed as both primary and secondary: {', '.join(overlap)}."
            )
            
    return warnings

def write_biomechanical_report():
    warnings = run_biomechanical_audit()
    report_path = Path.home() / ".aos" / "fitness" / "agent-state" / "biomechanical_audit.txt"
    report_path.parent.mkdir(parents=True, exist_ok=True)
    
    content = "# Biomechanical Audit Report\n\n"
    if not warnings:
        content += "All exercises passed biomechanical consistency checks.\n"
    else:
        content += f"Found {len(warnings)} potential issues:\n\n"
        for w in warnings:
            content += f"- {w}\n"
            
    report_path.write_text(content, encoding="utf-8")
    return report_path
