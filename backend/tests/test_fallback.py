"""Tests for playlist filter relaxation (smart fallback)."""

from collections.abc import AsyncIterator
from contextlib import asynccontextmanager

import pytest
from sqlalchemy.ext.asyncio import AsyncSession, async_sessionmaker, create_async_engine
from sqlalchemy.pool import StaticPool

from app.db import Base
from app.models.track import CachedTrack
from app.schemas.ai import AudioFilters
from app.services import playlist as playlist_service


def _track(index: int, energy: float, tempo: float) -> CachedTrack:
    """Build a cached track with the given features."""
    return CachedTrack(
        spotify_id=f"track-{index}", name=f"Track {index}", artists=["Artist"],
        energy=energy, tempo=tempo,
    )


@asynccontextmanager
async def _temp_session(tracks: list[CachedTrack]) -> AsyncIterator[AsyncSession]:
    """Yield a session on an in-memory DB preloaded with `tracks`."""
    engine = create_async_engine(
        "sqlite+aiosqlite:///:memory:",
        connect_args={"check_same_thread": False},
        poolclass=StaticPool,
    )
    try:
        async with engine.begin() as conn:
            await conn.run_sync(Base.metadata.create_all)
        factory = async_sessionmaker(engine, expire_on_commit=False)
        async with factory() as session:
            session.add_all(tracks)
            await session.commit()
            yield session
    finally:
        await engine.dispose()


@pytest.mark.asyncio
async def test_exact_filters_used_when_enough_tracks() -> None:
    """No fallback when exact filters already match >= 15 tracks."""
    tracks = [_track(i, 0.8, 155.0) for i in range(20)]
    async with _temp_session(tracks) as session:
        found, fallback = await playlist_service.select_tracks_with_fallback(
            session, AudioFilters(min_energy=0.7, max_energy=0.9)
        )
    assert len(found) == 20
    assert fallback is False


@pytest.mark.asyncio
async def test_tempo_dropped_when_too_few_tracks() -> None:
    """Fallback drops tempo bounds to reach 15 tracks."""
    tracks = [_track(i, 0.8, 155.0) for i in range(3)]
    tracks += [_track(100 + i, 0.8, 100.0) for i in range(17)]
    filters = AudioFilters(min_energy=0.75, max_energy=0.85, min_tempo=150.0, max_tempo=160.0)
    async with _temp_session(tracks) as session:
        found, fallback = await playlist_service.select_tracks_with_fallback(session, filters)
    assert fallback is True
    assert len(found) == 20


@pytest.mark.asyncio
async def test_empty_db_returns_nothing() -> None:
    """Empty cache yields no tracks so the API can raise its 404-style error."""
    async with _temp_session([]) as session:
        found, fallback = await playlist_service.select_tracks_with_fallback(
            session, AudioFilters(min_energy=0.5)
        )
    assert found == []
    assert fallback is True
