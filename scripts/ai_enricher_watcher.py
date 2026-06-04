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

import json
import os
import sys
import time
from pathlib import Path
import urllib.request
import urllib.parse
import yaml
from loguru import logger

FITNESS_DIR = Path.home() / ".aos" / "fitness"
USERS_DIR = FITNESS_DIR / "users"

# Adjust this path based on where the script is run from
PROJECT_ROOT = Path(__file__).parent.parent
CATALOG_DIR = PROJECT_ROOT / "catalog"
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

def call_gemini(exercise_name: str, safe_name: str) -> dict:
    if not GEMINI_API_KEY:
        logger.error("GEMINI_API_KEY environment variable is missing. Cannot enrich.")
        return None

    muscle_list = ", ".join(VALID_MUSCLES)
    prompt = PROMPT_TEMPLATE.format(exercise_name=exercise_name, safe_name=safe_name, muscle_list=muscle_list)
    url = f"https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key={GEMINI_API_KEY}"
    
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
        data = json.loads(file_path.read_text())
        name = data.get("name")
        if not name:
            logger.warning(f"Inbox file {file_path.name} missing 'name'. Deleting.")
            file_path.unlink()
            return

        safe_name = name.lower().replace(" ", "_")
        target_file = CATALOG_EXERCISES / f"{safe_name}.yml"

        if target_file.exists():
            logger.info(f"Catalog entry for '{name}' already exists. Removing from inbox.")
            file_path.unlink()
            return

        logger.info(f"Enriching new exercise: {name}")
        enriched_data = call_gemini(name, safe_name)
        
        if enriched_data:
            import yaml
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
            try:
                import subprocess
                subprocess.run([sys.executable, "-c", "import sys; sys.path.insert(0, 'catalog'); from fitness_agent.kb_sync import run_kb_sync; run_kb_sync()"], check=False)
                logger.info("Auto-sync to Firestore triggered.")
            except Exception as se:
                logger.error(f"Auto-sync failed: {se}")
        else:
            logger.warning(f"Failed to enrich {name}. Keeping in inbox.")
            
    except Exception as e:
        logger.error(f"Failed to process {file_path}: {e}")

def run_watcher():
    logger.info(f"Starting AI Enricher Watcher...")
    if not GEMINI_API_KEY:
        logger.warning("GEMINI_API_KEY is not set. Enrichment will not work.")
        
    while True:
        if USERS_DIR.exists():
            for uid_dir in USERS_DIR.iterdir():
                inbox_dir = uid_dir / "inbox"
                if inbox_dir.exists():
                    for json_file in inbox_dir.glob("*.json"):
                        process_inbox_file(json_file)
        time.sleep(10) # Poll every 10 seconds

if __name__ == "__main__":
    run_watcher()
