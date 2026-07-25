"""
KB Sync — catalog/kb/ → Firestore fitness/kb/

Orchestriert den Sync aller Katalog-Daten nach Firestore.
Firestore-Infrastruktur: catalog.firestore_client
"""
from __future__ import annotations

import json
import subprocess
from pathlib import Path
from typing import Any

from loguru import logger
from tqdm import tqdm

from firestore.kb import get_db, flatten, compute_hash, fetch_hashes, batch_write
from fitness.catalog.core.loader import catalog_path, load_catalog_directory_yaml, load_catalog_yaml


def sync_exercises(db: Any, dry_run: bool = False) -> dict[str, int]:
    col = db.collection("fitness").document("kb").collection("exercises")

    # Alle exercises aggregieren + mergen (Expert gewinnt bei Konflikt)
    all_exercises: dict[str, dict[str, Any]] = {}
    for _path, doc in load_catalog_directory_yaml("exercises"):
        if not isinstance(doc, dict):
            continue
        for exercise in doc.get("exercises", []):
            ex_id = str(exercise.get("exercise_id") or exercise.get("id") or "")
            if not ex_id:
                continue
            if ex_id not in all_exercises:
                all_exercises[ex_id] = exercise
            else:
                _merge_exercise(all_exercises[ex_id], exercise)

    remote_hashes = fetch_hashes(col)
    counts = batch_write(db, col, tqdm(all_exercises.items(), desc="Exercises", unit="ex"),
                         dry_run=dry_run, use_hash=True, remote_hashes=remote_hashes)

    # Verwaiste Docs löschen
    if not dry_run:
        orphans = {doc.id for doc in col.stream()} - set(all_exercises)
        if orphans:
            b = db.batch()
            for oid in orphans:
                b.delete(col.document(oid))
            b.commit()
            counts["deleted"] = len(orphans)
            logger.info(f"{len(orphans)} verwaiste Exercises gelöscht")

    return counts


def _merge_exercise(base: dict, incoming: dict) -> None:
    for key, val in incoming.items():
        old = base.get(key)
        if not old:
            base[key] = val
        elif isinstance(val, list) and isinstance(old, list):
            def has_prefix(l):
                return any(isinstance(x, str) and x[:1].isdigit() for x in l)
            if len(val) > len(old) or (len(val) == len(old) and has_prefix(val) and not has_prefix(old)):
                base[key] = val
        elif isinstance(val, str) and isinstance(old, str) and len(val) > len(old):
            base[key] = val
        elif isinstance(val, dict) and isinstance(old, dict):
            old.update(val)


def push_changed_exercises(
    since_ref: str = "HEAD~1",
    until_ref: str = "HEAD",
    dry_run: bool = False,
    extra_paths: list[str] | None = None,
) -> dict[str, int]:
    """Nur git-diff geänderte Exercises pushen — quota-schonend."""
    # fitness/catalog/api/ → fitness/catalog/ → fitness/ → fitness-dev/ (Repo-Root)
    repo_root = Path(__file__).resolve().parents[3]
    proc = subprocess.run(
        ["git", "diff", "--name-only", since_ref, until_ref, "--", "fitness/catalog/kb/exercises/"],
        capture_output=True, text=True, cwd=repo_root, check=True,
    )
    changed_files = {Path(p).name for p in proc.stdout.strip().splitlines() if p.endswith(".yml")}
    for extra in (extra_paths or []):
        changed_files.add(Path(extra).name)

    counts = {"changed_files": len(changed_files), "ok": 0, "skip": 0, "error": 0}
    if not changed_files:
        logger.info("Keine Exercise-YAMLs im Range geändert.")
        return counts

    logger.info(f"Geänderte Files: {sorted(changed_files)}")

    targets: dict[str, dict[str, Any]] = {}
    for path, doc in load_catalog_directory_yaml("exercises"):
        if path.name not in changed_files or not isinstance(doc, dict):
            continue
        for exercise in doc.get("exercises", []):
            ex_id = str(exercise.get("exercise_id") or exercise.get("id") or "")
            if ex_id:
                targets[ex_id] = exercise

    logger.info(f"Zu pushende Exercises: {len(targets)}")
    if dry_run:
        for ex_id in sorted(targets):
            logger.info(f"DRY {ex_id}")
        counts["ok"] = len(targets)
        return counts

    db = get_db()
    col = db.collection("fitness").document("kb").collection("exercises")
    result = batch_write(db, col, targets.items(), dry_run=False, use_hash=True)
    counts.update(result)
    return counts


