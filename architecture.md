# Architecture - VibeSift

Dokumen ini menjelaskan arsitektur sistem, struktur folder, dan tanggung jawab tiap modul. Untuk aturan coding, lihat [agents.md](./agents.md).

---

## 📑 Table of Contents

- [1. Gambaran Sistem](#1-gambaran-sistem)
- [2. Struktur Folder](#2-struktur-folder)
- [3. Alur Data](#3-alur-data)
- [4. Tanggung Jawab Modul](#4-tanggung-jawab-modul)
- [5. Database Schema](#5-database-schema)
- [6. Integrasi Eksternal](#6-integrasi-eksternal)
- [7. Environment Variables](#7-environment-variables)

---

## 1. Gambaran Sistem

VibeSift terdiri dari 2 service:

| Service | Stack | Tanggung Jawab |
|---|---|---|
| **Frontend** | Next.js 14 (App Router) + TypeScript | UI, auth flow, BYOK (user masukkan API key sendiri) |
| **Backend** | FastAPI (Python 3.11+) | Spotify OAuth, sync lagu, orkestrasi AI, generate playlist |

**Prinsip:** API key AI **tidak pernah** disimpan di server. Frontend mengirimnya per-request via header `X-AI-API-Key`, backend langsung forward ke provider via LiteLLM.

---

## 2. Struktur Folder

```text
vibesift/
├── frontend/                  # Next.js App Router
│   ├── app/
│   │   ├── layout.tsx
│   │   ├── page.tsx           # Landing + Login
│   │   ├── dashboard/
│   │   │   └── page.tsx       # Stats + prompt input + recent playlists
│   │   └── settings/
│   │       └── page.tsx       # BYOK: pilih provider/model + API key
│   ├── components/
│   │   ├── ui/                # shadcn/ui primitives
│   │   ├── PromptBox.tsx
│   │   ├── SyncProgress.tsx
│   │   └── PlaylistCard.tsx
│   ├── lib/
│   │   ├── api.ts             # fetch wrapper + error handling
│   │   └── store.ts           # Zustand store
│   └── package.json
│
├── backend/                   # FastAPI
│   ├── app/
│   │   ├── main.py            # App entry + CORS + router registration
│   │   ├── core/
│   │   │   ├── config.py      # Settings via pydantic-settings / dotenv
│   │   │   └── security.py    # Token handling helper
│   │   ├── api/
│   │   │   ├── auth.py        # OAuth Spotify routes
│   │   │   ├── sync.py        # Sync liked songs routes
│   │   │   ├── playlist.py    # Generate playlist routes
│   │   │   └── stats.py       # Stats routes
│   │   ├── services/
│   │   │   ├── spotify.py     # Spotipy wrapper (pagination + rate limit)
│   │   │   ├── ai.py          # LiteLLM wrapper + JSON validation
│   │   │   └── playlist.py    # Filter logic + build playlist
│   │   ├── models/            # SQLAlchemy models (async)
│   │   └── schemas/           # Pydantic request/response models
│   ├── alembic/               # DB migration
│   └── requirements.txt
│
├── docs/                      # (opsional) lihat catatan di README
├── prd.md
├── agents.md
├── architecture.md
├── api_reference.md
├── tasks.md
└── README.md
```

> **Catatan:** Semua dokumentasi saat ini berada di root repo agar mudah diakses.

---

## 3. Alur Data

```text
User → Frontend → POST /api/generate-playlist (header X-AI-API-Key)
                 │
                 ▼
             Backend (FastAPI)
                 │ 1. LiteLLM: prompt → JSON audio features
                 ▼
             AI Provider (Gemini/Groq/OpenAI/Ollama)
                 │ 2. Return JSON parameter filter
                 ▼
             Backend: query cached_tracks dengan filter
                 │ 3. Return track IDs
                 ▼
             Backend: Spotify API → create playlist + add tracks
                 │ 4. Return playlist URL
                 ▼
             Frontend: tampilkan link "Open in Spotify"
```

Detail endpoint & kontrak lihat [api_reference.md](./api_reference.md).

---

## 4. Tanggung Jawab Modul

### Backend

| Modul | Tanggung Jawab | Batasan Penting |
|---|---|---|
| `services/spotify.py` | Ambil liked songs + audio features | **Pagination 50/request**, handle rate limit |
| `services/ai.py` | Prompt → JSON parameter | Pakai `response_format: json_object`, validasi output |
| `services/playlist.py` | Filter DB → susun track list | Fallback jika hasil < 15 lagu (Phase 2) |
| `api/auth.py` | OAuth code → token | Simpan refresh token terenkripsi |
| `models/` | SQLAlchemy async models | Jangan simpan API key user |

### Frontend

| Modul | Tanggung Jawab | Batasan Penting |
|---|---|---|
| `lib/api.ts` | Wrapper fetch ke backend | Handle error + kirim `X-AI-API-Key` |
| `lib/store.ts` | Global state (Zustand) | API key di localStorage, **bukan** server |
| `components/PromptBox.tsx` | Input prompt + quick buttons | Loading state wajib ada |

---

## 5. Database Schema

```sql
CREATE TABLE cached_tracks (
    id UUID PRIMARY KEY,
    spotify_id VARCHAR(255) UNIQUE NOT NULL,
    name VARCHAR(255) NOT NULL,
    artists JSON NOT NULL,
    album VARCHAR(255),
    duration_ms INTEGER,
    danceability FLOAT,
    energy FLOAT,
    valence FLOAT,
    acousticness FLOAT,
    instrumentalness FLOAT,
    tempo FLOAT,
    added_at TIMESTAMP,
    last_updated TIMESTAMP DEFAULT NOW()
);

CREATE TABLE generated_playlists (
    id UUID PRIMARY KEY,
    spotify_playlist_id VARCHAR(255) UNIQUE NOT NULL,
    name VARCHAR(255) NOT NULL,
    description TEXT,
    prompt TEXT NOT NULL,
    ai_parameters JSON,
    track_count INTEGER,
    created_at TIMESTAMP DEFAULT NOW(),
    user_id VARCHAR(255) NOT NULL
);

CREATE TABLE user_sessions (
    id UUID PRIMARY KEY,
    spotify_user_id VARCHAR(255) UNIQUE NOT NULL,
    refresh_token TEXT,          -- terenkripsi, opsional
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW()
);
```

---

## 6. Integrasi Eksternal

| Layanan | Dipakai untuk | Catatan |
|---|---|---|
| Spotify Web API | Liked Songs, audio features, playlist | Rate limit + pagination 50 |
| Google AI Studio | Provider AI default (Gemini 2.0 Flash) | Gratis |
| Groq | Provider alternatif cepat | Gratis tier |
| OpenAI / Anthropic | Provider berbayar (opsional) | — |
| Ollama | Provider lokal | Untuk self-host offline |

Semua provider diakses lewat **LiteLLM** agar satu antarmuka.

---

## 7. Environment Variables

```bash
# Spotify
SPOTIFY_CLIENT_ID=
SPOTIFY_CLIENT_SECRET=
SPOTIFY_REDIRECT_URI=http://127.0.0.1:3000/auth/callback

# Database (optional, default SQLite)
DATABASE_URL=

# Default AI (optional, user bisa override di UI)
DEFAULT_AI_PROVIDER=gemini
DEFAULT_AI_MODEL=gemini-2.0-flash

# Deployment
FRONTEND_URL=http://localhost:3000
BACKEND_URL=http://localhost:8000
```
