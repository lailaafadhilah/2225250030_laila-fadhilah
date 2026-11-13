# Arsitektur Teknis ProfitQuest

## 1. Keputusan Utama

| Keputusan | Pilihan | Alasan |
|---|---|---|
| Jenis aplikasi | **PWA** (Progressive Web App) | Satu basis kode untuk web dan Android. Bisa dipasang dari browser tanpa Play Store. Berjalan offline |
| Front-end | HTML + CSS + **JavaScript ES Modules vanilla** | Ringan untuk HP murah, tanpa *build step*, mudah dipahami mahasiswa |
| Back-end | **Tidak ada** di MVP (situs statis) | Gratis di-hosting, privasi terjaga, tidak butuh server |
| Peran **Python** | Perkakas pengembangan & data | Generator/validator bank soal, rujukan rumus untuk uji silang, server lokal, QR brosur, analisis data uji coba |
| Penyimpanan | `localStorage` (progres kecil) + IndexedDB (riwayat, opsional) | Bekerja offline, tanpa akun |
| Uji otomatis | `node --test` (JS) + `pytest` (Python) dengan *test vector* bersama | Memastikan rumus identik di kedua bahasa |

## 2. Struktur Folder (rencana)

```
profitquest/
├── CLAUDE.md
├── README.md
├── docs/                       # dokumen perencanaan (berkas ini)
├── app/                        # ROOT situs yang di-deploy
│   ├── index.html
│   ├── manifest.webmanifest
│   ├── sw.js                   # service worker (cache offline)
│   ├── css/
│   │   ├── tokens.css          # warna, ukuran, spasi
│   │   └── main.css
│   ├── js/
│   │   ├── main.js             # bootstrap, router
│   │   ├── router.js           # hash router (#/peta, #/wilayah/3 ...)
│   │   ├── core/
│   │   │   ├── hitung.js       # FUNGSI MURNI rumus untung/rugi (tanpa DOM)
│   │   │   ├── format.js       # format rupiah & persen (id-ID)
│   │   │   ├── diagnosa.js     # deteksi miskonsepsi M1–M6 (mengembalikan kode)
│   │   │   └── cerita.js       # pengurai token cerita [[hb:Rp5.000]]
│   │   ├── state/
│   │   │   └── progres.js      # simpan/muat progres (localStorage)
│   │   ├── ui/                 # dom.js, visual.js (cerita berwarna, papan, pecahan), input-angka.js, lembar.js, toast.js
│   │   ├── soal/               # langkah.js (4 Langkah Juragan dari data soal), runner.js (penampil langkah demi langkah)
│   │   ├── aktivitas/          # situasi.js, pilihan.js, susun.js (Jelaskan ke Teman)
│   │   ├── screens/            # wilayah.js, lainnya.js (beranda, peta, buku contoh, kamus, pengaturan)
│   │   ├── konten.js           # pemuat JSON
│   │   └── pasang.js           # tombol Pasang Aplikasi
│   ├── content/                # KONTEN, dipisah dari kode
│   │   ├── wilayah.json
│   │   ├── istilah.json
│   │   ├── wilayah-1..6.json   # aktivitas tiap wilayah (contoh, latihan, checkpoint)
│   │   ├── umpan-balik.json    # pesan per kode miskonsepsi
│   │   └── bank-soal.json      # DIBUAT oleh tools/generate_soal.py
│   └── assets/icons/           # ikon PWA (dibuat tools/make_icons.py)
│                               # ilustrasi barang memakai emoji: 0 KB, tajam di semua layar
├── tools/                      # PYTHON
│   ├── profit_core.py          # implementasi rujukan rumus (paralel dengan hitung.js)
│   ├── templat-soal.json       # templat bank soal (tidak ikut di-deploy)
│   ├── generate_soal.py        # bangkitkan bank soal dari templat → JSON
│   ├── make_icons.py           # ikon PWA tanpa pustaka tambahan
│   ├── validate_content.py     # validasi skema & kebenaran jawaban semua konten
│   ├── make_qr.py              # QR code untuk brosur
│   ├── serve.py                # server lokal (HTTP, opsional HTTPS) untuk uji di HP
│   └── analisis_ujicoba.py     # (fase 2) olah pre/post-test, N-gain, SUS
├── tests/
│   ├── test-vectors.json       # kasus uji bersama JS & Python
│   ├── js/hitung.test.js       # node --test tests/js
│   ├── js/uji-browser.html     # uji JS di browser bila Node.js tidak ada
│   └── py/test_profit_core.py
├── brosur/
│   └── brosur.html             # brosur siap cetak (A5) + QR
└── requirements.txt            # qrcode[pil], pytest, jsonschema
```

## 3. Arsitektur Aplikasi

```
 ┌───────────── Layar (screens) ─────────────┐
 │ beranda · peta · wilayah · buku-contoh    │
 └──────────────┬────────────────────────────┘
                │ memakai
 ┌──────────────▼──────────┐    ┌──────────────────┐
 │ Komponen UI (ui/)       │───▶│ content/*.json   │
 └──────────────┬──────────┘    └──────────────────┘
                │ memanggil
 ┌──────────────▼──────────┐    ┌──────────────────┐
 │ core/ (fungsi murni)    │    │ state/progres.js │──▶ localStorage
 │ hitung·format·diagnosa  │    └──────────────────┘
 └─────────────────────────┘
          ▲ diuji oleh test-vectors.json ◀── juga diuji di tools/profit_core.py
```

