from __future__ import annotations

from dataclasses import dataclass
from pathlib import Path
from typing import Any

from .coverage import calculate_coverage, load_coverage_rules, load_body_highlighter_bridge, load_muscle_taxonomy, normalize_muscle_id
from .loader import load_catalog_directory_yaml, load_catalog_yaml
from .resolver import build_exercise_index, normalize_text
from .teaching import parse_lesson_document


@dataclass
class AuditLine:
    level: str
    message: str


@dataclass
class AuditReport:
    lines: list[AuditLine]

    @property
    def ok_count(self) -> int:
        return sum(1 for line in self.lines if line.level == "OK")

    @property
    def warn_count(self) -> int:
        return sum(1 for line in self.lines if line.level == "WARN")

    @property
    def fail_count(self) -> int:
        return sum(1 for line in self.lines if line.level == "FAIL")

    @property
    def has_failures(self) -> bool:
        return self.fail_count > 0


@dataclass
class ExerciseAuditResult:
    total_exercises: int
    exercises_by_category: dict[str, int]
    missing_required_fields: list[str]
    duplicate_ids: list[str]
    unknown_categories: list[str]
    empty_primary_muscles: list[str]
    empty_coaching_notes: list[str]
    empty_common_errors: list[str]
    lines: list[AuditLine]
    samples: list[str]


@dataclass
class AliasAuditResult:
    total_canonical_ids: int
    total_aliases: int
    duplicate_aliases: list[str]
    aliases_pointing_to_missing_exercise_ids: list[str]
    exercises_without_aliases: list[str]
    lines: list[AuditLine]


@dataclass
class CoverageAuditResult:
    unmapped_muscles: list[str]
    unmapped_body_regions: list[str]
    unknown_role_weights: list[str]
    exercises_with_unmapped_primary_muscles: list[str]
    exercises_with_unmapped_secondary_muscles: list[str]
    exercises_with_unmapped_stabilizers: list[str]
    zero_coverage_exercises: list[str]
    lines: list[AuditLine]


@dataclass
class AnatomyAuditResult:
    total_lessons: int
    lessons_by_region: dict[str, int]
    missing_required_fields: list[str]
    lessons_for_missing_exercise_ids: list[str]
    exercises_without_lessons: list[str]
    lessons_without_quiz: list[str]
    lessons_without_common_errors: list[str]
    lessons_with_unmapped_body_regions: list[str]
    lines: list[AuditLine]


@dataclass
class AuditBundle:
    exercises: ExerciseAuditResult
    aliases: AliasAuditResult
    coverage: CoverageAuditResult
    anatomy: AnatomyAuditResult
    overall_status: str
    report_path: Path


def run_anatomy_audit() -> AuditReport:
    lines: list[AuditLine] = []
    exercise_index = {record.exercise_id: record for record in build_exercise_index()}
    exercise_ids = set(exercise_index)
    muscles_taxonomy = load_muscle_taxonomy()
    body_regions = load_body_regions()
    lessons = load_all_anatomy_lessons()
    legacy_lesson_ids = load_legacy_lesson_ids()
    seen_lesson_ids: set[str] = set()
    missing_mvp: list[str] = []

    mvp_exercises = [
        "041", # incline_dumbbell_press
        "103", # cable_fly
        "301", # lateral_raise
        "501", # overhead_triceps_extension
        "502", # cable_pushdown
        "045", # close_grip_bench_press
        "021", # chin_up
        "043", # chest_supported_row
        "042", # barbell_row
        "303", # rear_delt_fly
        "302", # face_pull
        "506", # hammer_curl
        "080", # deadlift
        "081", # romanian_deadlift
        "082", # hip_thrust
        "402", # leg_curl
        "701", # calf_raise
        "064", # lunge
        "104", # dips_chest
        "020", # pull_up
        "061", # front_squat
    ]

    for lesson in lessons:
        exercise_id = str(lesson.get("exercise_id", "")).strip()
        if not exercise_id:
            lines.append(fail("lesson missing exercise_id"))
            continue
        if exercise_id in seen_lesson_ids:
            lines.append(fail(f"duplicate lesson exercise_id: {exercise_id}"))
            continue
        seen_lesson_ids.add(exercise_id)

        lesson_lines = validate_lesson(lesson, exercise_ids, body_regions, muscles_taxonomy)
        lines.extend(lesson_lines)

    present_ids = seen_lesson_ids | legacy_lesson_ids
    for exercise_id in mvp_exercises:
        if exercise_id not in present_ids:
            missing_mvp.append(exercise_id)

    if missing_mvp:
        lines.append(warn("missing MVP lessons: " + ", ".join(missing_mvp)))
    else:
        lines.append(ok("all MVP exercises have lessons"))

    return AuditReport(lines)


