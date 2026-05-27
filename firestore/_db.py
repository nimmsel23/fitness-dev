import os
from pathlib import Path
import firebase_admin
from firebase_admin import credentials, firestore

CRED_PATH = Path.home() / ".env" / "firebase-fitness.json"
PROJECT   = os.getenv("FIREBASE_FITNESS_PROJECT", "fitness-aos")
UID       = os.getenv("FITNESS_UID", "default")

_db = None

def get_db():
    global _db
    if _db:
        return _db
    if not CRED_PATH.exists():
        raise FileNotFoundError(f"Service-Account fehlt: {CRED_PATH}")
    if not firebase_admin._apps:
        firebase_admin.initialize_app(
            credentials.Certificate(str(CRED_PATH)),
            {"projectId": PROJECT},
        )
    _db = firestore.client()
    return _db

def ts(val) -> str | None:
    if val is None:
        return None
    return val.isoformat() if hasattr(val, "isoformat") else str(val)
