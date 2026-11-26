# PRD — ProfitQuest: Petualangan Menghitung Untung dan Rugi

| Item | Isi |
|---|---|
| Versi dokumen | 1.0 (draf perencanaan) |
| Tanggal | 11 November 2026 |
| Pemilik produk | Mahasiswa S1 Pendidikan Matematika (pengembang & peneliti) |
| Status | Perencanaan — belum ada kode |
| Dokumen terkait | [analisis-wawancara.md](analisis-wawancara.md), [desain-pembelajaran.md](desain-pembelajaran.md), [arsitektur.md](arsitektur.md), [ui-ux.md](ui-ux.md), [konten-materi.md](konten-materi.md), [rencana-pengujian.md](rencana-pengujian.md), [deployment.md](deployment.md), [roadmap.md](roadmap.md) |

---

## 1. Ringkasan

ProfitQuest adalah aplikasi web progresif (*Progressive Web App*/PWA) untuk siswa SMP yang mempelajari Aritmetika Sosial, khususnya **Persentase Untung dan Rugi**. Siswa "berpetualang" melewati beberapa wilayah pasar. Di tiap wilayah mereka mempelajari satu konsep kecil dengan langkah bertahap, contoh dari kehidupan sehari-hari, dan latihan yang makin mandiri.

Rancangan aplikasi bertumpu pada **teori beban kognitif** (*Cognitive Load Theory*): mengelola beban intrinsik (IL), mengurangi beban ekstrinsik (EL), dan mendorong beban germane (GL). Dasarnya adalah hasil wawancara dengan siswa S01 (kelas 9A, 7 November 2026). Aplikasi juga melatih **literasi matematika**: merumuskan masalah dari situasi nyata, menerapkan prosedur, lalu menafsirkan dan memeriksa kewajaran hasil.

Aplikasi bisa dibuka lewat tautan web atau QR code pada brosur, lalu **dipasang langsung ke layar utama Android tanpa Play Store** (instalasi PWA). Setelah terpasang, aplikasi tetap bisa dipakai tanpa internet.

## 2. Latar Belakang & Masalah

Temuan utama wawancara (rinciannya ada di [analisis-wawancara.md](analisis-wawancara.md)):

1. **Siswa sudah paham konsep dasar** untung/rugi = selisih harga jual dan harga beli (K01, K03).
2. **Kesulitan inti: memilih pembagi persentase.** Siswa ragu apakah persentase dibagi harga beli atau harga jual (K03, IL01).
3. **Biaya tambahan sering terlewat** saat menghitung modal (IL02, EL01).
4. **Soal cerita panjang membebani.** Siswa sulit memilah harga beli dan harga jual, dan sering salah mengambil angka (IL04, IL05, EL05).
5. **Hitungan dengan banyak nol atau desimal rawan salah** (IL03).
6. **Tampilan padat, gambar dekoratif, dan penjelasan yang terlalu cepat mengganggu** (EL02, EL03, EL04).
7. **Yang membantu siswa:** konteks dekat kehidupan sehari-hari, langkah berurutan, cek kewajaran, menjelaskan ulang ke teman, dan variasi soal (GL01–GL05).
8. **Permintaan langsung siswa untuk aplikasi:** gambar barang beserta harganya, langkah ditampilkan satu per satu, penjelasan pembagi dibuat pelan, sedikit tulisan dan tombol, angka mudah dibaca, dan contoh bisa dibuka lagi (DS01–DS03).

**Pernyataan masalah:** siswa SMP bisa menghitung besar untung atau rugi, tetapi sering keliru saat menentukan **dasar persentase (harga beli/modal)** dan saat **mengambil informasi dari soal cerita**. Penyebabnya adalah beban kognitif yang tinggi dari materi itu sendiri dan dari cara materi disajikan.

## 3. Tujuan Produk

