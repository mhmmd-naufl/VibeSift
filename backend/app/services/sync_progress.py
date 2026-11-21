"""In-memory sync progress store keyed by Spotify user ID.

Single-process only — good enough for local development. Each sync resets the
entry for its user; the last snapshot stays readable after completion.
"""

import time
from typing import Any

_store: dict[str, dict[str, Any]] = {}


def start(user_id: str) -> None:
    """Reset and begin a progress entry for a user."""
    _store[user_id] = {
        "phase": "fetching_tracks",
        "tracks": 0,
        "features_done": 0,
        "features_total": 0,
        "started_at": time.time(),
        "done": False,
        "error": None,
    }


def update(user_id: str, **fields: Any) -> None:
    """Merge fields into a user's progress entry."""
    _store.setdefault(user_id, {}).update(fields)


def snapshot(user_id: str) -> dict[str, Any]:
    """Return a copy of the user's current progress."""
    return dict(_store.get(user_id, {}))
