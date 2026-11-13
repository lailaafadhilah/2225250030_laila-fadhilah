// Peta "Gedung Pasar Juragan": siswa naik dari lantai ke lantai. Setiap wilayah = satu kios.
//   Kios terkunci → rolling door TUTUP + gembok · Kios aktif → lampu BUKA + Koko · Kios selesai → cap LARIS!
// Barang di setiap kios bergerak dan BERKAITAN DENGAN MATERI wilayahnya:
//   1 lapak buah + koin untung · 2 timbangan JUAL vs MODAL · 3 papan batang MODAL 100% + untung %
//   4 kotak masuk keranjang MODAL + gerobak ongkos angkut · 5 gulungan cerita + kaca pembesar · 6 podium & piala
// Tombol kios & papan nama berupa HTML di atas SVG agar mudah diketuk dan terbaca pembaca layar.
import { h } from './dom.js';
import { GARIS, HURUF, bintang, koin, awan, maskot } from './ilustrasi.js';

const LEBAR = 360;
const TINGGI = 1520;
const TINGGI_LANTAI = 210;
const ATAP = 170; // tinggi area atap di atas lantai teratas

/** Warna dinding lantai (pastel) per wilayah. */
const DINDING = { 1: '#E6F6DA', 2: '#FFE8CC', 3: '#DCF0FB', 4: '#F3E2C6', 5: '#ECE2FB', 6: '#FFF2BF' };

