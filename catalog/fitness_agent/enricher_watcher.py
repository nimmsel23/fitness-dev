#!/usr/bin/env python3
"""
AI Enricher Watcher
Watches the local inbox directories of all clients for new exercise entries.
When a new entry is detected, it uses the Gemini API to generate:
- Anatomy data (primary/secondary muscles, joint actions)
- Coaching notes
- Client-friendly explanations
The result is saved to the local catalog.
"""

from pathlib import Path
import os
import sys
import json
import time
import urllib.request
import urllib.parse
from typing import Optional

import yaml
from loguru import logger
from watchdog.observers import Observer
from watchdog.events import FileSystemEventHandler

from .rich_utils import setup_logging

# --- Configuration ---
FITNESS_DIR = Path.home() / ".aos" / "fitness"
USERS_DIR = FITNESS_DIR / "users"

# Resolve catalog paths relative to this file's location in fitness_agent/
PACKAGE_DIR = Path(__file__).resolve().parent
CATALOG_DIR = PACKAGE_DIR.parent
CATALOG_EXERCISES = CATALOG_DIR / "kb" / "exercises"
MUSCLES_YML = CATALOG_DIR / "kb" / "muscles" / "muscles.yml"

def load_muscle_taxonomy():
    if not MUSCLES_YML.exists():
        logger.warning(f"Muscle taxonomy not found at {MUSCLES_YML}")
        return []
    try:
        with MUSCLES_YML.open("r", encoding="utf-8") as f:
            data = yaml.safe_load(f)
            muscles = data.get("muscles", {})
            return sorted(muscles.keys())
    except Exception as e:
        logger.error(f"Failed to load muscle taxonomy: {e}")
        return []

VALID_MUSCLES = load_muscle_taxonomy()

def load_env_file():
    env_path = Path.home() / ".env" / "fitness.env"
    if env_path.exists():
        for line in env_path.read_text().splitlines():
            if "=" in line and not line.startswith("#"):
                key, val = line.split("=", 1)
                if key.strip() == "GEMINI_API_KEY" and not os.environ.get("GEMINI_API_KEY"):
                    os.environ["GEMINI_API_KEY"] = val.strip()
                    logger.info(f"Loaded GEMINI_API_KEY from {env_path}")

load_env_file()
GEMINI_API_KEY = os.environ.get("GEMINI_API_KEY")

PROMPT_TEMPLATE = """
You are an expert fitness coach and biomechanics expert.
A user has logged a new exercise: "{exercise_name}"

Return a JSON object with the following structure exactly. Do not include markdown formatting like ```json.
It must match our base exercise schema. Use German for display_name and coaching_notes.

CRITICAL: You MUST only use the following muscle IDs for primary_muscles, secondary_muscles, and stabilizers:
{muscle_list}

{{
  "exercise_id": "{safe_name}",
  "id": "{safe_name}",
  "name": "{exercise_name}",
  "display_name": "German Translation or Native Name",
  "german": "German Name",
  "category": "chest|back|shoulders|arms|core|legs|cardio",
  "type": "compound|isolation",
  "movement_pattern": "e.g. horizontal_press, vertical_pull",
  "equipment": ["dumbbell", "barbell", "machine", "bodyweight", "cable"],
  "primary_muscles": ["muscle_id"],
  "secondary_muscles": ["muscle_id"],
  "stabilizers": ["muscle_id"],
  "coaching_notes": [
    "Wichtiger Ausführungshinweis 1",
    "Wichtiger Ausführungshinweis 2"
  ],
  "common_errors": [
    "Häufiger Fehler 1"
  ],
  "tags": ["tag1", "tag2"],
  "aliases": ["alias1", "alias2"]
}}
"""

def call_gemini(exercise_name: str, safe_name: str) -> Optional[dict]:
    if not GEMINI_API_KEY:
        logger.error("GEMINI_API_KEY environment variable is missing. Cannot enrich.")
        return None

    muscle_list = ", ".join(VALID_MUSCLES)
    prompt = PROMPT_TEMPLATE.format(exercise_name=exercise_name, safe_name=safe_name, muscle_list=muscle_list)
    url = f"https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key={GEMINI_API_KEY}"
    
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
        logger.error(f"Gemini API call failed for {exercise_name}: {e}")
        return None

def process_inbox_file(file_path: Path):
    try:
        if not file_path.exists(): return
        data = json.loads(file_path.read_text())
        name = data.get("name")
        if not name:
            logger.warning(f"Inbox file {file_path.name} missing 'name'. Deleting.")
            file_path.unlink()
            return

        safe_name = name.lower().replace(" ", "_")
        target_file = CATALOG_EXERCISES / f"inbox_{safe_name}.yml"

        if target_file.exists():
            logger.info(f"Catalog entry for '{name}' already exists. Removing from inbox.")
            file_path.unlink()
            return

        logger.info(f"Enriching new exercise: {name}")
        enriched_data = call_gemini(name, safe_name)
        
        if enriched_data:
            CATALOG_EXERCISES.mkdir(parents=True, exist_ok=True)
            
            # Ensure the internal name doesn't have the inbox prefix either
            enriched_data["name"] = name 
            enriched_data["exercise_id"] = safe_name
            
            wrapper = {
                "name": safe_name,
                "description": f"AI generated base entry for {name}",
                "exercises": [enriched_data]
            }
            
            with target_file.open("w", encoding="utf-8") as f:
                yaml.dump(wrapper, f, allow_unicode=True, sort_keys=False)
            
            logger.success(f"Successfully generated base exercise entry for {name}")
            file_path.unlink()
            
            # Automatically trigger KB Sync to Firestore
            from .kb_sync import run_kb_sync
            run_kb_sync()
            logger.info("Auto-sync to Firestore triggered.")
        else:
            logger.warning(f"Failed to enrich {name}. Keeping in inbox.")
            
    except Exception as e:
        logger.error(f"Failed to process {file_path}: {e}")

class InboxHandler(FileSystemEventHandler):
    def on_created(self, event):
        if not event.is_directory and event.src_path.endswith(".json"):
            path = Path(event.src_path)
            if "inbox" in path.parts:
                # Small delay to ensure file is fully written
                time.sleep(0.5)
                process_inbox_file(path)

def run_enricher_watch():
    """Watch for new exercises in client inbox directories."""
    setup_logging()
    
    logger.info("Starting AI Enricher Watcher (Watchdog-powered)...")
    if not GEMINI_API_KEY:
        logger.warning("GEMINI_API_KEY is not set. Enrichment will not work.")
    
    if not USERS_DIR.exists():
        USERS_DIR.mkdir(parents=True, exist_ok=True)

    # Initial scan
    for json_file in USERS_DIR.glob("**/inbox/*.json"):
        process_inbox_file(json_file)

    observer = Observer()
    handler = InboxHandler()
    observer.schedule(handler, str(USERS_DIR), recursive=True)
    observer.start()
    
    logger.info(f"Listening for changes in {USERS_DIR}...")
    try:
        while True:
            time.sleep(1)
    except KeyboardInterrupt:
        observer.stop()
    observer.join()

