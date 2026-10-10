"""Cached Spotify track with its audio features."""

import uuid
from datetime import datetime

from sqlalchemy import JSON, DateTime, Float, Integer, String, func
from sqlalchemy.orm import Mapped, mapped_column

from app.db import Base


class CachedTrack(Base):
    """A Liked Song cached locally, including audio features."""

    __tablename__ = "cached_tracks"

    id: Mapped[str] = mapped_column(
        String(36), primary_key=True, default=lambda: str(uuid.uuid4())
    )
    spotify_id: Mapped[str] = mapped_column(String(255), unique=True, index=True)
    name: Mapped[str] = mapped_column(String(255))
    artists: Mapped[list] = mapped_column(JSON, default=list)
    album: Mapped[str | None] = mapped_column(String(255), nullable=True)
    duration_ms: Mapped[int | None] = mapped_column(Integer, nullable=True)

    # Audio features
    danceability: Mapped[float | None] = mapped_column(Float, nullable=True)
    energy: Mapped[float | None] = mapped_column(Float, nullable=True)
    valence: Mapped[float | None] = mapped_column(Float, nullable=True)
    acousticness: Mapped[float | None] = mapped_column(Float, nullable=True)
    instrumentalness: Mapped[float | None] = mapped_column(Float, nullable=True)
    tempo: Mapped[float | None] = mapped_column(Float, nullable=True)

    # Metadata
    added_at: Mapped[datetime | None] = mapped_column(DateTime, nullable=True)
    last_updated: Mapped[datetime] = mapped_column(DateTime, server_default=func.now())
