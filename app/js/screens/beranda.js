// Beranda bergaya ilustrasi flat vector (pasar pastel, tokoh Sari & kucing, 5 tombol menu).
import { h } from '../ui/dom.js';
import { bukaLembar, tutupLembar } from '../ui/lembar.js';
import * as progres from '../state/progres.js';
import { latarPasar, tendaJudul, tokohSari, kucingPasar, papanA, ikonMenu } from '../ui/beranda-gambar.js';
import { mulaiMusik, hentikanMusik, musikNyala } from '../ui/suara.js';

const MENU = [
  { ikon: 'main', teks: 'Mulai Belajar', kelas: 'menu-kuning', tujuan: '#peta', perluNama: true },
  { ikon: 'buku', teks: 'Materi', kelas: 'menu-merah-muda', tujuan: '#materi' },
  { ikon: 'toko', teks: 'Simulasi Jual Beli', kelas: 'menu-hijau', tujuan: '#simulasi' },
  { ikon: 'tanya', teks: 'Kuis', kelas: 'menu-ungu', tujuan: '#kuis', perluNama: true },
  { ikon: 'orang', teks: 'Profil', kelas: 'menu-biru', tujuan: '#pengaturan' },
];

/** Meminta nama panggilan sekali saja sebelum mulai. */
function mintaNama(lanjut) {
  const p = progres.muat();
  if (p.nama) { lanjut(); return; }
  const input = h('input', { type: 'text', class: 'input-teks', maxlength: '20', placeholder: 'Contoh: Raka', 'aria-label': 'Nama panggilan' });
  const simpan = () => {
    p.nama = input.value.trim() || 'Juragan Cilik';
    progres.simpan();
    tutupLembar();
    lanjut();
  };
  input.addEventListener('keydown', (e) => { if (e.key === 'Enter') simpan(); });
  bukaLembar('👋 Siapa nama panggilanmu?', h('div', { class: 'daftar-opsi' }, input,
    h('button', { type: 'button', class: 'btn btn-utama btn-lebar', onclick: simpan }, 'Simpan & Mulai ▶')));
  setTimeout(() => input.focus(), 100);
}

export async function layarBeranda(akar, _param, app) {
  app.aturJudul('ProfitQuest');
  app.sembunyikanKepala(true);
  const p = progres.muat();

  const tombolMusik = h('button', { type: 'button', class: 'bulat-pastel tombol-musik', 'aria-label': 'Musik latar', 'aria-pressed': String(musikNyala()) }, '🎵');
  tombolMusik.addEventListener('click', () => {
    if (musikNyala()) { hentikanMusik(); p.pengaturan.musik = false; } else { mulaiMusik(); p.pengaturan.musik = true; }
    progres.simpan();
    tombolMusik.setAttribute('aria-pressed', String(musikNyala()));
  });

  akar.replaceChildren(h('section', { class: 'beranda-pasar' },
    latarPasar(),
    h('div', { class: 'beranda-atas' },
      h('span', { class: 'pil-koin', 'aria-label': `${progres.totalBintang()} bintang` },
        h('span', { class: 'koin-ikon', 'aria-hidden': 'true' }, '★'), h('b', {}, String(progres.totalBintang()))),
      h('span', { class: 'beranda-kanan' }, tombolMusik,
        h('button', { type: 'button', class: 'bulat-pastel', 'aria-label': 'Pengaturan', onclick: () => { location.hash = '#pengaturan'; } }, ikonMenu('gir')))),
    h('header', { class: 'judul-beranda' },
      tendaJudul(),
      kucingPasar(),
      h('div', { class: 'papan-kayu' },
        h('h1', { class: 'judul-pq' }, h('span', { class: 'judul-profit' }, 'Profit'), h('span', { class: 'judul-quest' }, 'Quest')),
        h('p', { class: 'papan-sub' }, '★ Petualangan Menghitung Untung dan Rugi! ★'))),
    h('div', { class: 'beranda-tengah' },
      h('div', { class: 'kolom-tokoh' },
        p.nama ? h('p', { class: 'sapa-beranda' }, `Halo, ${p.nama}! 👋`) : null,
        tokohSari(), papanA()),
      h('nav', { class: 'menu-utama', 'aria-label': 'Menu' },
      MENU.map((m, i) => h('button', {
        type: 'button', class: `tombol-menu ${m.kelas}`, style: `--i:${i}`,
        onclick: () => (m.perluNama ? mintaNama(() => { location.hash = m.tujuan; }) : (location.hash = m.tujuan)),
      }, ikonMenu(m.ikon), h('span', {}, m.teks))))),
  ));
}
