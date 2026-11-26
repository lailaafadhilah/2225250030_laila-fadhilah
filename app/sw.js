// Service worker ProfitQuest: menyimpan semua berkas agar bisa dipakai offline.
// NAIKKAN VERSI setiap kali ada berkas yang berubah, lalu deploy ulang.
const VERSI = 'pq-v3.0.1';

const PRECACHE = [
  './',
  './index.html',
  './manifest.webmanifest',
  './css/tokens.css',
  './css/main.css',
  './css/animasi.css',
  './css/pastel.css',
  './js/ui/animasi.js',
  './js/ui/ilustrasi.js',
  './js/ui/peta-pasar.js',
  './js/ui/suara.js',
  './js/ui/beranda-gambar.js',
  './js/screens/beranda.js',
  './js/screens/simulasi.js',
  './js/screens/kuis.js',
  './js/screens/rapor.js',
  './js/main.js',
  './js/konten.js',
  './js/pasang.js',
  './js/core/hitung.js',
  './js/core/format.js',
  './js/core/diagnosa.js',
  './js/core/cerita.js',
  './js/state/progres.js',
  './js/ui/dom.js',
  './js/ui/lembar.js',
  './js/ui/toast.js',
  './js/ui/visual.js',
  './js/ui/input-angka.js',
  './js/soal/langkah.js',
  './js/soal/runner.js',
  './js/aktivitas/situasi.js',
  './js/aktivitas/pilihan.js',
  './js/aktivitas/susun.js',
  './js/aktivitas/materi.js',
  './js/screens/wilayah.js',
  './js/screens/lainnya.js',
  './js/screens/tutor.js',
  './js/ai/konfigurasi.js',
  './js/ai/tutor-api.js',
  './js/ai/format-jawaban.js',
  './content/wilayah.json',
  './content/wilayah-1.json',
  './content/wilayah-2.json',
  './content/wilayah-3.json',
  './content/wilayah-4.json',
  './content/wilayah-5.json',
  './content/wilayah-6.json',
  './content/istilah.json',
  './content/umpan-balik.json',
  './content/bank-soal.json',
  './content/materi.json',
  './content/simulasi.json',
  './content/tutor.json',
  './assets/icons/icon-192.png',
  './assets/icons/icon-512.png',
  './assets/icons/icon-maskable-512.png',
  './assets/icons/apple-touch-icon.png',
  './assets/gambar/pasar.webp',
];

self.addEventListener('install', (event) => {
  event.waitUntil(caches.open(VERSI).then((cache) => cache.addAll(PRECACHE)));
});

self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((kunci) => Promise.all(kunci.filter((k) => k !== VERSI).map((k) => caches.delete(k)))),
  );
});

// Siswa mengetuk "Muat ulang" → versi baru langsung aktif
self.addEventListener('message', (event) => {
  if (event.data === 'LEWATI_TUNGGU') self.skipWaiting();
});

// Cache-first: ambil dari cache dulu, baru dari jaringan
self.addEventListener('fetch', (event) => {
  const req = event.request;
  if (req.method !== 'GET' || new URL(req.url).origin !== self.location.origin) return;
  event.respondWith(
    caches.match(req, { ignoreSearch: true }).then((tersimpan) => {
      if (tersimpan) return tersimpan;
      return fetch(req).catch(() => (req.mode === 'navigate' ? caches.match('./index.html') : Response.error()));
    }),
  );
});
