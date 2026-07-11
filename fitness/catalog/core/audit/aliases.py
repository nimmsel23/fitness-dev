from __future__ import annotations

from fitness.catalog.core.resolver import build_exercise_index, normalize_text
from .loaders import load_aliases_document
from .types import AuditLine, AliasAuditResult, AuditReport, ok, warn, fail
from .utils import count_aliases_per_exercise


def run_aliases_audit() -> AuditReport:
    lines: list[AuditLine] = []
    exercise_ids = {record.exercise_id for record in build_exercise_index()}
    alias_document = load_aliases_document()
    if alias_document is None:
        lines.append(fail("aliases.yml missing or unreadable"))
        return AuditReport(lines)
    lines.append(ok("aliases.yml parses"))

    raw_aliases = alias_document.get("aliases", alias_document)
    if not isinstance(raw_aliases, dict):
        lines.append(fail("aliases.yml has invalid aliases map"))
        return AuditReport(lines)

    normalized_alias_to_id: dict[str, str] = {}
    raw_alias_groups: dict[str, list[tuple[str, str]]] = {}
    missing_aliases: list[str] = []

    for alias, canonical_id in raw_aliases.items():
        if not isinstance(alias, str) or not alias.strip():
            lines.append(fail("alias entry missing alias text"))
            continue
        if not isinstance(canonical_id, str) or not canonical_id.strip():
            lines.append(fail(f"alias {alias} missing canonical id"))
            continue

        normalized = normalize_text(alias)
        raw_alias_groups.setdefault(normalized, []).append((alias, canonical_id))

        if canonical_id not in exercise_ids:
            lines.append(fail(f"alias {alias} points to missing exercise_id: {canonical_id}"))
            continue

        if normalized in normalized_alias_to_id and normalized_alias_to_id[normalized] != canonical_id:
            lines.append(fail(f"suspicious alias collision: {alias} normalizes to {normalized} but maps to {canonical_id}"))
            continue

        normalized_alias_to_id[normalized] = canonical_id
        lines.append(ok(f"alias valid: {alias} -> {canonical_id}"))

    for normalized, entries in raw_alias_groups.items():
        target_ids = {canonical_id for _, canonical_id in entries}
        if len(target_ids) > 1:
            lines.append(fail(f"suspicious aliases normalize to same string but map to different IDs: {normalized}"))
        if len(entries) > 1:
            lines.append(fail(f"duplicate aliases after normalization: {normalized}"))

    alias_counts = count_aliases_per_exercise(raw_aliases, exercise_ids)
    for exercise_id in sorted(exercise_ids):
        if alias_counts.get(exercise_id, 0) == 0:
            missing_aliases.append(exercise_id)

    if missing_aliases:
        lines.append(warn("exercise ids without any alias: " + ", ".join(missing_aliases)))
    else:
        lines.append(ok("every exercise id has at least one alias"))

    if not any(line.level == "FAIL" for line in lines):
        lines.append(ok("aliases audit complete"))
    return AuditReport(lines)


def audit_aliases() -> AliasAuditResult:
    exercise_ids = {record.exercise_id for record in build_exercise_index()}
    alias_document = load_aliases_document()
    if alias_document is None:
        return AliasAuditResult(0, 0, [], [], [], [fail("aliases.yml missing or unreadable")])
    raw_aliases = alias_document.get("aliases", alias_document)
    if not isinstance(raw_aliases, dict):
        return AliasAuditResult(len(exercise_ids), 0, [], [], [], [fail("aliases.yml has invalid aliases map")])

    duplicate_aliases: list[str] = []
    aliases_pointing_to_missing_exercise_ids: list[str] = []
    normalized_map: dict[str, str] = {}
    normalized_groups: dict[str, list[tuple[str, str]]] = {}
    alias_owner_count: dict[str, int] = {exercise_id: 0 for exercise_id in exercise_ids}
    lines: list[AuditLine] = [ok("aliases.yml parses")]

    for alias, canonical_id in raw_aliases.items():
        if not isinstance(alias, str) or not alias.strip() or not isinstance(canonical_id, str) or not canonical_id.strip():
            continue
        normalized = normalize_text(alias)
        normalized_groups.setdefault(normalized, []).append((alias, canonical_id))
        if canonical_id in alias_owner_count:
            alias_owner_count[canonical_id] += 1
        if canonical_id not in exercise_ids:
            aliases_pointing_to_missing_exercise_ids.append(f"{alias}->{canonical_id}")
        if normalized in normalized_map and normalized_map[normalized] != canonical_id:
            duplicate_aliases.append(normalized)
        normalized_map[normalized] = canonical_id

    duplicate_aliases.extend([normalized for normalized, entries in normalized_groups.items() if len(entries) > 1])
    exercises_without_aliases = sorted([exercise_id for exercise_id, count in alias_owner_count.items() if count == 0])

    return AliasAuditResult(
        total_canonical_ids=len(exercise_ids),
        total_aliases=len(raw_aliases),
        duplicate_aliases=sorted(set(duplicate_aliases)),
        aliases_pointing_to_missing_exercise_ids=sorted(set(aliases_pointing_to_missing_exercise_ids)),
        exercises_without_aliases=exercises_without_aliases,
        lines=lines,
    )


def status_for_aliases(result: AliasAuditResult) -> str:
    if result.aliases_pointing_to_missing_exercise_ids or result.duplicate_aliases:
        return "FAIL"
    if result.exercises_without_aliases:
        return "WARN"
    return "OK"
