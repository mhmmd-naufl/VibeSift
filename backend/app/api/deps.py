"""Shared FastAPI dependencies."""

from fastapi import Header

from app.core.config import get_settings
from app.core.errors import AIKeyMissingError, SpotifyTokenMissingError


async def get_ai_api_key(x_ai_api_key: str | None = Header(default=None)) -> str:
    """Extract the user's AI API key, allowing a missing key in demo mode."""
    settings = get_settings()
    if x_ai_api_key:
        return x_ai_api_key
    if settings.default_ai_api_key:
        return settings.default_ai_api_key
    if settings.is_demo:
        return "demo-key"
    raise AIKeyMissingError("Header X-AI-API-Key wajib diisi.")


async def get_spotify_token(authorization: str | None = Header(default=None)) -> str:
    """Extract the Spotify access token from the Authorization header."""
    if not authorization or not authorization.lower().startswith("bearer "):
        raise SpotifyTokenMissingError("Access token Spotify tidak ditemukan.")
    return authorization.split(" ", 1)[1]
