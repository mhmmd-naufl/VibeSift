"""Spotify service facade.

Dispatches to the real Web API client or the offline demo adapter based on
`SPOTIFY_MODE`. Routes only talk to this module.
"""

from typing import Any

from app.core.config import get_settings
from app.services import demo, features, spotify_api


def _is_demo() -> bool:
    """Return True when the whole backend runs in demo mode."""
    return get_settings().is_demo


def _use_demo(token: str | None = None) -> bool:
    """Demo applies globally, or per-session for `demo-` prefixed tokens."""
    return _is_demo() or bool(token and token.startswith("demo-"))


def authorize_url() -> str:
    """Return the URL the frontend should redirect the user to for login."""
    return demo.authorize_url() if _is_demo() else spotify_api.authorize_url()


async def exchange_code(code: str) -> dict[str, Any]:
    """Exchange an OAuth code for tokens and profile information."""
    return await demo.exchange_code(code) if _is_demo() else await spotify_api.exchange_code(code)


async def refresh_access_token(refresh_token: str) -> dict[str, Any]:
    """Exchange a refresh token for a new access token."""
    if _use_demo(refresh_token):
        return await demo.refresh_access_token(refresh_token)
    return await spotify_api.refresh_access_token(refresh_token)


async def current_user(access_token: str) -> dict[str, Any]:
    """Return the authenticated Spotify profile."""
    return (
        await demo.current_user(access_token)
        if _use_demo(access_token)
        else await spotify_api.current_user(access_token)
    )


async def fetch_saved_tracks(
    access_token: str, on_progress: Any = None
) -> list[dict[str, Any]]:
    """Return every saved track, newest first."""
    return (
        await demo.fetch_saved_tracks(access_token)
        if _use_demo(access_token)
        else await spotify_api.fetch_saved_tracks(access_token, on_progress)
    )


async def fetch_audio_features(
    access_token: str,
    track_ids: list[str],
    on_progress: Any = None,
) -> dict[str, dict[str, float]]:
    """Return audio features keyed by Spotify track ID."""
    if _use_demo(access_token):
        return demo.fetch_audio_features(track_ids)
    return await features.fetch_audio_features(track_ids, on_progress)


async def create_playlist(
    access_token: str, name: str, description: str, track_ids: list[str]
) -> dict[str, Any]:
    """Create a playlist, add the tracks, and return the playlist payload."""
    if _use_demo(access_token):
        return await demo.create_playlist(access_token, name, description)
    playlist = await spotify_api.create_playlist(access_token, name, description)
    if track_ids:
        await spotify_api.add_items(access_token, playlist["id"], track_ids)
    return playlist


async def unfollow_playlist(access_token: str, playlist_id: str) -> None:
    """Remove a playlist from the user's Spotify library."""
    if _use_demo(access_token):
        await demo.unfollow_playlist(access_token, playlist_id)
        return
    await spotify_api.unfollow_playlist(access_token, playlist_id)


async def demo_session() -> dict[str, Any]:
    """Issue a demo session token regardless of the global mode."""
    return await demo.exchange_code("demo")
