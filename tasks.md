# Tasks - VibeSift

Breakdown task terurut untuk **vibecoding**. Kerjakan berurutan; setiap task harus lolos [checklist di agents.md](./agents.md#-checklist-sebelum-generate-code) sebelum lanjut.

**Legenda:** `[ ]` belum · `[~]` sedang dikerjakan · `[x]` selesai

---

## 📑 Table of Contents

- [Phase 0: Setup](#phase-0-setup)
- [Phase 1: Backend Core](#phase-1-backend-core)
- [Phase 2: Frontend Core](#phase-2-frontend-core)
- [Phase 3: Integrasi & Polish](#phase-3-integrasi--polish)
- [Phase 4: Advanced (Opsional)](#phase-4-advanced-opsional)
- [Definition of Done](#definition-of-done)

---

## Phase 0: Setup

- [x] Inisialisasi repo + struktur folder (lihat [architecture.md](./architecture.md#2-struktur-folder))
- [x] Backend: virtualenv, `requirements.txt` (FastAPI, spotipy, litellm, sqlalchemy, alembic, pydantic, httpx, python-dotenv)
- [x] Frontend: Next.js (App Router, TypeScript, Tailwind)
- [x] Install shadcn/ui-style components + Zustand + React Hook Form + Zod
- [x] Buat `.env.example` (backend & frontend), pastikan `.env` masuk `.gitignore`
- [ ] Setup SQLite + Alembic init _(saat ini tabel dibuat otomatis via `create_all`; Alembic menyusul)_

## Phase 1: Backend Core

- [x] `core/config.py` — load env via pydantic-settings
- [x] `models/` — tabel `cached_tracks`, `generated_playlists`, `user_sessions`
- [x] `api/auth.py` — OAuth login + callback (tukar code → token) + refresh
- [x] `services/spotify.py` — fetch liked songs + audio features (**pagination 50**, retry rate limit)
- [x] `api/sync.py` — endpoint sync + simpan ke DB
- [x] `services/ai.py` — LiteLLM wrapper (`response_format: json_object`) + validasi JSON
- [x] `services/playlist.py` — filter DB berdasarkan parameter AI
- [x] `api/playlist.py` — `POST /api/generate-playlist` (AI → filter → buat playlist Spotify)
- [x] `api/stats.py` — `GET /api/stats`
- [x] Global error handler + format error konsisten (lihat [api_reference.md](./api_reference.md#format-error))
- [x] Smoke test (`tests/test_smoke.py`) — 3 passed

## Phase 2: Frontend Core

- [x] Halaman landing + tombol "Login with Spotify"
- [x] Simpan token sesi + auto-login jika masih valid
- [x] Dashboard: stats (jumlah lagu, last sync)
- [x] `PromptBox.tsx` — input prompt + quick prompt buttons
- [x] `SyncProgress.tsx` — progress indicator saat sync
- [x] `PlaylistCard.tsx` — tampilkan playlist + tombol "Open in Spotify"
- [x] Settings (BYOK): pilih provider/model + input API key → **localStorage**
- [x] `lib/api.ts` — fetch wrapper (kirim `X-AI-API-Key`, handle error user-friendly)
- [x] Loading states + basic guard

## Phase 3: Integrasi & Polish

- [ ] Onboarding modal jika API key belum diisi (panduan Google AI Studio)
- [ ] End-to-end test: login → sync → generate playlist _(butuh kredensial Spotify)_
- [x] Cek aturan di [agents.md](./agents.md) (fungsi < 40 baris, file < 300 baris, no `any`)
- [x] Audit: pastikan tidak ada API key tersimpan di server
- [x] `README.md` + instruksi dev
- [ ] Deploy instance publik (Vercel + Render + Supabase)

## Phase 4: Advanced (Opsional)

- [ ] Visual Mood Map (scatter plot Energy × Valence)
- [ ] Auto-Clustering (1 klik → 5-10 playlist)
- [ ] Smart Fallback (Spotify Recommendations jika hasil < 15 lagu)
- [ ] Prompt History & Templates (share via URL)
- [ ] Dark/Light mode + i18n

---

## Definition of Done

Sebuah task dianggap selesai jika:

1. Kode mengikuti semua aturan di [agents.md](./agents.md)
2. Ada type hints (Python) / TypeScript strict, tanpa `any`
3. Error handling ada di setiap API call
4. Tidak ada hardcoded secret
5. Sudah diuji manual sesuai acceptance criteria
6. Dokumentasi terkait diperbarui
