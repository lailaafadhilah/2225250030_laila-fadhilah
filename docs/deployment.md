# Deployment, Instalasi & Brosur

## 1. Hosting (gratis, HTTPS)

Pilih salah satu:
- **GitHub Pages:** repositori publik, folder `app/` sebagai sumber (via GitHub Actions atau branch `gh-pages`). URL: `https://<username>.github.io/profitquest/`
- **Netlify / Vercel:** seret folder `app/` atau hubungkan repositori. Publish directory = `app`.

PWA **wajib** disajikan lewat HTTPS. Ketiga layanan di atas menyediakannya otomatis.

### Backend AI Tutor (Vercel)
Frontend tetap di GitHub Pages. Backend `backend/` di-deploy terpisah ke Vercel (Root Directory = `backend`, environment variable `GEMINI_API_KEY`). Langkah lengkap: [ai-tutor.md §5](ai-tutor.md).

## 2. Uji di HP Selama Pengembangan

1. Laptop dan HP terhubung ke Wi-Fi yang sama.
2. Jalankan `python tools/serve.py --port 8000`. Skrip menampilkan alamat LAN, misalnya `http://192.168.1.10:8000`.
3. Buka alamat tersebut di Chrome HP. Catatan: service worker hanya aktif di `localhost` atau HTTPS. Untuk menguji fitur install/offline, gunakan:
   - `chrome://inspect` + *port forwarding* USB (HP dianggap `localhost`), atau
   - deploy *preview* ke Netlify.

## 3. Cara Siswa Memasang Aplikasi (tanpa Play Store)

**Android (Chrome / Samsung Internet / Edge)**
1. Pindai QR code di brosur atau buka tautan.
2. Ketuk tombol **"Pasang ProfitQuest"** di aplikasi, atau menu ⋮ → **"Instal aplikasi" / "Tambahkan ke Layar Utama"**.
3. Ikon ProfitQuest muncul di layar utama. Aplikasi terbuka layar penuh dan bisa dipakai offline.

**iPhone (Safari)**
1. Buka tautan di Safari.
2. Ketuk ikon **Bagikan** → **Tambahkan ke Layar Utama** → **Tambah**.

**Laptop (Chrome/Edge):** ikon install ⊕ di bilah alamat.

## 4. Brosur

- Format A5 dua sisi atau satu sisi A4 lipat tiga. Sumbernya `brosur/brosur.html`, dicetak ke PDF dari browser.
- Isi brosur:
  - Nama & slogan: "ProfitQuest — Petualangan Menghitung Untung dan Rugi"
  - Untuk siapa: siswa SMP, materi Aritmetika Sosial
  - 3 keunggulan: langkah satu per satu, contoh dekat kehidupan sehari-hari, bisa offline
  - QR code (dibuat dengan `python tools/make_qr.py <URL>`, koreksi error level **M** atau **Q**, ukuran cetak ≥ 3 × 3 cm)
  - URL pendek yang bisa diketik manual
  - Panduan instalasi Android & iPhone bergambar (3 langkah)
  - Identitas pengembang (nama, prodi, universitas)

## 5. Pembaruan Versi

1. Naikkan `VERSI` di `app/sw.js` (misalnya `pq-v1.0.1`) setiap kali ada rilis.
2. Deploy. Aplikasi siswa mendeteksi service worker baru dan menampilkan "Versi baru tersedia — Muat ulang".
3. Progres siswa di `localStorage` tetap aman. Ubah skema hanya dengan migrasi `versi`.

## 6. Opsional: Berkas APK (TWA)

Bila ingin membagikan `.apk` lewat WhatsApp/Drive atau masuk Play Store di masa depan:
- Gunakan **PWABuilder** (pwabuilder.com) atau **Bubblewrap CLI** untuk membungkus PWA menjadi Trusted Web Activity.
- Perlu file `/.well-known/assetlinks.json` di domain agar bilah alamat tidak muncul.
- Siswa harus mengizinkan "Instal dari sumber tidak dikenal". Karena itu, instal PWA tetap menjadi jalur utama.