/** Barang di dalam kios, digambar di sekitar titik (0,0). */
const BARANG = {
  1: `<g ${GARIS}>
      <rect x="-58" y="-6" width="34" height="18" fill="#C98B4E"/><rect x="-20" y="-6" width="34" height="18" fill="#C98B4E"/><rect x="18" y="-6" width="34" height="18" fill="#C98B4E"/>
      <g fill="#E5533D"><circle cx="-50" cy="-9" r="6"/><circle cx="-40" cy="-9" r="6"/><circle cx="-31" cy="-9" r="5"/></g>
      <g fill="#F5A524"><circle cx="-12" cy="-9" r="6"/><circle cx="-2" cy="-9" r="6"/><circle cx="7" cy="-9" r="5"/></g>
      <g fill="#7BC043"><circle cx="26" cy="-9" r="6"/><circle cx="36" cy="-9" r="6"/><circle cx="45" cy="-9" r="5"/></g>
    </g>
    <g class="ani-loncat">${koin(-36, -34, 8)}</g>
    <g class="ani-loncat ani-d2">${koin(2, -36, 8)}</g>
    <g class="ani-loncat ani-d3">${koin(38, -34, 8)}</g>`,
  2: `<g ${GARIS}>
      <path d="M-14 12 L14 12 L0 -2 Z" fill="#8B5A2B"/><line x1="0" y1="-2" x2="0" y2="-40"/>
      <g class="ani-timbang-pivot">
        <line x1="-40" y1="-40" x2="40" y2="-40"/>
        <line x1="-40" y1="-40" x2="-50" y2="-14"/><line x1="-40" y1="-40" x2="-30" y2="-14"/>
        <line x1="40" y1="-40" x2="30" y2="-14"/><line x1="40" y1="-40" x2="50" y2="-14"/>
        <circle cx="-45" cy="-19" r="5" fill="#F6BE3B"/><circle cx="-35" cy="-19" r="5" fill="#F6BE3B"/><circle cx="-40" cy="-27" r="5" fill="#F6BE3B"/>
        <circle cx="40" cy="-19" r="5" fill="#F6BE3B"/>
        <path d="M-54 -14 h28 a14 7 0 0 1 -28 0 z" fill="#6FD394"/>
        <path d="M26 -14 h28 a14 7 0 0 1 -28 0 z" fill="#7FB0F5"/>
      </g>
      <circle cx="0" cy="-40" r="4" fill="#2B2B2B"/>
    </g>
    <text x="-40" y="8" font-size="9" fill="#1B7F3B" ${HURUF}>JUAL</text>
    <text x="40" y="8" font-size="9" fill="#1E5FBF" ${HURUF}>MODAL</text>`,
  3: `<g ${GARIS}><rect x="-62" y="-40" width="124" height="54" rx="6" fill="#FFFFFF"/></g>
    <rect x="-54" y="-28" width="74" height="16" fill="#7FB0F5" stroke="#2B2B2B" stroke-width="2"/>
    <text x="-17" y="-16.5" font-size="8.5" fill="#123A7A" ${HURUF}>MODAL 100%</text>
    <g class="ani-tumbuh"><rect x="20" y="-28" width="30" height="16" fill="#6FD394" stroke="#2B2B2B" stroke-width="2"/></g>
    <text x="35" y="-16.5" font-size="8.5" fill="#14532D" ${HURUF}>+20%</text>
    <text x="0" y="6" font-size="9" fill="#5B21B6" ${HURUF}>% = untung ÷ modal</text>
    <g class="ani-melayang"><circle cx="48" cy="-50" r="12" fill="#FFE066" ${GARIS}/><text x="48" y="-45" font-size="14" fill="#0F766E" ${HURUF}>%</text></g>`,
  4: `<g ${GARIS}>
      <g class="ani-jatuh-kecil"><rect x="-40" y="-32" width="16" height="16" fill="#E8B04B"/><line x1="-32" y1="-32" x2="-32" y2="-16"/></g>
      <g class="ani-jatuh-kecil ani-d2"><rect x="-20" y="-32" width="16" height="16" fill="#F5A524"/><line x1="-12" y1="-32" x2="-12" y2="-16"/></g>
      <path d="M-50 -16 H6 L-2 10 H-42 Z" fill="#C98B4E"/>
      <g class="ani-gerobak-kecil">
        <rect x="22" y="-14" width="30" height="16" rx="2" fill="#E5533D"/>
        <rect x="27" y="-26" width="12" height="12" fill="#E8B04B"/>
        <line x1="52" y1="-10" x2="62" y2="-20"/>
        <circle cx="29" cy="5" r="4" fill="#2B2B2B"/><circle cx="45" cy="5" r="4" fill="#2B2B2B"/>
      </g>
    </g>
    <text x="-22" y="0" font-size="8" fill="#FFF4DC" ${HURUF}>MODAL</text>
    <text x="40" y="-34" font-size="7.5" fill="#7C2D12" ${HURUF}>ongkos</text>`,
  5: `<g ${GARIS}>
      <rect x="-50" y="-42" width="100" height="54" fill="#FFF8EA"/>
      <rect x="-58" y="-46" width="10" height="62" rx="5" fill="#E8D3A8"/><rect x="48" y="-46" width="10" height="62" rx="5" fill="#E8D3A8"/>
    </g>
    <g fill="#CFC6B2"><rect x="-40" y="-33" width="80" height="6" rx="3"/><rect x="-40" y="-21" width="80" height="6" rx="3"/><rect x="-40" y="-9" width="80" height="6" rx="3"/><rect x="-40" y="3" width="60" height="6" rx="3"/></g>
    <rect class="ani-sorot-teks" x="-6" y="-35" width="24" height="10" rx="4" fill="#7FB0F5"/>
    <rect class="ani-sorot-teks ani-d2" x="-40" y="-11" width="20" height="10" rx="4" fill="#F5B26B"/>
    <rect class="ani-sorot-teks ani-d3" x="6" y="1" width="24" height="10" rx="4" fill="#6FD394"/>
    <g class="ani-kaca-kecil"><g ${GARIS}>
      <line x1="-24" y1="-12" x2="-14" y2="-1" stroke="#8B5A2B" stroke-width="6"/>
      <circle cx="-32" cy="-21" r="12" fill="rgba(255,255,255,0.5)" stroke-width="4"/>
    </g></g>`,
  6: `<g ${GARIS}>
      <rect x="-50" y="-8" width="32" height="20" fill="#7FB0F5"/>
      <rect x="-18" y="-20" width="36" height="32" fill="#1E5FBF"/>
      <rect x="18" y="-2" width="32" height="14" fill="#7FB0F5"/>
      <g class="ani-melayang">
        <path d="M-12 -56 h24 v6 a12 12 0 0 1 -24 0 z" fill="#F6BE3B"/>
        <path d="M-12 -53 q-8 0 -7 7 q1 5 8 5" fill="none" stroke-width="2.5"/><path d="M12 -53 q8 0 7 7 q-1 5 -8 5" fill="none" stroke-width="2.5"/>
        <rect x="-3" y="-39" width="6" height="8" fill="#F6BE3B"/><rect x="-9" y="-32" width="18" height="6" rx="2" fill="#B7791F"/>
      </g>
    </g>
    <text x="0" y="2" font-size="13" fill="#fff" ${HURUF}>1</text>
    <g fill="#F6BE3B" stroke="#2B2B2B" stroke-width="2" stroke-linejoin="round">
      <polygon class="ani-kilip" points="${bintang(-38, -36, 7)}"/>
      <polygon class="ani-kilip ani-d2" points="${bintang(40, -30, 8)}"/>
      <polygon class="ani-kilip ani-d3" points="${bintang(44, -54, 5)}"/>
    </g>`,
};

