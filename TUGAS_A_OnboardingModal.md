# Tugas A — Onboarding Modal API Key 🪪

Halo! Tugas kamu bikin **popup panduan** biar user baru ngerti harus isi API key AI di mana.

## 1. Tugasmu apa

Bikin popup yang muncul otomatis kalau user belum isi API key.

File yang dikerjakan (CUMA 2 ini):
1. BARU: `frontend/components/OnboardingModal.tsx` — isi popup-nya
2. EDIT dikit: `frontend/app/dashboard/page.tsx` — nampilin popup-nya

Contoh isi popup:
- Judul: "Butuh API Key AI gratis"
- 3 langkah: Buka Google AI Studio → Klik Get API Key → Paste di Settings → Save
- 2 tombol: "Ke Settings" (pindah ke `/settings`) + "Nanti aja" (tutup popup)

Cara tahu user belum isi key: baca `aiKey` dari `frontend/lib/store.ts` pakai `useStore`. Kalau `hasHydrated` sudah `true` DAN `aiKey` kosong → popup dibuka. Kalau `aiKey` sudah ada → jangan tampilkan.

Pakai `Dialog` yang sudah ada di `frontend/components/ui/`. Jangan bikin modal dari nol.

## 2. Persiapan sekali saja

```bash
# install dulu: Git + Node.js LTS (cari "Node.js LTS" di Google)

git clone https://github.com/mhmmd-naufl/VibeSift.git
cd VibeSift

git checkout main
git pull origin main
git checkout -b feat/onboarding-modal

cd frontend
copy .env.local.example .env.local
npm install
npm run dev
```

Buka `http://127.0.0.1:3000` di browser. Kalau muncul halaman VibeSift berarti berhasil.

> ⚠️ `main` baru diupdate (migrasi DB + fallback + README baru). Kalau kamu
> sudah pernah clone SEBELUM hari ini, update dulu sebelum bikin branch:
> ```bash
> cd VibeSift
> git checkout main
> git pull origin main
> git checkout -b feat/onboarding-modal
> ```
> Intinya: branch fitur WAJIB berangkat dari `main` yang paling baru.

> Backend TIDAK perlu dijalankan untuk tugas ini.

## 3. Cara kerja tiap hari

```bash
cd VibeSift\frontend
npm run dev
# edit file di VS Code, simpan, lihat hasilnya langsung di browser
```

Simpan kerjaan (lakukan tiap selesai 1 bagian):

```bash
git status                  # lihat file apa yang berubah
git add frontend/components/OnboardingModal.tsx frontend/app/dashboard/page.tsx
git commit -m "feat: tambah onboarding modal API key"
git push -u origin feat/onboarding-modal
```

Hari berikutnya / lanjut kerja:

```bash
git checkout feat/onboarding-modal
git pull origin feat/onboarding-modal
```

## 4. Batasan (penting!)

- JANGAN ubah folder `backend/`. Cuma 2 file frontend di atas.
- JANGAN tulis API key / password asli di kode. API key cuma untuk dites di browser, tidak di-commit.
- JANGAN pakai `any` di TypeScript. Kalau bingung tipe-nya, tanya.
- 1 fungsi max 40 baris. Kalau kepanjangan, pecah jadi fungsi kecil.
- Ikuti gaya Tailwind yang sudah ada di file lain.

## 5. Selesai kalau (checklist)

- [ ] `npm run dev` jalan tanpa error merah
- [ ] Hapus key di halaman Settings → refresh dashboard → popup muncul
- [ ] Isi key → refresh → popup hilang
- [ ] Tombol "Ke Settings" pindah ke `/settings`, tombol "Nanti aja" menutup popup
- [ ] Sudah `push` ke branch `feat/onboarding-modal` dan buka Pull Request ke `main` di GitHub

Cara buka PR: buka repo di GitHub → klik tombol kuning "Compare & pull request" → tulis judul → Create.

## 6. Kalau error / bingung

1. Foto / copy error merahnya, kirim ke channel Discord.
2. Tulis juga: lagi jalanin perintah apa + file apa yang diubah.
3. Jangan utak-atik file lain dulu sebelum dijawab.

Semangat, tugas ini kecil tapi kepake beneran! 🙌
