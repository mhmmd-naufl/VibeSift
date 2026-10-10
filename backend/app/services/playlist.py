"""Query cached tracks using audio-feature filters."""

from sqlalchemy import Select, select
from sqlalchemy.ext.asyncio import AsyncSession

from app.models.track import CachedTrack
from app.schemas.ai import AudioFilters

# Maps a model column to its (min, max) filter attribute names.
_FEATURE_BOUNDS: dict[str, tuple[str, str]] = {
    "energy": ("min_energy", "max_energy"),
    "valence": ("min_valence", "max_valence"),
    "danceability": ("min_danceability", "max_danceability"),
    "acousticness": ("min_acousticness", "max_acousticness"),
    "instrumentalness": ("min_instrumentalness", "max_instrumentalness"),
    "tempo": ("min_tempo", "max_tempo"),
}


def build_query(filters: AudioFilters, limit: int) -> Select:
    """Build a SELECT for cached tracks constrained by the given filters."""
    stmt = select(CachedTrack)
    for column, (min_key, max_key) in _FEATURE_BOUNDS.items():
        attr = getattr(CachedTrack, column)
        min_value = getattr(filters, min_key)
        max_value = getattr(filters, max_key)
        if min_value is not None:
            stmt = stmt.where(attr >= min_value)
        if max_value is not None:
            stmt = stmt.where(attr <= max_value)
    return stmt.limit(limit)


async def select_tracks(
    session: AsyncSession, filters: AudioFilters, limit: int = 30
) -> list[CachedTrack]:
    """Return up to `limit` cached tracks matching the filters."""
    result = await session.execute(build_query(filters, limit))
    return list(result.scalars().all())
