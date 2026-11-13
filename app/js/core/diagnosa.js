// Mendeteksi miskonsepsi umum (M1–M6, dll.) dari jawaban siswa.
// Hanya mengembalikan KODE. Pesannya ada di content/umpan-balik.json.
import { hitungModal, hitungSelisih, hitungPersen, kunciSoal } from './hitung.js';

const TOLERANSI_PERSEN = 0.011;
const dekat = (a, b) => Math.abs(a - b) <= TOLERANSI_PERSEN;
const adaOngkos = (soal) => (soal.ongkos || []).length > 0;

/** Jawaban: "untung" | "rugi" | "impas" */
export function diagnosaJenis(soal, jawaban) {
  const kunci = kunciSoal(soal);
  if (jawaban === kunci.jenis) return { benar: true };
  return { benar: false, kode: 'M6' };
}

/** Jawaban: besar untung/rugi dalam rupiah */
export function diagnosaSelisih(soal, jawaban) {
  const kunci = kunciSoal(soal);
  if (jawaban === kunci.selisih) return { benar: true };
  if (adaOngkos(soal) && jawaban === Math.abs(soal.hj - soal.hb)) return { benar: false, kode: 'M2' };
  if (jawaban === soal.hj || jawaban === kunci.modal) return { benar: false, kode: 'M3' };
  if (salahNol(jawaban, kunci.selisih)) return { benar: false, kode: 'M5' };
  return { benar: false, kode: 'UMUM' };
}

/** Jawaban: angka persen (mis. 20 untuk 20%) */
export function diagnosaPersen(soal, jawaban) {
  const kunci = kunciSoal(soal);
  if (dekat(jawaban, kunci.persen)) return { benar: true };
  if (soal.hj > 0 && dekat(jawaban, hitungPersen(kunci.selisih, soal.hj))) return { benar: false, kode: 'M1' };
  if (adaOngkos(soal)) {
    const tanpaOngkos = hitungPersen(hitungSelisih(soal.hb, soal.hj), soal.hb);
    if (dekat(jawaban, tanpaOngkos)) return { benar: false, kode: 'M2' };
  }
  if (kunci.persen > 0 && Math.abs(jawaban - kunci.persen / 100) < 0.001) return { benar: false, kode: 'M4' };
  if (dekat(jawaban, kunci.persen * 10) || dekat(jawaban, kunci.persen / 10)) return { benar: false, kode: 'M5' };
  return { benar: false, kode: 'UMUM' };
}

/** Jawaban: harga jual atau modal (soal kebalikan, wilayah 6) */
export function diagnosaHasil(soal, jawaban) {
  const kunci = kunciSoal(soal);
  const target = soal.ditanya === 'hj' ? kunci.hj : kunci.modal;
  if (jawaban === target) return { benar: true };
  if (soal.ditanya === 'hj') {
    const modal = hitungModal(soal.hb, soal.ongkos || []);
    if (jawaban === Math.round((modal * soal.persen) / 100)) return { benar: false, kode: 'H1' };
    const arahTerbalik = Math.round((modal * (soal.jenis === 'rugi' ? 100 + soal.persen : 100 - soal.persen)) / 100);
    if (jawaban === arahTerbalik) return { benar: false, kode: 'H2' };
  } else {
    const kaliSalah = Math.round((soal.hj * (soal.jenis === 'rugi' ? 100 - soal.persen : 100 + soal.persen)) / 100);
    if (jawaban === kaliSalah) return { benar: false, kode: 'H3' };
    const dariHj = Math.round((soal.hj * (soal.jenis === 'rugi' ? 100 + soal.persen : 100 - soal.persen)) / 100);
    if (jawaban === dariHj) return { benar: false, kode: 'H4' };
  }
  if (salahNol(jawaban, target)) return { benar: false, kode: 'M5' };
  return { benar: false, kode: 'UMUM' };
}

/** Kunci modal dari harga beli + ongkos yang dipilih ke keranjang. */
export function diagnosaKeranjang(soal, dipilih) {
  // dipilih: array kunci, mis. ["hb", "ongkos-0", "hj"]
  const harus = ['hb', ...(soal.ongkos || []).map((_, i) => `ongkos-${i}`)];
  if (dipilih.includes('hj')) return { benar: false, kode: 'K1' };
  if (!dipilih.includes('hb')) return { benar: false, kode: 'K2' };
  if (harus.every((k) => dipilih.includes(k))) return { benar: true };
  return { benar: false, kode: 'M2' };
}

/** Label penanda cerita. label & peran: "hb" | "ongkos" | "hj" | "x" */
export function diagnosaTanda(peranBenar, label) {
  if (peranBenar === label) return { benar: true };
  if ((peranBenar === 'hb' && label === 'hj') || (peranBenar === 'hj' && label === 'hb')) return { benar: false, kode: 'M3' };
  if (peranBenar === 'ongkos') return { benar: false, kode: 'M2' };
  if (peranBenar === 'x') return { benar: false, kode: 'P1' };
  return { benar: false, kode: 'IL05' };
}

function salahNol(jawaban, kunci) {
  if (!jawaban || !kunci) return false;
  return [10, 100, 1000].some((f) => jawaban === kunci * f || jawaban * f === kunci);
}
