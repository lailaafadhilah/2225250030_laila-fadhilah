// Layar beranda, peta, buku contoh, kamus, dan pengaturan.
import { h, tombol } from '../ui/dom.js';
import { bukaLembar } from '../ui/lembar.js';
import { tampilkanToast } from '../ui/toast.js';
import { muatDaftarWilayah, muatSemuaWilayah, muatIstilah, muatMateri } from '../konten.js';
import { jalankanMateri } from '../aktivitas/materi.js';
import * as progres from '../state/progres.js';
import * as pwa from '../pasang.js';
import { contohPenuh } from '../soal/runner.js';
import { ilustrasi, maskot, latarAwan } from '../ui/ilustrasi.js';
import { petaPasar } from '../ui/peta-pasar.js';
import { mulaiMusik, hentikanMusik } from '../ui/suara.js';

// ---------- Peta Petualangan (F01) ----------
export async function layarPeta(akar, _param, app) {
  app.aturJudul('🏪 Pasar Juragan');
  const daftar = await muatDaftarWilayah();
  const p = progres.muat();
  // Wilayah yang sedang dikerjakan = wilayah terbuka pertama yang belum selesai
  const sekarang = daftar.find((w) => progres.statusWilayah(w.id) === 'terbuka');
  const jumlahLencana = daftar.filter((w) => progres.statusWilayah(w.id) === 'selesai').length;
  const peta = petaPasar(daftar, {
    status: progres.statusWilayah,
    bintang: (id) => p.wilayah[id]?.bintang || 0,
    sekarang: sekarang?.id,
    onPilih: (id) => { location.hash = `#wilayah-${id}`; },
  });
  akar.replaceChildren(
    h('div', { class: 'peta-statistik' },
      h('span', { class: 'pil' }, p.nama ? `👋 ${p.nama}` : '👋 Halo!'),
      h('span', { class: 'pil' }, `⭐ ${progres.totalBintang()}`),
      h('span', { class: 'pil' }, `🏅 ${jumlahLencana}/${daftar.length}`)),
    peta,
  );
  // Gulir otomatis ke wilayah yang sedang dikerjakan
  requestAnimationFrame(() => (peta.querySelector('.kios-sekarang') || peta.querySelector('.kios-tombol'))
    ?.scrollIntoView({ block: 'center' }));
}

// ---------- Buku Contoh (F13) ----------
export async function layarBuku(akar, _param, app) {
  app.aturJudul('📖 Buku Contoh', { kembali: '#materi' });
  const semua = await muatSemuaWilayah();
  const dibuka = new Set(progres.muat().contoh_dibuka);
  const bagian = semua.map((w) => {
    const contoh = w.aktivitas.filter((a) => a.tipe === 'contoh' && dibuka.has(a.id));
    if (!contoh.length) return null;
    return h('section', { class: 'buku-bagian' },
      h('h2', {}, `${w.ikon} ${w.nama}`),
      h('div', { class: 'daftar-opsi' }, contoh.map((c) => tombol(`📄 ${c.judul}`,
        () => bukaLembar(c.judul, contohPenuh(c.soal)), 'kedua', { class: 'btn btn-kedua btn-lebar' }))));
  }).filter(Boolean);
  akar.replaceChildren(bagian.length ? h('div', {}, h('p', { class: 'catatan-kecil' }, 'Contoh yang sudah kamu pelajari. Buka lagi kapan saja kalau lupa.'), bagian)
    : h('section', { class: 'kartu kosong' }, h('p', {}, 'Belum ada contoh.'), h('p', {}, 'Mulai dari Wilayah 1 di Peta. Contoh yang kamu pelajari akan tersimpan di sini.')));
}

