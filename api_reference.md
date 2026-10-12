# API Reference - VibeSift

Kontrak API backend VibeSift (FastAPI). Semua endpoint di-prefix `/api`.

**Base URL (dev):** `http://127.0.0.1:8000`  
**Base URL (prod):** sesuai `BACKEND_URL`

---

## 📑 Table of Contents

- [Konvensi Umum](#konvensi-umum)
- [Authentication](#authentication)
- [Sync](#sync)
- [Playlist](#playlist)
- [Stats](#stats)
- [Format Error](#format-error)

---

## Konvensi Umum

- Format request/response: **JSON** (`application/json`)
- Autentikasi Spotify: Bearer token sesi (dikelola backend)
- API key AI: dikirim per-request via header `X-AI-API-Key` (**wajib** untuk endpoint yang memanggil AI)
- Semua response sukses memakai `2xx`; kegagalan memakai skema error di bawah

---

## Authentication

### `POST /api/auth/spotify/login`
Redirect user ke halaman otorisasi Spotify.

**Response:** `302 Redirect` ke `accounts.spotify.com/authorize`

---

### `GET /api/auth/spotify/callback`
Menukar authorization `code` menjadi token. Spotify me-redirect user ke
halaman frontend (`SPOTIFY_REDIRECT_URI`, mis. `http://127.0.0.1:3000/auth/callback`),
lalu halaman tersebut memanggil endpoint ini dengan `code` dari query string.

> Spotify mensyaratkan loopback **IP eksplisit** (`127.0.0.1`) dan **tidak** menerima
> `localhost`. Untuk loopback, HTTP tetap diperbolehkan.

**Query params:**

| Param | Tipe | Wajib | Keterangan |
|---|---|---|---|
| `code` | string | ✅ | Authorization code dari Spotify |

**Response `200`:**
```json
{
  "access_token": "BQ...",
  "expires_in": 3600,
  "user": { "id": "spotify_user_id", "display_name": "Nama" }
}
```

---

### `POST /api/auth/spotify/refresh`
Menukar `refresh_token` dengan access token baru.

**Request body:**
```json
{ "refresh_token": "AQ..." }
```

**Response `200`:** sama seperti callback di atas.

---

## Sync

### `POST /api/sync/liked-songs`
Menarik seluruh Liked Songs + audio features dari Spotify dan menyimpannya ke cache lokal. Berjalan dengan pagination (50/request) dan progress tracking.

**Response `200`:**
```json
{
  "synced_count": 1247,
  "duration_ms": 28400,
  "last_sync": "2026-10-11T10:00:00Z"
}
```

**Error yang mungkin:**
- `429` — Spotify rate limit (backend harus retry dengan backoff)
- `502` — Spotify API gagal

> Untuk progres real-time, gunakan polling atau (opsional) Server-Sent Events.

---

## Playlist

### `POST /api/generate-playlist`
Endpoint inti: prompt → (AI) parameter → filter DB → buat playlist di Spotify.

**Headers:**

| Header | Wajib | Keterangan |
|---|---|---|
| `X-AI-API-Key` | ✅ | API key AI milik user |

**Request body:**
```json
{
  "prompt": "Lagu-lagu galau akustik buat menemani kerja malam",
  "provider": "gemini",
  "model": "gemini-2.0-flash"
}
```

**Response `200`:**
```json
{
  "playlist_id": "spotify_playlist_id",
  "name": "Late Night Acoustic",
  "description": "Playlist akustik galau untuk kerja malam",
  "track_count": 24,
  "spotify_url": "https://open.spotify.com/playlist/...",
  "ai_parameters": {
    "min_energy": 0.2,
    "max_energy": 0.5,
    "min_acousticness": 0.7
  },
  "fallback_applied": false
}
```

> Jika filter AI menghasilkan < 15 lagu, backend melonggarkan filter bertahap
> (buang batas tempo → instrumentalness → lebarkan range) dan mengembalikan
> `fallback_applied: true`.

**Error yang mungkin:**
- `400` — Prompt kosong / tidak valid
- `401` — `X-AI-API-Key` tidak ada
- `422` — Output AI bukan JSON valid (setelah retry)
- `502` — AI provider atau Spotify API gagal

---

### `GET /api/playlists`
Daftar playlist yang pernah digenerate user.

**Response `200`:**
```json
{
  "playlists": [
    {
      "id": "uuid",
      "spotify_playlist_id": "37i9...",
      "name": "Late Night Acoustic",
      "track_count": 24,
      "created_at": "2026-10-11T10:05:00Z"
    }
  ]
}
```

---

### `DELETE /api/playlists/{id}`
Hapus playlist dari Spotify dan dari database lokal.

**Path params:** `id` (UUID record lokal)

**Response `204`:** No Content

---

## Stats

### `GET /api/stats`
Statistik ringkas untuk dashboard.

**Response `200`:**
```json
{
  "total_tracks": 1247,
  "total_playlists": 6,
  "last_sync": "2026-10-11T10:00:00Z"
}
```

---

## Format Error

Semua error memakai bentuk konsisten:

```json
{
  "detail": "Pesan error yang ramah untuk user",
  "code": "AI_INVALID_JSON"
}
```

**Daftar kode error:**

| `code` | HTTP | Arti |
|---|---|---|
| `PROMPT_EMPTY` | 400 | Prompt tidak diisi |
| `AI_KEY_MISSING` | 401 | Header `X-AI-API-Key` kosong |
| `AI_INVALID_JSON` | 422 | AI tidak menghasilkan JSON valid |
| `SPOTIFY_RATE_LIMIT` | 429 | Terkena rate limit Spotify |
| `UPSTREAM_ERROR` | 502 | Spotify/AI provider gagal |
