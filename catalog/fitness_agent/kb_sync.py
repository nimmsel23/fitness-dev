"""
KB Sync — catalog/kb/ → Firestore fitness/kb/

Optimiert mit WriteBatches für große Datenmengen.
"""
from __future__ import annotations

import os
from pathlib import Path
from typing import Any

import firebase_admin
from firebase_admin import credentials, firestore
from loguru import logger
from tqdm import tqdm
from halo import Halo

from .rich_utils import console
from .loader import catalog_path, load_catalog_directory_yaml, load_catalog_yaml
from .yaml_utils import load_yaml

CRED_PATH = Path.home() / ".env" / "firebase-fitness.json"
PROJECT_ID_ENV = "FIREBASE_FITNESS_PROJECT"


def _init_firebase() -> Any:
    if firebase_admin._apps:
        return firestore.client()
    cred_file = Path(os.environ.get("GOOGLE_APPLICATION_CREDENTIALS", str(CRED_PATH)))
    if not cred_file.exists():
        raise FileNotFoundError(
            f"Service Account nicht gefunden: {cred_file}\n"
            f"Alternativ: GOOGLE_APPLICATION_CREDENTIALS setzen"
        )
    
    spinner = Halo(text="Connecting to Firebase...", spinner="dots").start()
    try:
        cred = credentials.Certificate(str(cred_file))
        project = os.environ.get(PROJECT_ID_ENV, "fitness-aos")
        firebase_admin.initialize_app(cred, {"projectId": project})
        spinner.succeed(f"Firebase initialisiert: {project}")
        return firestore.client()
    except Exception as e:
        spinner.fail(f"Firebase initialization failed: {e}")
        raise


def _to_fs(v: Any) -> Any:
    if isinstance(v, dict):
        return {str(k): _to_fs(vv) for k, vv in v.items()}
    if isinstance(v, list):
        return [_to_fs(i) for i in v]
    if isinstance(v, (str, int, float, bool)) or v is None:
        return v
    return str(v)


def _flatten(doc: dict[str, Any]) -> dict[str, Any]:
    return {k: _to_fs(v) for k, v in doc.items()}


def sync_exercises(db_client: Any, dry_run: bool = False) -> dict[str, int]:
    counts = {"ok": 0, "skip": 0, "error": 0}
    col = db_client.collection("fitness").document("kb").collection("exercises")

    # 1. Aggregation phase: Collect and merge all exercises by ID
    all_exercises: dict[str, dict[str, Any]] = {}

    for path, doc in load_catalog_directory_yaml("exercises"):
        if not isinstance(doc, dict):
            continue
        for exercise in doc.get("exercises", []):
            ex_id = exercise.get("exercise_id") or exercise.get("id")
            if not ex_id:
                counts["skip"] += 1
                continue
            
            if ex_id not in all_exercises:
                all_exercises[ex_id] = exercise
            else:
                # Merge logic: Prefer non-empty and longer lists/strings
                # This ensures detail files (richer) complement index entries
                for key, val in exercise.items():
                    old_val = all_exercises[ex_id].get(key)
                    if not old_val:
                        all_exercises[ex_id][key] = val
                    elif isinstance(val, list) and isinstance(old_val, list):
                        if len(val) > len(old_val):
                            all_exercises[ex_id][key] = val
                    elif isinstance(val, str) and isinstance(old_val, str):
                        if len(val) > len(old_val):
                            all_exercises[ex_id][key] = val
                    elif isinstance(val, dict) and isinstance(old_val, dict):
                        # Shallow merge for dicts (like wger_muscle_ids)
                        all_exercises[ex_id][key].update(val)

    # 2. Sync phase: Write merged records to Firestore
    batch = db_client.batch()
    batch_count = 0

    for ex_id, exercise in tqdm(all_exercises.items(), desc="Exercises", unit="ex"):
        payload = _flatten(exercise)
        if dry_run:
            counts["ok"] += 1
            continue

        try:
            batch.set(col.document(ex_id), payload)
            batch_count += 1
            counts["ok"] += 1
            
            if batch_count >= 400:
                batch.commit()
                batch = db_client.batch()
                batch_count = 0
        except Exception as exc:
            logger.error(f"exercises/{ex_id}: {exc}")
            counts["error"] += 1

    if batch_count > 0:
        batch.commit()

    return counts


