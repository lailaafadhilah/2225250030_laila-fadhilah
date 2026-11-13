// Ilustrasi Beranda bergaya flat vector 2D: bentuk sederhana, garis tepi konsisten,
// warna pastel kalem, sedikit hiasan. Semua digambar dengan SVG (bukan gambar AI).

const TEPI = '#5B4636'; // warna garis tepi (cokelat tua lembut), dipakai konsisten
const G = `stroke="${TEPI}" stroke-width="3" stroke-linejoin="round" stroke-linecap="round"`;

function dariTeks(teks) {
  const t = document.createElement('template');
  t.innerHTML = teks.trim();
  return t.content.firstElementChild;
}

const awanPastel = (x, y, s = 1, kelas = '') => `<g class="ani-awan ${kelas}"><g transform="translate(${x} ${y}) scale(${s})" fill="#FFFFFF">
  <ellipse cx="0" cy="0" rx="26" ry="11"/><ellipse cx="14" cy="-7" rx="15" ry="11"/><ellipse cx="-12" cy="-4" rx="12" ry="9"/></g></g>`;

/** Tenda kios: garis-garis + rumbai. */
function tenda(x, y, lebar, warna, jumlah = 6) {
  const w = lebar / jumlah;
  const garis = Array.from({ length: jumlah }, (_, k) => (k % 2 ? '' : `<rect x="${x + k * w}" y="${y}" width="${w}" height="20" fill="#FFF8EE"/>`)).join('');
  const rumbai = Array.from({ length: jumlah }, () => `q${w / 2} 12 ${w} 0`).join(' ');
  return `<rect x="${x}" y="${y}" width="${lebar}" height="20" fill="${warna}"/>${garis}
    <path d="M${x} ${y + 20} ${rumbai}" fill="${warna}" ${G}/><rect x="${x}" y="${y}" width="${lebar}" height="20" fill="none" ${G}/>`;
}

