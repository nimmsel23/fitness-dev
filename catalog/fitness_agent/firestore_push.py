"""
KB Sync — catalog/kb/ → Firestore fitness/kb/

Optimiert mit WriteBatches und Hash-basierter Änderungserkennung.
"""
from __future__ import annotations

import os
import hashlib
import json
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


def _compute_hash(data: dict[str, Any]) -> str:
    """Erzeugt einen stabilen MD5-Hash des Inhalts zur Änderungserkennung."""
    encoded = json.dumps(data, sort_keys=True, ensure_ascii=False).encode('utf-8')
    return hashlib.md5(encoded).hexdigest()


def sync_exercises(db_client: Any, dry_run: bool = False) -> dict[str, int]:
    counts = {"ok": 0, "skip": 0, "error": 0, "deleted": 0, "unchanged": 0}
    col = db_client.collection("fitness").document("kb").collection("exercises")

    # 1. Aggregation phase: Collect and merge all exercises by ID
    all_exercises: dict[str, dict[str, Any]] = {}

    for path, doc in load_catalog_directory_yaml("exercises"):
        if not isinstance(doc, dict):
            continue
        for exercise in doc.get("exercises", []):
            ex_id = exercise.get("exercise_id") or exercise.get("id")
            if ex_id is None:
                counts["skip"] += 1
                continue
            
            ex_id = str(ex_id)
            if ex_id not in all_exercises:
                all_exercises[ex_id] = exercise
            else:
                # Merge logic: Prefer non-empty and longer lists/strings
                for key, val in exercise.items():
                    old_val = all_exercises[ex_id].get(key)
                    if not old_val:
                        all_exercises[ex_id][key] = val
                    elif isinstance(val, list) and isinstance(old_val, list):
                        def has_prefix(l): return any(isinstance(x, str) and x[:1].isdigit() for x in l)
                        if len(val) > len(old_val):
                            all_exercises[ex_id][key] = val
                        elif len(val) == len(old_val) and has_prefix(val) and not has_prefix(old_val):
                            all_exercises[ex_id][key] = val
                    elif isinstance(val, str) and isinstance(old_val, str):
                        if len(val) > len(old_val):
                            all_exercises[ex_id][key] = val
                    elif isinstance(val, dict) and isinstance(old_val, dict):
                        all_exercises[ex_id][key].update(val)

    # 2. Fetch current hashes from Firestore to detect changes
    logger.info("Fetching remote state for change detection...")
    remote_hashes = {}
    for doc in col.select(['_hash']).stream():
        h = doc.to_dict().get('_hash')
        if h:
            remote_hashes[doc.id] = h

    # 3. Sync phase: Write merged records to Firestore
    batch = db_client.batch()
    batch_count = 0

    for ex_id, exercise in tqdm(all_exercises.items(), desc="Exercises", unit="ex"):
        payload = _flatten(exercise)
        new_hash = _compute_hash(payload)
        
        if remote_hashes.get(ex_id) == new_hash:
            counts["unchanged"] += 1
            continue

        payload['_hash'] = new_hash
        
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

    # 3. Cleanup phase: Delete orphaned documents
    if not dry_run:
        logger.info("Cleaning up orphans in exercises...")
        remote_ids = {doc.id for doc in col.stream()}
        orphans = remote_ids - set(all_exercises.keys())
        if orphans:
            logger.info(f"Deleting {len(orphans)} orphaned exercises...")
            batch = db_client.batch()
            for oid in orphans:
                batch.delete(col.document(oid))
                counts["deleted"] += 1
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
        if ex_id is None:
            counts["skip"] += 1
            continue
        
        ex_id = str(ex_id)
            
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
        taxonomy = load_catalog_yaml("muscles/muscle_index.yml")
        if not isinstance(taxonomy, dict) or "muscles" not in taxonomy:
            logger.error("muscle_index.yml has invalid structure")
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


def sync_yuhonas(db_client: Any, dry_run: bool = False) -> dict[str, int]:
    counts = {"ok": 0, "skip": 0, "error": 0, "unchanged": 0}
    col = db_client.collection("fitness").document("kb").collection("exercises")

    yuhonas_dir = catalog_path("../yuhonas")
    if not yuhonas_dir.exists():
        logger.warning("catalog/yuhonas not found, skipping")
        return counts

    # Load string_aliases from muscle_index.yml
    try:
        muscle_index = load_catalog_yaml("muscles/muscle_index.yml")
        string_aliases = muscle_index.get("string_aliases", {})
    except Exception:
        string_aliases = {}

    remote_hashes = {}
    for doc in col.select(['_hash']).stream():
        h = doc.to_dict().get('_hash')
        if h:
            remote_hashes[doc.id] = h

    batch = db_client.batch()
    batch_count = 0

    for json_file in sorted(yuhonas_dir.glob("*.json")):
        try:
            raw = json.loads(json_file.read_text())
        except Exception:
            counts["skip"] += 1
            continue

        ex_id = f"yuhonas_{raw.get('id', json_file.stem)}"

        def resolve_muscles(names: list) -> list:
            return [string_aliases.get(m, m) for m in names]

        payload = _flatten({
            "exercise_id": ex_id,
            "id": ex_id,
            "display_name": raw.get("name", ""),
            "source": "yuhonas",
            "tags": ["yuhonas", "unreviewed"],
            "category": raw.get("category", ""),
            "equipment": [raw.get("equipment", "")] if raw.get("equipment") else [],
            "primary_muscles": resolve_muscles(raw.get("primaryMuscles", [])),
            "secondary_muscles": resolve_muscles(raw.get("secondaryMuscles", [])),
            "instructions": raw.get("instructions", []),
            "images": raw.get("images", []),
        })

        new_hash = _compute_hash(payload)
        if remote_hashes.get(ex_id) == new_hash:
            counts["unchanged"] += 1
            continue

        payload["_hash"] = new_hash

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
            logger.error(f"yuhonas/{ex_id}: {exc}")
            counts["error"] += 1

    if batch_count > 0:
        batch.commit()

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

    logger.info("=== KB Sync: yuhonas ===")
    yu = sync_yuhonas(db_client, dry_run=dry_run)
    logger.info(f"yuhonas: {yu}")

    total_ok = ex["ok"] + an["ok"] + mu["ok"] + yu["ok"]
    total_err = ex["error"] + an["error"] + mu["error"] + yu["error"]
    status = "OK" if total_err == 0 else "ERRORS"
    logger.info(f"=== Fertig: {total_ok} geschrieben, {total_err} Fehler — {status} ===")
