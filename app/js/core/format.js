// Format angka sesuai kebiasaan Indonesia. FUNGSI MURNI.

/** 12500 → "12.500" */
export function formatRibuan(n) {
  const tanda = n < 0 ? '-' : '';
  return tanda + String(Math.abs(Math.round(n))).replace(/\B(?=(\d{3})+(?!\d))/g, '.');
}

/** 12500 → "Rp12.500" */
export function formatRupiah(n) {
  return 'Rp' + formatRibuan(n);
}

/** 12.5 → "12,5%"; 20 → "20%" (maks. 2 angka di belakang koma) */
export function formatPersen(x) {
  const bulat = Math.round(x * 100) / 100;
  return String(bulat).replace('.', ',') + '%';
}

/** "Rp12.500" atau "12.500" → 12500. Mengembalikan null jika kosong. */
export function bacaRupiah(teks) {
  const angka = String(teks).replace(/\D/g, '');
  return angka === '' ? null : Number(angka);
}

/** "12,5" atau "12.5" atau "12,5%" → 12.5. Mengembalikan null jika tidak valid. */
export function bacaPersen(teks) {
  const bersih = String(teks).replace('%', '').trim().replace(',', '.');
  if (bersih === '' || !/^\d+(\.\d+)?$/.test(bersih)) return null;
  return Number(bersih);
}
