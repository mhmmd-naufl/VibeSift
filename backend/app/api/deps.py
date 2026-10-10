"""Shared FastAPI dependencies."""

from fastapi import Header

from app.core.errors import AIKeyMissingError, SpotifyTokenMissingError


async def get_ai_api_key(x_ai_api_key: str | None = Header(default=None)) -> str:
    """Extract the user's AI API key from the request headers."""
    if not x_ai_api_key:
        raise AIKeyMissingError("Header X-AI-API-Key wajib diisi.")
    return x_ai_api_key


async def get_spotify_token(authorization: str | None = Header(default=None)) -> str:
    """Extract the Spotify access token from the Authorization header."""
    if not authorization or not authorization.lower().startswith("bearer "):
        raise SpotifyTokenMissingError("Access token Spotify tidak ditemukan.")
    return authorization.split(" ", 1)[1]