def audit_exercises() -> ExerciseAuditResult:
    exercise_index = build_exercise_index()
    seen_ids: set[str] = set()
    exercises_by_category: dict[str, int] = {}
    missing_required_fields: list[str] = []
    duplicate_ids: list[str] = []
    unknown_categories: list[str] = []
    empty_primary_muscles: list[str] = []
    empty_coaching_notes: list[str] = []
    empty_common_errors: list[str] = []
    lines: list[AuditLine] = []
    samples: list[str] = []

    known_categories = {
        "chest", "back", "shoulders", "arms", "legs", "core", 
        "quadriceps", "hamstrings", "triceps-surae", "none",
        "bulk", "expert", "inbox"
    }
    
    # Required for Expert Exercises
    required_fields = [
        "display_name",
        "german",
        "movement_pattern",
        "equipment",
        "primary_muscles",
        "coaching_notes",
        "common_errors",
    ]

    for record in exercise_index:
        exercise_id = record.exercise_id
        if exercise_id in seen_ids:
            duplicate_ids.append(exercise_id)
        seen_ids.add(exercise_id)
        
        # Count by source category/region
        categories = record.categories if record.categories else ["none"]
        for cat in categories:
            exercises_by_category[cat] = exercises_by_category.get(cat, 0) + 1
            if cat not in known_categories and not cat.isdigit():
                unknown_categories.append(f"{exercise_id}:{cat}")

        if record.source == "expert":
            if not record.primary_muscles:
                empty_primary_muscles.append(exercise_id)
            if not record.coaching_notes:
                empty_coaching_notes.append(exercise_id)
            if not record.common_errors:
                empty_common_errors.append(exercise_id)
            
            for field in required_fields:
                value = getattr(record, field)
                if value in (None, "", []):
                    missing_required_fields.append(f"{exercise_id}.{field}")
        
        samples.append(exercise_id)
        lines.append(ok(f"{exercise_id} exercise valid"))

    return ExerciseAuditResult(
        total_exercises=len(seen_ids),
        exercises_by_category=dict(sorted(exercises_by_category.items())),
        missing_required_fields=sorted(set(missing_required_fields)),
        duplicate_ids=sorted(set(duplicate_ids)),
        unknown_categories=sorted(set(unknown_categories)),
        empty_primary_muscles=sorted(set(empty_primary_muscles)),
        empty_coaching_notes=sorted(set(empty_coaching_notes)),
        empty_common_errors=sorted(set(empty_common_errors)),
        lines=lines,
        samples=samples[:5],
    )


