"""Add track_ids to generated_playlists for detail views."""

from collections.abc import Sequence

import sqlalchemy as sa
from alembic import op

revision: str = "0002_playlist_track_ids"
down_revision: str | None = "0001_initial"
branch_labels: str | Sequence[str] | None = None
depends_on: str | Sequence[str] | None = None


def upgrade() -> None:
    """Store the Spotify track IDs chosen for each generated playlist."""
    op.add_column(
        "generated_playlists",
        sa.Column("track_ids", sa.JSON(), nullable=True),
    )


def downgrade() -> None:
    """Drop the track_ids column."""
    op.drop_column("generated_playlists", "track_ids")
