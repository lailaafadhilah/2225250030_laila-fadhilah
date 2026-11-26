# AI Tutor "Tanya Kak Profit" (Google Gemini API)

Fitur F23. Siswa bisa bertanya tentang untung, rugi, dan persentase kepada tutor AI bernama **Kak Profit**.
Frontend tetap di GitHub Pages. Kunci API Gemini hanya disimpan di backend **Vercel Functions**.

```
HP siswa (GitHub Pages)                Vercel (backend/)                      Google
app/js/screens/tutor.js  ── POST ──▶  api/tutor.js                ── SDK ──▶  Gemini API
  pertanyaan saja (tanpa              CORS · validasi · pembatas              (GEMINI_API_KEY
  nama/kelas/progres)                 instruksi Kak Profit · terjemah galat          hanya di sini)
```

## 1. Berkas

| Berkas | Fungsi |
|---|---|
| `backend/api/tutor.js` | Endpoint `POST /api/tutor` (juga menjawab `OPTIONS` untuk CORS) |
| `backend/api/kesehatan.js` | `GET /api/kesehatan`: cek backend hidup & kunci terpasang (isi kunci tidak pernah ditampilkan) |
| `backend/lib/tangani.js` | Urutan pemeriksaan: asal → metode → JSON & ukuran → pembatas → kunci → Gemini |
| `backend/lib/validasi.js` | Validasi input, batas panjang, penyamaran data pribadi, daftar `MODE` |
| `backend/lib/pembatas.js` | Rate limit di memori (per IP & total) |
| `backend/lib/instruksi.js` | Instruksi sistem Kak Profit + tempat **PANDUAN_RMT** |
| `backend/lib/gemini.js` | Memanggil `@google/genai`, model cadangan, menerjemahkan galat |
| `backend/lib/konfigurasi.js` | Origin yang diizinkan, daftar model, angka batas |
| `backend/server-lokal.js` | Menjalankan backend di laptop tanpa akun Vercel |
| `backend/test/tutor.test.js` | 14 uji (Gemini ditiru, tidak memakai kuota) |
| `app/js/screens/tutor.js` | Layar chat `#tutor` |
| `app/js/ai/tutor-api.js` | `fetch` ke backend + pesan galat sisi aplikasi (offline, waktu habis) |
| `app/js/ai/konfigurasi.js` | **Alamat backend** (ganti setelah deploy) |
| `app/js/ai/format-jawaban.js` | Menampilkan jawaban AI dengan aman (tanpa `innerHTML`) |
| `app/content/tutor.json` | Sapaan, pengingat, dan 5 tombol saran |

## 2. Jenis bantuan (`mode`)

| Mode | Tombol | Perilaku Kak Profit |
|---|---|---|
| `tanya` | 📘 Jelaskan untung & rugi, 🧮 Rumus persentase | Penjelasan konsep singkat + contoh sehari-hari |
| `contoh` | 🛒 Beri contoh soal | Membuat 1 soal cerita baru **tanpa** jawaban, lalu menawarkan mengecek |
| `langkah` | 🪜 Langkah demi langkah | Uraian bernomor mengikuti 4 Langkah Juragan |
| `petunjuk` | 💡 Aku butuh petunjuk | **Satu** petunjuk kecil, tanpa jawaban akhir, diakhiri pertanyaan pancingan |

Daftar `MODE` di `backend/lib/validasi.js` adalah sumber utama. `validate_content.py` memastikan `tutor.json` hanya memakai mode itu.

## 3. Pendekatan RMT (Rogorius Mathematical Thinking)

**Status: menunggu ringkasan RMT dari dosen.** `PANDUAN_RMT` di `backend/lib/instruksi.js` sengaja dikosongkan, sehingga Kak Profit tidak menyebut RMT sama sekali. Setelah ringkasan diterima, tahapan dan prinsipnya ditulis di sana (tanpa menambah istilah karangan), lalu `npm test` dijalankan.

