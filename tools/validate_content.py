"""Memvalidasi seluruh konten ProfitQuest.

Pemakaian: python tools/validate_content.py
Memeriksa:
  - JSON terbaca dan berstruktur benar
  - token cerita cocok dengan data soal (harga beli, ongkos, harga jual, persen)
  - kunci jawaban = hasil profit_core (rujukan rumus)
  - pilihan ganda punya tepat satu jawaban benar
  - bank soal tersedia untuk setiap templat yang dipakai wilayah
  - semua berkas di app/ masuk daftar precache service worker (agar offline)
Keluar dengan kode 1 jika ada kesalahan.
"""

from __future__ import annotations

import json
import re
import sys
from pathlib import Path

import profit_core as pc

AKAR = Path(__file__).resolve().parents[1]
APP = AKAR / "app"
KONTEN = APP / "content"
POLA_TOKEN = re.compile(r"\[\[(hb|ongkos|hj|persen|x):([^\]]+)\]\]")
DITANYA = {"kenali", "selisih", "persen", "hj", "modal"}
KODE_WAJIB = {"UMUM", "KOSONG", "M1", "M2", "M3", "M4", "M5", "M6", "H1", "H2", "H3", "H4", "K1", "K2", "P1", "T1", "IL05", "C1", "C2", "S1"}
BATAS_UKURAN = 1.5 * 1024 * 1024
# Nama adegan yang ada di app/js/ui/ilustrasi.js (perbarui jika menambah adegan)
ILUSTRASI = {"toko", "jembatan", "gudang", "cerita", "arena"}

kesalahan: list[str] = []
peringatan: list[str] = []


def salah(tempat: str, pesan: str) -> None:
    kesalahan.append(f"[{tempat}] {pesan}")


def baca_json(jalur: Path):
    try:
        return json.loads(jalur.read_text(encoding="utf-8"))
    except (OSError, json.JSONDecodeError) as e:
        salah(jalur.name, f"tidak bisa dibaca: {e}")
        return None


def nilai_token(teks: str) -> float:
    if teks.endswith("%"):
        return float(teks[:-1].replace(",", "."))
    return int(re.sub(r"\D", "", teks) or 0)


def cek_soal(soal: dict, tempat: str) -> None:
    sid = soal.get("id", "?")
    tempat = f"{tempat}:{sid}"
    for f in ("id", "cerita", "ditanya"):
        if f not in soal:
            salah(tempat, f"field '{f}' tidak ada")
            return
    if soal["ditanya"] not in DITANYA:
        salah(tempat, f"ditanya '{soal['ditanya']}' tidak dikenal")
        return
    if soal.get("kenali", "tampil") not in ("tampil", "tandai"):
        salah(tempat, "kenali harus 'tampil' atau 'tandai'")

    token = POLA_TOKEN.findall(soal["cerita"])
    peran = [p for p, _ in token]
    nilai = {p: [nilai_token(t) for q, t in token if q == p] for p in set(peran)}
    sisa = POLA_TOKEN.sub("", soal["cerita"])
    if "[[" in sisa or "]]" in sisa:
        salah(tempat, "ada token cerita yang formatnya salah")

    ongkos = soal.get("ongkos", [])
    if soal["ditanya"] != "modal":
        if nilai.get("hb") != [soal.get("hb")]:
            salah(tempat, f"token hb {nilai.get('hb')} ≠ hb {soal.get('hb')}")
        if nilai.get("ongkos", []) != [o["nilai"] for o in ongkos]:
            salah(tempat, f"token ongkos {nilai.get('ongkos', [])} ≠ ongkos {[o['nilai'] for o in ongkos]}")
    if soal["ditanya"] != "hj" and nilai.get("hj") != [soal.get("hj")]:
        salah(tempat, f"token hj {nilai.get('hj')} ≠ hj {soal.get('hj')}")
    if soal["ditanya"] in ("hj", "modal"):
        if soal.get("jenis") not in ("untung", "rugi"):
            salah(tempat, "soal kebalikan butuh 'jenis' untung/rugi")
            return
        if nilai.get("persen") != [soal.get("persen")]:
            salah(tempat, f"token persen {nilai.get('persen')} ≠ persen {soal.get('persen')}")
        if not 0 < soal.get("persen", 0) < 100:
            salah(tempat, "persen harus antara 0 dan 100")
    if soal.get("kenali") == "tandai" and any(p == "persen" for p in peran):
        salah(tempat, "soal 'tandai' tidak boleh memuat token persen")

    for nama, n in (("hb", soal.get("hb")), ("hj", soal.get("hj"))):
        if n is not None and (not isinstance(n, int) or n <= 0):
            salah(tempat, f"{nama} harus bilangan bulat positif")

    try:
        kunci = pc.kunci_soal(soal)
    except (KeyError, ValueError, ZeroDivisionError) as e:
        salah(tempat, f"kunci tidak bisa dihitung: {e}")
        return
    for k, v in (soal.get("kunci") or {}).items():
        if k in kunci and kunci[k] != v:
            salah(tempat, f"kunci '{k}' tertulis {v}, seharusnya {kunci[k]}")
    if soal["ditanya"] == "modal" and pc.harga_jual_dari_persen(kunci["modal"], soal["persen"], soal["jenis"]) != soal["hj"]:
        salah(tempat, "modal tidak menghasilkan harga jual yang bulat (angka tidak ramah)")


