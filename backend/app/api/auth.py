"""Spotify OAuth routes."""

from fastapi import APIRouter, Query
from fastapi.responses import RedirectResponse

from app.schemas.auth import RefreshRequest, TokenResponse
from app.services import spotify

router = APIRouter(prefix="/api/auth/spotify", tags=["auth"])


@router.get("/login")
async def login() -> RedirectResponse:
    """Redirect the user to Spotify's authorization page."""
    return RedirectResponse(spotify.authorize_url())


@router.get("/callback", response_model=TokenResponse)
async def callback(code: str = Query(...)) -> TokenResponse:
    """Handle the OAuth callback, returning tokens and the user profile."""
    token = await spotify.exchange_code(code)
    return await _token_response(token)


@router.post("/refresh", response_model=TokenResponse)
async def refresh(payload: RefreshRequest) -> TokenResponse:
    """Exchange a refresh token for a new access token."""
    token = await spotify.refresh_access_token(payload.refresh_token)
    return await _token_response(token)


async def _token_response(token: dict) -> TokenResponse:
    """Build a TokenResponse from raw Spotipy token info."""
    user = await spotify.current_user(token["access_token"])
    return TokenResponse(
        access_token=token["access_token"],
        expires_in=int(token.get("expires_in", 3600)),
        user={"id": user["id"], "display_name": user.get("display_name")},
    )
