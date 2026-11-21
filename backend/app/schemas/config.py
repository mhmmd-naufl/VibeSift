"""Schema for the public runtime configuration endpoint."""

from pydantic import BaseModel


class AppConfig(BaseModel):
    """Runtime flags the frontend needs before rendering the app."""

    demo_mode: bool = False
    demo_available: bool = True
    default_provider: str = "gemini"
    default_model: str = "gemini-2.0-flash"
    has_server_ai_key: bool = False