def run_coverage_audit() -> AuditReport:
    lines: list[AuditLine] = []
    exercise_index = build_exercise_index()
    taxonomy = load_muscle_taxonomy()
    bridge = load_body_highlighter_bridge()
    rules = load_coverage_rules()

    role_weights = rules.get("role_weights", {})
    if not isinstance(role_weights, dict):
        role_weights = {}
    for role in ["primary", "secondary", "stabilizer", "minor"]:
        if role in role_weights and isinstance(role_weights[role], (int, float)):
            lines.append(ok(f"role weight present: {role}"))
        else:
            lines.append(fail(f"missing role weight: {role}"))

    effort_factors = rules.get("effort_factors_by_rpe", {})
    if not isinstance(effort_factors, dict):
        effort_factors = {}
    for rpe in range(6, 11):
        factor = effort_factors.get(rpe, effort_factors.get(str(rpe)))
        if isinstance(factor, (int, float)):
            lines.append(ok(f"effort factor present: {rpe}"))
        else:
            lines.append(fail(f"missing effort factor for rpe {rpe}"))

    body_regions = load_body_regions()

    zero_coverage: list[str] = []
    for exercise in exercise_index:
        exercise_failures: list[str] = []
        for muscle in (exercise.primary_muscles or []):
            norm_id = normalize_muscle_id(muscle)
            if norm_id not in taxonomy:
                exercise_failures.append(f"{exercise.exercise_id} unknown primary muscle: {muscle}")
            elif not muscle_regions(norm_id, taxonomy, bridge):
                exercise_failures.append(f"{exercise.exercise_id} primary muscle has no body region: {muscle}")
        for muscle in (exercise.secondary_muscles or []):
            norm_id = normalize_muscle_id(muscle)
            if norm_id not in taxonomy:
                exercise_failures.append(f"{exercise.exercise_id} unknown secondary muscle: {muscle}")
            elif not muscle_regions(norm_id, taxonomy, bridge):
                exercise_failures.append(f"{exercise.exercise_id} secondary muscle has no body region: {muscle}")
        for muscle in (exercise.stabilizers or []):
            norm_id = normalize_muscle_id(muscle)
            if norm_id not in taxonomy:
                exercise_failures.append(f"{exercise.exercise_id} unknown stabilizer: {muscle}")
            elif not muscle_regions(norm_id, taxonomy, bridge):
                exercise_failures.append(f"{exercise.exercise_id} stabilizer has no body region: {muscle}")

        try:
            sample = calculate_coverage(exercise.exercise_id, 1, 8)
        except Exception as exc:
            lines.append(fail(f"{exercise.exercise_id} sample coverage crashed: {exc}"))
            continue

        if not any(sample["muscle_scores"].values()):
            zero_coverage.append(exercise.exercise_id)

        for muscle_id, score in sample["muscle_scores"].items():
            # sample[muscle_scores] is already normalized keys from calculate_coverage
            if score > 0 and muscle_id in taxonomy and not muscle_regions(muscle_id, taxonomy, bridge):
                exercise_failures.append(f"{exercise.exercise_id} muscle has no body region: {muscle_id}")

        if body_regions is not None:
            for region in sample["body_region_scores"].keys():
                if region not in body_regions:
                    exercise_failures.append(f"{exercise.exercise_id} unknown body region: {region}")

        if exercise_failures:
            for message in exercise_failures:
                lines.append(fail(message))
        else:
            lines.append(ok(f"{exercise.exercise_id} coverage valid"))

    if zero_coverage:
        lines.append(warn("zero coverage exercises: " + ", ".join(sorted(zero_coverage))))
    else:
        lines.append(ok("no zero coverage exercises"))

    return AuditReport(lines)


def audit_coverage() -> CoverageAuditResult:
    exercise_index = build_exercise_index()
    taxonomy = load_muscle_taxonomy()
    bridge = load_body_highlighter_bridge()
    rules = load_coverage_rules()
    body_regions = load_body_regions()

    unknown_role_weights: list[str] = []
    role_weights = rules.get("role_weights", {})
    if not isinstance(role_weights, dict):
        role_weights = {}
    for role in ["primary", "secondary", "stabilizer", "minor"]:
        if role not in role_weights or not isinstance(role_weights[role], (int, float)):
            unknown_role_weights.append(role)

    unmapped_muscles = sorted(
        {
            muscle
            for exercise in exercise_index
            for muscle in (exercise.primary_muscles or []) + (exercise.secondary_muscles or []) + (exercise.stabilizers or [])
            if normalize_muscle_id(muscle) not in taxonomy
        }
    )

    exercises_with_unmapped_primary_muscles: list[str] = []
    exercises_with_unmapped_secondary_muscles: list[str] = []
    exercises_with_unmapped_stabilizers: list[str] = []
    zero_coverage_exercises: list[str] = []
    lines: list[AuditLine] = []

    for exercise in exercise_index:
        if any(normalize_muscle_id(muscle) not in taxonomy for muscle in (exercise.primary_muscles or [])):
            exercises_with_unmapped_primary_muscles.append(exercise.exercise_id)
        if any(normalize_muscle_id(muscle) not in taxonomy for muscle in (exercise.secondary_muscles or [])):
            exercises_with_unmapped_secondary_muscles.append(exercise.exercise_id)
        if any(normalize_muscle_id(muscle) not in taxonomy for muscle in (exercise.stabilizers or [])):
            exercises_with_unmapped_stabilizers.append(exercise.exercise_id)
        try:
            sample = calculate_coverage(exercise.exercise_id, 1, 8)
        except Exception as exc:
            lines.append(fail(f"{exercise.exercise_id} sample coverage crashed: {exc}"))
            continue
        if not any(sample["muscle_scores"].values()):
            zero_coverage_exercises.append(exercise.exercise_id)
        if body_regions is not None:
            for region in sample["body_region_scores"].keys():
                if region not in body_regions:
                    lines.append(fail(f"{exercise.exercise_id} unknown body region: {region}"))
        lines.append(ok(f"{exercise.exercise_id} coverage valid"))

    unmapped_body_regions = sorted(
        {
            region
            for exercise in exercise_index
            for muscle in (exercise.primary_muscles or []) + (exercise.secondary_muscles or []) + (exercise.stabilizers or [])
            for region in muscle_regions(normalize_muscle_id(muscle), taxonomy, bridge)
            if body_regions is not None and region not in body_regions
        }
    )

    return CoverageAuditResult(
        unmapped_muscles=unmapped_muscles,
        unmapped_body_regions=unmapped_body_regions,
        unknown_role_weights=unknown_role_weights,
        exercises_with_unmapped_primary_muscles=sorted(set(exercises_with_unmapped_primary_muscles)),
        exercises_with_unmapped_secondary_muscles=sorted(set(exercises_with_unmapped_secondary_muscles)),
        exercises_with_unmapped_stabilizers=sorted(set(exercises_with_unmapped_stabilizers)),
        zero_coverage_exercises=sorted(set(zero_coverage_exercises)),
        lines=lines,
    )


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
    exercises_without_aliases: list[str] = []
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


