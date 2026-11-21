"""Offline demo adapter that mimics the Spotify service surface.

Demo mode lets the whole product run without a Spotify app, Premium account,
or any network call. Playlists are still recorded in the local database.
"""

import uuid
from typing import Any

from app.core.config import get_settings
from app.services import demo_data

DEMO_TOKEN = "demo-access-token"
DEMO_REFRESH_TOKEN = "demo-refresh-token"


def authorize_url() -> str:
    """Redirect straight to the frontend callback with a demo code."""
    return f"{get_settings().frontend_url}/auth/callback?code=demo"


async def exchange_code(_: str) -> dict[str, Any]:
    """Return a static token payload for the demo session."""
    return _token_payload()


async def refresh_access_token(_: str) -> dict[str, Any]:
    """Return a fresh static token payload."""
    return _token_payload()


async def current_user(_: str) -> dict[str, Any]:
    """Return the demo listener profile."""
    return {"id": "demo-user", "display_name": "Demo Listener"}


async def fetch_saved_tracks(_: str) -> list[dict[str, Any]]:
    """Return the bundled sample library."""
    return demo_data.saved_tracks()


def fetch_audio_features(track_ids: list[str]) -> dict[str, dict[str, float]]:
    """Return bundled features for the demo catalog."""
    return demo_data.features_for(track_ids)


async def create_playlist(
    _: str, name: str, description: str
) -> dict[str, Any]:
    """Pretend to create a playlist and return a demo identifier."""
    return {
        "id": f"demoplaylist{uuid.uuid4().hex[:12]}",
        "name": name,
        "description": description,
        "external_urls": {"spotify": ""},
        "demo": True,
    }


async def unfollow_playlist(_: str, __: str) -> None:
    """No-op: nothing to unfollow in demo mode."""
    return None


def _token_payload() -> dict[str, Any]:
    """Build the token response consumed by the auth routes."""
    return {
        "access_token": DEMO_TOKEN,
        "refresh_token": DEMO_REFRESH_TOKEN,
        "expires_in": 3600,
    }
