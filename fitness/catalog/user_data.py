"""Compatibility wrapper for the old catalog-owned user-data module."""

from fitness.runtime.sqlite_history import (
    HistoryPatch,
    apply_history_patches,
    delete_history_row,
    find_history_backfill_patches,
    update_history_row,
)
from fitness.runtime.user_data import (
    RuntimeUser,
    SessionSignal,
    dataclass_payload,
    iter_session_signals,
    list_runtime_users,
)

__all__ = [
    "HistoryPatch",
    "RuntimeUser",
    "SessionSignal",
    "apply_history_patches",
    "dataclass_payload",
    "delete_history_row",
    "find_history_backfill_patches",
    "iter_session_signals",
    "list_runtime_users",
    "update_history_row",
]
