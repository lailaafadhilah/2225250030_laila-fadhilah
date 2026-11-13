// Komponen visual: cerita berwarna, papan Diketahui, susun kurang, pecahan.
import { h } from './dom.js';
import { uraiCerita } from '../core/cerita.js';
import { formatRupiah, formatRibuan, formatPersen } from '../core/format.js';
import { animasikan } from './animasi.js';

/** Peran angka: warna + ikon + label (selalu dipakai bersama, tidak hanya warna). */
export const PERAN = {
  hb: { ikon: '🛒', label: 'Harga beli' },
  modal: { ikon: '🛒', label: 'Modal' },
  ongkos: { ikon: '📦', label: 'Biaya tambahan' },
  hj: { ikon: '💰', label: 'Harga jual' },
  persen: { ikon: '％', label: 'Persentase' },
  ditanya: { ikon: '❓', label: 'Ditanya' },
  x: { ikon: '✖', label: 'Tidak dipakai' },
};

const kelasPeran = (peran) => `peran-${peran === 'modal' ? 'hb' : peran}`;

/** Satu label berwarna, mis. 🛒 Rp80.000 */
export function chip(peran, isi, label = null) {
  return h('span', { class: `chip ${kelasPeran(peran)}` },
    h('span', { 'aria-hidden': 'true' }, PERAN[peran].ikon), ' ',
    label && h('span', { class: 'chip-label' }, label + ': '),
    h('b', {}, isi));
}

/**
 * Kartu cerita. mode "warna" = token diberi warna perannya (signaling, EL05).
 * mode "netral" = token abu-abu dan bisa diketuk untuk diberi label (penanda cerita).
 */
export function buatCerita(teks, { mode = 'warna', onKetuk = null } = {}) {
  const daftarToken = [];
  const anak = uraiCerita(teks).map((bagian) => {
    if (bagian.jenis === 'teks') return bagian.isi;
    const i = daftarToken.length;
    const el = h('button', { type: 'button', class: 'token', onclick: () => onKetuk && onKetuk(i) }, bagian.isi);
    daftarToken.push({ peran: bagian.peran, isi: bagian.isi, el, label: null });
    return el;
  });
  const el = h('p', { class: 'cerita' }, anak);

  function warnai() {
    for (const [i, t] of daftarToken.entries()) {
      if (t.el.classList.contains('token-warna')) continue; // sudah berwarna, jangan dianimasikan ulang
      t.el.style.setProperty('--i', i); // angka menyala bergantian
      t.el.className = `token token-warna ${kelasPeran(t.peran)}`;
      t.el.disabled = true;
      t.el.replaceChildren(h('span', { 'aria-hidden': 'true' }, PERAN[t.peran].ikon + ' '), t.isi);
      t.el.setAttribute('aria-label', `${PERAN[t.peran].label}: ${t.isi}`);
    }
  }
  function aturLabel(i, label) {
    const t = daftarToken[i];
    t.label = label;
    t.el.className = `token token-netral token-berlabel ${kelasPeran(label)}`;
    t.el.replaceChildren(h('span', { 'aria-hidden': 'true' }, PERAN[label].ikon + ' '), t.isi);
    t.el.setAttribute('aria-label', `${t.isi}, dilabeli ${PERAN[label].label}`);
    animasikan(t.el, 'anim-denyut');
  }
  function tandaiSalah(indeks) {
    daftarToken.forEach((t, i) => t.el.classList.toggle('token-salah', indeks.includes(i)));
  }

  if (mode === 'warna') warnai();
  else daftarToken.forEach((t) => { t.el.className = 'token token-netral'; t.el.setAttribute('aria-label', `${t.isi}, ketuk untuk memberi label`); });

  return { el, token: daftarToken, warnai, aturLabel, tandaiSalah };
}