/** Hiasan di kolom kiri tiap lantai (bergantian). */
function hiasanKiri(i, T) {
  if (i % 3 === 0) {
    return `<g transform="translate(38 ${T + 196})"><g ${GARIS}>
      <path d="M-14 0 L-11 -22 H11 L14 0 Z" fill="#D9634C"/></g>
      <g class="ani-ayun-daun"><g ${GARIS} stroke-width="2.5">
        <ellipse cx="-9" cy="-36" rx="7" ry="15" fill="#4CAF50" transform="rotate(-25 -9 -36)"/>
        <ellipse cx="9" cy="-36" rx="7" ry="15" fill="#43A047" transform="rotate(25 9 -36)"/>
        <ellipse cx="0" cy="-44" rx="7" ry="17" fill="#66BB6A"/></g></g></g>`;
  }
  if (i % 3 === 1) {
    return `<g transform="translate(38 ${T + 196})"><g ${GARIS}>
      <path d="M-26 0 q-4 -26 6 -34 h14 q10 8 6 34 z" fill="#F3E9D2"/>
      <path d="M2 0 q-4 -20 6 -27 h12 q10 7 6 27 z" fill="#EFE2C4"/></g>
      <text x="-13" y="-12" font-size="7" fill="#8B5A2B" ${HURUF}>BERAS</text>
      <text x="14" y="-9" font-size="6" fill="#8B5A2B" ${HURUF}>GULA</text></g>`;
  }
  return `<g transform="translate(38 ${T + 18})"><g class="ani-ayun"><g ${GARIS}>
      <line x1="0" y1="0" x2="0" y2="22"/>
      <ellipse cx="0" cy="40" rx="16" ry="19" fill="#E5533D"/>
      <rect x="-9" y="19" width="18" height="5" fill="#F6BE3B"/><rect x="-9" y="56" width="18" height="5" fill="#F6BE3B"/>
      <line x1="0" y1="61" x2="0" y2="70" stroke="#F6BE3B"/></g></g></g>`;
}

/** Bendera segitiga di langit-langit lantai. */
function bendera(T) {
  const warna = ['#E5533D', '#F6BE3B', '#2E9E4F', '#1E9BD7', '#8B5CF6'];
  const segitiga = Array.from({ length: 11 }, (_, k) => {
    const x = 6 + k * 26;
    return `<path d="M${x} ${T + 4} l18 0 l-9 13 z" fill="${warna[k % warna.length]}"/>`;
  }).join('');
  return `<g class="ani-ayun-kecil"><path d="M0 ${T + 4} Q145 ${T + 10} 290 ${T + 4}" fill="none" stroke="#2B2B2B" stroke-width="1.5"/>
    <g stroke="#2B2B2B" stroke-width="1.5" stroke-linejoin="round">${segitiga}</g></g>`;
}

