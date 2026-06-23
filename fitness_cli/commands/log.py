"""
fitness_cli.commands.log — Typer CLI App (fitness log).

Direkter Dateizugriff auf Session-JSONs — kein Server nötig.

Subcommands:
  ls [--days N]         Sessions der letzten N Tage auflisten
  show [DATE]           Detail-Ansicht (heute / gestern / YYYY-MM-DD)
  week                  7-Tage Wochenübersicht
  history ÜBUNG         Set-Verlauf aus SQLite
  stats [--days N]      Aggregate (Split, Cardio, Muskel-Coverage)
  sync-status           Firestore ↔ lokal Sync-Status + Klienten-Registry
"""
from __future__ import annotations

import json
from datetime import date, datetime, timedelta
from pathlib import Path
from typing import Optional

import typer

from ..constants import ACTIVITY_EMOJI, ACTIVITY_LABEL, WEEKDAYS_DE, block_ansi_color
from ..data import (
    classify,
    load_client_registry,
    load_sessions,
    load_sessions_for_date,
    sqlite_exercise_history,
    sync_info,
)
from ..paths import AOS_USERS, KLIENTEN_DIR, KLIENTEN_SKIP, sessions_dir, sqlite_db
from ..render import c, fmt_date, gum_table, header, one_line, render_detail

app = typer.Typer(
    name="fitness-log",
    help=__doc__,
    no_args_is_help=True,
    add_completion=False,
)


# ── ls ────────────────────────────────────────────────────────────────────────

@app.command(name="ls", help="Sessions der letzten N Tage auflisten")
def cmd_ls(
    days: int  = typer.Option(14, "--days", "-d", help="Anzahl Tage"),
    all_: bool = typer.Option(False, "--all", "-a", help="Alle gespeicherten Sessions"),
) -> None:
    n = 9999 if all_ else days
    sessions = load_sessions(n)
    if not sessions:
        print(c("muted", "  Keine Sessions gefunden."))
        raise typer.Exit()

    sdir = sessions_dir()
    header(f"Sessions — {'alle' if all_ else f'letzte {n} Tage'}  ({len(sessions)} Einträge)")
    print(c("dim", f"  Quelle: {sdir}\n"))
    for s in sessions:
        print(one_line(s))
    print()


# ── show ──────────────────────────────────────────────────────────────────────

@app.command(name="show", help="Detail-Ansicht einer Session")
def cmd_show(
    date_arg: Optional[str] = typer.Argument(
        None, help="YYYY-MM-DD | heute | gestern"
    ),
) -> None:
    today_s = date.today().isoformat()
    yest_s  = (date.today() - timedelta(days=1)).isoformat()

    if not date_arg or date_arg in ("heute", "today"):
        target = today_s
    elif date_arg in ("gestern", "yesterday"):
        target = yest_s
    else:
        target = date_arg

    sessions = load_sessions_for_date(target)
    if not sessions:
        print(c("red", f"  Keine Session für {target} gefunden."))
        raise typer.Exit(1)

    if len(sessions) > 1:
        print(c("accent", f"  {len(sessions)} Sessions am {target}:\n"))
    for s in sessions:
        render_detail(s)


# ── week ──────────────────────────────────────────────────────────────────────

