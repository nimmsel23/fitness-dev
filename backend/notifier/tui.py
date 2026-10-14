"""Workout-Inbox als Textual-TUI (läuft im Scratchpad, funktioniert aber in jedem Terminal).

Tasten: ↑/↓ oder j/k Navigation · Leertaste gesehen⇄neu · m gesehen + weiter · n nächstes Neues
        A alle gesehen · u nur Neue · c Klient wechseln · r neu laden · Esc ausblenden · q beenden
"""
from __future__ import annotations

import io
from pathlib import Path

from rich.console import Console
from rich.text import Text
from textual.app import App, ComposeResult
from textual.binding import Binding
from textual.containers import Horizontal, VerticalScroll
from textual.coordinate import Coordinate
from textual.widgets import DataTable, Footer, Header, Static

from backend.core.store import SessionStore
from backend.notifier.config import NotifyConfig
from backend.notifier.detail import render_detail
from backend.notifier.inbox import Entry, Inbox
from backend.notifier.paths import notifier_dir
from backend.notifier.scratchpad import HyprError, Scratchpad, take_focus_request


def _info(e: Entry) -> str:
    first = (e.summary or "").splitlines()[0] if e.summary else ""
    return first.split(" · ", 1)[1] if " · " in first else first


class InboxApp(App):
    TITLE = "Fitness Sync — Workout-Inbox"
    CSS = """
    #body { height: 1fr; }
    #list { width: 52%; }
    #detail { width: 1fr; padding: 0 1; border-left: tall $primary; }
    #status { height: 1; padding: 0 1; color: $text-muted; }
    """
    BINDINGS = [
        Binding("j", "cursor_down", "↓", show=False),
        Binding("k", "cursor_up", "↑", show=False),
        Binding("space", "toggle_seen", "Gesehen ⇄ Neu"),
        Binding("m", "seen_next", "Gesehen + weiter"),
        Binding("n", "next_unseen", "Nächstes Neues"),
        Binding("A", "mark_all_seen", "Alle gesehen"),
        Binding("u", "toggle_unseen_only", "Nur Neue"),
        Binding("c", "cycle_client", "Klient"),
        Binding("r", "reload", "Neu laden"),
        Binding("escape", "hide", "Ausblenden"),
        Binding("q", "quit", "Beenden"),
    ]

    def __init__(self, root: Path, config: NotifyConfig | None = None, *, inbox: Inbox | None = None,
                 scratchpad: Scratchpad | None = None, poll_interval: float = 1.0):
        super().__init__()
        self.root = Path(root)
        self.config = config or NotifyConfig()
        self.inbox = inbox or Inbox(notifier_dir(self.root))
        self.store = SessionStore(self.root)
        self.scratchpad = scratchpad
        self.poll_interval = poll_interval
        self.auto_seen = self.config.auto_seen_seconds
        self.only_unseen = False
        self.client_filter: str | None = None
        self.last_detail_plain = ""
        self._entries: list[Entry] = []
        self._all: list[Entry] = []
        self._signature = None
        self._seen_timer = None
        self._shown_id: str | None = None

    # --- Aufbau ------------------------------------------------------------------
    def compose(self) -> ComposeResult:
        yield Header()
        with Horizontal(id="body"):
            yield DataTable(id="list", cursor_type="row", zebra_stripes=True)
            with VerticalScroll(id="detail"):
                yield Static("", id="detail-text")
        yield Static("", id="status")
        yield Footer()

    def on_mount(self) -> None:
        table = self.table
        table.add_column("", width=2)
        table.add_column("Datum", width=10)
        table.add_column("Klient", width=14)
        table.add_column("Workout")
        self.reload()
        table.focus()
        self.set_interval(self.poll_interval, self._poll)

    @property
    def table(self) -> DataTable:
        return self.query_one("#list", DataTable)

    # --- Daten -------------------------------------------------------------------
    def current_id(self) -> str | None:
        table = self.table
        if table.row_count == 0 or not (0 <= table.cursor_row < table.row_count):
            return None
        return table.coordinate_to_cell_key(Coordinate(table.cursor_row, 0)).row_key.value

    def reload(self, keep: str | None = None, *, keep_index: int | None = None) -> None:
        keep = keep if keep is not None else self.current_id()
        old_index = keep_index if keep_index is not None else self.table.cursor_row
        self._signature = self.inbox.signature()
        self._all = self.inbox.entries()
        entries = self._all
        if self.client_filter:
            entries = [e for e in entries if e.client == self.client_filter]
        if self.only_unseen:
            entries = [e for e in entries if e.unseen]
        self._entries = entries

        table = self.table
        table.clear()
        for e in entries:
            mark = Text("●", style="bold green") if e.unseen else Text(" ")
            style = "bold" if e.unseen else "dim"
            table.add_row(mark, Text(e.date, style=style), Text(e.client, style=style),
                          Text(_info(e), style=style), key=e.id)
        if entries:
            ids = [e.id for e in entries]
            idx = ids.index(keep) if keep in ids else min(max(old_index, 0), len(entries) - 1)
            table.move_cursor(row=idx, animate=False)
        self._show_current()

    def _entry(self, eid: str | None) -> Entry | None:
        return next((e for e in self._entries if e.id == eid), None)

    def _show_current(self) -> None:
        eid = self.current_id()
        entry = self._entry(eid)
        detail = self.query_one("#detail-text", Static)
        if self._seen_timer is not None:
            self._seen_timer.stop()
            self._seen_timer = None
        self._shown_id = eid
        if entry is None:
            renderable = Text("Keine Workouts." if not self._all else "Nichts in dieser Ansicht (Filter mit u/c ändern).",
                              style="dim")
        else:
            session, error = self.store.read(entry.uid, entry.doc_id)
            renderable = render_detail(entry, session, error)
            if entry.unseen and self.auto_seen > 0:
                self._seen_timer = self.set_timer(self.auto_seen, lambda eid=entry.id: self._auto_seen(eid))
        detail.update(renderable)
        buf = io.StringIO()
        Console(file=buf, width=100, force_terminal=False, color_system=None).print(renderable)
        self.last_detail_plain = buf.getvalue()
        self.query_one("#detail", VerticalScroll).scroll_home(animate=False)
        self._update_status()

    def _update_status(self) -> None:
        unseen = sum(1 for e in self._all if e.unseen)
        parts = [f"{unseen} neu", f"{len(self._all)} gesamt"]
        if self.only_unseen:
            parts.append("Filter: nur Neue")
        if self.client_filter:
            parts.append(f"Klient: {self.client_filter}")
        self.query_one("#status", Static).update("  ·  ".join(parts))
        self.sub_title = f"{unseen} neu" if unseen else "alles gesehen"

    # --- Ereignisse ----------------------------------------------------------------
    def on_data_table_row_highlighted(self, event: DataTable.RowHighlighted) -> None:
        if event.row_key is not None and event.row_key.value != self._shown_id:
            self._show_current()

    def _auto_seen(self, eid: str) -> None:
        if self.current_id() == eid:
            self.inbox.mark_seen([eid])
            self.reload(keep=eid)

    def _poll(self) -> None:
        focus = take_focus_request(notifier_dir(self.root))
        if self.inbox.signature() != self._signature or focus:
            self.reload()
        if focus:
            self._focus_entry(focus)

    def _focus_entry(self, eid: str) -> None:
        if self._entry(eid) is None and (self.only_unseen or self.client_filter):
            self.only_unseen, self.client_filter = False, None
            self.reload()
        for idx, e in enumerate(self._entries):
            if e.id == eid:
                self.table.move_cursor(row=idx, animate=False)
                self._show_current()
                break
        self.table.focus()

    # --- Aktionen ------------------------------------------------------------------
    def action_cursor_down(self) -> None:
        self.table.action_cursor_down()

    def action_cursor_up(self) -> None:
        self.table.action_cursor_up()

    def action_reload(self) -> None:
        self.reload()

    def action_toggle_seen(self) -> None:
        e = self._entry(self.current_id())
        if e is None:
            return
        (self.inbox.mark_unseen if not e.unseen else self.inbox.mark_seen)([e.id])
        self.reload(keep=e.id, keep_index=self.table.cursor_row)

    def action_next_unseen(self) -> None:
        n = len(self._entries)
        start = self.table.cursor_row
        for step in range(1, n + 1):
            idx = (start + step) % n
            if self._entries[idx].unseen:
                self.table.move_cursor(row=idx, animate=False)
                self._show_current()
                return
        self.notify("Nichts Neues mehr.", timeout=2)

    def action_seen_next(self) -> None:
        e = self._entry(self.current_id())
        if e is None:
            return
        idx = self.table.cursor_row
        self.inbox.mark_seen([e.id])
        self.reload(keep=e.id, keep_index=idx)
        self.action_next_unseen()

    def action_mark_all_seen(self) -> None:
        uid = None
        if self.client_filter:
            uid = next((e.uid for e in self._all if e.client == self.client_filter), None)
        n = self.inbox.mark_all_seen(uid=uid)
        self.reload()
        self.notify(f"{n} als gesehen markiert.", timeout=2)

    def action_toggle_unseen_only(self) -> None:
        self.only_unseen = not self.only_unseen
        self.reload()

    def action_cycle_client(self) -> None:
        names = sorted({e.client for e in self._all})
        cycle = [None, *names]
        self.client_filter = cycle[(cycle.index(self.client_filter) + 1) % len(cycle)] \
            if self.client_filter in cycle else None
        self.reload()

    def action_hide(self) -> None:
        if self.scratchpad is None:
            self.exit()
            return
        try:
            self.scratchpad.hide()
        except HyprError as exc:
            self.notify(f"Ausblenden fehlgeschlagen: {exc}", severity="error")
