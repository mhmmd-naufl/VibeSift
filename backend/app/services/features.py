"""Audio-feature lookup backed by the free ReccoBeats API.

Spotify retired its own audio-features endpoint for new apps in 2024, so the
cached feature vector now comes from ReccoBeats, which accepts Spotify IDs.
"""

import asyncio
from typing import Any

import httpx

from app.core.config import get_settings

_CHUNK = 40
_MAX_ATTEMPTS = 3
_FIELDS = (
    "danceability",
    "energy",
    "valence",
    "acousticness",
    "instrumentalness",
    "tempo",
)


async def fetch_audio_features(
    track_ids: list[str], on_progress: Any = None
) -> dict[str, dict[str, float]]:
    """Return features keyed by Spotify track ID, skipping unknown tracks."""
    if not track_ids:
        return {}
    chunks = [track_ids[i : i + _CHUNK] for i in range(0, len(track_ids), _CHUNK)]
    semaphore = asyncio.Semaphore(3)
    settings = get_settings()
    async with httpx.AsyncClient(base_url=settings.reccobeats_base_url, timeout=20) as client:
        results = await asyncio.gather(
            *(_fetch_chunk(client, chunk, semaphore, on_progress) for chunk in chunks)
        )
    features: dict[str, dict[str, float]] = {}
    for part in results:
        features.update(part)
    return features


async def _fetch_chunk(
    client: httpx.AsyncClient,
    track_ids: list[str],
    semaphore: asyncio.Semaphore,
    on_progress: Any = None,
) -> dict[str, dict[str, float]]:
    """Fetch one batch, retrying transient failures without failing the sync."""
    async with semaphore:
        result: dict[str, dict[str, float]] = {}
        for attempt in range(_MAX_ATTEMPTS):
            try:
                response = await client.get(
                    "/v1/audio-features", params={"ids": ",".join(track_ids)}
                )
            except httpx.HTTPError:
                await asyncio.sleep(1 + attempt)
                continue
            if response.status_code == 429:
                await asyncio.sleep(2 + attempt * 2)
                continue
            if response.status_code >= 400:
                break
            result = _parse(response.json())
            break
        if on_progress is not None:
            on_progress(len(track_ids))
        return result


def _parse(payload: dict[str, Any]) -> dict[str, dict[str, float]]:
    """Map a ReccoBeats response to feature vectors keyed by Spotify ID."""
    features: dict[str, dict[str, float]] = {}
    for item in payload.get("content", []):
        track_id = _spotify_id(item.get("href"))
        if track_id is None:
            continue
        values = {field: item[field] for field in _FIELDS if item.get(field) is not None}
        if values:
            features[track_id] = values
    return features


def _spotify_id(href: str | None) -> str | None:
    """Extract a Spotify track ID from a ReccoBeats `href` URL."""
    if not href:
        return None
    return href.rstrip("/").rsplit("/", 1)[-1] or None
