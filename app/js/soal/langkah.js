// Menyusun "4 Langkah Juragan" dari satu objek soal.
// Setiap langkah: { kode, judul, rumus, jenisInput, pertanyaan?, opsi?, penjelasan, visual?, ringkas, periksa? }
// jenisInput: "tampil" | "tandai" | "keranjang" | "pilih" | "rupiah" | "persen"
import { kunciSoal, hitungPersen } from '../core/hitung.js';
import { formatRupiah as rp, formatPersen as pc } from '../core/format.js';
import { tokenCerita } from '../core/cerita.js';
import * as d from '../core/diagnosa.js';
import { papanDiketahui, visualKurang, visualPecahan } from '../ui/visual.js';
import { acak } from '../ui/dom.js';

const besar = (teks) => teks.charAt(0).toUpperCase() + teks.slice(1);
const angka = (x) => String(x).replace('.', ',');

/** Pilihan rupiah unik & positif, diurutkan dari kecil ke besar. */
function opsiRupiah(benar, ...pengecoh) {
  const nilai = [...new Set([benar, ...pengecoh].map(Math.round))].filter((n) => n > 0);
  return nilai.sort((a, b) => a - b).map((n) => ({ nilai: n, teks: rp(n) }));
}

/**
 * Pilihan jawaban angka: kunci + pengecoh dari miskonsepsi umum (urutan = prioritas).
 * Pengecoh sengaja berasal dari kesalahan khas (M1, M2, M4, M5, H1–H4), jadi
 * umpan balik diagnostik tetap bekerja walau siswa hanya mengklik.
 */
function pilihanAngka(benar, pengecoh, format, bulatkan) {
  const hasil = [{ nilai: benar, teks: format(benar) }];
  const sudah = new Set([hasil[0].teks]);
  for (const mentah of pengecoh) {
    if (hasil.length >= 4) break;
    if (mentah == null || mentah === false || !Number.isFinite(mentah) || mentah <= 0) continue;
    const n = bulatkan(mentah);
    const teks = format(n);
    if (sudah.has(teks)) continue;
    sudah.add(teks);
    hasil.push({ nilai: n, teks });
  }
  return hasil.sort((a, b) => a.nilai - b.nilai);
}
const bulatRupiah = (x) => Math.round(x);
const bulatPersen = (x) => Math.round(x * 100) / 100;

/**
 * mode: "contoh" | "latihan" | "ujian". Ujian memakai urutan ringkas (checkpoint).
 * opsi.ketik = true → siswa mengetik angka; bawaan: angka dijawab dengan MENGKLIK pilihan.
 */
export function susunLangkah(soal, mode = 'latihan', { ketik = false } = {}) {
  const langkah = susunLangkahDasar(soal, mode);
  if (ketik) return langkah;
  return langkah.map((L) => {
    if (L.jenisInput !== 'rupiah' && L.jenisInput !== 'persen') return L;
    return { ...L, jenisInput: 'pilih', opsi: L.pilihan, catatan: null, pertanyaan: `${L.label} adalah…` };
  });
}

function susunLangkahDasar(soal, mode) {
  const k = kunciSoal(soal);
  const adaOngkos = (soal.ongkos || []).length > 0;
  const ringkas = mode === 'ujian';
  let urutan;
  switch (soal.ditanya) {
    case 'kenali':
      urutan = ['kenali', adaOngkos && 'modal', 'bandingkan'];
      break;
    case 'selisih':
      urutan = ringkas ? ['bandingkan', 'selisih'] : ['kenali', adaOngkos && 'modal', 'bandingkan', 'selisih', 'cekSelisih'];
      break;
    case 'persen':
      urutan = ringkas ? ['bandingkan', 'persen']
        : ['kenali', adaOngkos && 'modal', 'bandingkan', 'selisih', soal.pembagi && 'pembagi', 'persen', 'cekPersen'];
      break;
    case 'hj':
      urutan = ringkas ? ['hasilHj'] : ['kenali', 'faktorHj', 'hasilHj', 'cekHj'];
      break;
    case 'modal':
      urutan = ringkas ? ['hasilModal'] : ['kenali', 'faktorModal', 'hasilModal', 'cekModal'];
      break;
    default:
      throw new Error(`Jenis soal tidak dikenal: ${soal.ditanya}`);
  }
  if (ringkas && soal.kenali === 'tandai') urutan.unshift('kenali');
  // Impas: tidak ada selisih/persen yang perlu dihitung.
  if (k.jenis === 'impas') urutan = urutan.filter((x) => !['selisih', 'pembagi', 'persen', 'cekPersen', 'cekSelisih'].includes(x));

  return urutan.filter(Boolean).map((kode) => ({ kode, ...PEMBUAT[kode](soal, k) }));
}