def sync_anatomy(db: Any, dry_run: bool = False) -> dict[str, int]:
    col = db.collection("fitness").document("kb").collection("anatomy")

    def _records():
        for _path, doc in load_catalog_directory_yaml("anatomy_teaching"):
            if not isinstance(doc, dict):
                continue
            lessons = doc.get("lessons") or ([doc] if "exercise_id" in doc else [])
            for lesson in lessons:
                ex_id = str(lesson.get("exercise_id") or "")
                if ex_id:
                    yield ex_id, lesson

    return batch_write(db, col, tqdm(_records(), desc="Anatomy", unit="lesson"),
                       dry_run=dry_run, use_hash=True)


def sync_muscles(db: Any, dry_run: bool = False) -> dict[str, int]:
    col = db.collection("fitness").document("kb").collection("muscles")

    try:
        taxonomy = load_catalog_yaml("muscle_index.yml")
        muscles = taxonomy.get("muscles", {}) if isinstance(taxonomy, dict) else {}
    except Exception as exc:
        logger.error(f"muscle_index.yml: {exc}")
        return {"ok": 0, "unchanged": 0, "error": 1}

    def _records():
        for muscle_id, data in muscles.items():
            if isinstance(data, dict):
                yield muscle_id, {**data, "muscle_id": muscle_id}

    return batch_write(db, col, tqdm(_records(), desc="Muscles", unit="muscle"),
                       dry_run=dry_run, use_hash=True)


def sync_yuhonas(db: Any, dry_run: bool = False) -> dict[str, int]:
    col = db.collection("fitness").document("kb").collection("exercises")
    yuhonas_dir = catalog_path("../yuhonas")
    if not yuhonas_dir.exists():
        logger.warning("catalog/yuhonas nicht gefunden, übersprungen")
        return {"ok": 0, "unchanged": 0, "error": 0}

    try:
        muscle_index = load_catalog_yaml("muscle_index.yml")
        string_aliases = muscle_index.get("string_aliases", {}) if isinstance(muscle_index, dict) else {}
    except Exception:
        string_aliases = {}

    def _resolve(names: list) -> list:
        return [string_aliases.get(m, m) for m in names]

    def _records():
        for json_file in sorted(yuhonas_dir.glob("*.json")):
            try:
                raw = json.loads(json_file.read_text())
            except Exception:
                continue
            ex_id = f"yuhonas_{raw.get('id', json_file.stem)}"
            yield ex_id, {
                "exercise_id": ex_id,
                "id": ex_id,
                "display_name": raw.get("name", ""),
                "source": "yuhonas",
                "tags": ["yuhonas", "unreviewed"],
                "category": raw.get("category", ""),
                "equipment": [raw.get("equipment")] if raw.get("equipment") else [],
                "primary_muscles": _resolve(raw.get("primaryMuscles", [])),
                "secondary_muscles": _resolve(raw.get("secondaryMuscles", [])),
                "instructions": raw.get("instructions", []),
                "images": raw.get("images", []),
            }

    remote_hashes = fetch_hashes(col)
    return batch_write(db, col, tqdm(_records(), desc="Yuhonas", unit="ex"),
                       dry_run=dry_run, use_hash=True, remote_hashes=remote_hashes)


def run_kb_sync(dry_run: bool = False) -> None:
    db = get_db()
    results = {
        "exercises": sync_exercises(db, dry_run),
        "anatomy":   sync_anatomy(db, dry_run),
        "muscles":   sync_muscles(db, dry_run),
        "yuhonas":   sync_yuhonas(db, dry_run),
    }
    total_ok  = sum(r.get("ok", 0) for r in results.values())
    total_err = sum(r.get("error", 0) for r in results.values())
    logger.info(f"=== Fertig: {total_ok} geschrieben, {total_err} Fehler ===")
    for k, v in results.items():
        logger.info(f"  {k}: {v}")
