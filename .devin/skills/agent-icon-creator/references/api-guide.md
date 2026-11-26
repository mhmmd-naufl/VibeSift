# API Guide — Nano Banana (Gemini Image Generation)

## Endpoint

Google AI Studio Generative Language API:

```
POST https://generativelanguage.googleapis.com/v1beta/models/{model}:generateContent?key={GOOGLE_AI_STUDIO_API_KEY}
```

Model: `gemini-2.5-flash-image` (Nano Banana). Preview variants may use `-preview` suffixes.

## Request

```json
{
  "contents": [{
    "parts": [{ "text": "<generation prompt>" }]
  }],
  "generationConfig": {
    "responseModalities": ["TEXT", "IMAGE"]
  }
}
```

## Response

`candidates[0].content.parts` is an array; image parts contain:

```json
{ "inlineData": { "mimeType": "image/png", "data": "<base64>" } }
```

Decode `data` (base64) → PNG file.

## Python example (httpx)

```python
import base64, httpx, os

key = os.environ["GOOGLE_AI_STUDIO_API_KEY"]
prompt = "1:1 square app icon, ..."

r = httpx.post(
    f"https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash-image:generateContent",
    params={"key": key},
    json={
        "contents": [{"parts": [{"text": prompt}]}],
        "generationConfig": {"responseModalities": ["TEXT", "IMAGE"]},
    },
    timeout=120,
)
r.raise_for_status()
for part in r.json()["candidates"][0]["content"]["parts"]:
    if "inlineData" in part:
        open("icon.png", "wb").write(base64.b64decode(part["inlineData"]["data"]))
```

## Notes

- API key from https://aistudio.google.com/apikey (free tier available).
- Always request square/1:1 composition explicitly in the prompt — the API has no aspect-ratio parameter for this model.
- Generate at highest available resolution, then downscale with PIL (`Image.resize(..., Image.LANCZOS)`).
