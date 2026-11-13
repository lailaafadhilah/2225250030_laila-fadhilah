// Simulasi Jual Beli: siswa menjadi pedagang, mengatur harga dengan tombol (tanpa mengetik),
// dan langsung melihat modal, untung/rugi, persentase, serta batang perbandingan (literasi: menafsirkan).
import { h, tombol, acak } from '../ui/dom.js';
import { hitungModal, tentukanJenis, hitungSelisih, hitungPersen } from '../core/hitung.js';
import { formatRupiah as rp, formatPersen as pc, formatRibuan } from '../core/format.js';
import { visualPecahan } from '../ui/visual.js';
import { konfeti, animasikan } from '../ui/animasi.js';
import { suara } from '../ui/suara.js';
import * as progres from '../state/progres.js';

const ambil = (berkas) => fetch(`content/${berkas}`).then((r) => r.json());
const labelLangkah = (n) => `${n > 0 ? '+' : '−'}${Math.abs(n) >= 1000 ? `${Math.abs(n) / 1000}rb` : Math.abs(n)}`;

export async function layarSimulasi(akar, _param, app) {
  app.aturJudul('🏪 Simulasi', { kembali: '#beranda' });
  app.aturTema(['#7CC27A', '#3F9A5B']);
  const data = await ambil('simulasi.json');
  const p = progres.muat();

  let barang = data.barang[0];
  const nilai = { hb: barang.hb, ongkos: barang.ongkos, hj: barang.hj };
  let tantangan = acak(data.tantangan)[0];
  let sudahBerhasil = false;

  const pemilih = h('div', { class: 'sim-pemilih', role: 'radiogroup', 'aria-label': 'Pilih barang' });
  const kartuBarang = h('div', { class: 'kartu sim-barang' });
  const baris = {};
  const hasil = h('section', { class: 'kartu sim-hasil', 'aria-live': 'polite' });
  const kotakTantangan = h('section', { class: 'kartu sim-tantangan' });

  function gambarPemilih() {
    pemilih.replaceChildren(...data.barang.map((b) => h('button', {
      type: 'button', class: 'sim-chip', role: 'radio', 'aria-checked': String(b === barang),
      onclick: () => { barang = b; Object.assign(nilai, { hb: b.hb, ongkos: b.ongkos, hj: b.hj }); gambarSemua(); },
    }, h('span', { 'aria-hidden': 'true' }, b.ikon), b.nama)));
  }

  function buatBaris(kunci, peran, label, ikon) {
    const angka = h('b', { class: `sim-angka peran-${peran}-teks` });
    const el = h('div', { class: `sim-baris sim-${peran}` },
      h('div', { class: 'sim-label' }, h('span', { 'aria-hidden': 'true' }, ikon), ` ${label}`), angka,
      h('div', { class: 'sim-tombol' }, data.langkah[kunci].map((n) => h('button', {
        type: 'button', class: 'sim-langkah', 'aria-label': `${label} ${labelLangkah(n)}`,
        onclick: () => {
          const min = kunci === 'hb' ? 1000 : 0;
          nilai[kunci] = Math.max(min, nilai[kunci] + n);
          animasikan(angka, 'anim-denyut');
          gambarHasil();
        },
      }, labelLangkah(n)))));
    baris[kunci] = { el, angka };
    return el;
  }

  function gambarHasil() {
    for (const k of ['hb', 'ongkos', 'hj']) baris[k].angka.textContent = rp(nilai[k]);
    const modal = hitungModal(nilai.hb, nilai.ongkos);
    const jenis = tentukanJenis(modal, nilai.hj);
    const selisih = hitungSelisih(modal, nilai.hj);
    const persen = hitungPersen(selisih, modal);
    const skala = Math.max(modal, nilai.hj) || 1;

    hasil.replaceChildren(
      h('p', { class: 'sim-modal' }, '🛒 Modal = ', rp(nilai.hb), ' + ', rp(nilai.ongkos), ' = ', h('b', {}, rp(modal))),
      h('div', { class: 'sim-batang', 'aria-hidden': 'true' },
        h('div', { class: 'sim-batang-baris' }, h('span', {}, 'Modal'),
          h('div', { class: 'sim-batang-jalur' }, h('div', { class: 'sim-isi isi-modal', style: `width:${(modal / skala) * 100}%` }))),
        h('div', { class: 'sim-batang-baris' }, h('span', {}, 'Jual'),
          h('div', { class: 'sim-batang-jalur' }, h('div', { class: `sim-isi isi-${jenis}`, style: `width:${(nilai.hj / skala) * 100}%` })))),
      h('p', { class: `sim-status status-${jenis}` },
        jenis === 'untung' ? '⬆️ UNTUNG' : jenis === 'rugi' ? '⬇️ RUGI' : '🟰 IMPAS',
        jenis !== 'impas' ? ` ${rp(selisih)}` : ''),
      jenis !== 'impas'
        ? h('div', {}, h('p', { class: 'catatan-kecil' }, `Persentase ${jenis} = ${jenis} ÷ modal × 100%`), visualPecahan(selisih, modal, persen, jenis))
        : h('p', { class: 'catatan-kecil' }, 'Harga jual sama dengan modal: tidak untung, tidak rugi.'),
    );
    cekTantangan(jenis, persen);
  }

  function teksTantangan(t) {
    if (t.jenis === 'impas') return 'Atur harga jual supaya IMPAS (tidak untung, tidak rugi).';
    return `Atur harga supaya ${t.jenis.toUpperCase()} tepat ${pc(t.persen)}.`;
  }

  function cekTantangan(jenis, persen) {
    const kena = jenis === tantangan.jenis && (jenis === 'impas' || persen === tantangan.persen);
    if (kena && !sudahBerhasil) {
      sudahBerhasil = true;
      p.simulasi_berhasil = (p.simulasi_berhasil || 0) + 1;
      progres.simpan();
      suara.menang();
      konfeti(40);
    }
    if (!kena) sudahBerhasil = false;
    kotakTantangan.replaceChildren(
      h('p', { class: 'sim-tantangan-judul' }, '🎯 Tantangan'),
      h('p', {}, teksTantangan(tantangan)),
      h('p', { class: 'catatan-kecil' }, '💡 Tips: buat modal angka bulat dulu (misalnya Rp20.000), baru atur harga jualnya.'),
      kena ? h('p', { class: 'umpan-kotak umpan-benar' }, `✔ Berhasil! Kamu pedagang cerdas. (Berhasil ${p.simulasi_berhasil || 0}×)`) : null,
      tombol('🎲 Tantangan lain', () => {
        const lain = data.tantangan.filter((t) => t !== tantangan);
        tantangan = acak(lain)[0];
        sudahBerhasil = false;
        gambarHasil();
      }, 'kedua', { class: 'btn btn-kedua btn-lebar' }),
    );
  }

  function gambarSemua() {
    gambarPemilih();
    kartuBarang.replaceChildren(
      h('span', { class: 'sim-ikon', 'aria-hidden': 'true' }, barang.ikon),
      h('div', {}, h('b', {}, `Kamu menjual ${barang.nama.toLowerCase()}`), h('p', { class: 'catatan-kecil' }, 'Ketuk tombol untuk mengubah harga.')));
    gambarHasil();
  }

  akar.replaceChildren(h('div', { class: 'simulasi' },
    pemilih, kartuBarang,
    h('section', { class: 'kartu' },
      buatBaris('hb', 'hb', 'Harga beli', '🛒'),
      buatBaris('ongkos', 'ongkos', 'Biaya tambahan', '📦'),
      buatBaris('hj', 'hj', 'Harga jual', '💰')),
    hasil, kotakTantangan,
    h('p', { class: 'catatan-kecil' }, `Ingat: persentase selalu dibagi modal. Angka dalam ribuan: ${formatRibuan(1000)} = 1rb.`),
  ));
  gambarSemua();
}
