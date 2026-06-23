"""
firestore.fuel — Fuel-Daten ↔ Firestore (fitness-aos)

Collections:
  nutrition/{uid}/logs/{date}       — Tageslog (Mahlzeiten, Wasser)
  supplements/{uid}/logs/{date}     — Supplements-Tageslog
  supplements/{uid}/meta/catalog    — Supplements-Katalog

Kein Watcher — Fuel schreibt fire-and-forget beim Loggen.
Bulk-Push via push_fuel() aus fuel/bin/fuel sync.
"""
from __future__ import annotations

import json
import os
from datetime import datetime
from pathlib import Path
from typing import Any

from loguru import logger

from ._db import get_db, UID

FUEL_DATA_DIR = Path(
    os.getenv("AOS_FUEL_DATA_DIR", str(Path.home() / ".aos" / "fuel"))
).expanduser()


# ── Lokale Pfade ──────────────────────────────────────────────────────────────

def _nutrition_path(d: str, data_dir: Path) -> Path:
    return data_dir / "nutrition" / f"{d}.json"

def _supplements_path(d: str, data_dir: Path) -> Path:
    return data_dir / "supplements" / "logs" / f"{d}.json"

def _supplements_catalog_path(data_dir: Path) -> Path:
    return data_dir / "supplements" / "catalog.json"


# ── Helfer ────────────────────────────────────────────────────────────────────

def _read_json(path: Path, default: Any) -> Any:
    if not path.exists():
        return default
    try:
        return json.loads(path.read_text())
    except Exception as e:
        logger.warning(f"fuel: Lesen fehlgeschlagen {path}: {e}")
        return default

def _write_json(path: Path, data: Any) -> None:
    path.parent.mkdir(parents=True, exist_ok=True)
    path.write_text(json.dumps(data, ensure_ascii=False, indent=2))

def _strip_meta(obj: dict) -> dict:
    return {k: v for k, v in obj.items() if k not in ("updated_at", "_firestore_updated")}

def _merge_by_id(a: list[dict], b: list[dict]) -> list[dict]:
    by_id: dict[str, dict] = {}
    for item in a + b:
        iid = item.get("id")
        if not iid:
            continue
        existing = by_id.get(iid)
        if existing is None or item.get("time", "") > existing.get("time", ""):
            by_id[iid] = _strip_meta(item)
    return sorted(by_id.values(), key=lambda x: x.get("time", ""))

def _data_dir(uid: str) -> Path:
    if uid == UID or uid == "default":
        return FUEL_DATA_DIR
    return FUEL_DATA_DIR / "users" / uid


# ── Fire-and-forget (wird vom fuel-dev Server pro Request aufgerufen) ─────────

def mirror_fuel_nutrition(date: str, data: dict, uid: str = UID) -> None:
    try:
        db = get_db()
        db.collection("nutrition").document(uid).collection("logs").document(date).set(
            {**data, "date": date, "saved_at": datetime.utcnow().isoformat()}
        )
    except Exception as e:
        logger.warning(f"mirror_fuel_nutrition fehler ({date}, {uid}): {e}")

def mirror_fuel_supplements(date: str, data: dict, uid: str = UID) -> None:
    try:
        db = get_db()
        db.collection("supplements").document(uid).collection("logs").document(date).set(
            {**data, "date": date, "saved_at": datetime.utcnow().isoformat()}
        )
    except Exception as e:
        logger.warning(f"mirror_fuel_supplements fehler ({date}, {uid}): {e}")

def mirror_fuel_catalog(data: dict, uid: str = UID, kind: str = "nutrition") -> None:
    """kind: 'nutrition' | 'supplements'"""
    try:
        db = get_db()
        col = "nutrition" if kind == "nutrition" else "supplements"
        db.collection(col).document(uid).collection("meta").document("catalog").set(
            {**data, "saved_at": datetime.utcnow().isoformat()}, merge=True
        )
    except Exception as e:
        logger.warning(f"mirror_fuel_catalog fehler ({kind}, {uid}): {e}")


# ── Bulk-Sync (für CLI push/pull) ─────────────────────────────────────────────

