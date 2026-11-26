// Vercel Function: POST /api/tutor
// Badan permintaan: { "pesan": "...", "mode": "tanya|petunjuk|langkah|contoh", "riwayat": [{ "peran": "siswa|tutor", "teks": "..." }] }
// Jawaban: { "ok": true, "teks": "..." } atau { "ok": false, "kode": "...", "pesan": "..." }
import { buatPenangan } from '../lib/tangani.js';

const tangani = buatPenangan();

export function OPTIONS(request) { return tangani(request); }
export function POST(request) { return tangani(request); }
export function GET(request) { return tangani(request); }
