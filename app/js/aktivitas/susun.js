// "Jelaskan ke Teman" (F12): menyusun ulang urutan langkah (GL04).
import { h, tombol, barAksi, acak } from '../ui/dom.js';
import { suara } from '../ui/suara.js';

export function jalankanSusun(wadah, a, { konteks, onSelesai }) {
  let kumpulan = acak(a.kartu);
  // Pastikan urutan awal tidak langsung benar
  while (kumpulan.length > 1 && kumpulan.every((k, i) => k === a.kartu[i])) kumpulan = acak(a.kartu);
  let tersusun = [];
  let salah = 0;
  let selesai = false;

  const elTersusun = h('ol', { class: 'susun-urutan', 'aria-label': 'Urutanmu' });
  const elKumpulan = h('div', { class: 'daftar-opsi' });
  const umpan = h('div', { class: 'umpan', role: 'status', 'aria-live': 'polite' });
  const bar = h('div');

  function gambar() {
    elTersusun.replaceChildren(...tersusun.map((k, i) => h('li', {},
      h('button', { type: 'button', class: 'opsi opsi-tersusun', disabled: selesai, onclick: () => { tersusun.splice(i, 1); kumpulan.push(k); gambar(); } },
        h('span', { class: 'nomor' }, i + 1), ' ', k))));
    if (!tersusun.length) elTersusun.append(h('li', { class: 'kosong' }, 'Ketuk kartu di bawah sesuai urutan.'));
    elKumpulan.replaceChildren(...kumpulan.map((k, i) => h('button', {
      type: 'button', class: 'opsi', onclick: () => { kumpulan.splice(i, 1); tersusun.push(k); gambar(); },
    }, k)));
  }

  function cek() {
    if (kumpulan.length) { umpan.replaceChildren(h('div', { class: 'umpan-kotak umpan-info' }, 'Susun semua kartu dulu, ya.')); return; }
    const posisiSalah = tersusun.findIndex((k, i) => k !== a.kartu[i]);
    if (posisiSalah === -1) {
      suara.benar();
      selesai = true;
      gambar();
      umpan.replaceChildren(h('div', { class: 'umpan-kotak umpan-benar' }, '✔ Hebat! Sekarang kamu bisa menjelaskannya ke temanmu.'));
      const bintang = salah === 0 ? 3 : salah <= 2 ? 2 : 1;
      bar.replaceChildren(barAksi(null, tombol('Lanjut ▶', () => onSelesai({ bintang }))));
    } else {
      salah += 1;
      suara.salah();
      umpan.replaceChildren(h('div', { class: 'umpan-kotak umpan-salah' },
        konteks.umpanBalik.S1, h('p', {}, `Periksa lagi kartu nomor ${posisiSalah + 1}. Ketuk kartu untuk mengembalikannya.`)));
      umpan.scrollIntoView({ block: 'nearest' });
    }
  }

  wadah.replaceChildren(
    h('section', { class: 'kartu kartu-soal' }, h('div', { class: 'ikon-barang', 'aria-hidden': 'true' }, '🗣️'), h('p', { class: 'cerita' }, a.pertanyaan)),
    elTersusun, elKumpulan, umpan, bar,
  );
  bar.replaceChildren(barAksi(null, tombol('Cek ✔', cek)));
  gambar();
}
