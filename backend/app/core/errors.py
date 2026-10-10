"""Error types shared across services."""


class VibeSiftError(Exception):
    """Base class for domain errors surfaced to the API layer."""

    code = "INTERNAL_ERROR"
    status_code = 500

    def __init__(self, detail: str) -> None:
        super().__init__(detail)
        self.detail = detail


class AIInvalidJSONError(VibeSiftError):
    """The AI did not return valid, schema-conforming JSON."""

    code = "AI_INVALID_JSON"
    status_code = 422


class UpstreamError(VibeSiftError):
    """An upstream provider (Spotify or AI) failed."""

    code = "UPSTREAM_ERROR"
    status_code = 502


class AIKeyMissingError(VibeSiftError):
    """The X-AI-API-Key header was not provided."""

    code = "AI_KEY_MISSING"
    status_code = 401


class SpotifyTokenMissingError(VibeSiftError):
    """No Spotify access token was supplied by the client."""

    code = "SPOTIFY_TOKEN_MISSING"
    status_code = 401


class SpotifyRateLimitError(VibeSiftError):
    """Spotify returned HTTP 429."""

    code = "SPOTIFY_RATE_LIMIT"
    status_code = 429


class NoTracksError(VibeSiftError):
    """No cached tracks matched the generated filters."""

    code = "NO_TRACKS"
    status_code = 404
