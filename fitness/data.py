"""
fitness.data — Daten-Lade- und Klassifikationslogik.

Alle Funktionen greifen direkt auf Dateien zu — kein Server nötig.
"""
from __future__ import annotations

import json
import sqlite3
import subprocess
from datetime import date, timedelta
from pathlib import Path

from .paths import (
    ACTIVE_UID, AOS_USERS, KLIENTEN_DIR, KLIENTEN_SKIP,
    sessions_dir, sqlite_db,
)


# ── Hilfsfunktionen ───────────────────────────────────────────────────────────

def parse_date_stem(stem: str) -> str | None:
    """Extrahiert YYYY-MM-DD aus Datei-Stem wie '2026-06-19' oder '2026-06-19__xxx'."""
    if len(stem) >= 10 and stem[:10].count("-") == 2:
        return stem[:10]
    return None


# ── Session-Klassifikation ────────────────────────────────────────────────────

def classify(session: dict) -> str:
    """
    Klassifiziert eine Session in einen von drei Typen:

    'cardio'         — Reine Ausdauer-Session (kein Kraft-Training)
    'strength+addon' — Kraft-Session mit angehängter Cardio-Finisher-Aktivität
    'strength'       — Reine Kraft-Session

    Logik:
      - sessionMode == 'cardio'           → cardio
      - activity vorhanden + keine done exercises → cardio (legacy)
      - activity + done exercises          → strength+addon
      - sonst                              → strength
    """
    mode = session.get("sessionMode")
    act  = session.get("activity")
    exs  = [e for e in (session.get("exercises") or []) if e.get("done")]

    if mode == "cardio" or (act and not exs):
        return "cardio"
    if act and exs:
        return "strength+addon"
    return "strength"


# ── Session-Loading ───────────────────────────────────────────────────────────

def load_sessions(days: int = 60, uid: str | None = None) -> list[dict]:
    """
    Lädt alle Session-JSONs der letzten N Tage aus sessions_dir().
    Gibt eine Liste zurück, neueste zuerst.
    Mehrere Dateien pro Tag (Multi-Session) werden alle geladen.
    """
    sdir   = sessions_dir(uid)
    cutoff = (date.today() - timedelta(days=days)).isoformat()
    out: list[dict] = []

    for f in sorted(sdir.glob("*.json"), reverse=True):
        d = parse_date_stem(f.stem)
        if not d or d < cutoff:
            continue
        try:
            s = json.loads(f.read_text())
            s.setdefault("date", d)
            s["_stem"] = f.stem
            s["_file"] = str(f)
            out.append(s)
        except Exception:
            pass

    out.sort(key=lambda s: (s["date"], s.get("_stem", "")), reverse=True)
    return out


def load_sessions_for_date(target_date: str, uid: str | None = None) -> list[dict]:
    """Lädt alle Sessions für ein bestimmtes Datum (Multi-Session-Support)."""
    sdir = sessions_dir(uid)
    results: list[dict] = []
    for f in sorted(sdir.glob(f"{target_date}*.json")):
        try:
            s = json.loads(f.read_text())
            s.setdefault("date", target_date)
            s["_stem"] = f.stem
            results.append(s)
        except Exception:
            pass
    return results


# ── SQLite ────────────────────────────────────────────────────────────────────

def sqlite_exercise_history(exercise: str, limit: int = 20, uid: str | None = None) -> list[dict]:
    """
    Sucht nach einem Übungsnamen oder einer ID in training_history.sqlite
    und gibt den Set-Verlauf zurück (neueste zuerst).
    """
    db = sqlite_db(uid)
    if not db.exists():
        return []
    try:
        con = sqlite3.connect(str(db))
        cur = con.execute(
            "SELECT date, display_name, sets, reps, weight, rpe, notes "
            "FROM training_history "
            "WHERE lower(display_name) LIKE ? OR lower(exercise_id) LIKE ? "
            "ORDER BY date DESC, id DESC LIMIT ?",
            (f"%{exercise.lower()}%", f"%{exercise.lower()}%", limit),
        )
        cols = ["date", "display_name", "sets", "reps", "weight", "rpe", "notes"]
        rows = [dict(zip(cols, r)) for r in cur.fetchall()]
        con.close()
        return rows
    except Exception:
        return []


# ── Klienten-Registry ─────────────────────────────────────────────────────────

def slug_to_name(slug: str) -> str:
    """'matthias-mayer' → 'Matthias Mayer'"""
    return " ".join(p.capitalize() for p in slug.replace("-", " ").replace("_", " ").split())


