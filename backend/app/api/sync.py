"""Routes that sync Liked Songs from Spotify into the local cache."""

import time
from datetime import datetime, timezone
from typing import Any

from fastapi import APIRouter, Depends
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from app.api.deps import get_spotify_token
from app.db import get_session
from app.models.track import CachedTrack
from app.services import spotify, sync_progress

router = APIRouter(prefix="/api/sync", tags=["sync"])


@router.get("/progress")
async def sync_progress_endpoint(token: str = Depends(get_spotify_token)) -> dict[str, Any]:
    """Return the current user's in-progress sync snapshot."""
    user = await spotify.current_user(token)
    return sync_progress.snapshot(user["id"])


@router.post("/liked-songs")
async def sync_liked_songs(
    token: str = Depends(get_spotify_token),
    session: AsyncSession = Depends(get_session),
) -> dict[str, Any]:
    """Fetch all Liked Songs with audio features and upsert them locally."""
    started = time.monotonic()
    user = await spotify.current_user(token)
    user_id = user["id"]
    sync_progress.start(user_id)
    try:
        saved = _valid_items(
            await spotify.fetch_saved_tracks(
                token, on_progress=lambda n: sync_progress.update(user_id, tracks=n)
            )
        )
        track_ids = [item["track"]["id"] for item in saved]
        sync_progress.update(
            user_id,
            phase="fetching_features",
            features_total=len(track_ids),
            features_done=0,
        )
        features = await spotify.fetch_audio_features(
            token,
            track_ids,
            on_progress=lambda n: sync_progress.update(
                user_id, features_done=sync_progress.snapshot(user_id).get("features_done", 0) + n
            ),
        )
        sync_progress.update(user_id, phase="saving", features_done=len(track_ids))
        await _upsert_tracks(session, saved, features)
        await session.commit()
    except Exception as exc:
        sync_progress.update(user_id, done=True, error=str(exc)[:200])
        raise
    sync_progress.update(user_id, phase="done", done=True)
    return {
        "synced_count": len(saved),
        "duration_ms": int((time.monotonic() - started) * 1000),
        "last_sync": datetime.now(timezone.utc),
    }


def _valid_items(saved: list[dict[str, Any]]) -> list[dict[str, Any]]:
    """Keep only playable tracks with an ID (drop local files and episodes)."""
    items: list[dict[str, Any]] = []
    for item in saved:
        track = item.get("track")
        if not track or not track.get("id"):
            continue
        if track.get("type", "track") != "track":
            continue
        items.append(item)
    return items


async def _upsert_tracks(
    session: AsyncSession, saved: list[dict[str, Any]], features: dict[str, Any]
) -> None:
    """Insert or update cached tracks from raw Spotify payloads."""
    ids = [item["track"]["id"] for item in saved]
    result = await session.execute(
        select(CachedTrack).where(CachedTrack.spotify_id.in_(ids))
    )
    existing = {track.spotify_id: track for track in result.scalars()}
    for item in saved:
        track = item["track"]
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
