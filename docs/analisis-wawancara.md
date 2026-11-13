# Analisis Wawancara → Keputusan Desain

Sumber: *Laporan Hasil Wawancara — Persentase Untung atau Rugi*. Siswa S01, kelas 9A, 7 November 2026, durasi 14.57 menit, rekaman atas persetujuan narasumber. Artefak pemicu: Buku Matematika SMP Kelas VII (Kemendikbud) dan catatan siswa.

Keterangan kode:
- **K** = pengalaman belajar sebelumnya
- **IL** = beban intrinsik (*intrinsic load*)
- **EL** = beban ekstrinsik (*extraneous load*)
- **GL** = beban germane (*germane load*)
- **DS** = harapan desain dari siswa

## 1. Matriks Temuan → Prinsip → Fitur

| Kode | Temuan singkat | Prinsip CLT / multimedia | Keputusan desain di ProfitQuest | Fitur |
|---|---|---|---|---|
| K01 | Paham konsep dasar untung/rugi dari jual-beli | Aktivasi pengetahuan awal | Wilayah 2 dimulai dari intuisi "lebih tinggi = untung" sebelum masuk rumus | F02 |
| K02 | Belajar lewat rumus di papan, catatan, latihan, dan bertanya ke teman | Contoh terurai → latihan | Pola tetap: contoh terurai → rumpang → mandiri | F03 |
| K03 | Bisa mencari untung, tapi ragu pembagi persentase | Elemen interaktif kritis harus diisolasi | Wilayah khusus "Jembatan Persen" sebelum soal campuran | F05 |
| IL01 | Tertukar: dibagi harga beli atau harga jual? | *Isolated-interacting elements*, umpan balik elaboratif | Pemilih pembagi + umpan balik yang menjelaskan *mengapa* harga beli ("untung dibandingkan dengan uang yang kamu keluarkan") | F05, F10 |
| IL02 | Lupa memasukkan ongkos ke modal | *Pre-training*, visualisasi struktur | "Keranjang modal": biaya tambahan diseret masuk, lalu total modal terlihat | F06 |
| IL03 | Salah hitung saat banyak nol/desimal | Kurangi beban memori kerja | Pemisah ribuan otomatis. Angka soal dipilih agar persentase "ramah". Langkah pembagian disederhanakan (coret nol) secara eksplisit | F09 |
| IL04 | Soal cerita panjang membingungkan | *Segmenting* | Cerita dipecah per kalimat. Siswa menandai data dulu, baru menghitung | F07, F08 |
| IL05 | Salah ambil angka, modal dikira harga jual | *Signaling*, *pre-training* istilah | Label berwarna + ikon untuk tiap peran angka. Kamus istilah | F07, F14 |
| EL01 | Bingung istilah "modal" dan "biaya tambahan" | *Pre-training* | Wilayah 1 "Gerbang Kata Pasar" dan tombol "?" pada istilah | F14 |
| EL02 | Buku terlalu rapat. Ingin rumus dan contoh berdekatan | *Spatial contiguity*, *coherence* | Rumus menempel di atas langkah yang sedang dikerjakan. Satu ide per layar | F04 |
| EL03 | Gambar dekoratif mengganggu | *Coherence principle* | Hanya ilustrasi barang + label harga. Tanpa latar ramai atau maskot yang bergerak saat menghitung | F02 |
| EL04 | Guru menulis terlalu cepat | *Learner-paced segmenting* | Tombol "Lanjut" per langkah, tombol "Ulangi langkah", tanpa animasi otomatis | F03 |
| EL05 | Angka tersembunyi di tengah kalimat | *Signaling* | Angka dalam cerita bisa diketuk & disorot. Setelah ditandai, angka muncul di Papan Diketahui | F07, F08 |
| GL01 | Lebih paham dengan konteks sehari-hari | Konteks bermakna (literasi) | Konteks: alat tulis, jajanan, pulsa, bazar sekolah, toko kelontong, ternak | Konten |
| GL02 | Mengecek kewajaran hasil | *Self-monitoring*, *interpret* (literasi) | Langkah "Cek Kewajaran" wajib sebelum jawaban akhir | F11 |
| GL03 | Suka urutan: selisih → rumus → hitung | Skema strategi | Kerangka 4 langkah yang selalu sama (lihat §2) | F03 |
| GL04 | Menjelaskan ke teman menguatkan ingatan | *Self-explanation* | "Jelaskan ke Teman": susun ulang langkah / pilih alasan | F12 |
| GL05 | Bisa mentransfer ke barang lain | *Variability of practice* | Bank soal teracak dengan konteks berbeda, struktur sama | F17 |
| DS01 | Ingin gambar barang + harga, langkah satu-satu | *Signaling* + *segmenting* | Kartu Situasi + langkah bertahap | F02, F03 |
| DS02 | Pembagi dijelaskan pelan, latihan setelah paham | *Fading*, *expertise reversal* | Jembatan Persen memakai 3 tahap pemudaran sebelum soal mandiri | F05 |
| DS03 | Sedikit tulisan & tombol, rumus jelas, angka mudah dibaca, contoh bisa dibuka lagi | *Coherence*, akses ulang | Maks. 2 tombol aksi per layar, angka besar, dan Buku Contoh | F13 |

## 2. Kerangka Strategi Tetap "4 Langkah Juragan"

Kerangka ini menjawab GL03 dan EL04. Urutannya selalu sama di setiap soal:

1. **Kenali** — Tandai harga beli/modal dan harga jual. Hitung modal jika ada biaya tambahan.
2. **Bandingkan** — Harga jual > modal → untung. Harga jual < modal → rugi.
3. **Hitung selisih** — Untung = HJ − Modal, atau Rugi = Modal − HJ.
4. **Persenkan & Cek** — Persentase = selisih ÷ **modal** × 100%. Lalu cek kewajarannya.

## 3. Miskonsepsi Target & Umpan Balik Diagnostik

| Kode salah | Pola jawaban siswa | Contoh deteksi | Umpan balik |
|---|---|---|---|
| M1 | Dibagi harga jual | Jawaban = selisih/HJ × 100 | "Hampir! Persentase untung dibandingkan dengan **uang yang kamu keluarkan** (modal), bukan uang yang kamu terima. Coba bagi dengan modal." |
| M2 | Lupa biaya tambahan | Jawaban memakai HB tanpa ongkos | "Ada biaya lain yang ikut kamu bayar. Masukkan dulu ke keranjang modal." |
| M3 | Tertukar HB–HJ | Selisih bernilai negatif atau jenis untung/rugi terbalik | "Cek lagi: mana uang yang kamu **bayar** saat membeli, mana yang kamu **terima** saat menjual?" |
| M4 | Lupa × 100% | Jawaban = 0,2 (bukan 20%) | "Hasil bagimu benar! Kalikan 100 agar menjadi persen." |
| M5 | Salah nol/ribuan | Jawaban meleset ×10 atau ×1000 | "Coba hitung jumlah nolnya lagi. Pakai cara coret nol yang sama di atas dan bawah." |
| M6 | Jenis salah (untung disebut rugi) | Pilih "rugi" padahal HJ > modal | "Harga jual lebih besar dari modal. Apakah pedagang mendapat lebih banyak atau lebih sedikit uang?" |

## 4. Keterbatasan Data

- Hanya satu responden. Hasilnya dipakai sebagai **analisis kebutuhan awal**, bukan generalisasi.
- Rekomendasi: wawancara tambahan dengan 2–4 siswa berkemampuan berbeda + 1 guru, atau analisis lembar jawaban satu kelas untuk mengonfirmasi frekuensi miskonsepsi M1–M6.
