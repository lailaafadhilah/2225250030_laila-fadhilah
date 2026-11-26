// Penghubung ke Google Gemini API memakai SDK resmi @google/genai.
import { BATAS } from './konfigurasi.js';
import { buatInstruksi } from './instruksi.js';

/** Kesalahan dari sisi Gemini yang sudah diterjemahkan untuk siswa. */
export class GalatTutor extends Error {
  constructor(kode, pesan, status) {
    super(pesan);
    this.kode = kode;
    this.status = status;
  }
}

/** Membuat klien Gemini (SDK dimuat saat dibutuhkan saja). */
export async function buatKlienGemini(kunciApi) {
  const { GoogleGenAI } = await import('@google/genai');
  return new GoogleGenAI({ apiKey: kunciApi });
}

/** Menerjemahkan galat SDK/jaringan menjadi GalatTutor yang ramah. */
export function terjemahkanGalat(err) {
  if (err instanceof GalatTutor) return err;
  const g = terjemahkan(err);
  g.cause = err; // galat asli disimpan untuk log server (tidak dikirim ke siswa)
  return g;
}

function terjemahkan(err) {
  const status = Number(err?.status ?? err?.code ?? 0);
  const pesan = String(err?.message || '');
  if (err?.name === 'AbortError' || err?.name === 'TimeoutError') {
    return new GalatTutor('WAKTU_HABIS', 'Koko butuh waktu terlalu lama untuk menjawab. Coba lagi, ya.', 504);
  }
  if (status === 401 || status === 403 || (status === 400 && /api[ _-]?key/i.test(pesan))) {
    return new GalatTutor('KUNCI_API_TIDAK_VALID', 'AI Tutor belum bisa dipakai karena kunci API bermasalah. Beri tahu gurumu, ya.', 502);
  }
  if (status === 429 || /RESOURCE_EXHAUSTED|quota/i.test(pesan)) {
    return new GalatTutor('KUOTA_HABIS', 'Kuota AI Tutor hari ini sudah habis. Coba lagi nanti, ya. Sementara itu, kamu bisa belajar di menu Materi.', 429);
  }
  if (status === 404) {
    return new GalatTutor('MODEL_TIDAK_ADA', 'Model AI tidak ditemukan.', 502);
  }
  if (status >= 500) {
    return new GalatTutor('SERVER_GEMINI_GANGGUAN', 'Server AI sedang sibuk atau gangguan. Coba lagi sebentar lagi, ya.', 502);
  }
  return new GalatTutor('GANGGUAN', 'Maaf, Koko sedang mengalami gangguan. Coba lagi, ya.', 502);
}

/** Mengubah riwayat { peran, teks } ke format "contents" Gemini. */
function susunIsi(riwayat, pesan) {
  const isi = riwayat.map((g) => ({ role: g.peran === 'siswa' ? 'user' : 'model', parts: [{ text: g.teks }] }));
  // Gemini mensyaratkan giliran pertama dari "user"
  while (isi.length && isi[0].role !== 'user') isi.shift();
  isi.push({ role: 'user', parts: [{ text: pesan }] });
  return isi;
}

/**
 * Meminta jawaban Gemini. Mencoba model berikutnya bila model tidak ditemukan (404).
 * @returns {Promise<{ teks: string, model: string }>}
 */
export async function tanyaGemini({ pesan, mode, riwayat }, { klien, model: daftar }) {
  let galatTerakhir = null;
  for (const model of daftar) {
    try {
      const respon = await klien.models.generateContent({
        model,
        contents: susunIsi(riwayat, pesan),
        config: {
          systemInstruction: buatInstruksi(mode),
          temperature: 0.4,
          maxOutputTokens: 2048,
          abortSignal: AbortSignal.timeout(BATAS.waktuTunggu),
        },
      });
      const teks = (respon?.text || '').trim();
      if (!teks) {
        const alasan = respon?.promptFeedback?.blockReason || respon?.candidates?.[0]?.finishReason;
        if (alasan && /SAFETY|BLOCK|PROHIBITED/i.test(String(alasan))) {
          throw new GalatTutor('DITOLAK', 'Koko tidak bisa menjawab pertanyaan itu. Coba tanyakan tentang untung dan rugi, ya.', 422);
        }
        throw new GalatTutor('JAWABAN_KOSONG', 'Koko belum menemukan jawabannya. Coba tulis pertanyaanmu dengan lebih singkat.', 502);
      }
      return { teks, model };
    } catch (err) {
      galatTerakhir = terjemahkanGalat(err);
      if (galatTerakhir.kode !== 'MODEL_TIDAK_ADA') throw galatTerakhir;
    }
  }
  throw new GalatTutor('MODEL_TIDAK_ADA', 'Model AI tidak tersedia. Beri tahu gurumu, ya.', 502);
}