def sync_anatomy(db_client: Any, dry_run: bool = False) -> dict[str, int]:
    counts = {"ok": 0, "skip": 0, "error": 0}
    col = db_client.collection("fitness").document("kb").collection("anatomy")
    
    batch = db_client.batch()
    batch_count = 0

    all_lessons = []
    for path, doc in load_catalog_directory_yaml("anatomy_teaching"):
        if not isinstance(doc, dict):
            continue
        if "exercise_id" in doc:
            all_lessons.append(doc)
        elif "lessons" in doc:
            all_lessons.extend(doc["lessons"])

    for lesson in tqdm(all_lessons, desc="Anatomy", unit="lesson"):
        ex_id = lesson.get("exercise_id")
        if not ex_id:
            counts["skip"] += 1
            continue
            
        if dry_run:
            counts["ok"] += 1
            continue
            
        try:
            batch.set(col.document(ex_id), lesson)
            batch_count += 1
            counts["ok"] += 1
            
            if batch_count >= 400:
                batch.commit()
                batch = db_client.batch()
                batch_count = 0
        except Exception as exc:
            logger.error(f"anatomy/{ex_id}: {exc}")
            counts["error"] += 1

    if batch_count > 0:
        batch.commit()

    return counts


def sync_muscles(db_client: Any, dry_run: bool = False) -> dict[str, int]:
    counts = {"ok": 0, "skip": 0, "error": 0}
    col = db_client.collection("fitness").document("kb").collection("muscles")

    try:
        taxonomy = load_catalog_yaml("muscles/muscles.yml")
        if not isinstance(taxonomy, dict) or "muscles" not in taxonomy:
            log_err("muscles.yml has invalid structure")
            counts["error"] += 1
            return counts

        muscles = taxonomy["muscles"]
        batch = db_client.batch()
        batch_count = 0
        
        for muscle_id, data in tqdm(muscles.items(), desc="Muscles", unit="muscle"):
            if not isinstance(data, dict):
                continue
            
            payload = _flatten(data)
            payload["muscle_id"] = muscle_id
            
            if dry_run:
                counts["ok"] += 1
                continue
            
            batch.set(col.document(muscle_id), payload)
            batch_count += 1
            counts["ok"] += 1
            
            if batch_count >= 400:
                batch.commit()
                batch = db_client.batch()
                batch_count = 0
                
        if batch_count > 0:
            batch.commit()
            
    except Exception as exc:
        logger.error(f"Failed to sync muscles: {exc}")
        counts["error"] += 1

    return counts


def run_kb_sync(dry_run: bool = False) -> None:
    from .rich_utils import setup_logging
    setup_logging()
    db_client = _init_firebase()

    logger.info("=== KB Sync: exercises ===")
    ex = sync_exercises(db_client, dry_run=dry_run)
    logger.info(f"exercises: {ex}")

    logger.info("=== KB Sync: anatomy ===")
    an = sync_anatomy(db_client, dry_run=dry_run)
    logger.info(f"anatomy: {an}")

    logger.info("=== KB Sync: muscles ===")
    mu = sync_muscles(db_client, dry_run=dry_run)
    logger.info(f"muscles: {mu}")

    total_ok = ex["ok"] + an["ok"] + mu["ok"]
    total_err = ex["error"] + an["error"] + mu["error"]
    status = "OK" if total_err == 0 else "ERRORS"
    logger.info(f"=== Fertig: {total_ok} geschrieben, {total_err} Fehler — {status} ===")
