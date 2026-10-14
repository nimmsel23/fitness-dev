"""Pull Sessions: Firestore → lokal. Quelle ist austauschbar (Tests nutzen Fakes)."""
from __future__ import annotations

from collections import Counter
from contextlib import nullcontext
from dataclasses import dataclass, field
from typing import Any, Iterable

from loguru import logger

from backend.core.conflict import Decision, decide, rev_of
from backend.core.store import InvalidDocId, SessionStore, check_doc_id, jsonable


@dataclass
class RemoteDoc:
    id: str
    data: dict[str, Any]


@dataclass
class Change:
    """Ein angelegtes/aktualisiertes Dokument (bei --dry-run: ein geplantes)."""
    uid: str
    doc_id: str
    action: str            # "angelegt" | "aktualisiert"
    data: dict[str, Any]


@dataclass
class Report:
    uid: str
    dry_run: bool
    counts: Counter = field(default_factory=Counter)
    changes: list[Change] = field(default_factory=list)

    @property
    def errors(self) -> int:
        return self.counts["fehler"]

    def summary(self) -> str:
        c = self.counts
        parts = [
            f"{c['angelegt']} angelegt", f"{c['aktualisiert']} aktualisiert",
            f"{c['übersprungen']} übersprungen", f"{c['nur_lokal']} nur lokal",
            f"{c['fehler']} Fehler",
        ]
        return ("[dry-run] " if self.dry_run else "") + ", ".join(parts)


def _emit(level: str, uid: str, doc_id: str, action: str, msg: str, **fields) -> None:
    logger.bind(event="session", direction="pull", uid=uid, doc_id=doc_id, action=action, **fields).log(
        level, f"session ← {uid[:8]}/{doc_id}  {action}: {msg}"
    )


def _pull_one(uid: str, doc_id: str, doc: RemoteDoc, store: SessionStore, report: Report, dry_run: bool) -> None:
    remote = jsonable(doc.data)

    owner = remote.get("owner_uid")
    if owner and owner != uid:
        report.counts["übersprungen"] += 1
        _emit("WARNING", uid, doc_id, "übersprungen",
              f"owner_uid {owner} passt nicht zu {uid} (Cross-User-Guard)",
              reason="owner_uid", dry_run=dry_run)
        return

    local, local_error = store.read(uid, doc_id)
    if local_error:
        quarantined = None if dry_run else store.quarantine(uid, doc_id)
        _emit("WARNING", uid, doc_id, "lokal_defekt",
              f"lokale Datei unlesbar ({local_error})"
              + (f", nach {quarantined.name} verschoben" if quarantined else ""),
              reason="lokal_defekt", dry_run=dry_run)
        local = None

    decision: Decision = decide(local, remote)
    facts = dict(reason=decision.reason, rev_remote=rev_of(remote),
                 rev_local=None if local is None else rev_of(local),
                 saved_at_remote=remote.get("saved_at"),
                 saved_at_local=None if local is None else local.get("saved_at"),
                 dry_run=dry_run)

    if not decision.write:
        report.counts["übersprungen"] += 1
        _emit("DEBUG", uid, doc_id, "übersprungen", decision.reason, **facts)
        return

    action = "angelegt" if local is None else "aktualisiert"
    if not dry_run:
        backup = store.write(uid, doc_id, remote)
        facts["backup"] = None if backup is None else str(backup)
    report.counts[action] += 1
    report.changes.append(Change(uid, doc_id, action, remote))
    _emit("INFO", uid, doc_id, action, decision.reason, **facts)


def pull_sessions(
    uid: str, docs: Iterable[RemoteDoc], store: SessionStore, *, dry_run: bool = False
) -> Report:
    report = Report(uid=uid, dry_run=dry_run)
    seen: set[str] = set()

    for doc in docs:
        doc_id = doc.id
        try:
            check_doc_id(doc_id)
        except InvalidDocId:
            report.counts["fehler"] += 1
            _emit("ERROR", uid, doc_id, "fehler", "ungültige doc_id, nicht als Dateiname verwendbar", dry_run=dry_run)
            continue
        seen.add(doc_id)

        try:
            with (nullcontext() if dry_run else store.write_lock()):
                _pull_one(uid, doc_id, doc, store, report, dry_run)
        except Exception as exc:  # ein kaputtes Dokument stoppt den Lauf nicht
            report.counts["fehler"] += 1
            _emit("ERROR", uid, doc_id, "fehler", f"{type(exc).__name__}: {exc}", dry_run=dry_run)

    for orphan in sorted(store.list_ids(uid) - seen):
        report.counts["nur_lokal"] += 1
        _emit("INFO", uid, orphan, "nur_lokal",
              "lokal vorhanden, in Firestore nicht (wird nicht gelöscht)", reason="nur_lokal", dry_run=dry_run)

    logger.bind(event="summary", direction="pull", uid=uid, dry_run=dry_run, **dict(report.counts)).info(
        f"pull sessions {uid[:8]}: {report.summary()}"
    )
    return report
