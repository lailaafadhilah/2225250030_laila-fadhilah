"""Membuat ikon PWA (PNG) tanpa pustaka tambahan.

Pemakaian: python tools/make_icons.py
Hasil: app/assets/icons/{icon-192,icon-512,icon-maskable-512,apple-touch-icon}.png
Desain: latar biru, koin emas, tanda persen biru, dan panah hijau naik.
"""

from __future__ import annotations

import math
import struct
import zlib
from pathlib import Path

AKAR = Path(__file__).resolve().parents[1]
FOLDER = AKAR / "app" / "assets" / "icons"

BIRU = (30, 95, 191)
EMAS = (246, 190, 59)
EMAS_TUA = (214, 150, 24)
HIJAU = (27, 160, 70)


def tulis_png(jalur: Path, lebar: int, tinggi: int, piksel: list[bytes]) -> None:
    """Menulis PNG RGB 8-bit dari daftar baris piksel."""
    mentah = b"".join(b"\x00" + baris for baris in piksel)

    def potongan(jenis: bytes, data: bytes) -> bytes:
        return struct.pack(">I", len(data)) + jenis + data + struct.pack(">I", zlib.crc32(jenis + data) & 0xFFFFFFFF)

    isi = b"\x89PNG\r\n\x1a\n"
    isi += potongan(b"IHDR", struct.pack(">IIBBBBB", lebar, tinggi, 8, 2, 0, 0, 0))
    isi += potongan(b"IDAT", zlib.compress(mentah, 9))
    isi += potongan(b"IEND", b"")
    jalur.write_bytes(isi)


def warna_titik(x: float, y: float, skala: float) -> tuple[int, int, int]:
    """Warna pada koordinat ternormalisasi (0..1). skala < 1 mengecilkan gambar (zona aman maskable)."""
    cx, cy = 0.5, 0.5
    u = (x - cx) / skala
    v = (y - cy) / skala
    r = math.hypot(u, v)
    # Panah hijau naik di kanan atas
    if 0.16 <= u <= 0.40 and -0.42 <= v <= -0.18:
        ax, ay = u - 0.28, v + 0.30
        if ay <= 0 and abs(ax) <= (ay + 0.12) * 1.0 and ay >= -0.12:
            return HIJAU
    if 0.24 <= u <= 0.32 and -0.18 < v <= -0.06:
        return HIJAU
    if r <= 0.30:
        if r >= 0.26:
            return EMAS_TUA
        # tanda persen: dua lingkaran + garis miring
        for ox, oy in ((-0.10, -0.10), (0.10, 0.10)):
            d = math.hypot(u - ox, v - oy)
            if 0.028 <= d <= 0.062:
                return BIRU
        jarak_garis = abs(u + v) / math.sqrt(2)
        if jarak_garis <= 0.022 and abs(u - v) <= 0.30:
            return BIRU
        return EMAS
    return BIRU


def gambar(ukuran: int, skala: float = 1.0) -> list[bytes]:
    baris = []
    sub = ((0.25, 0.25), (0.75, 0.25), (0.25, 0.75), (0.75, 0.75))
    for py in range(ukuran):
        data = bytearray()
        for px in range(ukuran):
            jumlah = [0, 0, 0]
            for sx, sy in sub:
                w = warna_titik((px + sx) / ukuran, (py + sy) / ukuran, skala)
                for i in range(3):
                    jumlah[i] += w[i]
            data += bytes(round(c / len(sub)) for c in jumlah)
        baris.append(bytes(data))
    return baris


def main() -> None:
    FOLDER.mkdir(parents=True, exist_ok=True)
    for nama, ukuran, skala in (
        ("icon-192.png", 192, 1.2),
        ("icon-512.png", 512, 1.2),
        ("icon-maskable-512.png", 512, 0.95),
        ("apple-touch-icon.png", 180, 1.1),
    ):
        tulis_png(FOLDER / nama, ukuran, ukuran, gambar(ukuran, skala))
        print(f"✔ {nama}")


if __name__ == "__main__":
    main()
