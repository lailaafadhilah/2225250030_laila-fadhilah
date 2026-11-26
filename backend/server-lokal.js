// Server lokal untuk mencoba backend di laptop tanpa akun Vercel.
// Jalankan: npm run dev   (membaca .env bila ada)   → http://localhost:3000/api/tutor
import http from 'node:http';

// Saat di laptop, izinkan juga frontend lokal (python tools/serve.py --port 8000)
process.env.IZINKAN_LOKAL ??= '1';

const RUTE = {
  '/api/tutor': await import('./api/tutor.js'),
  '/api/kesehatan': await import('./api/kesehatan.js'),
};
const PORT = Number(process.env.PORT || 3000);

/** Mengubah permintaan Node menjadi Request standar Web, lalu menjalankan fungsi Vercel. */
const server = http.createServer(async (req, res) => {
  try {
    const url = new URL(req.url, `http://${req.headers.host}`);
    const modul = RUTE[url.pathname];
    if (!modul) { res.writeHead(404, { 'Content-Type': 'application/json' }); res.end('{"ok":false,"kode":"TIDAK_ADA"}'); return; }

    const potongan = [];
    for await (const p of req) potongan.push(p);
    const badan = Buffer.concat(potongan);
    const headers = new Headers();
    for (const [k, v] of Object.entries(req.headers)) if (typeof v === 'string') headers.set(k, v);
    headers.set('x-forwarded-for', req.socket.remoteAddress || 'lokal');
    const request = new Request(url, { method: req.method, headers, body: ['GET', 'HEAD'].includes(req.method) ? undefined : badan });

    const fungsi = modul[req.method];
    const respon = fungsi
      ? await fungsi(request)
      : new Response('{"ok":false,"kode":"METODE_DITOLAK"}', { status: 405, headers: { 'Content-Type': 'application/json' } });
    res.writeHead(respon.status, Object.fromEntries(respon.headers));
    res.end(Buffer.from(await respon.arrayBuffer()));
  } catch (err) {
    console.error(err);
    res.writeHead(500, { 'Content-Type': 'application/json' });
    res.end('{"ok":false,"kode":"GANGGUAN"}');
  }
});

server.listen(PORT, () => {
  console.log(`AI Tutor lokal berjalan di http://localhost:${PORT}/api/tutor`);
  console.log(`Kunci API: ${process.env.GEMINI_API_KEY ? 'terpasang ✔' : 'BELUM ADA ✖ (isi berkas .env)'}`);
});
