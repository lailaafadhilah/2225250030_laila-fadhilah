# CLAUDE.md — Panduan untuk Claude Code di Proyek ProfitQuest

## Tentang Proyek
ProfitQuest adalah PWA edukasi "Petualangan Menghitung Untung dan Rugi" untuk siswa SMP (Aritmetika Sosial: persentase untung & rugi). Aplikasi ini dirancang berdasarkan teori beban kognitif dan hasil wawancara siswa. Pengembangnya mahasiswa S1 Pendidikan Matematika, sehingga kode harus **sederhana, mudah dibaca, dan dikomentari secukupnya dalam bahasa Indonesia**.

Baca dulu sebelum mengerjakan fitur:
- `docs/prd.md` — fitur (F01–F22), tujuan, dan kriteria rilis
- `docs/analisis-wawancara.md` — alasan di balik setiap keputusan desain (kode K/IL/EL/GL/DS, miskonsepsi M1–M6)
- `docs/desain-pembelajaran.md` — rumus inti & alur wilayah
- `docs/arsitektur.md` — struktur folder, API `core/`, dan model data
- `docs/ui-ux.md` — token warna, tata letak, dan gaya bahasa
- `docs/konten-materi.md` — aturan angka soal & contoh
- `docs/ai-tutor.md` — AI Tutor "Tanya Kak Profit" (backend Vercel + Gemini), keamanan, deploy

## Tumpukan Teknologi
- **App (JavaScript):** HTML + CSS + JavaScript ES Modules *vanilla* di folder `app/`. **Jangan** menambah framework (React/Vue), bundler, atau dependensi npm tanpa persetujuan eksplisit.
- **Python (3.10+):** hanya untuk perkakas di `tools/` dan uji di `tests/py`. Dependensi dicatat di `requirements.txt`.
- **PWA:** `app/manifest.webmanifest` + `app/sw.js`. Situs statis di GitHub Pages.
- **Backend AI Tutor (Node.js 22+):** hanya di folder `backend/` (Vercel Functions + `@google/genai`). Satu-satunya dependensi npm yang disetujui ada di `backend/package.json`. Frontend `app/` tetap tanpa npm.

## Perintah
```bash
python tools/serve.py --port 8000         # server lokal, buka http://localhost:8000
node --test "tests/js/*.test.js"         # uji rumus JS (Node 22 butuh pola glob)
cd backend && npm test                    # uji backend AI Tutor (Gemini ditiru)
cd backend && npm run dev                 # backend lokal → http://localhost:3000/api/tutor
python -m pytest tests/py                 # uji rumus Python
python tools/validate_content.py          # validasi semua konten JSON
python tools/generate_soal.py --per-templat 20   # tools/templat-soal.json → app/content/bank-soal.json
python tools/make_icons.py                # ikon PWA
python tools/make_qr.py <URL>             # QR brosur → brosur/qr.png
python tools/bundel_satu_file.py          # SATU berkas untuk claude.ai → dist/profitquest-terbit.html
python tools/bundel_satu_file.py --lengkap  # SATU berkas HTML lengkap → dist/profitquest.html (bisa dibuka langsung)
```
Halaman claude.ai memblokir CSS/JS terpisah: selalu terbitkan hasil `bundel_satu_file.py`, jangan berkas `app/` satu per satu. Alamat di dalam aplikasi wajib berupa hash sederhana (`#peta`, `#wilayah-3`), bukan `#/peta`. Jangan memakai `confirm()`/`alert()` (tidak tampil di halaman terbit).
Jika Node.js tidak terpasang: `python -m http.server 8765` dari folder proyek, lalu buka `http://localhost:8765/tests/js/uji-browser.html` (juga memeriksa kunci JS = kunci Python untuk seluruh bank soal).
Setelah mengubah templat, jalankan ulang `generate_soal.py`. Jangan mengedit `bank-soal.json` manual.
Jalankan **ketiga** perintah uji/validasi setelah mengubah `core/`, `tools/profit_core.py`, atau `app/content/`.

## Aturan Matematika (WAJIB)
1. Persentase untung/rugi **selalu** dibagi **modal (harga beli + biaya tambahan)**, tidak pernah harga jual.
2. `app/js/core/hitung.js` dan `tools/profit_core.py` harus memberi hasil identik untuk setiap kasus di `tests/test-vectors.json`. Ubah keduanya bersamaan.
3. Nominal rupiah selalu bilangan bulat. Hindari galat floating point: hitung persen sebagai `Math.round(selisih * 10000 / modal) / 100`.
4. Format tampilan: `Rp12.500` (titik ribuan), persen dengan koma desimal `12,5%`. Gunakan `core/format.js`, jangan format manual di UI.
5. Setiap kunci jawaban baru harus lolos `validate_content.py`.

