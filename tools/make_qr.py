"""Membuat QR code untuk brosur.

Pemakaian: python tools/make_qr.py https://alamat-profitquest-anda
Hasil: brosur/qr.png (dipakai oleh brosur/brosur.html)
Butuh: pip install "qrcode[pil]"
"""

from __future__ import annotations

import sys
from pathlib import Path

KELUARAN = Path(__file__).resolve().parents[1] / "brosur" / "qr.png"


def main() -> None:
    if len(sys.argv) != 2 or not sys.argv[1].startswith("http"):
        raise SystemExit("Pemakaian: python tools/make_qr.py https://alamat-aplikasi")
    try:
        import qrcode
        from qrcode.constants import ERROR_CORRECT_Q
    except ImportError:
        raise SystemExit('Pustaka belum terpasang. Jalankan: pip install "qrcode[pil]"')

    qr = qrcode.QRCode(error_correction=ERROR_CORRECT_Q, box_size=12, border=4)
    qr.add_data(sys.argv[1])
    qr.make(fit=True)
    KELUARAN.parent.mkdir(exist_ok=True)
    qr.make_image(fill_color="#1E5FBF", back_color="white").save(KELUARAN)
    print(f"✔ QR code disimpan di {KELUARAN}")


if __name__ == "__main__":
    main()