def run_all_audits() -> int:
    from .rich_utils import print_audit_bundle
    bundle = audit_all()
    print_audit_bundle(
        exercises_status=status_for_exercises(bundle.exercises),
        aliases_status=status_for_aliases(bundle.aliases),
        coverage_status=status_for_coverage(bundle.coverage),
        anatomy_status=status_for_anatomy(bundle.anatomy),
        overall_status=bundle.overall_status,
    )
    write_audit_report(bundle)
    return 1 if bundle.overall_status == "FAIL" else 0


def audit_all() -> AuditBundle:
    exercises = audit_exercises()
    aliases = audit_aliases()
    coverage = audit_coverage()
    anatomy = audit_anatomy()

    if any([
        exercises.missing_required_fields,
        exercises.duplicate_ids,
        exercises.unknown_categories,
        aliases.aliases_pointing_to_missing_exercise_ids,
        aliases.duplicate_aliases,
        coverage.unknown_role_weights,
        coverage.exercises_with_unmapped_primary_muscles,
        coverage.exercises_with_unmapped_secondary_muscles,
        coverage.exercises_with_unmapped_stabilizers,
        anatomy.missing_required_fields,
        anatomy.lessons_for_missing_exercise_ids,
        anatomy.lessons_with_unmapped_body_regions,
    ]):
        overall_status = "FAIL"
    elif any([
        exercises.empty_primary_muscles,
        exercises.empty_coaching_notes,
        exercises.empty_common_errors,
        aliases.exercises_without_aliases,
        coverage.unmapped_muscles,
        coverage.unmapped_body_regions,
        coverage.zero_coverage_exercises,
        anatomy.exercises_without_lessons,
        anatomy.lessons_without_quiz,
        anatomy.lessons_without_common_errors,
    ]):
        overall_status = "NEEDS_REVIEW"
    else:
        overall_status = "USABLE"

    return AuditBundle(
        exercises=exercises,
        aliases=aliases,
        coverage=coverage,
        anatomy=anatomy,
        overall_status=overall_status,
        report_path=write_audit_report_path(),
    )