Sementara itu Kak Profit memakai **4 Langkah Juragan** dan daftar miskonsepsi M1–M6 yang sudah ada di aplikasi.

## 4. Menjalankan backend di laptop

Butuh **Node.js 22 atau lebih baru** (https://nodejs.org, pilih versi LTS).

```bash
cd backend
npm install
copy .env.example .env        # Windows (Mac/Linux: cp .env.example .env)
# buka .env, isi GEMINI_API_KEY=... dari https://aistudio.google.com/apikey
npm run dev                   # → http://localhost:3000/api/tutor
npm test                      # 14 uji backend
```

Di terminal lain jalankan frontend: `python tools/serve.py --port 8000`, lalu buka `http://localhost:8000`.
Saat dibuka dari `localhost`, aplikasi otomatis memakai backend lokal `http://localhost:3000/api/tutor`.

Cek cepat: buka `http://localhost:3000/api/kesehatan` → `"kunciTerpasang": true`.

## 5. Deploy backend ke Vercel (gratis)

1. Masuk ke https://vercel.com memakai akun GitHub.
2. **Add New… → Project** → pilih repo `2225250030_laila-fadhilah` → **Import**.
3. **Root Directory**: klik *Edit*, pilih **`backend`**. Framework Preset: **Other**. Build Command dibiarkan kosong.
4. **Environment Variables**:
   - `GEMINI_API_KEY` = kunci dari https://aistudio.google.com/apikey (**wajib**)
   - `GEMINI_MODEL` = opsional. Kosong berarti memakai `gemini-3.5-flash-lite`.
   - `ALLOWED_ORIGINS` = opsional. `https://lailaafadhilah.github.io` sudah otomatis diizinkan.
5. Klik **Deploy**. Catat alamatnya, misalnya `https://profitquest-ai.vercel.app`.
6. Cek: buka `https://ALAMAT-KAMU.vercel.app/api/kesehatan` → harus `"ok": true, "kunciTerpasang": true`.
7. Hubungkan frontend: di `app/js/ai/konfigurasi.js` ganti
   `https://GANTI-NAMA-PROYEK.vercel.app/api/tutor` dengan alamat Vercel kamu + `/api/tutor`,
   naikkan `VERSI` di `app/sw.js`, lalu commit & push. GitHub Pages memperbarui aplikasi otomatis.

Setiap push ke `main` juga otomatis men-deploy ulang backend di Vercel.
Mengganti kunci API: Vercel → Project → Settings → Environment Variables → ubah → **Redeploy**.

## 6. Keamanan & privasi

- **Kunci API** hanya ada di environment variable Vercel / berkas `.env` lokal. `.env` masuk `.gitignore`. Jangan pernah menulisnya di `app/`.
- **CORS**: hanya `https://lailaafadhilah.github.io` (dan `localhost` saat `npm run dev`). Permintaan browser dari situs lain → 403.
- **Validasi**: hanya `POST` JSON, badan ≤ 12 KB, pesan ≤ 500 huruf, riwayat ≤ 6 giliran (masing-masing ≤ 1.500 huruf), `mode` dan `peran` harus dari daftar resmi.
- **Pembatas**: 6 pertanyaan/menit dan 80/hari per IP, serta 30/menit untuk semua pengguna per instans. Ini perlindungan "usaha terbaik" karena memori tiap instans Vercel terpisah. Untuk perlindungan lebih kuat, tambahkan aturan *Rate Limiting* di **Vercel → Firewall** untuk path `/api/tutor`.
- **Privasi siswa**: yang dikirim hanya teks pertanyaan + 6 giliran terakhir. Nama, kelas, dan progres **tidak** dikirim. Nama siswa yang tertulis di pesan diganti "aku" di HP. Email, nomor HP, dan angka panjang (NIK/NISN) disamarkan di backend. Percakapan hanya ada di memori (hilang saat aplikasi ditutup). Log server tidak mencatat isi pesan.
- **Catatan Free Tier**: menurut ketentuan Google, data dari Gemini API Free Tier dapat dipakai Google untuk meningkatkan layanannya. Karena itu aplikasi mengingatkan siswa agar tidak menulis data pribadi.
- **Batas topik**: instruksi Kak Profit menolak pertanyaan di luar matematika dan mengabaikan perintah untuk mengubah aturannya.

## 7. Pesan galat

| Kode | Kapan | Pesan ke siswa (ringkas) |
|---|---|---|
| `OFFLINE` | HP tidak ada internet | "Kamu sedang offline… Menu lain tetap bisa dipakai" |
| `BELUM_SIAP` | Alamat Vercel belum diisi di `konfigurasi.js` | "AI Tutor belum dihubungkan ke server" |
| `SERVER_TAK_TERJANGKAU` | Backend mati / alamat salah | "Server AI Tutor tidak bisa dihubungi" |
| `WAKTU_HABIS` | Jawaban > 25–30 detik | "Kak Profit butuh waktu terlalu lama" |
| `KUNCI_API_TIDAK_VALID` | Kunci salah / dicabut | "kunci API bermasalah. Beri tahu gurumu" |
| `KUOTA_HABIS` | Kuota Free Tier habis (429) | "Kuota AI Tutor hari ini sudah habis" |
| `SERVER_GEMINI_GANGGUAN` | Gemini 5xx / sibuk | "Server AI sedang sibuk atau gangguan" |
| `KONFIGURASI_BELUM_LENGKAP` | `GEMINI_API_KEY` kosong di Vercel | "AI Tutor belum disiapkan oleh pengelola" |
| `TERLALU_CEPAT` / `BATAS_HARIAN` / `RAMAI` | Pembatas aktif | "Pelan-pelan, ya…" |
| `PESAN_KOSONG` / `PESAN_TERLALU_PANJANG` / `INPUT_TIDAK_VALID` | Validasi | "Tulis dulu pertanyaanmu" / "Maksimal 500 huruf" |
| `ASAL_DITOLAK` | Dipanggil dari situs lain | (403, tidak tampil di aplikasi) |

Pertanyaan yang gagal dikembalikan ke kotak isian agar siswa bisa menekan **Kirim** lagi.

## 8. Model & kuota

- SDK: `@google/genai` **3.6.1** (dipatok tepat). Versi 3.x membutuhkan Node.js 22+.
- Model bawaan: `gemini-3.5-flash-lite` (kuota Free Tier paling longgar). Bila model tidak ditemukan (404), backend otomatis mencoba `gemini-3.1-flash-lite`, lalu `gemini-3.8-flash` (`MODEL_CADANGAN` di `backend/lib/konfigurasi.js`).
- Google rutin mempensiunkan model lama. Bila semua model cadangan sudah tidak ada (galat `MODEL_TIDAK_ADA`), isi `GEMINI_MODEL` di Vercel dengan nama model terbaru dari https://ai.google.dev/gemini-api/docs/models lalu Redeploy, tanpa mengubah kode.
- Alamat backend produksi: `https://2225250030laila-fadhilah-backend.vercel.app` (tercatat di `app/js/ai/konfigurasi.js`).
- Kuota Free Tier berubah-ubah dan dihitung **per proyek Google**. Cek angka terbaru di Google AI Studio → *Rate limits* untuk proyek kamu. Untuk satu kelas yang bertanya bersamaan, kuota harian bisa cepat habis. Pertimbangkan memakai satu kunci per kelas atau mengaktifkan *billing*.

## 9. Pengujian

```bash
cd backend && npm test                    # 14 uji backend (CORS, validasi, pembatas, galat, model cadangan, privasi)
node --test "tests/js/*.test.js"          # uji rumus JS
python -m pytest tests/py                 # uji rumus Python
python tools/validate_content.py          # konten + tutor.json + precache offline
```
Uji manual: buka `#tutor`, matikan internet (mode pesawat) → muncul pemberitahuan offline, tombol Kirim nonaktif, menu lain tetap jalan.
