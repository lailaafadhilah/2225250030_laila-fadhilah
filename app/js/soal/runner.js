// Menjalankan satu soal langkah demi langkah (F03).
// Langkah hanya maju saat siswa mengetuk tombol (EL04). Rumus selalu di atas langkah aktif (EL02).
import { h, tombol, barAksi } from '../ui/dom.js';
import { buatCerita, PERAN } from '../ui/visual.js';
import { inputRupiah, inputPersen } from '../ui/input-angka.js';
import { bukaLembar, tutupLembar } from '../ui/lembar.js';
import { formatRupiah } from '../core/format.js';
import { susunLangkah } from './langkah.js';
import { animasikan, konfeti } from '../ui/animasi.js';
import { suara } from '../ui/suara.js';

const LABEL_TANDA = ['hb', 'ongkos', 'hj', 'x'];

/**
 * @param {HTMLElement} wadah
 * @param {object} soal
 * @param {object} opsi { mode: "contoh"|"latihan"|"ujian", tampil: jumlah langkah yang sudah diisi (contoh rumpang),
 *                        konteks: { umpanBalik, catatSalah, bukaContoh }, onSelesai({ bintang, benar }) }
 */
export function jalankanSoal(wadah, soal, { mode = 'latihan', tampil = 0, konteks, onSelesai }) {
  const langkah = susunLangkah(soal, mode, { ketik: konteks.caraJawab === 'ketik' });
  const pesan = (kode) => konteks.umpanBalik[kode] || konteks.umpanBalik.UMUM;
  let idx = 0;
  let salahTotal = 0;
  let benarSemua = true;

  // Kartu situasi: gambar barang + cerita (F02)
  const perluTandai = soal.kenali === 'tandai' && mode !== 'contoh' && tampil === 0;
  const label = [];
  const cerita = buatCerita(soal.cerita, { mode: perluTandai ? 'netral' : 'warna', onKetuk: pilihLabel });
  const kartu = h('section', { class: 'kartu kartu-soal' },
    h('div', { class: 'ikon-barang', 'aria-hidden': 'true' }, soal.ikon || '🛍️'), cerita.el);
  const kotakRumus = h('div', { class: 'rumus' });
  const daftarSelesai = h('ol', { class: 'daftar-selesai', 'aria-label': 'Langkah yang sudah selesai' });
  const area = h('div', { class: 'langkah' });
  const bar = h('div');
  wadah.replaceChildren(kartu, kotakRumus, daftarSelesai, area, bar);

  let bolehTandai = false;
  function pilihLabel(i) {
    if (!bolehTandai) return;
    const isi = h('div', { class: 'pilih-label' }, LABEL_TANDA.map((p) => tombol(
      h('span', {}, PERAN[p].ikon, ' ', PERAN[p].label),
      () => { label[i] = p; cerita.aturLabel(i, p); tutupLembar(); },
      'kedua', { class: `btn btn-kedua btn-label peran-${p}-garis` })));
    bukaLembar(`Angka ${cerita.token[i].isi} adalah…`, isi);
  }

  function aturBar(kiri, kanan) { bar.replaceChildren(barAksi(kiri, kanan)); }
  function tombolContoh() {
    return mode === 'latihan' && konteks.bukaContoh ? tombol('📖 Lihat contoh', konteks.bukaContoh, 'kedua') : null;
  }

  function tampilkan() {
    if (idx >= langkah.length) return selesai();
    const L = langkah[idx];
    // Rumus yang berganti disorot sebentar agar siswa sadar ada rumus baru
    if (kotakRumus.dataset.rumus !== L.rumus && kotakRumus.dataset.rumus) animasikan(kotakRumus, 'anim-sorot');
    kotakRumus.dataset.rumus = L.rumus;
    kotakRumus.replaceChildren(h('span', { class: 'rumus-label' }, 'Rumus'), h('div', { class: 'rumus-isi' }, L.rumus));
    area.replaceChildren(
      h('p', { class: 'nomor-langkah' }, `Langkah ${idx + 1} dari ${langkah.length}`),
      h('h3', { class: 'judul-langkah', tabindex: '-1' }, L.judul),
    );
    const otomatis = mode === 'contoh' || idx < tampil || L.jenisInput === 'tampil';
    if (otomatis) tampilPenjelasan(L); else tampilInput(L);
    animasikan(area, 'anim-masuk');
    area.querySelector('.judul-langkah').focus({ preventScroll: true });
  }

  function tampilPenjelasan(L) {
    if (L.jenisInput !== 'tampil' && L.jenisInput !== 'tandai' && L.pertanyaan) area.append(h('p', { class: 'pertanyaan' }, L.pertanyaan));
    if (L.kode === 'kenali') cerita.warnai();
    area.append(L.visual ? L.visual() : '', h('p', { class: 'penjelasan' }, L.penjelasan));
    const kiri = mode === 'contoh' && idx > 0 ? tombol('↺ Ulangi', mundur, 'kedua') : tombolContoh();
    aturBar(kiri, tombol(idx === langkah.length - 1 && mode === 'contoh' ? 'Selesai ✔' : 'Lanjut ▶', () => maju(L)));
  }

  function maju(L) {
    daftarSelesai.append(h('li', {}, h('span', { class: 'centang', 'aria-hidden': 'true' }, '✔'), ' ', L.ringkas));
    idx += 1;
    tampilkan();
  }
  function mundur() {
    daftarSelesai.lastElementChild?.remove();
    idx -= 1;
    tampilkan();
  }

  function tampilInput(L) {
    if (L.pertanyaan) area.append(h('p', { class: 'pertanyaan' }, L.pertanyaan));
    const umpan = h('div', { class: 'umpan', role: 'status', 'aria-live': 'polite' });
    let baca;
    let kunciInput;
    let percobaan = 0;

    if (L.jenisInput === 'pilih') {
      let terpilih = null;
      const tombolOpsi = L.opsi.map((o) => h('button', {
        type: 'button', class: 'opsi', role: 'radio', 'aria-checked': 'false',
        onclick: (e) => {
          terpilih = o.nilai;
          tombolOpsi.forEach((b) => b.setAttribute('aria-checked', String(b === e.currentTarget)));
        },
      }, o.teks));
      area.append(h('div', { class: 'daftar-opsi', role: 'radiogroup' }, tombolOpsi));
      baca = () => terpilih;
      kunciInput = () => tombolOpsi.forEach((b) => { b.disabled = true; });
    } else if (L.jenisInput === 'rupiah' || L.jenisInput === 'persen') {
      const buat = L.jenisInput === 'rupiah' ? inputRupiah : inputPersen;
      const input = buat({ label: L.label, onEnter: () => cek() });
      area.append(input.el);
      if (L.catatan) area.append(h('p', { class: 'catatan-kecil' }, L.catatan));
      baca = input.nilai;
      kunciInput = input.kunci;
      setTimeout(() => input.fokus(), 50);
    } else if (L.jenisInput === 'keranjang') {
      const dipilih = new Set();
      let terakhir = null; // item yang baru masuk keranjang (dianimasikan)
      const total = h('b', {}, formatRupiah(0));
      const isiKeranjang = h('div', { class: 'keranjang-isi' });
      const perbarui = () => {
        let jumlah = 0;
        isiKeranjang.replaceChildren(...L.item.filter((it) => dipilih.has(it.kunci)).map((it) => {
          jumlah += it.nilai;
          return h('span', { class: `chip peran-${it.peran}${it.kunci === terakhir ? ' anim-pop' : ''}` }, PERAN[it.peran].ikon, ' ', formatRupiah(it.nilai));
        }));
        total.textContent = formatRupiah(jumlah);
        animasikan(total, 'anim-denyut');
      };
      const tombolItem = L.item.map((it) => h('button', {
        type: 'button', class: `opsi opsi-item peran-${it.peran}-garis`, 'aria-pressed': 'false',
        onclick: (e) => {
          if (dipilih.has(it.kunci)) { dipilih.delete(it.kunci); terakhir = null; } else { dipilih.add(it.kunci); terakhir = it.kunci; }
          e.currentTarget.setAttribute('aria-pressed', String(dipilih.has(it.kunci)));
          perbarui();
        },
      }, `${PERAN[it.peran].ikon} ${it.label} ${formatRupiah(it.nilai)}`));
      area.append(
        h('div', { class: 'daftar-opsi' }, tombolItem),
        h('div', { class: 'keranjang' }, h('p', {}, '🧺 Keranjang modal: ', total), isiKeranjang),
      );
      baca = () => [...dipilih];
      kunciInput = () => tombolItem.forEach((b) => { b.disabled = true; });
    } else if (L.jenisInput === 'tandai') {
      bolehTandai = true;
      cerita.el.classList.add('cerita-aktif');
      area.append(h('div', { class: 'legenda' }, LABEL_TANDA.map((p) => h('span', { class: `chip peran-${p}` }, PERAN[p].ikon, ' ', PERAN[p].label))));
      baca = () => cerita.token.map((_, i) => label[i] || null);
      kunciInput = () => { bolehTandai = false; cerita.el.classList.remove('cerita-aktif'); };
    }
    area.append(umpan);

    const tampilUmpan = (jenis, ...isi) => {
      umpan.replaceChildren(h('div', { class: `umpan-kotak umpan-${jenis}` }, ...isi));
      umpan.scrollIntoView({ block: 'nearest' }); // agar umpan balik tidak tertutup bar tombol
    };

    function cek() {
      const jawaban = baca();
      if (jawaban == null || (Array.isArray(jawaban) && L.jenisInput !== 'tandai' && jawaban.length === 0)) {
        tampilUmpan('info', pesan('KOSONG'));
        return;
      }
      const hasil = L.periksa(jawaban);
      if (L.jenisInput === 'tandai') cerita.tandaiSalah(hasil.salah || []);
      if (hasil.kode === 'T1') { tampilUmpan('info', pesan('T1')); return; }

      if (mode === 'ujian') {
        kunciInput();
        if (!hasil.benar) { benarSemua = false; konteks.catatSalah?.(hasil.kode); }
        if (L.kode === 'kenali') cerita.warnai();
        if (hasil.benar) suara.benar(); else suara.salah();
        if (hasil.benar) tampilUmpan('benar', '✔ Benar!');
        else tampilUmpan('salah', pesan(hasil.kode), h('p', { class: 'kunci' }, 'Jawaban yang benar: ', L.penjelasan));
        aturBar(null, tombol('Lanjut ▶', () => maju(L)));
        return;
      }

      if (hasil.benar) {
        suara.benar();
        kunciInput();
        if (L.kode === 'kenali') cerita.warnai();
        tampilUmpan('benar', h('p', {}, '✔ Benar! ', L.penjelasan), L.visual ? L.visual() : '');
        aturBar(tombolContoh(), tombol('Lanjut ▶', () => maju(L)));
      } else {
        suara.salah();
        salahTotal += 1;
        percobaan += 1;
        animasikan(area.querySelector('.opsi[aria-checked="true"]') || area.querySelector('.kolom-isi'), 'anim-goyang');
        konteks.catatSalah?.(hasil.kode);
        tampilUmpan('salah', h('p', {}, pesan(hasil.kode)),
          percobaan >= 2 && L.kode !== 'kenali' ? h('p', { class: 'petunjuk' }, '💡 Petunjuk: ', L.penjelasan) : '');
      }
    }
    aturBar(tombolContoh(), tombol('Cek ✔', cek));
  }

  function selesai() {
    kotakRumus.replaceChildren();
    if (mode === 'ujian') { onSelesai({ benar: benarSemua }); return; }
    if (mode === 'contoh') { onSelesai({}); return; }
    const bintang = salahTotal === 0 ? 3 : salahTotal <= 2 ? 2 : 1;
    area.replaceChildren(h('div', { class: 'hasil-soal' },
      h('p', { class: 'bintang', 'aria-label': `${bintang} bintang` },
        [0, 1, 2].map((i) => h('span', { style: `--i:${i}`, class: i < bintang ? 'bintang-penuh' : '' }, i < bintang ? '⭐' : '☆'))),
      h('p', {}, bintang === 3 ? 'Sempurna! Semua langkah benar.' : 'Bagus! Kamu berhasil menyelesaikannya.')));
    animasikan(area, 'anim-masuk');
    suara.bintang();
    if (bintang === 3) konfeti(18);
    aturBar(null, tombol('Lanjut ▶', () => onSelesai({ bintang })));
  }

  tampilkan();
}

/** Tampilan contoh terurai lengkap (untuk Buku Contoh & tombol "Lihat contoh"). */
export function contohPenuh(soal) {
  const cerita = buatCerita(soal.cerita, { mode: 'warna' });
  const langkah = susunLangkah(soal, 'contoh');
  return h('div', { class: 'contoh-penuh' },
    h('section', { class: 'kartu kartu-soal' }, h('div', { class: 'ikon-barang', 'aria-hidden': 'true' }, soal.ikon || '🛍️'), cerita.el),
    langkah.map((L, i) => h('section', { class: 'contoh-langkah' },
      h('p', { class: 'nomor-langkah' }, `Langkah ${i + 1}`),
      h('h3', {}, L.judul),
      h('div', { class: 'rumus rumus-kecil' }, L.rumus),
      L.visual ? L.visual() : '',
      h('p', { class: 'penjelasan' }, L.penjelasan))),
  );
}
