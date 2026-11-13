"""Menggabungkan seluruh aplikasi menjadi SATU berkas HTML.

Mengapa: halaman di claude.ai (dan beberapa hosting lain) memblokir berkas CSS/JS terpisah.
Satu berkas juga bisa dikirim langsung (WhatsApp/Drive) dan dibuka dengan klik dua kali.

Pemakaian:
    python tools/bundel_satu_file.py                 # → dist/profitquest-terbit.html (untuk claude.ai, tanpa <html>/<head>)
    python tools/bundel_satu_file.py --lengkap       # → dist/profitquest.html (dokumen HTML lengkap)

Isinya: semua CSS → <style>, semua modul JS → satu <script> (modul dibungkus fungsi),
semua JSON konten → objek di halaman (fetch ke content/ dialihkan ke sana), gambar → data URI.
"""

from __future__ import annotations

import argparse
import base64
import json
import re
from pathlib import Path

AKAR = Path(__file__).resolve().parents[1]
APP = AKAR / "app"
DIST = AKAR / "dist"
CSS = ["css/tokens.css", "css/main.css", "css/pastel.css", "css/animasi.css"]
GAMBAR = ["assets/gambar/pasar.webp", "assets/icons/icon-192.png", "assets/icons/apple-touch-icon.png"]

POLA_IMPOR_NAMA = re.compile(r"^import\s*\{([^}]*)\}\s*from\s*'([^']+)';\s*$", re.M)
POLA_IMPOR_SEMUA = re.compile(r"^import\s*\*\s*as\s+(\w+)\s+from\s*'([^']+)';\s*$", re.M)
POLA_EKSPOR = re.compile(r"^export\s+(async\s+function|function|const|let)\s+(\w+)", re.M)


def jalur_relatif(dari: str, ke: str) -> str:
    """'js/screens/kuis.js' + '../ui/dom.js' → 'js/ui/dom.js'."""
    bagian = dari.split("/")[:-1]
    for p in ke.split("/"):
        if p == "..":
            bagian.pop()
        elif p != ".":
            bagian.append(p)
    return "/".join(bagian)


def ubah_modul(nama: str, kode: str) -> tuple[str, list[str]]:
    """Mengubah satu modul ES menjadi isi fungsi pembungkus. Mengembalikan (kode, dependensi)."""
    dep: list[str] = []

    def ganti_nama(m: re.Match) -> str:
        jalur = jalur_relatif(nama, m.group(2))
        dep.append(jalur)
        nama_impor = []
        for x in m.group(1).split(","):
            x = x.strip()
            if not x:
                continue
            asal, _, alias = x.partition(" as ")
            nama_impor.append(f"{asal.strip()}: {alias.strip()}" if alias else asal.strip())
        return f"const {{ {', '.join(nama_impor)} }} = __perlu('{jalur}');"

    def ganti_semua(m: re.Match) -> str:
        jalur = jalur_relatif(nama, m.group(2))
        dep.append(jalur)
        return f"const {m.group(1)} = __perlu('{jalur}');"

    kode = POLA_IMPOR_NAMA.sub(ganti_nama, kode)
    kode = POLA_IMPOR_SEMUA.sub(ganti_semua, kode)
    ekspor = [m.group(2) for m in POLA_EKSPOR.finditer(kode)]
    kode = POLA_EKSPOR.sub(lambda m: f"{m.group(1)} {m.group(2)}", kode)
    if re.search(r"^\s*(import|export)\b", kode, re.M):
        raise SystemExit(f"Bentuk import/export yang belum didukung di {nama}")
    kode += f"\nreturn {{ {', '.join(ekspor)} }};"
    return kode, dep


def kumpulkan_modul() -> dict[str, str]:
    """Membaca main.js dan semua modul yang dipakainya (urutan bebas, dimuat saat diperlukan)."""
    hasil: dict[str, str] = {}
    antre = ["js/main.js"]
    while antre:
        nama = antre.pop()
        if nama in hasil:
            continue
        kode, dep = ubah_modul(nama, (APP / nama).read_text(encoding="utf-8"))
        hasil[nama] = kode
        antre.extend(dep)
    return hasil