def validate_lesson(
    lesson: dict[str, Any],
    exercise_ids: set[str],
    body_regions: set[str] | None,
    muscles_taxonomy: dict[str, Any],
) -> list[AuditLine]:
    lines: list[AuditLine] = []
    exercise_id = str(lesson.get("exercise_id", "")).strip()
    if not exercise_id:
        lines.append(fail("lesson missing exercise_id"))
        return lines
    if exercise_id not in exercise_ids:
        lines.append(fail(f"{exercise_id} references unknown exercise"))
        return lines

    required_text_fields = [
        ("title", "title"),
        ("region", "region"),
    ]
    for key, label in required_text_fields:
        if not text_value(lesson.get(key)):
            lines.append(fail(f"{exercise_id} missing {label}"))

    learning_goal = lesson.get("learning_goal")
    if not isinstance(learning_goal, dict) or not text_value(learning_goal.get("short")):
        lines.append(fail(f"{exercise_id} missing learning_goal.short"))

    movement_pattern = lesson.get("movement_pattern")
    if isinstance(movement_pattern, dict):
        if not text_value(movement_pattern.get("primary")):
            lines.append(fail(f"{exercise_id} missing movement_pattern.primary"))
    elif not text_value(movement_pattern):
        lines.append(fail(f"{exercise_id} missing movement_pattern.primary"))

    joint_actions = lesson.get("joint_actions")
    if not joint_actions:
        lines.append(fail(f"{exercise_id} missing joint_actions"))
    elif is_empty_structure(joint_actions):
        lines.append(fail(f"{exercise_id} has empty joint_actions"))

    muscle_roles = lesson.get("muscle_roles")
    if not isinstance(muscle_roles, dict):
        lines.append(fail(f"{exercise_id} missing muscle_roles"))
        muscle_roles = {}
    else:
        prime = as_list(muscle_roles.get("prime_movers"))
        if not prime:
            lines.append(fail(f"{exercise_id} missing muscle_roles.prime_movers"))
        else:
            for muscle in prime:
                if normalize_muscle_id(muscle) not in muscles_taxonomy:
                    lines.append(warn(f"{exercise_id} prime mover not in taxonomy: {muscle}"))
        for field in ["synergists", "stabilizers"]:
            items = as_list(muscle_roles.get(field))
            if not items:
                lines.append(warn(f"{exercise_id} has empty muscle_roles.{field}"))
            else:
                for muscle in items:
                    if normalize_muscle_id(muscle) not in muscles_taxonomy:
                        lines.append(warn(f"{exercise_id} {field[:-1]} not in taxonomy: {muscle}"))

    if body_regions is not None:
        regions = lesson.get("body_highlighter_regions")
        if not regions:
            lines.append(fail(f"{exercise_id} missing body_highlighter_regions"))
        else:
            for region in extract_region_values(regions):
                if region not in body_regions:
                    lines.append(fail(f"{exercise_id} references unknown body region: {region}"))

    trainer = lesson.get("trainer_explanation")
    if not isinstance(trainer, dict) or not text_value(trainer.get("simple")):
        lines.append(fail(f"{exercise_id} missing trainer_explanation.simple"))
    if not isinstance(trainer, dict) or not text_value(trainer.get("client_friendly")):
        lines.append(fail(f"{exercise_id} missing trainer_explanation.client_friendly"))

    feel_cues = as_list(lesson.get("feel_cues"))
    if len(feel_cues) < 2:
        lines.append(warn(f"{exercise_id} has only {len(feel_cues)} feel cue(s)"))

    coaching_cues = as_list(lesson.get("coaching_cues"))
    if len(coaching_cues) < 3:
        lines.append(warn(f"{exercise_id} has only {len(coaching_cues)} coaching cue(s)"))

    common_errors = lesson.get("common_errors")
    if not isinstance(common_errors, list) or not common_errors:
        lines.append(warn(f"{exercise_id} has no common errors"))
    else:
        for error in common_errors:
            if not isinstance(error, dict):
                lines.append(fail(f"{exercise_id} has malformed common error entry"))
                continue
            for key in ["error", "anatomical_reason", "correction", "coaching_cue"]:
                if not text_value(error.get(key)):
                    lines.append(fail(f"{exercise_id} common error missing {key}"))

    quiz = lesson.get("quiz")
    if not quiz:
        lines.append(warn(f"{exercise_id} missing quiz"))

    if not any(line.level == "FAIL" for line in lines):
        lines.append(ok(f"{exercise_id} lesson valid"))
    return lines


def load_all_anatomy_lessons() -> list[dict[str, Any]]:
    lessons: list[dict[str, Any]] = []
    for path, document in load_catalog_directory_yaml("anatomy_teaching"):
        if path.name in {"chest_lessons.yml", "joint_actions.yml", "coaching_language.yml"}:
            continue
        lessons.extend(parse_lesson_document(document))
    return lessons


