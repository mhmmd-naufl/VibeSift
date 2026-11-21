# VibeSift

**AI playlist curator for Spotify.** Describe a mood in one sentence — VibeSift finds matching songs from your Liked Songs and builds the playlist for you.

[![License: MIT](https://img.shields.io/badge/license-MIT-green.svg)](LICENSE)
[![Next.js](https://img.shields.io/badge/frontend-Next.js%2014-000000)](https://nextjs.org)
[![FastAPI](https://img.shields.io/badge/backend-FastAPI-009688)](https://fastapi.tiangolo.com)
[![TypeScript](https://img.shields.io/badge/typescript-strict-3178C6)](https://www.typescriptlang.org)
[![Python](https://img.shields.io/badge/python-3.11%2B-3776AB)](https://www.python.org)

Live demo: _[add your deployed URL here]_ · Built with the philosophy of **"Fixed Core, Flexible AI"** — a simple, opinionated product core with a pluggable AI layer.

---

## What it does

1. You log in with Spotify (or try the instant demo mode).
2. VibeSift syncs your Liked Songs — track metadata plus audio features.
3. You type a prompt like *"lagu akustik buat kerja malam"* or pick a mood preset.
4. An LLM interprets the prompt into audio-feature filters; a scoring pipeline ranks your library.
5. A Spotify playlist is created — or stored locally in demo mode — and you can inspect every track it picked.

## Why it exists

Playlist creation tools either demand manual curation or lock you into a single AI provider. VibeSift keeps the core deliberately small — sync, prompt, score, playlist — while the AI layer stays swappable: OpenRouter, Gemini, Groq, OpenAI, Anthropic, Ollama, or any OpenAI-compatible endpoint. The same applies to Spotify itself: the app ships with a built-in demo adapter so the full product is explorable without credentials, and real OAuth slots in alongside it.

## Key design decisions

| Decision | Rationale |
|---|---|
| **Hybrid demo + real auth** | One backend serves both an instant demo session (`demo-` tokens routed to an offline adapter) and genuine Spotify OAuth. Visitors can try the product immediately; a small allowlist of real accounts gets the real flow — useful under Spotify's ~5-user development-mode cap. |
| **Curated demo catalog** | 234 well-known tracks across 13 genres with plausible audio features — generated results feel real instead of random. |
| **BYOK + server-side key** | Per-user AI keys live only in the browser (never stored server-side); a shared `DEFAULT_AI_API_KEY` lets casual users generate playlists with zero setup. |
| **LiteLLM abstraction** | One API surface for every provider — switching providers is a settings change, not a code change. |
| **Alembic migrations** | `cached_tracks`, `generated_playlists` (with persisted `track_ids` for replayable tracklists), `user_sessions`. |
| **Spotify-free audio features** | Spotify deprecated its audio-features endpoint; features are fetched from ReccoBeats instead, keeping the app free-tier viable. |

## Tech stack

| Layer | Technology |
|---|---|
| Frontend | Next.js 14 (App Router), TypeScript strict, Tailwind CSS, Zustand |
| Backend | FastAPI, Python 3.11+, HTTPX, LiteLLM, SQLAlchemy 2 (async), Alembic |
| Database | SQLite (dev) / PostgreSQL via Supabase (prod) |
| AI | OpenRouter (default), Gemini, Groq, OpenAI, Anthropic, Ollama |
| Auth | Spotify OAuth 2.0 Authorization Code flow |

## Quickstart

**Prerequisites:** Node.js LTS, Python 3.11+, and optionally a Spotify app + AI key.

```bash
git clone https://github.com/mhmmd-naufl/VibeSift.git
cd VibeSift
```

### Backend

```bash
cd backend
python -m venv .venv
.venv\Scripts\activate          # Linux/macOS: source .venv/bin/activate
pip install -r requirements.txt
cp .env.example .env            # fill in Spotify credentials if using real mode
alembic upgrade head
uvicorn app.main:app --reload   # http://127.0.0.1:8000 — docs at /docs
```

### Frontend

```bash
cd frontend
cp .env.local.example .env.local
npm install
npm run dev                     # http://127.0.0.1:3000
```

**Demo-only setup:** leave Spotify credentials blank — click **Coba Demo** on the landing page and the whole flow works offline.

### Spotify setup (real mode only)

1. Create an app at the [Spotify Developer Dashboard](https://developer.spotify.com/dashboard).
2. Register the redirect URI `http://127.0.0.1:3000/auth/callback` (production: your deployed domain).
3. Set `SPOTIFY_CLIENT_ID`, `SPOTIFY_CLIENT_SECRET`, `SPOTIFY_REDIRECT_URI`, and `SPOTIFY_MODE=real` in `backend/.env`.
4. Note: Spotify Development Mode requires the app owner to have Premium and caps allowlisted users (~5) until Extended Quota Mode is approved.

## Usage

1. Open the app — **Login with Spotify** for the real flow, or **Coba Demo** for an instant sample session.
2. Click **Sync** — the UI shows live progress (fetching tracks → audio features → saving).
3. Type a mood or pick a preset chip, then **Generate Playlist**.
4. Inspect the full tracklist in the result panel, or reopen any saved playlist from the index.

## Project structure

```text
├── frontend/
│   ├── app/               # landing, dashboard, settings, auth callback (App Router)
│   ├── components/        # PromptBox, PlaylistResult, TrackList, PlaylistDetailModal,
│   │                      # SyncProgress, OnboardingModal, shared UI primitives
│   └── lib/               # api client, Zustand store, types, toast
├── backend/
│   ├── app/api/           # auth (OAuth + /demo), sync (+ /progress), playlist (+ /{id}), stats
│   ├── app/services/      # spotify facade, spotify_api, ai, playlist scoring,
│   │                      # features (ReccoBeats), demo adapter, demo_data, sync_progress
│   └── alembic/           # migrations
├── architecture.md        # system design and data flow
├── api_reference.md       # endpoint contracts
└── prd.md / agents.md     # product requirements and coding standards
```

## Testing

```bash
cd backend && .venv\Scripts\activate
python -m pytest -q          # smoke + fallback tests

cd frontend
npx tsc --noEmit && npm run build
```

## Deployment notes

- Frontend → Vercel; backend → Railway/Render/Fly; database → Supabase Postgres.
- Set `DATABASE_URL`, `CORS_ORIGINS`, `NEXT_PUBLIC_API_URL`, `SPOTIFY_REDIRECT_URI` (production domain) for each environment.
- `SPOTIFY_MODE=real` + `DEFAULT_AI_PROVIDER`/`DEFAULT_AI_MODEL`/`DEFAULT_AI_API_KEY` gives a working hybrid deployment: public demo sessions plus allowlisted real accounts.
- Sync progress is stored in-memory per process — fine for a single instance; use Redis if you scale horizontally.
- See [Troubleshooting](#troubleshooting) for common setup issues.

## Troubleshooting

| Symptom | Fix |
|---|---|
| `alembic upgrade head` says table already exists | `alembic stamp head` once, then `upgrade head` |
| Frontend can't reach backend (CORS) | Open via the configured origin; check `CORS_ORIGINS` |
| Spotify redirect error | Redirect URI in the dashboard must match `SPOTIFY_REDIRECT_URI` exactly |
| Spotify login 403 | Dev Mode: owner needs Premium; user must be allowlisted |
| Login doesn't reach Spotify | Backend is in `SPOTIFY_MODE=demo` — set `real` and restart |
| `AI_KEY_MISSING` | Add a key in Settings, or set `DEFAULT_AI_API_KEY` server-side |
| Free AI model rate-limited | Pick another `:free` model or use a paid key |

## Contributing

See [agents.md](./agents.md) for coding standards and [SISA_TUGAS.md](./SISA_TUGAS.md) for open tasks. Branch from `main`, keep functions small, and open a PR.

## License

[MIT](LICENSE) — open source.
