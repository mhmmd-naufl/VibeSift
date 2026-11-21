"""Request/response schemas for playlist generation."""

from datetime import datetime

from pydantic import BaseModel, Field

from app.schemas.ai import AudioFilters


class GeneratePlaylistRequest(BaseModel):
    """Payload for POST /api/generate-playlist."""

    prompt: str = Field(min_length=3, max_length=500)
    provider: str = "gemini"
    model: str = "gemini-2.0-flash"


class TrackItem(BaseModel):
    """Compact track info shown in the generated playlist result."""

    name: str
    artists: list[str] = Field(default_factory=list)
    album: str | None = None
    duration_ms: int | None = None


class PlaylistResponse(BaseModel):
    """Result of a successful playlist generation."""

    playlist_id: str
    name: str
    description: str | None = None
    track_count: int
    spotify_url: str
    ai_parameters: AudioFilters
    fallback_applied: bool = False
    tracks: list[TrackItem] = Field(default_factory=list)


class PlaylistSummary(BaseModel):
    """Compact playlist record for list views."""

    id: str
    spotify_playlist_id: str
    name: str
    track_count: int
    created_at: datetime


class PlaylistDetail(PlaylistSummary):
    """Full playlist record including prompt and ordered track list."""

    description: str | None = None
    prompt: str = ""
    tracks: list[TrackItem] = Field(default_factory=list)
