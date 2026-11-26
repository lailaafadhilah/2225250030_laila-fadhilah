// CORS: hanya halaman ProfitQuest (GitHub Pages) yang boleh memanggil backend dari browser.

/** Header CORS untuk asal tertentu, atau hanya "Vary" bila asal tidak diizinkan. */
export function headerCors(asal, daftarAsal) {
  const dasar = { Vary: 'Origin' };
  if (!asal || !daftarAsal.includes(asal)) return dasar;
  return {
    ...dasar,
    'Access-Control-Allow-Origin': asal,
    'Access-Control-Allow-Methods': 'POST, OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type',
    'Access-Control-Max-Age': '600',
  };
}

/** Respons JSON dengan header keamanan dasar. */
export function jawabJson(status, isi, headerTambahan = {}) {
  return new Response(JSON.stringify(isi), {
    status,
    headers: {
      'Content-Type': 'application/json; charset=utf-8',
      'Cache-Control': 'no-store',
      'X-Content-Type-Options': 'nosniff',
      ...headerTambahan,
    },
  });
}
