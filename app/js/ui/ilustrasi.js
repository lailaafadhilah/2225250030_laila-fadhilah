// Ilustrasi SVG bergerak (gaya kartun, garis tebal) untuk Beranda, Peta, kartu pembuka, dan layar hasil.
// Animasi diatur di css/animasi.css (kelas .ani-*), jadi ikut mati saat mode Hemat / gerak dikurangi.
// JANGAN dipakai di layar hitungan (EL03: gambar dekoratif mengganggu fokus).

export const GARIS = 'stroke="#2B2B2B" stroke-width="3" stroke-linejoin="round" stroke-linecap="round"';
export const HURUF = 'font-family="system-ui, sans-serif" font-weight="800" stroke="none" text-anchor="middle"';

/** Titik-titik bintang bersudut 5. */
export function bintang(cx, cy, r) {
  const titik = [];
  for (let i = 0; i < 10; i++) {
    const rr = i % 2 ? r * 0.45 : r;
    const sudut = (Math.PI / 5) * i - Math.PI / 2;
    titik.push(`${(cx + rr * Math.cos(sudut)).toFixed(1)},${(cy + rr * Math.sin(sudut)).toFixed(1)}`);
  }
  return titik.join(' ');
}

const langit = (warna = '#DFF1FF') => `<rect width="320" height="200" fill="${warna}"/>`;
export const awan = (x, y, kelas = '', warna = '#fff') => `<g class="ani-awan ${kelas}"><g fill="${warna}">
  <ellipse cx="${x}" cy="${y}" rx="26" ry="10"/><ellipse cx="${x + 16}" cy="${y - 7}" rx="16" ry="10"/><ellipse cx="${x - 12}" cy="${y - 4}" rx="12" ry="8"/></g></g>`;
export const koin = (x, y, r = 9) => `<g class="ani-koin"><circle cx="${x}" cy="${y}" r="${r}" fill="#F6BE3B" ${GARIS}/>
  <text x="${x}" y="${y + r * 0.42}" font-size="${r * 1.1}" fill="#B7791F" ${HURUF}>Rp</text></g>`;

