# Roadmap & Daftar Tugas

Model pengembangan selaras dengan **ADDIE** (Analysis, Design, Development, Implementation, Evaluation), yang umum dipakai dalam penelitian R&D pendidikan.

## Fase 0 — Analisis ✅ / 🔄
- [x] Wawancara siswa S01 (7 Nov 2026)
- [x] Analisis kebutuhan → [analisis-wawancara.md](analisis-wawancara.md)
- [ ] (Disarankan) Wawancara tambahan 2–4 siswa + 1 guru
- [ ] Analisis kurikulum & buku Kemendikbud kelas VII bab Aritmetika Sosial

## Fase 1 — Desain
- [x] PRD, desain pembelajaran, arsitektur, pedoman UI/UX, spesifikasi konten
- [ ] Sketsa/wireframe di kertas atau Figma untuk 6 layar kunci
- [ ] Ilustrasi barang SVG (10–15 barang)
- [ ] Ikon aplikasi 512 px + maskable

## Fase 2 — Pengembangan (MVP) ✅ versi 1.0.0 (11 Nov 2026)
Sudah dibuat: F01–F17, F18 (lencana), F19 (ekspor/impor kode). Belum: F20–F22.
Tersisa: uji di HP Android sungguhan, audit Lighthouse, deploy, isi nama di brosur.
**Sprint 1 — Fondasi**
- [ ] Struktur folder, `index.html`, `tokens.css`, router hash
- [ ] `core/hitung.js`, `core/format.js` + `tools/profit_core.py` + test vectors + uji JS & Python
- [ ] Manifest, service worker, tombol pasang

**Sprint 2 — Komponen inti**
- [ ] Penampil langkah demi langkah (F03, F04)
- [ ] Input rupiah (F09)
- [ ] Kartu situasi (F02), kamus (F14)
- [ ] `state/progres.js` (F15)

**Sprint 3 — Wilayah 1–3**
- [ ] Pemilih pembagi (F05), umpan balik diagnostik (F10), cek kewajaran (F11)
- [ ] Konten wilayah 1–3 + validasi Python

**Sprint 4 — Wilayah 4–6**
- [ ] Keranjang modal (F06), penanda cerita (F07), papan diketahui (F08)
- [ ] Susun langkah (F12), generator soal (F17)
- [ ] Konten wilayah 4–6

**Sprint 5 — Penyelesaian**
- [ ] Peta petualangan, bintang, lencana (F01, F18), Buku Contoh (F13)
- [ ] Pengaturan, ekspor/impor progres (F19)
- [ ] Audit Lighthouse, uji perangkat, perbaikan
- [ ] Brosur + QR

## Fase 3 — Implementasi & Evaluasi
- [ ] Validasi ahli materi & media → revisi
- [ ] Uji satu-satu (3 siswa) → revisi
- [ ] Uji kelompok kecil (SUS, beban kognitif) → revisi
- [ ] Uji lapangan (pre/post-test) → analisis dengan `analisis_ujicoba.py`

## Fase 4 — Lanjutan (opsional)
- [ ] Modul pre/post-test di dalam aplikasi (F20) & kuesioner (F21)
- [ ] Narasi suara (F22)
- [ ] Materi diskon, pajak, bunga, bruto-neto-tara
- [ ] APK via TWA, dasbor guru (FastAPI)
