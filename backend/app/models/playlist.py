"""Record of a playlist generated through VibeSift."""

import uuid
from datetime import datetime

from sqlalchemy import JSON, DateTime, Integer, String, Text, func
from sqlalchemy.orm import Mapped, mapped_column

from app.db import Base


class GeneratedPlaylist(Base):
    """A playlist that VibeSift created in the user's Spotify account."""

    __tablename__ = "generated_playlists"

    id: Mapped[str] = mapped_column(
        String(36), primary_key=True, default=lambda: str(uuid.uuid4())
    )
    spotify_playlist_id: Mapped[str] = mapped_column(String(255), unique=True)
    name: Mapped[str] = mapped_column(String(255))
    description: Mapped[str | None] = mapped_column(Text, nullable=True)
    prompt: Mapped[str] = mapped_column(Text)
    ai_parameters: Mapped[dict | None] = mapped_column(JSON, nullable=True)
    track_count: Mapped[int] = mapped_column(Integer, default=0)
    created_at: Mapped[datetime] = mapped_column(DateTime, server_default=func.now())
    user_id: Mapped[str] = mapped_column(String(255), index=True)
