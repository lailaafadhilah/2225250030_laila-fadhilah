// Pembantu animasi. Semua gaya ada di css/animasi.css.

/** Animasi boleh jalan? (mati jika mode hemat atau gerak dikurangi di sistem) */
export function bolehAnimasi() {
  return document.documentElement.dataset.animasi !== 'hemat'
    && !window.matchMedia('(prefers-reduced-motion: reduce)').matches;
}

/** Memutar ulang satu kelas animasi pada elemen, lalu melepasnya setelah selesai. */
export function animasikan(el, kelas) {
  if (!el) return;
  el.classList.remove(kelas);
  void el.offsetWidth; // paksa browser mengulang animasi
  el.classList.add(kelas);
  const selesai = (e) => {
    if (e.target !== el) return; // abaikan animasi milik elemen anak
    el.classList.remove(kelas);
    el.removeEventListener('animationend', selesai);
  };
  el.addEventListener('animationend', selesai);
}

/** Hujan konfeti singkat untuk merayakan (hanya di layar hasil). */
export function konfeti(jumlah = 40) {
  if (!bolehAnimasi()) return;
  const warna = ['#1E5FBF', '#1B7F3B', '#F6BE3B', '#B45309', '#6D28D9', '#0F766E', '#E11D48'];
  const wadah = document.createElement('div');
  wadah.className = 'konfeti';
  wadah.setAttribute('aria-hidden', 'true');
  for (let i = 0; i < jumlah; i++) {
    const s = document.createElement('span');
    const ukuran = 6 + Math.random() * 7;
    s.style.left = `${Math.random() * 100}%`;
    s.style.width = `${ukuran}px`;
    s.style.height = `${ukuran * (Math.random() < 0.5 ? 1 : 0.45)}px`;
    s.style.background = warna[i % warna.length];
    s.style.animationDelay = `${Math.random() * 0.5}s`;
    s.style.animationDuration = `${1.8 + Math.random() * 1.3}s`;
    s.style.setProperty('--geser', `${(Math.random() - 0.5) * 160}px`);
    s.style.setProperty('--putar', `${360 + Math.random() * 540}deg`);
    wadah.append(s);
  }
  document.body.append(wadah);
  setTimeout(() => wadah.remove(), 3600);
}
