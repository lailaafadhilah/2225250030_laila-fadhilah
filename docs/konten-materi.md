# Spesifikasi Konten & Contoh Soal

Semua kunci jawaban **wajib** lolos `python tools/validate_content.py` sebelum dirilis.

## 1. Kamus Istilah (`content/istilah.json`)

| Istilah | Definisi ramah siswa | Contoh |
|---|---|---|
| Harga beli | Uang yang dibayar pedagang untuk mendapatkan barang | Beli 1 pak buku Rp40.000 |
| Biaya tambahan | Uang lain yang ikut dikeluarkan agar barang bisa dijual (ongkos kirim, plastik, transport) | Ongkos ojek Rp5.000 |
| Modal | Seluruh uang yang dikeluarkan = harga beli + biaya tambahan | Rp40.000 + Rp5.000 = Rp45.000 |
| Harga jual | Uang yang diterima pedagang saat barang terjual | Buku laku Rp54.000 |
| Untung | Harga jual lebih besar dari modal. Besarnya = harga jual − modal | Rp54.000 − Rp45.000 = Rp9.000 |
| Rugi | Harga jual lebih kecil dari modal. Besarnya = modal − harga jual | |
| Impas | Harga jual sama dengan modal (tidak untung, tidak rugi) | |
| Persentase untung/rugi | Besar untung/rugi dibandingkan dengan **modal**, dinyatakan dalam persen | Rp9.000 ÷ Rp45.000 × 100% = 20% |

## 2. Contoh per Wilayah

### Wilayah 1 — Gerbang Kata Pasar
- Mencocokkan: kartu kalimat ↔ istilah ("Uang yang Rina terima saat menjual gelang" → harga jual).
- Klasifikasi angka dalam kalimat pendek.

### Wilayah 2 — Toko Untung-Rugi
**Contoh terurai:** Dimas membeli sebuah tas bekas Rp80.000 lalu menjualnya Rp95.000.
1. Kenali: 🛒 Rp80.000, 💰 Rp95.000
2. Bandingkan: Rp95.000 > Rp80.000 → untung
3. Selisih: Rp95.000 − Rp80.000 = **Rp15.000**
4. Cek: untung, dan harga jual memang lebih besar ✔

### Wilayah 3 — Jembatan Persen
**Contoh terurai:** Kak Nisa membeli kerudung Rp50.000 dan menjualnya Rp60.000.
- Untung = Rp10.000
- % untung = 10.000/50.000 × 100% = 1/5 × 100% = **20%**
- Pemilih pembagi: jika siswa memilih Rp60.000 → hasilnya 16,67%. Muncul umpan balik M1.

**Contoh rugi:** Pak Rudi membeli sepeda bekas Rp400.000 dan terpaksa menjualnya Rp340.000.
- Rugi = Rp60.000. % rugi = 60.000/400.000 × 100% = **15%**

### Wilayah 4 — Gudang Modal
**Contoh terurai:** Bu Sari membeli 2 lusin pensil Rp36.000, ongkos kirim Rp4.000, dan semua terjual Rp50.000.
- Modal = 36.000 + 4.000 = Rp40.000
- Untung = 50.000 − 40.000 = Rp10.000
- % untung = 10.000/40.000 × 100% = **25%**
- Jika ongkos dilupakan → 14.000/36.000 = 38,89%. Muncul umpan balik M2.

### Wilayah 5 — Pasar Cerita
**Soal:** Menjelang bazar sekolah, OSIS membeli 50 botol minuman seharga Rp150.000. Mereka juga membayar Rp10.000 untuk es batu dan Rp20.000 untuk sewa meja. Di akhir bazar seluruh minuman terjual dengan harga Rp4.000 per botol. Sebanyak 120 pengunjung datang ke bazar itu.
- Tandai: 🛒 150.000. 📦 10.000 dan 20.000. 💰 50 × 4.000 = 200.000. ✖ 120 pengunjung (pengecoh).
- Modal = Rp180.000. Untung = Rp20.000. % untung = 20.000/180.000 × 100% ≈ **11,11%**

### Wilayah 6 — Arena Juragan (soal kebalikan & keputusan)
- **Cari harga jual:** Modal Rp120.000, ingin untung 25% → HJ = 120.000 × 125% = **Rp150.000**
- **Cari modal:** HJ Rp115.000 dengan untung 15% → Modal = 115.000 × 100/115 = **Rp100.000**
- **Keputusan:** Toko A untung Rp30.000 dari modal Rp200.000 (15%). Toko B untung Rp20.000 dari modal Rp80.000 (25%). Persentase siapa lebih besar? → Toko B.

## 3. Aturan Pembuatan Angka Soal

1. Semua nominal adalah bilangan bulat rupiah, kelipatan Rp500 (wilayah 1–3) atau Rp1.000.
2. Wilayah 2–4: persentase hasil berupa bilangan bulat dari {5, 10, 12,5, 15, 20, 25, 30, 40, 50}.
3. Wilayah 5–6: boleh menghasilkan desimal, dibulatkan 2 angka di belakang koma, dan siswa diberi tahu aturan pembulatan.
4. Tidak ada soal dengan harga jual negatif atau persentase rugi > 100%.
5. Setiap soal cerita memuat ≤ 1 angka pengecoh (wilayah 5–6 saja).

## 4. Jumlah Konten MVP

| Wilayah | Contoh terurai | Contoh rumpang | Templat latihan | Soal checkpoint |
|---|---|---|---|---|
| 1 | 2 | 2 | 3 | 4 |
| 2 | 2 | 2 | 4 | 4 |
| 3 | 3 | 3 | 5 | 4 |
| 4 | 2 | 2 | 4 | 4 |
| 5 | 2 | 2 | 5 | 4 |
| 6 | 3 | 2 | 6 | 4 |
