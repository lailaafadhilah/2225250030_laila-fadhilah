// Semua pengaturan backend dibaca dari environment variable (bukan ditulis di kode).

/** Asal (origin) frontend yang boleh memanggil backend. */
const ASAL_BAWAAN = ['https://lailaafadhilah.github.io'];

/** Asal tambahan untuk uji di laptop (hanya dipakai bila IZINKAN_LOKAL=1). */
const ASAL_LOKAL = ['http://localhost:8000', 'http://127.0.0.1:8000', 'http://localhost:8765'];

export function asalDiizinkan(env = process.env) {
  const tambahan = (env.ALLOWED_ORIGINS || '').split(',').map((s) => s.trim()).filter(Boolean);
  const lokal = env.IZINKAN_LOKAL === '1' ? ASAL_LOKAL : [];
  return [...new Set([...ASAL_BAWAAN, ...tambahan, ...lokal])];
}

/**
 * Daftar model yang dicoba berurutan. Model pertama bisa diganti lewat GEMINI_MODEL.
 * Alias "-latest" otomatis mengikuti versi terbaru dari Google, jadi tidak cepat usang.
 * Flash-Lite dipilih sebagai bawaan karena kuota Free Tier-nya paling longgar.
 */
export function daftarModel(env = process.env) {
  const pilihan = (env.GEMINI_MODEL || '').trim();
  return [...new Set([pilihan, 'gemini-flash-lite-latest', 'gemini-flash-latest'].filter(Boolean))];
}

export const BATAS = {
  /** Ukuran badan permintaan maksimal (byte). */
  ukuranBadan: 12_000,
  /** Panjang pesan siswa maksimal (karakter). */
  panjangPesan: 500,
  /** Jumlah giliran riwayat yang ikut dikirim (agar hemat token). */
  jumlahRiwayat: 6,
  /** Panjang satu giliran riwayat maksimal (karakter). */
  panjangRiwayat: 1500,
  /** Batas per alamat IP. */
  perMenitIp: 6,
  perHariIp: 80,
  /** Batas seluruh pengguna per instans server (melindungi kuota Free Tier). */
  perMenitTotal: 30,
  /** Waktu tunggu jawaban Gemini (milidetik). */
  waktuTunggu: 25_000,
};