/** Latar pasar penuh (langit, bangunan, kios kiri-kanan, jalan batu, peti buah). viewBox 360×640. */
export function latarPasar() {
  const bendera = ['#F7A1B5', '#FFD98A', '#A8D8A0', '#A9D4F5', '#CDB8F0', '#F9B98A'];
  const segitiga = Array.from({ length: 9 }, (_, k) => `<path d="M${150 + k * 24} ${18 + k * 2.2} l18 1 l-10 15 z" fill="${bendera[k % bendera.length]}" ${G} stroke-width="2"/>`).join('');
  const batu = [];
  for (let r = 0; r < 6; r++) for (let k = 0; k < 7; k++) {
    batu.push(`<ellipse cx="${(k * 58 + (r % 2) * 29) - 10}" cy="${470 + r * 30}" rx="24" ry="10" fill="#E9D4B4"/>`);
  }
  return dariTeks(`<svg viewBox="0 0 360 640" preserveAspectRatio="xMidYMax slice" class="beranda-latar" aria-hidden="true">
    <defs><linearGradient id="langit-b" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#BFE6FB"/><stop offset="1" stop-color="#EAF7FF"/></linearGradient></defs>
    <rect width="360" height="640" fill="url(#langit-b)"/>
    ${awanPastel(70, 70, 1)}${awanPastel(300, 110, 0.8, 'lambat')}${awanPastel(200, 40, 0.6)}
    <g class="ani-ayun-kecil"><path d="M140 18 Q250 40 380 30" fill="none" stroke="${TEPI}" stroke-width="2"/>${segitiga}</g>
    <g ${G}>
      <rect x="250" y="190" width="90" height="190" fill="#F8D9C8"/><path d="M244 192 L295 160 L346 192 Z" fill="#F2B8A2"/>
      <rect x="264" y="214" width="20" height="24" fill="#CFE8F7"/><rect x="304" y="214" width="20" height="24" fill="#CFE8F7"/>
      <rect x="264" y="256" width="20" height="24" fill="#CFE8F7"/><rect x="304" y="256" width="20" height="24" fill="#CFE8F7"/>
      <rect x="-10" y="230" width="70" height="150" fill="#FBE8C8"/>
      <rect x="6" y="250" width="16" height="20" fill="#CFE8F7"/><rect x="34" y="250" width="16" height="20" fill="#CFE8F7"/>
      <circle cx="30" cy="235" r="34" fill="#A8D8A0"/><circle cx="62" cy="250" r="24" fill="#9BCF93"/><rect x="26" y="262" width="10" height="60" fill="#C9945F"/>
    </g>
    <g ${G}>
      <rect x="-6" y="330" width="96" height="110" fill="#FFF8EE"/>
      ${tenda(-12, 312, 108, '#CDB8F0', 5)}
      <rect x="0" y="392" width="84" height="22" fill="#E2B07A"/>
      <circle cx="16" cy="388" r="7" fill="#FFD98A"/><circle cx="32" cy="388" r="7" fill="#F9B98A"/><circle cx="48" cy="388" r="7" fill="#FFD98A"/><circle cx="64" cy="388" r="7" fill="#A8D8A0"/>
      <rect x="270" y="330" width="96" height="110" fill="#FFF8EE"/>
      ${tenda(264, 312, 108, '#F9B98A', 5)}
      <rect x="276" y="392" width="84" height="22" fill="#E2B07A"/>
      <circle cx="292" cy="388" r="7" fill="#F28B82"/><circle cx="308" cy="388" r="7" fill="#F28B82"/><circle cx="324" cy="388" r="7" fill="#F9B98A"/>
    </g>
    <rect x="0" y="440" width="360" height="200" fill="#F3E2C7"/>
    <g opacity="0.9">${batu.join('')}</g>
    <g ${G}>
      <path d="M-20 640 q10 -70 50 -60 q40 -40 60 20 q10 20 -10 40 z" fill="#A8D8A0"/>
      <path d="M380 640 q-10 -70 -50 -60 q-40 -40 -60 20 q-10 20 10 40 z" fill="#A8D8A0"/>
    </g>
  </svg>`);
}

/** Papan judul: tenda merah-krem + troli belanja bersinar. Teks judul ditaruh sebagai HTML. */
export function tendaJudul() {
  return dariTeks(`<svg viewBox="0 0 320 96" class="tenda-judul" aria-hidden="true">
    <g class="ani-kilip-garis" stroke="#FFC94D" stroke-width="5" stroke-linecap="round">
      <line x1="112" y1="24" x2="102" y2="12"/><line x1="208" y1="24" x2="218" y2="12"/><line x1="160" y1="6" x2="160" y2="-6"/>
    </g>
    <g ${G} fill="none">
      <path d="M124 14 h10 l10 34 h40 l8 -24 h-54"/>
      <circle cx="150" cy="56" r="5" fill="#FFF8EE"/><circle cx="178" cy="56" r="5" fill="#FFF8EE"/>
      <path d="M148 30 v12 M160 30 v12 M172 30 v12" stroke-width="2"/>
    </g>
    <g ${G}>
      <path d="M8 66 L28 62 H292 L312 66 V86 H8 Z" fill="#F28B82"/>
      ${Array.from({ length: 6 }, (_, k) => `<rect x="${32 + k * 44}" y="63" width="22" height="23" fill="#FFF8EE" stroke="none"/>`).join('')}
      <path d="M8 86 ${Array.from({ length: 12 }, () => 'q12.67 12 25.33 0').join(' ')}" fill="#F28B82"/>
      <path d="M8 66 L28 62 H292 L312 66 V86 H8 Z" fill="none"/>
    </g>
  </svg>`);
}

