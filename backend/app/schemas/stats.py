"""Schemas for dashboard statistics."""

from datetime import datetime

from pydantic import BaseModel


class StatsResponse(BaseModel):
    """Response for GET /api/stats."""

    total_tracks: int
    total_playlists: int
    last_sync: datetime | None = None
