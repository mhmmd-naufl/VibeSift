# 🎧 VibeSift

> Open-source Spotify playlist curator berbasis AI. Buat playlist dari Liked Songs cukup dengan mengetik satu kalimat.

VibeSift menerjemahkan prompt bahasa alami (misal _"lagu indie akustik yang enak buat hujan-hujanan"_) menjadi parameter Audio Features, memfilter Liked Songs kamu, lalu otomatis membuat playlist di Spotify.

**Filosofi: "Fixed Core, Flexible AI"** — inti aplikasi simpel, tapi kamu bebas pakai AI provider mana pun.

---

## ✨ Fitur

- 🔐 **Login with Spotify** (OAuth)
- 🔄 **Sync Liked Songs** (pagination + audio features)
- 💬 **Natural language prompt** → playlist, sekali klik
- 🔑 **BYOK** (Bring Your Own Key): Gemini, Groq, OpenAI, Ollama, atau custom
- 🆓 **100% free tier** dari hulu ke hilir
- 🔒 **Privacy-first**: API key AI tidak disimpan di server

Lihat daftar lengkap di [PRD](./prd.md).

---

## 🏗️ Tech Stack

| Layer | Teknologi |
|---|---|
| Frontend | Next.js 14 (App Router), TypeScript, Tailwind, shadcn/ui, Zustand |
| Backend | FastAPI, Python 3.11+, Spotipy, LiteLLM, SQLAlchemy |
| Database | SQLite (lokal) / Supabase (produksi) |
| AI | Gemini 2.0 Flash (default), Groq, OpenAI, Ollama |

---

## 🚀 Quickstart (Self-Hosted)

```bash
# 1. Clone
git clone https://github.com/mhmmd-naufl/vibesift.git
cd vibesift

# 2. Backend
cd backend
python -m venv .venv
.venv\Scripts\activate            # Windows (Linux/macOS: source .venv/bin/activate)
pip install -r requirements.txt
copy .env.example .env            # isi SPOTIFY_CLIENT_ID & SPOTIFY_CLIENT_SECRET
uvicorn app.main:app --reload     # http://localhost:8000

# 3. Frontend (terminal baru)
cd frontend
copy .env.local.example .env.local
npm install
npm run dev                       # http://localhost:3000
```

Buka `http://127.0.0.1:3000`, login dengan Spotify, lalu masukkan API key AI gratis dari [Google AI Studio](https://aistudio.google.com/app/apikey).

> **Penting — redirect URI Spotify:** Spotify tidak lagi menerima `localhost`; gunakan loopback IP
> eksplisit `http://127.0.0.1:3000/auth/callback` (HTTP diizinkan untuk loopback). Daftarkan URI
> tersebut di [Spotify Developer Dashboard](https://developer.spotify.com/dashboard) → *Edit Settings
> → Redirect URIs*, agar sama persis dengan `SPOTIFY_REDIRECT_URI` di `.env`.
>
> Karena redirect kembali ke `127.0.0.1`, buka aplikasi lewat `http://127.0.0.1:3000` (bukan
> `localhost`) agar origin-nya konsisten dengan CORS backend.

---

## 📚 Dokumentasi

| Dokumen | Isi |
|---|---|
| [prd.md](./prd.md) | Product Requirements Document |
| [agents.md](./agents.md) | Aturan & standar coding (wajib dibaca AI agent) |
| [architecture.md](./architecture.md) | Arsitektur, struktur folder, alur data |
| [api_reference.md](./api_reference.md) | Kontrak & daftar endpoint API |
| [tasks.md](./tasks.md) | Breakdown task untuk vibecoding |

---

## 🤝 Berkontribusi

1. Baca [agents.md](./agents.md) — semua kode wajib mengikuti aturan di sana
2. Pilih task dari [tasks.md](./tasks.md)
3. Buat branch, kerjakan, ajukan PR

---

## 📄 Lisensi

MIT (open-source).
