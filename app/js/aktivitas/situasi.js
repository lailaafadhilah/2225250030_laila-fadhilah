// Kartu Situasi pembuka wilayah.
import { h, tombol, barAksi } from '../ui/dom.js';
import { ilustrasi } from '../ui/ilustrasi.js';

export function jalankanSituasi(wadah, a, { onSelesai }) {
  wadah.replaceChildren(
    h('section', { class: 'kartu situasi' },
      a.gambar ? h('img', { class: 'gambar-situasi', src: a.gambar, alt: a.gambar_alt || '', width: '720', height: '480' })
        : a.ilustrasi ? ilustrasi(a.ilustrasi, 'ilus gambar-situasi')
          : h('div', { class: 'ikon-besar', 'aria-hidden': 'true' }, a.ikon),
      h('h2', {}, a.judul),
      a.teks.map((t) => h('p', {}, t)),
      a.kalimat_kunci && h('p', { class: 'kalimat-kunci' }, '🔑 ', a.kalimat_kunci)),
    barAksi(null, tombol('Lanjut ▶', () => onSelesai({}))),
  );
}