@app.command(name="week", help="Wochenübersicht letzte 7 Tage")
def cmd_week() -> None:
    all_sessions = load_sessions(7)
    by_date: dict[str, list[dict]] = {}
    for s in all_sessions:
        by_date.setdefault(s["date"], []).append(s)

    header("Woche — letzte 7 Tage")
    today = date.today()
    strength_count = cardio_count = total_ex = cardio_min = 0

    for i in range(6, -1, -1):
        d       = (today - timedelta(days=i)).isoformat()
        weekday = datetime.strptime(d, "%Y-%m-%d").strftime("%a %d.%m")
        day_s   = by_date.get(d, [])

        if not day_s:
            print(f"  {c('muted', weekday)}  {c('dim', '·  Ruhetag')}")
            continue

        parts = []
        for s in day_s:
            kind  = classify(s)
            act   = s.get("activity") or {}
            exs   = [e for e in (s.get("exercises") or []) if e.get("done")]
            block = s.get("block", "")

            if kind == "cardio":
                atype = act.get("type", "?")
                emoji = ACTIVITY_EMOJI.get(atype, "🏃")
                label = ACTIVITY_LABEL.get(atype, atype)
                adur  = act.get("duration", "")
                try:
                    cardio_min += int(adur or 0)
                except (ValueError, TypeError):
                    pass
                cardio_count += 1
                parts.append(
                    f"{emoji} {c('orange', label)}"
                    + (f" {c('muted', str(adur) + 'min')}" if adur else "")
                )
            else:
                bc = block_ansi_color(block)
                strength_count += 1
                total_ex += len(exs)
                addon = ""
                if kind == "strength+addon":
                    atype = act.get("type", "?")
                    emoji = ACTIVITY_EMOJI.get(atype, "⚡")
                    addon = f" {c('orange', emoji)}"
                exnames  = ", ".join(e.get("name", "?") for e in exs[:3])
                ellipsis = "…" if len(exs) > 3 else ""
                parts.append(
                    f"{c(bc, '●')} {c('bold', block or '?')}"
                    f"  {c('muted', exnames + ellipsis)}{addon}"
                )

        print(f"  {c('muted', weekday)}  " + f"  {c('dim', '│')}  ".join(parts))

    print()
    print(
        f"  {c('muted', 'Kraft:')} {c('white', str(strength_count) + 'x')}"
        f"  {c('muted', 'Übungen:')} {c('white', str(total_ex))}"
        f"  {c('muted', 'Ausdauer:')} {c('orange', str(cardio_count) + 'x')}"
        + (f"  {c('muted', str(cardio_min) + 'min')}" if cardio_min else "")
    )
    print()


# ── history ───────────────────────────────────────────────────────────────────

@app.command(name="history", help="Übungs-Verlauf aus SQLite")
def cmd_history(
    exercise: str = typer.Argument(..., help="Name oder ID (Substring-Suche)"),
    limit: int    = typer.Option(10, "--limit", "-n", help="Max. Einträge"),
) -> None:
    if not sqlite_db().exists():
        print(c("red", "  training_history.sqlite nicht gefunden."))
        raise typer.Exit(1)

    rows = sqlite_exercise_history(exercise, limit)
    if not rows:
        print(c("muted", f"  Keine Daten für '{exercise}'."))
        raise typer.Exit()

    header(f"Verlauf — {rows[0]['display_name']}")
    table_rows = []
    for r in rows:
        w = f"{r['weight']:.1f}kg" if r["weight"] else "—"
        table_rows.append([
            r["date"],
            str(r["sets"] or "—"),
            str(r["reps"] or "—"),
            w,
            str(r["rpe"] or "—"),
            (r["notes"] or "")[:30],
        ])
    gum_table(
        ["Datum", "Sets", "Wdh", "Gewicht", "RPE", "Notiz"],
        table_rows,
        [12, 5, 5, 10, 5, 32],
    )
    print()


# ── stats ─────────────────────────────────────────────────────────────────────

