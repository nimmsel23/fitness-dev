import os
from pathlib import Path
import firebase_admin
from firebase_admin import credentials, firestore

CRED_PATH = Path.home() / ".env" / "firebase-fitness.json"
PROJECT   = os.getenv("FIREBASE_FITNESS_PROJECT", "fitness-aos")

def _resolve_uid() -> str:
    if v := os.getenv("FITNESS_UID"):
        return v
    uid_file = Path.home() / ".aos" / "users" / ".active-uid"
    if uid_file.exists():
        return uid_file.read_text().strip()
    return "59ole36uNpNwml5H6VDYCXyCME92"

UID = _resolve_uid()

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


def remote_wins(local_data: dict, remote_data: dict) -> bool:
    """Gemeinsame Konfliktentscheidung für Session-Pulls: rev statt saved_at-
    String-Vergleich (robust gegen Client-Uhr-Drift). Zentral hier statt in
    mirror.py UND sync.py getrennt gepflegt — genau diese Verdopplung war der
    Grund, warum der rev-Fix (2026-08-23) zunächst nur mirror.py::on_session()
    erreichte und sync.py::pull()/push() den alten, fehleranfälligen
    saved_at-Vergleich weiterhin nutzten, obwohl beide dieselbe Aufgabe lösen.
    True = remote gewinnt (lokale Datei wird überschrieben)."""
    local_rev  = int(local_data.get("rev") or 0)
    remote_rev = int(remote_data.get("rev") or 0)
    if remote_rev and remote_rev < local_rev:
        return False
    if remote_rev and remote_rev == local_rev:
        local_ts  = local_data.get("saved_at", "")
        remote_ts = ts(remote_data.get("saved_at"))
        if remote_ts and local_ts and local_ts >= remote_ts:
            return False
    return True
