// Logika endpoint /api/tutor. Dipisah dari berkas api/ agar mudah diuji tanpa Vercel.
import { BATAS, asalDiizinkan, daftarModel } from './konfigurasi.js';
import { headerCors, jawabJson } from './cors.js';
import { periksaPermintaan, GalatInput } from './validasi.js';
import { buatPembatas, ipKlien } from './pembatas.js';
import { tanyaGemini, buatKlienGemini, GalatTutor } from './gemini.js';

const PESAN_TERLALU_CEPAT = {
  TERLALU_CEPAT: 'Pelan-pelan, ya. Tunggu sebentar sebelum bertanya lagi.',
  RAMAI: 'Kak Profit sedang menjawab banyak teman. Coba lagi sebentar lagi, ya.',
  BATAS_HARIAN: 'Kamu sudah banyak bertanya hari ini. Lanjutkan besok, ya!',
};

/**
 * Membuat fungsi penanganan permintaan.
 * deps (opsional, untuk uji): { env, klien, pembatas }
 */
export function buatPenangan(deps = {}) {
  const env = deps.env || process.env;
  const daftarAsal = asalDiizinkan(env);
  const cekBatas = deps.pembatas || buatPembatas(BATAS);
  let klien = deps.klien || null;

  return async function tangani(request) {
    const asal = request.headers.get('origin');
    const cors = headerCors(asal, daftarAsal);
    const galat = (status, kode, pesan, tambahan = {}) => jawabJson(status, { ok: false, kode, pesan }, { ...cors, ...tambahan });

    // 1) Asal halaman: browser dari situs lain ditolak
    if (asal && !daftarAsal.includes(asal)) return galat(403, 'ASAL_DITOLAK', 'Asal permintaan tidak diizinkan.');
    if (request.method === 'OPTIONS') return new Response(null, { status: 204, headers: cors });
    if (request.method !== 'POST') return galat(405, 'METODE_DITOLAK', 'Gunakan metode POST.', { Allow: 'POST, OPTIONS' });

    // 2) Bentuk & ukuran badan permintaan
    if (!(request.headers.get('content-type') || '').includes('application/json')) {
      return galat(415, 'INPUT_TIDAK_VALID', 'Permintaan harus berformat JSON.');
    }
    if (Number(request.headers.get('content-length') || 0) > BATAS.ukuranBadan) {
      return galat(413, 'PESAN_TERLALU_PANJANG', 'Pesanmu terlalu panjang.');
    }
    let data;
    try {
      const mentah = await request.text();
      if (mentah.length > BATAS.ukuranBadan) return galat(413, 'PESAN_TERLALU_PANJANG', 'Pesanmu terlalu panjang.');
      data = periksaPermintaan(JSON.parse(mentah));
    } catch (err) {
      if (err instanceof GalatInput) return galat(err.status, err.kode, err.message);
      return galat(400, 'INPUT_TIDAK_VALID', 'Format permintaan tidak dikenali.');
    }

    // 3) Pembatas jumlah permintaan
    const batas = cekBatas(ipKlien(request));
    if (!batas.boleh) {
      return galat(429, batas.alasan, PESAN_TERLALU_CEPAT[batas.alasan], { 'Retry-After': String(batas.tunggu) });
    }

    // 4) Kunci API hanya dibaca dari environment variable
    const kunci = env.GEMINI_API_KEY;
    if (!kunci && !klien) {
      return galat(500, 'KONFIGURASI_BELUM_LENGKAP', 'AI Tutor belum disiapkan oleh pengelola (GEMINI_API_KEY kosong).');
    }

    // 5) Tanya Gemini
    try {
      klien ||= await buatKlienGemini(kunci);
      const { teks } = await tanyaGemini(data, { klien, model: daftarModel(env) });
      return jawabJson(200, { ok: true, teks }, cors);
    } catch (err) {
      const g = err instanceof GalatTutor ? err : new GalatTutor('GANGGUAN', 'Maaf, Kak Profit sedang mengalami gangguan. Coba lagi, ya.', 502);
      // Log ringkas tanpa isi pesan siswa (privasi)
      const asli = err?.cause || err;
      console.error(`[tutor] ${g.kode}: ${asli?.status ?? ''} ${String(asli?.message || '').slice(0, 200)}`);
      return galat(g.status, g.kode, g.message);
    }
  };
}