@app.command(name="stats", help="Aggregate-Statistiken")
def cmd_stats(
    days: int = typer.Option(28, "--days", "-d", help="Zeitraum in Tagen"),
) -> None:
    sessions = load_sessions(days)
    if not sessions:
        print(c("muted", "  Keine Sessions."))
        raise typer.Exit()

    header(f"Stats — letzte {days} Tage  ({len(sessions)} Sessions)")

    strength = [s for s in sessions if classify(s) != "cardio"]
    cardio   = [s for s in sessions if classify(s) == "cardio"]
    total_ex = sum(
        len([e for e in (s.get("exercises") or []) if e.get("done")])
        for s in strength
    )
    cardio_min = 0
    for s in cardio:
        try:
            cardio_min += int((s.get("activity") or {}).get("duration") or 0)
        except (ValueError, TypeError):
            pass

    block_dist: dict[str, int] = {}
    muscle_freq: dict[str, int] = {}
    for s in strength:
        bl = (s.get("block") or "?").strip()
        block_dist[bl] = block_dist.get(bl, 0) + 1
        for ex in (s.get("exercises") or []):
            if ex.get("done"):
                for m in (ex.get("primaryMuscles") or []):
                    muscle_freq[m] = muscle_freq.get(m, 0) + 1

    cardio_dist: dict[str, int] = {}
    for s in cardio:
        atype = (s.get("activity") or {}).get("type", "?")
        cardio_dist[atype] = cardio_dist.get(atype, 0) + 1

    print(f"\n  {c('bold', 'Sessions')}")
    print(
        f"  Kraft:    {c('accent', str(len(strength)) + 'x')}"
        f"  ·  {c('muted', str(total_ex) + ' Übungen gesamt')}"
    )
    print(
        f"  Ausdauer: {c('orange', str(len(cardio)) + 'x')}"
        + (f"  ·  {c('muted', str(cardio_min) + ' min gesamt')}" if cardio_min else "")
    )

    if block_dist:
        print(f"\n  {c('bold', 'Split')}")
        max_cnt = max(block_dist.values())
        for bl, cnt in sorted(block_dist.items(), key=lambda x: -x[1]):
            bc  = block_ansi_color(bl)
            bar = c(bc, "█" * cnt) + c("dim", "░" * max(0, max_cnt - cnt))
            print(f"  {c(bc, f'{bl:<12}')}  {bar}  {c('muted', str(cnt) + 'x')}")

    if cardio_dist:
        print(f"\n  {c('bold', 'Ausdauer')}")
        for atype, cnt in sorted(cardio_dist.items(), key=lambda x: -x[1]):
            emoji = ACTIVITY_EMOJI.get(atype, "🏃")
            label = ACTIVITY_LABEL.get(atype, atype)
            print(f"  {emoji} {c('orange', f'{label:<14}')} {c('muted', str(cnt) + 'x')}")

    if muscle_freq:
        print(f"\n  {c('bold', 'Muskel-Coverage')}")
        for m, cnt in sorted(muscle_freq.items(), key=lambda x: -x[1])[:8]:
            bar = c("accent", "█" * min(cnt, 10)) + c("dim", "░" * max(0, 10 - cnt))
            print(f"  {c('white', f'{m:<14}')}  {bar}  {c('muted', str(cnt) + 'x')}")
    print()


# ── sync-status ───────────────────────────────────────────────────────────────

@app.command(name="sync-status", help="Firestore ↔ lokal Sync-Status + Klienten-Registry")
def cmd_sync_status() -> None:
    header("Firestore ↔ Lokal Sync")
    info = sync_info()

    state_c = "green" if info["state"] == "active" else "red"
    print(f"\n  {c('muted', 'Service:')}  {c(state_c, info['state'] + ' (' + info['sub'] + ')')}")
    print(f"  {c('muted', 'Letzter Run:')} {c('white', info['last_run'])}")

    print(f"\n  {c('muted', 'Sessions-Pfad:')} {c('white', info['sdir'])}")
    print(f"  {c('muted', 'JSON-Dateien:')}  {c('accent', str(info['json_count']))}")
    print(
        f"  {c('muted', 'SQLite Sets:')}   {c('accent', str(info['sqlite_n']))}"
        f"  {c('dim', '(latest: ' + str(info['sqlite_latest']) + ')')}"
    )

    newest = info["newest"]
    age    = info["newest_age"]
    if newest and newest != "?":
        age_c = "green" if isinstance(age, int) and age < 2 \
            else "yellow" if isinstance(age, int) and age < 7 else "red"
        print(
            f"  {c('muted', 'Neueste Session:')} {c(age_c, newest)}"
            f"  {c('dim', str(age) + ' Tage alt')}"
        )

    if info["daemon_active"]:
        print(f"\n  {c('green', '● Mirror-Daemon läuft')}")
    else:
        print(f"\n  {c('yellow', '○ Mirror-Daemon nicht aktiv')}  {c('dim', '(boot-only one-shot)')}")

    print(f"\n  {c('dim', '→ fitness sync  zum manuellen Pull/Push')}")

    # ── Klienten-Registry ─────────────────────────────────────────────────────
    registry = load_client_registry()
    if registry:
        print(f"\n  {c('bold', 'Klienten-Registry')}  {c('muted', str(KLIENTEN_DIR))}")
        for uid, meta in registry.items():
            sdir = AOS_USERS / uid / "fitness" / "sessions"
            if sdir.exists():
                files  = list(sdir.glob("*.json"))
                n      = len(files)
                dates  = sorted((f.stem[:10] for f in files if len(f.stem) >= 10), reverse=True)
                newest = dates[0] if dates else "—"
                try:
                    from datetime import date as _date
                    age   = (_date.today() - _date.fromisoformat(newest)).days
                    age_c = "green" if age < 3 else "yellow" if age < 7 else "red"
                    age_s = c(age_c, newest) + c("dim", f" ({age}d)")
                except Exception:
                    age_s = c("muted", newest)
                sync_s = c("green", f"✓ {n} Sessions") + "  " + age_s
            else:
                sync_s = c("yellow", "○ kein lokaler Sync")
            name_col = c("white", f"{meta['name']:<18}")
            print(
                f"  {name_col}"
                f" {c('muted', uid[:12] + '…')}  {sync_s}"
            )
    print()


