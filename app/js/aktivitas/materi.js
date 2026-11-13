// Penjelasan Materi: halaman pendek, satu ide per halaman (EL02, DS02).
// Siswa yang mengatur kecepatan dengan tombol Kembali / Lanjut (EL04).
import { h, tombol, barAksi } from '../ui/dom.js';
import { buatCerita } from '../ui/visual.js';
import { ilustrasi } from '../ui/ilustrasi.js';
import { animasikan } from '../ui/animasi.js';
import { suara } from '../ui/suara.js';

/** Teks boleh memuat token berwarna, mis. "[[hb:Rp30.000]]". */
const teksBerwarna = (teks) => buatCerita(teks, { mode: 'warna' }).el;

/** Satu halaman materi sebagai elemen. */
export function halamanMateri(hal) {
  return h('section', { class: 'kartu materi' },
    hal.gambar && h('img', { class: 'gambar-situasi', src: hal.gambar, alt: '', width: '720', height: '480' }),
    hal.ilustrasi && ilustrasi(hal.ilustrasi, 'ilus gambar-situasi'),
    h('h2', {}, hal.judul),
    hal.awas && h('p', { class: 'kotak-awas' }, '⚠️ ', hal.awas),
    (hal.teks || []).map(teksBerwarna),
    hal.poin && h('ul', { class: 'materi-poin' }, hal.poin.map((p, i) => h('li', { style: `--i:${i}` }, teksBerwarna(p)))),
    hal.rumus && h('div', { class: 'rumus-materi' },
      h('span', { class: 'rumus-label' }, 'Rumus'), hal.rumus.map((r) => h('p', {}, r))),
    hal.contoh && h('div', { class: 'contoh-materi' },
      h('span', { class: 'rumus-label' }, 'Contoh'),
      teksBerwarna(hal.contoh),
      hal.langkah && h('ol', { class: 'langkah-materi' }, hal.langkah.map((l, i) => h('li', { style: `--i:${i}` }, l)))),
    hal.ingat && h('p', { class: 'kotak-ingat' }, '💡 ', hal.ingat),
  );
}

/**
 * Menjalankan satu bab materi halaman demi halaman.
 * opsi: { onSelesai, labelSelesai }
 */
export function jalankanMateri(wadah, bab, { onSelesai, labelSelesai = 'Mengerti, lanjut! ✔' }) {
  let i = 0;
  const n = bab.halaman.length;

  function gambar() {
    const titik = h('div', { class: 'titik-halaman', role: 'img', 'aria-label': `Halaman ${i + 1} dari ${n}` },
      bab.halaman.map((_, j) => h('span', { class: j === i ? 'aktif' : j < i ? 'lewat' : '' })));
    const isi = halamanMateri(bab.halaman[i]);
    const kiri = i > 0 ? tombol('◀ Kembali', () => { i -= 1; gambar(); }, 'kedua') : null;
    const kanan = i < n - 1
      ? tombol('Lanjut ▶', () => { i += 1; gambar(); })
      : tombol(labelSelesai, () => onSelesai({}));
    wadah.replaceChildren(titik, isi, barAksi(kiri, kanan));
    animasikan(isi, 'anim-masuk');
    if (i > 0) suara.geser();
    window.scrollTo(0, 0);
  }
  gambar();
}