// ---------- Materi (penjelasan sebelum berpetualang) ----------
export async function layarMateri(akar, [id], app) {
  const daftar = await muatMateri();
  const p = progres.muat();
  if (id === 'rangkuman') {
    app.aturJudul('📋 Rangkuman Rumus', { kembali: '#materi' });
    akar.replaceChildren(h('div', {}, daftar.map((b) => {
      const rumus = b.halaman.flatMap((hal) => hal.rumus || []);
      if (!rumus.length) return null;
      return h('section', { class: 'kartu' }, h('h2', {}, `${b.ikon} ${b.judul}`),
        h('div', { class: 'rumus-materi' }, rumus.map((r) => h('p', {}, r))));
    }), h('p', { class: 'kotak-awas' }, '⚠️ Persentase untung/rugi SELALU dibagi MODAL, bukan harga jual.')));
    return;
  }
  const bab = daftar.find((b) => b.id === id);
  if (bab) {
    app.aturJudul(`${bab.ikon} ${bab.judul}`, { kembali: '#materi' });
    jalankanMateri(akar, bab, {
      labelSelesai: 'Selesai ✔',
      onSelesai: () => { progres.tandaiMateri(bab.id); location.hash = '#materi'; },
    });
    return;
  }
  app.aturJudul('📘 Materi', { kembali: '#beranda' });
  const dibaca = new Set(p.materi_dibaca || []);
  akar.replaceChildren(
    h('div', { class: 'sapa-maskot' }, maskot('lambai'),
      h('p', { class: 'gelembung' }, 'Baca materinya dulu, ya!', h('small', {}, 'Penjelasan singkat, satu ide per halaman.'))),
    h('ol', { class: 'daftar-bab' }, daftar.map((b, i) => h('li', { style: `--i:${i}` },
      h('button', { type: 'button', class: 'opsi bab-item', onclick: () => { location.hash = `#materi-${b.id}`; } },
        h('span', { class: 'bab-ikon', 'aria-hidden': 'true' }, b.ikon),
        h('span', { class: 'bab-teks' }, h('small', {}, `Bab ${i + 1} · ${b.halaman.length} halaman`), h('b', {}, b.judul)),
        dibaca.has(b.id) ? h('span', { class: 'bab-centang', 'aria-label': 'sudah dibaca' }, '✔') : null)))),
    h('div', { class: 'daftar-opsi' },
      tombol('📋 Rangkuman Rumus', () => { location.hash = '#materi-rangkuman'; }, 'kedua', { class: 'btn btn-kedua btn-lebar' }),
      tombol('📖 Buku Contoh', () => { location.hash = '#buku'; }, 'kedua', { class: 'btn btn-kedua btn-lebar' }),
      tombol('📚 Kamus Istilah', () => { location.hash = '#kamus'; }, 'kedua', { class: 'btn btn-kedua btn-lebar' })),
  );
}

// ---------- Kamus Istilah (F14) ----------
export async function isiKamus() {
  const istilah = await muatIstilah();
  return h('dl', { class: 'kamus' }, istilah.map((i) => h('div', { class: 'kamus-item' },
    h('dt', {}, h('span', { 'aria-hidden': 'true' }, i.ikon, ' '), i.istilah),
    h('dd', {}, i.definisi, h('span', { class: 'kamus-contoh' }, 'Contoh: ', i.contoh)))));
}

export async function layarKamus(akar, _param, app) {
  app.aturJudul('📚 Kamus Istilah', { kembali: '#materi' });
  akar.replaceChildren(await isiKamus());
}

