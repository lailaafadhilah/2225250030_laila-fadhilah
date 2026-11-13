// Tombol "Pasang Aplikasi" (F16): memasang PWA tanpa Play Store.
let promptTertunda = null;
const pendengar = new Set();

window.addEventListener('beforeinstallprompt', (e) => {
  e.preventDefault();
  promptTertunda = e;
  pendengar.forEach((fn) => fn());
});
window.addEventListener('appinstalled', () => {
  promptTertunda = null;
  pendengar.forEach((fn) => fn());
});

export const bisaPasang = () => promptTertunda !== null;
export const sudahTerpasang = () => window.matchMedia('(display-mode: standalone)').matches || navigator.standalone === true;
export const adalahIOS = () => /iphone|ipad|ipod/i.test(navigator.userAgent);

/** Dipanggil saat status bisa-pasang berubah. */
export function saatBerubah(fn) {
  pendengar.add(fn);
  return () => pendengar.delete(fn);
}

export async function pasang() {
  if (!promptTertunda) return false;
  promptTertunda.prompt();
  const { outcome } = await promptTertunda.userChoice;
  promptTertunda = null;
  pendengar.forEach((fn) => fn());
  return outcome === 'accepted';
}
