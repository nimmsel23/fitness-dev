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
from loguru import logger

FITNESS_DIR = Path.home() / ".aos" / "fitness"
USERS_DIR = FITNESS_DIR / "users"

# Adjust this path based on where the script is run from
PROJECT_ROOT = Path(__file__).parent.parent
CATALOG_EXERCISES = PROJECT_ROOT / "catalog" / "kb" / "exercises"
CATALOG_TEACHING = PROJECT_ROOT / "catalog" / "kb" / "anatomy_teaching"

GEMINI_API_KEY = os.environ.get("GEMINI_API_KEY")

PROMPT_TEMPLATE = """
You are an expert fitness coach and biomechanics expert.
Analyze the following exercise: "{exercise_name}"

Return a JSON object with the following structure exactly. Do not include markdown formatting like ```json.

{{
  "exercise_id": "{safe_name}",
  "display_name": "{exercise_name}",
  "primary_muscles": ["muscle1", "muscle2"],
  "secondary_muscles": ["muscle3"],
  "trainer_explanation": {{
    "client_friendly": "A simple 1-2 sentence explanation of what this exercise does."
  }},
  "coaching_notes": [
    "Important form cue 1",
    "Important form cue 2"
  ]
}}
"""

def call_gemini(exercise_name: str, safe_name: str) -> dict:
    if not GEMINI_API_KEY:
        logger.error("GEMINI_API_KEY environment variable is missing. Cannot enrich.")
        return None

    prompt = PROMPT_TEMPLATE.format(exercise_name=exercise_name, safe_name=safe_name)
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
            # Clean up potential markdown wrapper
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
        target_file = CATALOG_TEACHING / f"{safe_name}.yml"

        if target_file.exists():
            logger.info(f"Catalog entry for '{name}' already exists. Removing from inbox.")
            file_path.unlink()
            return

        logger.info(f"Enriching new exercise: {name}")
        enriched_data = call_gemini(name, safe_name)
        
        if enriched_data:
            import yaml
            CATALOG_TEACHING.mkdir(parents=True, exist_ok=True)
            
            # Simple YAML dump (could be refined to match existing format exactly)
            with target_file.open("w", encoding="utf-8") as f:
                yaml.dump(enriched_data, f, allow_unicode=True, sort_keys=False)
            
            logger.success(f"Successfully generated catalog entry for {name}")
            file_path.unlink() # Delete from inbox after successful processing
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