/** Tokoh "Sari": anak perempuan berkunciran pita, melambaikan tas belanja. viewBox 160×200. */
export function tokohSari() {
  return dariTeks(`<svg viewBox="0 0 160 200" class="tokoh-sari" role="img" aria-label="Sari, teman belanjamu">
    <g ${G}>
      <path d="M30 80 C20 130 26 170 40 186 L120 186 C134 170 140 130 130 80 Z" fill="#8A5A3B"/>
      <path d="M48 128 h64 l8 60 h-80 z" fill="#FFF8EE"/>
      <path d="M52 140 h56 l6 48 h-68 z" fill="#F28B82"/>
      <rect x="68" y="150" width="24" height="16" rx="3" fill="#F7A1B5"/>
      <line x1="60" y1="140" x2="64" y2="128"/><line x1="100" y1="140" x2="96" y2="128"/>
      <path d="M108 138 q16 10 18 34" fill="none"/><circle cx="127" cy="174" r="7" fill="#FFE0CC"/>
    </g>
    <g class="ani-lambai-tas" style="transform-origin:52px 136px"><g ${G}>
      <path d="M52 136 q-22 -10 -26 -36" fill="none" stroke-width="10" stroke="#FFF8EE"/>
      <path d="M52 136 q-22 -10 -26 -36" fill="none"/>
      <path d="M14 104 h34 l-3 40 h-28 z" fill="#E8C79A"/>
      <path d="M22 104 q9 -16 18 0" fill="none"/>
      <circle cx="27" cy="100" r="7" fill="#FFE0CC"/>
      <path d="M22 116 h4 l3 10 h12 l2 -7 h-16" fill="none" stroke-width="2"/>
    </g></g>
    <g ${G}>
      <circle cx="80" cy="74" r="44" fill="#FFE0CC"/>
      <path d="M36 72 C34 30 70 18 92 24 C120 30 128 56 124 74 C112 60 100 50 88 44 C78 56 56 62 36 72 Z" fill="#8A5A3B"/>
    </g>
    <g class="ani-pita" style="transform-origin:50px 36px"><g ${G}>
      <path d="M50 36 l-20 -12 l2 22 z" fill="#F7A1B5"/><path d="M50 36 l18 -16 l2 22 z" fill="#F7A1B5"/>
      <circle cx="50" cy="36" r="6" fill="#F28B82"/>
    </g></g>
    <g class="ani-kedip"><ellipse cx="64" cy="80" rx="5.5" ry="7.5" fill="${TEPI}"/><circle cx="66" cy="77" r="2" fill="#fff"/></g>
    <path d="M90 80 q7 -7 14 0" fill="none" ${G}/>
    <ellipse cx="54" cy="94" rx="8" ry="5" fill="#F7A1B5" opacity="0.8"/><ellipse cx="108" cy="94" rx="8" ry="5" fill="#F7A1B5" opacity="0.8"/>
    <path d="M72 96 q10 14 22 0 z" fill="#E86A6A" ${G} stroke-width="2.5"/>
  </svg>`);
}