const PEMBUAT = {
  kenali(soal, k) {
    const bagian = [];
    if (soal.hb != null) bagian.push(`${soal.ditanya === 'hj' ? 'modal' : 'harga beli'} ${rp(soal.hb)}`);
    for (const o of soal.ongkos || []) bagian.push(`${o.nama} ${rp(o.nilai)}`);
    if (soal.hj != null && soal.ditanya !== 'hj') bagian.push(`harga jual ${rp(soal.hj)}`);
    if (soal.persen != null) bagian.push(`${soal.jenis} ${pc(soal.persen)}`);
    let penjelasan = `Diketahui ${bagian.join(', ')}.`;
    if (['selisih', 'persen', 'kenali'].includes(soal.ditanya) && !(soal.ongkos || []).length) {
      penjelasan += ' Tidak ada biaya tambahan, jadi modal = harga beli.';
    }
    const peran = tokenCerita(soal.cerita).map((t) => t.peran);
    return {
      judul: 'Kenali informasinya',
      rumus: '🛒 harga beli · 📦 biaya tambahan · 💰 harga jual',
      jenisInput: soal.kenali === 'tandai' ? 'tandai' : 'tampil',
      pertanyaan: 'Ketuk setiap angka di cerita, lalu pilih labelnya.',
      penjelasan,
      visual: () => papanDiketahui(soal),
      ringkas: 'Informasi sudah dikenali',
      periksa(label) {
        if (label.some((x) => !x)) return { benar: false, kode: 'T1' };
        const salah = [];
        let kode = null;
        peran.forEach((p, i) => {
          const hasil = d.diagnosaTanda(p, label[i]);
          if (!hasil.benar) { salah.push(i); kode = kode || hasil.kode; }
        });
        return salah.length ? { benar: false, kode, salah } : { benar: true };
      },
    };
  },

  modal(soal, k) {
    const ongkos = soal.ongkos || [];
    return {
      judul: 'Isi keranjang modal',
      rumus: 'Modal = Harga beli + Biaya tambahan',
      jenisInput: 'keranjang',
      pertanyaan: 'Ketuk semua uang yang DIKELUARKAN pedagang.',
      item: [
        { kunci: 'hb', peran: 'hb', label: 'Harga beli', nilai: soal.hb },
        ...ongkos.map((o, i) => ({ kunci: `ongkos-${i}`, peran: 'ongkos', label: besar(o.nama), nilai: o.nilai })),
        { kunci: 'hj', peran: 'hj', label: 'Harga jual', nilai: soal.hj },
      ],
      penjelasan: `Modal = ${[soal.hb, ...ongkos.map((o) => o.nilai)].map(rp).join(' + ')} = ${rp(k.modal)}`,
      ringkas: `🛒 Modal = ${rp(k.modal)}`,
      periksa: (dipilih) => d.diagnosaKeranjang(soal, dipilih),
    };
  },

  bandingkan(soal, k) {
    const tanda = soal.hj > k.modal ? '>' : soal.hj < k.modal ? '<' : '=';
    return {
      judul: 'Bandingkan: untung atau rugi?',
      rumus: 'Harga jual > modal → untung · Harga jual < modal → rugi',
      jenisInput: 'pilih',
      pertanyaan: `Harga jual ${rp(soal.hj)}, modal ${rp(k.modal)}. Pedagang…`,
      opsi: [
        { nilai: 'untung', teks: '⬆️ Untung' },
        { nilai: 'rugi', teks: '⬇️ Rugi' },
        { nilai: 'impas', teks: '🟰 Impas' },
      ],
      penjelasan: `Harga jual ${rp(soal.hj)} ${tanda} modal ${rp(k.modal)}, jadi ${k.jenis.toUpperCase()}.`,
      ringkas: k.jenis === 'untung' ? '⬆️ Untung' : k.jenis === 'rugi' ? '⬇️ Rugi' : '🟰 Impas',
      periksa: (v) => d.diagnosaJenis(soal, v),
    };
  },

  selisih(soal, k) {
    const untung = k.jenis === 'untung';
    const atas = untung ? { peran: 'hj', nilai: soal.hj } : { peran: 'modal', nilai: k.modal };
    const bawah = untung ? { peran: 'modal', nilai: k.modal } : { peran: 'hj', nilai: soal.hj };
    return {
      judul: `Hitung besar ${k.jenis}`,
      rumus: untung ? 'Untung = Harga jual − Modal' : 'Rugi = Modal − Harga jual',
      jenisInput: 'rupiah',
      label: `Besar ${k.jenis}`,
      penjelasan: `${rp(atas.nilai)} − ${rp(bawah.nilai)} = ${rp(k.selisih)}`,
      visual: () => visualKurang(atas, bawah, k.selisih, k.jenis),
      ringkas: `${besar(k.jenis)} = ${rp(k.selisih)}`,
      pilihan: pilihanAngka(k.selisih, [
        (soal.ongkos || []).length && Math.abs(soal.hj - soal.hb), // M2: lupa ongkos
        k.selisih * 10, // M5: salah jumlah nol
        soal.hj, // M3: tertukar
        k.selisih % 1000 === 0 && k.selisih / 10,
        k.selisih + 5000, k.selisih + 2000, k.selisih + 1000,
      ], rp, bulatRupiah),
      periksa: (v) => d.diagnosaSelisih(soal, v),
    };
  },

  pembagi(soal, k) {
    return {
      judul: 'Pilih pembaginya',
      rumus: `% ${besar(k.jenis)} = ${besar(k.jenis)} ÷ ❓ × 100%`,
      jenisInput: 'pilih',
      pertanyaan: `${besar(k.jenis)} ${rp(k.selisih)} dibagi dengan…`,
      opsi: acak([
        { nilai: 'modal', teks: `🛒 Modal ${rp(k.modal)}` },
        { nilai: 'hj', teks: `💰 Harga jual ${rp(soal.hj)}` },
      ]),
      penjelasan: `${besar(k.jenis)} selalu dibandingkan dengan modal (uang yang dikeluarkan). Jadi dibagi ${rp(k.modal)}.`,
      ringkas: `Pembagi = 🛒 modal ${rp(k.modal)}`,
      periksa: (v) => (v === 'modal' ? { benar: true } : { benar: false, kode: 'M1' }),
    };
  },

  persen(soal, k) {
    const bulat = Number.isInteger(k.persen);
    return {
      judul: `Hitung persentase ${k.jenis}`,
      rumus: `% ${besar(k.jenis)} = ${besar(k.jenis)} ÷ Modal × 100%`,
      jenisInput: 'persen',
      label: `Persentase ${k.jenis}`,
      catatan: bulat ? null : 'Bulatkan sampai 2 angka di belakang koma. Contoh: 11,11',
      penjelasan: `${rp(k.selisih)} ÷ ${rp(k.modal)} × 100% = ${pc(k.persen)}`,
      visual: () => visualPecahan(k.selisih, k.modal, k.persen, k.jenis),
      ringkas: `Persentase ${k.jenis} = ${pc(k.persen)}`,
      pilihan: pilihanAngka(k.persen, [
        soal.hj > 0 && hitungPersen(k.selisih, soal.hj), // M1: dibagi harga jual
        (soal.ongkos || []).length && hitungPersen(Math.abs(soal.hj - soal.hb), soal.hb), // M2: lupa ongkos
        k.persen / 100, // M4: lupa × 100
        k.persen * 2, 100 - k.persen, k.persen + 5,
      ], pc, bulatPersen),
      periksa: (v) => d.diagnosaPersen(soal, v),
    };
  },

  cekPersen(soal, k) {
    return {
      judul: 'Cek kewajaran',
      rumus: `Cek balik: persen × modal = ${k.jenis}`,
      jenisInput: 'pilih',
      pertanyaan: `${pc(k.persen)} × ${rp(k.modal)} = …`,
      opsi: opsiRupiah(k.selisih, (soal.hj * k.persen) / 100, k.selisih * 10),
      penjelasan: `${pc(k.persen)} × ${rp(k.modal)} = ${rp(k.selisih)}, sama dengan besar ${k.jenis}nya. Jawabanmu wajar! ✔`,
      ringkas: 'Cek kewajaran: wajar ✔',
      periksa: (v) => (v === k.selisih ? { benar: true } : { benar: false, kode: 'C1' }),
    };
  },

  cekSelisih(soal, k) {
    const untung = k.jenis === 'untung';
    return {
      judul: 'Cek kewajaran',
      rumus: untung ? 'Cek: modal + untung = harga jual' : 'Cek: modal − rugi = harga jual',
      jenisInput: 'pilih',
      pertanyaan: untung ? `${rp(k.modal)} + ${rp(k.selisih)} = …` : `${rp(k.modal)} − ${rp(k.selisih)} = …`,
      opsi: opsiRupiah(soal.hj, untung ? k.modal - k.selisih : k.modal + k.selisih, untung ? soal.hj + k.selisih : soal.hj - k.selisih),
      penjelasan: `Hasilnya ${rp(soal.hj)}, sama dengan harga jual. Jawabanmu wajar! ✔`,
      ringkas: 'Cek kewajaran: wajar ✔',
      periksa: (v) => (v === soal.hj ? { benar: true } : { benar: false, kode: 'C2' }),
    };
  },

  faktorHj(soal) {
    const p = soal.persen;
    const untung = soal.jenis === 'untung';
    const f = untung ? 100 + p : 100 - p;
    return {
      judul: 'Berapa persen harga jualnya?',
      rumus: 'Modal = 100%',
      jenisInput: 'pilih',
      pertanyaan: `${besar(soal.jenis)} ${pc(p)}. Harga jual = … dari modal`,
      opsi: [
        { nilai: 'tambah', teks: `100% + ${pc(p)} = ${pc(100 + p)}` },
        { nilai: 'kurang', teks: `100% − ${pc(p)} = ${pc(100 - p)}` },
        { nilai: 'saja', teks: `${pc(p)} saja` },
      ],
      penjelasan: `${besar(soal.jenis)} ${pc(p)}, jadi harga jual = 100% ${untung ? '+' : '−'} ${pc(p)} = ${pc(f)} dari modal.`,
      ringkas: `Harga jual = ${pc(f)} × modal`,
      periksa(v) {
        if (v === (untung ? 'tambah' : 'kurang')) return { benar: true };
        return { benar: false, kode: v === 'saja' ? 'H1' : 'H2' };
      },
    };
  },

  hasilHj(soal, k) {
    const f = soal.jenis === 'untung' ? 100 + soal.persen : 100 - soal.persen;
    return {
      judul: 'Hitung harga jual',
      rumus: `Harga jual = Modal × ${pc(f)}`,
      jenisInput: 'rupiah',
      label: 'Harga jual',
      penjelasan: `${rp(k.modal)} × ${angka(f)}/100 = ${rp(k.hj)}`,
      ringkas: `💰 Harga jual = ${rp(k.hj)}`,
      pilihan: pilihanAngka(k.hj, [
        (k.modal * soal.persen) / 100, // H1: baru besar untung/ruginya
        (k.modal * (soal.jenis === 'rugi' ? 100 + soal.persen : 100 - soal.persen)) / 100, // H2: arah terbalik
        k.hj * 10, // M5
        k.hj + 10000,
      ], rp, bulatRupiah),
      periksa: (v) => d.diagnosaHasil(soal, v),
    };
  },

  cekHj(soal, k) {
    const untung = soal.jenis === 'untung';
    const selisih = Math.abs(k.hj - k.modal);
    return {
      judul: 'Cek kewajaran',
      rumus: untung ? 'Untung = Harga jual − Modal' : 'Rugi = Modal − Harga jual',
      jenisInput: 'pilih',
      pertanyaan: untung ? `Untung = ${rp(k.hj)} − ${rp(k.modal)} = …` : `Rugi = ${rp(k.modal)} − ${rp(k.hj)} = …`,
      opsi: opsiRupiah(selisih, selisih * 10, k.hj + k.modal),
      penjelasan: `${rp(selisih)} adalah ${pc(soal.persen)} dari ${rp(k.modal)}. Jawabanmu wajar! ✔`,
      ringkas: 'Cek kewajaran: wajar ✔',
      periksa: (v) => (v === selisih ? { benar: true } : { benar: false, kode: 'C2' }),
    };
  },

  faktorModal(soal) {
    const p = soal.persen;
    const untung = soal.jenis === 'untung';
    const f = untung ? 100 + p : 100 - p;
    return {
      judul: 'Bagaimana mencari modal?',
      rumus: `Modal = 100% · Harga jual = ${pc(f)}`,
      jenisInput: 'pilih',
      pertanyaan: `Harga jual adalah ${pc(f)} dari modal. Maka modal = …`,
      opsi: [
        { nilai: 'bagi', teks: `Harga jual × 100/${angka(f)}` },
        { nilai: 'kali', teks: `Harga jual × ${angka(f)}/100` },
        { nilai: 'kurang', teks: `Harga jual ${untung ? '−' : '+'} ${pc(p)} × harga jual` },
      ],
      penjelasan: `Harga jual = ${pc(f)} × modal, maka modal = harga jual × 100/${angka(f)}.`,
      ringkas: `Modal = harga jual × 100/${angka(f)}`,
      periksa(v) {
        if (v === 'bagi') return { benar: true };
        return { benar: false, kode: v === 'kali' ? 'H3' : 'H4' };
      },
    };
  },

  hasilModal(soal, k) {
    const f = soal.jenis === 'untung' ? 100 + soal.persen : 100 - soal.persen;
    return {
      judul: 'Hitung modal',
      rumus: `Modal = Harga jual × 100 ÷ ${angka(f)}`,
      jenisInput: 'rupiah',
      label: 'Modal',
      penjelasan: `${rp(soal.hj)} × 100/${angka(f)} = ${rp(k.modal)}`,
      ringkas: `🛒 Modal = ${rp(k.modal)}`,
      pilihan: pilihanAngka(k.modal, [
        (soal.hj * (soal.jenis === 'rugi' ? 100 - soal.persen : 100 + soal.persen)) / 100, // H3: dikali, bukan dibagi
        (soal.hj * (soal.jenis === 'rugi' ? 100 + soal.persen : 100 - soal.persen)) / 100, // H4: persen dari harga jual
        k.modal * 10, // M5
        k.modal + 10000,
      ], rp, bulatRupiah),
      periksa: (v) => d.diagnosaHasil(soal, v),
    };
  },

  cekModal(soal, k) {
    const f = soal.jenis === 'untung' ? 100 + soal.persen : 100 - soal.persen;
    const bagian = Math.round((k.modal * soal.persen) / 100);
    return {
      judul: 'Cek kewajaran',
      rumus: `Cek balik: modal × ${pc(f)} = harga jual`,
      jenisInput: 'pilih',
      pertanyaan: `${rp(k.modal)} × ${pc(f)} = …`,
      opsi: opsiRupiah(soal.hj, bagian, soal.hj + bagian),
      penjelasan: `Hasilnya ${rp(soal.hj)}, sama dengan harga jual. Jawabanmu wajar! ✔`,
      ringkas: 'Cek kewajaran: wajar ✔',
      periksa: (v) => (v === soal.hj ? { benar: true } : { benar: false, kode: 'C2' }),
    };
  },
};
