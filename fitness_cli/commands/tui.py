"""
fitness_cli.commands.tui — Interaktive Textual TUI App (fitness tui).

Direkter Dateizugriff — kein Server nötig.

Tabs:
  1 Log      DataTable aller Sessions, Enter → Detail-Modal
  2 Woche    7-Tage Streak-Grid
  3 Stats    Split, Cardio, Muskel-Coverage
  4 Sync     Firestore-Service + Klienten-Registry
  5 Clients  Pro-Klient 10-Tage Streak + Session-Details

Keyboard:
  1-5   Tabs       j/k ↓/↑  Navigation
  Enter Detail      r        Reload    q  Beenden
"""
from __future__ import annotations

from datetime import date, datetime, timedelta
from typing import ClassVar

from textual import work
from textual.app import App, ComposeResult
from textual.binding import Binding
from textual.containers import Container, ScrollableContainer
from textual.screen import ModalScreen
from textual.widgets import (
    DataTable, Footer, Header, Label,
    Static, TabbedContent, TabPane,
)

from ..constants import (
    ACTIVITY_EMOJI, ACTIVITY_LABEL, WEEKDAYS_DE,
    block_rich_style, block_ansi_color,
)
from ..data import (
    classify,
    load_all_clients,
    load_sessions,
    sync_info,
)

# ── Detail-Modal ──────────────────────────────────────────────────────────────

class DetailModal(ModalScreen):
    BINDINGS = [Binding("escape,enter,q", "dismiss", "Schließen")]
    CSS = """
    DetailModal { align: center middle; }
    DetailModal > Container {
        width: 82; max-height: 90%;
        background: $surface; border: round $primary; padding: 1 2;
    }
    .dt { color: $primary; text-style: bold; margin-bottom: 1; }
    .dm { color: $text-muted; margin-bottom: 1; }
    .de { color: $text; margin-left: 2; }
    .ds { color: $primary-lighten-2; margin-left: 4; }
    .df { color: $warning; margin-top: 1; }
    .dn { color: $text-muted; font-style: italic; margin-top: 1; }
    .dc { color: $text-muted; margin-top: 2; text-align: right; }
    """

    def __init__(self, session: dict) -> None:
        super().__init__()
        self.session = session

    def compose(self) -> ComposeResult:
        s     = self.session
        kind  = classify(s)
        act   = s.get("activity") or {}
        exs   = [e for e in (s.get("exercises") or []) if e.get("done")]
        block = s.get("block", "")
        eff   = s.get("effort")
        dur   = s.get("duration")
        loc   = s.get("location", "")
        notes = s.get("notes", "")
        d     = s.get("date", "?")
        try:
            dt_s = datetime.strptime(d, "%Y-%m-%d").strftime("%A, %d. %B %Y")
        except Exception:
            dt_s = d

        lines: list[tuple[str, str]] = []

        if kind == "cardio":
            atype = act.get("type", "?")
            emoji = ACTIVITY_EMOJI.get(atype, "🏃")
            label = ACTIVITY_LABEL.get(atype, atype)
            adur  = act.get("duration", "")
            lines.append(("dt", f"{emoji}  {label}  —  {dt_s}"))
            if adur:
                lines.append(("dm", f"⏱  {adur} Minuten"))
        else:
            style = block_rich_style(block)
            lines.append(("dt", f"💪  {block or '?'}  —  {dt_s}"))
            meta = []
            if eff:  meta.append(f"RPE {eff}/10")
            if dur:  meta.append(f"{dur} min")
            if loc:  meta.append(f"📍 {loc}")
            if meta: lines.append(("dm", "  ·  ".join(meta)))
            if kind == "strength+addon":
                atype = act.get("type", "?")
                adur  = act.get("duration", "")
                emoji = ACTIVITY_EMOJI.get(atype, "⚡")
                label = ACTIVITY_LABEL.get(atype, atype)
                lines.append(("df",
                    f"⚡ Finisher: {emoji} {label}"
                    + (f" · {adur}min" if adur else "")))
            if exs:
                lines.append(("dm", f"\n{'─'*42}\n{len(exs)} Exercises:\n"))
                for ex in exs:
                    name = ex.get("name", "?")
                    pm   = ", ".join(ex.get("primaryMuscles") or [])
                    note = ex.get("note", "")
                    lines.append(("de", f"▸ {name}  [{pm}]" if pm else f"▸ {name}"))
                    for i, st in enumerate(ex.get("setsArray") or [], 1):
                        r, w = st.get("reps", ""), st.get("weight", "")
                        parts = [p for p in [f"{r} Wdh" if r else None, f"{w} kg" if w else None] if p]
                        if parts:
                            lines.append(("ds", f"  Set {i}: {'  ·  '.join(parts)}"))
                    if note:
                        lines.append(("ds", f"  ↳ {note}"))
        if notes:
            lines.append(("dn", f"\n{notes}"))
        lines.append(("dc", "\n[Esc / Enter schließen]"))

        with Container():
            for cls, text in lines:
                yield Label(text, classes=cls)


