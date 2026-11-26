# ProfitQuest — Petualangan Menghitung Untung dan Rugi

Aplikasi web progresif (PWA) untuk siswa SMP yang mempelajari **Persentase Untung dan Rugi** (Aritmetika Sosial). Aplikasi ini dirancang berdasarkan teori beban kognitif dan melatih literasi matematika. Bisa dibuka lewat browser atau QR code brosur, dipasang di Android tanpa Play Store, dan dipakai offline.

> Status: **MVP siap diuji**: 6 wilayah, 120 soal bank, bisa dipasang & offline.

## Dokumen Perencanaan
| Berkas | Isi |
|---|---|
| [docs/prd.md](docs/prd.md) | Kebutuhan produk: tujuan, pengguna, fitur, metrik |
| [docs/analisis-wawancara.md](docs/analisis-wawancara.md) | Temuan wawancara → prinsip beban kognitif → fitur |
| [docs/desain-pembelajaran.md](docs/desain-pembelajaran.md) | Tujuan pembelajaran, rumus, literasi, alur wilayah |
| [docs/arsitektur.md](docs/arsitektur.md) | Teknologi (JS + Python), struktur folder, data, PWA |
| [docs/ui-ux.md](docs/ui-ux.md) | Pedoman tampilan & interaksi, wireframe |
| [docs/konten-materi.md](docs/konten-materi.md) | Kamus istilah, contoh soal, aturan angka |
| [docs/rencana-pengujian.md](docs/rencana-pengujian.md) | Uji teknis, validasi ahli, uji coba siswa |
| [docs/deployment.md](docs/deployment.md) | Hosting, instalasi PWA, brosur & QR |
| [docs/ai-tutor.md](docs/ai-tutor.md) | AI Tutor "Tanya Koko": backend Vercel + Gemini, keamanan, deploy |
| [docs/roadmap.md](docs/roadmap.md) | Tahapan ADDIE & daftar tugas per sprint |
| [CLAUDE.md](CLAUDE.md) | Aturan kerja untuk Claude Code |

## Mulai Cepat
```bash
pip install -r requirements.txt
python tools/serve.py --port 8000
# laptop: http://localhost:8000   ·   HP (satu Wi-Fi): alamat LAN yang ditampilkan
```

## Uji & Validasi
```bash
python -m pytest tests/py              # rumus Python
python tools/validate_content.py       # konten, kunci jawaban, daftar offline
node --test "tests/js/*.test.js"      # rumus JS (butuh Node.js 22+)
cd backend && npm test                 # backend AI Tutor
# tanpa Node: python -m http.server 8765 → http://localhost:8765/tests/js/uji-browser.html
```

## Publikasi
1. Unggah isi folder `app/` ke GitHub Pages / Netlify (HTTPS).
2. `python tools/make_qr.py https://alamat-anda`, lalu ganti alamat & nama di `brosur/brosur.html`.
3. Buka brosur di Chrome → Cetak → A5 → Simpan PDF.
Detail: [docs/deployment.md](docs/deployment.md).

## Struktur
```
app/        aplikasi PWA (di-deploy ke GitHub Pages)
backend/    AI Tutor: Vercel Functions + Google Gemini API (di-deploy ke Vercel)
tools/      perkakas Python (generator soal, validator, server, ikon, QR)
tests/      uji Python & JS + test-vectors.json bersama
brosur/     brosur siap cetak
docs/       dokumen perencanaan
```

## Lisensi & Kredit
Dikembangkan oleh mahasiswa S1 Pendidikan Matematika sebagai media pembelajaran. Kebutuhan pengguna diambil dari wawancara siswa (kode S01, 7 November 2026).