def data_uri(rel: str) -> str:
    jenis = {"webp": "image/webp", "png": "image/png"}[rel.rsplit(".", 1)[1]]
    return f"data:{jenis};base64," + base64.b64encode((APP / rel).read_bytes()).decode()


def sematkan_gambar(teks: str, peta: dict[str, str]) -> str:
    for rel, uri in peta.items():
        teks = teks.replace(rel, uri)
    return teks


def bangun(lengkap: bool) -> Path:
    peta_gambar = {rel: data_uri(rel) for rel in GAMBAR}
    modul = kumpulkan_modul()
    konten = {f"content/{p.name}": json.loads(p.read_text(encoding="utf-8")) for p in sorted((APP / "content").glob("*.json"))}

    gaya = "\n".join(f"/* ===== {rel} ===== */\n" + (APP / rel).read_text(encoding="utf-8") for rel in CSS)
    gaya += """
/* ===== penyesuaian satu berkas ===== */
.kepala { top: env(safe-area-inset-top, 0px); }
body { background-color: var(--latar); }
"""
    definisi = ",\n".join(f"{json.dumps(n)}: function () {{\n{k}\n}}" for n, k in modul.items())
    skrip = f"""(function () {{
'use strict';
// Konten JSON tersemat: fetch('content/…') dilayani dari sini (tanpa jaringan).
const __KONTEN = {json.dumps(konten, ensure_ascii=False)};
const __fetchAsli = window.fetch ? window.fetch.bind(window) : null;
window.fetch = function (url, opsi) {{
  const kunci = String(url).replace(/^\\.?\\//, '');
  if (kunci in __KONTEN) return Promise.resolve(new Response(JSON.stringify(__KONTEN[kunci]), {{ headers: {{ 'Content-Type': 'application/json' }} }}));
  return __fetchAsli ? __fetchAsli(url, opsi) : Promise.reject(new Error('fetch tidak tersedia'));
}};
// Modul-modul aplikasi (setiap modul dijalankan sekali, saat pertama diperlukan).
const __definisi = {{
{definisi}
}};
const __tembolok = {{}};
function __perlu(nama) {{
  if (!(nama in __tembolok)) {{
    if (!__definisi[nama]) throw new Error('Modul tidak ditemukan: ' + nama);
    __tembolok[nama] = __definisi[nama]();
  }}
  return __tembolok[nama];
}}
__perlu('js/main.js');
}})();"""
    skrip = sematkan_gambar(skrip, peta_gambar)

    index = (APP / "index.html").read_text(encoding="utf-8")
    badan = re.search(r"<body>(.*?)</body>", index, re.S).group(1).strip()
    kepala = f"""<title>ProfitQuest</title>
<meta name="description" content="ProfitQuest: Petualangan Menghitung Untung dan Rugi untuk siswa SMP (Aritmetika Sosial).">
<meta name="theme-color" content="#1E5FBF">
<link rel="icon" href="{peta_gambar['assets/icons/icon-192.png']}" type="image/png">
<style>
{gaya}
</style>"""
    isi = f"{kepala}\n{badan}\n<script>\n{skrip}\n</script>\n"
    if lengkap:
        isi = f"""<!doctype html>
<html lang="id">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1, viewport-fit=cover">
{kepala}
</head>
<body>
{badan}
<script>
{skrip}
</script>
</body>
</html>
"""
    DIST.mkdir(exist_ok=True)
    keluaran = DIST / ("profitquest.html" if lengkap else "profitquest-terbit.html")
    keluaran.write_text(isi, encoding="utf-8")
    return keluaran


def main() -> None:
    parser = argparse.ArgumentParser(description=__doc__, formatter_class=argparse.RawDescriptionHelpFormatter)
    parser.add_argument("--lengkap", action="store_true", help="buat dokumen HTML lengkap (untuk dibuka langsung)")
    args = parser.parse_args()
    hasil = bangun(args.lengkap)
    print(f"✔ {hasil.relative_to(AKAR)} ({hasil.stat().st_size // 1024} KB)")


if __name__ == "__main__":
    main()