## Aturan Desain (dari analisis beban kognitif)
- Satu ide per layar. Maksimal **2 tombol aksi** per layar (DS03).
- Langkah penyelesaian tampil **satu per satu** dan dipicu siswa. Tanpa auto-advance (EL04, DS01).
- Animasi boleh, tetapi hanya untuk makna: langkah baru, benar/salah, hasil hitungan, dan perayaan di layar hasil. Durasi ≤ 0,9 detik, tidak berulang terus di layar belajar (EL03). Semua gaya di `css/animasi.css`, pemicu lewat `js/ui/animasi.js`. Wajib mati saat `data-animasi="hemat"` atau `prefers-reduced-motion`. Jangan beri animasi transform pada wadah yang berisi `.aksi` (pakai `anim-muncul`).
- Rumus relevan selalu tampil berdekatan dengan langkah yang sedang dikerjakan (EL02).
- Tanpa gambar dekoratif di layar hitungan. Hanya ilustrasi barang + label harga (EL03).
- Ilustrasi SVG bergerak & maskot "Koko si Koin" (`js/ui/ilustrasi.js`) hanya untuk Beranda, Peta, kartu situasi, dan layar hasil. Adegan baru: tambahkan ke `ADEGAN` dan ke daftar `ILUSTRASI` di `tools/validate_content.py`.
- Peta = "Gedung Pasar Juragan" (`js/ui/peta-pasar.js`): tiap wilayah satu kios per lantai (terkunci = rolling door TUTUP, aktif = BUKA + Koko, selesai = cap LARIS). Barang di kios wajib berkaitan dengan materi wilayahnya. Jangan memakai konsep pulau/laut (permintaan pengguna: harus beda jauh dari aplikasi temannya). Warna tema per wilayah ada di `wilayah.json` (`warna`, `tag`) dan dipasang lewat `app.aturTema()`.
- Warna peran angka konsisten: biru = harga beli/modal, hijau = harga jual, oranye = biaya tambahan, ungu = ditanya. Selalu sertakan ikon + teks, jangan hanya warna.
- Pakai urutan "4 Langkah Juragan": Kenali → Bandingkan → Hitung selisih → Persenkan & Cek.
- Bawaan: semua jawaban angka dijawab dengan **mengklik pilihan** (permintaan pengguna). Pengecoh wajib berasal dari miskonsepsi (M1, M2, M4, M5, H1–H4) lewat `pilihanAngka()` di `soal/langkah.js`, tepat satu yang benar. Mode ketik tetap ada di Pengaturan (`cara_jawab`).
- Umpan balik salah bersifat diagnostik dan ramah (lihat M1–M6), bukan sekadar "Salah".

## Konvensi Kode
- Nama variabel, fungsi, berkas, dan teks UI dalam **bahasa Indonesia** (`hitungModal`, `hargaJual`). Kata kunci teknis web tetap bahasa Inggris.
- JS: ES Modules, `const`/`let`, tanpa variabel global, fungsi kecil. Modul `core/` murni (tanpa DOM/storage).
- Python: PEP 8, *type hints*, `snake_case`, dan docstring singkat.
- CSS: pakai variabel dari `tokens.css`, *mobile-first*, unit `rem`, target sentuh ≥ 48 px.
- Konten (soal, contoh, istilah) hanya di `app/content/*.json`. Jangan menulis teks soal langsung di kode.
- Setiap berkas baru di `app/` yang perlu offline harus ditambahkan ke daftar precache di `sw.js`, dan `VERSI` cache dinaikkan.

## Batasan
- Tanpa login, tanpa analytics pihak ketiga, dan tanpa mengirim data siswa ke server. AI Tutor hanya mengirim teks pertanyaan (tanpa nama/kelas/progres).
- `GEMINI_API_KEY` hanya di environment variable Vercel / `backend/.env`. Jangan pernah menulis kunci API di `app/` atau meng-commit `.env`.
- `PANDUAN_RMT` di `backend/lib/instruksi.js` hanya diisi dari ringkasan RMT resmi dosen. Jangan mengarang tahapan/istilah RMT.
- Daftar `MODE` di `backend/lib/validasi.js` harus sama dengan `mode` di `app/content/tutor.json` (dicek `validate_content.py`).
- Total ukuran `app/` usahakan ≤ 1,5 MB.
- Harus berjalan di Chrome Android 8+ dengan lebar layar 320 px.
- Bahasa Indonesia baku tetapi ramah siswa SMP: kalimat pendek, sapaan "kamu".

## Definisi Selesai (setiap fitur)
- [ ] Sesuai deskripsi fitur di PRD dan prinsip desain di atas
- [ ] Uji JS & Python lulus, konten valid
- [ ] Dicek di lebar 360 px dan mode offline
- [ ] Tidak ada error di konsol
- [ ] Bila memakai fitur baru, `docs/` diperbarui