/** Tangga dari lantai T (bawah) ke lantai di atasnya, di kolom kanan. */
function tangga(T, terbuka) {
  const bawah = T + 196;
  let d = `M292 ${bawah}`;
  let x = 292;
  let y = bawah;
  for (let k = 0; k < 7; k++) { y -= 30; d += ` V${y}`; x += 8.6; d += ` H${x}`; }
  const karpet = terbuka ? '#E5533D' : '#A7AFB9';
  return `<path d="${d} V${bawah} Z" fill="#C98B4E" stroke="#2B2B2B" stroke-width="2.5" stroke-linejoin="round"/>
    <path d="${d}" fill="none" stroke="${karpet}" stroke-width="5" stroke-linejoin="round"/>
    <line x1="292" y1="${bawah - 34}" x2="352" y2="${bawah - 244}" stroke="#2B2B2B" stroke-width="3" stroke-linecap="round"/>`;
}

/** Rolling door tertutup + gembok (kios terkunci). */
function rollingDoor(T) {
  const garis = Array.from({ length: 11 }, (_, k) => `<line x1="78" y1="${T + 84 + k * 10}" x2="282" y2="${T + 84 + k * 10}"/>`).join('');
  return `<rect x="78" y="${T + 74}" width="204" height="122" fill="#B9C1CB" stroke="#2B2B2B" stroke-width="3"/>
    <g stroke="#8D97A3" stroke-width="2">${garis}</g>
    <rect x="132" y="${T + 120}" width="96" height="26" rx="5" fill="#FFFFFF" stroke="#2B2B2B" stroke-width="2.5"/>
    <text x="180" y="${T + 139}" font-size="15" fill="#B91C1C" ${HURUF}>TUTUP</text>
    <g ${GARIS}><path d="M172 ${T + 166} v-8 a8 8 0 0 1 16 0 v8" fill="none"/><rect x="167" y="${T + 165}" width="26" height="20" rx="3" fill="#F6BE3B"/></g>`;
}

/**
 * @param {Array} daftar  isi wilayah.json
 * @param {object} opsi   { status(id), bintang(id), sekarang (id wilayah aktif), onPilih(id) }
 */