const ADEGAN = {
  // Wilayah 2: toko + timbangan untung–rugi
  toko: `${langit()}${awan(60, 32)}${awan(250, 44, 'lambat')}
    <rect y="168" width="320" height="32" fill="#E9E1CC"/>
    <g ${GARIS}>
      <rect x="34" y="80" width="150" height="90" fill="#FFF4DC"/>
      <rect x="26" y="60" width="166" height="24" fill="#2E7D4F"/>
      <g stroke="none" fill="#FFFFFF"><rect x="47" y="61.5" width="21" height="21"/><rect x="89" y="61.5" width="21" height="21"/><rect x="131" y="61.5" width="21" height="21"/><rect x="171" y="61.5" width="19" height="21"/></g>
      <path d="M26 84 q10.4 12 20.75 0 q10.4 12 20.75 0 q10.4 12 20.75 0 q10.4 12 20.75 0 q10.4 12 20.75 0 q10.4 12 20.75 0 q10.4 12 20.75 0 q10.4 12 20.75 0" fill="#2E7D4F"/>
      <rect x="62" y="30" width="94" height="26" rx="8" fill="#2E7D4F"/>
      <rect x="44" y="104" width="34" height="30" fill="#9FD3F5"/><rect x="140" y="104" width="34" height="30" fill="#9FD3F5"/>
      <rect x="88" y="110" width="42" height="60" fill="#9FD3F5"/><line x1="109" y1="110" x2="109" y2="170"/>
      <rect x="40" y="148" width="40" height="22" fill="#C98B4E"/><rect x="138" y="148" width="40" height="22" fill="#C98B4E"/>
      <g fill="#E5533D"><circle cx="50" cy="146" r="6"/><circle cx="62" cy="146" r="6"/><circle cx="72" cy="146" r="6"/></g>
      <g fill="#F5A524"><circle cx="148" cy="146" r="6"/><circle cx="160" cy="146" r="6"/><circle cx="170" cy="146" r="6"/></g>
      <path d="M232 168 L262 168 L247 150 Z" fill="#8B5A2B"/><line x1="247" y1="150" x2="247" y2="92"/>
      <g class="ani-timbang" style="transform-origin:247px 92px">
        <line x1="212" y1="92" x2="282" y2="92"/>
        <line x1="212" y1="92" x2="200" y2="122"/><line x1="212" y1="92" x2="224" y2="122"/>
        <line x1="282" y1="92" x2="270" y2="122"/><line x1="282" y1="92" x2="294" y2="122"/>
        <g fill="#F6BE3B"><circle cx="206" cy="116" r="6"/><circle cx="218" cy="116" r="6"/><circle cx="212" cy="107" r="6"/></g>
        <circle cx="282" cy="116" r="6" fill="#F6BE3B"/>
        <path d="M196 122 h32 a16 8 0 0 1 -32 0 z" fill="#6FD394"/>
        <path d="M266 122 h32 a16 8 0 0 1 -32 0 z" fill="#7FB0F5"/>
        <text x="212" y="146" font-size="10" fill="#1B7F3B" ${HURUF}>JUAL</text>
        <text x="282" y="146" font-size="10" fill="#1E5FBF" ${HURUF}>MODAL</text>
      </g>
      <circle cx="247" cy="92" r="5" fill="#2B2B2B"/>
    </g>
    <text x="109" y="49" font-size="16" fill="#FFF4DC" ${HURUF}>TOKO</text>
    ${koin(150, 20)}`,

  // Wilayah 3: jembatan persen, gerobak menyeberang
  jembatan: `${langit()}<circle class="ani-denyut-lembut" cx="282" cy="34" r="16" fill="#F6BE3B"/>
    ${awan(70, 30)}${awan(200, 48, 'lambat')}
    <path d="M0 132 Q60 92 120 132 T240 132 T360 132 V200 H0Z" fill="#9BD39B"/>
    <rect y="150" width="320" height="50" fill="#5AB0E8"/>
    <g class="ani-ombak" fill="none" stroke="#fff" stroke-width="3" stroke-linecap="round" opacity="0.8">
      <path d="M0 168 q10 -6 20 0 t20 0 t20 0 t20 0 t20 0 t20 0 t20 0 t20 0 t20 0 t20 0 t20 0 t20 0 t20 0 t20 0 t20 0 t20 0 t20 0 t20 0"/>
      <path d="M-20 186 q10 -6 20 0 t20 0 t20 0 t20 0 t20 0 t20 0 t20 0 t20 0 t20 0 t20 0 t20 0 t20 0 t20 0 t20 0 t20 0 t20 0 t20 0 t20 0 t20 0"/>
    </g>
    <g ${GARIS}>
      <path d="M40 150 Q160 76 280 150" fill="none" stroke="#8B5A2B" stroke-width="9"/>
      <rect x="20" y="104" width="280" height="10" fill="#B07A45"/>
      <rect x="54" y="114" width="12" height="40" fill="#8B5A2B"/><rect x="254" y="114" width="12" height="40" fill="#8B5A2B"/>
      <line x1="20" y1="104" x2="20" y2="90"/><line x1="300" y1="104" x2="300" y2="90"/><line x1="20" y1="90" x2="300" y2="90"/>
      <g class="ani-jalan">
        <rect x="0" y="84" width="36" height="16" rx="3" fill="#E5533D"/>
        <g fill="#F5A524"><circle cx="9" cy="82" r="5"/><circle cx="19" cy="80" r="5"/><circle cx="29" cy="82" r="5"/></g>
        <circle cx="8" cy="101" r="4.5" fill="#2B2B2B"/><circle cx="28" cy="101" r="4.5" fill="#2B2B2B"/>
      </g>
      <g class="ani-melayang"><circle cx="160" cy="52" r="21" fill="#FFFFFF"/></g>
    </g>
    <g class="ani-melayang"><text x="160" y="61" font-size="25" fill="#0F766E" ${HURUF}>%</text></g>`,

  // Wilayah 4: gudang + kotak jatuh ke keranjang modal
  gudang: `${langit()}${awan(250, 30)}
    <rect y="168" width="320" height="32" fill="#E9E1CC"/>
    <g ${GARIS}>
      <rect x="30" y="82" width="150" height="88" fill="#D9634C"/>
      <path d="M20 86 L105 40 L190 86 Z" fill="#8B3A2E"/>
      <rect x="78" y="108" width="54" height="62" fill="#6B4226"/>
      <line x1="78" y1="108" x2="132" y2="170"/><line x1="132" y1="108" x2="78" y2="170"/>
      <rect x="42" y="100" width="24" height="20" fill="#9FD3F5"/><rect x="144" y="100" width="24" height="20" fill="#9FD3F5"/>
      <g class="ani-jatuh ani-d1"><rect x="216" y="112" width="24" height="24" fill="#E8B04B"/><line x1="228" y1="112" x2="228" y2="136"/></g>
      <g class="ani-jatuh ani-d2"><rect x="243" y="112" width="24" height="24" fill="#F5A524"/><line x1="255" y1="112" x2="255" y2="136"/></g>
      <g class="ani-jatuh ani-d3"><rect x="270" y="112" width="24" height="24" fill="#E8B04B"/><line x1="282" y1="112" x2="282" y2="136"/></g>
      <path d="M206 136 H304 L292 170 H218 Z" fill="#C98B4E"/>
      <line x1="212" y1="148" x2="298" y2="148"/><line x1="216" y1="160" x2="295" y2="160"/>
    </g>
    <text x="105" y="76" font-size="13" fill="#FFF4DC" ${HURUF}>GUDANG</text>
    <text x="255" y="157" font-size="12" fill="#FFF4DC" ${HURUF}>MODAL</text>`,

  // Wilayah 5: gulungan cerita + kaca pembesar
  cerita: `${langit('#FFF1DC')}
    <g ${GARIS}>
      <rect x="52" y="34" width="216" height="134" fill="#FFF8EA"/>
      <rect x="40" y="28" width="16" height="146" rx="8" fill="#E8D3A8"/><rect x="264" y="28" width="16" height="146" rx="8" fill="#E8D3A8"/>
    </g>
    <g fill="#CFC6B2">
      <rect x="70" y="56" width="70" height="8" rx="4"/><rect x="190" y="56" width="60" height="8" rx="4"/>
      <rect x="70" y="78" width="120" height="8" rx="4"/><rect x="226" y="78" width="24" height="8" rx="4"/>
      <rect x="110" y="100" width="140" height="8" rx="4"/>
      <rect x="70" y="122" width="80" height="8" rx="4"/><rect x="196" y="122" width="54" height="8" rx="4"/>
      <rect x="70" y="144" width="110" height="8" rx="4"/>
    </g>
    <rect class="ani-sorot-teks" x="146" y="53" width="40" height="14" rx="5" fill="#7FB0F5"/>
    <rect class="ani-sorot-teks ani-d2" x="70" y="97" width="36" height="14" rx="5" fill="#F5B26B"/>
    <rect class="ani-sorot-teks ani-d3" x="154" y="119" width="38" height="14" rx="5" fill="#6FD394"/>
    <rect class="ani-sorot-teks ani-d1" x="190" y="141" width="44" height="14" rx="5" fill="#C4A8FA"/>
    <g class="ani-kaca"><g ${GARIS}>
      <line x1="122" y1="96" x2="142" y2="118" stroke="#8B5A2B" stroke-width="9"/>
      <circle cx="108" cy="80" r="22" fill="rgba(255,255,255,0.45)" stroke-width="5"/>
    </g></g>`,

  // Wilayah 6: arena juragan, piala & bintang
  arena: `${langit('#FFF6D6')}
    <g class="ani-ayun" style="transform-origin:160px 0px">
      <path d="M0 18 Q160 52 320 18" fill="none" stroke="#2B2B2B" stroke-width="2"/>
      <g ${GARIS} stroke-width="2">
        <path d="M30 24 l12 0 l-6 16 z" fill="#E5533D"/><path d="M70 32 l12 0 l-6 16 z" fill="#1E5FBF"/>
        <path d="M110 37 l12 0 l-6 16 z" fill="#F6BE3B"/><path d="M150 39 l12 0 l-6 16 z" fill="#2E7D4F"/>
        <path d="M190 38 l12 0 l-6 16 z" fill="#E5533D"/><path d="M230 34 l12 0 l-6 16 z" fill="#1E5FBF"/>
        <path d="M270 27 l12 0 l-6 16 z" fill="#F6BE3B"/>
      </g>
    </g>
    <rect y="170" width="320" height="30" fill="#E9E1CC"/>
    <g ${GARIS}>
      <rect x="60" y="146" width="60" height="24" fill="#7FB0F5"/>
      <rect x="120" y="128" width="80" height="42" fill="#1E5FBF"/>
      <rect x="200" y="152" width="60" height="18" fill="#7FB0F5"/>
      <g class="ani-melayang">
        <path d="M136 66 h48 v12 a24 24 0 0 1 -48 0 z" fill="#F6BE3B"/>
        <path d="M136 72 q-14 0 -12 12 q2 10 16 10" fill="none"/><path d="M184 72 q14 0 12 12 q-2 10 -16 10" fill="none"/>
        <rect x="155" y="100" width="10" height="14" fill="#F6BE3B"/><rect x="144" y="112" width="32" height="10" rx="2" fill="#B7791F"/>
        <path d="M144 62 l6 -14 l10 9 l10 -9 l6 14 z" fill="#F6BE3B"/>
      </g>
    </g>
    <text x="160" y="157" font-size="20" fill="#FFFFFF" ${HURUF}>1</text>
    <text x="90" y="165" font-size="14" fill="#1E5FBF" ${HURUF}>2</text>
    <text x="230" y="166" font-size="13" fill="#1E5FBF" ${HURUF}>3</text>
    <g fill="#F6BE3B" stroke="#2B2B2B" stroke-width="2" stroke-linejoin="round">
      <polygon class="ani-kilip" points="${bintang(96, 92, 11)}"/>
      <polygon class="ani-kilip ani-d2" points="${bintang(226, 88, 13)}"/>
      <polygon class="ani-kilip ani-d3" points="${bintang(60, 118, 8)}"/>
      <polygon class="ani-kilip ani-d1" points="${bintang(262, 124, 9)}"/>
    </g>`,
};

