// Layar satu wilayah: menjalankan aktivitas berurutan sampai checkpoint.
import { h, tombol, barAksi, acak } from '../ui/dom.js';
import { bukaLembar } from '../ui/lembar.js';
import { muatWilayah, muatBank, muatUmpanBalik, muatDaftarWilayah, muatMateri } from '../konten.js';
import { jalankanMateri } from '../aktivitas/materi.js';
import * as progres from '../state/progres.js';
import { jalankanSoal, contohPenuh } from '../soal/runner.js';
import { jalankanSituasi } from '../aktivitas/situasi.js';
import { jalankanPilihan } from '../aktivitas/pilihan.js';
import { jalankanSusun } from '../aktivitas/susun.js';
import { animasikan, konfeti } from '../ui/animasi.js';
import { maskot } from '../ui/ilustrasi.js';
import { suara } from '../ui/suara.js';

const BATAS_LULUS = 0.75; // minimal 3 dari 4 soal checkpoint

/** Mengambil n soal acak (tanpa pengulangan) dari beberapa templat bank. */
function ambilDariBank(bank, templat, n) {
  const semua = templat.flatMap((t) => bank[t] || []);
  return acak(semua).slice(0, n);
}

export async function layarWilayah(akar, [idTeks], app) {
  const id = Number(idTeks);
  if (progres.statusWilayah(id) === 'terkunci') { location.hash = '#peta'; return; }
  const [w, bank, umpanBalik, daftar, materi] = await Promise.all([muatWilayah(id), muatBank(), muatUmpanBalik(), muatDaftarWilayah(), muatMateri()]);
  app.aturJudul(`${w.ikon} ${w.nama}`, { kembali: '#peta' });
  app.aturTema(daftar.find((x) => x.id === id)?.warna);

  const catatan = progres.catatanWilayah(id);
  let posisi = Math.min(catatan.posisi || 0, w.aktivitas.length - 1);
  const daftarContoh = w.aktivitas.filter((a) => a.tipe === 'contoh');

  const konteks = {
    umpanBalik,
    caraJawab: progres.muat().pengaturan.cara_jawab,
    catatSalah: progres.catatSalah,
    bukaContoh: daftarContoh.length ? () => bukaLembar('📖 Contoh', h('div', {},
      daftarContoh.map((c) => h('details', { class: 'contoh-lipat', open: daftarContoh.length === 1 },
        h('summary', {}, c.judul), contohPenuh(c.soal))))) : null,
  };

  const batang = h('div', { class: 'kemajuan-isi' });
  const teksKemajuan = h('span', {});
  const wadah = h('div', { class: 'aktivitas' });
  akar.replaceChildren(
    h('div', { class: 'kemajuan', 'aria-hidden': 'true' }, h('div', { class: 'kemajuan-batang' }, batang), teksKemajuan),
    wadah,
  );

  function perbaruiKemajuan() {
    const n = w.aktivitas.length;
    batang.style.width = `${Math.round((posisi / n) * 100)}%`;
    teksKemajuan.textContent = `${posisi + 1}/${n}`;
  }

  function simpanBintang(bintang) {
    if (!bintang) return;
    catatan.bintang_aktivitas[posisi] = Math.max(catatan.bintang_aktivitas[posisi] || 0, bintang);
    catatan.bintang = Object.values(catatan.bintang_aktivitas).reduce((a, b) => a + b, 0);
  }

  function lanjut(hasil = {}) {
    simpanBintang(hasil.bintang);
    posisi += 1;
    catatan.posisi = posisi;
    progres.simpan();
    window.scrollTo(0, 0);
    jalankan();
  }

  function denganLabel(label, sub) {
    const isi = h('div');
    wadah.replaceChildren(h('p', { class: 'label-aktivitas' }, label, sub ? ` · ${sub}` : ''), isi);
    animasikan(wadah, 'anim-muncul');
    return isi;
  }

  function jalankan() {
    perbaruiKemajuan();
    const a = w.aktivitas[posisi];
    switch (a.tipe) {
      case 'situasi':
        jalankanSituasi(denganLabel('Kartu Situasi'), a, { onSelesai: lanjut });
        break;
      case 'materi': {
        const bab = materi.find((b) => b.id === a.bab);
        jalankanMateri(denganLabel('📘 Penjelasan Materi', bab.judul), bab, {
          onSelesai: (hasil) => { progres.tandaiMateri(bab.id); lanjut(hasil); },
        });
        break;
      }
      case 'contoh':
        progres.tandaiContoh(a.id);
        jalankanSoal(denganLabel('Contoh Terurai', a.judul), a.soal, { mode: 'contoh', konteks, onSelesai: lanjut });
        break;
      case 'pilihan':
        jalankanPilihan(denganLabel('Pertanyaan'), a, { konteks, onSelesai: lanjut });
        break;
      case 'susun':
        jalankanSusun(denganLabel('Jelaskan ke Teman'), a, { konteks, onSelesai: lanjut });
        break;
      case 'latihan':
        jalankanLatihan(a);
        break;
      case 'checkpoint':
        jalankanCheckpoint(a);
        break;
      default:
        lanjut();
    }
  }

  function jalankanLatihan(a) {
    const daftarSoal = a.sumber === 'bank' ? ambilDariBank(bank, a.templat, a.jumlah) : [a.soal];
    const bintang = [];
    const satu = (i) => {
      if (i >= daftarSoal.length) {
        lanjut({ bintang: Math.round(bintang.reduce((x, y) => x + y, 0) / bintang.length) });
        return;
      }
      const sub = daftarSoal.length > 1 ? `${i + 1} dari ${daftarSoal.length}` : '';
      jalankanSoal(denganLabel(a.label || 'Latihan', sub), daftarSoal[i], {
        mode: 'latihan', tampil: a.tampil || 0, konteks,
        onSelesai: (hasil) => { bintang.push(hasil.bintang || 1); window.scrollTo(0, 0); satu(i + 1); },
      });
    };
    satu(0);
  }

  function jalankanCheckpoint(a) {
    const daftarSoal = a.sumber === 'bank' ? ambilDariBank(bank, a.templat, a.jumlah) : a.soal;
    let benar = 0;
    const satu = (i) => {
      if (i >= daftarSoal.length) { hasilCheckpoint(a, benar, daftarSoal.length); return; }
      const s = daftarSoal[i];
      const isi = denganLabel('🏁 Checkpoint', `${i + 1} dari ${daftarSoal.length}`);
      const onSelesai = (hasil) => { if (hasil.benar) benar += 1; window.scrollTo(0, 0); satu(i + 1); };
      if (s.tipe === 'pilihan') jalankanPilihan(isi, s, { mode: 'ujian', konteks, onSelesai });
      else jalankanSoal(isi, s, { mode: 'ujian', konteks, onSelesai });
    };
    satu(0);
  }

  function hasilCheckpoint(a, benar, n) {
    const minimal = Math.ceil(n * BATAS_LULUS);
    const lulus = benar >= minimal;
    if (lulus) {
      simpanBintang(benar === n ? 3 : 2);
      catatan.status = 'selesai';
      catatan.posisi = 0;
      progres.simpan();
      const berikut = daftar.find((x) => x.id === id + 1);
      wadah.replaceChildren(
        h('section', { class: 'kartu hasil-wilayah' },
          h('div', { class: 'hasil-gambar' }, maskot('lompat'), h('div', { class: 'ikon-besar', 'aria-hidden': 'true' }, w.lencana.ikon)),
          h('h2', {}, 'Wilayah selesai! 🎉'),
          h('p', {}, `Kamu benar ${benar} dari ${n} soal checkpoint.`),
          h('p', { class: 'lencana-dapat' }, 'Lencana baru: ', h('b', {}, w.lencana.nama)),
          h('p', { class: 'bintang' }, `⭐ ${catatan.bintang} bintang`)),
        barAksi(tombol('🗺️ Peta', () => { location.hash = '#peta'; }, 'kedua'),
          berikut ? tombol(`${berikut.ikon} Wilayah ${berikut.id} ▶`, () => { location.hash = `#wilayah-${berikut.id}`; })
            : tombol('📖 Buku Contoh', () => { location.hash = '#buku'; })),
      );
      animasikan(wadah, 'anim-muncul');
      konfeti(60);
      suara.menang();
    } else {
      wadah.replaceChildren(
        h('section', { class: 'kartu hasil-wilayah' },
          h('div', { class: 'sapa-maskot' }, maskot('semangat'), h('p', { class: 'gelembung' }, 'Jangan menyerah! Kamu pasti bisa! 💪')),
          h('h2', {}, 'Hampir berhasil!'),
          h('p', {}, `Kamu benar ${benar} dari ${n}. Butuh minimal ${minimal} untuk membuka wilayah berikutnya.`),
          h('p', {}, 'Buka lagi contohnya, lalu coba checkpoint dengan soal baru.')),
        barAksi(konteks.bukaContoh ? tombol('📖 Lihat contoh', konteks.bukaContoh, 'kedua') : null,
          tombol('Coba lagi ↻', () => jalankanCheckpoint(a))),
      );
      animasikan(wadah, 'anim-muncul');
    }
  }

  jalankan();
}
