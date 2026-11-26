// Vercel Function: GET /api/kesehatan — cek cepat apakah backend hidup & sudah dikonfigurasi.
// Tidak pernah menampilkan isi kunci API.
import { jawabJson } from '../lib/cors.js';
import { daftarModel } from '../lib/konfigurasi.js';

export function GET() {
  return jawabJson(200, {
    ok: true,
    layanan: 'ProfitQuest AI Tutor',
    kunciTerpasang: Boolean(process.env.GEMINI_API_KEY),
    model: daftarModel()[0],
  });
}
