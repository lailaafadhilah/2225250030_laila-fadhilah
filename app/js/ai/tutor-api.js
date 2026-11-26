// Mengirim pertanyaan siswa ke backend AI Tutor dan menerjemahkan semua kemungkinan galat.
// Tidak ada data pribadi (nama/kelas/progres) yang dikirim, hanya teks pertanyaan.
import { ALAMAT_TUTOR, TUTOR_SIAP, PANJANG_PESAN_MAKS, JUMLAH_RIWAYAT } from './konfigurasi.js';

const WAKTU_TUNGGU = 30_000;

/** Pesan galat sisi aplikasi (sebelum/tanpa jawaban server). */
export const PESAN_GALAT = {
  OFFLINE: 'Kamu sedang offline. AI Tutor butuh internet. Menu lain tetap bisa dipakai, ya!',
  BELUM_SIAP: 'AI Tutor belum dihubungkan ke server oleh pengelola aplikasi.',
  WAKTU_HABIS: 'Kak Profit butuh waktu terlalu lama untuk menjawab. Coba lagi, ya.',
  SERVER_TAK_TERJANGKAU: 'Server AI Tutor tidak bisa dihubungi. Periksa internetmu, lalu coba lagi.',
  GANGGUAN: 'Maaf, Kak Profit sedang mengalami gangguan. Coba lagi, ya.',
  PESAN_KOSONG: 'Tulis dulu pertanyaanmu, ya.',
  PESAN_TERLALU_PANJANG: `Pesanmu terlalu panjang. Maksimal ${PANJANG_PESAN_MAKS} huruf, ya.`,
};

/**
 * @param {{ pesan: string, mode: string, riwayat: {peran: 'siswa'|'tutor', teks: string}[] }} data
 * @returns {Promise<{ ok: true, teks: string } | { ok: false, kode: string, pesan: string }>}
 */
export async function tanyaTutor({ pesan, mode, riwayat }) {
  const gagal = (kode, teks) => ({ ok: false, kode, pesan: teks || PESAN_GALAT[kode] || PESAN_GALAT.GANGGUAN });
  const bersih = (pesan || '').trim();
  if (!bersih) return gagal('PESAN_KOSONG');
  if (bersih.length > PANJANG_PESAN_MAKS) return gagal('PESAN_TERLALU_PANJANG');
  if (!TUTOR_SIAP) return gagal('BELUM_SIAP');
  if (!navigator.onLine) return gagal('OFFLINE');

  const kendali = new AbortController();
  const penghitung = setTimeout(() => kendali.abort(), WAKTU_TUNGGU);
  try {
    const respon = await fetch(ALAMAT_TUTOR, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ pesan: bersih, mode, riwayat: riwayat.slice(-JUMLAH_RIWAYAT) }),
      signal: kendali.signal,
      credentials: 'omit',
    });
    let isi = null;
    try { isi = await respon.json(); } catch { /* bukan JSON */ }
    if (respon.ok && isi?.ok && typeof isi.teks === 'string') return { ok: true, teks: isi.teks };
    return gagal(isi?.kode || 'GANGGUAN', isi?.pesan);
  } catch (err) {
    if (err?.name === 'AbortError') return gagal('WAKTU_HABIS');
    return gagal(navigator.onLine ? 'SERVER_TAK_TERJANGKAU' : 'OFFLINE');
  } finally {
    clearTimeout(penghitung);
  }
}
