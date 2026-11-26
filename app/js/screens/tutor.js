// Layar AI Tutor "Tanya Koko": percakapan dengan Gemini lewat backend Vercel.
// Privasi: nama/kelas/progres TIDAK dikirim. Nama siswa yang tertulis di pesan diganti "aku".
import { h, tombol } from '../ui/dom.js';
import { muatTutor } from '../konten.js';
import * as progres from '../state/progres.js';
import { suara } from '../ui/suara.js';
import { animasikan, bolehAnimasi } from '../ui/animasi.js';
import { tanyaTutor, PESAN_GALAT } from '../ai/tutor-api.js';
import { TUTOR_SIAP, PANJANG_PESAN_MAKS } from '../ai/konfigurasi.js';
import { formatJawaban } from '../ai/format-jawaban.js';

// Percakapan disimpan di memori saja (hilang saat aplikasi ditutup) demi privasi.
const percakapan = [];

const LABEL_MODE = { tanya: '❓ Tanya', petunjuk: '💡 Petunjuk', langkah: '🪜 Langkah demi langkah', contoh: '🛒 Contoh soal' };

/** Mengganti nama siswa di dalam pesan dengan "aku" sebelum dikirim. */
function samarkanNama(teks) {
  const nama = (progres.muat().nama || '').trim();
  if (nama.length < 3) return teks;
  const pola = new RegExp(`\\b${nama.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}\\b`, 'gi');
  return teks.replace(pola, 'aku');
}

function gelembung(item) {
  if (item.peran === 'siswa') {
    return h('div', { class: 'tutor-baris tutor-siswa' },
      h('div', { class: 'tutor-gelembung' },
        item.mode && item.mode !== 'tanya' ? h('span', { class: 'tutor-label-mode' }, LABEL_MODE[item.mode]) : null,
        h('p', {}, item.teks)));
  }
  return h('div', { class: `tutor-baris tutor-koko${item.galat ? ' tutor-galat' : ''}` },
    h('span', { class: 'tutor-avatar', 'aria-hidden': 'true' }, item.galat ? '⚠️' : '🪙'),
    h('div', { class: 'tutor-gelembung' },
      h('span', { class: 'sr-only' }, 'Koko: '),
      item.galat ? h('p', {}, item.teks) : formatJawaban(item.teks)));
}