/** Papan "Diketahui – Ditanya" (F08). */
export function papanDiketahui(soal) {
  const isi = [];
  if (soal.hb != null) isi.push(chip(soal.ditanya === 'hj' ? 'modal' : 'hb', formatRupiah(soal.hb), soal.ditanya === 'hj' ? 'Modal' : 'Harga beli'));
  for (const o of soal.ongkos || []) isi.push(chip('ongkos', formatRupiah(o.nilai), o.nama));
  if (soal.hj != null && soal.ditanya !== 'hj') isi.push(chip('hj', formatRupiah(soal.hj), 'Harga jual'));
  if (soal.persen != null && soal.jenis) isi.push(chip('persen', formatPersen(soal.persen), soal.jenis === 'rugi' ? 'Rugi' : 'Untung'));
  const ditanya = {
    kenali: 'Untung atau rugi?',
    selisih: 'Untung atau rugi, berapa besarnya?',
    persen: 'Persentase untung atau rugi',
    hj: 'Harga jual',
    modal: 'Modal',
  }[soal.ditanya];
  return h('div', { class: 'papan' },
    h('p', { class: 'papan-judul' }, 'Diketahui'),
    h('div', { class: 'papan-isi' }, isi),
    h('p', { class: 'papan-judul' }, 'Ditanya'),
    h('div', { class: 'papan-isi' }, chip('ditanya', ditanya)),
  );
}

/** Pengurangan bersusun: atas − bawah = hasil (EL02: angka berdekatan). */
export function visualKurang(atas, bawah, hasil, jenis) {
  const baris = (peran, nilai, tanda = '') => h('div', { class: 'susun-baris' },
    h('span', { class: 'susun-tanda' }, tanda),
    h('span', { class: `susun-angka ${kelasPeran(peran)}-teks` }, h('span', { 'aria-hidden': 'true' }, PERAN[peran].ikon + ' '), formatRupiah(nilai)));
  return h('div', { class: 'visual-kurang', 'aria-label': `${formatRupiah(atas.nilai)} dikurangi ${formatRupiah(bawah.nilai)} sama dengan ${formatRupiah(hasil)}` },
    baris(atas.peran, atas.nilai),
    baris(bawah.peran, bawah.nilai, '−'),
    h('div', { class: 'susun-garis' }),
    h('div', { class: 'susun-baris susun-hasil' },
      h('span', { class: 'susun-tanda' }, ''),
      h('span', { class: 'susun-angka' }, formatRupiah(hasil), ' ', h('span', { class: `lencana-jenis jenis-${jenis}` }, jenis === 'rugi' ? '⬇️ rugi' : '⬆️ untung'))),
  );
}

function fpb(a, b) { return b === 0 ? a : fpb(b, a % b); }

/** Pecahan: selisih / modal × 100% = persen, dengan bentuk sederhananya. */
export function visualPecahan(selisih, modal, persen, labelAtas = 'untung') {
  const g = fpb(selisih, modal);
  const sederhana = g > 1 && modal / g <= 1000;
  const pecahan = (atas, bawah, kelasAtas = '', kelasBawah = '') => h('span', { class: 'pecahan' },
    h('span', { class: `pecahan-atas ${kelasAtas}` }, atas),
    h('span', { class: `pecahan-bawah ${kelasBawah}` }, bawah));
  return h('div', { class: 'visual-pecahan', 'aria-label': `${formatRibuan(selisih)} dibagi ${formatRibuan(modal)} kali 100 persen sama dengan ${formatPersen(persen)}` },
    pecahan(formatRibuan(selisih), formatRibuan(modal), '', 'peran-hb-teks'),
    sederhana && h('span', {}, ' = '),
    sederhana && pecahan(String(selisih / g), String(modal / g)),
    h('span', {}, ' × 100% = '),
    h('b', { class: 'hasil-persen' }, formatPersen(persen)),
    h('p', { class: 'catatan-kecil' }, `atas: ${labelAtas} · bawah: 🛒 modal`),
  );
}
