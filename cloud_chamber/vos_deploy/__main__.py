"""VOS Deploy Dashboard — python -m cloud_chamber.vos_deploy"""

import subprocess
import sys
from concurrent.futures import ThreadPoolExecutor, as_completed
from datetime import datetime, timezone
from pathlib import Path

import typer

from .firebase import last_release, deploy
from .git import info as git_info
from .sites import SITES

app = typer.Typer(add_completion=False, help="VOS Deploy Dashboard")

REPO_ROOT    = Path(__file__).parent.parent.parent.resolve()
VITALOS_DIR  = REPO_ROOT / "cloud_chamber" / "vitalos"

# ── gum helpers ──────────────────────────────────────────────────────────────

def have_gum() -> bool:
    import shutil
    return shutil.which("gum") is not None


def gum(*args: str, **kw) -> subprocess.CompletedProcess:
    return subprocess.run(["gum"] + list(args), **kw)


def log(level: str, msg: str):
    if have_gum():
        gum("log", f"--level={level}", msg)
    else:
        print(f"[{level}] {msg}")


def _age(dt: datetime | None) -> str:
    if not dt:
        return "never"
    now = datetime.now(timezone.utc)
    diff = now - dt
    s = int(diff.total_seconds())
    if s < 60:        return f"{s}s ago"
    if s < 3600:      return f"{s // 60}m ago"
    if s < 86400:     return f"{s // 3600}h ago"
    return f"{s // 86400}d ago"


def _table_rows(releases: dict[str, dict | None]) -> list[str]:
    rows = ["SITE\tLABEL\tLAST DEPLOY\tVERSION\tUSER"]
    for site in SITES:
        r = releases.get(site["id"])
        age     = _age(r["time"]) if r else "—"
        version = r["version"]    if r else "—"
        user    = (r["user"] or "—").split("@")[0] if r else "—"
        rows.append(f'{site["id"]}\t{site["label"]}\t{age}\t{version}\t{user}')
    return rows


# ── commands ─────────────────────────────────────────────────────────────────

@app.command("status")
def cmd_status():
    """Show deploy status for all VOS sites."""
    log("info", "Fetching release info…")

    with ThreadPoolExecutor(max_workers=6) as ex:
        futures = {ex.submit(last_release, s["id"]): s["id"] for s in SITES}
        releases = {}
        for f in as_completed(futures):
            releases[futures[f]] = f.result()

    rows = _table_rows(releases)

    if have_gum():
        gum("style", "--bold", "--foreground=99", "VOS Deploy Dashboard")
        proc = subprocess.Popen(
            ["gum", "table", "--print", '--separator=\t', f"--columns=SITE,LABEL,LAST DEPLOY,VERSION,USER"],
            stdin=subprocess.PIPE, text=True,
        )
        proc.communicate("\n".join(rows[1:]))  # skip header row (passed via --columns)
    else:
        for row in rows:
            print(row.expandtabs(20))

    # git info
    g = git_info(str(REPO_ROOT))
    dirty_flag = " (dirty)" if g["dirty"] else ""
    ahead_flag = f" +{g['ahead']} unpushed" if g["ahead"] else ""
    print()
    if have_gum():
        gum("style", "--faint", f"git: {g['branch']}{dirty_flag}{ahead_flag}  ·  {g['commit']}  ·  {g['date']}")
    else:
        print(f"git: {g['branch']}{dirty_flag}{ahead_flag}  ·  {g['commit']}  ·  {g['date']}")


@app.command("deploy")
def cmd_deploy(
    target: str = typer.Argument(None, help="shell | fitness | fuel | journal | learn | all"),
):
    """Build and deploy a VOS site (or all)."""
    targets = [s["deploy"] for s in SITES if s["deploy"]] if target == "all" else [target]

    if target is None or target not in ([s["deploy"] for s in SITES if s["deploy"]] + ["all"]):
        choices = [s["deploy"] for s in SITES if s["deploy"]] + ["all"]
        if have_gum():
            result = gum("choose", *choices, capture_output=True, text=True)
            if result.returncode != 0:
                raise typer.Exit()
            targets = [result.stdout.strip()]
        else:
            print("Available:", ", ".join(choices))
            raise typer.Exit(1)

    for t in targets:
        if have_gum():
            gum("log", "--level=info", f"Deploying {t}…")
        else:
            print(f"→ deploy:{t}")
        code = deploy(t, str(VITALOS_DIR))
        if code != 0:
            log("error", f"deploy:{t} failed (exit {code})")
            raise typer.Exit(code)
        log("info", f"deploy:{t} done ✓")


@app.command("releases")
def cmd_releases(site: str = typer.Argument(..., help="Firebase site ID")):
    """Show recent releases for a specific site."""
    from .firebase import _get
    data = _get(
        f"https://firebasehosting.googleapis.com/v1beta1/sites/{site}/releases?pageSize=5"
    )
    if not data:
        print("Could not fetch releases (auth error?).")
        return
    releases = data.get("releases", [])
    if not releases:
        print("No releases found.")
        return
    for r in releases:
        ts   = r.get("releaseTime", "")[:19]
        user = (r.get("releaseUser", {}).get("email", "?") or "?").split("@")[0]
        typ  = r.get("type", "")
        ver  = r.get("version", {}).get("name", "")[-12:]
        print(f"{ts}  {typ:<12}  {user:<28}  {ver}")


@app.command("git")
def cmd_git():
    """Show git status of the fitness-dev repo."""
    g = git_info(str(REPO_ROOT))
    print(f"Branch : {g['branch']}")
    print(f"Commit : {g['commit']}")
    print(f"When   : {g['date']}")
    print(f"Dirty  : {'yes' if g['dirty'] else 'no'}")
    print(f"Ahead  : {g['ahead']} commit(s)")


if __name__ == "__main__":
    app()
