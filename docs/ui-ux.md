# Pedoman UI/UX ProfitQuest

Prinsip utama: **satu layar, satu ide**. Angka besar, sedikit tulisan, dan maksimal dua tombol aksi per layar. Semua ini mengikuti permintaan siswa di DS03 dan EL02.

## 1. Token Desain

### Warna peran angka (konsisten di seluruh aplikasi)
| Peran | Warna | Ikon | Kontras teks putih |
|---|---|---|---|
| Harga Beli / Modal | Biru `#1E5FBF` | 🛒 | ✔ |
| Harga Jual | Hijau `#1B7F3B` | 💰 | ✔ |
| Biaya Tambahan | Oranye tua `#B45309` | 📦 | ✔ |
| Ditanya | Ungu `#6D28D9` | ❓ | ✔ |
| Untung | Hijau `#1B7F3B` + panah ↑ | | |
| Rugi | Merah `#B91C1C` + panah ↓ | | |

Warna tidak pernah menjadi satu-satunya penanda. Selalu ada ikon dan label teks.

### Tipografi
- Font: sistem (`system-ui`), tanpa unduhan font agar ringan & offline.
- Teks dasar 18 px. Angka di langkah hitungan 24–32 px, tebal, dengan *tabular numbers*.
- Format rupiah: `Rp12.500` (titik ribuan, tanpa spasi, sesuai PUEBI/KBBI). Persen: `20%`, desimal memakai koma (`12,5%`).

### Tata letak
- *Mobile-first*, kolom tunggal, lebar konten maks. 480 px di desktop (tengah).
- Spasi longgar (kelipatan 8 px). Target sentuh ≥ 48 px.
- Tombol utama berada di bawah layar dan terjangkau ibu jari.
- Mendukung mode gelap mengikuti setelan sistem.

## 2. Peta Layar

```
Beranda ──▶ Peta Petualangan ──▶ Wilayah n ──▶ (tahap 1..7) ──▶ Hasil Wilayah
   │              │
   │              ├──▶ Buku Contoh
   │              └──▶ Kamus Istilah
   └──▶ Pengaturan (ukuran teks, suara, ekspor/impor progres, pasang aplikasi)
```

## 3. Wireframe Kunci (teks)

### 3.1 Layar Langkah (contoh terurai)
```
┌──────────────────────────────┐
│ ← Jembatan Persen   2/4  [?] │  ← progres langkah, kamus
├──────────────────────────────┤
│  Rumus:                      │
│  % Untung = Untung ÷ 🛒Modal │  ← rumus menempel (EL02)
│             × 100%           │
├──────────────────────────────┤
│  Langkah 2: Hitung selisih   │
│                              │
│   💰 Rp60.000                │
│ − 🛒 Rp50.000                │
│ ───────────                  │
│   Rp10.000  ↑ untung         │
│                              │
├──────────────────────────────┤
│ [ Ulangi ]      [ Lanjut ▶ ] │  ← maks. 2 tombol (DS03)
└──────────────────────────────┘
```

### 3.2 Pemilih Pembagi
```
  Untung Rp10.000 dibagi dengan…
  ┌───────────────┐ ┌───────────────┐
  │ 🛒 Modal      │ │ 💰 Harga Jual │
  │   Rp50.000    │ │   Rp60.000    │
  └───────────────┘ └───────────────┘
  Petunjuk: untung dibandingkan dengan uang yang kamu KELUARKAN.
```

### 3.3 Penanda Soal Cerita
```
  Bu Sari membeli 2 lusin pensil seharga [Rp36.000].
  Ia membayar ongkos kirim [Rp4.000]. Semua pensil
  terjual [Rp50.000].

  Ketuk angka → pilih: 🛒 Harga Beli | 📦 Biaya | 💰 Harga Jual | ✖ Tidak dipakai

  ┌ Diketahui ─────────────────┐
  │ 🛒 Rp36.000  📦 Rp4.000     │
  │ 💰 Rp50.000                 │
  │ ❓ Persentase untung        │
  └────────────────────────────┘
```

## 4. Aturan Interaksi

1. Tidak ada animasi otomatis yang berjalan sendiri. Semua perpindahan langkah dipicu siswa (EL04).
2. Animasi bermakna (≤ 0,9 dtk): langkah baru masuk, angka penting di cerita menyala bergantian, garis pengurangan tumbuh lalu hasil muncul, jawaban salah bergoyang pelan, bintang & konfeti hanya di layar hasil. Bisa dimatikan di Pengaturan → Animasi: Hemat, dan otomatis mati bila `prefers-reduced-motion`.
3. Umpan balik muncul **di dekat** input yang dijawab, bukan di pop-up terpisah.
4. Salah menjawab tidak dihukum dengan suara keras atau warna merah penuh. Gunakan nada mendorong: "Hampir! …".
5. Input angka: `inputmode="numeric"`, titik ribuan otomatis, dan tombol hapus besar.
6. Tombol "Lihat Contoh" di setiap latihan membuka contoh terkait di lembar bawah (*bottom sheet*), tanpa meninggalkan soal (DS03).
7. Ilustrasi berupa SVG datar sederhana: satu barang + label harga. Tanpa latar ramai (EL03).
8. Ilustrasi bergerak (adegan per wilayah, maskot Koko si Koin) dan gamifikasi hanya di Beranda, Peta, kartu situasi, dan layar hasil. Di Peta hanya wilayah yang sedang dikerjakan yang bergerak. Selama menghitung, layar bebas dari elemen permainan.

## 5. Gaya Bahasa

- Sapa siswa dengan "kamu", kalimat ≤ 15 kata, dan satu instruksi per kalimat.
- Istilah baku selalu sama: **harga beli, harga jual, modal, biaya tambahan, untung, rugi**. Jangan berganti-ganti dengan "harga pokok", "laba", dan semacamnya tanpa penjelasan di kamus.
- Tokoh cerita memakai nama Indonesia yang beragam dan konteks lokal (warung, pasar, koperasi sekolah).