def _push_nutrition(date: str, uid: str, data_dir: Path) -> str:
    data = _read_json(_nutrition_path(date, data_dir), None)
    if not data:
        return "leer"
    db = get_db()
    db.collection("nutrition").document(uid).collection("logs").document(date).set(
        {**data, "date": date, "saved_at": datetime.utcnow().isoformat()}
    )
    return f"{len(data.get('meals', []))} Mahlzeiten"

def _push_supplements(date: str, uid: str, data_dir: Path) -> str:
    data = _read_json(_supplements_path(date, data_dir), None)
    if not data:
        return "leer"
    db = get_db()
    db.collection("supplements").document(uid).collection("logs").document(date).set(
        {**data, "date": date, "saved_at": datetime.utcnow().isoformat()}
    )
    return f"{len(data.get('entries', []))} Einträge"

def _push_catalog(uid: str, data_dir: Path) -> str:
    local = _read_json(_supplements_catalog_path(data_dir), {"items": []})
    items = local.get("items", [])
    if not items:
        return "leer"
    db = get_db()
    doc_ref = db.collection("supplements").document(uid).collection("meta").document("catalog")
    snap = doc_ref.get()
    remote = snap.to_dict().get("items", []) if snap.exists else []
    merged = _merge_by_id(items, remote)
    _write_json(_supplements_catalog_path(data_dir), {"items": merged})
    doc_ref.set({"items": merged}, merge=True)
    return f"{len(merged)} Items"

def _collect_dates(data_dir: Path) -> list[str]:
    dates: set[str] = set()
    for sub in (data_dir / "nutrition", data_dir / "supplements" / "logs"):
        if sub.exists():
            for f in sub.glob("????-??-??.json"):
                dates.add(f.stem)
    return sorted(dates)


def _quota_ok() -> bool:
    """Schneller Ping — False wenn Quota erschöpft."""
    try:
        get_db().collection("_ping").document("quota_check").set(
            {"t": datetime.utcnow().isoformat()}, timeout=5
        )
        return True
    except Exception as e:
        if "429" in str(e) or "Quota" in str(e):
            return False
        return True  # anderer Fehler → trotzdem versuchen


def push_fuel(uid: str = UID, delay: float = 0.1) -> dict:
    """Alle lokalen Fuel-Daten → Firestore. Gibt Zusammenfassung zurück."""
    import time
    if not _quota_ok():
        logger.error("fuel push: Firestore Quota erschöpft — morgen nochmal (reset ~02:00 MESZ)")
        return {"dates": 0, "error": "quota_exceeded"}

    data_dir = _data_dir(uid)
    dates = _collect_dates(data_dir)
    results: dict[str, Any] = {"dates": len(dates), "nutrition": {}, "supplements": {}}
    for d in dates:
        try:
            results["nutrition"][d] = _push_nutrition(d, uid, data_dir)
            results["supplements"][d] = _push_supplements(d, uid, data_dir)
            logger.info(f"  → {d}")
        except Exception as e:
            if "429" in str(e) or "Quota" in str(e):
                logger.error("Quota erschöpft — Push abgebrochen")
                results["error"] = "quota_exceeded"
                break
            logger.error(f"  ✗ {d}: {e}")
            results.setdefault("errors", []).append(f"{d}: {e}")
        time.sleep(delay)
    if "error" not in results:
        try:
            results["catalog"] = _push_catalog(uid, data_dir)
        except Exception as e:
            logger.error(f"  ✗ catalog: {e}")
            results["catalog"] = f"Fehler: {e}"
    return results


def pull_fuel(uid: str = UID) -> dict:
    """Firestore → lokale Fuel-Daten."""
    db = get_db()
    data_dir = _data_dir(uid)
    count = {"nutrition": 0, "supplements": 0}

    for snap in db.collection("nutrition").document(uid).collection("logs").stream():
        _write_json(_nutrition_path(snap.id, data_dir), _strip_meta(snap.to_dict()))
        count["nutrition"] += 1

    for snap in db.collection("supplements").document(uid).collection("logs").stream():
        _write_json(_supplements_path(snap.id, data_dir), _strip_meta(snap.to_dict()))
        count["supplements"] += 1

    doc = db.collection("supplements").document(uid).collection("meta").document("catalog").get()
    if doc.exists:
        _write_json(_supplements_catalog_path(data_dir), doc.to_dict())

    return count