def load_client_registry() -> dict[str, dict]:
    """
    Liest ~/Klienten/*/client.json und gibt ein Mapping {firebase_uid: client_info} zurück.

    client_info Felder:
      uid, name, slug, client_dir, espocrm, crm_id
    """
    registry: dict[str, dict] = {}
    if not KLIENTEN_DIR.exists():
        return registry

    for slug_dir in sorted(KLIENTEN_DIR.iterdir()):
        if (not slug_dir.is_dir()
                or slug_dir.name in KLIENTEN_SKIP
                or slug_dir.name.startswith("_")):
            continue
        cfg = slug_dir / "client.json"
        if not cfg.exists():
            continue
        try:
            data = json.loads(cfg.read_text())
        except Exception:
            continue
        uids = list(data.get("firebase_uids") or [])
        primary = data.get("firebase_uid") or data.get("uid")
        if primary and primary not in uids:
            uids.insert(0, primary)
        if not uids:
            continue
        name = data.get("name") or slug_to_name(data.get("id", slug_dir.name))
        meta = {
            "uid":        uids[0],
            "uids":       uids,
            "name":       name,
            "slug":       data.get("id", slug_dir.name),
            "client_dir": slug_dir,
            "espocrm":    data.get("espocrm"),
            "crm_id":     data.get("crm_id"),
        }
        for uid in uids:
            registry[uid] = meta
    return registry


def load_all_clients(days: int = 10) -> list[dict]:
    """
    Lädt Session-Daten für alle registrierten Klienten aus ~/Klienten/*/client.json.

    - Nur UIDs mit client.json-Eintrag werden geladen (keine anonymen UIDs).
    - Eigene UID (Coach) wird übersprungen.
    - Gibt Liste von Client-Dicts zurück, sortiert nach letzter Aktivität (neueste zuerst).

    Jedes Client-Dict enthält:
      uid, name, slug, espocrm, crm_id,
      sessions (letzte N Tage), last_date, total_count, has_data
    """
    registry = load_client_registry()
    cutoff   = (date.today() - timedelta(days=days)).isoformat()
    clients: list[dict] = []

    for uid, meta in registry.items():
        if uid == ACTIVE_UID:
            continue
        sdir = AOS_USERS / uid / "fitness" / "sessions"
        sessions: list[dict] = []
        all_dates: list[str] = []

        if sdir.exists():
            for f in sorted(sdir.glob("*.json"), reverse=True):
                d = parse_date_stem(f.stem)
                if not d:
                    continue
                all_dates.append(d)
                if d < cutoff:
                    continue
                try:
                    s = json.loads(f.read_text())
                    s.setdefault("date", d)
                    s["_uid"]  = uid
                    s["_stem"] = f.stem
                    sessions.append(s)
                except Exception:
                    pass

        all_dates.sort(reverse=True)
        sessions.sort(key=lambda s: (s["date"], s.get("_stem", "")), reverse=True)

        clients.append({
            "uid":         uid,
            "name":        meta["name"],
            "slug":        meta["slug"],
            "espocrm":     meta.get("espocrm"),
            "crm_id":      meta.get("crm_id"),
            "sessions":    sessions,
            "last_date":   all_dates[0] if all_dates else "—",
            "total_count": len(all_dates),
            "has_data":    sdir.exists(),
        })

    clients.sort(key=lambda c: c["last_date"], reverse=True)
    return clients


# ── Firestore Sync-Info ───────────────────────────────────────────────────────

def sync_info(uid: str | None = None) -> dict:
    """
    Liest den systemd-Status des Firestore-Mirror-Service und gibt
    einen Status-Dict zurück.
    """
    r = subprocess.run(
        ["systemctl", "--user", "show",
         "fitness-firestore-mirror.service",
         "--property=ActiveState,SubState,ExecMainStartTimestamp"],
        capture_output=True, text=True,
    )
    props = {
        k: v
        for line in r.stdout.strip().splitlines()
        if "=" in line
        for k, v in [line.split("=", 1)]
    }
    daemon    = subprocess.run(
        ["pgrep", "-fa", "mirror.py"], capture_output=True, text=True
    ).stdout.strip()

    sdir       = sessions_dir(uid)
    json_files = list(sdir.glob("*.json"))
    json_count = len(json_files)

    db = sqlite_db(uid)
    sqlite_n, sqlite_latest = 0, "?"
    if db.exists():
        try:
            con           = sqlite3.connect(str(db))
            sqlite_n      = con.execute("SELECT COUNT(*) FROM training_history").fetchone()[0]
            sqlite_latest = con.execute("SELECT MAX(date) FROM training_history").fetchone()[0] or "?"
            con.close()
        except Exception:
            pass

    newest = max(
        (parse_date_stem(f.stem) or "" for f in json_files),
        default="?",
    )
    try:
        newest_age: int | str = (date.today() - date.fromisoformat(newest)).days
    except Exception:
        newest_age = "?"

    return {
        "state":         props.get("ActiveState", "?"),
        "sub":           props.get("SubState", "?"),
        "last_run":      props.get("ExecMainStartTimestamp", "?"),
        "daemon_active": bool(daemon),
        "json_count":    json_count,
        "sqlite_n":      sqlite_n,
        "sqlite_latest": sqlite_latest,
        "newest":        newest,
        "newest_age":    newest_age,
        "sdir":          str(sdir),
    }
