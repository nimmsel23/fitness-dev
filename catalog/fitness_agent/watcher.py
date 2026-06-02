from __future__ import annotations

import json
import os
import time
from pathlib import Path
import urllib.request
import urllib.parse
from typing import Any

import yaml
from .paths import DATA_DIR, runtime_root
from .kb_sync import run_kb_sync

# We'll use a simple print-based logger to avoid adding dependencies like loguru
# if not absolutely necessary, or just use the agent's internal conventions.

def log(msg: str):
    print(f"[*] {msg}")

def log_warn(msg: str):
    print(f"[!] WARN: {msg}")

def log_err(msg: str):
    print(f"[X] ERROR: {msg}")

def log_success(msg: str):
    print(f"[+] {msg}")


def load_gemini_key() -> str | None:
    # Try env first
    key = os.environ.get("GEMINI_API_KEY")
    if key:
        return key
    
    # Try .env file
    env_path = Path.home() / ".env" / "fitness.env"
    if env_path.exists():
        for line in env_path.read_text().splitlines():
            if "=" in line and not line.startswith("#"):
                k, v = line.split("=", 1)
                if k.strip() == "GEMINI_API_KEY":
                    return v.strip()
    return None


PROMPT_TEMPLATE = """
You are an expert fitness coach and biomechanics expert.
A user has logged a new exercise: "{exercise_name}"

Return a JSON object with the following structure exactly. Do not include markdown formatting like ```json.
It must match our base exercise schema. Use German for display_name and coaching_notes.

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
  "primary_muscles": ["muscle1"],
  "secondary_muscles": ["muscle2"],
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

def call_gemini(exercise_name: str, safe_name: str, api_key: str) -> dict | None:
    prompt = PROMPT_TEMPLATE.format(exercise_name=exercise_name, safe_name=safe_name)
    url = f"https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key={api_key}"
    
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
        log_err(f"Gemini API call failed for {exercise_name}: {e}")
        return None


def process_inbox_file(file_path: Path, api_key: str | None):
    try:
        data = json.loads(file_path.read_text())
        name = data.get("name")
        if not name:
            log_warn(f"Inbox file {file_path.name} missing 'name'. Deleting.")
            file_path.unlink()
            return

        safe_name = name.lower().replace(" ", "_")
        # In the agent, we store in catalog/kb/exercises with inbox_ prefix
        # This keeps the "expert" in control (audit all will see them)
        target_file = DATA_DIR / "exercises" / f"inbox_{safe_name}.yml"

        if target_file.exists():
            log(f"Inbox draft for '{name}' already exists. Removing from client inbox.")
            file_path.unlink()
            return

        log(f"Enriching new exercise: {name}")
        
        enriched_data = None
        if api_key:
            enriched_data = call_gemini(name, safe_name, api_key)
        
        if enriched_data:
            # Add placeholders for missing required fields to satisfy audit
            if "stabilizers" not in enriched_data:
                enriched_data["stabilizers"] = []
            if "variations" not in enriched_data:
                enriched_data["variations"] = []
                
            wrapper = {
                "name": f"inbox_{safe_name}",
                "description": f"AI generated base entry for {name}",
                "exercises": [enriched_data]
            }
            
            with target_file.open("w", encoding="utf-8") as f:
                yaml.safe_dump(wrapper, f, allow_unicode=True, sort_keys=False)
            
            log_success(f"Successfully generated inbox entry for {name}")
            file_path.unlink()
            
            # Sync to Firestore so the user sees it in their web-UI inbox
            try:
                run_kb_sync()
                log("Firestore sync triggered.")
            except Exception as e:
                log_err(f"Firestore sync failed: {e}")
        else:
            log_warn(f"Could not enrich {name}. Ensure GEMINI_API_KEY is set.")
            
    except Exception as e:
        log_err(f"Failed to process {file_path}: {e}")


def run_watcher():
    log("Starting fitness-agent watcher daemon...")
    api_key = load_gemini_key()
    if not api_key:
        log_warn("GEMINI_API_KEY not found. Automated enrichment disabled.")
        
    users_dir = runtime_root() / "users"
    
    while True:
        if users_dir.exists():
            for uid_dir in users_dir.iterdir():
                if not uid_dir.is_dir():
                    continue
                inbox_dir = uid_dir / "inbox"
                if inbox_dir.exists():
                    for json_file in inbox_dir.glob("*.json"):
                        process_inbox_file(json_file, api_key)
        time.sleep(10)
