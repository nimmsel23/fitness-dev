"""
KB Sync — catalog/kb/ → Firestore fitness/kb/

Liest alle YAMLs aus catalog/kb/exercises/ und catalog/kb/anatomy_teaching/
und schreibt sie nach Firestore:
  fitness/kb/exercises/{exercise_id}
  fitness/kb/anatomy/{exercise_id}

Credentials: ~/.env/firebase-fitness.json (Service Account JSON)
Oder: GOOGLE_APPLICATION_CREDENTIALS env var
"""
from __future__ import annotations

import os
from pathlib import Path
from typing import Any

import firebase_admin
from firebase_admin import credentials, firestore
from loguru import logger

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
    cred = credentials.Certificate(str(cred_file))
    project = os.environ.get(PROJECT_ID_ENV, "fitness-aos")
    firebase_admin.initialize_app(cred, {"projectId": project})
    logger.info(f"Firebase initialisiert: {project}")
    return firestore.client()


def _to_fs(v: Any) -> Any:
    """Rekursiv alle Werte in Firestore-kompatible Typen konvertieren."""
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

    for path, doc in load_catalog_directory_yaml("exercises"):
        if not isinstance(doc, dict):
            continue
        for exercise in doc.get("exercises", []):
            ex_id = exercise.get("exercise_id") or exercise.get("id")
            if not ex_id:
                counts["skip"] += 1
                continue
            payload = _flatten(exercise)
            if dry_run:
                logger.info(f"[dry] exercises/{ex_id}")
                counts["ok"] += 1
                continue
            try:
                col.document(ex_id).set(payload)
                logger.info(f"exercises/{ex_id}")
                counts["ok"] += 1
            except Exception as exc:
                logger.error(f"exercises/{ex_id}: {exc}")
                counts["error"] += 1

    return counts


def sync_anatomy(db_client: Any, dry_run: bool = False) -> dict[str, int]:
    counts = {"ok": 0, "skip": 0, "error": 0}
    col = db_client.collection("fitness").document("kb").collection("anatomy")

    for path, doc in load_catalog_directory_yaml("anatomy_teaching"):
        if not isinstance(doc, dict):
            continue

        # Einzelne Lesson-Datei
        if "exercise_id" in doc:
            lessons = [doc]
        # Multi-Lesson-Datei (supplementary_mvp_lessons.yml etc.)
        elif "lessons" in doc:
            lessons = doc["lessons"]
        else:
            lessons = []

        for lesson in lessons:
            ex_id = lesson.get("exercise_id")
            if not ex_id:
                counts["skip"] += 1
                continue
            if dry_run:
                logger.info(f"[dry] anatomy/{ex_id}")
                counts["ok"] += 1
                continue
            try:
                col.document(ex_id).set(lesson)
                logger.info(f"anatomy/{ex_id}")
                counts["ok"] += 1
            except Exception as exc:
                logger.error(f"anatomy/{ex_id}: {exc}")
                counts["error"] += 1

    return counts


def run_kb_sync(dry_run: bool = False) -> None:
    db_client = _init_firebase()

    logger.info("=== KB Sync: exercises ===")
    ex = sync_exercises(db_client, dry_run=dry_run)
    logger.info(f"exercises: {ex}")

    logger.info("=== KB Sync: anatomy ===")
    an = sync_anatomy(db_client, dry_run=dry_run)
    logger.info(f"anatomy: {an}")

    total_ok = ex["ok"] + an["ok"]
    total_err = ex["error"] + an["error"]
    status = "OK" if total_err == 0 else "ERRORS"
    logger.info(f"=== Fertig: {total_ok} geschrieben, {total_err} Fehler — {status} ===")
