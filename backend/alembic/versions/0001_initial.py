"""Initial tables: cached_tracks, generated_playlists, user_sessions."""

from collections.abc import Sequence

import sqlalchemy as sa
from alembic import op

revision: str = "0001_initial"
down_revision: str | None = None
branch_labels: str | Sequence[str] | None = None
depends_on: str | Sequence[str] | None = None


def upgrade() -> None:
    """Create the three MVP tables."""
    op.create_table(
        "cached_tracks",
        sa.Column("id", sa.String(36), primary_key=True),
        sa.Column("spotify_id", sa.String(255), unique=True, index=True, nullable=False),
        sa.Column("name", sa.String(255), nullable=False),
        sa.Column("artists", sa.JSON(), nullable=False),
        sa.Column("album", sa.String(255), nullable=True),
        sa.Column("duration_ms", sa.Integer(), nullable=True),
        sa.Column("danceability", sa.Float(), nullable=True),
        sa.Column("energy", sa.Float(), nullable=True),
        sa.Column("valence", sa.Float(), nullable=True),
        sa.Column("acousticness", sa.Float(), nullable=True),
        sa.Column("instrumentalness", sa.Float(), nullable=True),
        sa.Column("tempo", sa.Float(), nullable=True),
        sa.Column("added_at", sa.DateTime(), nullable=True),
        sa.Column("last_updated", sa.DateTime(), server_default=sa.func.now()),
    )
    op.create_table(
        "generated_playlists",
        sa.Column("id", sa.String(36), primary_key=True),
        sa.Column("spotify_playlist_id", sa.String(255), unique=True, nullable=False),
        sa.Column("name", sa.String(255), nullable=False),
        sa.Column("description", sa.Text(), nullable=True),
        sa.Column("prompt", sa.Text(), nullable=False),
        sa.Column("ai_parameters", sa.JSON(), nullable=True),
        sa.Column("track_count", sa.Integer(), nullable=False, server_default="0"),
        sa.Column("created_at", sa.DateTime(), server_default=sa.func.now()),
        sa.Column("user_id", sa.String(255), index=True, nullable=False),
    )
    op.create_table(
        "user_sessions",
        sa.Column("id", sa.String(36), primary_key=True),
        sa.Column(
            "spotify_user_id", sa.String(255), unique=True, index=True, nullable=False
        ),
        sa.Column("refresh_token", sa.Text(), nullable=True),
        sa.Column("created_at", sa.DateTime(), server_default=sa.func.now()),
        sa.Column(
            "updated_at",
            sa.DateTime(),
            server_default=sa.func.now(),
            onupdate=sa.func.now(),
        ),
    )


def downgrade() -> None:
    """Drop the three MVP tables."""
    op.drop_table("user_sessions")
    op.drop_table("generated_playlists")
    op.drop_table("cached_tracks")
