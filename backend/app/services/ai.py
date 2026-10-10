"""Translate natural-language prompts into playlist plans via LiteLLM."""

import json

import litellm
from pydantic import ValidationError

from app.core.errors import AIInvalidJSONError, UpstreamError
from app.schemas.ai import PlaylistPlan

AI_SYSTEM_PROMPT = """
Kamu adalah kurator musik Spotify expert.
Terjemahkan request user menjadi sebuah rencana playlist dalam JSON.

Balas HANYA dengan JSON valid berisi field berikut:
- "name": nama playlist singkat dan estetik (maks 100 karakter)
- "description": deskripsi playlist singkat (maks 300 karakter)
- "min_energy"/"max_energy": 0.0-1.0 (1.0 = sangat energetik)
- "min_valence"/"max_valence": 0.0-1.0 (1.0 = happy, 0.0 = sad)
- "min_danceability"/"max_danceability": 0.0-1.0
- "min_acousticness"/"max_acousticness": 0.0-1.0
- "min_instrumentalness"/"max_instrumentalness": 0.0-1.0
- "min_tempo"/"max_tempo": BPM (misal 80-160)

ATURAN:
1. JANGAN ada teks lain, markdown, atau penjelasan.
2. Gunakan range yang realistis, jangan terlalu sempit.
3. Jika user tidak spesifik, gunakan range lebar (0.0-1.0) atau biarkan kosong.
""".strip()


async def prompt_to_plan(
    prompt: str, provider: str, model: str, api_key: str
) -> PlaylistPlan:
    """Translate a prompt into a PlaylistPlan, retrying once on invalid JSON."""
    for attempt in range(2):
        content = await _complete(prompt, provider, model, api_key)
        try:
            return PlaylistPlan.model_validate(json.loads(content))
        except (json.JSONDecodeError, ValidationError) as exc:
            if attempt == 1:
                raise AIInvalidJSONError(
                    "AI tidak menghasilkan JSON yang valid."
                ) from exc
    raise AIInvalidJSONError("AI tidak menghasilkan JSON yang valid.")


async def _complete(prompt: str, provider: str, model: str, api_key: str) -> str:
    """Call the configured AI provider and return raw text content."""
    try:
        response = await litellm.acompletion(
            model=f"{provider}/{model}",
            api_key=api_key,
            messages=[
                {"role": "system", "content": AI_SYSTEM_PROMPT},
                {"role": "user", "content": prompt},
            ],
            response_format={"type": "json_object"},
            temperature=0.2,
        )
    except Exception as exc:  # provider-specific errors from LiteLLM
        raise UpstreamError("Gagal menghubungi AI provider.") from exc
    return response.choices[0].message.content or ""