| ID | Tujuan | Indikator keberhasilan |
|---|---|---|
| T1 | Siswa konsisten memakai **harga beli/modal** sebagai pembagi persentase | ≥ 80% jawaban benar pada butir "pilih pembagi" di post-test |
| T2 | Siswa memasukkan biaya tambahan ke modal | ≥ 75% benar pada soal yang memuat ongkos |
| T3 | Siswa dapat mengekstrak data dari soal cerita | ≥ 75% benar pada butir "tandai informasi" |
| T4 | Beban kognitif ekstrinsik rendah | Skor rata-rata kuesioner beban kognitif (skala 1–9) bagian EL ≤ 4 |
| T5 | Aplikasi mudah dipakai di HP | Skor SUS ≥ 70 |
| T6 | Bisa dipasang tanpa Play Store dan berjalan offline | 100% perangkat uji Android (Chrome) berhasil install & membuka offline |

## 4. Pengguna Sasaran

**Persona utama — "Raka", siswa kelas VII–IX SMP**
- Memakai HP Android kelas menengah ke bawah (layar 5,5–6,5", RAM 2–4 GB), sering dengan kuota terbatas.
- Sudah bisa menghitung selisih, tetapi ragu dengan persen.
- Cepat bosan dengan teks panjang, lebih suka contoh nyata seperti jual-beli alat tulis atau jajanan.

**Pengguna sekunder — Guru matematika**
- Ingin memakai aplikasi sebagai media di kelas atau tugas rumah.
- Ingin melihat ringkasan kemajuan siswa (fitur fase 2: ekspor kemajuan).

**Pengguna sekunder — Peneliti (pemilik produk)**
- Butuh data uji coba: skor pre/post-test, kuesioner beban kognitif, dan SUS.

## 5. Ruang Lingkup

### 5.1 Termasuk (MVP)
- Materi: harga beli, harga jual, modal (harga beli + biaya tambahan), untung, rugi, persentase untung, persentase rugi.
- Soal lanjutan: mencari harga jual dari persentase, dan mencari harga beli dari harga jual dan persentase.
- Peta petualangan dengan 6 wilayah (lihat §6).
- Contoh terurai (*worked example*), contoh dengan bagian kosong (*faded example*), dan latihan mandiri.
- Cek kewajaran jawaban.
- Kamus istilah yang bisa dibuka kapan saja.
- "Buku Contoh" untuk membuka ulang contoh yang sudah dipelajari.
- Penyimpanan kemajuan di perangkat (tanpa login).
- PWA: bisa dipasang, berjalan offline, dan responsif untuk HP.
- Brosur dengan QR code.

### 5.2 Tidak termasuk (MVP)
- Akun/login dan server basis data.
- Diskon, pajak, bruto-neto-tara, dan bunga (materi Aritmetika Sosial lain). Disiapkan sebagai ekspansi.
- Multipemain atau papan peringkat daring.
- Rilis di Play Store (opsional di fase lanjut melalui TWA, lihat [deployment.md](deployment.md)).

## 6. Fitur & Alur Utama

### 6.1 Peta Petualangan (6 wilayah)

| # | Wilayah | Tujuan belajar | Kode wawancara yang dijawab |
|---|---|---|---|
| 1 | **Gerbang Kata Pasar** | Mengenal istilah harga beli, harga jual, modal, biaya tambahan, untung, rugi (*pre-training*) | EL01, IL05 |
| 2 | **Toko Untung-Rugi** | Menentukan untung atau rugi, lalu menghitung besarnya | K01, K03, GL02 |
| 3 | **Jembatan Persen** | Memahami bahwa persentase **selalu dibandingkan dengan harga beli/modal**. Disajikan pelan dan bertahap | K03, IL01, DS02 |
| 4 | **Gudang Modal** | Menghitung modal = harga beli + biaya tambahan, lalu persentasenya | IL02, EL01 |
| 5 | **Pasar Cerita** | Menandai informasi penting dalam soal cerita, lalu menyelesaikannya | IL04, IL05, EL05 |
| 6 | **Arena Juragan** | Latihan mandiri bervariasi, termasuk soal kebalikan (mencari harga jual atau harga beli) | GL05, DS02 |

Setiap wilayah dibuka berurutan. Wilayah berikutnya terbuka setelah siswa menyelesaikan *checkpoint* dengan benar minimal 3 dari 4 soal.

### 6.2 Alur dalam satu wilayah

```
Kartu Situasi → Contoh Terurai (langkah satu per satu) → Contoh Rumpang → Latihan Mandiri → Cek Kewajaran → Jelaskan Ulang → Checkpoint
```

### 6.3 Daftar Fitur (dengan prioritas)

| ID | Fitur | Deskripsi | Prioritas |
|---|---|---|---|
| F01 | Peta petualangan | Peta sederhana 6 wilayah, status terkunci/terbuka/selesai, dan bintang | Wajib |
| F02 | Kartu Situasi | Gambar barang + label harga beli & harga jual (ikon sederhana, bukan dekorasi) | Wajib |
| F03 | Langkah demi langkah | Penyelesaian tampil satu langkah per ketukan "Lanjut". Siswa yang mengatur kecepatan | Wajib |
| F04 | Rumus menempel | Rumus yang relevan selalu tampil di dekat langkah yang sedang dikerjakan (bukan di halaman lain) | Wajib |
| F05 | Pemilih pembagi | Interaksi khusus: siswa memilih "dibagi harga beli/modal atau harga jual?" dan mendapat umpan balik penjelasan | Wajib |
| F06 | Pembangun modal | Siswa menyeret/mengetuk biaya tambahan ke "keranjang modal" | Wajib |
| F07 | Penanda soal cerita | Siswa mengetuk angka dalam cerita lalu memberinya label (Harga Beli / Harga Jual / Biaya Tambahan / Tidak dipakai) | Wajib |
| F08 | Papan Diketahui–Ditanya | Data yang sudah ditandai otomatis tersusun rapi sebagai "Diketahui" | Wajib |
| F09 | Jawab dengan klik | Bawaan: jawaban angka berupa pilihan yang tinggal diklik; pilihan salah berasal dari miskonsepsi umum agar umpan balik tetap diagnostik. Mode "ketik angka" (keyboard numerik, titik ribuan otomatis) bisa dinyalakan guru di Pengaturan | Wajib |
| F10 | Umpan balik spesifik | Umpan balik mendiagnosis kesalahan umum (dibagi harga jual, lupa ongkos, tertukar beli/jual) | Wajib |
| F11 | Cek Kewajaran | Pertanyaan refleksi: "Untung → apakah harga jual > modal?" sebelum jawaban dikunci | Wajib |
| F12 | Jelaskan ke Teman | Siswa menyusun ulang urutan langkah (kartu acak) atau memilih penjelasan yang benar | Wajib |
| F13 | Buku Contoh | Semua contoh yang sudah dibuka tersimpan dan bisa dibuka lagi kapan saja | Wajib |
| F14 | Kamus Istilah | Tombol "?" di setiap istilah menampilkan definisi singkat + contoh | Wajib |
| F15 | Kemajuan lokal | Progres, bintang, dan riwayat disimpan di perangkat (localStorage/IndexedDB) | Wajib |
| F16 | Mode offline & install | Service worker + manifest dan tombol "Pasang Aplikasi" | Wajib |
| F17 | Bank soal teracak | Angka soal dibangkitkan dari templat agar soal bervariasi (GL05) | Sebaiknya |
| F18 | Lencana petualang | Lencana sederhana per wilayah (motivasi tanpa mengganggu) | Sebaiknya |
| F19 | Ekspor kemajuan | Siswa dapat mengekspor ringkasan (kode/QR/berkas) untuk guru atau peneliti | Sebaiknya |
| F20 | Pre-test & post-test | Modul tes terpisah untuk keperluan penelitian | Sebaiknya |
| F21 | Kuesioner beban kognitif & SUS | Formulir singkat di akhir uji coba | Opsional |
| F22 | Suara narasi | Narasi audio langkah (modalitas ganda) | Opsional |
| F23 | AI Tutor "Tanya Kak Profit" | Tanya jawab dengan Gemini: penjelasan konsep, rumus, langkah bertahap, petunjuk, contoh soal. Butuh internet; fitur lain tetap offline. Detail: [ai-tutor.md](ai-tutor.md) | Sebaiknya |

## 7. Kebutuhan Non-Fungsional

| Kategori | Kebutuhan |
|---|---|
| Kinerja | Muat awal ≤ 3 detik di jaringan 3G. Total aset ≤ 1,5 MB. Interaksi ≤ 100 ms |
| Kompatibilitas | Android 8+ (Chrome/Edge/Samsung Internet), iOS Safari 16+ (install lewat "Add to Home Screen"), dan browser desktop modern |
| Offline | Seluruh materi & latihan berjalan tanpa internet setelah kunjungan pertama |
| Responsif | *Mobile-first*. Lebar minimum 320 px. Target sentuh ≥ 48×48 px |
| Aksesibilitas | Kontras teks ≥ 4.5:1, ukuran teks dasar ≥ 16 px, tidak bergantung pada warna saja (ikon + teks), dan mendukung pembaca layar dasar |
| Privasi | Tanpa login. Tanpa data pribadi. Data tersimpan hanya di perangkat siswa. Ekspor hanya atas tindakan siswa |
| Bahasa | Bahasa Indonesia baku yang ramah siswa SMP, dengan kalimat pendek |
| Ketepatan matematika | Semua hitungan memakai bilangan bulat rupiah. Persentase dibulatkan maksimal 2 desimal. Logika hitung diuji otomatis di JS dan Python |
| Pemeliharaan | Konten (soal, contoh, istilah) terpisah dari kode dalam berkas JSON |

## 8. Teknologi (ringkas)

- **Front-end (JavaScript):** HTML5, CSS3, JavaScript ES Modules *vanilla* (tanpa framework berat), Service Worker, dan Web App Manifest.
- **Python:** perkakas pengembangan, yaitu generator & validator bank soal, implementasi rujukan rumus untuk uji silang, server pengembangan lokal, generator QR code brosur, dan pengolah data uji coba (opsional, fase 2).
- **Hosting:** statis HTTPS (GitHub Pages / Netlify / Vercel), gratis.
- **Backend AI Tutor:** Vercel Functions (Node.js 22) + Google Gemini API Free Tier melalui SDK `@google/genai`. Kunci API hanya di server.

Detail ada di [arsitektur.md](arsitektur.md).

## 9. Metrik & Evaluasi

- **Efektivitas:** N-gain pre-test ke post-test (kategori sedang ≥ 0,3).
- **Beban kognitif:** kuesioner skala 1–9 (adaptasi Leppink dkk., 2013) dengan subskala IL, EL, dan GL.
- **Kegunaan:** System Usability Scale (SUS).
- **Validitas produk:** validasi ahli materi dan ahli media (lembar validasi skala Likert).
- **Log penggunaan lokal (opsional):** jumlah percobaan per soal, jenis kesalahan terbanyak, dan frekuensi membuka Buku Contoh.

## 10. Asumsi, Risiko, dan Mitigasi

| Risiko | Dampak | Mitigasi |
|---|---|---|
| Data wawancara hanya dari 1 siswa (S01) | Kebutuhan kurang representatif | Tambah 2–4 wawancara/observasi, atau uji coba terbatas sebelum uji lapangan |
| HP siswa lama atau memori penuh | Aplikasi lambat / gagal install | Aset ringan, tanpa framework, dan bisa dipakai langsung dari browser tanpa install |
| Siswa memakai iPhone | Tidak ada prompt install otomatis | Panduan "Add to Home Screen" bergambar di brosur |
| Gamifikasi mengalihkan fokus | Beban ekstrinsik naik | Gamifikasi minimal: peta, bintang, lencana. Tanpa animasi berlebih |
| Kesalahan rumus/pembulatan | Miskonsepsi | Uji otomatis lintas bahasa (JS ↔ Python) dengan *test vector* bersama + validasi ahli materi |
| Data kemajuan hilang saat cache dihapus | Siswa mengulang | Fitur ekspor/impor kode kemajuan (F19) |

## 11. Kriteria Rilis MVP

- [ ] 6 wilayah lengkap dengan minimal 2 contoh terurai, 2 contoh rumpang, dan 6 latihan per wilayah.
- [ ] Semua *test vector* lulus di JS dan Python.
- [ ] Lighthouse: PWA *installable*, Performance ≥ 90, Accessibility ≥ 90.
- [ ] Teruji pada minimal 3 HP Android berbeda, termasuk mode offline.
- [ ] Brosur berisi QR code dan panduan instalasi.
- [ ] Lolos validasi ahli materi & media (kategori minimal "layak").
