// Mengubah teks jawaban AI menjadi elemen HTML yang AMAN (tanpa innerHTML).
// Mendukung: paragraf, **tebal**, daftar "- " / "* ", dan daftar bernomor "1. ".
import { h } from '../ui/dom.js';

/** "Untung **Rp2.000**" → ['Untung ', <b>Rp2.000</b>] */
function sebaris(teks) {
  return teks.split(/(\*\*[^*]+\*\*)/g).filter(Boolean)
    .map((bagian) => (/^\*\*[^*]+\*\*$/.test(bagian) ? h('b', {}, bagian.slice(2, -2)) : bagian.replace(/\*/g, '')));
}

export function formatJawaban(teks) {
  const hasil = [];
  let daftar = null;
  for (const baris of teks.split('\n').map((b) => b.trim())) {
    const butir = baris.match(/^[-*•]\s+(.*)$/);
    const nomor = baris.match(/^(\d+)[.)]\s+(.*)$/);
    if (butir || nomor) {
      const tag = nomor ? 'ol' : 'ul';
      if (!daftar || daftar.tagName.toLowerCase() !== tag) {
        daftar = h(tag, nomor ? { start: nomor[1] } : {});
        hasil.push(daftar);
      }
      daftar.append(h('li', {}, sebaris(nomor ? nomor[2] : butir[1])));
    } else if (baris) {
      daftar = null;
      hasil.push(h('p', {}, sebaris(baris.replace(/^#+\s*/, ''))));
    } else {
      daftar = null;
    }
  }
  return hasil;
}
