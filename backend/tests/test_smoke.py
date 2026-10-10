"""Smoke tests for the VibeSift API surface."""

from fastapi.testclient import TestClient

from app.main import app

client = TestClient(app)


def test_health() -> None:
    """The liveness endpoint returns ok."""
    response = client.get("/api/health")
    assert response.status_code == 200
    assert response.json() == {"status": "ok"}


def test_generate_requires_ai_key() -> None:
    """Generating without an AI key returns the documented 401 shape."""
    response = client.post(
        "/api/generate-playlist",
        json={"prompt": "lagu galau akustik"},
        headers={"Authorization": "Bearer dummy-token"},
    )
    assert response.status_code == 401
    assert response.json() == {
        "detail": "Header X-AI-API-Key wajib diisi.",
        "code": "AI_KEY_MISSING",
    }


def test_generate_requires_prompt() -> None:
    """An empty prompt triggers the validation error shape."""
    response = client.post(
        "/api/generate-playlist",
        json={},
        headers={"Authorization": "Bearer dummy-token", "X-AI-API-Key": "dummy"},
    )
    assert response.status_code == 400
    assert response.json()["code"] == "PROMPT_EMPTY"
