"""
AlphaOS Fitness — Cloud Chamber Watcher
Document-Driven Expert Logic for Firestore

This module monitors user-submitted 'inbox' entries across all users,
performs AI enrichment via Gemini, and updates the documents for Coach review.
"""
from __future__ import annotations

import os
import json
import time
from pathlib import Path
import firebase_admin
from firebase_admin import credentials, firestore
from loguru import logger
import urllib.request
from typing import Any

# --- Configuration & Auth ---

def load_gemini_key() -> str | None:
    """Retrieves API key from env or local .env file."""
    key = os.environ.get("GEMINI_API_KEY")
    if key: return key
    env_path = Path.home() / ".env" / "fitness.env"
    if env_path.exists():
        for line in env_path.read_text().splitlines():
            if "=" in line and not line.startswith("#") and "GEMINI_API_KEY" in line:
                return line.split("=", 1)[1].strip()
    return None

# --- AI Logic ---

PROMPT_TEMPLATE_NEW = """
You are an expert fitness coach and biomechanics expert.
A user has logged a new, unknown exercise: "{exercise_name}"

Return a JSON object with the following structure exactly. Do not include markdown formatting like ```json.
Use German for display_name and coaching_notes.

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
  "coaching_notes": ["Hinweis 1", "Hinweis 2"],
  "common_errors": ["Fehler 1"],
  "tags": ["tag1"],
  "aliases": []
}}
"""

def call_gemini(exercise_name: str, safe_name: str, api_key: str) -> dict | None:
    """Calls Gemini API to enrich a raw exercise name with biomechanical data."""
    prompt = PROMPT_TEMPLATE_NEW.format(exercise_name=exercise_name, safe_name=safe_name)
    url = f"https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key={api_key}"
    payload = {"contents": [{"parts": [{"text": prompt}]}]}
    req = urllib.request.Request(url, data=json.dumps(payload).encode("utf-8"), headers={"Content-Type": "application/json"})
    try:
        with urllib.request.urlopen(req) as response:
            result = json.loads(response.read().decode("utf-8"))
            text = result["candidates"][0]["content"]["parts"][0]["text"]
            return json.loads(text.replace("```json", "").replace("```", "").strip())
    except Exception as e:
        logger.error(f"Gemini enrichment failed for '{exercise_name}': {e}")
        return None

# --- Firestore Processing ---

def on_snapshot(col_snapshot: Any, changes: Any, read_time: Any):
    """Callback for Firestore collectionGroup listener."""
    for change in changes:
        if change.type.name == 'ADDED' or (change.type.name == 'MODIFIED' and change.document.to_dict().get('status') == 'pending'):
            doc = change.document
            data = doc.to_dict()
            
            # Skip if already enriched or not pending
            if data.get('status') != 'pending': continue
            
            name = data.get('name')
            if not name: continue
            
            user_id = doc.reference.parent.parent.id
            logger.info(f"Processing inbox item: '{name}' (User: {user_id})")
            
            api_key = load_gemini_key()
            if not api_key:
                logger.error("Abort: No Gemini API key available.")
                continue
                
            safe_name = name.lower().replace(" ", "_")
            enriched = call_gemini(name, safe_name, api_key)
            
            if enriched:
                # Add metadata
                enriched['source'] = 'ai_enrichment'
                
                doc.reference.update({
                    'enriched': enriched,
                    'status': 'ai_enriched',
                    'processed_at': firestore.SERVER_TIMESTAMP,
                    'last_action': 'expert_enrichment'
                })
                logger.info(f"Successfully enriched '{name}'")
            else:
                doc.reference.update({
                    'status': 'failed_enrichment',
                    'error': 'Gemini API timeout or invalid response'
                })

def main():
    """Initializes Firebase and starts the listener."""
    cred_path = Path.home() / ".env" / "firebase-fitness.json"
    if not cred_path.exists():
        logger.error(f"Credentials not found at {cred_path}. Cannot start Cloud Chamber Watcher.")
        return

    try:
        cred = credentials.Certificate(str(cred_path))
        firebase_admin.initialize_app(cred)
        db = firestore.client()

        logger.info("Cloud Chamber Watcher online. Monitoring all 'inbox' collections...")
        
        # Listen to collectionGroup 'inbox' for all users
        query = db.collection_group('inbox').where('status', '==', 'pending')
        query.on_snapshot(on_snapshot)

        # Keep the thread alive
        while True:
            time.sleep(1)
    except Exception as e:
        logger.critical(f"Watcher crashed: {e}")

if __name__ == "__main__":
    main()
