// Lembar bawah (bottom sheet) untuk Kamus, Buku Contoh, dan pilihan label.
import { h } from './dom.js';

let tutupAktif = null;

/** Membuka lembar. Mengembalikan fungsi untuk menutupnya. */
export function bukaLembar(judul, isi) {
  if (tutupAktif) tutupAktif();
  const asal = document.activeElement;
  const tombolTutup = h('button', { type: 'button', class: 'lembar-tutup', 'aria-label': 'Tutup' }, '✕');
  const panel = h('div', { class: 'lembar-panel', role: 'dialog', 'aria-modal': 'true', 'aria-label': judul },
    h('div', { class: 'lembar-kepala' }, h('h2', {}, judul), tombolTutup),
    h('div', { class: 'lembar-isi' }, isi),
  );
  const latar = h('div', { class: 'lembar-latar' }, panel);

  const tutup = () => {
    latar.remove();
    document.removeEventListener('keydown', tekanTombol);
    tutupAktif = null;
    if (asal && asal.focus) asal.focus();
  };
  const tekanTombol = (e) => { if (e.key === 'Escape') tutup(); };

  tombolTutup.addEventListener('click', tutup);
  latar.addEventListener('click', (e) => { if (e.target === latar) tutup(); });
  document.addEventListener('keydown', tekanTombol);
  document.body.append(latar);
  tombolTutup.focus();
  tutupAktif = tutup;
  return tutup;
}

export function tutupLembar() {
  if (tutupAktif) tutupAktif();
}
