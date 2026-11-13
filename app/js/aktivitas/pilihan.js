// Soal pilihan ganda dengan umpan balik per pilihan.
import { h, tombol, barAksi } from '../ui/dom.js';
import { animasikan } from '../ui/animasi.js';
import { suara } from '../ui/suara.js';

/** mode "latihan" boleh mencoba lagi; mode "ujian" hanya sekali. */
export function jalankanPilihan(wadah, a, { mode = 'latihan', konteks, onSelesai }) {
  let terpilih = null;
  let salah = 0;
  const umpan = h('div', { class: 'umpan', role: 'status', 'aria-live': 'polite' });
  const tombolOpsi = a.opsi.map((o) => h('button', {
    type: 'button', class: 'opsi', role: 'radio', 'aria-checked': 'false',
    onclick: (e) => {
      terpilih = o;
      tombolOpsi.forEach((b) => b.setAttribute('aria-checked', String(b === e.currentTarget)));
    },
  }, o.teks));
  const bar = h('div');
  const aturBar = (kanan) => bar.replaceChildren(barAksi(null, kanan));
  const kotak = (jenis, ...isi) => {
    umpan.replaceChildren(h('div', { class: `umpan-kotak umpan-${jenis}` }, ...isi));
    umpan.scrollIntoView({ block: 'nearest' });
  };

  function cek() {
    if (!terpilih) { kotak('info', konteks.umpanBalik.KOSONG); return; }
    if (mode === 'ujian') {
      tombolOpsi.forEach((b) => { b.disabled = true; });
      const benar = Boolean(terpilih.benar);
      if (benar) suara.benar(); else suara.salah();
      const kunci = a.opsi.find((o) => o.benar);
      kotak(benar ? 'benar' : 'salah', benar ? '✔ Benar! ' : '', terpilih.umpan || '',
        !benar && h('p', { class: 'kunci' }, 'Jawaban yang benar: ', kunci.teks));
      aturBar(tombol('Lanjut ▶', () => onSelesai({ benar })));
      return;
    }
    if (terpilih.benar) {
      suara.benar();
      tombolOpsi.forEach((b) => { b.disabled = true; });
      kotak('benar', '✔ ', terpilih.umpan || 'Benar!');
      const bintang = salah === 0 ? 3 : salah === 1 ? 2 : 1;
      aturBar(tombol('Lanjut ▶', () => onSelesai({ bintang })));
    } else {
      salah += 1;
      suara.salah();
      animasikan(tombolOpsi[a.opsi.indexOf(terpilih)], 'anim-goyang');
      kotak('salah', terpilih.umpan || konteks.umpanBalik.UMUM);
    }
  }

  wadah.replaceChildren(
    h('section', { class: 'kartu kartu-soal' },
      a.ikon && h('div', { class: 'ikon-barang', 'aria-hidden': 'true' }, a.ikon),
      h('p', { class: 'cerita' }, a.pertanyaan)),
    h('div', { class: 'daftar-opsi', role: 'radiogroup', 'aria-label': a.pertanyaan }, tombolOpsi),
    umpan,
    bar,
  );
  aturBar(tombol('Cek ✔', cek));
}
