"""Uji rumus Python terhadap test vector bersama."""

import json
import sys
from pathlib import Path

import pytest

AKAR = Path(__file__).resolve().parents[2]
sys.path.insert(0, str(AKAR / "tools"))

import profit_core as pc  # noqa: E402

VEKTOR = json.loads((AKAR / "tests" / "test-vectors.json").read_text(encoding="utf-8"))


@pytest.mark.parametrize("k", VEKTOR["untung_rugi"])
def test_untung_rugi(k):
    modal = pc.hitung_modal(k["hb"], k["ongkos"])
    assert modal == k["modal"]
    assert pc.tentukan_jenis(modal, k["hj"]) == k["jenis"]
    selisih = pc.hitung_selisih(modal, k["hj"])
    assert selisih == k["selisih"]
    assert pc.hitung_persen(selisih, modal) == k["persen"]


@pytest.mark.parametrize("k", VEKTOR["harga_jual_dari_persen"])
def test_harga_jual(k):
    assert pc.harga_jual_dari_persen(k["modal"], k["persen"], k["jenis"]) == k["hj"]


@pytest.mark.parametrize("k", VEKTOR["modal_dari_harga_jual"])
def test_modal(k):
    assert pc.modal_dari_harga_jual(k["hj"], k["persen"], k["jenis"]) == k["modal"]


@pytest.mark.parametrize("k", VEKTOR["format"])
def test_format(k):
    assert pc.format_rupiah(k["angka"]) == k["rupiah"]
    assert pc.format_persen(k["persen_masuk"]) == k["persen"]


def test_modal_nol_ditolak():
    with pytest.raises(ValueError):
        pc.hitung_persen(1000, 0)
