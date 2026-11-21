"""Application configuration loaded from environment variables."""

from functools import lru_cache

from pydantic_settings import BaseSettings, SettingsConfigDict


class Settings(BaseSettings):
    """Runtime settings sourced from the environment or a `.env` file."""

    model_config = SettingsConfigDict(env_file=".env", extra="ignore")

    spotify_client_id: str = ""
    spotify_client_secret: str = ""
    spotify_redirect_uri: str = "http://127.0.0.1:3000/auth/callback"

    # "real" talks to Spotify; "demo" runs fully offline with sample data.
    spotify_mode: str = "real"
    reccobeats_base_url: str = "https://api.reccobeats.com"

    database_url: str = "sqlite+aiosqlite:///./vibesift.db"

    default_ai_provider: str = "gemini"
    default_ai_model: str = "gemini-2.0-flash"
    # Optional server-side fallback AI key (local dev). Users can still
    # override per-request via the X-AI-API-Key header (BYOK).
    default_ai_api_key: str = ""

    frontend_url: str = "http://127.0.0.1:3000"
    backend_url: str = "http://127.0.0.1:8000"

    cors_origins: str = "http://localhost:3000,http://127.0.0.1:3000"

    @property
    def is_demo(self) -> bool:
        """Return True when the app runs in offline demo mode."""
        return self.spotify_mode.strip().lower() == "demo"

    @property
    def cors_origin_list(self) -> list[str]:
        """Return configured CORS origins as a list."""
        return [origin.strip() for origin in self.cors_origins.split(",") if origin.strip()]


@lru_cache
def get_settings() -> Settings:
    """Return a cached Settings instance."""
    return Settings()
