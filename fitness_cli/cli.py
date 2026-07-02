"""
fitness — Domain CLI für alle Fitness-Subcommands.

  fitness agent <cmd>    catalog/fitness_agent CLI
  fitness kb    <cmd>    anatomy-kb kbctl (:9200)
  fitness mail  <cmd>    Fitbit Gmail Pipeline
  fitness log   <cmd>    Session-Log aus Dateien (kein Server)
  fitness tui            Textual TUI Dashboard
  fitness activity <cmd> Cardio/Activity loggen
  fitness sync  [what]   KB-Sync + Firestore-Sync
  fitness health         /health aller Services
  fitness status         systemd-Units Übersicht
  fitness coverage       Muskelabdeckung
  fitness gaps           Unterbeanspruchte Muskeln
  fitness search <q>     Übungssuche
  fitness session <sub>  Session queries (today|get|list)
  fitness journal <sub>  Journal queries (today|get|list)
  fitness push           Catalog → Firestore
  fitness pull [uid]     Sessions ← Firestore
  fitness watch          AI Enricher Watcher starten

Server/Service-Control → use: fitnessctl
"""
from __future__ import annotations

import json
import os
import shutil
import subprocess
import sys
import urllib.error
import urllib.parse
import urllib.request
from pathlib import Path
from typing import Optional

import typer

# ── Pfade ──────────────────────────────────────────────────────────────────────
FITNESS_DEV  = Path(__file__).resolve().parent.parent
CATALOG_DIR  = FITNESS_DEV / "catalog"

for _p in (str(FITNESS_DEV), str(CATALOG_DIR)):
    if _p not in sys.path:
        sys.path.insert(0, _p)
ANATOMY_KB   = FITNESS_DEV / "anatomy-kb"
KBCTL        = FITNESS_DEV / "anatomy-kb" / "kbctl"

DEV_PORT = int(os.environ.get("FITNESS_PORT", 9100))
KB_PORT  = int(os.environ.get("ANATOMY_KB_PORT", 9200))

# ── gum-Helpers ────────────────────────────────────────────────────────────────
def _has_gum() -> bool:
    return bool(shutil.which("gum"))

def gum_header(title: str) -> None:
    if _has_gum():
        subprocess.run(["gum", "style", "--foreground=212", "--bold", title])
    else:
        print(f"\n\033[1;35m{title}\033[0m")

def gum_table(header: list[str], rows: list[list[str]], widths: list[int]) -> None:
    lines = [",".join(header)] + [",".join(r) for r in rows]
    if _has_gum():
        subprocess.run(
            ["gum", "table", "--print", "--separator=,",
             f"--widths={','.join(map(str, widths))}"],
            input="\n".join(lines), text=True,
        )
    else:
        fmt = "  " + "  ".join(f"{{:<{w}}}" for w in widths)
        for line in lines:
            print(fmt.format(*line.split(",", len(widths) - 1)))

def gum_log(level: str, msg: str) -> None:
    if _has_gum():
        subprocess.run(["gum", "log", f"--level={level}", msg])
    else:
        colors = {"info": "\033[1;32m", "warn": "\033[1;33m", "error": "\033[1;31m"}
        dest = sys.stderr if level == "error" else sys.stdout
        print(f"{colors.get(level, '')}{msg}\033[0m", file=dest)

# ── Pass-through ───────────────────────────────────────────────────────────────
def passthrough(binary: Path | str, args: list[str], label: str) -> None:
    import shutil
    resolved = shutil.which(str(binary)) or (str(binary) if Path(str(binary)).exists() else None)
    if not resolved:
        gum_log("error", f"{label} nicht gefunden")
        raise SystemExit(1)
    os.execv(resolved, [resolved] + args)

# ── Systemd-Helpers ────────────────────────────────────────────────────────────
def systemctl(*args: str) -> subprocess.CompletedProcess:
    return subprocess.run(["systemctl", "--user", *args], capture_output=True, text=True)

def unit_active(unit: str) -> str:
    return systemctl("is-active", unit).stdout.strip() or "unknown"

# ── Health ─────────────────────────────────────────────────────────────────────
SERVICES = [
    (DEV_PORT, "fitness-dev (Node)", "aos-fitness-dev.service"),
    (KB_PORT,  "anatomy-kb (aiohttp)", None),
]

def _ping(port: int) -> str:
    try:
        with urllib.request.urlopen(f"http://127.0.0.1:{port}/health", timeout=3) as r:
            json.loads(r.read())
        return "ok"
    except Exception:
        return "down"