/** Kucing pasar mengintip dari balik peti. viewBox 130×110. */
export function kucingPasar() {
  return dariTeks(`<svg viewBox="0 0 130 110" class="kucing-pasar" role="img" aria-label="Kucing pasar">
    <g class="ani-kilip-garis" stroke="#FFC94D" stroke-width="4" stroke-linecap="round">
      <line x1="110" y1="14" x2="120" y2="6"/><line x1="116" y1="28" x2="128" y2="26"/>
    </g>
    <g class="ani-angguk" style="transform-origin:62px 64px"><g ${G}>
      <path d="M30 34 l6 -26 l20 18 z" fill="#FFF3E0"/><path d="M94 34 l-6 -26 l-20 18 z" fill="#F5B36B"/>
      <ellipse cx="62" cy="48" rx="38" ry="30" fill="#FFF3E0"/>
      <path d="M86 26 q14 10 14 26 q-10 -4 -20 -2 z" fill="#F5B36B"/>
      <path d="M44 46 q6 -6 12 0 M70 46 q6 -6 12 0" fill="none"/>
      <path d="M58 56 h8 l-4 4 z" fill="#F7A1B5" stroke-width="2"/>
      <path d="M62 60 q-4 6 -10 4 M62 60 q4 6 10 4" fill="none" stroke-width="2"/>
      <path d="M22 54 h14 M22 60 h14 M90 54 h14 M90 60 h14" stroke-width="1.5"/>
    </g>
    <ellipse cx="40" cy="58" rx="7" ry="4" fill="#F7A1B5" opacity="0.7"/><ellipse cx="84" cy="58" rx="7" ry="4" fill="#F7A1B5" opacity="0.7"/></g>
    <g ${G}>
      <rect x="8" y="70" width="114" height="38" rx="3" fill="#E2B07A"/>
      <line x1="8" y1="88" x2="122" y2="88"/><line x1="44" y1="70" x2="44" y2="108"/><line x1="86" y1="70" x2="86" y2="108"/>
      <ellipse cx="44" cy="70" rx="10" ry="7" fill="#FFF3E0"/><ellipse cx="80" cy="70" rx="10" ry="7" fill="#FFF3E0"/>
    </g>
  </svg>`);
}

/** Papan A "Belajar Sambil Berbelanja!". */
export function papanA() {
  return dariTeks(`<svg viewBox="0 0 90 110" class="papan-a" aria-hidden="true"><g ${G}>
    <path d="M14 108 L26 10 M76 108 L64 10" fill="none"/>
    <rect x="10" y="12" width="70" height="72" rx="4" fill="#F3D3A4"/>
  </g>
  <text x="45" y="36" font-size="10.5" fill="${TEPI}" font-family="system-ui" font-weight="700" text-anchor="middle">Belajar</text>
  <text x="45" y="50" font-size="10.5" fill="${TEPI}" font-family="system-ui" font-weight="700" text-anchor="middle">Sambil</text>
  <text x="45" y="64" font-size="10.5" fill="${TEPI}" font-family="system-ui" font-weight="700" text-anchor="middle">Berbelanja!</text>
  <path d="M41 72 q4 -6 4 0 q0 -6 4 0 l-4 5 z" fill="#F28B82"/></svg>`);
}

/** Ikon menu flat sederhana. */
const IKON = {
  main: `<path d="M9 6 L20 13 L9 20 Z" fill="#FFF8EE"/>`,
  buku: `<path d="M3 7 q5 -3 10 0 v13 q-5 -3 -10 0 z" fill="#FFF8EE"/><path d="M13 7 q5 -3 10 0 v13 q-5 -3 -10 0 z" fill="#FFF8EE"/>`,
  toko: `<rect x="5" y="12" width="16" height="10" fill="#FFF8EE"/><path d="M3 7 h20 l-1 6 h-18 z" fill="#F28B82"/><rect x="11" y="15" width="5" height="7" fill="#A9D4F5"/>`,
  tanya: `<path d="M9 9 q0 -5 5 -5 q5 0 5 5 q0 3 -4 5 v3" fill="none" stroke-width="3.2"/><circle cx="14.5" cy="21" r="1.6" fill="${TEPI}"/>`,
  orang: `<circle cx="13" cy="9" r="5" fill="#FFD98A"/><path d="M4 23 q1 -8 9 -8 q8 0 9 8 z" fill="#FFD98A"/>`,
  gir: `<circle cx="13" cy="13" r="8" fill="#FFF8EE"/><circle cx="13" cy="13" r="3" fill="#F7A1B5"/>`,
};
export function ikonMenu(nama) {
  return dariTeks(`<svg viewBox="0 0 26 26" class="ikon-menu" aria-hidden="true"><g stroke="${TEPI}" stroke-width="2.2" stroke-linejoin="round" stroke-linecap="round">${IKON[nama]}</g></svg>`);
}