# ── Tab: Log ──────────────────────────────────────────────────────────────────

class SessionTable(Static):
    """DataTable-Wrapper mit Keyboard-Navigation und Detail-Modal."""
    DEFAULT_CSS = "SessionTable { height: 1fr; }"

    def __init__(self, sessions: list[dict]) -> None:
        super().__init__()
        self._sessions = sessions

    def compose(self) -> ComposeResult:
        table = DataTable(zebra_stripes=True, cursor_type="row")
        table.add_columns("Datum", "Typ", "Block / Aktivität", "Details", "Effort")
        for s in self._sessions:
            self._add_row(table, s)
        yield table

    @staticmethod
    def _add_row(table: DataTable, s: dict) -> None:
        d     = s.get("date", "?")
        kind  = classify(s)
        act   = s.get("activity") or {}
        exs   = [e for e in (s.get("exercises") or []) if e.get("done")]
        block = s.get("block", "")
        eff   = s.get("effort")

        today = date.today().isoformat()
        yest  = (date.today() - timedelta(days=1)).isoformat()
        date_s = (
            f"[bold bright_magenta]Heute[/]" if d == today
            else f"[dim]Gestern[/]" if d == yest
            else datetime.strptime(d, "%Y-%m-%d").strftime("%a %d.%m")
            if len(d) == 10 else d
        )

        if kind == "cardio":
            atype = act.get("type", "?")
            adur  = act.get("duration", "")
            emoji = ACTIVITY_EMOJI.get(atype, "🏃")
            label = ACTIVITY_LABEL.get(atype, atype)
            table.add_row(
                date_s, emoji,
                f"[dark_orange]{label}[/]",
                f"[dim]{adur}min[/]" if adur else "—",
                "—",
                key=s.get("_stem", d),
            )
        else:
            style = block_rich_style(block)
            names = ", ".join(e.get("name", "?") for e in exs[:3])
            ellipsis = "…" if len(exs) > 3 else ""
            addon = ""
            if kind == "strength+addon":
                atype = act.get("type", "?")
                adur  = act.get("duration", "")
                emoji = ACTIVITY_EMOJI.get(atype, "⚡")
                addon = f"  [dark_orange]{emoji}{'+' + str(adur) + 'min' if adur else ''}[/]"
            table.add_row(
                date_s, "💪",
                f"[{style}]{block or '?'}[/]",
                f"[dim]{names}{ellipsis}[/]{addon}",
                f"[yellow]{eff}/10[/]" if eff else "—",
                key=s.get("_stem", d),
            )

    def update_sessions(self, sessions: list[dict]) -> None:
        self._sessions = sessions
        try:
            table = self.query_one(DataTable)
            table.clear()
            for s in sessions:
                self._add_row(table, s)
        except Exception:
            pass

    def on_data_table_row_selected(self, event: DataTable.RowSelected) -> None:
        idx = event.cursor_row
        if 0 <= idx < len(self._sessions):
            self.app.push_screen(DetailModal(self._sessions[idx]))


# ── Tab: Woche ────────────────────────────────────────────────────────────────