def cmd_health() -> None:
    rows, fail = [], False
    for port, label, unit in SERVICES:
        status = _ping(port)
        unit_state = unit_active(unit) if unit else "—"
        rows.append([str(port), label, status, unit_state])
        if status == "down":
            fail = True
    gum_header("fitness — health")
    gum_table(["PORT", "SERVICE", "HTTP", "SYSTEMD"], rows, [6, 26, 6, 12])
    if fail:
        raise SystemExit(1)

def cmd_status() -> None:
    units = [
        ("aos-fitness-dev.service",          "DEV Node :9100"),
        ("fitness-firestore-mirror.service", "Firestore Mirror"),
        ("fitness-mail.timer",               "Fitbit Mail Timer"),
    ]
    rows = []
    for unit, label in units:
        active = unit_active(unit)
        rows.append([label, unit, active])
    gum_header("fitness — systemd")
    gum_table(["SERVICE", "UNIT", "STATUS"], rows, [28, 36, 10])

# ── Sync ───────────────────────────────────────────────────────────────────────
def cmd_sync(what: str) -> None:
    run_kb = what in ("kb", "all", "")
    run_fs = what in ("firestore", "fs", "all", "")

    if run_kb:
        gum_log("info", "KB-Sync: anatomy-kb → catalog/kb/anatomy_teaching/")
        kb_sync = FITNESS_DEV / "catalog" / "fitness_agent" / "kb_sync.py"
        if kb_sync.exists():
            r = subprocess.run(
                [sys.executable, "-m", "catalog.fitness_agent", "kb-sync"],
                cwd=FITNESS_DEV,
            )
            if r.returncode != 0:
                gum_log("warn", "KB-Sync mit Fehler abgeschlossen")
        else:
            gum_log("warn", f"kb_sync nicht gefunden: {kb_sync}")

    if run_fs:
        gum_log("info", "Firestore-Sync: catalog → Firestore")
        import shutil
        fs_sync = shutil.which("firestore-sync")
        if fs_sync:
            subprocess.run([fs_sync])
        else:
            gum_log("warn", "firestore-sync nicht gefunden")

# ── Typer App ──────────────────────────────────────────────────────────────────
_ctx = {"allow_extra_args": True, "ignore_unknown_options": True}

app = typer.Typer(
    name="fitness",
    help=__doc__,
    invoke_without_command=True,
    no_args_is_help=True,
)

@app.command(context_settings=_ctx, help="catalog/fitness_agent CLI (audit|teach|resolve|log|history|report|plan|tui)")
def agent(ctx: typer.Context) -> None:
    passthrough(Path("fitness-agent"), ctx.args, "fitness-agent")

@app.command(context_settings=_ctx, help="anatomy-kb kbctl :9200 (start|stop|status|health|logs|list|resolve)")
def kb(ctx: typer.Context) -> None:
    passthrough(KBCTL, ctx.args, "kbctl")

@app.command(context_settings=_ctx, help="Fitbit Gmail Pipeline (poll|parse|show)")
def mail(ctx: typer.Context) -> None:
    passthrough("fitness-mail", ctx.args, "fitness-mail")

@app.command(context_settings=_ctx, help="Session-Log direkt aus Dateien (ls|show|week|history|stats|sync-status) — kein Server nötig")
def log(ctx: typer.Context) -> None:
    passthrough("fitness-log", ctx.args, "fitness-log")

@app.command(context_settings=_ctx, help="Rich TUI Dashboard (Live-Ansicht, kein Server) — [--once|--days N|--refresh N]")
def tui(ctx: typer.Context) -> None:
    passthrough("fitness-tui", ctx.args, "fitness-tui")

@app.command(context_settings=_ctx, help="Cardio/Activity loggen (log|types|whoami) — z.B. fitness activity log swimming -d 20 -s breast")
def activity(ctx: typer.Context) -> None:
    passthrough("fitness-activity", ctx.args, "fitness-activity")

@app.command(help="Health-Check: fitness-dev :9100 + anatomy-kb :9200")
def health() -> None:
    cmd_health()

@app.command(help="systemd-Units Übersicht")
def status() -> None:
    cmd_status()

@app.command(help="KB-Sync + Firestore-Sync  [kb|firestore|all]")
def sync(
    what: str = typer.Argument("all", help="kb | firestore | all"),
) -> None:
    cmd_sync(what)

# ── Backend helpers (direct first, HTTP fallback) ─────────────────────────────

def _sessions_dir() -> Path:
    from fitness_cli.paths import sessions_dir
    return sessions_dir()

def _journal_dir() -> Path:
    from fitness_cli.paths import sessions_dir
    base = sessions_dir().parent
    return base / "journal"

def _try_http(fn_name: str, *args, **kwargs):
    """HTTP-Fallback via fitness_cli.http."""
    from fitness_cli.http import api_get  # noqa: F401 (triggers import check)
    import fitness_cli.http as _http
    return getattr(_http, fn_name)(*args, **kwargs)

