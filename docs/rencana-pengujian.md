# Rencana Pengujian & Evaluasi

## 1. Pengujian Teknis

| Jenis | Alat | Kriteria lulus |
|---|---|---|
| Unit rumus (JS) | `node --test tests/js` | Semua test vector lulus |
| Unit rumus (Python) | `python -m pytest tests/py` | Semua test vector lulus |
| Validasi konten | `python tools/validate_content.py` | 0 error: skema valid, kunci = hasil `profit_core` |
| PWA & performa | Lighthouse (Chrome DevTools) | Installable ✔, Performance ≥ 90, Accessibility ≥ 90, Best Practices ≥ 90 |
| Offline | DevTools → Network: Offline, juga mode pesawat di HP | Semua wilayah bisa dibuka & dikerjakan |
| Perangkat | Minimal 3 HP Android (RAM 2/3/4+ GB), 1 iPhone bila ada, 1 laptop | Tidak ada tata letak rusak di lebar 320–430 px |
| Fungsional | Daftar periksa manual per fitur F01–F16 | Semua item ✔ |

### Kasus uji fungsional penting
- Memilih harga jual sebagai pembagi → umpan balik M1 muncul.
- Menjawab tanpa ongkos di wilayah 4 → umpan balik M2 muncul.
- Mengetik `0,2` saat diminta persen → umpan balik M4 muncul.
- Menutup aplikasi di tengah wilayah lalu membuka lagi → progres tetap ada.
- Memasang aplikasi, menyalakan mode pesawat, lalu membuka dari ikon → aplikasi berjalan.
- Memperbarui versi → muncul notifikasi "versi baru".

## 2. Validasi Ahli (sebelum uji siswa)

| Validator | Aspek | Instrumen |
|---|---|---|
| Ahli materi (dosen/guru matematika) | Kebenaran konsep, kesesuaian kurikulum, kualitas soal literasi | Lembar validasi Likert 1–5 + saran |
| Ahli media | Tampilan, navigasi, keterbacaan, penerapan prinsip multimedia/CLT | Lembar validasi Likert 1–5 + saran |

Kategori kelayakan contoh: ≥ 81% sangat layak, 61–80% layak, dan seterusnya.

## 3. Uji Coba Siswa

| Tahap | Peserta | Tujuan |
|---|---|---|
| Uji satu-satu | 3 siswa (kemampuan rendah, sedang, tinggi), termasuk S01 bila memungkinkan | Menemukan kebingungan dengan metode *think-aloud* |
| Uji kelompok kecil | 6–10 siswa | Kegunaan (SUS) & beban kognitif |
| Uji lapangan | 1 kelas | Efektivitas (pre/post-test, N-gain) |

### Instrumen
- **Pre-test & post-test** (10 butir paralel): 2 identifikasi untung/rugi, 3 persentase, 2 modal dengan biaya tambahan, 2 soal cerita, dan 1 soal kebalikan.
- **Kuesioner beban kognitif** (skala 0–10, adaptasi Leppink dkk., 2013): 3 butir IL, 3 butir EL, 4 butir GL, dalam bahasa Indonesia sederhana.
- **SUS** 10 butir versi bahasa Indonesia.
- **Wawancara singkat pasca-uji** memakai kode yang sama (K/IL/EL/GL/DS) untuk membandingkan dengan wawancara awal.

### Analisis (`tools/analisis_ujicoba.py`)
- N-gain = (post − pre) / (100 − pre). Kategori: tinggi ≥ 0,7, sedang 0,3–0,7, rendah < 0,3.
- Rata-rata & simpangan baku tiap subskala beban kognitif.
- Skor SUS = ((Σ butir ganjil − 5) + (25 − Σ butir genap)) × 2,5.
