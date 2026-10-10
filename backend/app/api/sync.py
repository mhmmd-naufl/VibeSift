"""Routes that sync Liked Songs from Spotify into the local cache."""

from datetime import datetime, timezone
from typing import Any

from fastapi import APIRouter, Depends
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from app.api.deps import get_spotify_token
from app.db import get_session
from app.models.track import CachedTrack
from app.services import spotify

router = APIRouter(prefix="/api/sync", tags=["sync"])


@router.post("/liked-songs")
async def sync_liked_songs(
    token: str = Depends(get_spotify_token),
    session: AsyncSession = Depends(get_session),
) -> dict[str, Any]:
    """Fetch all Liked Songs with audio features and upsert them locally."""
    saved = await spotify.fetch_saved_tracks(token)
    track_ids = [item["track"]["id"] for item in saved if item.get("track")]
    features = await spotify.fetch_audio_features(token, track_ids)
    features_by_id = {feature["id"]: feature for feature in features}
    await _upsert_tracks(session, saved, features_by_id)
    await session.commit()
    return {
        "synced_count": len(saved),
        "last_sync": datetime.now(timezone.utc),
    }


async def _upsert_tracks(
    session: AsyncSession, saved: list[dict[str, Any]], features: dict[str, Any]
) -> None:
    """Insert or update cached tracks from raw Spotify payloads."""
    ids = [item["track"]["id"] for item in saved if item.get("track")]
    result = await session.execute(
        select(CachedTrack).where(CachedTrack.spotify_id.in_(ids))
    )
    existing = {track.spotify_id: track for track in result.scalars()}
    for item in saved:
        track = item.get("track")
        if not track:
            continue
        record = existing.get(track["id"]) or CachedTrack(spotify_id=track["id"])
        _apply(record, track, features.get(track["id"], {}), item.get("added_at"))
        session.add(record)


def _apply(
    record: CachedTrack, track: dict[str, Any], feature: dict[str, Any], added_at: str | None
) -> None:
    """Copy Spotify track, audio-feature, and timestamp fields onto a record."""
    record.name = track.get("name") or "Unknown"
    record.artists = [artist["name"] for artist in track.get("artists", [])]
    record.album = (track.get("album") or {}).get("name")
    record.duration_ms = track.get("duration_ms")
    record.danceability = feature.get("danceability")
    record.energy = feature.get("energy")
    record.valence = feature.get("valence")
    record.acousticness = feature.get("acousticness")
    record.instrumentalness = feature.get("instrumentalness")
    record.tempo = feature.get("tempo")
    record.added_at = _parse_datetime(added_at)
    record.last_updated = datetime.now(timezone.utc)


def _parse_datetime(value: str | None) -> datetime | None:
    """Parse an ISO-8601 timestamp from Spotify, returning None on failure."""
    if not value:
        return None
    try:
        return datetime.fromisoformat(value.replace("Z", "+00:00"))
    except ValueError:
        return None
