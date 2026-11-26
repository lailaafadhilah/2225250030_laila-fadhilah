// Pembatas jumlah permintaan (rate limit) sederhana di memori.
// Catatan: di Vercel tiap instans punya memori sendiri, jadi ini perlindungan "usaha terbaik".
// Untuk perlindungan penuh, aktifkan juga Vercel Firewall (lihat docs/ai-tutor.md).

const MENIT = 60_000;
const HARI = 24 * 60 * MENIT;

export function buatPembatas({ perMenitIp, perHariIp, perMenitTotal }, sekarang = () => Date.now()) {
  const catatan = new Map(); // ip -> daftar waktu permintaan (maks. 1 hari)
  let total = [];

  /** Mengembalikan { boleh: true } atau { boleh: false, tunggu: detik, alasan }. */
  return function cek(ip) {
    const t = sekarang();
    total = total.filter((w) => t - w < MENIT);
    const daftar = (catatan.get(ip) || []).filter((w) => t - w < HARI);
    const semenit = daftar.filter((w) => t - w < MENIT);

    if (total.length >= perMenitTotal) {
      return { boleh: false, tunggu: Math.ceil((MENIT - (t - total[0])) / 1000), alasan: 'RAMAI' };
    }
    if (semenit.length >= perMenitIp) {
      return { boleh: false, tunggu: Math.ceil((MENIT - (t - semenit[0])) / 1000), alasan: 'TERLALU_CEPAT' };
    }
    if (daftar.length >= perHariIp) {
      return { boleh: false, tunggu: Math.ceil((HARI - (t - daftar[0])) / 1000), alasan: 'BATAS_HARIAN' };
    }
    daftar.push(t);
    total.push(t);
    catatan.set(ip, daftar);
    // Bersihkan IP lama agar memori tidak terus bertambah
    if (catatan.size > 5000) {
      for (const [k, v] of catatan) if (!v.length || t - v[v.length - 1] > HARI) catatan.delete(k);
    }
    return { boleh: true };
  };
}

/** Alamat IP klien dari header Vercel. */
export function ipKlien(request) {
  const terusan = request.headers.get('x-forwarded-for') || '';
  return terusan.split(',')[0].trim() || request.headers.get('x-real-ip') || 'tanpa-ip';
}
