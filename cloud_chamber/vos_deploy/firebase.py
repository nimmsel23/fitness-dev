"""Firebase queries — Service Account via google-auth + Hosting REST API."""

import json
import subprocess
import urllib.request
from datetime import datetime, timezone
from pathlib import Path

from google.oauth2 import service_account
from google.auth.transport.requests import Request

from .sites import FIREBASE_PROJECT

_SA_FILE = Path.home() / ".env" / "firebase-fitness.json"
_SCOPES  = ["https://www.googleapis.com/auth/firebase.hosting.readonly"]

_creds: service_account.Credentials | None = None
_lock = __import__("threading").Lock()


def _token() -> str | None:
    global _creds
    with _lock:
        try:
            if _creds is None:
                _creds = service_account.Credentials.from_service_account_file(
                    str(_SA_FILE), scopes=_SCOPES,
                )
            if not _creds.valid:
                _creds.refresh(Request())
            return _creds.token
        except Exception:
            return None


def _get(url: str) -> dict | None:
    tok = _token()
    if not tok:
        return None
    try:
        req = urllib.request.Request(url, headers={"Authorization": f"Bearer {tok}"})
        with urllib.request.urlopen(req, timeout=10) as r:
            return json.loads(r.read())
    except Exception:
        return None


def last_release(site_id: str) -> dict | None:
    """Return info about the most recent live release for a site."""
    data = _get(
        f"https://firebasehosting.googleapis.com/v1beta1/sites/{site_id}/releases"
        "?pageSize=3"
    )
    if not data:
        return None
    releases = data.get("releases", [])
    # Filter to DEPLOY type only (skip ROLLBACK etc.)
    live = [r for r in releases if r.get("type") in ("DEPLOY", None)]
    if not live:
        live = releases
    if not live:
        return None
    r = live[0]
    ts = r.get("releaseTime") or r.get("createTime", "")
    dt = datetime.fromisoformat(ts.replace("Z", "+00:00")) if ts else None
    return {
        "time":    dt,
        "version": r.get("version", {}).get("name", "")[-8:],
        "user":    r.get("releaseUser", {}).get("email", "—"),
        "type":    r.get("type", ""),
    }


def deploy(target: str, vitalos_dir: str) -> int:
    """Run npm deploy:<target> in vitalos_dir. Returns exit code."""
    r = subprocess.run(
        ["npm", "run", f"deploy:{target}"],
        cwd=vitalos_dir,
    )
    return r.returncode
