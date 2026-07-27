"""
fitness.render — ANSI/gum Render-Helfer für das CLI (fitness-log).

Kein Rich/Textual — reines ANSI für schnelle Terminal-Ausgaben.
"""
from __future__ import annotations

import subprocess
from datetime import date, datetime, timedelta

from .constants import ACTIVITY_EMOJI, ACTIVITY_LABEL, block_ansi_color
from .data import classify, performed_exercises
from .commands import muscle_to_group, muscle_group_label

# ── ANSI-Farbpalette ──────────────────────────────────────────────────────────
_C: dict[str, str] = {
    "reset":  "\033[0m",
    "bold":   "\033[1m",
    "dim":    "\033[2m",
    "accent": "\033[38;5;212m",   # pink/magenta — AlphaOS
    "orange": "\033[38;5;214m",
    "blue":   "\033[38;5;75m",
    "green":  "\033[38;5;114m",
    "red":    "\033[38;5;203m",
    "yellow": "\033[38;5;221m",
    "muted":  "\033[38;5;245m",
    "white":  "\033[38;5;255m",
    "cyan":   "\033[38;5;86m",
}


def c(color: str, text: str) -> str:
    """Wrap text in an ANSI color sequence."""
    return f"{_C.get(color, '')}{text}{_C['reset']}"


def _has_gum() -> bool:
    import shutil
    return bool(shutil.which("gum"))


HAS_GUM = _has_gum()


# ── Block-/Box-Elemente ───────────────────────────────────────────────────────

def header(title: str) -> None:
    if HAS_GUM:
        subprocess.run([
            "gum", "style",
            "--foreground=212", "--bold",
            "--border=rounded", "--border-foreground=212",
            "--padding=0 2", "--margin=0 0 1 0",
            title,
        ])
    else:
        w = max(len(title) + 4, 52)
        print(f"\n{c('accent', '┌' + '─' * w + '┐')}")
        print(f"{c('accent', '│')} {c('bold', title):<{w - 1}}{c('accent', '│')}")
        print(f"{c('accent', '└' + '─' * w + '┘')}")


def gum_table(
    headers: list[str],
    rows: list[list[str]],
    widths: list[int],
) -> None:
    lines = [",".join(headers)] + [",".join(str(x) for x in r) for r in rows]
    if HAS_GUM and rows:
        subprocess.run(
            ["gum", "table", "--print", "--separator=,",
             f"--widths={','.join(map(str, widths))}"],
            input="\n".join(lines),
            text=True,
        )
    else:
        fmt = "  " + "  ".join(f"{{:<{w}}}" for w in widths)
        print(c("muted", fmt.format(*[h[:w] for h, w in zip(headers, widths)])))
        print(c("muted", "  " + "  ".join("─" * w for w in widths)))
        for row in rows:
            cells = [str(x)[:w] for x, w in zip(row, widths)]
            print(fmt.format(*cells))


# ── Datum-Formatierung ────────────────────────────────────────────────────────

def fmt_date(d: str) -> str:
    try:
        today     = date.today().isoformat()
        yesterday = (date.today() - timedelta(days=1)).isoformat()
        if d == today:
            return c("accent", f"Heute     ({d})")
        if d == yesterday:
            return c("muted", f"Gestern   ({d})")
        return c("muted", datetime.strptime(d, "%Y-%m-%d").strftime("%a %d.%m.%y"))
    except Exception:
        return d


# ── Session-Zusammenfassung (eine Zeile) ──────────────────────────────────────

