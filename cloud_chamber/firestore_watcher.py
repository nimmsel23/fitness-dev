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
from firebase_admin import credentials, firestore, messaging
from loguru import logger
import urllib.request
from typing import Any
import yaml

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

# --- Biomechanical Auditing ---

def load_biomechanical_rules() -> dict:
    rule_path = Path(__file__).parent / "rules" / "biomechanics.yml"
    try:
        with open(rule_path, "r", encoding="utf-8") as f:
            return yaml.safe_load(f) or {}
    except Exception as e:
        logger.error(f"Failed to load biomechanical rules: {e}")
        return {}

def audit_exercise(ex: dict, rules: dict) -> list[str]:
    warnings = []
    
    mp_rules = rules.get("movement_pattern_rules", {})
    iso_rules = rules.get("isolation_rules", {})
    
    # 1. Movement Pattern
    mp = ex.get("movement_pattern")
    if mp in mp_rules:
        required = mp_rules[mp].get("required_primary", [])
        primary = [str(m).lower().strip() for m in (ex.get("primary_muscles") or [])]
        
        # Check if at least one required muscle is in primary
        # Muscle IDs might have prefixes, so we do substring matching for robustness
        has_match = False
        for req in required:
            req_normalized = req.lower()
            if any(req_normalized in p or p in req_normalized for p in primary):
                has_match = True
                break
                
        if not has_match and required:
            warnings.append(f"Muster '{mp}' erwartet einen dieser primären Muskeln: {', '.join(required)}.")
            
    # 2. Isolation Guard
    ex_type = ex.get("type", "unknown")
    primary_count = len(ex.get("primary_muscles") or [])
    if ex_type == "isolation":
        max_p = iso_rules.get("max_primary_muscles", 2)
        if primary_count > max_p:
            warnings.append(f"Als 'isolation' markiert, hat aber {primary_count} primäre Muskeln (max {max_p}).")
            
    # 3. Contradictions
    primary_set = set(ex.get("primary_muscles") or [])
    secondary_set = set(ex.get("secondary_muscles") or [])
    overlap = primary_set.intersection(secondary_set)
    if overlap:
        warnings.append(f"Muskeln sowohl primär als auch sekundär: {', '.join(overlap)}.")
        
    return warnings

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
    rules = load_biomechanical_rules()
    
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
                
                # Perform Biomechanical Audit
                warnings = audit_exercise(enriched, rules)
                if warnings:
                    enriched['biomechanical_warnings'] = warnings
                    logger.warning(f"Audit warnings for '{name}': {warnings}")
                
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

processed_feedbacks = {}

def send_push_notification(user_id: str, title: str, body: str):
    """Sends a push notification via FCM to the client's mobile device if a token is registered."""
    try:
        db = firestore.client()
        token = None
        
        # Check subcollection doc: fitness/{uid}/profile/push_token
        token_doc = db.document(f"fitness/{user_id}/profile/push_token").get()
        if token_doc.exists:
            data = token_doc.to_dict()
            token = data.get("token") or data.get("push_token") or data.get("endpoint")
            
        if not token:
            # Check main user doc: fitness/{uid}
            user_doc = db.document(f"fitness/{user_id}").get()
            if user_doc.exists:
                data = user_doc.to_dict()
                token = data.get("pushToken") or data.get("push_token")
                
        if token:
            message = messaging.Message(
                notification=messaging.Notification(
                    title=title,
                    body=body,
                ),
                token=token,
            )
            response = messaging.send(message)
            logger.info(f"Successfully sent push notification to {user_id}: {response}")
        else:
            logger.warning(f"No push token found for user {user_id}. Skipping push notification.")
    except Exception as e:
        logger.error(f"Failed to send push notification to {user_id}: {e}")

def on_habit_journal_snapshot(col_snapshot: Any, changes: Any, read_time: Any):
    """Callback to monitor coachFeedback updates and notify clients."""
    for change in changes:
        doc = change.document
        data = doc.to_dict()
        path = doc.reference.path
        feedback = data.get('coachFeedback', '').strip()
        
        if change.type.name == 'ADDED':
            if feedback:
                processed_feedbacks[path] = feedback
            continue
            
        if change.type.name == 'MODIFIED':
            if not feedback:
                processed_feedbacks.pop(path, None)
                continue
                
            old_feedback = processed_feedbacks.get(path)
            if old_feedback == feedback:
                continue
                
            processed_feedbacks[path] = feedback
            
            # Extract user_id from path: fitness/{uid}/habitJournals/{date}
            parts = path.split('/')
            if len(parts) >= 2:
                user_id = parts[1]
                date = parts[3] if len(parts) >= 4 else "Ausgewählter Tag"
                
                logger.info(f"New coach feedback for user {user_id} on {date}: {feedback}")
                
                # 1. Create inbox notification document for the user
                db = firestore.client()
                notification_data = {
                    'type': 'coach_feedback',
                    'status': 'unread',
                    'title': 'Neues Coach-Feedback 💬',
                    'text': f'Dein Coach hat einen Kommentar zu deinem Habit-Journal vom {date} hinterlassen: "{feedback}"',
                    'received_at': firestore.SERVER_TIMESTAMP,
                    'habitId': data.get('habitId'),
                    'date': date
                }
                
                try:
                    db.collection('fitness').document(user_id).collection('inbox').add(notification_data)
                    logger.info(f"Created inbox notification for user {user_id}")
                except Exception as e:
                    logger.error(f"Failed to create inbox notification: {e}")
                
                # 2. Push notification to client mobile device
                send_push_notification(user_id, "Neues Feedback vom Coach", f'"{feedback}"')

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

        # Listen to collectionGroup 'habitJournals' for coach feedback updates
        logger.info("Monitoring all 'habitJournals' collections for coach feedback...")
        journals_query = db.collection_group('habitJournals')
        journals_query.on_snapshot(on_habit_journal_snapshot)

        # Keep the thread alive
        while True:
            time.sleep(1)
    except Exception as e:
        logger.critical(f"Watcher crashed: {e}")

if __name__ == "__main__":
    main()