# ── clients ───────────────────────────────────────────────────────────────────

@app.command(name="clients", help="Alle Klienten-Sessions chronologisch ausgeben")
def cmd_clients(
    days: int  = typer.Option(90,  "--days", "-d", help="Fenster in Tagen (0 = alle)"),
    all_: bool = typer.Option(False, "--all", "-a",  help="Gesamtes Archiv (ignoriert --days)"),
) -> None:
    registry = load_client_registry()
    if not registry:
        print(c("yellow", "  Keine Klienten in ~/Klienten/ gefunden."))
        raise typer.Exit()

    from ..paths import ACTIVE_UID
    n_days = 9999 if all_ else days
    cutoff = (date.today() - timedelta(days=n_days)).isoformat() if n_days < 9999 else "0000-00-00"

    for uid, meta in registry.items():
        name = meta["name"]
        sdir = AOS_USERS / uid / "fitness" / "sessions"

        print(f"\n{c('bold', '── ' + name + ' ' + '─' * max(0, 40 - len(name)))}")
        print(c("muted", f"   uid: {uid[:16]}…   path: {sdir}"))

        if not sdir.exists() or not list(sdir.glob("*.json")):
            print(f"   {c('yellow', '○ Kein lokaler Sync — Firestore-Pull nötig')}")
            continue

        files = sorted(sdir.glob("*.json"), reverse=True)
        shown = 0
        for f in files:
            d = f.stem[:10]
            if len(d) < 10 or d < cutoff:
                continue
            try:
                s = json.loads(f.read_text())
            except Exception:
                continue
            s.setdefault("date", d)
            s["_stem"] = f.stem

            kind  = classify(s)
            act   = s.get("activity") or {}
            exs   = [e for e in (s.get("exercises") or []) if e.get("done")]
            block = s.get("block", "")
            eff   = s.get("effort")

            date_s = c("dim", datetime.strptime(d, "%Y-%m-%d").strftime("%a %d.%m.%y"))
            if kind == "cardio":
                atype = act.get("type", "?")
                adur  = act.get("duration", "")
                emoji = ACTIVITY_EMOJI.get(atype, "🏃")
                label = ACTIVITY_LABEL.get(atype, atype)
                dur_s = c("dim", f"{adur}min") if adur else ""
                print(f"   {date_s}   {emoji} {c('orange', label)}  {dur_s}")
            else:
                bc    = block_ansi_color(block)
                names = ", ".join(e.get("name", "?") for e in exs[:4])
                ell   = "…" if len(exs) > 4 else ""
                eff_s = c("yellow", f"RPE {eff}") if eff else ""
                addon = ""
                if kind == "strength+addon":
                    atype = act.get("type", "?")
                    adur  = act.get("duration", "")
                    addon = f"  {ACTIVITY_EMOJI.get(atype, '⚡')}{c('dim', '+' + str(adur) + 'min') if adur else ''}"
                print(f"   {date_s}   {c(bc, '[' + (block or '?') + ']')}  "
                      f"{c('dim', names + ell)}  {eff_s}{addon}")
            shown += 1

        if shown == 0:
            window = f"letzten {n_days}d" if n_days < 9999 else "gesamt"
            print(f"   {c('dim', 'Keine Sessions im Fenster (' + window + ')')}")

    print()


# ── Entry-Point ───────────────────────────────────────────────────────────────

def main() -> None:
    app()


if __name__ == "__main__":
    main()
