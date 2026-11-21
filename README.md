# VibeSift

**AI playlist curator untuk Spotify — proyek saya.** Cukup ketik satu kalimat tentang mood, VibeSift mencari lagu yang cocok dari Liked Songs kamu dan langsung membuatkan playlistnya.

[![License: MIT](https://img.shields.io/badge/license-MIT-green.svg)](LICENSE)
[![Next.js](https://img.shields.io/badge/frontend-Next.js%2014-000000)](https://nextjs.org)
[![FastAPI](https://img.shields.io/badge/backend-FastAPI-009688)](https://fastapi.tiangolo.com)
[![TypeScript](https://img.shields.io/badge/typescript-strict-3178C6)](https://www.typescriptlang.org)
[![Python](https://img.shields.io/badge/python-3.11%2B-3776AB)](https://www.python.org)

Live demo: _[*soon]_ · Dibangun dengan filosofi **"Fixed Core, Flexible AI"** — inti produk yang sederhana dan opinionated, dengan lapisan AI yang bisa diganti-ganti.

---

## Apa yang dilakukan aplikasi ini

1. User login dengan Spotify — atau langsung coba mode demo instan.
2. VibeSift menyinkronkan Liked Songs: metadata lagu plus audio features.
3. User mengetik prompt seperti *"lagu akustik buat kerja malam"* atau memilih preset mood.
4. LLM menerjemahkan prompt menjadi filter audio-feature; pipeline scoring meranking library user.
5. Playlist Spotify dibuat — atau disimpan lokal di mode demo — dan user bisa melihat seluruh tracklist-nya.

## Kenapa saya membangun ini

Tools pembuatan playlist yang ada pilihannya cuma dua: kurasi manual yang melelahkan, atau tools yang mengunci user ke satu AI provider. Saya ingin keduanya sekaligus — core yang kecil dan jelas (sync → prompt → scoring → playlist), tapi layer AI-nya bebas diganti: OpenRouter, Gemini, Groq, OpenAI, Anthropic, Ollama, atau endpoint OpenAI-compatible mana pun. Hal yang sama berlaku untuk Spotify: saya bangun demo adapter bawaan supaya seluruh produk bisa dicoba tanpa kredensial, dan OAuth asli menyatu di backend yang sama.

## Keputusan desain penting

| Keputusan | Alasan |
|---|---|
| **Auth hybrid: demo + Spotify asli** | Satu backend melayani dua jenis sesi: demo instan (token `demo-` dirutekan ke adapter offline) dan OAuth Spotify sungguhan. Visitor bisa langsung mencoba; beberapa akun terpilih tetap dapat flow asli — penting karena Spotify Development Mode membatasi app ke ~5 user allowlist. |
| **Katalog demo terkurasi** | 234 lagu terkenal lintas 13 genre dengan audio features yang plausible — hasil generate terasa nyata, bukan acak. |
| **BYOK + server-side key** | API key milik user hanya disimpan di browser (tidak pernah di server); `DEFAULT_AI_API_KEY` opsional membuat user awam bisa generate tanpa setup apa pun. |
| **Abstraksi LiteLLM** | Satu API surface untuk semua provider — ganti provider cukup dari halaman Settings, bukan ubah kode. |
| **Migrasi Alembic** | Tiga tabel: `cached_tracks`, `generated_playlists` (dengan `track_ids` tersimpan supaya tracklist playlist lama tetap bisa dibuka), `user_sessions`. |
| **Audio features tanpa Spotify** | Endpoint audio-features Spotify sudah deprecated; saya ambil dari ReccoBeats supaya aplikasi tetap free-tier friendly. |

## Tech stack

| Layer | Teknologi |
|---|---|
| Frontend | Next.js 14 (App Router), TypeScript strict, Tailwind CSS, Zustand |
| Backend | FastAPI, Python 3.11+, HTTPX, LiteLLM, SQLAlchemy 2 (async), Alembic |
| Database | SQLite (dev) / PostgreSQL via Supabase (prod) |
| AI | OpenRouter (default), Gemini, Groq, OpenAI, Anthropic, Ollama |
| Auth | Spotify OAuth 2.0 Authorization Code flow |

## Cara menjalankan

**Yang dibutuhkan:** Node.js LTS, Python 3.11+, dan opsional Spotify app + AI key.

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
cp .env.example .env            # isi kredensial Spotify kalau mau mode real
alembic upgrade head
uvicorn app.main:app --reload   # http://127.0.0.1:8000 — docs di /docs
```

### Frontend

```bash
cd frontend
cp .env.local.example .env.local
npm install
npm run dev                     # http://127.0.0.1:3000
```

**Setup demo saja:** kosongkan kredensial Spotify — klik **Coba Demo** di landing page dan seluruh flow jalan offline.

### Setup Spotify (hanya mode real)

1. Buat app di [Spotify Developer Dashboard](https://developer.spotify.com/dashboard).
2. Daftarkan redirect URI `http://127.0.0.1:3000/auth/callback` (produksi: domain deployment kamu).
3. Isi `SPOTIFY_CLIENT_ID`, `SPOTIFY_CLIENT_SECRET`, `SPOTIFY_REDIRECT_URI`, dan `SPOTIFY_MODE=real` di `backend/.env`.
4. Catatan: Spotify Development Mode mewajibkan owner app punya Premium dan membatasi user allowlist (~5) sampai Extended Quota Mode disetujui.

## Cara pakai

1. Buka aplikasi — **Login with Spotify** untuk flow asli, atau **Coba Demo** untuk sesi contoh instan.
2. Klik **Sync** — UI menampilkan progress real-time (fetch lagu → audio features → simpan).
3. Ketik mood atau pilih chip preset, lalu **Generate Playlist**.
4. Lihat tracklist lengkap di panel hasil, atau buka ulang playlist tersimpan dari index.

## Struktur proyek

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
├── architecture.md        # desain sistem dan alur data
├── api_reference.md       # kontrak endpoint
└── prd.md / agents.md     # product requirements dan standar coding
```

## Testing

```bash
cd backend && .venv\Scripts\activate
python -m pytest -q          # smoke + fallback tests

cd frontend
npx tsc --noEmit && npm run build
```

## Catatan deployment

- Frontend → Vercel; backend → Railway/Render/Fly; database → Supabase Postgres.
- Set `DATABASE_URL`, `CORS_ORIGINS`, `NEXT_PUBLIC_API_URL`, dan `SPOTIFY_REDIRECT_URI` (domain produksi) untuk tiap environment.
- `SPOTIFY_MODE=real` + `DEFAULT_AI_PROVIDER`/`DEFAULT_AI_MODEL`/`DEFAULT_AI_API_KEY` menghasilkan deployment hybrid yang berfungsi: sesi demo publik plus akun asli terpilih.
- Sync progress disimpan in-memory per proses — cukup untuk single instance; pakai Redis kalau scale horizontal.
- Lihat [Troubleshooting](#troubleshooting) untuk masalah setup umum.

## Troubleshooting

| Gejala | Solusi |
|---|---|
| `alembic upgrade head` bilang tabel sudah ada | Jalankan `alembic stamp head` sekali, lalu `upgrade head` |
| Frontend tidak bisa reach backend (CORS) | Buka lewat origin yang terdaftar; cek `CORS_ORIGINS` |
| Spotify redirect error | Redirect URI di dashboard harus sama persis dengan `SPOTIFY_REDIRECT_URI` |
| Spotify login 403 | Dev Mode: owner butuh Premium; user harus di-allowlist |
| Login tidak sampai ke Spotify | Backend masih `SPOTIFY_MODE=demo` — set `real` lalu restart |
| `AI_KEY_MISSING` | Tambah key di Settings, atau set `DEFAULT_AI_API_KEY` di server |
| Model AI gratis kena rate limit | Ganti ke model `:free` lain atau pakai key berbayar |

## Kontribusi

Lihat [agents.md](./agents.md) untuk standar coding dan [SISA_TUGAS.md](./SISA_TUGAS.md) untuk task yang terbuka. Branch dari `main`, jaga fungsi tetap kecil, dan buka PR.

## Lisensi

[MIT](LICENSE) — open source.