export async function layarTutor(akar, _param, app) {
  app.aturJudul('🪙 Tanya Koko (AI)', { kembali: '#beranda' });
  const konten = await muatTutor();
  let mode = 'tanya';
  let sibuk = false;

  const log = h('div', { class: 'tutor-log', role: 'log', 'aria-live': 'polite', 'aria-label': 'Percakapan dengan Koko' });
  const status = h('p', { class: 'tutor-status', role: 'status' });
  const isian = h('textarea', {
    class: 'input-teks tutor-isian', rows: '2', maxlength: String(PANJANG_PESAN_MAKS),
    placeholder: 'Tulis pertanyaanmu…', 'aria-label': 'Pertanyaan untuk Koko', enterkeyhint: 'send',
  });
  const hitung = h('span', { class: 'tutor-hitung', 'aria-hidden': 'true' }, `0/${PANJANG_PESAN_MAKS}`);
  const pilMode = h('button', { type: 'button', class: 'tutor-pil-mode', hidden: true, 'aria-label': 'Hapus jenis bantuan' });
  const tombolKirim = tombol('Kirim ➤', () => kirim(), 'utama', { class: 'btn btn-utama tutor-kirim' });
  const tombolBaru = tombol('🧹 Mulai baru', () => mulaiBaru(), 'kedua', { class: 'btn btn-kedua tutor-baru' });

  const aturMode = (m) => {
    mode = m;
    pilMode.hidden = m === 'tanya';
    pilMode.textContent = `${LABEL_MODE[m]} ✕`;
  };
  pilMode.addEventListener('click', () => aturMode('tanya'));

  const perbaruiHitung = () => {
    hitung.textContent = `${isian.value.length}/${PANJANG_PESAN_MAKS}`;
    hitung.classList.toggle('tutor-hitung-penuh', isian.value.length >= PANJANG_PESAN_MAKS);
  };
  isian.addEventListener('input', perbaruiHitung);
  // Ctrl/⌘ + Enter untuk kirim (di HP, Enter tetap membuat baris baru)
  isian.addEventListener('keydown', (e) => { if (e.key === 'Enter' && (e.ctrlKey || e.metaKey)) kirim(); });

  const perbaruiStatus = () => {
    const daring = navigator.onLine;
    let teks = '';
    if (!TUTOR_SIAP) teks = `ℹ️ ${PESAN_GALAT.BELUM_SIAP}`;
    else if (!daring) teks = `📴 ${PESAN_GALAT.OFFLINE}`;
    status.textContent = teks;
    status.hidden = !teks;
    const bisa = TUTOR_SIAP && daring && !sibuk;
    tombolKirim.disabled = !bisa;
    saran.querySelectorAll('button').forEach((b) => { b.disabled = !bisa; });
  };

  const tambahKeLog = (item, { animasi = true } = {}) => {
    const el = gelembung(item);
    log.append(el);
    if (animasi) animasikan(el, 'anim-muncul');
    el.scrollIntoView({ block: 'end', behavior: bolehAnimasi() ? 'smooth' : 'auto' });
    return el;
  };

  const tampilkanSemua = () => {
    log.replaceChildren();
    tambahKeLog({ peran: 'tutor', teks: konten.sapaan }, { animasi: false });
    percakapan.forEach((item) => tambahKeLog(item, { animasi: false }));
  };

  async function kirim(teksLangsung = null, modeLangsung = null) {
    if (sibuk) return;
    const teks = samarkanNama((teksLangsung ?? isian.value).trim());
    const modeKirim = modeLangsung || mode;
    if (!teks) { isian.focus(); return; }
    const riwayat = percakapan.filter((p) => !p.galat).map(({ peran, teks: t }) => ({ peran, teks: t }));

    const itemSiswa = { peran: 'siswa', teks, mode: modeKirim };
    percakapan.push(itemSiswa);
    tambahKeLog(itemSiswa);
    if (teksLangsung === null) { isian.value = ''; perbaruiHitung(); }
    aturMode('tanya');

    sibuk = true;
    perbaruiStatus();
    const berpikir = h('div', { class: 'tutor-baris tutor-koko tutor-berpikir' },
      h('span', { class: 'tutor-avatar', 'aria-hidden': 'true' }, '🪙'),
      h('div', { class: 'tutor-gelembung' }, h('span', { class: 'sr-only' }, 'Koko sedang berpikir'),
        h('span', { class: 'titik-tiga', 'aria-hidden': 'true' }, h('i'), h('i'), h('i'))));
    log.append(berpikir);
    berpikir.scrollIntoView({ block: 'end', behavior: bolehAnimasi() ? 'smooth' : 'auto' });

    const hasil = await tanyaTutor({ pesan: teks, mode: modeKirim, riwayat });
    berpikir.remove();
    sibuk = false;
    if (hasil.ok) {
      const item = { peran: 'tutor', teks: hasil.teks };
      percakapan.push(item);
      tambahKeLog(item);
      suara.geser();
    } else {
      // Pertanyaan yang gagal dikembalikan ke kotak isian agar mudah dikirim ulang
      percakapan.splice(percakapan.indexOf(itemSiswa), 1);
      if (teksLangsung === null && !isian.value) { isian.value = teks; perbaruiHitung(); }
      if (modeKirim !== 'tanya') aturMode(modeKirim);
      const item = { peran: 'tutor', teks: hasil.pesan, galat: true };
      tambahKeLog(item);
      suara.salah();
    }
    perbaruiStatus();
  }

  function mulaiBaru() {
    percakapan.length = 0;
    aturMode('tanya');
    tampilkanSemua();
    isian.focus();
  }

  const saran = h('div', { class: 'tutor-saran', role: 'group', 'aria-label': 'Pilih bantuan' },
    konten.saran.map((s) => h('button', {
      type: 'button', class: 'tutor-chip',
      onclick: () => {
        if (s.pesan) { kirim(s.pesan, s.mode); return; }
        aturMode(s.mode);
        isian.value = s.templat;
        perbaruiHitung();
        isian.focus();
        isian.setSelectionRange(isian.value.length, isian.value.length);
      },
    }, s.label)));

  akar.replaceChildren(h('section', { class: 'tutor' },
    status,
    log,
    saran,
    h('div', { class: 'tutor-form' },
      h('div', { class: 'tutor-isian-bungkus' }, pilMode, isian, hitung),
      h('div', { class: 'tutor-tombol' }, tombolBaru, tombolKirim),
      h('p', { class: 'catatan-kecil tutor-pengingat' }, konten.pengingat)),
  ));

  tampilkanSemua();
  perbaruiStatus();
  window.addEventListener('online', perbaruiStatus);
  window.addEventListener('offline', perbaruiStatus);
  app.saatTinggal(() => {
    window.removeEventListener('online', perbaruiStatus);
    window.removeEventListener('offline', perbaruiStatus);
  });
}