export function petaPasar(daftar, { status, bintang: bintangWilayah, sekarang, onPilih }) {
  const atasLantai = (i) => TINGGI - 90 - (i + 1) * TINGGI_LANTAI;
  const semuaSelesai = daftar.every((w) => status(w.id) === 'selesai');

  const lantai = daftar.map((w, i) => {
    const T = atasLantai(i);
    const st = status(w.id);
    const warna = (w.warna && w.warna[0]) || '#1E5FBF';
    const tenda = Array.from({ length: 8 }, (_, k) => `<rect x="${74 + k * 26.5}" y="${T + 50}" width="13" height="24" fill="#FFFFFF"/>`).join('');
    const rumbai = Array.from({ length: 8 }, (_, k) => `q6.875 12 13.75 0 q6.875 12 13.75 0`).join(' ');
    const berikutTerbuka = i < daftar.length - 1 ? status(daftar[i + 1].id) !== 'terkunci' : semuaSelesai;
    return `<g class="lantai${st === 'terkunci' ? ' lantai-tutup' : ''}">
      <rect x="0" y="${T}" width="${LEBAR}" height="196" fill="${DINDING[w.id] || '#FFF3DC'}"/>
      <g fill="#FFFFFF" opacity="0.35">${Array.from({ length: 6 }, (_, k) => `<rect x="${k * 64}" y="${T}" width="32" height="196"/>`).join('')}</g>
      ${bendera(T)}
      ${hiasanKiri(i, T)}
      <rect x="78" y="${T + 74}" width="204" height="122" fill="#FFF8EA" stroke="#2B2B2B" stroke-width="3"/>
      <g transform="translate(180 ${T + 150}) scale(1.2)">${BARANG[w.id] || ''}</g>
      <rect x="78" y="${T + 166}" width="204" height="30" fill="#A8693A" stroke="#2B2B2B" stroke-width="3"/>
      <line x1="78" y1="${T + 176}" x2="282" y2="${T + 176}" stroke="#7C4A1E" stroke-width="2"/>
      ${st === 'terkunci' ? rollingDoor(T) : ''}
      <g stroke="#2B2B2B" stroke-width="3" stroke-linejoin="round">
        <rect x="70" y="${T + 50}" width="220" height="24" fill="${warna}"/>
        <g stroke="none">${tenda}</g>
        <rect x="70" y="${T + 50}" width="220" height="24" fill="none"/>
        <path d="M70 ${T + 74} ${rumbai}" fill="${warna}"/>
        <rect x="92" y="${T + 10}" width="176" height="38" rx="8" fill="#FFF4DC"/>
      </g>
      ${tangga(T, berikutTerbuka)}
      <rect x="0" y="${T + 196}" width="${LEBAR}" height="14" fill="#8B5A2B" stroke="#2B2B2B" stroke-width="2.5"/>
    </g>`;
  }).join('');

  const svg = `<svg viewBox="0 0 ${LEBAR} ${TINGGI}" preserveAspectRatio="xMidYMid slice" aria-hidden="true">
    <defs><linearGradient id="langit-pasar" x1="0" y1="0" x2="0" y2="1">
      <stop offset="0" stop-color="#8FD3FF"/><stop offset="1" stop-color="#E6F6FF"/></linearGradient></defs>
    <rect width="${LEBAR}" height="${ATAP}" fill="url(#langit-pasar)"/>
    <g class="ani-putar-lambat" ><circle cx="318" cy="38" r="16" fill="#FFD43B" stroke="#F59F00" stroke-width="3"/></g>
    ${awan(60, 34, '', '#FFFFFF')}${awan(220, 22, 'lambat', '#FFFFFF')}
    <g ${GARIS}>
      <line x1="96" y1="150" x2="96" y2="64"/><line x1="264" y1="150" x2="264" y2="64"/>
      <rect x="74" y="58" width="212" height="46" rx="8" fill="#E5533D"/>
      <path d="M162 58 l6 -16 l12 10 l12 -10 l6 16 z" fill="#F6BE3B"/>
    </g>
    <text x="180" y="88" font-size="19" fill="#FFF4DC" ${HURUF}>JURAGAN SEJATI</text>
    <g fill="#F6BE3B" stroke="#2B2B2B" stroke-width="2"><polygon class="ani-kilip" points="${bintang(60, 70, 8)}"/><polygon class="ani-kilip ani-d2" points="${bintang(300, 92, 9)}"/></g>
    <g transform="translate(26 150)"><line x1="0" y1="0" x2="0" y2="-62" stroke="#2B2B2B" stroke-width="3"/>
      <g class="ani-kibar"><path d="M0 -62 h28 l-6 9 l6 9 h-28 z" fill="#2E9E4F" stroke="#2B2B2B" stroke-width="2.5" stroke-linejoin="round"/></g></g>
    <g transform="translate(334 150)"><line x1="0" y1="0" x2="0" y2="-62" stroke="#2B2B2B" stroke-width="3"/>
      <g class="ani-kibar ani-d2"><path d="M0 -62 h-28 l6 9 l-6 9 h28 z" fill="#1E9BD7" stroke="#2B2B2B" stroke-width="2.5" stroke-linejoin="round"/></g></g>
    <rect x="0" y="150" width="${LEBAR}" height="20" fill="#C0504D" stroke="#2B2B2B" stroke-width="3"/>
    <g stroke="#8B3A2E" stroke-width="2">${Array.from({ length: 12 }, (_, k) => `<line x1="${k * 30 + 15}" y1="150" x2="${k * 30 + 15}" y2="170"/>`).join('')}</g>
    ${lantai}
    <rect x="0" y="${TINGGI - 90}" width="${LEBAR}" height="90" fill="#D8CDB8"/>
    <g fill="none" stroke="#B9AC93" stroke-width="2">${Array.from({ length: 9 }, (_, k) => `<line x1="${k * 45}" y1="${TINGGI - 90}" x2="${k * 45 - 20}" y2="${TINGGI}"/>`).join('')}
      <line x1="0" y1="${TINGGI - 45}" x2="${LEBAR}" y2="${TINGGI - 45}"/></g>
    <rect x="120" y="${TINGGI - 84}" width="120" height="26" rx="6" fill="#2E9E4F" stroke="#2B2B2B" stroke-width="2.5"/>
    <text x="180" y="${TINGGI - 66}" font-size="11" fill="#FFF4DC" ${HURUF}>SELAMAT DATANG</text>
    <g transform="translate(0 ${TINGGI - 22})"><g class="ani-gerobak-jalan"><g ${GARIS}>
      <rect x="0" y="-22" width="40" height="18" rx="3" fill="#F08A24"/>
      <g fill="#E5533D" stroke-width="2"><circle cx="9" cy="-25" r="5"/><circle cx="20" cy="-27" r="5"/><circle cx="31" cy="-25" r="5"/></g>
      <line x1="40" y1="-16" x2="54" y2="-28"/>
      <circle cx="10" cy="-2" r="5" fill="#2B2B2B"/><circle cx="30" cy="-2" r="5" fill="#2B2B2B"/>
    </g></g></g>
    <g transform="translate(300 ${TINGGI - 30})"><g ${GARIS}>
      <ellipse cx="0" cy="0" rx="18" ry="9" fill="#F5A524"/><circle cx="14" cy="-6" r="7" fill="#F5A524"/>
      <path d="M10 -12 l2 -6 l3 5 M16 -12 l3 -5 l1 6" fill="#F5A524"/></g>
      <g class="ani-zzz"><text x="22" y="-18" font-size="10" fill="#5B6472" ${HURUF}>z</text><text x="30" y="-28" font-size="13" fill="#5B6472" ${HURUF}>Z</text></g></g>
  </svg>`;

  const pX = (x) => `${(x / LEBAR) * 100}%`;
  const pY = (y) => `${(y / TINGGI) * 100}%`;
  const wadah = h('div', { class: 'pasar-peta' });
  wadah.innerHTML = svg; // SVG statis buatan sendiri (tanpa data dari luar)

  daftar.forEach((w, i) => {
    const T = atasLantai(i);
    const st = status(w.id);
    const label = `Lantai ${w.id}, ${w.nama}. ${st === 'selesai' ? 'Selesai' : st === 'terbuka' ? 'Buka' : 'Tutup'}`;
    const pilih = () => { if (st !== 'terkunci') onPilih(w.id); };
    wadah.append(
      h('button', {
        type: 'button', class: `kios-tombol kios-${st}${w.id === sekarang ? ' kios-sekarang' : ''}`,
        style: `left:${pX(70)};top:${pY(T + 8)};width:${pX(220)};height:${pY(190)}`,
        disabled: st === 'terkunci', onclick: pilih, 'aria-label': label,
      }),
      h('div', { class: `kios-papan${st === 'terkunci' ? ' papan-tutup' : ''}`, style: `left:${pX(92)};top:${pY(T + 10)};width:${pX(176)};height:${pY(38)}`, 'aria-hidden': 'true' },
        h('span', { class: 'kios-nomor', style: `--warna-papan:${(w.warna && w.warna[0]) || '#1E5FBF'}` }, st === 'terkunci' ? '🔒' : String(w.id)),
        h('span', { class: 'kios-nama' }, h('b', {}, w.nama), h('small', {}, w.tag || ''))),
    );
    if (st === 'selesai') {
      wadah.append(h('div', { class: 'cap-laris', style: `left:${pX(242)};top:${pY(T + 96)}`, 'aria-hidden': 'true' },
        'LARIS!', h('small', {}, `⭐ ${bintangWilayah(w.id)}`)));
    }
    if (w.id === sekarang) {
      wadah.append(
        h('div', { class: 'lampu-buka', style: `left:${pX(38)};top:${pY(T + 88)}`, 'aria-hidden': 'true' }, 'BUKA'),
        h('div', { class: 'pasar-maskot', style: `left:${pX(272)};top:${pY(T + 196)}`, 'aria-hidden': 'true' },
          h('span', { class: 'pasar-gelembung' }, 'Yuk masuk!'), maskot('lambai')),
      );
    }
  });
  return wadah;
}
