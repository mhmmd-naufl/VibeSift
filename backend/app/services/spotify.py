"""Thin async wrapper around Spotipy for the operations VibeSift needs."""

import asyncio
from typing import Any

from spotipy import Spotify, SpotifyOAuth
from spotipy.exceptions import SpotifyException

from app.core.config import get_settings
from app.core.errors import SpotifyRateLimitError, UpstreamError

SCOPES = "user-library-read playlist-modify-public playlist-modify-private"

_PAGE_LIMIT = 50
_FEATURE_CHUNK = 100


def _oauth() -> SpotifyOAuth:
    """Build a SpotifyOAuth helper from application settings."""
    settings = get_settings()
    return SpotifyOAuth(
        client_id=settings.spotify_client_id,
        client_secret=settings.spotify_client_secret,
        redirect_uri=settings.spotify_redirect_uri,
        scope=SCOPES,
        show_dialog=True,
    )


def authorize_url() -> str:
    """Return the Spotify authorization URL to redirect the user to."""
    return _oauth().get_authorize_url()


async def exchange_code(code: str) -> dict[str, Any]:
    """Exchange an OAuth code for token info."""
    oauth = _oauth()
    return await _run(oauth.get_access_token, code, as_dict=True)


async def refresh_access_token(refresh_token: str) -> dict[str, Any]:
    """Use a refresh token to obtain a new access token."""
    oauth = _oauth()
    return await _run(oauth.refresh_access_token, refresh_token)


async def current_user(access_token: str) -> dict[str, Any]:
    """Return the authenticated Spotify user's profile."""
    return await _run(_client(access_token).current_user)


async def fetch_saved_tracks(access_token: str) -> list[dict[str, Any]]:
    """Fetch every saved (liked) track, handling pagination."""
    sp = _client(access_token)
    items: list[dict[str, Any]] = []
    page = await _run(sp.current_user_saved_tracks, _PAGE_LIMIT)
    while page:
        items.extend(page.get("items", []))
        page = await _run(sp.next, page) if page.get("next") else None
    return items


async def fetch_audio_features(
    access_token: str, track_ids: list[str]
) -> list[dict[str, Any]]:
    """Fetch audio features for track IDs in chunks of 100."""
    sp = _client(access_token)
    features: list[dict[str, Any]] = []
    for start in range(0, len(track_ids), _FEATURE_CHUNK):
        chunk = track_ids[start : start + _FEATURE_CHUNK]
        result = await _run(sp.audio_features, chunk) or []
        features.extend(feature for feature in result if feature)
    return features


async def create_playlist(
    access_token: str, user_id: str, name: str, description: str, track_ids: list[str]
) -> dict[str, Any]:
    """Create a private playlist and add the given tracks to it."""
    sp = _client(access_token)
    playlist = await _run(
        sp.user_playlist_create, user_id, name, False, description
    )
    uris = [f"spotify:track:{track_id}" for track_id in track_ids]
    for start in range(0, len(uris), _FEATURE_CHUNK):
        await _run(sp.playlist_add_items, playlist["id"], uris[start : start + _FEATURE_CHUNK])
    return playlist


async def unfollow_playlist(access_token: str, playlist_id: str) -> None:
    """Remove a playlist from the user's Spotify library.

    Spotify does not expose true deletion; unfollowing is the closest
    available action and removes it from the user's account view.
    """
    await _run(_client(access_token).current_user_unfollow_playlist, playlist_id)


def _client(access_token: str) -> Spotify:
    """Return an authenticated Spotipy client."""
    return Spotify(auth=access_token)


async def _run(func: Any, *args: Any, **kwargs: Any) -> Any:
    """Run a blocking Spotipy call in a worker thread with error mapping."""
    try:
        return await asyncio.to_thread(func, *args, **kwargs)
    except SpotifyException as exc:
        if exc.http_status == 429:
            raise SpotifyRateLimitError("Terkena rate limit Spotify.") from exc
        raise UpstreamError("Spotify API gagal merespons.") from exc
