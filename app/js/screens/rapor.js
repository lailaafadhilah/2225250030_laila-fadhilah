// Layar Pencapaian (lencana) dan Nilai (rapor kemajuan).
import { h, tombol } from '../ui/dom.js';
import { muatDaftarWilayah, muatSemuaWilayah, muatMateri } from '../konten.js';
import * as progres from '../state/progres.js';
import { maskot } from '../ui/ilustrasi.js';

/** Pencapaian tambahan (selain lencana wilayah). */
const PENCAPAIAN = [
  { ikon: '⭐', nama: 'Bintang Pertama', syarat: 'Dapatkan 1 bintang', cek: (c) => c.bintang >= 1 },
  { ikon: '🌟', nama: 'Kolektor Bintang', syarat: 'Kumpulkan 50 bintang', cek: (c) => c.bintang >= 50 },
  { ikon: '📚', nama: 'Kutu Buku', syarat: 'Baca semua bab materi', cek: (c) => c.materiDibaca >= c.jumlahMateri },
  { ikon: '🏪', nama: 'Pedagang Cilik', syarat: 'Selesaikan 3 tantangan simulasi', cek: (c) => c.simulasi >= 3 },
  { ikon: '🏆', nama: 'Juara Kuis', syarat: 'Dapat nilai 100 di kuis', cek: (c) => c.kuisTerbaik >= 100 },
  { ikon: '👑', nama: 'Juragan Sejati', syarat: 'Selesaikan semua wilayah', cek: (c) => c.selesai >= c.jumlahWilayah },
];

async function ringkasan() {
  const [daftar, materi] = await Promise.all([muatDaftarWilayah(), muatMateri()]);
  const p = progres.muat();
  return {
    p, daftar,
    bintang: progres.totalBintang(),
    selesai: daftar.filter((w) => progres.statusWilayah(w.id) === 'selesai').length,
    jumlahWilayah: daftar.length,
    materiDibaca: (p.materi_dibaca || []).length,
    jumlahMateri: materi.length,
    simulasi: p.simulasi_berhasil || 0,
    kuisTerbaik: p.kuis_terbaik ?? 0,
  };
}

export async function layarPencapaian(akar, _param, app) {
  app.aturJudul('🏆 Pencapaian');
  app.aturTema(['#F6C453', '#E8902A']);
  const c = await ringkasan();
  const semua = await muatSemuaWilayah();
  const lencana = semua.map((w) => ({ ikon: w.lencana.ikon, nama: w.lencana.nama, syarat: `Selesaikan ${w.nama}`, dapat: progres.statusWilayah(w.id) === 'selesai' }));
  const tambahan = PENCAPAIAN.map((x) => ({ ...x, dapat: x.cek(c) }));
  const dapat = [...lencana, ...tambahan].filter((x) => x.dapat).length;
  const kartu = (x, i) => h('li', { class: `lencana-kartu${x.dapat ? ' lencana-dapat' : ''}`, style: `--i:${i}` },
    h('span', { class: 'lencana-ikon', 'aria-hidden': 'true' }, x.dapat ? x.ikon : '🔒'),
    h('b', {}, x.nama), h('small', {}, x.dapat ? '✔ Didapat' : x.syarat));
  akar.replaceChildren(
    h('div', { class: 'sapa-maskot' }, maskot(dapat ? 'lompat' : 'lambai'),
      h('p', { class: 'gelembung' }, `Kamu punya ${dapat} dari ${lencana.length + tambahan.length} pencapaian!`, h('small', {}, 'Kumpulkan semuanya, ya.'))),
    h('h2', { class: 'judul-bagian' }, '🏅 Lencana Wilayah'),
    h('ul', { class: 'lencana-grid' }, lencana.map(kartu)),
    h('h2', { class: 'judul-bagian' }, '✨ Pencapaian Spesial'),
    h('ul', { class: 'lencana-grid' }, tambahan.map(kartu)),
  );
}