// ---------- Pengaturan ----------
export async function layarPengaturan(akar, _param, app) {
  app.aturJudul('👤 Profil & Pengaturan', { kembali: '#beranda' });
  const p = progres.muat();

  const nama = h('input', { type: 'text', class: 'input-teks', maxlength: '20', value: p.nama, 'aria-label': 'Nama panggilan' });
  nama.addEventListener('change', () => { p.nama = nama.value.trim(); progres.simpan(); tampilkanToast('Nama disimpan.'); });

  const ukuran = h('select', { class: 'input-teks', 'aria-label': 'Ukuran teks' },
    h('option', { value: 'normal' }, 'Normal'), h('option', { value: 'besar' }, 'Besar'));
  ukuran.value = p.pengaturan.ukuran_teks;
  ukuran.addEventListener('change', () => {
    p.pengaturan.ukuran_teks = ukuran.value;
    document.documentElement.dataset.teks = ukuran.value;
    progres.simpan();
  });

  const animasi = h('select', { class: 'input-teks', 'aria-label': 'Animasi' },
    h('option', { value: 'nyala' }, 'Nyala'), h('option', { value: 'hemat' }, 'Hemat (tanpa gerakan)'));
  animasi.value = p.pengaturan.animasi;
  animasi.addEventListener('change', () => {
    p.pengaturan.animasi = animasi.value;
    document.documentElement.dataset.animasi = animasi.value;
    progres.simpan();
  });

  const efek = h('select', { class: 'input-teks', 'aria-label': 'Suara efek' },
    h('option', { value: 'ya' }, 'Nyala'), h('option', { value: 'tidak' }, 'Mati'));
  efek.value = p.pengaturan.suara === false ? 'tidak' : 'ya';
  efek.addEventListener('change', () => { p.pengaturan.suara = efek.value === 'ya'; progres.simpan(); });
  const musik = h('select', { class: 'input-teks', 'aria-label': 'Musik latar' },
    h('option', { value: 'tidak' }, 'Mati'), h('option', { value: 'ya' }, 'Nyala'));
  musik.value = p.pengaturan.musik ? 'ya' : 'tidak';
  musik.addEventListener('change', () => {
    p.pengaturan.musik = musik.value === 'ya';
    progres.simpan();
    if (p.pengaturan.musik) mulaiMusik(); else hentikanMusik();
  });
  const tombolPasang = h('div');
  const gambarPasang = () => {
    tombolPasang.replaceChildren();
    if (pwa.sudahTerpasang()) tombolPasang.append(h('p', { class: 'catatan-kecil' }, '✔ Aplikasi sudah terpasang.'));
    else if (pwa.bisaPasang()) tombolPasang.append(tombol('📲 Pasang Aplikasi', () => pwa.pasang(), 'kedua', { class: 'btn btn-kedua btn-lebar' }));
    else if (pwa.adalahIOS()) tombolPasang.append(h('p', { class: 'catatan-kecil' }, '📲 iPhone: ketuk Bagikan → "Tambahkan ke Layar Utama".'));
    else tombolPasang.append(h('p', { class: 'catatan-kecil' }, '📲 Android: menu ⋮ browser → "Tambahkan ke layar utama".'));
  };
  app.saatTinggal(pwa.saatBerubah(gambarPasang));
  gambarPasang();

  const caraJawab = h('select', { class: 'input-teks', 'aria-label': 'Cara menjawab' },
    h('option', { value: 'klik' }, 'Klik pilihan (mudah)'), h('option', { value: 'ketik' }, 'Ketik angka (tantangan)'));
  caraJawab.value = p.pengaturan.cara_jawab;
  caraJawab.addEventListener('change', () => { p.pengaturan.cara_jawab = caraJawab.value; progres.simpan(); tampilkanToast('Cara menjawab disimpan.'); });

  const bukaSemua = h('input', { type: 'checkbox', checked: p.pengaturan.buka_semua });
  bukaSemua.addEventListener('change', () => { p.pengaturan.buka_semua = bukaSemua.checked; progres.simpan(); });

  // Konfirmasi di halaman (dialog confirm() tidak tampil di semua perangkat)
  let yakinHapus = false;
  const tombolHapus = tombol('Hapus semua kemajuan', () => {
    if (!yakinHapus) {
      yakinHapus = true;
      tombolHapus.textContent = '⚠️ Yakin? Ketuk sekali lagi untuk menghapus';
      setTimeout(() => { yakinHapus = false; tombolHapus.textContent = 'Hapus semua kemajuan'; }, 5000);
      return;
    }
    progres.setelUlang();
    location.hash = '#beranda';
  }, 'kedua', { class: 'btn btn-kedua btn-bahaya' });

  const kodeEkspor = h('textarea', { class: 'input-teks kode', readonly: true, rows: '3', 'aria-label': 'Kode kemajuan' });
  const kodeImpor = h('textarea', { class: 'input-teks kode', rows: '3', placeholder: 'Tempel kode kemajuan di sini', 'aria-label': 'Kode untuk diimpor' });

  akar.replaceChildren(h('div', { class: 'pengaturan' },
    h('section', { class: 'kartu' }, h('h2', {}, 'Profil'),
      h('label', { class: 'baris-atur' }, 'Nama panggilan', nama),
      h('label', { class: 'baris-atur' }, 'Ukuran teks', ukuran),
      h('label', { class: 'baris-atur' }, 'Animasi', animasi),
      h('label', { class: 'baris-atur' }, 'Suara efek (klik, benar, salah)', efek),
      h('label', { class: 'baris-atur' }, 'Musik latar', musik),
      tombolPasang,
      h('p', { class: 'catatan-kecil' }, 'Pilih "Hemat" jika HP terasa lambat atau gerakan terasa mengganggu.')),
    h('section', { class: 'kartu' }, h('h2', {}, 'Untuk guru'),
      h('label', { class: 'baris-atur' }, 'Cara menjawab hitungan', caraJawab),
      h('p', { class: 'catatan-kecil' }, '"Klik pilihan": siswa cukup memilih jawaban. "Ketik angka": siswa menghitung dan mengetik sendiri.'),
      h('label', { class: 'baris-cek' }, bukaSemua, ' Buka semua wilayah (mode guru)'),
      h('p', { class: 'catatan-kecil' }, 'Kesalahan yang paling sering terjadi di perangkat ini:'),
      ringkasanSalah(p.statistik_salah)),
    h('section', { class: 'kartu' }, h('h2', {}, 'Pindahkan kemajuan'),
      h('p', { class: 'catatan-kecil' }, 'Salin kode ini untuk dipakai di HP lain atau diserahkan ke guru.'),
      tombol('Buat kode', () => { kodeEkspor.value = progres.eksporKode(); kodeEkspor.select(); }, 'kedua'),
      kodeEkspor,
      kodeImpor,
      tombol('Impor kode', () => {
        try { progres.imporKode(kodeImpor.value); tampilkanToast('Kemajuan berhasil diimpor.'); location.hash = '#peta'; } catch { tampilkanToast('Kode tidak valid.'); }
      }, 'kedua')),
    h('section', { class: 'kartu' }, h('h2', {}, 'Lainnya'),
      tombolHapus,
      h('p', { class: 'catatan-kecil' }, 'ProfitQuest v1.0.0 · Data hanya tersimpan di perangkat ini.')),
  ));
}

const NAMA_SALAH = {
  M1: 'Membagi dengan harga jual', M2: 'Lupa biaya tambahan', M3: 'Tertukar harga beli & jual',
  M4: 'Lupa × 100%', M5: 'Salah jumlah nol', M6: 'Salah menentukan untung/rugi',
  H1: 'Lupa menambah modal', H2: 'Arah untung/rugi terbalik', H3: 'Dikali, bukan dibagi', H4: 'Persen dari harga jual',
  K1: 'Harga jual masuk modal', K2: 'Harga beli tidak masuk modal', P1: 'Memakai angka pengecoh',
};

function ringkasanSalah(statistik) {
  const urut = Object.entries(statistik).filter(([k]) => NAMA_SALAH[k]).sort((a, b) => b[1] - a[1]).slice(0, 5);
  if (!urut.length) return h('p', { class: 'catatan-kecil' }, 'Belum ada data.');
  return h('ul', { class: 'daftar-salah' }, urut.map(([k, n]) => h('li', {}, `${k} · ${NAMA_SALAH[k]}: ${n}×`)));
}
