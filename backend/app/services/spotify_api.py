"""Async Spotify Web API client.

Uses the endpoints that still exist for Development Mode apps after the
February 2026 Web API migration: `/me/playlists` and `/playlists/{id}/items`.
Spotipy's high-level helpers still call retired URLs, so HTTPX is used instead.
"""

import asyncio
import base64
import logging
from typing import Any
from urllib.parse import urlencode

import httpx

from app.core.config import get_settings
from app.core.errors import SpotifyRateLimitError, UpstreamError

_API = "https://api.spotify.com/v1"
_TOKEN_URL = "https://accounts.spotify.com/api/token"
_SCOPES = "user-library-read playlist-modify-public playlist-modify-private"
_PAGE = 50
_BATCH = 100
_MAX_ATTEMPTS = 3

logger = logging.getLogger(__name__)


def authorize_url() -> str:
    """Return the Spotify authorization URL for the configured app."""
    settings = get_settings()
    query = urlencode(
        {
            "client_id": settings.spotify_client_id,
            "response_type": "code",
            "redirect_uri": settings.spotify_redirect_uri,
            "scope": _SCOPES,
            "show_dialog": "true",
        }
    )
    return f"https://accounts.spotify.com/authorize?{query}"


async def exchange_code(code: str) -> dict[str, Any]:
    """Exchange an OAuth authorization code for tokens."""
    return await _token_request(
        {"grant_type": "authorization_code", "code": code, "redirect_uri": _redirect_uri()}
    )


async def refresh_access_token(refresh_token: str) -> dict[str, Any]:
    """Exchange a refresh token for a new access token."""
    return await _token_request(
        {"grant_type": "refresh_token", "refresh_token": refresh_token}
    )


async def current_user(access_token: str) -> dict[str, Any]:
    """Return the authenticated Spotify profile."""
    payload = await _json("GET", "/me", access_token)
    if not payload.get("id"):
        raise UpstreamError("Spotify tidak mengembalikan profil user.")
    return payload


async def fetch_saved_tracks(
    access_token: str, on_progress: Any = None
) -> list[dict[str, Any]]:
    """Fetch every saved track using 50-item offset pagination."""
    items: list[dict[str, Any]] = []
    offset = 0
    while True:
        payload = await _json(
            "GET", "/me/tracks", access_token, params={"limit": _PAGE, "offset": offset}
        )
        page = payload.get("items", [])
        items.extend(page)
        if on_progress is not None:
            on_progress(len(items))
        if not payload.get("next") or not page:
            return items
        offset += _PAGE


async def create_playlist(
    access_token: str, name: str, description: str
) -> dict[str, Any]:
    """Create a private playlist for the current user."""
    body = {"name": name, "description": description, "public": False}
    return await _json("POST", "/me/playlists", access_token, json=body)


async def add_items(access_token: str, playlist_id: str, track_ids: list[str]) -> None:
    """Append tracks to a playlist in batches of 100."""
    for start in range(0, len(track_ids), _BATCH):
        uris = [f"spotify:track:{track_id}" for track_id in track_ids[start : start + _BATCH]]
        await _json("POST", f"/playlists/{playlist_id}/items", access_token, json={"uris": uris})


async def unfollow_playlist(access_token: str, playlist_id: str) -> None:
    """Remove a playlist from the user's library via the generic library API."""
    await _json(
        "DELETE",
        "/me/library",
        access_token,
        params={"uris": f"spotify:playlist:{playlist_id}"},
    )


async def _token_request(data: dict[str, str]) -> dict[str, Any]:
    """POST to the Spotify accounts service with client credentials."""
    settings = get_settings()
    auth = base64.b64encode(
        f"{settings.spotify_client_id}:{settings.spotify_client_secret}".encode()
    ).decode()
    try:
        async with httpx.AsyncClient(timeout=20) as client:
            response = await client.post(
                _TOKEN_URL,
                data=data,
                headers={"Authorization": f"Basic {auth}"},
            )
    except httpx.HTTPError as exc:
        raise UpstreamError("Gagal menghubungi Spotify.") from exc
    if response.status_code >= 400:
        logger.warning(
            "Spotify token request failed: %s %s",
            response.status_code,
            response.text[:500],
        )
        raise UpstreamError("Spotify menolak permintaan token.")
    return response.json()


async def _json(method: str, path: str, token: str, **kwargs: Any) -> dict[str, Any]:
    """Call the Spotify API with retries and map failures to domain errors."""
    headers = {"Authorization": f"Bearer {token}"}
    async with httpx.AsyncClient(base_url=_API, timeout=20) as client:
        for attempt in range(_MAX_ATTEMPTS):
            try:
                response = await client.request(method, path, headers=headers, **kwargs)
            except httpx.HTTPError as exc:
                if attempt == _MAX_ATTEMPTS - 1:
                    raise UpstreamError("Spotify API gagal merespons.") from exc
                await asyncio.sleep(1 + attempt)
                continue
            if response.status_code == 429:
                if attempt == _MAX_ATTEMPTS - 1:
                    raise SpotifyRateLimitError("Terkena rate limit Spotify.")
                await asyncio.sleep(_retry_after(response, attempt))
                continue
            if response.status_code >= 500:
                if attempt == _MAX_ATTEMPTS - 1:
                    raise UpstreamError("Spotify API sedang bermasalah.")
                await asyncio.sleep(1 + attempt)
                continue
            if response.status_code >= 400:
                logger.warning(
                    "Spotify API %s %s failed: %s %s",
                    method,
                    path,
                    response.status_code,
                    response.text[:500],
                )
                raise UpstreamError("Spotify API menolak permintaan.")
            if not response.content:
                return {}
            return response.json()
    raise UpstreamError("Spotify API gagal merespons.")


def _redirect_uri() -> str:
    """Return the configured OAuth redirect URI."""
    return get_settings().spotify_redirect_uri


def _retry_after(response: httpx.Response, attempt: int) -> float:
    """Read Retry-After when present, otherwise back off exponentially."""
    value = response.headers.get("Retry-After")
    if value:
        try:
            return min(float(value), 30.0)
        except ValueError:
            pass
    return 1.5 * (attempt + 1)