export async function layarNilai(akar, _param, app) {
  app.aturJudul('📊 Nilai');
  app.aturTema(['#7FB8E6', '#4C83C9']);
  const c = await ringkasan();
  const persenSelesai = Math.round((c.selesai / c.jumlahWilayah) * 100);
  const kuis = c.p.kuis || [];
  akar.replaceChildren(
    h('section', { class: 'kartu rapor-atas' },
      h('div', { class: 'cincin', style: `--nilai:${persenSelesai}`, role: 'img', 'aria-label': `${persenSelesai}% wilayah selesai` },
        h('span', {}, `${persenSelesai}%`)),
      h('div', { class: 'rapor-angka' },
        h('p', {}, h('b', {}, `${c.selesai}/${c.jumlahWilayah}`), ' wilayah selesai'),
        h('p', {}, h('b', {}, `⭐ ${c.bintang}`), ' bintang'),
        h('p', {}, h('b', {}, `🏆 ${c.kuisTerbaik || '-'}`), ' nilai kuis terbaik'))),
    h('section', { class: 'kartu' }, h('h2', {}, '🏪 Kemajuan per Wilayah'),
      h('ul', { class: 'rapor-wilayah' }, c.daftar.map((w) => {
        const st = progres.statusWilayah(w.id);
        return h('li', {},
          h('span', { 'aria-hidden': 'true' }, w.ikon), h('span', { class: 'rapor-nama' }, w.nama),
          h('span', { class: `chip-status st-${st}` }, st === 'selesai' ? '✔ Selesai' : st === 'terbuka' ? '▶ Buka' : '🔒 Tutup'),
          h('span', { class: 'rapor-bintang' }, `⭐ ${c.p.wilayah[w.id]?.bintang || 0}`));
      }))),
    h('section', { class: 'kartu' }, h('h2', {}, '❓ Riwayat Kuis'),
      kuis.length
        ? h('ul', { class: 'rapor-kuis' }, kuis.slice(-5).reverse().map((k) => h('li', {},
          h('span', {}, k.tanggal), h('div', { class: 'sim-batang-jalur' }, h('div', { class: 'sim-isi isi-untung', style: `width:${k.nilai}%` })), h('b', {}, String(k.nilai)))))
        : h('p', { class: 'catatan-kecil' }, 'Belum ada. Coba Kuis dari Beranda!'),
      tombol('Main Kuis ▶', () => { location.hash = '#kuis'; }, 'kedua', { class: 'btn btn-kedua btn-lebar' })),
    h('section', { class: 'kartu' }, h('h2', {}, '🔍 Kesalahan yang Sering Terjadi'),
      h('p', { class: 'catatan-kecil' }, 'Bagian ini membantumu tahu apa yang perlu dilatih lagi.'),
      daftarSalah(c.p.statistik_salah)),
  );
}

const NAMA_SALAH = {
  M1: 'Membagi dengan harga jual', M2: 'Lupa biaya tambahan', M3: 'Tertukar harga beli & jual',
  M4: 'Lupa × 100%', M5: 'Salah jumlah nol', M6: 'Salah menentukan untung/rugi',
  H1: 'Lupa menambah modal', H2: 'Arah untung/rugi terbalik', H3: 'Dikali, bukan dibagi', H4: 'Persen dari harga jual',
  K1: 'Harga jual masuk modal', K2: 'Harga beli tidak masuk modal', P1: 'Memakai angka pengecoh',
};

function daftarSalah(statistik = {}) {
  const urut = Object.entries(statistik).filter(([k]) => NAMA_SALAH[k]).sort((a, b) => b[1] - a[1]).slice(0, 5);
  if (!urut.length) return h('p', { class: 'catatan-kecil' }, 'Belum ada data. Hebat!');
  return h('ul', { class: 'daftar-salah' }, urut.map(([k, n]) => h('li', {}, `${NAMA_SALAH[k]}: ${n}×`)));
}
