"""Request/response schemas for playlist generation."""

from datetime import datetime

from pydantic import BaseModel, Field

from app.schemas.ai import AudioFilters


class GeneratePlaylistRequest(BaseModel):
    """Payload for POST /api/generate-playlist."""

    prompt: str = Field(min_length=3, max_length=500)
    provider: str = "gemini"
    model: str = "gemini-2.0-flash"


class PlaylistResponse(BaseModel):
    """Result of a successful playlist generation."""

    playlist_id: str
    name: str
    description: str | None = None
    track_count: int
    spotify_url: str
    ai_parameters: AudioFilters
    fallback_applied: bool = False


class PlaylistSummary(BaseModel):
    """Compact playlist record for list views."""

    id: str
    spotify_playlist_id: str
    name: str
    track_count: int
    created_at: datetime