const LABEL = {
  toko: 'Toko dengan timbangan harga jual dan modal',
  jembatan: 'Gerobak buah menyeberangi jembatan persen',
  gudang: 'Gudang dengan kotak yang jatuh ke keranjang modal',
  cerita: 'Gulungan cerita dengan kaca pembesar',
  arena: 'Podium juara dengan piala dan bintang',
};

export const NAMA_ILUSTRASI = Object.keys(ADEGAN);

function dariTeks(teks) {
  const t = document.createElement('template');
  t.innerHTML = teks.trim();
  return t.content.firstElementChild;
}

/** Adegan wilayah, mis. ilustrasi('toko'). */
export function ilustrasi(nama, kelas = 'ilus') {
  if (!ADEGAN[nama]) return null;
  return dariTeks(`<svg viewBox="0 0 320 200" class="${kelas}" role="img" aria-label="${LABEL[nama]}">${ADEGAN[nama]}</svg>`);
}

/** Maskot "Koko si Koin". gaya: "lambai" (melambai) | "lompat" (merayakan) | "semangat" */
export function maskot(gaya = 'lambai', kelas = 'maskot') {
  return dariTeks(`<svg viewBox="0 0 120 140" class="${kelas} maskot-${gaya}" role="img" aria-label="Koko si Koin">
    <ellipse class="maskot-bayang" cx="60" cy="134" rx="30" ry="5" fill="rgba(0,0,0,0.15)"/>
    <g class="ani-badan">
      <g ${GARIS}>
        <line x1="48" y1="106" x2="45" y2="124"/><line x1="72" y1="106" x2="75" y2="124"/>
        <ellipse cx="42" cy="127" rx="9" ry="5" fill="#8B5A2B"/><ellipse cx="78" cy="127" rx="9" ry="5" fill="#8B5A2B"/>
        <path d="M22 74 q-16 8 -12 24" fill="none"/>
        <g class="ani-lambai" style="transform-origin:98px 72px">
          <path d="M98 72 q18 -10 15 -30" fill="none"/><circle cx="113" cy="40" r="6" fill="#F6BE3B"/>
        </g>
        <circle cx="60" cy="68" r="42" fill="#F6BE3B"/>
        <path d="M34 34 Q60 4 86 34 Z" fill="#1E5FBF"/><rect x="28" y="30" width="64" height="8" rx="4" fill="#1E5FBF"/>
      </g>
      <circle cx="60" cy="72" r="32" fill="none" stroke="#D99A1E" stroke-width="3"/>
      <g class="ani-kedip">
        <ellipse cx="47" cy="62" rx="5.5" ry="7.5" fill="#2B2B2B"/><ellipse cx="73" cy="62" rx="5.5" ry="7.5" fill="#2B2B2B"/>
        <circle cx="49" cy="59" r="2" fill="#fff"/><circle cx="75" cy="59" r="2" fill="#fff"/>
      </g>
      <circle cx="37" cy="78" r="6" fill="#F59A9A" opacity="0.8"/><circle cx="83" cy="78" r="6" fill="#F59A9A" opacity="0.8"/>
      <path d="M47 82 q13 14 26 0 z" fill="#E5533D" stroke="#2B2B2B" stroke-width="3" stroke-linejoin="round"/>
    </g>
  </svg>`);
}

/** Awan melayang untuk latar Beranda. */
export function latarAwan() {
  return dariTeks(`<svg viewBox="0 0 320 120" class="latar-awan" aria-hidden="true" preserveAspectRatio="xMidYMin slice">
    ${awan(40, 40, '', '#D6E6FA')}${awan(180, 26, 'lambat', '#D6E6FA')}${awan(280, 60, '', '#D6E6FA')}
    ${koin(36, 96, 8)}${koin(296, 22, 7)}
  </svg>`);
}
