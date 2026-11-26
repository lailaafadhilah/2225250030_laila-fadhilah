// Beranda bergaya ilustrasi flat vector (pasar pastel, tokoh Sari & kucing, 5 tombol menu).
import { h } from '../ui/dom.js';
import { bukaLembar, tutupLembar } from '../ui/lembar.js';
import * as progres from '../state/progres.js';
import { latarPasar, tendaJudul, tokohSari, kucingPasar, papanA, ikonMenu } from '../ui/beranda-gambar.js';
import { mulaiMusik, hentikanMusik, musikNyala } from '../ui/suara.js';

const MENU = [
  { ikon: 'main', teks: 'Mulai Belajar', kelas: 'menu-kuning', tujuan: '#peta', perluNama: true },
  { ikon: 'buku', teks: 'Materi', kelas: 'menu-merah-muda', tujuan: '#materi', perluNama: true },
  { ikon: 'toko', teks: 'Simulasi Jual Beli', kelas: 'menu-hijau', tujuan: '#simulasi' },
  { ikon: 'tanya', teks: 'Kuis', kelas: 'menu-ungu', tujuan: '#kuis', perluNama: true },
  { ikon: 'chat', teks: 'Tanya Koko (AI)', kelas: 'menu-oranye', tujuan: '#tutor' },
  { ikon: 'orang', teks: 'Profil', kelas: 'menu-biru', tujuan: '#pengaturan' },
];

/** Meminta nama & kelas sekali saja sebelum masuk Mulai Belajar, Materi, atau Kuis. */
function mintaNama(lanjut) {
  const p = progres.muat();
  if (p.nama && p.kelas) { lanjut(); return; }
  const inputNama = h('input', { type: 'text', class: 'input-teks', maxlength: '20', value: p.nama, placeholder: 'Contoh: Raka', autocomplete: 'given-name' });
  const inputKelas = h('input', { type: 'text', class: 'input-teks', maxlength: '10', value: p.kelas, placeholder: 'Contoh: 8A', autocapitalize: 'characters' });
  const pesan = h('p', { class: 'catatan-kecil', role: 'alert' });
  const simpan = () => {
    const nama = inputNama.value.trim();
    const kelas = inputKelas.value.trim().toUpperCase();
    if (!nama) { pesan.textContent = '✏️ Tulis nama kamu dulu, ya.'; inputNama.focus(); return; }
    if (!kelas) { pesan.textContent = '✏️ Tulis kelas kamu juga, ya. Contoh: 8A.'; inputKelas.focus(); return; }
    p.nama = nama;
    p.kelas = kelas;
    progres.simpan();
    tutupLembar();
    lanjut();
  };
  inputNama.addEventListener('keydown', (e) => { if (e.key === 'Enter') inputKelas.focus(); });
  inputKelas.addEventListener('keydown', (e) => { if (e.key === 'Enter') simpan(); });
  bukaLembar('👋 Kenalan dulu, yuk!', h('div', { class: 'daftar-opsi' },
    h('label', { class: 'baris-atur' }, 'Nama', inputNama),
    h('label', { class: 'baris-atur' }, 'Kelas', inputKelas),
    pesan,
    h('button', { type: 'button', class: 'btn btn-utama btn-lebar', onclick: simpan }, 'Simpan & Mulai ▶')));
  setTimeout(() => (p.nama ? inputKelas : inputNama).focus(), 100);
}

export async function layarBeranda(akar, _param, app) {
  app.aturJudul('ProfitQuest');
  app.sembunyikanKepala(true);
  const p = progres.muat();

  // Ikon mengikuti pengaturan (bukan status putar), karena musik baru mulai setelah sentuhan pertama
  const tombolMusik = h('button', { type: 'button', class: 'bulat-pastel tombol-musik' });
  const gambarMusik = () => {
    const nyala = p.pengaturan.musik;
    tombolMusik.textContent = nyala ? '🎵' : '🔕';
    tombolMusik.setAttribute('aria-pressed', String(nyala));
    tombolMusik.setAttribute('aria-label', nyala ? 'Matikan musik latar' : 'Nyalakan musik latar');
  };
  tombolMusik.addEventListener('click', () => {
    p.pengaturan.musik = !p.pengaturan.musik;
    if (p.pengaturan.musik) { if (!musikNyala()) mulaiMusik(); } else hentikanMusik();
    progres.simpan();
    gambarMusik();
  });
  gambarMusik();

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
        p.nama ? h('p', { class: 'sapa-beranda' }, `Halo, ${p.nama}${p.kelas ? ` (${p.kelas})` : ''}! 👋`) : null,
        tokohSari(), papanA()),
      h('nav', { class: 'menu-utama', 'aria-label': 'Menu' },
      MENU.map((m, i) => h('button', {
        type: 'button', class: `tombol-menu ${m.kelas}`, style: `--i:${i}`,
        onclick: () => (m.perluNama ? mintaNama(() => { location.hash = m.tujuan; }) : (location.hash = m.tujuan)),
      }, ikonMenu(m.ikon), h('span', {}, m.teks))))),
  ));
}
