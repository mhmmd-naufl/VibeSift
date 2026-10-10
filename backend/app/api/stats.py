"""Dashboard statistics routes."""

from fastapi import APIRouter, Depends
from sqlalchemy import func, select
from sqlalchemy.ext.asyncio import AsyncSession

from app.api.deps import get_spotify_token
from app.db import get_session
from app.models.playlist import GeneratedPlaylist
from app.models.track import CachedTrack
from app.schemas.stats import StatsResponse
from app.services import spotify

router = APIRouter(prefix="/api", tags=["stats"])


@router.get("/stats", response_model=StatsResponse)
async def get_stats(
    token: str = Depends(get_spotify_token),
    session: AsyncSession = Depends(get_session),
) -> StatsResponse:
    """Return track, playlist, and last-sync stats for the current user."""
    user = await spotify.current_user(token)
    total_tracks = await session.scalar(select(func.count()).select_from(CachedTrack))
    total_playlists = await session.scalar(
        select(func.count())
        .select_from(GeneratedPlaylist)
        .where(GeneratedPlaylist.user_id == user["id"])
    )
    last_sync = await session.scalar(select(func.max(CachedTrack.last_updated)))
    return StatsResponse(
        total_tracks=total_tracks or 0,
        total_playlists=total_playlists or 0,
        last_sync=last_sync,
    )
