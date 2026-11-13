"""Server lokal untuk mencoba ProfitQuest di laptop dan HP (satu Wi-Fi).

Pemakaian: python tools/serve.py --port 8000
Buka http://localhost:8000 di laptop, atau alamat LAN yang ditampilkan di HP.
Catatan: fitur install & offline (service worker) hanya aktif di localhost atau HTTPS.
"""

from __future__ import annotations

import argparse
import functools
import http.server
import socket
from pathlib import Path

AKAR_APP = Path(__file__).resolve().parents[1] / "app"


class Penangan(http.server.SimpleHTTPRequestHandler):
    extensions_map = {
        **http.server.SimpleHTTPRequestHandler.extensions_map,
        ".js": "text/javascript",
        ".json": "application/json",
        ".webmanifest": "application/manifest+json",
        ".svg": "image/svg+xml",
    }

    def end_headers(self) -> None:
        # Tanpa cache saat pengembangan agar perubahan langsung terlihat
        self.send_header("Cache-Control", "no-cache")
        super().end_headers()


def alamat_lan() -> str:
    try:
        with socket.socket(socket.AF_INET, socket.SOCK_DGRAM) as s:
            s.connect(("10.255.255.255", 1))
            return s.getsockname()[0]
    except OSError:
        return "127.0.0.1"


def main() -> None:
    parser = argparse.ArgumentParser(description="Server lokal ProfitQuest")
    parser.add_argument("--port", type=int, default=8000)
    args = parser.parse_args()
    penangan = functools.partial(Penangan, directory=str(AKAR_APP))
    with http.server.ThreadingHTTPServer(("0.0.0.0", args.port), penangan) as server:
        print("ProfitQuest berjalan:")
        print(f"  Laptop : http://localhost:{args.port}")
        print(f"  HP     : http://{alamat_lan()}:{args.port}  (satu Wi-Fi)")
        print("Tekan Ctrl+C untuk berhenti.")
        try:
            server.serve_forever()
        except KeyboardInterrupt:
            print("\nServer dihentikan.")


if __name__ == "__main__":
    main()
