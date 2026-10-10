# VibeSift - AI Coding Guidelines

> Panduan wajib untuk semua AI coding agent yang berkontribusi ke VibeSift. Baca dokumen ini **sebelum** menulis kode apa pun.

## 📑 Table of Contents

- [🎯 Project Overview](#-project-overview)
- [🏗️ Tech Stack (WAJIB IKUTI)](#️-tech-stack-wajib-diikuti)
- [📝 STRICT Coding Rules (WAJIB DIIKUTI)](#-strict-coding-rules-wajib-diikuti)
- [🚫 Common Mistakes to Avoid](#-common-mistakes-to-avoid)
- [✅ Checklist Sebelum Generate Code](#-checklist-sebelum-generate-code)
- [📚 Resources](#-resources)

## 🎯 Project Overview

**VibeSift** adalah open-source Spotify playlist curator berbasis AI yang memungkinkan user membuat playlist dari Liked Songs hanya dengan mengetik prompt natural language.

**Filosofi Utama:** "Fixed Core, Flexible AI"
- Inti aplikasi harus simpel, cepat, dan mudah digunakan
- User awam bisa pakai tanpa paham teknis
- Power user bisa custom AI provider dan model
- 100% free tier dari hulu ke hilir

## 🏗️ Tech Stack (WAJIB IKUTI)

### Frontend
- **Framework**: Next.js 14+ (App Router ONLY, jangan pakai Pages Router)
- **Language**: TypeScript (strict mode: `{"strict": true}` di tsconfig.json)
- **Styling**: Tailwind CSS 3.4+
- **Components**: shadcn/ui (install via `npx shadcn-ui@latest add [component]`)
- **State Management**: Zustand 4+ (JANGAN pakai Redux)
- **Forms**: React Hook Form 7+ + Zod 3+ untuk validation
- **Icons**: Lucide React
- **HTTP Client**: Axios atau fetch native (dengan error handling)

### Backend
- **Framework**: FastAPI 0.100+ (Python 3.11+)
- **Spotify SDK**: Spotipy 2.23+
- **AI Integration**: LiteLLM 1.25+ (unified API untuk semua provider)
- **Database ORM**: SQLAlchemy 2.0+ (async mode)
- **Database Migration**: Alembic 1.13+
- **Validation**: Pydantic 2.5+
- **HTTP Client**: HTTPX 0.26+ (async, jangan pakai requests)
- **Environment**: python-dotenv 1.0+

### Database
- **Local Development**: SQLite (file-based, zero-config)
- **Production**: Supabase (PostgreSQL) atau MongoDB Atlas
- **Default Tables**: `cached_tracks`, `generated_playlists`, `user_sessions`

### AI Providers (Support via LiteLLM)
- **Default**: Google Gemini 2.0 Flash (gratis, cepat)
- **Alternative**: Groq Llama 3.3 70B (super cepat)
- **Paid**: OpenAI GPT-4o-mini, Anthropic Claude 3.5 Sonnet
- **Local**: Ollama (llama3, mistral, phi3)

## 📝 STRICT Coding Rules (WAJIB DIIKUTI)

### General Rules
1. **Minimalis**: Tulis kode sesedikit mungkin. Jika bisa 10 baris, jangan 20 baris.
2. **Type Safety**: 
   - Python: Wajib type hints di SEMUA fungsi (parameter & return)
   - TypeScript: Strict mode, JANGAN pakai `any` (pakai `unknown` atau proper types)
3. **Ukuran Fungsi**: Maksimal 40 baris per fungsi. Jika lebih, pecah jadi fungsi kecil.
4. **Ukuran File**: Maksimal 300 baris per file. Jika lebih, split ke file lain.
5. **Dokumentasi**: 
   - Python: Docstring (Google style) untuk semua public functions
   - TypeScript: JSDoc untuk semua exported functions & components
6. **Naming Convention**:
   - Python: snake_case untuk variables/functions, PascalCase untuk classes
   - TypeScript: camelCase untuk variables/functions, PascalCase untuk components/types
7. **Error Handling**: 
   - WAJIB handle error di setiap API call (Spotify, AI, Database)
   - Jangan biarkan aplikasi crash
   - Return user-friendly error messages
8. **Security**: 
   - JANGAN PERNAH hardcode API key, password, atau secret
   - Selalu gunakan environment variables (`os.getenv()` atau `process.env`)
   - Validasi semua input dari user (prevent injection attacks)

## 🚫 Common Mistakes to Avoid

### Backend
- ❌ Fetch semua Liked Songs sekaligus (SPOTIFY LIMIT 50 PER REQUEST)
- ❌ Trust AI output tanpa validasi (AI bisa hallucinate JSON rusak)
- ❌ Simpan API key user di database (privacy violation)
- ❌ Hardcode Spotify Client ID/Secret di kode
- ❌ Tidak handle pagination saat sync ribuan lagu
- ❌ Tidak handle rate limit dari Spotify/AI API
- ❌ Pakai `requests` library (blocking), harusnya `httpx` (async)
- ❌ Tidak ada error handling di API calls
- ❌ Fungsi lebih dari 40 baris
- ❌ Tidak ada type hints

### Frontend
- ❌ Pakai Pages Router (harus App Router)
- ❌ Pakai `any` di TypeScript
- ❌ Komponen lebih dari 200 baris
- ❌ Tidak ada loading states
- ❌ Tidak ada error boundaries
- ❌ Hardcode API URLs (harus pakai environment variables)
- ❌ Tidak handle API errors dengan user-friendly messages
- ❌ Class components (harus functional components)
- ❌ Tidak pakai TypeScript strict mode

### AI Integration
- ❌ Kirim semua Liked Songs ke AI (mahal & lambat)
- ❌ Tidak pakai `response_format: { type: "json_object" }`
- ❌ Tidak ada fallback jika AI gagal
- ❌ Prompt terlalu vague (AI jadi hallucinate)
- ❌ Tidak validasi output JSON dari AI

## ✅ Checklist Sebelum Generate Code

Sebelum minta AI agent generate kode, pastikan:

- [ ] Kode mengikuti semua aturan di atas
- [ ] Type hints (Python) / TypeScript strict diterapkan
- [ ] Error handling sudah ada di semua API calls
- [ ] Tidak ada hardcoded secrets
- [ ] Fungsi < 40 baris, file < 300 baris
- [ ] Docstring/JSDoc untuk public functions
- [ ] Test sudah ditulis (atau akan ditulis)
- [ ] Tidak over-engineer (minimalis!)

## 📚 Resources

**Dokumen internal:**
- [PRD](./prd.md) — Product Requirements Document
- [Architecture](./architecture.md) — Arsitektur sistem & struktur folder
- [API Reference](./api_reference.md) — Daftar endpoint & kontrak API
- [Tasks](./tasks.md) — Breakdown task untuk vibecoding

**Referensi eksternal:**
- [Spotify Web API Docs](https://developer.spotify.com/documentation/web-api)
- [LiteLLM Docs](https://docs.litellm.ai/)
- [FastAPI Docs](https://fastapi.tiangolo.com/)
- [Next.js Docs](https://nextjs.org/docs)