class WeekView(Static):
    DEFAULT_CSS = "WeekView { padding: 1 2; height: auto; }"

    def __init__(self, sessions: list[dict]) -> None:
        super().__init__()
        self.sessions = sessions

    def render(self) -> str:
        today  = date.today()
        by_date: dict[str, list[dict]] = {}
        for s in self.sessions:
            by_date.setdefault(s["date"], []).append(s)

        lines = []
        for i in range(6, -1, -1):
            d     = (today - timedelta(days=i)).isoformat()
            wd    = WEEKDAYS_DE[(today - timedelta(days=i)).weekday()]
            day_s = by_date.get(d, [])
            is_today = d == today.isoformat()
            prefix = (
                f"[bold bright_magenta]{wd} {d}[/]"
                if is_today else f"[dim]{wd} {d}[/]"
            )
            if not day_s:
                lines.append(f"  {prefix}  [dim]·  Ruhetag[/]")
                continue
            parts = []
            for s in day_s:
                kind = classify(s)
                act  = s.get("activity") or {}
                exs  = [e for e in (s.get("exercises") or []) if e.get("done")]
                if kind == "cardio":
                    atype = act.get("type", "?")
                    adur  = act.get("duration", "")
                    emoji = ACTIVITY_EMOJI.get(atype, "🏃")
                    label = ACTIVITY_LABEL.get(atype, atype)
                    parts.append(
                        f"{emoji} [dark_orange]{label}[/]"
                        + (f" [dim]{adur}min[/]" if adur else "")
                    )
                else:
                    block = s.get("block", "?")
                    style = block_rich_style(block)
                    names = ", ".join(e.get("name", "?") for e in exs[:3])
                    addon = ""
                    if kind == "strength+addon":
                        atype = act.get("type", "?")
                        addon = f"  [{ACTIVITY_EMOJI.get(atype, '⚡')}]"
                    parts.append(f"[{style}]● {block}[/]  [dim]{names}[/]{addon}")
            lines.append(f"  {prefix}  " + "  [dim]│[/]  ".join(parts))
        return "\n".join(lines)


# ── Tab: Stats ────────────────────────────────────────────────────────────────

class StatsView(Static):
    DEFAULT_CSS = "StatsView { padding: 1 2; height: auto; }"

    def __init__(self, sessions: list[dict]) -> None:
        super().__init__()
        self.sessions = sessions

    def render(self) -> str:
        strength = [s for s in self.sessions if classify(s) != "cardio"]
        cardio   = [s for s in self.sessions if classify(s) == "cardio"]
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

        out = ["[bold]Sessions[/bold]"]
        out.append(
            f"  Kraft:    [bright_magenta]{len(strength)}x[/]"
            f"  ·  [dim]{total_ex} Übungen gesamt[/]"
        )
        out.append(
            f"  Ausdauer: [dark_orange]{len(cardio)}x[/]"
            + (f"  ·  [dim]{cardio_min} min[/]" if cardio_min else "")
        )

        if block_dist:
            out.append("\n[bold]Split[/bold]")
            mx = max(block_dist.values())
            for bl, cnt in sorted(block_dist.items(), key=lambda x: -x[1]):
                style = block_rich_style(bl)
                bar = "█" * cnt + "░" * max(0, mx - cnt)
                out.append(f"  [{style}]{bl:<14}[/]  [{style}]{bar}[/]  [dim]{cnt}x[/]")

        if cardio_dist:
            out.append("\n[bold]Ausdauer[/bold]")
            for atype, cnt in sorted(cardio_dist.items(), key=lambda x: -x[1]):
                emoji = ACTIVITY_EMOJI.get(atype, "🏃")
                label = ACTIVITY_LABEL.get(atype, atype)
                out.append(f"  {emoji} [dark_orange]{label:<14}[/] [dim]{cnt}x[/]")

        if muscle_freq:
            out.append("\n[bold]Muskel-Coverage[/bold]")
            for m, cnt in sorted(muscle_freq.items(), key=lambda x: -x[1])[:8]:
                bar = "█" * min(cnt, 10) + "░" * max(0, 10 - cnt)
                out.append(f"  [white]{m:<14}[/]  [bright_magenta]{bar}[/]  [dim]{cnt}x[/]")

        return "\n".join(out)


# ── Tab: Sync ─────────────────────────────────────────────────────────────────