def cek_pilihan(a: dict, tempat: str) -> None:
    opsi = a.get("opsi", [])
    if len(opsi) < 2:
        salah(tempat, "pilihan butuh minimal 2 opsi")
    if sum(1 for o in opsi if o.get("benar")) != 1:
        salah(tempat, "pilihan harus punya tepat satu jawaban benar")
    if not a.get("pertanyaan"):
        salah(tempat, "pertanyaan kosong")


def cek_materi(materi: dict) -> set[str]:
    """Memeriksa materi.json dan semua angka contohnya. Mengembalikan id bab."""
    ids: set[str] = set()
    for bab in materi.get("bab", []):
        t = f"materi.json:{bab.get('id')}"
        if bab.get("id") in ids:
            salah(t, "id bab dipakai dua kali")
        ids.add(bab.get("id"))
        if not bab.get("halaman"):
            salah(t, "bab tanpa halaman")
        for i, hal in enumerate(bab.get("halaman", [])):
            th = f"{t}#hal{i + 1}"
            if not hal.get("judul"):
                salah(th, "halaman tanpa judul")
            if hal.get("gambar") and not (APP / hal["gambar"]).is_file():
                salah(th, f"gambar '{hal['gambar']}' tidak ditemukan")
            if hal.get("ilustrasi") and hal["ilustrasi"] not in ILUSTRASI:
                salah(th, f"ilustrasi '{hal['ilustrasi']}' tidak dikenal")
            for teks in [*hal.get("teks", []), *hal.get("poin", []), hal.get("contoh", "")]:
                sisa = POLA_TOKEN.sub("", teks)
                if "[[" in sisa or "]]" in sisa:
                    salah(th, f"token salah format: {teks[:40]}")
            if hal.get("periksa"):
                cek_periksa(hal["periksa"], th)
    return ids


def cek_periksa(k: dict, tempat: str) -> None:
    """Mencocokkan angka contoh materi dengan rumus rujukan (profit_core)."""
    try:
        if "hb" in k:
            modal = pc.hitung_modal(k["hb"], k.get("ongkos", []))
            if "modal" in k and k["modal"] != modal:
                salah(tempat, f"modal tertulis {k['modal']}, seharusnya {modal}")
            if "hj" in k:
                if "jenis" in k and pc.tentukan_jenis(modal, k["hj"]) != k["jenis"]:
                    salah(tempat, f"jenis tertulis {k['jenis']}, seharusnya {pc.tentukan_jenis(modal, k['hj'])}")
                selisih = pc.hitung_selisih(modal, k["hj"])
                if "selisih" in k and k["selisih"] != selisih:
                    salah(tempat, f"selisih tertulis {k['selisih']}, seharusnya {selisih}")
                if "persen" in k and pc.hitung_persen(selisih, modal) != k["persen"]:
                    salah(tempat, f"persen tertulis {k['persen']}, seharusnya {pc.hitung_persen(selisih, modal)}")
        elif "modal" in k and "hj" in k and "persen" in k:
            if pc.harga_jual_dari_persen(k["modal"], k["persen"], k["jenis"]) != k["hj"]:
                salah(tempat, "harga jual dari persen tidak cocok")
            if pc.modal_dari_harga_jual(k["hj"], k["persen"], k["jenis"]) != k["modal"]:
                salah(tempat, "modal dari harga jual tidak cocok")
        else:
            salah(tempat, "field 'periksa' tidak lengkap")
    except (KeyError, ValueError) as e:
        salah(tempat, f"periksa gagal: {e}")


