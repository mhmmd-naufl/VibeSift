"""Schema for the audio-feature filters produced by the AI."""

from pydantic import BaseModel, Field, model_validator

# Feature names that come as a min/max pair.
_BOUND_FEATURES = (
    "energy",
    "valence",
    "danceability",
    "acousticness",
    "instrumentalness",
    "tempo",
)


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

    @model_validator(mode="after")
    def _swap_inverted_bounds(self) -> "AudioFilters":
        """Swap a min/max pair that the AI returned inverted."""
        for feature in _BOUND_FEATURES:
            low = getattr(self, f"min_{feature}")
            high = getattr(self, f"max_{feature}")
            if low is not None and high is not None and low > high:
                setattr(self, f"min_{feature}", high)
                setattr(self, f"max_{feature}", low)
        return self


class PlaylistPlan(AudioFilters):
    """Full AI output: playlist metadata plus audio-feature filters."""

    name: str = Field(default="Vibe Playlist", max_length=100)
    description: str = Field(default="", max_length=300)
