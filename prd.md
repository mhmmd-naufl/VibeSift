# Product Requirements Document (PRD) - VibeSift

**Versi:** 2.0  
**Status:** Active  
**Last Updated:** 2026-10-11

---

## 📑 Table of Contents

- [1. Ringkasan Eksekutif](#1-ringkasan-eksekutif)
- [2. Masalah yang Diselesaikan](#2-masalah-yang-diselesaikan)
- [3. Solusi](#3-solusi)
- [4. Target Pengguna](#4-target-pengguna)
- [5. Fitur Utama](#5-fitur-utama)
- [6. User Flow](#6-user-flow)
- [7. Arsitektur Teknis](#7-arsitektur-teknis)
- [8. Keamanan & Privasi](#8-keamanan--privasi)
- [9. Deployment Options](#9-deployment-options)
- [10. Success Metrics](#10-success-metrics)
- [11. Roadmap](#11-roadmap)
- [12. Appendix](#12-appendix)

---

## 1. Ringkasan Eksekutif

**VibeSift** adalah aplikasi web open-source yang menjembatani Spotify dan AI untuk mengotomatiskan pembuatan playlist. Aplikasi ini memungkinkan pengguna untuk mengekstrak lagu dari Liked Songs mereka dan secara otomatis menyusunnya ke dalam playlist baru berdasarkan deskripsi mood atau aktivitas dalam bahasa alami (Natural Language).

**Prinsip Utama:**
- **Zero-Cost**: 100% Free Tier dari hulu ke hilir
- **Fixed Core, Flexible AI**: Inti aplikasi baku dan mudah digunakan, tapi memberikan kebebasan untuk custom AI provider
- **Frictionless Onboarding**: Setup AI semudah mungkin dengan Google AI Studio sebagai default

---

## 2. Masalah yang Diselesaikan

### 2.1. Friksi Manual
Memindahkan lagu dari Liked Songs ke playlist spesifik di Spotify harus dilakukan satu per satu secara manual, yang sangat memakan waktu.

### 2.2. Keterbatasan Pencarian
Pengguna sering kali lupa judul lagu atau artis, tetapi ingat "vibe" atau suasananya (misal: "lagu indie akustik yang enak buat hujan-hujan"). Spotify tidak memiliki fitur filter berbasis mood/audio features yang dinamis.

### 2.3. Vendor Lock-in & Biaya
Tools AI musik yang ada saat ini biasanya berbayar atau mengunci pengguna pada satu penyedia AI tertentu, yang bertentangan dengan semangat open-source dan privasi pengguna.

### 2.4. Setup yang Rumit
Banyak proyek open-source yang sulit di-setup oleh user awam karena membutuhkan banyak konfigurasi dan pemahaman teknis.

---

## 3. Solusi

VibeSift adalah aplikasi web yang:

1. Mengintegrasikan dengan Spotify API untuk membaca Liked Songs user
2. Menggunakan AI (LLM) untuk menerjemahkan prompt natural language menjadi parameter filter Audio Features
3. Memfilter lagu dari database lokal berdasarkan parameter tersebut
4. Secara otomatis membuat playlist baru di akun Spotify user

**Keunggulan:**
- User hanya perlu ketik 1 kalimat prompt
- Proses otomatis, tidak perlu pilih lagu satu per satu
- 100% gratis (pakai Google AI Studio)
- Open source, bisa di-self-host
- Privacy-first (API key tidak disimpan di server)

---

## 4. Target Pengguna

### 4.1. End-Users
- Pecinta musik yang punya ratusan/ribuan Liked Songs di Spotify
- Orang yang suka membuat playlist berdasarkan aktivitas/mood spesifik
- Power-users Spotify yang ingin efisiensi

### 4.2. Developer/Kontributor
- Programmer yang ingin belajar integrasi Spotify API + AI/LLM
- Developer yang ingin kontribusi ke proyek open-source musik

---

## 5. Fitur Utama

### 5.1. Fitur Inti (MVP - Wajib Ada)

#### F1: Spotify OAuth Login
- Autentikasi aman menggunakan akun Spotify
- Mendapatkan Access Token dan Refresh Token
- Scope: `user-library-read`, `playlist-modify-public`, `playlist-modify-private`

#### F2: Liked Songs Sync Engine
- Tarik semua Liked Songs dari Spotify
- Fetch Audio Features untuk setiap lagu (Energy, Valence, Tempo, dll)
- Simpan ke database lokal (cache) untuk performa
- Handle pagination (Spotify limit 50 per request)
- Progress indicator saat sync

#### F3: Natural Language Prompting
- UI chatbox sederhana untuk ketik prompt
- Contoh prompt: "Buat playlist buat lari sore biar semangat"
- Quick prompt buttons untuk mood umum (Morning Coffee, Gym Beast, Rainy Day, dll)

#### F4: AI Translation (Prompt → JSON)
- Kirim prompt user ke AI (Gemini/Groq/OpenAI)
- AI terjemahkan ke parameter Audio Features dalam JSON
- Contoh output: `{"min_energy": 0.6, "max_energy": 1.0, "min_tempo": 120, "max_tempo": 160}`
- Validasi & sanitasi output JSON

#### F5: Auto-Playlist Generation
- Filter lagu dari database berdasarkan parameter AI
- Buat playlist baru di Spotify dengan nama & deskripsi dari AI
- Masukkan lagu-lagu hasil filter ke playlist
- Tampilkan link playlist yang berhasil dibuat

#### F6: Settings Page (BYOK - Bring Your Own Key)
- User bisa input API Key AI mereka sendiri
- Pilih provider: Google AI Studio, Groq, OpenAI, Ollama, Custom
- Pilih model spesifik (Gemini Flash, Llama 3, GPT-4o-mini, dll)
- API key disimpan di localStorage browser, TIDAK di server

### 5.2. Fitur Phase 2 (Opsional, Setelah MVP)

#### F7: Visual Mood Map
- Scatter plot 2D (Sumbu X: Energy, Sumbu Y: Valence)
- User bisa blok area di grafik untuk buat playlist
- Visualisasi distribusi lagu di Liked Songs

#### F8: Auto-Clustering
- 1 klik untuk bagi Liked Songs jadi 5-10 playlist otomatis
- AI kelompokkan lagu berdasarkan kemiripan audio features
- AI beri nama playlist yang estetik

#### F9: Smart Fallback
- Jika hasil filter dari Liked Songs < 15 lagu
- Otomatis cari lagu tambahan dari seluruh katalog Spotify (Spotify Recommendation API)
- Campurkan dengan lagu dari Liked Songs

#### F10: Prompt History & Templates
- Simpan riwayat prompt yang pernah dipakai
- Quick buttons untuk prompt umum
- Share prompt config ke teman via URL

### 5.3. Fitur di Luar Cakupan (Out of Scope)

Untuk menjaga kesederhanaan dan menghindari over-engineering:

- ❌ Tidak ada fitur streaming/memutar lagu langsung di dalam web
- ❌ Tidak ada fitur upload lagu MP3 sendiri
- ❌ Tidak ada fitur sosial media (share ke teman, like playlist orang lain)
- ❌ Tidak ada sistem login email/password manual (hanya Login with Spotify)

---

## 6. User Flow

### 6.1. First-Time User (Onboarding)

1. User buka web → Klik "Login with Spotify"
2. Spotify OAuth → User authorize
3. Sistem detect belum ada API Key AI
4. Muncul modal: "Untuk menggunakan AI, kamu butuh API Key gratis. Klik di sini untuk daftar Google AI Studio (30 detik, pakai akun Google)."
5. User buka Google AI Studio → Login Google → Klik "Get API Key" → Copy
6. User paste API Key di VibeSift → Klik Save
7. User masuk ke Dashboard → Klik "Sync Liked Songs"
8. Progress bar muncul (sync 1000+ lagu, butuh 10-30 detik)
9. Sync selesai → Stats muncul: "1,247 songs synced"
10. User ketik prompt: "Lagu-lagu galau akustik buat menemani kerja malam"
11. Klik "Generate Playlist"
12. Loading state: "🧠 AI sedang meracik mood..." → "🔍 Mencari lagu yang cocok..." → "📦 Mengirim ke Spotify..."
13. Success: "Playlist 'Late Night Acoustic' berhasil dibuat dengan 24 lagu!"
14. User klik "Open in Spotify" → Playlist sudah ada di Spotify app!

### 6.2. Returning User

1. User buka web → Auto-login (token masih valid)
2. Dashboard muncul dengan stats: "1,247 songs • Last sync: 2 hours ago"
3. User ketik prompt baru atau klik Quick Prompt
4. Generate Playlist → Selesai dalam 5-10 detik
5. Playlist baru muncul di list "Recent Playlists"

---

## 7. Arsitektur Teknis

### 7.1. Tech Stack

**Frontend:**
- Next.js 14 (App Router)
- TypeScript (strict mode)
- Tailwind CSS + shadcn/ui
- Zustand (state management)
- React Hook Form + Zod (forms)

**Backend:**
- Python 3.11+
- FastAPI
- Spotipy (Spotify SDK)
- LiteLLM (unified AI API)
- SQLAlchemy (ORM)
- SQLite (local) / Supabase (production)

**AI Providers:**
- Default: Google Gemini 2.0 Flash (gratis)
- Alternative: Groq Llama 3.3, OpenAI GPT-4o-mini, Ollama (local)

### 7.2. Data Flow

```text
┌─────────────┐
│  Frontend   │
│  (Next.js)  │
└──────┬──────┘
       │ 1. POST /api/generate-playlist
       │    Headers: X-AI-API-Key: user_key
       │    Body: { "prompt": "lagu galau akustik" }
       ▼
┌─────────────┐
│  Backend    │
│  (FastAPI)  │
└──────┬──────┘
       │ 2. Call LiteLLM dengan user_key
       ▼
┌─────────────┐
│ AI (Gemini) │
│  /Groq/etc  │
└──────┬──────┘
       │ 3. Return JSON:
       │    { "min_energy": 0.2, "max_energy": 0.5,
       │      "min_acousticness": 0.7, ... }
       ▼
┌─────────────┐
│  Backend    │
│  (FastAPI)  │
└──────┬──────┘
       │ 4. Query database:
       │    SELECT * FROM cached_tracks
       │    WHERE energy BETWEEN 0.2 AND 0.5
       │    AND acousticness >= 0.7
       ▼
┌─────────────┐
│  Database   │
│  (SQLite/   │
│  Supabase)  │
└──────┬──────┘
       │ 5. Return 24 track IDs
       ▼
┌─────────────┐
│  Backend    │
│  (FastAPI)  │
└──────┬──────┘
       │ 6. Call Spotify API:
       │    - Create playlist
       │    - Add 24 tracks
       ▼
┌─────────────┐
│ Spotify API │
└──────┬──────┘
       │ 7. Return playlist URL
       ▼
┌─────────────┐
│  Backend    │
│  (FastAPI)  │
└──────┬──────┘
       │ 8. Return success + playlist URL
       ▼
┌─────────────┐
│  Frontend   │
│  (Next.js)  │
└─────────────┘
```

### 7.3. Database Schema

```sql
CREATE TABLE cached_tracks (
    id UUID PRIMARY KEY,
    spotify_id VARCHAR(255) UNIQUE NOT NULL,
    name VARCHAR(255) NOT NULL,
    artists JSON NOT NULL,  -- ["Artist 1", "Artist 2"]
    album VARCHAR(255),
    duration_ms INTEGER,
    -- Audio Features
    danceability FLOAT,
    energy FLOAT,
    valence FLOAT,
    acousticness FLOAT,
    instrumentalness FLOAT,
    tempo FLOAT,
    -- Metadata
    added_at TIMESTAMP,
    last_updated TIMESTAMP DEFAULT NOW()
);

CREATE TABLE generated_playlists (
    id UUID PRIMARY KEY,
    spotify_playlist_id VARCHAR(255) UNIQUE NOT NULL,
    name VARCHAR(255) NOT NULL,
    description TEXT,
    prompt TEXT NOT NULL,
    ai_parameters JSON,  -- Parameter yang dipakai AI
    track_count INTEGER,
    created_at TIMESTAMP DEFAULT NOW(),
    user_id VARCHAR(255) NOT NULL
);
```

---

## 8. Keamanan & Privasi

### 8.1. API Key Isolation
- API Key AI user TIDAK disimpan di database backend
- Key dikirim dari browser ke backend via HTTP Header (`X-AI-API-Key`)
- Backend langsung forward ke AI provider via LiteLLM
- Tidak ada logging API key di server

### 8.2. Spotify Token Management
- Access Token disimpan di localStorage (frontend) atau session (backend)
- Refresh Token disimpan encrypted di database (opsional)
- Auto-refresh token sebelum expired

### 8.3. Data Privacy
- Tidak ada data pribadi user yang disimpan selain metadata lagu
- User bisa clear semua data kapan saja via Settings
- Self-hosted option untuk 100% local control

---

## 9. Deployment Options

### 9.1. Hosted (Public Instance)
- Frontend: Vercel (free)
- Backend: Render (free, auto-sleep)
- Database: Supabase (free, 500MB)
- User wajib input API Key AI mereka sendiri

### 9.2. Self-Hosted (Local)

```bash
git clone https://github.com/mhmmd-naufl/vibesift.git
cd vibesift
npm install
npm run dev
```

- Frontend + Backend jalan di localhost
- Database: SQLite (file lokal)
- AI: Bisa pakai Google AI Studio, Groq, atau Ollama (lokal)

### 9.3. Docker (Self-Hosted)

```bash
docker-compose up -d
```

- Semua komponen dalam container
- Persistent volume untuk database
- Mudah di-migrate ke server lain

---

## 10. Success Metrics

### 10.1. Functional Metrics
- ✅ User bisa membuat playlist dari Liked Songs dengan 1 prompt dalam < 10 detik
- ✅ Onboarding selesai dalam < 2 menit (login Spotify + setup AI key)
- ✅ Aplikasi jalan 100% dengan free tier (Rp 0 biaya)

### 10.2. Open Source Metrics
- ✅ Repo bisa di-clone dan dijalankan di mesin lokal tanpa error
- ✅ Dokumentasi jelas dan lengkap
- ✅ Codebase bersih, modular, dan mudah dipahami
- ✅ Minimal 10 stars di GitHub dalam 1 bulan pertama

### 10.3. Technical Metrics
- ✅ Backend response time < 5 detik untuk generate playlist
- ✅ Sync 1000 lagu selesai dalam < 60 detik
- ✅ Zero API key leaks (audit code untuk verifikasi)

---

## 11. Roadmap

### Phase 1: MVP (Minggu 1-6)
- Setup repository & documentation
- Backend: Spotify OAuth + Sync Liked Songs
- Backend: AI Integration (LiteLLM + Gemini)
- Backend: Playlist Generation
- Frontend: Login + Dashboard
- Frontend: Settings (BYOK)
- Testing & Deployment

### Phase 2: Advanced Features (Minggu 7-10)
- Visual Mood Map (scatter plot)
- Auto-Clustering
- Smart Fallback (Spotify Recommendations)
- Prompt History & Templates

### Phase 3: Community & Polish (Minggu 11-12)
- Dark/Light mode
- i18n (multi-bahasa)
- Performance optimization
- Documentation improvement

---

## 12. Appendix

### A. Contoh System Prompt untuk AI

```python
AI_SYSTEM_PROMPT = """
Kamu adalah kurator musik Spotify expert.
Tugasmu: terjemahkan request user menjadi parameter Spotify Audio Features dalam JSON.

Parameter yang tersedia (semua 0.0 - 1.0, kecuali tempo):
- min_energy, max_energy (0.0-1.0, 1.0 = sangat energetik)
- min_valence, max_valence (0.0-1.0, 1.0 = happy/positif, 0.0 = sad/negatif)
- min_danceability, max_danceability (0.0-1.0)
- min_acousticness, max_acousticness (0.0-1.0)
- min_instrumentalness, max_instrumentalness (0.0-1.0)
- min_tempo, max_tempo (BPM, misal 80-160)

ATURAN PENTING:
1. HANYA balas dengan JSON valid.
2. JANGAN ada teks lain, markdown, atau penjelasan.
3. Gunakan range yang realistis (jangan terlalu sempit).
4. Jika user tidak spesifik, gunakan range lebar (0.0-1.0).

Contoh output:
{"min_energy": 0.6, "max_energy": 1.0, "min_tempo": 120, "max_tempo": 160}
"""
```

### B. API Endpoints

**Authentication:**
- `POST /api/auth/spotify/login` → Redirect ke Spotify OAuth
- `GET /api/auth/spotify/callback` → Handle OAuth callback

**Sync:**
- `POST /api/sync/liked-songs` → Sync Liked Songs ke database

**Playlist:**
- `POST /api/generate-playlist` → Generate playlist dari prompt
- `GET /api/playlists` → List generated playlists
- `DELETE /api/playlists/{id}` → Delete playlist dari Spotify

**Stats:**
- `GET /api/stats` → Get user stats (jumlah lagu, playlist)

### C. Environment Variables

```bash
# Spotify
SPOTIFY_CLIENT_ID=
SPOTIFY_CLIENT_SECRET=
SPOTIFY_REDIRECT_URI=http://localhost:3000/api/auth/spotify/callback

# Database (optional, default SQLite)
DATABASE_URL=

# Default AI (optional, user can override in UI)
DEFAULT_AI_PROVIDER=gemini
DEFAULT_AI_MODEL=gemini-2.0-flash

# Deployment
FRONTEND_URL=https://vibesift.vercel.app
BACKEND_URL=https://vibesift-backend.onrender.com
```
