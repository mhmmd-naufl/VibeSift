"""Schema for the audio-feature filters produced by the AI."""

from pydantic import BaseModel, Field


class AudioFilters(BaseModel):
    """Numeric bounds used to query cached tracks.

    All values are optional; a missing bound means "no constraint".
    Audio feature values are 0.0-1.0 except tempo, which is BPM.
    """

    min_energy: float | None = Field(default=None, ge=0, le=1)
    max_energy: float | None = Field(default=None, ge=0, le=1)
    min_valence: float | None = Field(default=None, ge=0, le=1)
    max_valence: float | None = Field(default=None, ge=0, le=1)
    min_danceability: float | None = Field(default=None, ge=0, le=1)
    max_danceability: float | None = Field(default=None, ge=0, le=1)
    min_acousticness: float | None = Field(default=None, ge=0, le=1)
    max_acousticness: float | None = Field(default=None, ge=0, le=1)
    min_instrumentalness: float | None = Field(default=None, ge=0, le=1)
    max_instrumentalness: float | None = Field(default=None, ge=0, le=1)
    min_tempo: float | None = Field(default=None, ge=0)
    max_tempo: float | None = Field(default=None, ge=0)


class PlaylistPlan(AudioFilters):
    """Full AI output: playlist metadata plus audio-feature filters."""

    name: str = Field(default="Vibe Playlist", max_length=100)
    description: str = Field(default="", max_length=300)