Aturan lapisan:
- `core/` **tidak boleh** menyentuh DOM atau storage. Isinya fungsi murni yang mudah diuji.
- `ui/` menerima data dan *callback*, lalu merender ke elemen yang diberikan.
- `screens/` merangkai komponen dan membaca/menulis progres.

## 4. Model Data

### 4.1 Templat soal (`templat-soal.json`)
```json
{
  "id": "w4-ongkos-01",
  "wilayah": 4,
  "jenis": "persen_untung",
  "konteks": "pekerjaan",
  "barang": "jeruk",
  "cerita": "Pak Dodi membeli {jumlah} kg jeruk seharga {hb}. Ongkos angkut {ongkos}. Semua jeruk laku {hj}.",
  "parameter": {
    "hb": { "min": 100000, "max": 300000, "kelipatan": 10000 },
    "ongkos": { "min": 5000, "max": 20000, "kelipatan": 5000 },
    "persen_target": [10, 15, 20, 25]
  },
  "ditanya": "persentase_untung",
  "miskonsepsi_dipantau": ["M1", "M2"]
}
```
Templat ada di `tools/templat-soal.json`. Generator Python menentukan `hj` dari daftar `persen` agar hasil persentase selalu "ramah" (IL03).

### 4.2 Progres (`localStorage["pq.progres.v1"]`)
```json
{
  "versi": 1,
  "nama_panggilan": "Raka",
  "wilayah": { "1": { "status": "selesai", "bintang": 11 }, "2": { "status": "terbuka", "bintang": 4 } },
  "contoh_dibuka": ["w1-c1", "w2-c1"],
  "statistik_salah": { "M1": 3, "M2": 1 },
  "pengaturan": { "ukuran_teks": "normal", "suara": true, "musik": true, "versi_suara": 2 }
}
```

### 4.3 Test vector (`tests/test-vectors.json`)
```json
[
  { "hb": 50000, "ongkos": 0, "hj": 60000, "jenis": "untung", "selisih": 10000, "persen": 20 },
  { "hb": 100000, "ongkos": 0, "hj": 80000, "jenis": "rugi", "selisih": 20000, "persen": 20 },
  { "hb": 190000, "ongkos": 10000, "hj": 230000, "jenis": "untung", "selisih": 30000, "persen": 15 },
  { "hb": 75000, "ongkos": 0, "hj": 75000, "jenis": "impas", "selisih": 0, "persen": 0 }
]
```

## 5. API Modul Inti (`core/hitung.js`)

```js
hitungModal(hargaBeli, biayaTambahan = 0)        // → number
tentukanJenis(modal, hargaJual)                  // → "untung" | "rugi" | "impas"
hitungSelisih(modal, hargaJual)                  // → number (≥ 0)
hitungPersen(selisih, modal)                     // → number, dibulatkan 2 desimal
hargaJualDariPersen(modal, persen, jenis)        // → number
modalDariHargaJual(hargaJual, persen, jenis)     // → number
```
`tools/profit_core.py` memiliki fungsi setara: `hitung_modal`, `tentukan_jenis`, dan seterusnya.

## 6. PWA

- **Manifest:** `name: "ProfitQuest"`, `short_name: "ProfitQuest"`, `display: "standalone"`, `orientation: "portrait"`, `lang: "id"`, `start_url: "./"`, `scope: "./"`, ikon 192/512 + maskable, `theme_color`, `background_color`.
- **Service worker:** strategi *cache-first* untuk aset & konten (precache saat install). Nama cache memakai versi (`pq-v1.0.0`) dan cache lama dihapus saat `activate`. Siswa diberi notifikasi "Versi baru tersedia — muat ulang".
- **Tombol Pasang:** tangkap `beforeinstallprompt` (Android/desktop). Di iOS tampilkan panduan "Bagikan → Tambahkan ke Layar Utama".
- **Wajib HTTPS** (kecuali `localhost`).

## 7. Peran Python Secara Rinci

| Skrip | Fungsi | Contoh perintah |
|---|---|---|
| `profit_core.py` | Rumus rujukan untuk uji silang | `python -m pytest tests/py` |
| `generate_soal.py` | Membangkitkan N soal per templat, memastikan angka bulat & persen ramah | `python tools/generate_soal.py --per-templat 20` |
| `validate_content.py` | Cek skema JSON, jawaban kunci = hasil `profit_core`, istilah terdefinisi | `python tools/validate_content.py` |
| `serve.py` | Menyajikan `app/` di LAN agar bisa dibuka di HP | `python tools/serve.py --port 8000` |
| `make_qr.py` | QR code URL produksi untuk brosur | `python tools/make_qr.py https://<url-produksi>` |
| `analisis_ujicoba.py` | Menghitung N-gain, rata-rata skala beban kognitif, skor SUS dari CSV | `python tools/analisis_ujicoba.py data.csv` |

## 8. Pengembangan Lanjutan (opsional)

- **Backend Python (FastAPI)** untuk dasbor guru: kelas, kode bergabung, dan rekap kemajuan. Hanya bila dibutuhkan, karena menambah biaya hosting dan isu privasi.
- **APK via TWA (Bubblewrap/PWABuilder)** agar bisa dibagikan sebagai berkas `.apk` atau diunggah ke Play Store.
- Ekspansi materi: diskon, pajak, bunga tunggal, bruto-neto-tara.