def load_legacy_lesson_ids() -> set[str]:
    try:
        document = load_catalog_yaml("anatomy_teaching/chest_lessons.yml")
    except FileNotFoundError:
        return set()
    return {
        str(lesson.get("exercise_id", "")).strip()
        for lesson in parse_lesson_document(document)
        if str(lesson.get("exercise_id", "")).strip()
    }


def load_aliases_document() -> dict[str, Any] | None:
    try:
        aliases = load_catalog_yaml("maps/aliases.yml")
    except FileNotFoundError:
        return None
    if not isinstance(aliases, dict):
        return None
    return aliases


def audit_anatomy() -> AnatomyAuditResult:
    lessons = load_all_anatomy_lessons()
    exercise_ids = {record.exercise_id for record in build_exercise_index()}
    body_regions = load_body_regions()
    missing_required_fields: list[str] = []
    lessons_for_missing_exercise_ids: list[str] = []
    lessons_without_quiz: list[str] = []
    lessons_without_common_errors: list[str] = []
    lessons_with_unmapped_body_regions: list[str] = []
    lessons_by_region: dict[str, int] = {}
    lines: list[AuditLine] = []
    seen: set[str] = set()
    missing_exercise_ids: set[str] = set()

    for lesson in lessons:
        exercise_id = str(lesson.get("exercise_id", "")).strip()
        region = str(lesson.get("region", "")).strip()
        if region:
            lessons_by_region[region] = lessons_by_region.get(region, 0) + 1
        if exercise_id in seen:
            missing_required_fields.append(f"duplicate:{exercise_id}")
        seen.add(exercise_id)
        if not exercise_id or exercise_id not in exercise_ids:
            missing_exercise_ids.add(exercise_id or "<missing>")
            lessons_for_missing_exercise_ids.append(exercise_id or "<missing>")
        for key in ["exercise_id", "title", "region", "learning_goal", "movement_pattern", "joint_actions", "muscle_roles", "body_highlighter_regions", "trainer_explanation", "feel_cues", "coaching_cues", "common_errors", "variations_teach", "quiz"]:
            if key not in lesson or lesson.get(key) in (None, "", []):
                missing_required_fields.append(f"{exercise_id}.{key}")
        if not lesson.get("quiz"):
            lessons_without_quiz.append(exercise_id)
        if not lesson.get("common_errors"):
            lessons_without_common_errors.append(exercise_id)
        regions = extract_region_values(lesson.get("body_highlighter_regions"))
        if body_regions is not None and any(region not in body_regions for region in regions):
            lessons_with_unmapped_body_regions.append(exercise_id)
        lines.append(ok(f"{exercise_id} anatomy valid"))

    exercises_without_lessons = sorted(exercise_ids - {lesson.get("exercise_id") for lesson in lessons if lesson.get("exercise_id")})
    return AnatomyAuditResult(
        total_lessons=len(lessons),
        lessons_by_region=dict(sorted(lessons_by_region.items())),
        missing_required_fields=sorted(set(missing_required_fields)),
        lessons_for_missing_exercise_ids=sorted(set(lessons_for_missing_exercise_ids)),
        exercises_without_lessons=exercises_without_lessons,
        lessons_without_quiz=sorted(set([lesson for lesson in lessons_without_quiz if lesson])),
        lessons_without_common_errors=sorted(set([lesson for lesson in lessons_without_common_errors if lesson])),
        lessons_with_unmapped_body_regions=sorted(set(lessons_with_unmapped_body_regions)),
        lines=lines,
    )


def status_for_exercises(result: ExerciseAuditResult) -> str:
    if result.missing_required_fields or result.duplicate_ids or result.unknown_categories:
        return "FAIL"
    if result.empty_primary_muscles or result.empty_coaching_notes or result.empty_common_errors:
        return "WARN"
    return "OK"


def status_for_aliases(result: AliasAuditResult) -> str:
    if result.aliases_pointing_to_missing_exercise_ids or result.duplicate_aliases:
        return "FAIL"
    if result.exercises_without_aliases:
        return "WARN"
    return "OK"


