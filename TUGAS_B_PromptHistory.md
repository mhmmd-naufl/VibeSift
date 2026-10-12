# Tugas B — Prompt History 📜

Halo! Tugas kamu bikin **riwayat prompt** biar prompt bagus yang pernah diketik user tidak hilang dan bisa diklik ulang.

## 1. Tugasmu apa

Bikin list riwayat di bawah kotak prompt.

File yang dikerjakan (CUMA 3 ini):
1. BARU: `frontend/components/PromptHistory.tsx` — tampilan list-nya
2. EDIT dikit: `frontend/app/dashboard/page.tsx` — nyimpan + nampilin riwayat
3. EDIT dikit: `frontend/components/PromptBox.tsx` — biar klik riwayat mengisi kotak teks

Spesifikasi:
- `PromptHistory.tsx` terima props: `history: string[]`, `onSelect: (v: string) => void`, `onClear: () => void`
- Kalau kosong tulis: "Belum ada riwayat." Kalau ada, tampilkan max 10 item, tiap item bisa diklik + ada tombol hapus/clear.
- Simpan di `localStorage` dengan key `vibesift-history`. Max 10, buang yang duplikat (yang baru taruh paling atas).
- Di `page.tsx`, simpan prompt ke history HANYA kalau generate sukses (di `handleGenerate` setelah tidak error).
- Klik item history → kotak teks di `PromptBox` keisi otomatis (tambah prop `onSelect`/value, jangan bikin textarea kedua).

## 2. Persiapan sekali saja

```bash
# install dulu: Git + Node.js LTS (cari "Node.js LTS" di Google)

git clone https://github.com/mhmmd-naufl/VibeSift.git
cd VibeSift

git checkout main
git pull origin main
git checkout -b feat/prompt-history

cd frontend
copy .env.local.example .env.local
npm install
npm run dev
```

Buka `http://127.0.0.1:3000` di browser. Kalau muncul halaman VibeSift berarti berhasil.

> Backend TIDAK perlu dijalankan untuk tugas ini. Cukup lihat history tersimpan/tampil.

## 3. Cara kerja tiap hari

```bash
cd VibeSift\frontend
npm run dev
# edit file di VS Code, simpan, lihat hasilnya langsung di browser
```

Simpan kerjaan (lakukan tiap selesai 1 bagian):

```bash
git status                  # lihat file apa yang berubah
git add frontend/components/PromptHistory.tsx frontend/app/dashboard/page.tsx frontend/components/PromptBox.tsx
git commit -m "feat: tambah prompt history localStorage"
git push -u origin feat/prompt-history
```

Hari berikutnya / lanjut kerja:

```bash
git checkout feat/prompt-history
git pull origin feat/prompt-history
```

## 4. Batasan (penting!)

- JANGAN ubah folder `backend/`. Jangan bikin tabel database baru. Full `localStorage` saja.
- JANGAN ubah logika generate yang sudah ada, hanya TAMBAH simpan history.
- JANGAN tulis API key / password asli di kode. Tidak ada secret yang di-commit.
- JANGAN pakai `any` di TypeScript. Kalau bingung tipe-nya, tanya.
- 1 fungsi max 40 baris. Kalau kepanjangan, pecah jadi fungsi kecil.

## 5. Selesai kalau (checklist)

- [ ] `npm run dev` jalan tanpa error merah
- [ ] Ketik 2–3 prompt → muncul di list riwayat
- [ ] Refresh browser → riwayat masih ada (berarti `localStorage` benar)
- [ ] Klik item → kotak prompt keisi lagi
- [ ] Tombol clear → list kosong
- [ ] Sudah `push` ke branch `feat/prompt-history` dan buka Pull Request ke `main` di GitHub

Cara buka PR: buka repo di GitHub → klik tombol kuning "Compare & pull request" → tulis judul → Create.

## 6. Kalau error / bingung

1. Foto / copy error merahnya, kirim ke channel Discord.
2. Tulis juga: lagi jalanin perintah apa + file apa yang diubah.
3. Jangan utak-atik file lain dulu sebelum dijawab.

Semangat, fitur ini kecil tapi langsung kepake tiap hari! 🙌
