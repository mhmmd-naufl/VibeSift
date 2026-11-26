# Sizing Guide

All assets are 1:1 aspect ratio. Generate at the largest size, then downscale.

| Asset Type | Primary | Additional | Use Case |
|-----------|---------|------------|----------|
| Icon | 512×512 | 256, 128, 64, 32 | App icons, favicons, UI |
| Avatar | 512×512 | 256, 128 | Profiles, chat UIs |
| Logo | 1024×1024 | 512, 256 | Branding, docs, social |

## Legibility floor

- Verify the design still reads at **32×32 px** and **16×16 px** (favicon).
- If detail is lost below 64×64, simplify the concept — remove secondary elements, thicken strokes.

## Downscaling (PIL)

```python
from PIL import Image
im = Image.open("icon-1024.png")
for s in (512, 256, 128, 64, 32):
    im.resize((s, s), Image.LANCZOS).save(f"icon-{s}.png")
```

## Naming

`{agent-name}-{type}-{size}.png`, e.g. `vibesift-icon-512.png`.
Default output dir: `output/icons/`.
