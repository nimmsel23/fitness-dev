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
    True = remote gewinnt (lokale Datei wird überschrieben).

    Bug (live reproduziert 2026-08-23, Matthias-Datenverlust): die alte
    Fassung verglich saved_at nur, wenn BEIDE revs nicht-null UND gleich
    waren — bei rev=0==0 (Legacy-Sessions ohne rev-Feld, der Normalfall vor
    dessen Einführung) griff kein Vergleich, es fiel direkt auf "remote
    gewinnt" durch. Ein Daemon-Neustart feuert für JEDES Bestandsdokument ein
    ADDED-Event (Firestore-on_snapshot-Verhalten) — das hat lokal manuell
    korrigierte Sessions blind mit dem älteren Firestore-Stand überschrieben.
    Jetzt: bei gleichem rev (auch 0==0) gewinnt remote nur, wenn sein
    saved_at nachweislich NEUER ist als lokal; ohne verwertbare Zeitstempel
    bleibt lokal der sichere Default."""
    local_rev  = int(local_data.get("rev") or 0)
    remote_rev = int(remote_data.get("rev") or 0)
    if remote_rev != local_rev:
        return remote_rev > local_rev
    local_ts  = local_data.get("saved_at", "")
    remote_ts = ts(remote_data.get("saved_at"))
    if not remote_ts:
        return False
    if not local_ts:
        return True
    return remote_ts > local_ts