def one_line(session: dict) -> str:
    """Rendert eine Session als kompakte Einzeiler-Zusammenfassung."""
    d     = session.get("date", "?")
    kind  = classify(session)
    act   = session.get("activity") or {}
    exs   = performed_exercises(session)
    block = session.get("block", "")
    eff   = session.get("effort")
    dur   = session.get("duration")
    notes = (session.get("notes") or "")[:35]

    date_s = fmt_date(d)

    if kind == "cardio":
        atype = act.get("type", "?")
        adur  = act.get("duration", "")
        emoji = ACTIVITY_EMOJI.get(atype, "🏃")
        label = ACTIVITY_LABEL.get(atype, atype)
        dur_s = f" {c('muted', str(adur) + 'min')}" if adur else ""
        return f"  {date_s:<30}  {emoji} {c('orange', label)}{dur_s}"
    else:
        bc    = block_ansi_color(block)
        tag   = f"[{block}]" if block else "[?]"
        ex_s  = c("muted", f"{len(exs)} Ex")
        eff_s = f"  RPE {c('yellow', str(eff))}" if eff else ""
        dur_s = f"  {c('muted', str(dur) + 'min')}" if dur else ""
        note_s = f"  {c('dim', notes)}" if notes else ""
        addon = ""
        if kind == "strength+addon":
            atype = act.get("type", "?")
            adur  = act.get("duration", "")
            emoji = ACTIVITY_EMOJI.get(atype, "⚡")
            addon = f"  {c('orange', emoji + ('+' + str(adur) + 'min' if adur else ''))}"
        return (
            f"  {date_s:<30}  {c(bc, tag):<16}  {ex_s}"
            f"{eff_s}{dur_s}{addon}{note_s}"
        )


# ── Session-Detail (vollständig) ──────────────────────────────────────────────

def render_detail(session: dict) -> None:
    """Gibt die vollständige Detail-Ansicht einer Session aus."""
    d     = session.get("date", "?")
    kind  = classify(session)
    act   = session.get("activity") or {}
    exs   = performed_exercises(session)
    block = session.get("block", "")
    eff   = session.get("effort")
    dur   = session.get("duration")
    loc   = session.get("location", "")
    notes = session.get("notes", "")

    try:
        dt_label = datetime.strptime(d, "%Y-%m-%d").strftime("%A, %d. %B %Y")
    except Exception:
        dt_label = d

    if kind == "cardio":
        atype = act.get("type", "?")
        emoji = ACTIVITY_EMOJI.get(atype, "🏃")
        label = ACTIVITY_LABEL.get(atype, atype)
        header(f"{emoji}  {label}  —  {dt_label}")
        adur = act.get("duration", "")
        if adur:
            print(f"\n  {c('orange', '⏱')}  {c('white', str(adur))} {c('muted', 'Minuten')}")
        if act.get("notes"):
            print(f"\n  {c('muted', act['notes'])}")
    else:
        bc = block_ansi_color(block)
        header(f"💪  {block or '?'}  —  {dt_label}")
        meta = []
        if eff:  meta.append(f"RPE {c('yellow', str(eff))}/10")
        if dur:  meta.append(f"{c('muted', str(dur) + ' min')}")
        if loc:  meta.append(f"📍 {c('muted', loc)}")
        if meta:
            print("  " + "  ·  ".join(meta))
        if kind == "strength+addon":
            atype = act.get("type", "?")
            adur  = act.get("duration", "")
            emoji = ACTIVITY_EMOJI.get(atype, "⚡")
            label = ACTIVITY_LABEL.get(atype, atype)
            dur_s = f" · {adur}min" if adur else ""
            print(f"  {c('orange', 'Finisher:')} {emoji} {c('orange', label + dur_s)}")
        if notes:
            print(f"\n  {c('muted', notes)}")
        if exs:
            print(f"\n  {c('muted', '─' * 52)}")
            print(f"  {c('bold', 'Exercises')}  {c('muted', str(len(exs)) + ' done')}\n")
            for ex in exs:
                name = ex.get("name", "?")
                pm   = ", ".join(
                    muscle_group_label(muscle_to_group(m)) or m
                    for m in (ex.get("primaryMuscles") or [])
                    if muscle_to_group(m)
                )
                note = ex.get("note", "")
                print(f"  {c('white', '▸')} {c('bold', name)}  {c('muted', pm)}")
                sets_arr = ex.get("setsArray") or []
                has_data = any(st.get("reps") or st.get("weight") for st in sets_arr)
                if has_data:
                    for i, st in enumerate(sets_arr, 1):
                        r, w = st.get("reps", ""), st.get("weight", "")
                        parts = [p for p in [f"{r} Wdh" if r else None, f"{w} kg" if w else None] if p]
                        if parts:
                            print(f"    {c('muted', 'Set ' + str(i) + ':')} {c('accent', '  ·  '.join(parts))}")
                if note:
                    print(f"    {c('muted', '↳ ' + note)}")
    print()