def cek_wilayah(w: dict, bank: dict, tempat: str, id_terpakai: set, bab_materi: set | None = None) -> None:
    for f in ("id", "nama", "lencana", "aktivitas"):
        if f not in w:
            salah(tempat, f"field '{f}' tidak ada")
            return
    if w["aktivitas"][-1].get("tipe") != "checkpoint":
        salah(tempat, "aktivitas terakhir harus checkpoint")
    for i, a in enumerate(w["aktivitas"]):
        t = f"{tempat}#{i}"
        tipe = a.get("tipe")
        if a.get("id"):
            if a["id"] in id_terpakai:
                salah(t, f"id '{a['id']}' dipakai dua kali")
            id_terpakai.add(a["id"])
        if tipe == "situasi":
            if not a.get("teks"):
                salah(t, "situasi butuh teks")
            if a.get("gambar") and not (APP / a["gambar"]).is_file():
                salah(t, f"gambar '{a['gambar']}' tidak ditemukan")
            if a.get("ilustrasi") and a["ilustrasi"] not in ILUSTRASI:
                salah(t, f"ilustrasi '{a['ilustrasi']}' tidak dikenal")
        elif tipe == "contoh":
            if not a.get("id"):
                salah(t, "contoh butuh id (untuk Buku Contoh)")
            cek_soal(a["soal"], t)
        elif tipe == "pilihan":
            cek_pilihan(a, t)
        elif tipe == "materi":
            if bab_materi is not None and a.get("bab") not in bab_materi:
                salah(t, f"bab materi '{a.get('bab')}' tidak ada di materi.json")
        elif tipe == "susun":
            if len(a.get("kartu", [])) < 3:
                salah(t, "susun butuh minimal 3 kartu")
        elif tipe in ("latihan", "checkpoint"):
            if a.get("sumber") == "bank":
                tersedia = sum(len(bank.get(tp, [])) for tp in a.get("templat", []))
                for tp in a.get("templat", []):
                    if tp not in bank:
                        salah(t, f"templat '{tp}' tidak ada di bank-soal.json")
                if tersedia < a.get("jumlah", 1):
                    salah(t, f"bank hanya punya {tersedia} soal, butuh {a.get('jumlah')}")
            elif tipe == "latihan":
                cek_soal(a["soal"], t)
            else:
                for s in a.get("soal", []):
                    if s.get("tipe") == "pilihan":
                        cek_pilihan(s, t)
                    else:
                        cek_soal(s, t)
        else:
            salah(t, f"tipe aktivitas '{tipe}' tidak dikenal")


def cek_precache() -> None:
    sw = (APP / "sw.js").read_text(encoding="utf-8")
    daftar = set(re.findall(r"'\./([^']*)'", sw))
    berkas = {p.relative_to(APP).as_posix() for p in APP.rglob("*") if p.is_file()}
    berkas.discard("sw.js")
    for b in sorted(berkas - daftar):
        salah("sw.js", f"berkas '{b}' belum ada di PRECACHE (tidak akan jalan offline)")
    for b in sorted(daftar - berkas - {""}):
        salah("sw.js", f"PRECACHE menyebut '{b}' tetapi berkasnya tidak ada")
    ukuran = sum(p.stat().st_size for p in APP.rglob("*") if p.is_file())
    if ukuran > BATAS_UKURAN:
        peringatan.append(f"Ukuran app/ {ukuran / 1024:.0f} KB melebihi 1,5 MB")
    print(f"  Ukuran app/: {ukuran / 1024:.0f} KB")


def main() -> None:
    if hasattr(sys.stdout, "reconfigure"):
        sys.stdout.reconfigure(encoding="utf-8")
    umpan = baca_json(KONTEN / "umpan-balik.json")
    if umpan:
        for k in sorted(KODE_WAJIB - set(umpan["pesan"])):
            salah("umpan-balik.json", f"pesan untuk kode '{k}' tidak ada")
    istilah = baca_json(KONTEN / "istilah.json")
    if istilah:
        for i in istilah["istilah"]:
            if not (i.get("istilah") and i.get("definisi")):
                salah("istilah.json", f"istilah tidak lengkap: {i}")

    bank_data = baca_json(KONTEN / "bank-soal.json") or {"soal": {}}
    bank = bank_data["soal"]
    jumlah_bank = 0
    for tp, daftar in bank.items():
        for s in daftar:
            cek_soal(s, f"bank:{tp}")
            jumlah_bank += 1

    materi = baca_json(KONTEN / "materi.json")
    bab_materi = cek_materi(materi) if materi else set()
    jumlah_periksa = sum(1 for b in (materi or {}).get("bab", []) for hal in b["halaman"] if hal.get("periksa"))
    print(f"  Materi: {len(bab_materi)} bab, {jumlah_periksa} contoh angka diperiksa")

    indeks = baca_json(KONTEN / "wilayah.json")
    id_terpakai: set = set()
    if indeks:
        for w in indeks["wilayah"]:
            if w.get("ilustrasi") and w["ilustrasi"] not in ILUSTRASI:
                salah("wilayah.json", f"ilustrasi '{w['ilustrasi']}' tidak dikenal")
            if w.get("gambar") and not (APP / w["gambar"]).is_file():
                salah("wilayah.json", f"gambar '{w['gambar']}' tidak ditemukan")
            data = baca_json(KONTEN / w["berkas"])
            if data:
                if data.get("id") != w["id"]:
                    salah(w["berkas"], "id tidak sama dengan wilayah.json")
                cek_wilayah(data, bank, w["berkas"], id_terpakai, bab_materi)

    cek_precache()
    print(f"  Bank soal: {jumlah_bank} soal")
    for p in peringatan:
        print(f"⚠ {p}")
    if kesalahan:
        print(f"✖ {len(kesalahan)} kesalahan:")
        for k in kesalahan:
            print(f"  - {k}")
        sys.exit(1)
    print("✔ Semua konten valid.")


if __name__ == "__main__":
    main()
