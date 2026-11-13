// Pembantu kecil untuk membuat elemen HTML tanpa framework.

/**
 * h('button', { class: 'btn', onclick: fn }, 'Teks')
 * Atribut yang diawali "on" menjadi event listener. Nilai null/false diabaikan.
 */
export function h(tag, atribut = {}, ...anak) {
  const el = document.createElement(tag);
  for (const [nama, nilai] of Object.entries(atribut || {})) {
    if (nilai == null || nilai === false) continue;
    if (nama === 'class') el.className = nilai;
    else if (nama.startsWith('on')) el.addEventListener(nama.slice(2), nilai);
    else if (nama in el && typeof nilai !== 'string') el[nama] = nilai;
    else el.setAttribute(nama, nilai === true ? '' : nilai);
  }
  for (const a of anak.flat(Infinity)) {
    if (a == null || a === false) continue;
    el.append(a instanceof Node ? a : String(a));
  }
  return el;
}

/** Tombol standar. jenis: "utama" | "kedua" */
export function tombol(teks, aksi, jenis = 'utama', atribut = {}) {
  return h('button', { type: 'button', class: `btn btn-${jenis}`, onclick: aksi, ...atribut }, teks);
}

/** Bar tombol bawah (maks. 2 tombol: kiri = kedua, kanan = utama). */
export function barAksi(kiri, kanan) {
  return h('div', { class: 'aksi' }, kiri || h('span'), kanan || h('span'));
}

/** Mengacak salinan array (Fisher–Yates). */
export function acak(daftar) {
  const salinan = [...daftar];
  for (let i = salinan.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [salinan[i], salinan[j]] = [salinan[j], salinan[i]];
  }
  return salinan;
}
