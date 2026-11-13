// Pesan singkat di bawah layar.
import { h } from './dom.js';

export function tampilkanToast(pesan, tindakan = null, lama = 4000) {
  document.querySelector('.toast')?.remove();
  const el = h('div', { class: 'toast', role: 'status' },
    h('span', {}, pesan),
    tindakan && h('button', { type: 'button', class: 'toast-aksi', onclick: () => { el.remove(); tindakan.aksi(); } }, tindakan.label),
  );
  document.body.append(el);
  if (!tindakan) setTimeout(() => el.remove(), lama);
}