def status_for_coverage(result: CoverageAuditResult) -> str:
    if result.unknown_role_weights or result.exercises_with_unmapped_primary_muscles or result.exercises_with_unmapped_secondary_muscles or result.exercises_with_unmapped_stabilizers:
        return "FAIL"
    if result.unmapped_muscles or result.unmapped_body_regions or result.zero_coverage_exercises:
        return "WARN"
    return "OK"


def status_for_anatomy(result: AnatomyAuditResult) -> str:
    if result.missing_required_fields or result.lessons_for_missing_exercise_ids or result.lessons_with_unmapped_body_regions:
        return "FAIL"
    if result.exercises_without_lessons or result.lessons_without_quiz or result.lessons_without_common_errors:
        return "WARN"
    return "OK"


def write_audit_report_path() -> Path:
    return Path("/tmp/Obsidian/Vitaltrainer/Fitness-Agent/audit_report.md")


def write_audit_report(bundle: AuditBundle) -> Path:
    path = write_audit_report_path()
    path.parent.mkdir(parents=True, exist_ok=True)
    path.write_text(render_audit_report(bundle), encoding="utf-8")
    return path


def render_audit_report(bundle: AuditBundle) -> str:
    sections = [
        "# Fitness Agent Audit Report",
        "",
        "## Summary",
        f"- Exercises: {status_for_exercises(bundle.exercises)}",
        f"- Aliases: {status_for_aliases(bundle.aliases)}",
        f"- Coverage: {status_for_coverage(bundle.coverage)}",
        f"- Anatomy: {status_for_anatomy(bundle.anatomy)}",
        f"- Overall: {bundle.overall_status}",
        "",
        "## Exercise Audit",
        f"- Total exercises: {bundle.exercises.total_exercises}",
        f"- By category: {bundle.exercises.exercises_by_category}",
        f"- Missing required fields: {bundle.exercises.missing_required_fields}",
        f"- Duplicate IDs: {bundle.exercises.duplicate_ids}",
        f"- Unknown categories: {bundle.exercises.unknown_categories}",
        f"- Empty primary muscles: {bundle.exercises.empty_primary_muscles}",
        f"- Empty coaching notes: {bundle.exercises.empty_coaching_notes}",
        f"- Empty common errors: {bundle.exercises.empty_common_errors}",
        "",
        "## Alias Audit",
        f"- Total canonical IDs: {bundle.aliases.total_canonical_ids}",
        f"- Total aliases: {bundle.aliases.total_aliases}",
        f"- Duplicate aliases: {bundle.aliases.duplicate_aliases}",
        f"- Aliases to missing exercise IDs: {bundle.aliases.aliases_pointing_to_missing_exercise_ids}",
        f"- Exercises without aliases: {bundle.aliases.exercises_without_aliases}",
        "",
        "## Coverage Audit",
        f"- Unmapped muscles: {bundle.coverage.unmapped_muscles}",
        f"- Unmapped body regions: {bundle.coverage.unmapped_body_regions}",
        f"- Unknown role weights: {bundle.coverage.unknown_role_weights}",
        f"- Exercises with unmapped primary muscles: {bundle.coverage.exercises_with_unmapped_primary_muscles}",
        f"- Exercises with unmapped secondary muscles: {bundle.coverage.exercises_with_unmapped_secondary_muscles}",
        f"- Exercises with unmapped stabilizers: {bundle.coverage.exercises_with_unmapped_stabilizers}",
        f"- Zero coverage exercises: {bundle.coverage.zero_coverage_exercises}",
        "",
        "## Anatomy Audit",
        f"- Total lessons: {bundle.anatomy.total_lessons}",
        f"- Lessons by region: {bundle.anatomy.lessons_by_region}",
        f"- Missing required fields: {bundle.anatomy.missing_required_fields}",
        f"- Lessons for missing exercise IDs: {bundle.anatomy.lessons_for_missing_exercise_ids}",
        f"- Exercises without lessons: {bundle.anatomy.exercises_without_lessons}",
        f"- Lessons without quiz: {bundle.anatomy.lessons_without_quiz}",
        f"- Lessons without common errors: {bundle.anatomy.lessons_without_common_errors}",
        f"- Lessons with unmapped body regions: {bundle.anatomy.lessons_with_unmapped_body_regions}",
        "",
        "## Warnings",
        _format_lines("WARN", bundle.exercises.lines + bundle.aliases.lines + bundle.coverage.lines + bundle.anatomy.lines),
        "",
        "## Failures",
        _format_lines("FAIL", bundle.exercises.lines + bundle.aliases.lines + bundle.coverage.lines + bundle.anatomy.lines),
        "",
        "## Recommended Fixes",
        "- Fix any failing audit entries first.",
        "- Add aliases for exercises without aliases if you want easier resolution coverage.",
        "- Add missing anatomy or coverage mappings only after confirming the canonical exercise entry.",
        "",
        "## Next Step",
        "- Review any WARN or FAIL lines and decide whether a fix pass is needed.",
    ]
    return "\n".join(section for section in sections if section is not None).strip() + "\n"