class SyncView(Static):
    DEFAULT_CSS = "SyncView { padding: 1 2; height: auto; }"

    def __init__(self, info: dict) -> None:
        super().__init__()
        self.info = info

    def render(self) -> str:
        i = self.info
        if not i:
            return "[dim]Lade…[/]"
        sc  = "green" if i["state"] == "active" else "red"
        ds  = "[green]● aktiv[/]" if i["daemon_active"] else "[yellow]○ inaktiv (boot-only)[/]"
        age = i.get("newest_age", "?")
        ac  = ("green" if isinstance(age, int) and age < 2
               else "yellow" if isinstance(age, int) and age < 7 else "red")
        last = i["last_run"][:19] if len(i.get("last_run", "")) > 10 else i.get("last_run", "?")

        lines = [
            "[bold]Firestore ↔ Lokal[/bold]\n",
            f"  [dim]Service:[/]       [{sc}]{i['state']} ({i['sub']})[/]",
            f"  [dim]Letzter Run:[/]   [white]{last}[/]",
            f"  [dim]Mirror-Daemon:[/] {ds}",
            "",
            f"  [dim]Pfad:[/]          [white]{i['sdir']}[/]",
            f"  [dim]JSON-Sessions:[/] [bright_magenta]{i['json_count']}[/]",
            f"  [dim]SQLite-Sets:[/]   [dim]{i['sqlite_n']}  (latest: {i['sqlite_latest']})[/]",
            f"  [dim]Neueste:[/]       [{ac}]{i['newest']}[/]  [dim]({age} Tage alt)[/]",
            "",
            "  [dim]→ fitness sync   zum manuellen Pull/Push[/]",
        ]

        # Klienten
        from ..data import load_client_registry
        from ..paths import AOS_USERS
        registry = load_client_registry()
        if registry:
            lines.append("\n[bold]Klienten[/bold]")
            for uid, meta in registry.items():
                sdir = AOS_USERS / uid / "fitness" / "sessions"
                if sdir.exists():
                    files  = list(sdir.glob("*.json"))
                    dates  = sorted((f.stem[:10] for f in files if len(f.stem) >= 10), reverse=True)
                    newest = dates[0] if dates else "—"
                    try:
                        a  = (date.today() - date.fromisoformat(newest)).days
                        ac2 = "green" if a < 3 else "yellow" if a < 7 else "red"
                        age_s = f"[{ac2}]{newest}[/] [dim]({a}d)[/]"
                    except Exception:
                        age_s = f"[dim]{newest}[/]"
                    sync_s = f"[green]✓ {len(files)}[/]  {age_s}"
                else:
                    sync_s = "[yellow]○ kein Sync[/]"
                lines.append(f"  [white]{meta['name']:<18}[/] [dim]{uid[:12]}…[/]  {sync_s}")

        return "\n".join(lines)


# ── Tab: Clients ──────────────────────────────────────────────────────────────

class ClientsView(Static):
    DEFAULT_CSS = "ClientsView { padding: 1 2; height: auto; }"

    def __init__(self, clients: list[dict], days: int = 10) -> None:
        super().__init__()
        self.clients = clients
        self.days    = days

    def render(self) -> str:
        if not self.clients:
            return "[dim]  Keine registrierten Klienten gefunden.[/]"

        today    = date.today()
        day_cols = [(today - timedelta(days=i)).isoformat() for i in range(self.days - 1, -1, -1)]

        lines: list[str] = []
        lines.append(f"[bold]Klienten-Logs — letzte {self.days} Tage[/bold]\n")

        wd_row = " ".join(
            f"[bold bright_magenta]{(today - timedelta(days=i)).strftime('%a')[0:2]}[/]"
            if (today - timedelta(days=i)).isoformat() == today.isoformat()
            else f"[dim]{(today - timedelta(days=i)).strftime('%a')[0:2]}[/]"
            for i in range(self.days - 1, -1, -1)
        )
        lines.append(f"  [dim]{'Klient':<18}[/]  {wd_row}  [dim]Letztes       Total[/]")
        lines.append(f"  {'─' * 18}  {'── ' * self.days} {'─' * 12}  {'─' * 5}")

        for cl in self.clients:
            name     = cl["name"]
            has_data = cl.get("has_data", False)
            crm_id   = cl.get("crm_id")
            sess_map: dict[str, list[dict]] = {}
            for s in cl["sessions"]:
                sess_map.setdefault(s["date"], []).append(s)

            dots = []
            for d in day_cols:
                day_s = sess_map.get(d, [])
                if not day_s:
                    dots.append("[dim]·[/]")
                    continue
                kinds = [classify(s) for s in day_s]
                if any(k != "cardio" for k in kinds) and any(k == "cardio" for k in kinds):
                    dots.append("[bold magenta]◈[/]")
                elif all(k == "cardio" for k in kinds):
                    dots.append("[dark_orange]●[/]")
                else:
                    block = next((s.get("block", "") for s in day_s if classify(s) != "cardio"), "")
                    style = block_rich_style(block)
                    dots.append(f"[{style}]●[/]")

            streak = " ".join(dots)
            last   = cl["last_date"]
            total  = cl["total_count"]
            try:
                age   = (today - date.fromisoformat(last)).days
                lc    = "green" if age < 3 else "yellow" if age < 7 else "dim red"
                last_s = f"[{lc}]{last}[/]"
            except Exception:
                last_s = f"[dim]{last}[/]"

            nd_s  = "  [dim italic]kein lokaler Sync[/]" if not has_data else ""
            crm_s = f"  [dim]#{crm_id}[/]" if crm_id else ""
            lines.append(f"  [bold bright_magenta]{name:<18}[/]  {streak}  {last_s}  [dim]{total:>3}x[/]{crm_s}{nd_s}")

            for d in day_cols:
                for s in sess_map.get(d, []):
                    kind  = classify(s)
                    act   = s.get("activity") or {}
                    exs   = [e for e in (s.get("exercises") or []) if e.get("done")]
                    block = s.get("block", "")
                    eff   = s.get("effort")
                    dl    = datetime.strptime(d, "%Y-%m-%d").strftime("%d.%m")
                    if kind == "cardio":
                        atype = act.get("type", "?")
                        adur  = act.get("duration", "")
                        emoji = ACTIVITY_EMOJI.get(atype, "🏃")
                        label = ACTIVITY_LABEL.get(atype, atype)
                        lines.append(
                            f"    [dim]{dl}[/]  {emoji} [dark_orange]{label}[/]"
                            + (f" [dim]{adur}min[/]" if adur else "")
                        )
                    else:
                        style = block_rich_style(block)
                        names = ", ".join(e.get("name", "?") for e in exs[:3])
                        addon = ""
                        if kind == "strength+addon":
                            atype = act.get("type", "?")
                            addon = f"  [dark_orange]{ACTIVITY_EMOJI.get(atype, '⚡')}[/]"
                        eff_s = f" [dim]RPE {eff}[/]" if eff else ""
                        lines.append(
                            f"    [dim]{dl}[/]  [{style}]{block or '?'}[/]"
                            + (f"  [dim]{names}[/]" if names else "")
                            + eff_s + addon
                        )
            lines.append("")

        return "\n".join(lines)


