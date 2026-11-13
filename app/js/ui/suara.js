// Suara ProfitQuest dibuat langsung dengan Web Audio API (tanpa berkas suara → ringan & bisa offline).
// Efek suara dan musik latar NYALA secara bawaan (permintaan pengguna: suara harus jelas terdengar).
// Keduanya bisa dimatikan di Pengaturan atau lewat tombol 🔊 / 🎵.
import { muat } from '../state/progres.js';

let ctx = null;
let penguat = null;

/** Membuat konteks audio + rantai: penguat → kompresor → speaker. */
function konteks() {
  if (!ctx) {
    const AC = window.AudioContext || window.webkitAudioContext;
    if (!AC) return null;
    // iPhone (Safari 16.4+): tetap berbunyi walau tombol senyap aktif
    try { if (navigator.audioSession) navigator.audioSession.type = 'playback'; } catch { /* tidak didukung */ }
    ctx = new AC();
    // Kompresor membuat suara keras tetapi tidak pecah di speaker HP
    const kompresor = ctx.createDynamicsCompressor();
    kompresor.threshold.value = -14;
    kompresor.knee.value = 10;
    kompresor.ratio.value = 4;
    kompresor.attack.value = 0.003;
    kompresor.release.value = 0.2;
    penguat = ctx.createGain();
    penguat.gain.value = 1.4;
    penguat.connect(kompresor).connect(ctx.destination);
  }
  if (ctx.state === 'suspended') ctx.resume(); // HP: audio baru boleh setelah sentuhan
  return ctx;
}

/** Dipanggil saat sentuhan pertama agar audio "terbuka" di Android & iPhone. */
export function bukaKunciAudio() {
  const c = konteks();
  if (!c) return;
  // Bunyi senyap sangat singkat: syarat iPhone agar audio berikutnya terdengar
  const b = c.createBuffer(1, 1, 22050);
  const s = c.createBufferSource();
  s.buffer = b;
  s.connect(c.destination);
  s.start(0);
}

// Hemat baterai: hentikan audio saat aplikasi ditinggal, lanjutkan saat kembali
document.addEventListener('visibilitychange', () => {
  if (!ctx) return;
  if (document.hidden) ctx.suspend(); else ctx.resume();
});

const efekAktif = () => muat().pengaturan.suara !== false;

/** Satu nada pendek dengan selubung lembut. */
function nada(frek, mulai, durasi, { tipe = 'sine', vol = 0.3, geser = null, tujuan = null } = {}) {
  const c = konteks();
  if (!c) return;
  const t = c.currentTime + mulai;
  const osc = c.createOscillator();
  const g = c.createGain();
  osc.type = tipe;
  osc.frequency.setValueAtTime(frek, t);
  if (geser) osc.frequency.exponentialRampToValueAtTime(geser, t + durasi);
  g.gain.setValueAtTime(0.0001, t);
  g.gain.exponentialRampToValueAtTime(vol, t + 0.01);
  g.gain.exponentialRampToValueAtTime(0.0001, t + durasi);
  osc.connect(g).connect(tujuan || penguat);
  osc.start(t);
  osc.stop(t + durasi + 0.03);
}

function efek(fn) {
  return (...arg) => { if (efekAktif()) { try { fn(...arg); } catch { /* audio tidak tersedia */ } } };
}

export const suara = {
  /** Setiap ketukan tombol: bunyi "pop" yang jelas. */
  klik: efek(() => {
    nada(700, 0, 0.09, { tipe: 'triangle', vol: 0.55, geser: 1100 });
    nada(1400, 0, 0.05, { tipe: 'sine', vol: 0.25 });
  }),
  /** Jawaban benar: tiga nada naik (do–mi–sol). */
  benar: efek(() => [523.25, 659.25, 783.99].forEach((f, i) => {
    nada(f, i * 0.09, 0.26, { tipe: 'triangle', vol: 0.5 });
    nada(f * 2, i * 0.09, 0.18, { tipe: 'sine', vol: 0.18 });
  })),
  /** Jawaban belum tepat: dua nada turun yang lembut (tidak menghukum). */
  salah: efek(() => {
    nada(330, 0, 0.18, { tipe: 'triangle', vol: 0.42, geser: 262 });
    nada(247, 0.16, 0.26, { tipe: 'triangle', vol: 0.38, geser: 196 });
  }),
  /** Bintang / koin. */
  bintang: efek(() => [1046.5, 1318.5, 1568, 2093].forEach((f, i) => nada(f, i * 0.07, 0.2, { tipe: 'triangle', vol: 0.35 }))),
  koin: efek(() => { nada(988, 0, 0.08, { tipe: 'square', vol: 0.2 }); nada(1319, 0.08, 0.2, { tipe: 'square', vol: 0.2 }); }),
  /** Wilayah selesai / kuis bagus: fanfare kecil. */
  menang: efek(() => {
    [523.25, 659.25, 783.99, 1046.5].forEach((f, i) => nada(f, i * 0.12, 0.32, { tipe: 'triangle', vol: 0.5 }));
    [523.25, 659.25, 783.99].forEach((f) => nada(f, 0.55, 0.8, { tipe: 'triangle', vol: 0.28 }));
  }),
  /** Ganti halaman / langkah. */
  geser: efek(() => nada(440, 0, 0.14, { tipe: 'triangle', vol: 0.35, geser: 760 })),
};

// ---------- Musik latar (melodi pentatonik riang + bas + ketukan, diulang) ----------
const MELODI = [
  [659, 1], [784, 1], [880, 2], [784, 1], [659, 1], [587, 2],
  [523, 1], [587, 1], [659, 2], [587, 1], [523, 1], [440, 2],
  [523, 1], [659, 1], [784, 2], [880, 1], [784, 1], [659, 2],
  [587, 1], [659, 1], [587, 1], [523, 1], [523, 4],
];
const BAS = [262, 196, 220, 175]; // satu nada bas per seperempat lagu
let pemutar = null;
let gainMusik = null;

export function musikNyala() { return pemutar !== null; }

export function mulaiMusik() {
  const c = konteks();
  if (!c || pemutar) return;
  gainMusik = c.createGain();
  gainMusik.gain.value = 0.6; // lebih pelan daripada efek, tetapi jelas terdengar
  gainMusik.connect(penguat);
  const ketuk = 0.28; // detik per ketukan
  const jumlahKetuk = MELODI.reduce((j, [, d]) => j + d, 0);
  const panjang = jumlahKetuk * ketuk;
  let mulaiPutaran = c.currentTime + 0.1;
  const jadwalkan = () => {
    const awal = mulaiPutaran - c.currentTime;
    let t = awal;
    for (const [f, d] of MELODI) {
      nada(f, t, d * ketuk * 0.9, { tipe: 'triangle', vol: 0.32, tujuan: gainMusik });
      t += d * ketuk;
    }
    // Bas: dua pukulan per ketukan genap agar terasa "berjalan"
    for (let k = 0; k < jumlahKetuk; k += 2) {
      const f = BAS[Math.floor((k / jumlahKetuk) * BAS.length)] / 2;
      nada(f, awal + k * ketuk, ketuk * 1.6, { tipe: 'triangle', vol: 0.38, tujuan: gainMusik });
    }
    // Ketukan ringan (seperti hi-hat) di setiap ketukan
    for (let k = 0; k < jumlahKetuk; k++) {
      nada(3200, awal + k * ketuk, 0.03, { tipe: 'square', vol: k % 2 ? 0.03 : 0.06, tujuan: gainMusik });
    }
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