# ── Domain Commands ────────────────────────────────────────────────────────────

@app.command()
def coverage(days: int = typer.Option(7, "-d", help="Tage zurückblicken")) -> None:
    """Muskelabdeckung der letzten N Tage (direkt via fitness_agent, HTTP-Fallback)."""
    try:
        from fitness_agent.coverage import get_coverage_summary
        data = get_coverage_summary(days=days)
        for g in data.get("groups", []):
            score = sum(m["totalScore"] for m in g["muscles"])
            bar = "█" * int(score * 2)
            print(f"  {g['id']:12s} {score:5.1f}  {bar}")
    except Exception:
        data = _try_http("coverage", days)
        for g in data.get("groups", []):
            score = sum(m["totalScore"] for m in g["muscles"])
            bar = "█" * int(score * 2)
            print(f"  {g['id']:12s} {score:5.1f}  {bar}")


@app.command()
def gaps(days: int = typer.Option(7, "-d", help="Tage zurückblicken")) -> None:
    """Unterbeanspruchte Muskeln (direkt via fitness_agent, HTTP-Fallback)."""
    try:
        from fitness_agent.coverage import get_coverage_gaps
        result = get_coverage_gaps(days=days).get("gaps", [])
    except Exception:
        result = _try_http("gaps", days).get("gaps", [])
    if not result:
        gum_log("info", "Keine Gaps")
    else:
        for g in result:
            print(f"  {g['name']:14s} ({g['hits']} hits)")


@app.command()
def search(query: str = typer.Argument(..., help="Suchbegriff")) -> None:
    """Übungssuche (direkt via fitness_agent Resolver, HTTP-Fallback)."""
    try:
        from fitness_agent.resolver import search_exercises
        results = search_exercises(query)
    except Exception:
        results = _try_http("search", query).get("results", [])
    for r in results:
        muscles = " ".join(r.get("primaryMuscles", []))
        print(f"  {r['name']:30s} {muscles}")


@app.command()
def push(dry_run: bool = typer.Option(False, "--dry-run")) -> None:
    """Catalog → Firestore pushen."""
    args = [sys.executable, "-m", "fitness_agent", "push"]
    if dry_run:
        args.append("--dry-run")
    env = {**os.environ, "PYTHONPATH": str(CATALOG_DIR)}
    try:
        subprocess.run(
            ["gum", "spin", "--spinner", "dot",
             f"--title=Pushing catalog → Firestore{'  (dry-run)' if dry_run else ''}...",
             "--"] + args,
            cwd=FITNESS_DEV, env=env,
        )
    except FileNotFoundError:
        subprocess.run(args, cwd=FITNESS_DEV, env=env)


@app.command()
def pull(uid: Optional[str] = typer.Argument(None, help="Firestore UID (auto-detect wenn leer)")) -> None:
    """Sessions ← Firestore pullen."""
    if not uid:
        uid = os.getenv("FITNESS_UID")
    if not uid:
        base = Path.home() / ".aos" / "fitness" / "users"
        best, best_n = None, -1
        for d in base.glob("*/sessions/"):
            name = d.parent.name
            if name in ("default", "kb"):
                continue
            n = len(list(d.glob("*.json")))
            if n > best_n:
                best, best_n = name, n
        uid = best
    if not uid:
        gum_log("error", "Keine uid — FITNESS_UID setzen oder als Argument übergeben")
        raise SystemExit(1)
    gum_log("info", f"Pull ← Firestore (uid={uid})...")
    out = Path("/tmp/fitness-pull.json")
    r = subprocess.run([
        "curl", "-fsS", "--max-time", "30", "-X", "POST",
        f"http://127.0.0.1:{DEV_PORT}/firestore/pull",
        "-H", f"X-User-UID: {uid}", "-o", str(out),
    ])
    if r.returncode != 0:
        gum_log("error", "Pull request fehlgeschlagen")
        raise SystemExit(1)
    result = json.loads(out.read_text())
    if not result.get("ok"):
        gum_log("error", result.get("error", "unknown"))
        raise SystemExit(1)
    gum_log("info", f"pulled {result['pulled']} · skipped {result['skipped']} · conflicts {result['conflicts']}")
    if result.get("conflict_dates"):
        gum_log("warn", f"Konflikte: {', '.join(result['conflict_dates'])}")


