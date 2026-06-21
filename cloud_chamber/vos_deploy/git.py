"""Git repo info."""

import subprocess
from pathlib import Path


def _run(cmd: list[str], cwd: str) -> str:
    try:
        r = subprocess.run(cmd, capture_output=True, text=True, cwd=cwd, timeout=5)
        return r.stdout.strip()
    except Exception:
        return ""


def info(repo: str) -> dict:
    branch  = _run(["git", "rev-parse", "--abbrev-ref", "HEAD"], repo)
    commit  = _run(["git", "log", "-1", "--format=%h %s"], repo)
    date    = _run(["git", "log", "-1", "--format=%ar"], repo)
    dirty   = bool(_run(["git", "status", "--porcelain"], repo))
    ahead   = _run(["git", "rev-list", "--count", "@{u}..HEAD"], repo)
    return {
        "branch": branch or "?",
        "commit": commit or "—",
        "date":   date or "?",
        "dirty":  dirty,
        "ahead":  int(ahead) if ahead.isdigit() else 0,
    }
