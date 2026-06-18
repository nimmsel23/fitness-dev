from __future__ import annotations

import json
import os
import time
from pathlib import Path
import urllib.request
import urllib.parse
from typing import Any

import yaml
from loguru import logger
from watchdog.observers import Observer
from watchdog.events import FileSystemEventHandler, FileCreatedEvent

from .paths import DATA_DIR, runtime_root
from .kb_sync import run_kb_sync
from .resolver import resolve_query, find_by_id, build_exercise_index
from .rich_utils import setup_logging
from .gemini import load_gemini_key, call_gemini


# --- Processing Logic ---

def process_inbox_file(file_path: Path, api_key: str | None):
    try:
        data = json.loads(file_path.read_text())
        name = data.get("name")
        if not name:
            file_path.unlink()
            return

        safe_name = name.lower().replace(" ", "_")
        target_file = DATA_DIR / "exercises" / f"inbox_{safe_name}.yml"

        if target_file.exists():
            file_path.unlink()
            return

        resolution = resolve_query(name)
        if resolution.matched and resolution.confidence == "high":
            logger.info(f"Exercise already in catalog ({resolution.canonical_id}), skipping: {name}")
            file_path.unlink()
            return

        logger.info(f"Enriching NEW exercise: {name}")
        
        enriched_data = None
        if api_key:
            enriched_data = call_gemini(name, safe_name, api_key)
        
        if enriched_data:
            save_inbox_draft(target_file, enriched_data, f"AI generated base entry for {name}")
            file_path.unlink()
    except Exception as e:
        logger.error(f"Failed to process {file_path}: {e}")

def process_inbox_file_virtual(ex_id: str, display_name: str, api_key: str, force: bool = False):
    safe_name = ex_id.lower().replace(" ", "_")
    target_file = DATA_DIR / "exercises" / f"inbox_{safe_name}.yml"

    if target_file.exists() and not force:
        return

    records = build_exercise_index()
    record = find_by_id(ex_id, records)
    existing_data = None
    if record:
        existing_data = {
            "exercise_id": record.exercise_id,
            "display_name": record.display_name,
            "category": record.category if hasattr(record, "category") else None,
            "primary_muscles": record.primary_muscles,
            "equipment": record.equipment,
            "wger_id": record.wger_muscle_ids.get("wger_id") if record.wger_muscle_ids else None
        }

    logger.info(f"Proactive Expert-Enrichment for: {display_name} (using Wiki context)")
    enriched_data = call_gemini(display_name, safe_name, api_key, existing_data=existing_data)
    
    if enriched_data:
        save_inbox_draft(target_file, enriched_data, f"Proactively generated expert draft for: {display_name}")

def save_inbox_draft(target_file: Path, data: dict, description: str):
    if "stabilizers" not in data: data["stabilizers"] = []
    if "variations" not in data: data["variations"] = []
    
    wrapper = {
        "name": target_file.stem,
        "description": description,
        "exercises": [data]
    }
    
    with target_file.open("w", encoding="utf-8") as f:
        yaml.safe_dump(wrapper, f, allow_unicode=True, sort_keys=False)
    
    logger.success(f"Generated expert draft: {target_file.name}")
    try:
        run_kb_sync()
    except Exception: pass

# --- Watchdog Handler ---

class InboxHandler(FileSystemEventHandler):
    def __init__(self, api_key: str | None):
        self.api_key = api_key

    def on_created(self, event):
        if not event.is_directory and event.src_path.endswith(".json"):
            path = Path(event.src_path)
            if "inbox" in path.parts:
                process_inbox_file(path, self.api_key)

# --- Main Watcher ---

from .ingestor import ingest_all_sessions, get_top_unreviewed_exercises
from .auditor import write_biomechanical_report

def run_watcher():
    setup_logging()
    logger.info("Starting fitness-agent watcher daemon...")
    api_key = load_gemini_key()
    if not api_key:
        logger.warning("GEMINI_API_KEY not found. Automated enrichment disabled.")
        
    users_dir = runtime_root() / "users"
    users_dir.mkdir(parents=True, exist_ok=True)
    
    # Initial scan for existing inbox files
    logger.info("Performing initial scan for pending inbox files...")
    for json_file in users_dir.glob("**/inbox/*.json"):
        process_inbox_file(json_file, api_key)

    observer = Observer()
    handler = InboxHandler(api_key)
    observer.schedule(handler, str(users_dir), recursive=True)
    observer.start()
    
    last_ingest = 0
    last_audit = 0
    
    try:
        while True:
            now = time.time()
            
            # Periodically ingest sessions and proactively refine popular exercises
            if now - last_ingest > 3600: # Every hour
                logger.info("Running session ingestion and proactive refinement check...")
                try:
                    ingested = ingest_all_sessions()
                    if ingested:
                        logger.info(f"Ingested {ingested} new training entries.")
                    
                    if api_key:
                        top_unreviewed = get_top_unreviewed_exercises(limit=3)
                        for ex_id, count in top_unreviewed:
                            logger.info(f"Proactively refining popular unreviewed exercise: {ex_id} (used {count} times)")
                            res = resolve_query(ex_id)
                            if res.matched:
                                process_inbox_file_virtual(res.canonical_id, res.display_name, api_key)
                    
                    last_ingest = now
                except Exception as e:
                    logger.error(f"Periodic ingest/refinement failed: {e}")

            # Periodically run Biomechanical Auditor
            if now - last_audit > 7200: # Every 2 hours
                logger.info("Running biomechanical consistency audit...")
                try:
                    report_path = write_biomechanical_report()
                    logger.info(f"Biomechanical audit complete. Report: {report_path}")
                    last_audit = now
                except Exception as e:
                    logger.error(f"Biomechanical audit failed: {e}")

            time.sleep(10)
    except KeyboardInterrupt:
        observer.stop()
    observer.join()
