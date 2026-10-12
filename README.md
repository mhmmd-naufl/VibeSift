# 🎧 VibeSift

> Open-source Spotify playlist curator berbasis AI. Buat playlist dari Liked Songs cukup dengan mengetik satu kalimat.

VibeSift menerjemahkan prompt bahasa alami (misal _"lagu indie akustik yang enak buat hujan-hujanan"_) menjadi parameter Audio Features, memfilter Liked Songs kamu, lalu otomatis membuat playlist di Spotify.

**Filosofi: "Fixed Core, Flexible AI"** — inti aplikasi simpel, tapi kamu bebas pakai AI provider mana pun.

---

## ✨ Fitur

- 🔐 **Login with Spotify** (OAuth)
- 🔄 **Sync Liked Songs** (pagination 50/request + audio features)
- 💬 **Natural language prompt** → playlist, sekali klik (+ quick prompt)
- 🛟 **Smart Fallback**: kalau filter AI menghasilkan < 15 lagu, filter dilonggarkan otomatis (response `fallback_applied: true`)
- 🔑 **BYOK** (Bring Your Own Key): Gemini, Groq, OpenAI, Anthropic, Ollama, atau custom
- 🗄️ **Migrasi database** via Alembic (`alembic upgrade head`)
- 🆓 **100% free tier** dari hulu ke hilir
- 🔒 **Privacy-first**: API key AI tidak disimpan di server

Lihat daftar lengkap di [PRD](./prd.md) dan status pengerjaan di [SISA_TUGAS.md](./SISA_TUGAS.md).

---

## 🏗️ Tech Stack

| Layer | Teknologi |
|---|---|
| Frontend | Next.js 14 (App Router), TypeScript strict, Tailwind, shadcn/ui, Zustand |
| Backend | FastAPI, Python 3.11+, Spotipy, LiteLLM, SQLAlchemy async, Alembic |
| Database | SQLite (lokal) / Supabase (produksi) |
| AI | Gemini 2.0 Flash (default), Groq, OpenAI, Anthropic, Ollama |

---

## ✅ Prasyarat

- Git
- Node.js LTS + npm
- Python 3.11+ (Windows: centang "Add to PATH" saat install)
- Akun Spotify + aplikasi di [Spotify Developer Dashboard](https://developer.spotify.com/dashboard)
- API key AI gratis dari [Google AI Studio](https://aistudio.google.com/app/apikey)

---

## 🚀 Quickstart (Self-Hosted)

```bash
# 1. Clone
git clone https://github.com/mhmmd-naufl/VibeSift.git
cd VibeSift
```

### Backend (terminal 1)

```bash
cd backend
python -m venv .venv
.venv\Scripts\activate            # Windows (Linux/macOS: source .venv/bin/activate)
pip install -r requirements.txt
copy .env.example .env            # isi SPOTIFY_CLIENT_ID & SPOTIFY_CLIENT_SECRET
alembic upgrade head              # bikin 3 tabel (wajib, sekali saja)
uvicorn app.main:app --reload     # http://localhost:8000 (+ docs di /docs)
```

### Frontend (terminal 2)

```bash
cd frontend
copy .env.local.example .env.local
npm install
npm run dev                       # http://localhost:3000
```

### Pakai aplikasinya

1. Buka `http://127.0.0.1:3000`, klik "Login with Spotify"
2. Masukkan API key AI di halaman Settings (disimpan di browser saja)
3. Klik "Sync Liked Songs", tunggu sampai selesai
4. Ketik prompt → "Generate Playlist" → "Open in Spotify"

> **Penting — redirect URI Spotify:** Spotify tidak lagi menerima `localhost`; gunakan loopback IP
> eksplisit `http://127.0.0.1:3000/auth/callback` (HTTP diizinkan untuk loopback). Daftarkan URI
> tersebut di [Spotify Developer Dashboard](https://developer.spotify.com/dashboard) → *Edit Settings
> → Redirect URIs*, agar sama persis dengan `SPOTIFY_REDIRECT_URI` di `.env`.
>
> Karena redirect kembali ke `127.0.0.1`, buka aplikasi lewat `http://127.0.0.1:3000` (bukan
> `localhost`) agar origin-nya konsisten dengan CORS backend.

---

## 🧪 Testing

```bash
cd backend
.venv\Scripts\activate
python -m pytest -q                # smoke + fallback, harusnya 6 passed
```

---

## 📁 Struktur Repo (ringkas)

```text
vibesift/
├── frontend/app/          # Landing, dashboard, settings (Next.js App Router)
├── frontend/components/   # PromptBox, PlaylistCard, SyncProgress (+ ui/shadcn)
├── frontend/lib/          # api.ts (fetch wrapper), store.ts (Zustand), types.ts
├── backend/app/api/       # auth, sync, playlist, stats
├── backend/app/services/  # spotify.py, ai.py, playlist.py (+ fallback)
├── backend/alembic/       # migrasi database (0001_initial)
├── tasks.md               # breakdown task resmi
├── SISA_TUGAS.md          # list cicilan tim (mana yang bebas diambil)
├── TUGAS_A_*.md / TUGAS_B_*.md  # panduan per anggota tim
└── api_reference.md       # kontrak endpoint + format error
```

Detail arsitektur lihat [architecture.md](./architecture.md).

---

## 🤝 Berkontribusi (aturan tim)

1. Baca [agents.md](./agents.md) — semua kode wajib mengikuti aturan di sana
2. Ambil 1 tugas dari [SISA_TUGAS.md](./SISA_TUGAS.md), tandai `[~]` + namamu
3. Buat branch `feat/<nama-singkat>`, **jangan coding langsung di `main`**
4. Commit tiap selesai 1 bagian, push, buka PR ke `main`
5. Definisi selesai ada di [tasks.md](./tasks.md#definition-of-done)

---

## 🆘 Troubleshooting

| Gejala | Solusi |
|---|---|
| `alembic upgrade head` error "table already exists" | DB lama dari versi `create_all`: jalankan `alembic stamp head` sekali, lalu `upgrade head` lagi |
| Frontend tidak bisa hit backend (CORS) | Buka via `http://127.0.0.1:3000`, cek `CORS_ORIGINS` di `backend/.env` |
| Spotify redirect error | Pastikan Redirect URI di dashboard Spotify = `SPOTIFY_REDIRECT_URI` di `.env`, persis |
| `npm run dev` port 3000 dipakai | Tutup proses lama atau jalankan `npx next dev -p 3001` (lalu sesuaikan CORS) |
| Generate error `AI_KEY_MISSING` | Isi API key di halaman Settings dulu |

---

## 📚 Dokumentasi

| Dokumen | Isi |
|---|---|
| [prd.md](./prd.md) | Product Requirements Document |
| [agents.md](./agents.md) | Aturan & standar coding (wajib dibaca AI agent) |
| [architecture.md](./architecture.md) | Arsitektur, struktur folder, alur data |
| [api_reference.md](./api_reference.md) | Kontrak & daftar endpoint API |
| [tasks.md](./tasks.md) | Breakdown task untuk vibecoding |
| [SISA_TUGAS.md](./SISA_TUGAS.md) | List sisa tugas + siapa mengerjakan apa |

---

## 📄 Lisensi

MIT (open-source).
