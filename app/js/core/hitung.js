// Rumus inti untung–rugi. FUNGSI MURNI: tanpa DOM, tanpa storage.
// Padanannya di Python: tools/profit_core.py (harus memberi hasil identik).

/** Modal = harga beli + semua biaya tambahan. */
export function hitungModal(hargaBeli, biayaTambahan = 0) {
  const ongkos = Array.isArray(biayaTambahan)
    ? biayaTambahan.reduce((jumlah, b) => jumlah + (typeof b === 'number' ? b : b.nilai), 0)
    : biayaTambahan;
  return hargaBeli + ongkos;
}

/** "untung" jika harga jual > modal, "rugi" jika lebih kecil, "impas" jika sama. */
export function tentukanJenis(modal, hargaJual) {
  if (hargaJual > modal) return 'untung';
  if (hargaJual < modal) return 'rugi';
  return 'impas';
}

/** Besar untung atau rugi (selalu bernilai positif atau nol). */
export function hitungSelisih(modal, hargaJual) {
  return Math.abs(hargaJual - modal);
}

/** Persentase untung/rugi TERHADAP MODAL, dibulatkan 2 angka di belakang koma. */
export function hitungPersen(selisih, modal) {
  if (modal <= 0) throw new Error('Modal harus lebih dari 0');
  return Math.round((selisih * 10000) / modal) / 100;
}

/** Harga jual jika modal dan persentase untung/rugi diketahui. */
export function hargaJualDariPersen(modal, persen, jenis) {
  const faktor = jenis === 'rugi' ? 100 - persen : 100 + persen;
  return Math.round((modal * faktor) / 100);
}

/** Modal jika harga jual dan persentase untung/rugi diketahui. */
export function modalDariHargaJual(hargaJual, persen, jenis) {
  const faktor = jenis === 'rugi' ? 100 - persen : 100 + persen;
  return Math.round((hargaJual * 100) / faktor);
}

/** Menghitung semua kunci jawaban dari satu objek soal. */
export function kunciSoal(soal) {
  const ongkos = soal.ongkos || [];
  if (soal.ditanya === 'hj') {
    const modal = hitungModal(soal.hb, ongkos);
    return { modal, jenis: soal.jenis, hj: hargaJualDariPersen(modal, soal.persen, soal.jenis) };
  }
  if (soal.ditanya === 'modal') {
    const modal = modalDariHargaJual(soal.hj, soal.persen, soal.jenis);
    return { modal, jenis: soal.jenis, hj: soal.hj };
  }
  const modal = hitungModal(soal.hb, ongkos);
  const selisih = hitungSelisih(modal, soal.hj);
  return {
    modal,
    jenis: tentukanJenis(modal, soal.hj),
    selisih,
    persen: hitungPersen(selisih, modal),
  };
}
