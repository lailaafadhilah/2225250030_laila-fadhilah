// Kuis Kilat: 10 soal campuran dari bank soal, satu kali jawab per langkah (seperti checkpoint).
import { h, tombol, barAksi, acak } from '../ui/dom.js';
import { muatBank, muatUmpanBalik } from '../konten.js';
import * as progres from '../state/progres.js';
import { jalankanSoal } from '../soal/runner.js';
import { maskot } from '../ui/ilustrasi.js';
import { konfeti, animasikan } from '../ui/animasi.js';
import { suara } from '../ui/suara.js';

const JUMLAH_SOAL = 10;

export async function layarKuis(akar, _param, app) {
  app.aturJudul('❓ Kuis Kilat', { kembali: '#beranda' });
  app.aturTema(['#B79CF0', '#7C5BD6']);
  const [bank, umpanBalik] = await Promise.all([muatBank(), muatUmpanBalik()]);
  const p = progres.muat();
  const konteks = { umpanBalik, catatSalah: progres.catatSalah, caraJawab: p.pengaturan.cara_jawab };

  function pembuka() {
    akar.replaceChildren(h('section', { class: 'kartu kuis-pembuka' },
      h('div', { class: 'sapa-maskot' }, maskot('lambai'),
        h('p', { class: 'gelembung' }, 'Siap diuji, Juragan?', h('small', {}, `${JUMLAH_SOAL} soal campuran dari semua wilayah.`))),
      h('ul', { class: 'materi-poin' },
        h('li', { style: '--i:0' }, '✔ Setiap langkah hanya bisa dijawab sekali.'),
        h('li', { style: '--i:1' }, '✔ Nilai = jumlah soal benar × 10.'),
        h('li', { style: '--i:2' }, `🏆 Nilai terbaikmu: ${p.kuis_terbaik ?? '-'}`)),
    ), barAksi(tombol('📊 Nilai', () => { location.hash = '#nilai'; }, 'kedua'), tombol('Mulai Kuis ▶', mulai)));
  }

  function mulai() {
    // Ambil soal dari tiap templat secara bergiliran agar materinya tercampur
    const templat = acak(Object.keys(bank));
    const kumpulan = templat.map((t) => acak(bank[t]));
    const daftar = [];
    for (let i = 0; daftar.length < JUMLAH_SOAL; i++) daftar.push(kumpulan[i % kumpulan.length][Math.floor(i / kumpulan.length)]);
    let benar = 0;
    const satu = (i) => {
      if (i >= daftar.length) { selesai(benar); return; }
      const isi = h('div');
      akar.replaceChildren(
        h('div', { class: 'kemajuan', 'aria-hidden': 'true' },
          h('div', { class: 'kemajuan-batang' }, h('div', { class: 'kemajuan-isi', style: `width:${(i / daftar.length) * 100}%` })),
          h('span', {}, `${i + 1}/${daftar.length}`)),
        h('p', { class: 'label-aktivitas' }, `❓ Kuis · Soal ${i + 1} dari ${daftar.length}`), isi);
      animasikan(isi, 'anim-muncul');
      jalankanSoal(isi, daftar[i], {
        mode: 'ujian', konteks,
        onSelesai: (hasil) => { if (hasil.benar) benar += 1; window.scrollTo(0, 0); satu(i + 1); },
      });
    };
    satu(0);
  }

  function selesai(benar) {
    const nilai = benar * 10;
    p.kuis = [...(p.kuis || []), { tanggal: new Date().toISOString().slice(0, 10), nilai }].slice(-10);
    p.kuis_terbaik = Math.max(p.kuis_terbaik ?? 0, nilai);
    progres.simpan();
    const bintang = nilai >= 90 ? 3 : nilai >= 70 ? 2 : 1;
    const pesan = nilai >= 90 ? 'Luar biasa! Kamu Juragan sejati!' : nilai >= 70 ? 'Bagus sekali! Sedikit lagi sempurna.' : 'Ayo baca lagi materinya, lalu coba lagi!';
    akar.replaceChildren(h('section', { class: 'kartu hasil-wilayah' },
      h('div', { class: 'hasil-gambar' }, maskot(nilai >= 70 ? 'lompat' : 'semangat')),
      h('h2', {}, `Nilaimu: ${nilai}`),
      h('p', { class: 'bintang' }, '⭐'.repeat(bintang) + '☆'.repeat(3 - bintang)),
      h('p', {}, `Benar ${benar} dari ${JUMLAH_SOAL} soal. ${pesan}`),
      h('p', { class: 'catatan-kecil' }, `Nilai terbaik: ${p.kuis_terbaik}`),
    ), barAksi(tombol('📘 Materi', () => { location.hash = '#materi'; }, 'kedua'), tombol('Main lagi ↻', mulai)));
    if (nilai >= 70) { suara.menang(); konfeti(nilai === 100 ? 70 : 35); } else suara.geser();
  }

  pembuka();
}