# ── Main App ──────────────────────────────────────────────────────────────────

class FitnessTUI(App):
    TITLE     = "AlphaOS Fitness"
    SUB_TITLE = "Session Dashboard"
    CSS = """
    Screen { background: $background; }
    TabbedContent { height: 1fr; }
    TabPane { padding: 0; height: 1fr; }
    SessionTable { height: 1fr; }
    ScrollableContainer { height: 1fr; }
    """
    BINDINGS: ClassVar = [
        Binding("1", "show_tab('log')",     "Log",     show=True),
        Binding("2", "show_tab('woche')",   "Woche",   show=True),
        Binding("3", "show_tab('stats')",   "Stats",   show=True),
        Binding("4", "show_tab('sync')",    "Sync",    show=True),
        Binding("5", "show_tab('clients')", "Clients", show=True),
        Binding("r", "reload",              "Reload"),
        Binding("q", "quit",                "Quit"),
    ]

    def compose(self) -> ComposeResult:
        yield Header(show_clock=True)
        with TabbedContent(initial="log"):
            with TabPane("📋 Log",     id="log"):
                yield SessionTable([])
            with TabPane("📅 Woche",   id="woche"):
                with ScrollableContainer():
                    yield WeekView([])
            with TabPane("📊 Stats",   id="stats"):
                with ScrollableContainer():
                    yield StatsView([])
            with TabPane("🔄 Sync",    id="sync"):
                with ScrollableContainer():
                    yield SyncView({})
            with TabPane("👥 Clients", id="clients"):
                with ScrollableContainer():
                    yield ClientsView([])
        yield Footer()

    def on_mount(self) -> None:
        self.action_reload()

    @work(thread=True)
    def action_reload(self) -> None:
        sessions = load_sessions(60)
        info     = sync_info()
        clients  = load_all_clients(10)
        self.call_from_thread(self._apply, sessions, info, clients)

    def _apply(self, sessions: list[dict], info: dict, clients: list[dict]) -> None:
        try:
            self.query_one(SessionTable).update_sessions(sessions)
            wv = self.query_one(WeekView)
            wv.sessions = sessions; wv.refresh()
            sv = self.query_one(StatsView)
            sv.sessions = sessions; sv.refresh()
            syn = self.query_one(SyncView)
            syn.info = info; syn.refresh()
            cv = self.query_one(ClientsView)
            cv.clients = clients; cv.refresh()
        except Exception:
            pass

    def action_show_tab(self, tab_id: str) -> None:
        self.query_one(TabbedContent).active = tab_id

    def notify_reload(self) -> None:
        self.notify("Daten werden neu geladen…", severity="information", timeout=2)
        self.action_reload()


# ── Entry-Point ───────────────────────────────────────────────────────────────

def main() -> None:
    FitnessTUI().run()


if __name__ == "__main__":
    main()
