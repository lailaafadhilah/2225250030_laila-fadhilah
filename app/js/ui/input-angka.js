// Input angka ramah HP (F09): keyboard numerik, titik ribuan otomatis.
import { h } from './dom.js';
import { bacaRupiah, bacaPersen, formatRibuan } from '../core/format.js';

/** Input rupiah. Mengembalikan { el, nilai(), kunci(), fokus() }. */
export function inputRupiah({ label = 'Jawabanmu', onEnter } = {}) {
  const input = h('input', {
    type: 'text', inputmode: 'numeric', autocomplete: 'off', class: 'input-angka',
    'aria-label': label, placeholder: '0',
  });
  input.addEventListener('input', () => {
    const n = bacaRupiah(input.value);
    input.value = n == null ? '' : formatRibuan(n);
  });
  input.addEventListener('keydown', (e) => { if (e.key === 'Enter' && onEnter) onEnter(); });
  const el = h('label', { class: 'kolom-angka' }, h('span', { class: 'kolom-label' }, label),
    h('span', { class: 'kolom-isi' }, h('span', { class: 'imbuhan' }, 'Rp'), input));
  return { el, nilai: () => bacaRupiah(input.value), kunci: () => { input.disabled = true; }, fokus: () => input.focus() };
}

/** Input persen (boleh koma desimal). */
export function inputPersen({ label = 'Jawabanmu', onEnter } = {}) {
  const input = h('input', {
    type: 'text', inputmode: 'decimal', autocomplete: 'off', class: 'input-angka',
    'aria-label': label, placeholder: '0',
  });
  input.addEventListener('input', () => { input.value = input.value.replace(/[^\d.,]/g, ''); });
  input.addEventListener('keydown', (e) => { if (e.key === 'Enter' && onEnter) onEnter(); });
  const el = h('label', { class: 'kolom-angka' }, h('span', { class: 'kolom-label' }, label),
    h('span', { class: 'kolom-isi' }, input, h('span', { class: 'imbuhan' }, '%')));
  return { el, nilai: () => bacaPersen(input.value), kunci: () => { input.disabled = true; }, fokus: () => input.focus() };
}
