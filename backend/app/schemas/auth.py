"""Schemas for Spotify authentication."""

from pydantic import BaseModel


class SpotifyUser(BaseModel):
    """Minimal Spotify profile returned after login."""

    id: str
    display_name: str | None = None


class TokenResponse(BaseModel):
    """Response for the OAuth callback and token refresh."""

    access_token: str
    expires_in: int
    user: SpotifyUser


class RefreshRequest(BaseModel):
    """Payload for POST /api/auth/spotify/refresh."""

    refresh_token: str
