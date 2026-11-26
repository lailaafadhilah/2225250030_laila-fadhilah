// Alamat backend AI Tutor (Vercel). BUKAN rahasia: kunci API hanya ada di server Vercel.
// Setelah deploy ke Vercel, ganti alamat di bawah dengan alamat proyek Vercel kamu.
const ALAMAT_PRODUKSI = 'https://2225250030laila-fadhilah-backend.vercel.app/api/tutor';

/** Saat aplikasi dibuka dari laptop (localhost), pakai backend lokal (npm run dev). */
const ALAMAT_LOKAL = 'http://localhost:3000/api/tutor';

const diLaptop = ['localhost', '127.0.0.1'].includes(location.hostname);

export const ALAMAT_TUTOR = diLaptop ? ALAMAT_LOKAL : ALAMAT_PRODUKSI;

/** false bila alamat produksi belum diganti (AI Tutor menampilkan pemberitahuan). */
export const TUTOR_SIAP = diLaptop || !ALAMAT_PRODUKSI.includes('GANTI-NAMA-PROYEK');

/** Harus sama dengan BATAS.panjangPesan di backend/lib/konfigurasi.js. */
export const PANJANG_PESAN_MAKS = 500;

/** Jumlah giliran riwayat yang ikut dikirim (sama dengan backend). */
export const JUMLAH_RIWAYAT = 6;
