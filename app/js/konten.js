// Memuat berkas konten JSON (sekali saja, lalu disimpan di memori).
const tembolok = new Map();

function ambil(berkas) {
  if (!tembolok.has(berkas)) {
    tembolok.set(berkas, fetch(`content/${berkas}`).then((r) => {
      if (!r.ok) throw new Error(`Gagal memuat ${berkas}`);
      return r.json();
    }));
  }
  return tembolok.get(berkas);
}

export const muatDaftarWilayah = () => ambil('wilayah.json').then((d) => d.wilayah);
export const muatWilayah = (id) => ambil(`wilayah-${id}.json`);
export const muatIstilah = () => ambil('istilah.json').then((d) => d.istilah);
export const muatUmpanBalik = () => ambil('umpan-balik.json').then((d) => d.pesan);
export const muatBank = () => ambil('bank-soal.json').then((d) => d.soal);
export const muatMateri = () => ambil('materi.json').then((d) => d.bab);
export const muatTutor = () => ambil('tutor.json');

/** Memuat semua wilayah sekaligus (untuk Buku Contoh). */
export async function muatSemuaWilayah() {
  const daftar = await muatDaftarWilayah();
  return Promise.all(daftar.map((w) => muatWilayah(w.id)));
}
