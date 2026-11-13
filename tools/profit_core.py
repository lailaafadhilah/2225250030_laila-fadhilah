"""Implementasi rujukan rumus untung-rugi (padanan app/js/core/hitung.js).

Dipakai untuk uji silang dan validasi kunci jawaban konten.
Semua hasil harus identik dengan versi JavaScript.
"""

from __future__ import annotations

from typing import Iterable, Literal

Jenis = Literal["untung", "rugi", "impas"]


def _bulat(x: float) -> int:
    """Pembulatan setengah ke atas, sama seperti Math.round di JavaScript."""
    import math

    return math.floor(x + 0.5)


def hitung_modal(harga_beli: int, biaya_tambahan: int | Iterable = 0) -> int:
    """Modal = harga beli + semua biaya tambahan."""
    if isinstance(biaya_tambahan, (int, float)):
        return harga_beli + int(biaya_tambahan)
    total = 0
    for b in biaya_tambahan:
        total += b["nilai"] if isinstance(b, dict) else b
    return harga_beli + total


def tentukan_jenis(modal: int, harga_jual: int) -> Jenis:
    """Untung jika harga jual > modal, rugi jika lebih kecil, impas jika sama."""
    if harga_jual > modal:
        return "untung"
    if harga_jual < modal:
        return "rugi"
    return "impas"


def hitung_selisih(modal: int, harga_jual: int) -> int:
    """Besar untung atau rugi (selalu >= 0)."""
    return abs(harga_jual - modal)


def hitung_persen(selisih: int, modal: int) -> float:
    """Persentase terhadap MODAL, dibulatkan 2 angka di belakang koma."""
    if modal <= 0:
        raise ValueError("Modal harus lebih dari 0")
    return _bulat(selisih * 10000 / modal) / 100


def harga_jual_dari_persen(modal: int, persen: float, jenis: str) -> int:
    """Harga jual jika modal dan persentase diketahui."""
    faktor = 100 - persen if jenis == "rugi" else 100 + persen
    return _bulat(modal * faktor / 100)


def modal_dari_harga_jual(harga_jual: int, persen: float, jenis: str) -> int:
    """Modal jika harga jual dan persentase diketahui."""
    faktor = 100 - persen if jenis == "rugi" else 100 + persen
    return _bulat(harga_jual * 100 / faktor)


def kunci_soal(soal: dict) -> dict:
    """Menghitung kunci jawaban dari satu objek soal (struktur sama dengan JS)."""
    ongkos = soal.get("ongkos", [])
    ditanya = soal.get("ditanya")
    if ditanya == "hj":
        modal = hitung_modal(soal["hb"], ongkos)
        return {
            "modal": modal,
            "jenis": soal["jenis"],
            "hj": harga_jual_dari_persen(modal, soal["persen"], soal["jenis"]),
        }
    if ditanya == "modal":
        modal = modal_dari_harga_jual(soal["hj"], soal["persen"], soal["jenis"])
        return {"modal": modal, "jenis": soal["jenis"], "hj": soal["hj"]}
    modal = hitung_modal(soal["hb"], ongkos)
    selisih = hitung_selisih(modal, soal["hj"])
    return {
        "modal": modal,
        "jenis": tentukan_jenis(modal, soal["hj"]),
        "selisih": selisih,
        "persen": hitung_persen(selisih, modal),
    }


def format_rupiah(n: int) -> str:
    """12500 -> 'Rp12.500'."""
    return "Rp" + f"{int(n):,}".replace(",", ".")


def format_persen(x: float) -> str:
    """12.5 -> '12,5%' (maks. 2 desimal)."""
    bulat = _bulat(x * 100) / 100
    teks = f"{bulat:.2f}".rstrip("0").rstrip(".")
    return teks.replace(".", ",") + "%"
