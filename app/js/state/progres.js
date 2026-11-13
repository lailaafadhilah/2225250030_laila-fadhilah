// Menyimpan kemajuan siswa di perangkat (F15). Tanpa server, tanpa akun.
const KUNCI = 'pq.progres.v1';

function awal() {
  return {
    versi: 1,
    nama: '',
    wilayah: {},
    contoh_dibuka: [],
    materi_dibaca: [],
    kuis: [],
    kuis_terbaik: null,
    simulasi_berhasil: 0,
    statistik_salah: {},
    pengaturan: { ukuran_teks: 'normal', animasi: 'nyala', cara_jawab: 'klik', suara: true, musik: true, versi_suara: 2, buka_semua: false },
  };
}

let data = null;

export function muat() {
  if (data) return data;
  try {
    const teks = localStorage.getItem(KUNCI);
    data = teks ? { ...awal(), ...JSON.parse(teks) } : awal();
  } catch {
    data = awal();
  }
  const lama = data.pengaturan || {};
  data.pengaturan = { ...awal().pengaturan, ...lama };
  // Migrasi sekali: dulu musik mati & suara pelan. Nyalakan musik + efek untuk pengguna lama.
  if (lama.versi_suara !== 2) {
    data.pengaturan.musik = true;
    data.pengaturan.suara = true;
    data.pengaturan.versi_suara = 2;
  }
  return data;
}

export function simpan() {
  try { localStorage.setItem(KUNCI, JSON.stringify(muat())); } catch { /* penyimpanan penuh/diblokir */ }
}

/** Catatan satu wilayah (dibuat bila belum ada). */
export function catatanWilayah(id) {
  const p = muat();
  p.wilayah[id] ||= { status: 'terbuka', posisi: 0, bintang: 0, bintang_aktivitas: {} };
  p.wilayah[id].bintang_aktivitas ||= {};
  return p.wilayah[id];
}

/** "selesai" | "terbuka" | "terkunci". Wilayah 1 selalu terbuka. */
export function statusWilayah(id) {
  const p = muat();
  if (p.wilayah[id]?.status === 'selesai') return 'selesai';
  if (id === 1 || p.pengaturan.buka_semua || p.wilayah[id - 1]?.status === 'selesai') return 'terbuka';
  return 'terkunci';
}

export function catatSalah(kode) {
  if (!kode) return;
  const p = muat();
  p.statistik_salah[kode] = (p.statistik_salah[kode] || 0) + 1;
  simpan();
}

export function tandaiContoh(id) {
  const p = muat();
  if (!p.contoh_dibuka.includes(id)) { p.contoh_dibuka.push(id); simpan(); }
}

export function tandaiMateri(id) {
  const p = muat();
  p.materi_dibaca ||= [];
  if (!p.materi_dibaca.includes(id)) { p.materi_dibaca.push(id); simpan(); }
}

export function totalBintang() {
  return Object.values(muat().wilayah).reduce((j, w) => j + (w.bintang || 0), 0);
}

/** Kode teks untuk dipindahkan ke perangkat lain / diserahkan ke guru (F19). */
export function eksporKode() {
  return btoa(unescape(encodeURIComponent(JSON.stringify(muat()))));
}

export function imporKode(kode) {
  const isi = JSON.parse(decodeURIComponent(escape(atob(kode.trim()))));
  if (isi.versi !== 1 || typeof isi.wilayah !== 'object') throw new Error('Kode tidak dikenali');
  data = { ...awal(), ...isi };
  simpan();
}

export function setelUlang() {
  data = awal();
  simpan();
}
