// Mengurai teks cerita bertoken. FUNGSI MURNI.
// Format token: [[peran:teks]], contoh "[[hb:Rp80.000]]".
// Peran: hb (harga beli), ongkos (biaya tambahan), hj (harga jual), persen, x (pengecoh/tidak dipakai).

const POLA_TOKEN = /\[\[(hb|ongkos|hj|persen|x):([^\]]+)\]\]/g;

/** "A [[hb:Rp5.000]] B" → [{jenis:'teks',isi:'A '}, {jenis:'token',peran:'hb',isi:'Rp5.000'}, {jenis:'teks',isi:' B'}] */
export function uraiCerita(teks) {
  const hasil = [];
  let terakhir = 0;
  for (const cocok of teks.matchAll(POLA_TOKEN)) {
    if (cocok.index > terakhir) hasil.push({ jenis: 'teks', isi: teks.slice(terakhir, cocok.index) });
    hasil.push({ jenis: 'token', peran: cocok[1], isi: cocok[2] });
    terakhir = cocok.index + cocok[0].length;
  }
  if (terakhir < teks.length) hasil.push({ jenis: 'teks', isi: teks.slice(terakhir) });
  return hasil;
}

/** Hanya daftar token (berurutan). */
export function tokenCerita(teks) {
  return uraiCerita(teks).filter((b) => b.jenis === 'token');
}

/** Teks polos tanpa tanda token (untuk pembaca layar / ringkasan). */
export function ceritaPolos(teks) {
  return uraiCerita(teks).map((b) => b.isi).join('');
}
