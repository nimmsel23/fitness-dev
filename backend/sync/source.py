"""Firestore-Quelle (dünn, ohne Logik): fitness/<uid>/sessions."""
from __future__ import annotations

import os
from pathlib import Path
from typing import Iterator

from backend.sync.pull import RemoteDoc

CRED_PATH = Path(os.environ.get("FITNESS_FIREBASE_CREDENTIALS", Path.home() / ".env" / "firebase-fitness.json"))
PROJECT = os.environ.get("FIREBASE_FITNESS_PROJECT", "fitness-aos")


def _client():
    import firebase_admin
    from firebase_admin import credentials, firestore

    if not CRED_PATH.exists():
        raise FileNotFoundError(f"Service-Account fehlt: {CRED_PATH}")
    if not firebase_admin._apps:
        firebase_admin.initialize_app(credentials.Certificate(str(CRED_PATH)), {"projectId": PROJECT})
    return firestore.client()


def firestore_sessions(uid: str) -> Iterator[RemoteDoc]:
    db = _client()
    for doc in db.collection("fitness").document(uid).collection("sessions").stream():
        yield RemoteDoc(doc.id, doc.to_dict() or {})