def _format_lines(level: str, lines: list[AuditLine]) -> str:
    items = [f"- {line.message}" for line in lines if line.level == level]
    return "\n".join(items) if items else "- None"


def load_exercises_documents() -> list[tuple[str, dict[str, Any]]]:
    documents: list[tuple[str, dict[str, Any]]] = []
    for path, document in load_catalog_directory_yaml("exercises"):
        if isinstance(document, dict):
            documents.append((path.name, document))
    return documents


def load_muscle_taxonomy() -> dict[str, dict[str, Any]]:
    document = load_catalog_yaml("muscles/muscle_index.yml")
    if not isinstance(document, dict):
        return {}
    muscles = document.get("muscles", {})
    if not isinstance(muscles, dict):
        return {}
    return {str(k): v for k, v in muscles.items() if isinstance(v, dict)}


def load_body_regions() -> set[str] | None:
    """Gibt None zurück wenn body_highlighter_bridge deaktiviert ist."""
    document = load_catalog_yaml("muscles/body_highlighter_bridge.yml")
    if isinstance(document, dict):
        bridge_section = document.get("bridge", {})
        if isinstance(bridge_section, dict) and not bridge_section.get("enabled", False):
            return None
    bridge = load_body_highlighter_bridge()
    regions: set[str] = set()
    for value in bridge.values():
        if isinstance(value, list):
            for item in value:
                if isinstance(item, str) and item.strip():
                    regions.add(item.strip())
    if isinstance(document, dict):
        bridge_section = document.get("bridge", {})
        if isinstance(bridge_section, dict):
            for item in bridge_section.get("body_regions", []):
                if isinstance(item, str) and item.strip():
                    regions.add(item.strip())
    return regions


def count_aliases_per_exercise(raw_aliases: dict[Any, Any], exercise_ids: set[str]) -> dict[str, int]:
    counts = {exercise_id: 0 for exercise_id in exercise_ids}
    for alias, canonical_id in raw_aliases.items():
        if isinstance(alias, str) and isinstance(canonical_id, str) and canonical_id in counts:
            counts[canonical_id] += 1
    return counts


def extract_region_values(value: Any) -> list[str]:
    regions: list[str] = []
    if isinstance(value, list):
        for item in value:
            if isinstance(item, str) and item.strip():
                regions.append(item.strip())
        return regions
    if isinstance(value, dict):
        for item in value.values():
            regions.extend(extract_region_values(item))
    elif isinstance(value, str) and value.strip():
        regions.append(value.strip())
    return regions


def text_value(value: Any) -> bool:
    return isinstance(value, str) and bool(value.strip())


def as_list(value: Any) -> list[str]:
    if not isinstance(value, list):
        return []
    return [str(item).strip() for item in value if str(item).strip()]


def is_empty_structure(value: Any) -> bool:
    if isinstance(value, dict):
        return all(is_empty_structure(item) for item in value.values())
    if isinstance(value, list):
        return all(is_empty_structure(item) for item in value)
    return not bool(str(value).strip())


def muscle_regions(muscle_id: str, taxonomy: dict[str, dict[str, Any]], bridge: dict[str, list[str]]) -> list[str]:
    if muscle_id in bridge:
        return bridge[muscle_id]
    muscle = taxonomy.get(muscle_id)
    if not muscle:
        return []
    region = muscle.get("body_region")
    if isinstance(region, str) and region.strip():
        return [region.strip()]
    return []


def ok(message: str) -> AuditLine:
    return AuditLine("OK", message)


def warn(message: str) -> AuditLine:
    return AuditLine("WARN", message)


def fail(message: str) -> AuditLine:
    return AuditLine("FAIL", message)
