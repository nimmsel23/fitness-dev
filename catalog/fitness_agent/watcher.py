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
from .coverage import load_muscle_taxonomy

# --- Gemini API Logic ---

def load_gemini_key() -> str | None:
    key = os.environ.get("GEMINI_API_KEY")
    if key:
        return key
    
    env_path = Path.home() / ".env" / "fitness.env"
    if env_path.exists():
        for line in env_path.read_text().splitlines():
            if "=" in line and not line.startswith("#"):
                k, v = line.split("=", 1)
                if k.strip() == "GEMINI_API_KEY":
                    return v.strip()
    return None


PROMPT_TEMPLATE_NEW = """
You are an expert fitness coach and biomechanics expert.
A user has logged a new, unknown exercise: "{exercise_name}"

Return a JSON object with the following structure exactly. Do not include markdown formatting like ```json.
Use German for display_name and coaching_notes.

CRITICAL: You MUST only use the following muscle IDs for primary_muscles, secondary_muscles, and stabilizers:
{muscle_list}

{{
  "exercise_id": "{safe_name}",
  "id": "{safe_name}",
  "name": "{exercise_name}",
  "display_name": "German Name",
  "german": "German Name",
  "category": "chest|back|shoulders|arms|core|legs|cardio",
  "type": "compound|isolation",
  "movement_pattern": "e.g. horizontal_press, vertical_pull",
  "equipment": ["dumbbell", "barbell", "machine", "bodyweight", "cable"],
  "primary_muscles": ["muscle_id"],
  "secondary_muscles": ["muscle_id"],
  "stabilizers": ["muscle_id"],
  "coaching_notes": ["Hinweis 1", "Hinweis 2"],
  "common_errors": ["Fehler 1"],
  "tags": ["tag1"],
  "aliases": []
}}
"""

PROMPT_TEMPLATE_ENRICH = """
You are an expert fitness coach and biomechanics expert.
I have a basic exercise entry from a bulk import that needs professional "Expert Tier" enrichment.

CRITICAL: You MUST only use the following muscle IDs for primary_muscles, secondary_muscles, and stabilizers:
{muscle_list}

Existing Data (Wiki Layer):
{existing_json}

Your task:
1. Keep the exercise_id and wger_id.
2. Verify and refine the category and muscles.
3. Generate HIGH-QUALITY coaching_notes and common_errors in GERMAN.
4. Ensure the biomechanical movement_pattern is correct.

Return a JSON object with the full enriched structure. Do not include markdown formatting like ```json.
"""

def call_gemini(exercise_name: str, safe_name: str, api_key: str, existing_data: dict | None = None) -> dict | None:
    import re
    taxonomy = load_muscle_taxonomy()
    muscle_list = ", ".join(
        k for k in sorted(taxonomy.keys())
        if not re.match(r'^\d00_', k)
    )
    
    if existing_data:
        prompt = PROMPT_TEMPLATE_ENRICH.format(
            existing_json=json.dumps(existing_data, indent=2),
            muscle_list=muscle_list
        )
    else:
        prompt = PROMPT_TEMPLATE_NEW.format(
            exercise_name=exercise_name, 
            safe_name=safe_name,
            muscle_list=muscle_list
        )
    
    url = f"https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key={api_key}"
    
    payload = {
        "contents": [{"parts": [{"text": prompt}]}]
    }
    
    req = urllib.request.Request(
        url, 
        data=json.dumps(payload).encode("utf-8"), 
        headers={"Content-Type": "application/json"}
    )
    
    try:
        with urllib.request.urlopen(req) as response:
            result = json.loads(response.read().decode("utf-8"))
            text_response = result["candidates"][0]["content"]["parts"][0]["text"]
            text_response = text_response.replace("```json", "").replace("```", "").strip()
            return json.loads(text_response)
    except Exception as e:
        logger.error(f"Gemini API call failed: {e}")
        return None

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
