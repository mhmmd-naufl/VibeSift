# Sisa Tugas VibeSift — List Cicilan

Sumber: `tasks.md` yang belum ke-centang + cek kode 2026-10-12.
Cara pakai: ganti `[ ]` jadi `[~]` kalau lagi dikerjain, `[x]` kalau selesai + PR merged.

## Sedang jalan (jangan diambil orang lain)

- [~] Onboarding modal API key — Teman A — branch `feat/onboarding-modal` — `TUGAS_A_OnboardingModal.md`
- [~] Prompt History localStorage — Teman B — branch `feat/prompt-history` — `TUGAS_B_PromptHistory.md`

## Sisa wajib (kamu cicil duluan)

- [x] Alembic init + migrasi awal — SELESAI (alembic.ini + alembic/env.py + 0001_initial, `main.py` tanpa `create_all`, smoke 3 passed)
- [ ] End-to-end test manual — level: mudah — butuh kredensial Spotify
  Done kalau: login → sync → generate tercatat langkah + hasil URL playlist di catatan PR.
- [ ] Deploy publik (Vercel + Render + Supabase) — level: menengah
  Done kalau: ada 2 URL publik (FE + BE) + `BACKEND_URL`/`FRONTEND_URL` keisi, dashboard bisa hit BE prod.

## Sisa opsional (buat teman yang sudah selesai)

- [ ] Prompt History full + share via URL — lanjutan Teman B — level: mudah-menengah
  Tambah: simpan provider/model + tombol copy link `?prompt=...`, dashboard baca query param buat prefill.
- [ ] Dark/Light mode + i18n — level: mudah — cocok buat pemula
  Tambah toggle di header + file `frontend/lib/i18n.ts` minimal ID/EN buat string utama.
- [x] Smart Fallback (<15 lagu → relaksasi filter bertahap + flag `fallback_applied`) — SELESAI (6 tests passed; Recommendations API Spotify tidak dipakai karena endpoint-nya deprecated)
- [ ] Visual Mood Map (scatter Energy × Valence) — level: menengah-berat — butuh lib chart
- [ ] Auto-Clustering (1 klik → 5-10 playlist) — level: berat — kerjakan terakhir

## Urutan saran buat kamu

1. E2E test manual (pastikan MVP beneran jalan)
2. Deploy publik
3. Baru ambil 1 opsional dari atas ke bawah (Prompt History full → Dark/Light + i18n → Mood Map → Clustering)

## Aturan ambil tugas baru

1. Pilih 1 dari list, ubah jadi `[~]` + tulis nama di sini.
2. Bikin branch `feat/<nama-singkat>`, jangan coding di `main`.
3. Selesai = checklist di file `TUGAS_*` lolos + PR ke `main`.
