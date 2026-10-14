"""Strukturierte Sync-Logs (JSONL) lesen und filtern."""
from __future__ import annotations

import json
from collections import deque
from pathlib import Path
from typing import Any

LOG_NAME = "fitsync.jsonl"


def read_events(log_dir: Path, *, limit: int = 100, event: str | None = None, uid: str | None = None,
                action: str | None = None, level: str | None = None) -> list[dict[str, Any]]:
    path = log_dir / LOG_NAME
    if not path.is_file():
        return []
    out: deque[dict[str, Any]] = deque(maxlen=max(1, min(limit, 1000)))
    with path.open(encoding="utf-8") as fh:
        for line in fh:
            try:
                e = json.loads(line)
            except ValueError:
                continue
            if event and e.get("event") != event: continue
            if uid and e.get("uid") != uid: continue
            if action and e.get("action") != action: continue
            if level and e.get("level") != level.upper(): continue
            out.append(e)
    return list(out)
