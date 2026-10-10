"""Application configuration loaded from environment variables."""

from functools import lru_cache

from pydantic_settings import BaseSettings, SettingsConfigDict


class Settings(BaseSettings):
    """Runtime settings sourced from the environment or a `.env` file."""

    model_config = SettingsConfigDict(env_file=".env", extra="ignore")

    spotify_client_id: str = ""
    spotify_client_secret: str = ""
    spotify_redirect_uri: str = "http://localhost:8000/api/auth/spotify/callback"

    database_url: str = "sqlite+aiosqlite:///./vibesift.db"

    default_ai_provider: str = "gemini"
    default_ai_model: str = "gemini-2.0-flash"

    frontend_url: str = "http://localhost:3000"
    backend_url: str = "http://localhost:8000"

    cors_origins: str = "http://localhost:3000"

    @property
    def cors_origin_list(self) -> list[str]:
        """Return configured CORS origins as a list."""
        return [origin.strip() for origin in self.cors_origins.split(",") if origin.strip()]


@lru_cache
def get_settings() -> Settings:
    """Return a cached Settings instance."""
    return Settings()
