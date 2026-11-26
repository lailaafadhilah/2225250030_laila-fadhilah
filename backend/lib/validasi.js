// Validasi & pembersihan input siswa sebelum dikirim ke Gemini.
import { BATAS } from './konfigurasi.js';

/** Jenis bantuan yang boleh diminta (harus sama dengan app/content/tutor.json). */
export const MODE = ['tanya', 'petunjuk', 'langkah', 'contoh'];

/** Kesalahan input yang aman ditampilkan ke siswa. */
export class GalatInput extends Error {
  constructor(kode, pesan, status = 400) {
    super(pesan);
    this.kode = kode;
    this.status = status;
  }
}

/** Menghapus karakter kontrol & spasi berlebih. */
function rapikan(teks) {
  return teks
    .replace(/[\u0000-\u0008\u000B\u000C\u000E-\u001F\u007F]/g, '')
    .replace(/[ \t]+/g, ' ')
    .replace(/\n{3,}/g, '\n\n')
    .trim();
}

/**
 * Menyamarkan data pribadi yang mungkin tidak sengaja ditulis siswa
 * (email, nomor HP/telepon, NIK/NISN panjang) agar tidak terkirim ke Gemini.
 */
export function samarkanDataPribadi(teks) {
  return teks
    .replace(/[\w.+-]+@[\w-]+\.[\w.-]+/g, '[disembunyikan]')
    .replace(/(?:\+62|62|0)8[\d\s-]{7,14}\d/g, '[disembunyikan]')
    .replace(/\b\d{10,}\b/g, '[disembunyikan]');
}

function teksBersih(nilai, maks, nama) {
  if (typeof nilai !== 'string') throw new GalatInput('INPUT_TIDAK_VALID', `${nama} harus berupa teks.`);
  const hasil = samarkanDataPribadi(rapikan(nilai));
  if (hasil.length > maks) {
    throw new GalatInput('PESAN_TERLALU_PANJANG', `Pesanmu terlalu panjang. Maksimal ${maks} huruf, ya.`);
  }
  return hasil;
}

/**
 * Memeriksa badan permintaan { pesan, mode, riwayat }.
 * Mengembalikan data yang sudah bersih, atau melempar GalatInput.
 */
export function periksaPermintaan(badan) {
  if (!badan || typeof badan !== 'object' || Array.isArray(badan)) {
    throw new GalatInput('INPUT_TIDAK_VALID', 'Format permintaan tidak dikenali.');
  }
  const pesan = teksBersih(badan.pesan, BATAS.panjangPesan, 'Pesan');
  if (!pesan) throw new GalatInput('PESAN_KOSONG', 'Tulis dulu pertanyaanmu, ya.');

  const mode = badan.mode ?? 'tanya';
  if (!MODE.includes(mode)) throw new GalatInput('INPUT_TIDAK_VALID', 'Jenis bantuan tidak dikenali.');

  const riwayatMentah = badan.riwayat ?? [];
  if (!Array.isArray(riwayatMentah)) throw new GalatInput('INPUT_TIDAK_VALID', 'Riwayat percakapan tidak valid.');
  const riwayat = riwayatMentah.slice(-BATAS.jumlahRiwayat).map((g) => {
    if (!g || !['siswa', 'tutor'].includes(g.peran)) throw new GalatInput('INPUT_TIDAK_VALID', 'Riwayat percakapan tidak valid.');
    return { peran: g.peran, teks: teksBersih(g.teks, BATAS.panjangRiwayat, 'Riwayat') };
  }).filter((g) => g.teks);

  return { pesan, mode, riwayat };
}
