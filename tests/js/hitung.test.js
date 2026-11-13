// Jalankan: node --test tests/js
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import {
  hitungModal, tentukanJenis, hitungSelisih, hitungPersen,
  hargaJualDariPersen, modalDariHargaJual,
} from '../../app/js/core/hitung.js';
import { formatRupiah, formatPersen, bacaRupiah, bacaPersen } from '../../app/js/core/format.js';
import { diagnosaPersen, diagnosaSelisih, diagnosaKeranjang } from '../../app/js/core/diagnosa.js';

const vektor = JSON.parse(readFileSync(new URL('../test-vectors.json', import.meta.url), 'utf8'));

test('untung–rugi sesuai test vector', () => {
  for (const k of vektor.untung_rugi) {
    const modal = hitungModal(k.hb, k.ongkos);
    assert.equal(modal, k.modal);
    assert.equal(tentukanJenis(modal, k.hj), k.jenis);
    const selisih = hitungSelisih(modal, k.hj);
    assert.equal(selisih, k.selisih);
    assert.equal(hitungPersen(selisih, modal), k.persen, `persen untuk ${JSON.stringify(k)}`);
  }
});

test('harga jual & modal dari persen', () => {
  for (const k of vektor.harga_jual_dari_persen) assert.equal(hargaJualDariPersen(k.modal, k.persen, k.jenis), k.hj);
  for (const k of vektor.modal_dari_harga_jual) assert.equal(modalDariHargaJual(k.hj, k.persen, k.jenis), k.modal);
});

test('format rupiah & persen', () => {
  for (const k of vektor.format) {
    assert.equal(formatRupiah(k.angka), k.rupiah);
    assert.equal(formatPersen(k.persen_masuk), k.persen);
    assert.equal(bacaRupiah(k.rupiah), k.angka);
  }
  assert.equal(bacaPersen('12,5%'), 12.5);
  assert.equal(bacaPersen('abc'), null);
});

test('diagnosa miskonsepsi', () => {
  const soal = { hb: 36000, ongkos: [{ nama: 'ongkos kirim', nilai: 4000 }], hj: 50000, ditanya: 'persen' };
  assert.equal(diagnosaPersen(soal, 25).benar, true);
  assert.equal(diagnosaPersen(soal, 20).kode, 'M1');      // dibagi harga jual
  assert.equal(diagnosaPersen(soal, 38.89).kode, 'M2');   // lupa ongkos
  assert.equal(diagnosaPersen(soal, 0.25).kode, 'M4');    // lupa × 100
  assert.equal(diagnosaSelisih(soal, 14000).kode, 'M2');
  assert.equal(diagnosaKeranjang(soal, ['hb']).kode, 'M2');
  assert.equal(diagnosaKeranjang(soal, ['hb', 'ongkos-0']).benar, true);
});
