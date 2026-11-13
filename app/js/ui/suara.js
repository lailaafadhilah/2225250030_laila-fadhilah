// Suara ProfitQuest dibuat langsung dengan Web Audio API (tanpa berkas suara → ringan & bisa offline).
// Efek suara bisa dimatikan; musik latar MATI secara bawaan agar tidak menambah beban kognitif (EL).
import { muat } from '../state/progres.js';

let ctx = null;
let penguat = null;

function konteks() {
  if (!ctx) {
    const AC = window.AudioContext || window.webkitAudioContext;
    if (!AC) return null;
    ctx = new AC();
    penguat = ctx.createGain();
    penguat.gain.value = 0.9;
    penguat.connect(ctx.destination);
  }
  if (ctx.state === 'suspended') ctx.resume(); // iPhone/Android: audio baru boleh setelah sentuhan
  return ctx;
}

const efekAktif = () => muat().pengaturan.suara !== false;

/** Satu nada pendek dengan selubung lembut. */
function nada(frek, mulai, durasi, { tipe = 'sine', vol = 0.12, geser = null, tujuan = null } = {}) {
  const c = konteks();
  if (!c) return;
  const t = c.currentTime + mulai;
  const osc = c.createOscillator();
  const g = c.createGain();
  osc.type = tipe;
  osc.frequency.setValueAtTime(frek, t);
  if (geser) osc.frequency.exponentialRampToValueAtTime(geser, t + durasi);
  g.gain.setValueAtTime(0.0001, t);
  g.gain.exponentialRampToValueAtTime(vol, t + 0.012);
  g.gain.exponentialRampToValueAtTime(0.0001, t + durasi);
  osc.connect(g).connect(tujuan || penguat);
  osc.start(t);
  osc.stop(t + durasi + 0.03);
}

function efek(fn) {
  return (...arg) => { if (efekAktif()) { try { fn(...arg); } catch { /* audio tidak tersedia */ } } };
}

export const suara = {
  /** Setiap ketukan tombol. */
  klik: efek(() => nada(620, 0, 0.07, { tipe: 'triangle', vol: 0.07, geser: 880 })),
  /** Jawaban benar: tiga nada naik (do–mi–sol). */
  benar: efek(() => [523.25, 659.25, 783.99].forEach((f, i) => nada(f, i * 0.09, 0.22, { tipe: 'triangle', vol: 0.13 }))),
  /** Jawaban belum tepat: dua nada turun yang lembut (tidak menghukum). */
  salah: efek(() => { nada(330, 0, 0.16, { vol: 0.1, geser: 262 }); nada(247, 0.15, 0.22, { vol: 0.09, geser: 196 }); }),
  /** Bintang / koin. */
  bintang: efek(() => [1046.5, 1318.5, 1568, 2093].forEach((f, i) => nada(f, i * 0.07, 0.16, { tipe: 'sine', vol: 0.08 }))),
  koin: efek(() => { nada(988, 0, 0.08, { tipe: 'square', vol: 0.05 }); nada(1319, 0.08, 0.18, { tipe: 'square', vol: 0.05 }); }),
  /** Wilayah selesai / kuis bagus: fanfare kecil. */
  menang: efek(() => {
    [523.25, 659.25, 783.99, 1046.5].forEach((f, i) => nada(f, i * 0.12, 0.3, { tipe: 'triangle', vol: 0.12 }));
    [523.25, 659.25, 783.99].forEach((f) => nada(f, 0.55, 0.7, { tipe: 'sine', vol: 0.07 }));
  }),
  /** Ganti halaman / langkah. */
  geser: efek(() => nada(420, 0, 0.12, { tipe: 'sine', vol: 0.05, geser: 700 })),
};

// ---------- Musik latar (melodi pentatonik riang, diulang) ----------
const MELODI = [
  [659, 1], [784, 1], [880, 2], [784, 1], [659, 1], [587, 2],
  [523, 1], [587, 1], [659, 2], [587, 1], [523, 1], [440, 2],
  [523, 1], [659, 1], [784, 2], [880, 1], [784, 1], [659, 2],
  [587, 1], [659, 1], [587, 1], [523, 1], [523, 4],
];
const BAS = [262, 196, 220, 175];
let pemutar = null;
let gainMusik = null;

export function musikNyala() { return pemutar !== null; }

export function mulaiMusik() {
  const c = konteks();
  if (!c || pemutar) return;
  gainMusik = c.createGain();
  gainMusik.gain.value = 0.35;
  gainMusik.connect(penguat);
  const ketuk = 0.28; // detik per ketukan
  const panjang = MELODI.reduce((j, [, d]) => j + d, 0) * ketuk;
  let mulaiPutaran = c.currentTime + 0.1;
  const jadwalkan = () => {
    let t = mulaiPutaran - c.currentTime;
    for (const [f, d] of MELODI) { nada(f, t, d * ketuk * 0.9, { tipe: 'triangle', vol: 0.05, tujuan: gainMusik }); t += d * ketuk; }
    BAS.forEach((f, i) => nada(f / 2, mulaiPutaran - c.currentTime + i * (panjang / 4), panjang / 4 * 0.95, { tipe: 'sine', vol: 0.04, tujuan: gainMusik }));
    mulaiPutaran += panjang;
  };
  jadwalkan();
  pemutar = setInterval(() => { if (mulaiPutaran - c.currentTime < 1.5) jadwalkan(); }, 500);
}

export function hentikanMusik() {
  if (pemutar) clearInterval(pemutar);
  pemutar = null;
  if (gainMusik && ctx) {
    gainMusik.gain.setTargetAtTime(0.0001, ctx.currentTime, 0.1);
    const g = gainMusik;
    setTimeout(() => g.disconnect(), 600);
  }
  gainMusik = null;
}
