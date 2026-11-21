"""Tests for demo mode data and AI filter validation."""

from app.schemas.ai import AudioFilters
from app.services import demo_data


def test_inverted_bounds_are_swapped() -> None:
    """An AI response with min > max should not produce an empty query."""
    filters = AudioFilters(min_energy=0.9, max_energy=0.2, min_tempo=160, max_tempo=90)
    assert filters.min_energy == 0.2
    assert filters.max_energy == 0.9
    assert filters.min_tempo == 90
    assert filters.max_tempo == 160


def test_demo_catalog_is_complete() -> None:
    """Every demo track has metadata and a full feature vector."""
    tracks = demo_data.saved_tracks()
    assert len(tracks) == 240
    for item in tracks:
        track_id = item["track"]["id"]
        assert demo_data.DEMO_FEATURES[track_id]["tempo"] > 0
        assert 0 <= demo_data.DEMO_FEATURES[track_id]["energy"] <= 1


def test_demo_features_only_return_known_ids() -> None:
    """Unknown IDs are silently skipped instead of raising."""
    features = demo_data.features_for(["demo-000", "missing-track"])
    assert list(features) == ["demo-000"]


def test_demo_plan_matches_keywords() -> None:
    """Keyword presets map common prompts to distinct playlist names."""
    gym = demo_data.plan_for_prompt("playlist buat gym yang semangat")
    galau = demo_data.plan_for_prompt("lagu galau akustik buat kerja malam")
    assert gym["name"] == "Gym Beast"
    assert galau["name"] == "Late Night Acoustic"
    assert galau["min_acousticness"] > 0.5

    fallback = demo_data.plan_for_prompt("musik untuk perjalanan")
    assert fallback["name"].startswith("Vibe: ")
