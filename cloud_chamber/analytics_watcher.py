"""
AlphaOS Fitness — Cloud Chamber Analytics Watcher

This module monitors user-submitted 'sessions' entries across all users
and asynchronously calculates rolling 28-day analytics (volume, muscle coverage).
"""
from __future__ import annotations

import os
import time
from datetime import datetime, timedelta
from pathlib import Path
import firebase_admin
from firebase_admin import credentials, firestore
from loguru import logger
from typing import Any

# --- Biomechanical Constants ---

MUSCLE_GROUPS = {
    "chest": ["pecs", "chest", "pectoralis", "brust", "100_chest", "101_pectoralis", "102_pectoralis", "103_pectoralis"],
    "back": ["lats", "traps", "lower back", "back", "latissimus", "trapezius", "rhomboids", "rücken", "pull-up", "klimmzug", "rudern", "row", "200_back", "201_latissimus", "202_trapezius", "203_trapezius", "204_trapezius", "205_rhomboids", "206_erector", "207_teres", "208_quadratus"],
    "shoulders": ["shoulders", "delts", "deltoid", "schulter", "schultern", "overhead", "press", "300_shoulders", "301_anterior_deltoid", "302_lateral_deltoid", "303_posterior_deltoid", "304_rotator"],
    "arms": ["biceps", "triceps", "forearms", "brachii", "bizeps", "trizeps", "arm", "arme", "curl", "extension", "400_arms", "401_biceps", "402_brachialis", "403_triceps", "404_brachioradialis", "405_forearm", "406_anconeus"],
    "core": ["abs", "obliques", "core", "abdominis", "bauch", "500_core", "501_rectus", "502_obliques", "503_transverse"],
    "glutes": ["glutes", "gluteus", "po", "gesäß", "hip thrust", "601_gluteus", "602_gluteus"],
    "quads": ["quads", "quadriceps", "oberschenkel", "squat", "kniebeuge", "603_quadriceps"],
    "hamstrings": ["hamstrings", "biceps femoris", "beinbeuger", "leg curl", "604_hamstrings"],
    "calves": ["calves", "gastrocnemius", "waden", "calf", "700_calves", "701_gastrocnemius", "702_soleus", "triceps_surae"],
    "legs": ["legs", "squat", "deadlift", "lunge", "beine", "bein", "leg press", "600_legs"]
}

def muscle_to_group_ids(muscle: str, exercise_name: str = "") -> list[str]:
    m = muscle.lower()
    name = exercise_name.lower()
    matches = set()
    for group, lst in MUSCLE_GROUPS.items():
        if any(x in m or (name and x in name) for x in lst):
            matches.add(group)
    return list(matches)

# --- Analytics Logic ---

def rebuild_analytics_for_user(db: firestore.Client, uid: str):
    logger.info(f"Rebuilding analytics for user: {uid}")
    
    # 28 days window is max we need
    cutoff_date = (datetime.now() - timedelta(days=28)).strftime("%Y-%m-%d")
    
    sessions_ref = db.collection("fitness").document(uid).collection("sessions")
    recent_sessions = sessions_ref.where("date", ">=", cutoff_date).stream()
    
    # Pre-fetch KB for mapping
    kb_ref = db.collection("fitness").document("kb").collection("exercises")
    kb_docs = {doc.id: doc.to_dict() for doc in kb_ref.stream()}
    
    # Prepare windows
    now = datetime.now()
    windows = {
        "rolling_7_days": {"days": 7, "sessions": 0, "exercises": 0, "scores": {group: 0.0 for group in MUSCLE_GROUPS}},
        "rolling_14_days": {"days": 14, "sessions": 0, "exercises": 0, "scores": {group: 0.0 for group in MUSCLE_GROUPS}},
        "rolling_28_days": {"days": 28, "sessions": 0, "exercises": 0, "scores": {group: 0.0 for group in MUSCLE_GROUPS}},
    }
    
    for doc in recent_sessions:
        sess = doc.to_dict()
        sess_date_str = sess.get("date", "")
        try:
            sess_date = datetime.strptime(sess_date_str, "%Y-%m-%d")
            days_ago = (now - sess_date).days
        except ValueError:
            continue
            
        for w_name, w_data in windows.items():
            if days_ago <= w_data["days"]:
                w_data["sessions"] += 1
                
                for ex in sess.get("exercises", []):
                    if not ex.get("done"): continue
                    
                    w_data["exercises"] += 1
                    
                    ex_name = ex.get("name") or ex.get("exercise_id") or ""
                    
                    kb_ex = None
                    for kb_id, kb_data in kb_docs.items():
                        if kb_id.lower() == ex_name.lower() or (kb_data.get("display_name") or "").lower() == ex_name.lower():
                            kb_ex = kb_data
                            break
                            
                    primary = kb_ex.get("primary_muscles", []) if kb_ex else ex.get("primaryMuscles", [])
                    secondary = kb_ex.get("secondary_muscles", []) if kb_ex else ex.get("secondaryMuscles", [])
                        
                    for p in primary:
                        for gid in muscle_to_group_ids(p, ex_name):
                            w_data["scores"][gid] += 1.0
                    for s in secondary:
                        for gid in muscle_to_group_ids(s, ex_name):
                            w_data["scores"][gid] += 0.5
                    
    # Write to analytics doc
    analytics_ref = db.collection("fitness").document(uid).collection("analytics").document("dashboard")
    
    payload = {"last_updated": firestore.SERVER_TIMESTAMP}
    for w_name, w_data in windows.items():
        payload[w_name] = {
            "session_count": w_data["sessions"],
            "exercise_count": w_data["exercises"],
            "body_region_scores": w_data["scores"]
        }
        
    analytics_ref.set(payload)
    logger.info(f"Updated analytics for {uid}: 28d sessions={windows['rolling_28_days']['sessions']}")

def on_session_snapshot(col_snapshot: Any, changes: Any, read_time: Any):
    """Callback for Firestore collectionGroup listener on 'sessions'."""
    users_to_update = set()
    
    for change in changes:
        doc = change.document
        uid = doc.reference.parent.parent.id
        users_to_update.add(uid)
        
    for uid in users_to_update:
        # Note: We need a client instance here. Using the global default app.
        db = firestore.client()
        rebuild_analytics_for_user(db, uid)

def main():
    cred_path = Path.home() / ".env" / "firebase-fitness.json"
    if not cred_path.exists():
        logger.error(f"Credentials not found at {cred_path}. Cannot start Analytics Watcher.")
        return

    try:
        cred = credentials.Certificate(str(cred_path))
        firebase_admin.initialize_app(cred)
        db = firestore.client()

        logger.info("Cloud Chamber Analytics Watcher online. Monitoring all 'sessions' collections...")
        
        query = db.collection_group('sessions')
        query.on_snapshot(on_session_snapshot)

        while True:
            time.sleep(1)
    except Exception as e:
        logger.critical(f"Analytics Watcher crashed: {e}")

if __name__ == "__main__":
    main()