@app.command()
def watch() -> None:
    """AI Enricher Watcher im Hintergrund starten."""
    pidfile = Path("/tmp/fitness-enricher.pid")
    logfile = Path("/tmp/fitness-enricher.log")
    if pidfile.exists():
        try:
            pid = int(pidfile.read_text().strip())
            os.kill(pid, 0)
            gum_log("warn", f"Watcher läuft bereits (PID {pid})")
            return
        except (ProcessLookupError, ValueError):
            pidfile.unlink(missing_ok=True)
    proc = subprocess.Popen(
        [sys.executable, "-m", "fitness_agent", "watch"],
        cwd=FITNESS_DEV,
        env={**os.environ, "PYTHONPATH": str(CATALOG_DIR)},
        stdout=open(logfile, "a"),
        stderr=subprocess.STDOUT,
        start_new_session=True,
    )
    pidfile.write_text(str(proc.pid))
    gum_log("info", f"Watcher gestartet (PID {proc.pid}, log: {logfile})")


# Session sub-app
session_app = typer.Typer(help="Session queries (today | get DATE | list)")
app.add_typer(session_app, name="session")

def _read_session(date_str: str) -> dict:
    f = _sessions_dir() / f"{date_str}.json"
    if f.exists():
        return json.loads(f.read_text())
    return _try_http("session_get", date_str)

@session_app.command("today")
def session_today() -> None:
    """Heutige Session direkt aus Datei."""
    from datetime import date
    print(json.dumps(_read_session(str(date.today())), indent=2, ensure_ascii=False))

@session_app.command("get")
def session_get(date: str = typer.Argument(..., help="YYYY-MM-DD")) -> None:
    """Session für ein Datum direkt aus Datei."""
    print(json.dumps(_read_session(date), indent=2, ensure_ascii=False))

@session_app.command("list")
def session_list(limit: int = typer.Option(10, "-n")) -> None:
    """Letzte N Sessions direkt aus Dateien."""
    files = sorted(_sessions_dir().glob("*.json"), reverse=True)[:limit]
    sessions = [json.loads(f.read_text()) for f in files] if files else _try_http("session_list", limit)
    print(json.dumps(sessions, indent=2, ensure_ascii=False))


# Journal sub-app
journal_app = typer.Typer(help="Journal queries (today | get DATE | list)")
app.add_typer(journal_app, name="journal")

def _read_journal(date_str: str) -> dict:
    f = _journal_dir() / f"{date_str}.md"
    if f.exists():
        return {"date": date_str, "content": f.read_text()}
    return _try_http("journal_get", date_str)

@journal_app.command("today")
def journal_today() -> None:
    """Heutiger Journal-Eintrag direkt aus Datei."""
    from datetime import date
    data = _read_journal(str(date.today()))
    print(data.get("content", json.dumps(data, indent=2, ensure_ascii=False)))

@journal_app.command("get")
def journal_get(date: str = typer.Argument(..., help="YYYY-MM-DD")) -> None:
    """Journal-Eintrag für ein Datum direkt aus Datei."""
    data = _read_journal(date)
    print(data.get("content", json.dumps(data, indent=2, ensure_ascii=False)))

@journal_app.command("list")
def journal_list() -> None:
    """Journal-Einträge aus Dateien auflisten."""
    files = sorted(_journal_dir().glob("*.md"), reverse=True)
    if files:
        for f in files:
            print(f"  {f.stem}")
    else:
        print(json.dumps(_try_http("journal_list"), indent=2, ensure_ascii=False))


# Catalog sub-app
catalog_app = typer.Typer(help="Catalog management (tui | inbox | sync | audit)")
app.add_typer(catalog_app, name="catalog")

@catalog_app.command("tui")
def catalog_tui() -> None:
    """Catalog TUI öffnen."""
    subprocess.run([sys.executable, "-m", "fitness_agent", "tui"],
                   cwd=FITNESS_DEV, env={**os.environ, "PYTHONPATH": str(CATALOG_DIR)})

@catalog_app.command("inbox")
def catalog_inbox() -> None:
    """Catalog Inbox öffnen."""
    subprocess.run([sys.executable, "-m", "fitness_agent", "tui", "--screen", "inbox"],
                   cwd=FITNESS_DEV, env={**os.environ, "PYTHONPATH": str(CATALOG_DIR)})

@catalog_app.command("sync")
def catalog_sync() -> None:
    """Catalog → Firestore (alias für push)."""
    subprocess.run([sys.executable, "-m", "fitness_agent", "push"],
                   cwd=FITNESS_DEV, env={**os.environ, "PYTHONPATH": str(CATALOG_DIR)})

@catalog_app.command("audit")
def catalog_audit(topic: str = typer.Argument("all")) -> None:
    """Catalog-Qualität prüfen."""
    subprocess.run([sys.executable, "-m", "fitness_agent", "audit", topic],
                   cwd=FITNESS_DEV, env={**os.environ, "PYTHONPATH": str(CATALOG_DIR)})


# ── Entry ──────────────────────────────────────────────────────────────────────
if __name__ == "__main__":
    app()


def main() -> None:
    app()
