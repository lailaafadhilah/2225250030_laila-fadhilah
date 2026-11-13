// Titik masuk aplikasi: router, kepala halaman, navigasi, suara, service worker.
import { muat, simpan } from './state/progres.js';
import { bukaLembar } from './ui/lembar.js';
import { tampilkanToast } from './ui/toast.js';
import { h } from './ui/dom.js';
import { animasikan } from './ui/animasi.js';
import { suara, mulaiMusik, musikNyala, bukaKunciAudio } from './ui/suara.js';
import { layarWilayah } from './screens/wilayah.js';
import { layarBeranda } from './screens/beranda.js';
import { layarSimulasi } from './screens/simulasi.js';
import { layarKuis } from './screens/kuis.js';
import { layarPencapaian, layarNilai } from './screens/rapor.js';
import { layarPeta, layarBuku, layarKamus, layarPengaturan, isiKamus, layarMateri } from './screens/lainnya.js';

const akar = document.getElementById('layar');
const elJudul = document.getElementById('judul');
const tombolKembali = document.getElementById('kembali');
const tombolSuara = document.getElementById('tombol-suara');
const nav = document.getElementById('nav');

// nav: item menu bawah yang aktif (null = menu bawah disembunyikan agar siswa fokus)
const RUTE = [
  { pola: /^#?(?:beranda)?$/, layar: layarBeranda, nav: 'beranda' },
  { pola: /^#peta$/, layar: layarPeta, nav: 'peta' },
  { pola: /^#wilayah-(\d+)$/, layar: layarWilayah, nav: null },
  { pola: /^#simulasi$/, layar: layarSimulasi, nav: null },
  { pola: /^#kuis$/, layar: layarKuis, nav: null },
  { pola: /^#pencapaian$/, layar: layarPencapaian, nav: 'pencapaian' },
  { pola: /^#nilai$/, layar: layarNilai, nav: 'nilai' },
  { pola: /^#buku$/, layar: layarBuku, nav: '-' },
  { pola: /^#kamus$/, layar: layarKamus, nav: '-' },
  { pola: /^#materi(?:-([\w]+))?$/, layar: layarMateri, nav: '-' },
  { pola: /^#pengaturan$/, layar: layarPengaturan, nav: '-' },
];

let bersihkan = [];
const app = {
  aturJudul(judul, { kembali = null } = {}) {
    elJudul.textContent = judul;
    document.title = judul === 'ProfitQuest' ? 'ProfitQuest' : `${judul} · ProfitQuest`;
    tombolKembali.hidden = !kembali;
    tombolKembali.onclick = () => { location.hash = kembali; };
  },
  /** Warna tema [warna1, warna2] untuk kepala halaman & bar kemajuan (null = bawaan). */
  aturTema(warna = null) {
    const gaya = document.documentElement.style;
    if (warna) { gaya.setProperty('--tema1', warna[0]); gaya.setProperty('--tema2', warna[1]); } else { gaya.removeProperty('--tema1'); gaya.removeProperty('--tema2'); }
    document.querySelector('meta[name="theme-color"]')?.setAttribute('content', warna ? warna[0] : '#1E5FBF');
  },
  /** Beranda tampil penuh tanpa kepala halaman. */
  sembunyikanKepala(ya) { document.body.classList.toggle('tanpa-kepala', ya); },
  /** Mendaftarkan fungsi pembersih saat meninggalkan layar. */
  saatTinggal(fn) { bersihkan.push(fn); },
};

async function render() {
  bersihkan.forEach((fn) => fn());
  bersihkan = [];
  const hash = location.hash || '';
  const rute = RUTE.find((r) => r.pola.test(hash)) || RUTE[0];
  const param = hash.match(rute.pola)?.slice(1) || [];
  nav.hidden = !rute.nav;
  nav.querySelectorAll('a').forEach((a) => a.setAttribute('aria-current', a.dataset.nav === rute.nav ? 'page' : 'false'));
  app.aturJudul('ProfitQuest', { kembali: rute.nav === '-' ? '#beranda' : null });
  app.aturTema(null);
  app.sembunyikanKepala(false);
  akar.replaceChildren(h('p', { class: 'memuat' }, 'Memuat…'));
  try {
    await rute.layar(akar, param, app);
    if (rute.nav) animasikan(akar, 'anim-muncul'); // transisi antar-layar menu (hanya memudar: ada bar .aksi)
  } catch (err) {
    console.error(err);
    akar.replaceChildren(h('section', { class: 'kartu' },
      h('h2', {}, 'Ups, ada masalah'),
      h('p', {}, 'Halaman ini gagal dimuat. Periksa koneksi internet untuk pembukaan pertama, lalu muat ulang.')));
  }
  window.scrollTo(0, 0);
}

// ---------- Suara ----------
function gambarTombolSuara() {
  const nyala = muat().pengaturan.suara !== false;
  tombolSuara.textContent = nyala ? '🔊' : '🔇';
  tombolSuara.setAttribute('aria-pressed', String(nyala));
  tombolSuara.setAttribute('aria-label', nyala ? 'Matikan suara' : 'Nyalakan suara');
}
tombolSuara.addEventListener('click', () => {
  const p = muat();
  p.pengaturan.suara = p.pengaturan.suara === false;
  simpan();
  gambarTombolSuara();
});
// Bunyi "klik" untuk setiap tombol, tautan, pilihan, dan isian yang diketuk
document.addEventListener('pointerdown', (e) => {
  const el = e.target.closest('button, a, [role="radio"], [role="button"], [onclick], select, input, label, summary');
  if (el && !el.disabled) suara.klik();
}, true);
// Audio & musik latar hanya boleh mulai setelah sentuhan pertama (aturan browser HP).
// iPhone membuka audio saat "touchend"/"click", Android saat "pointerdown": pasang ketiganya.
function mulaiAudio() {
  bukaKunciAudio();
  if (muat().pengaturan.musik && !musikNyala()) mulaiMusik();
  ['pointerdown', 'touchend', 'click', 'keydown'].forEach((jenis) => document.removeEventListener(jenis, mulaiAudio, true));
}
['pointerdown', 'touchend', 'click', 'keydown'].forEach((jenis) => document.addEventListener(jenis, mulaiAudio, true));

document.documentElement.dataset.teks = muat().pengaturan.ukuran_teks;
document.documentElement.dataset.animasi = muat().pengaturan.animasi;
document.getElementById('bantuan').addEventListener('click', async () => bukaLembar('📚 Kamus Istilah', await isiKamus()));
gambarTombolSuara();
window.addEventListener('hashchange', render);
render();

// Service worker: cache offline + tawaran versi baru
if ('serviceWorker' in navigator) {
  window.addEventListener('load', async () => {
    try {
      const reg = await navigator.serviceWorker.register('./sw.js');
      let mauMuatUlang = false;
      const tawarkan = (sw) => tampilkanToast('Versi baru tersedia.', {
        label: 'Muat ulang',
        aksi: () => { mauMuatUlang = true; sw.postMessage('LEWATI_TUNGGU'); },
      });
      if (reg.waiting && navigator.serviceWorker.controller) tawarkan(reg.waiting);
      reg.addEventListener('updatefound', () => {
        const sw = reg.installing;
        sw?.addEventListener('statechange', () => {
          if (sw.state === 'installed' && navigator.serviceWorker.controller) tawarkan(sw);
        });
      });
      navigator.serviceWorker.addEventListener('controllerchange', () => { if (mauMuatUlang) location.reload(); });
    } catch (err) {
      console.warn('Service worker tidak aktif di sini:', err);
    }
  });
}
