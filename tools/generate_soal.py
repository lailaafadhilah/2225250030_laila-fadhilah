"""Membangkitkan bank soal dari templat.

Pemakaian:
    python tools/generate_soal.py                 # 20 soal per templat
    python tools/generate_soal.py --per-templat 30 --seed 7

Hasil: app/content/bank-soal.json (dipakai aplikasi untuk latihan & checkpoint).
Angka dipilih agar untung/rugi berupa kelipatan Rp500 dan persentasenya "ramah" (IL03).
"""

from __future__ import annotations

import argparse
import json
import random
from pathlib import Path

import profit_core as pc

AKAR = Path(__file__).resolve().parents[1]
TEMPLAT = Path(__file__).resolve().parent / "templat-soal.json"
KELUARAN = AKAR / "app" / "content" / "bank-soal.json"


def token(peran: str, teks: str) -> str:
    """Membungkus angka menjadi token cerita, mis. [[hb:Rp80.000]]."""
    return f"[[{peran}:{teks}]]"


def acak_kelipatan(rng: random.Random, minimum: int, maksimum: int, kelipatan: int) -> int:
    return rng.randrange(minimum // kelipatan, maksimum // kelipatan + 1) * kelipatan


def kalimat_ongkos(daftar: list[dict]) -> str:
    bagian = [f"{o['nama']} {token('ongkos', pc.format_rupiah(o['nilai']))}" for o in daftar]
    return " dan ".join(bagian)


def buat_satu(rng: random.Random, t: dict, umum: dict, nomor: int) -> dict | None:
    """Mencoba membuat satu soal. Mengembalikan None jika angka tidak ramah."""
    jenis = rng.choice(t["jenis"])
    persen = rng.choice(t["persen"])
    barang = rng.choice(t["barang"])
    tokoh = rng.choice(umum["tokoh"])
    modal_awal = acak_kelipatan(rng, barang["min"], barang["max"], barang["kelipatan"])

    ongkos: list[dict] = []
    for o in rng.sample(umum["ongkos"], rng.choice(t["jumlah_ongkos"])):
        ongkos.append({"nama": o["nama"], "nilai": acak_kelipatan(rng, o["min"], o["max"], 1000)})

    modal = pc.hitung_modal(modal_awal, ongkos)
    besar = modal * persen / 100
    if besar != int(besar) or int(besar) % 500 != 0:
        return None  # untung/rugi harus kelipatan Rp500
    besar = int(besar)
    hj = modal + besar if jenis == "untung" else modal - besar

    soal: dict = {
        "id": f"{t['id']}-{nomor:02d}",
        "ikon": barang["ikon"],
        "barang": barang["benda"],
        "ditanya": t["ditanya"],
        "kenali": t["kenali"],
    }
    isian = {
        "tokoh": tokoh,
        "barang": barang["nama"],
        "benda": barang["benda"],
        "hb": token("hb", pc.format_rupiah(modal_awal)),
        "hj": token("hj", pc.format_rupiah(hj)),
        "persen": token("persen", pc.format_persen(persen)),
        "ongkos": kalimat_ongkos(ongkos),
        "pengecoh": "",
    }
    if t.get("pengecoh"):
        isian["pengecoh"] = rng.choice(umum["pengecoh"]).replace("{x}", token("x", str(rng.randint(3, 45))))

    if t["ditanya"] == "modal":
        soal.update({"hj": hj, "persen": persen, "jenis": jenis})
        if pc.modal_dari_harga_jual(hj, persen, jenis) != modal:
            return None
    elif t["ditanya"] == "hj":
        soal.update({"hb": modal_awal, "ongkos": ongkos, "persen": persen, "jenis": jenis})
    else:
        soal.update({"hb": modal_awal, "ongkos": ongkos, "hj": hj})
        if t.get("pembagi"):
            soal["pembagi"] = True

    soal["cerita"] = rng.choice(t["cerita"][jenis]).format(**isian).replace("  ", " ")
    soal["kunci"] = pc.kunci_soal(soal)
    return soal


def bangkitkan(per_templat: int, seed: int) -> dict:
    data = json.loads(TEMPLAT.read_text(encoding="utf-8"))
    rng = random.Random(seed)
    bank: dict[str, list[dict]] = {}
    for t in data["templat"]:
        hasil: list[dict] = []
        sidik: set[tuple] = set()
        percobaan = 0
        while len(hasil) < per_templat and percobaan < 20000:
            percobaan += 1
            soal = buat_satu(rng, t, data, len(hasil) + 1)
            if soal is None:
                continue
            kunci = (soal["barang"], soal.get("hb"), soal.get("hj"), soal.get("persen"))
            if kunci in sidik:
                continue
            sidik.add(kunci)
            hasil.append(soal)
        if len(hasil) < per_templat:
            raise SystemExit(f"Templat {t['id']} hanya menghasilkan {len(hasil)} soal. Longgarkan rentang angka.")
        bank[t["id"]] = hasil
    return {"keterangan": "DIBUAT OTOMATIS oleh tools/generate_soal.py — jangan diedit manual.", "seed": seed, "soal": bank}


def main() -> None:
    parser = argparse.ArgumentParser(description=__doc__, formatter_class=argparse.RawDescriptionHelpFormatter)
    parser.add_argument("--per-templat", type=int, default=20)
    parser.add_argument("--seed", type=int, default=2026)
    args = parser.parse_args()
    bank = bangkitkan(args.per_templat, args.seed)
    KELUARAN.write_text(json.dumps(bank, ensure_ascii=False, indent=1), encoding="utf-8")
    total = sum(len(v) for v in bank["soal"].values())
    print(f"✔ {total} soal ditulis ke {KELUARAN.relative_to(AKAR)}")


if __name__ == "__main__":
    main()
