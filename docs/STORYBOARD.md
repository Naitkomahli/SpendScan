# Storyboard Video Promo — SpendScan

**Produk:** SpendScan (expense tracker Android)
**Fitur yang disorot:** Pembagian saldo ke kantong (Bagi Saldo)
**Format:** 1080×1920 vertikal · 30 fps · **23,0 detik** · 5 adegan
**Gaya:** Quiet luxury — ruang kosong lega, gerakan pelan, tanpa potongan cepat

---

## Catatan Akurasi (baca dulu)

Storyboard ini memakai **label asli aplikasi**. Beberapa istilah pada brief awal tidak ada di app dan sudah dikoreksi:

| Brief | Kenyataan di app |
|---|---|
| Tombol **"Bagi Tabungan"** di kanan bawah | **[TIDAK ADA]** Tombol asli **"Bagi Saldo"** ada di dalam section "Kantong" di Home. Yang di kanan bawah adalah FAB **"+"** (Tambah Transaksi) |
| 3 pos bawaan (Tabungan Pokok / Investasi / Jajan & Foya-foya) | **[TIDAK ADA DEFAULT]** Kantong mulai **kosong**. Ketiga nama itu dibuat user lewat "Kelola Kantong" |
| Istilah "tabungan" | App memakai **"saldo"** dan **"kantong"** |
| Fitur pembagian bulanan | Alokasi **sekali set** (bukan reset bulanan) |

Label yang dipakai di video (semua terverifikasi di kode):

- `HomeScreen` — kartu **"Total Saldo"** (sub: "Saldo seluruh akun"), section **"Kantong"** + link **"Kelola"**, tombol **"Bagi Saldo"**
- `ProfileScreen` — section **"Pengaturan"**, switch **"Bagi Saldo"**, row **"Kelola Kantong"**
- `ManagePocketsScreen` — header **"Kelola Kantong"**, tombol **"Tambah Kantong"**, modal **"Kantong Baru"** (Nama / Jatah Saldo (Rp) / Icon / Warna, tombol Batal + Simpan)
- `AllocateScreen` — header **"Bagi Saldo"**, judul **"Bagi Saldo ke Kantong"**, **"Saldo Total Kamu"**, **"Sisa belum dibagi"**, tombol **"Simpan Alokasi"**
- `PocketCard` — nama kantong, **"Jatah: Rp…"**, **"Terpakai: Rp…"**, bar progres
- `ReportScreen` — **"Pengeluaran per Kantong"**

---

## Arah Visual

- **Frame teks (bukan UI app):** charcoal `#1A1A1A` · ivory `#F7F3E8` · champagne `#D4A94F`
- **Screenshot UI:** biarkan **apa adanya** (hijau `#2F6B4F` + krem `#F7F3E8`). Emas app `#D4A94F` dipakai sebagai aksen agar menyatu dengan frame.
- **Heading:** Playfair Display (serif, elegan)
- **Angka:** Inter Tabular (angka rupiah tidak bergeser saat beranimasi)
- **Aturan gerak:** hanya push-in / dolly / parallax pelan. Tidak ada zoom cepat, tidak ada transisi ramai.
- **Suara:** ASMR. Klik halus, swipe lembut, tick koin/angka naik pelan. Ambient pad tipis; tanpa musik ramai.

---

## Adegan 1 — Hook

| # | Detail |
|---|---|
| 1. Nama | Hook — saldo besar, belum terbagi |
| 2. Durasi | 0,0 – 3,5 s |
| 3. Layar | `HomeScreen` (Home), state Bagi Saldo **OFF** |
| 4. Aksi | Fade in kartu "Total Saldo" → angka **Rp1.000.000** naik pelan. Tidak ada tap. |
| 5. Overlay | **Satu saldo, banyak kebutuhan** |
| 6. SFX | 0,8 s whoosh halus (app fade in) · 1,4–2,6 s tick koin ×3 saat angka naik · 3,0 s ambient pad turun |
| 7. Kamera | Push-in pelan 100% → 104%, tanpa goyang |
| 8. Screenshot | `scene1_home_total.png` |

---

## Adegan 2 — Masalah / Ide

| # | Detail |
|---|---|
| 1. Nama | Ide — nyalakan fitur & buat pos |
| 2. Durasi | 3,5 – 7,5 s |
| 3. Layar | `ProfileScreen` (header "Profil") → `ManagePocketsScreen` (header "Kelola Kantong") |
| 4. Aksi | 3,6 s tap **switch "Bagi Saldo"** → 5,0 s tap **"Tambah Kantong"** → 6,2 s ketik nama di modal **"Kantong Baru"** → 7,2 s tap **"Simpan"** |
| 5. Overlay | **Pisahkan sejak awal** |
| 6. SFX | 3,6 s klik switch · 5,0 s klik tombol · 6,2–7,0 s 4 ketukan keyboard halus · 7,2 s klik lembut |
| 7. Kamera | Cut-dissolve halus; drift vertikal pelan mengikuti modal |
| 8. Screenshot | `scene2_profile_toggle_off.png` → `scene2_profile_toggle_on.png` → `scene2_pockets_empty.png` → `scene2_modal_kantong_baru.png` → `scene2_pockets_list3.png` |

> Montase membuat 3 pos = 3× aksi "Tambah Kantong" yang dipotong halus. Nama pos (*Tabungan Pokok*, *Tabungan Investasi*, *Tabungan Jajan & Foya-foya*) adalah **input user**, bukan bawaan app.

---

## Adegan 3 — Demo Pembagian Saldo

| # | Detail |
|---|---|
| 1. Nama | Demo — bagi saldo ke kantong |
| 2. Durasi | 7,5 – 14,0 s |
| 3. Layar | `AllocateScreen` (header "Bagi Saldo") |
| 4. Aksi | 7,7 s masuk layar (judul **"Bagi Saldo ke Kantong"** + **"Saldo Total Kamu Rp1.000.000"**) → 8,4 s ketik jatah pos 1 → 10,0 s pos 2 → 11,6 s pos 3 → 12,8 s tap **"Simpan Alokasi"** |
| 5. Overlay | **Tentukan jatah tiap pos** |
| 6. SFX | 8,4–11,6 s ketukan angka (tick koin makin tinggi tiap pos) · 12,8 s klik dalam (low thud) · 13,4 s shimmer koin |
| 7. Kamera | Dolly pelan ke atas mengikuti daftar input; label "Sisa belum dibagi" tetap terlihat |
| 8. Screenshot | `scene3_allocate_initial.png` → `scene3_allocate_typed.png` → `scene3_allocate_saved.png` |

---

## Adegan 4 — Hasil / Visual Pos

| # | Detail |
|---|---|
| 1. Nama | Hasil — pos terlihat jelas |
| 2. Durasi | 14,0 – 19,5 s |
| 3. Layar | `HomeScreen` (section "Kantong") → `ReportScreen` ("Pengeluaran per Kantong") |
| 4. Aksi | 14,2 s swipe balik ke Home → kartu tiap kantong muncul berurutan (nama, **"Jatah: Rp…"**, **"Terpakai: Rp…"**, bar terisi) → 17,0 s tap **"Lihat Laporan Keuangan"** |
| 5. Overlay | **Semua pos, satu pandangan** |
| 6. SFX | 14,2 s swipe lembut · 15,0–16,5 s 3 tick bar terisi · 17,0 s klik · 18,2 s whoosh tipis saat bar laporan tumbuh |
| 7. Kamera | Pan vertikal pelan; tiap kartu muncul staggered ±300 ms |
| 8. Screenshot | `scene4_home_kantong_cards.png` → `scene4_report_per_kantong.png` |

---

## Adegan 5 — Penutup

| # | Detail |
|---|---|
| 1. Nama | Penutup — nama app |
| 2. Durasi | 19,5 – 23,0 s |
| 3. Layar | Frame brand (dari `app.json`: background `#2F6B4F`, logo SpendScan) |
| 4. Aksi | Logo masuk. Tidak ada interaksi. |
| 5. Overlay | **SpendScan — Catat. Bagi. Tenang.** |
| 6. SFX | 19,6 s soft impact · 20,4 s notch champagne lembut · 22,5 s fade ambient |
| 7. Kamera | Slow settle, logo center, ruang kosong lega |
| 8. Screenshot | `scene5_brand_close.png` |

---

## Daftar Screenshot (urut)

| Urut | Nama file | Isi / state |
|---|---|---|
| 1 | `scene1_home_total.png` | Home, Bagi Saldo OFF, Total Saldo Rp1.000.000 |
| 2 | `scene2_profile_toggle_off.png` | Profil → Pengaturan, switch "Bagi Saldo" **OFF** (sebelum tap) |
| 3 | `scene2_profile_toggle_on.png` | Sama, switch **ON** (sesudah tap) |
| 4 | `scene2_pockets_empty.png` | Kelola Kantong, kondisi kosong |
| 5 | `scene2_modal_kantong_baru.png` | Modal "Kantong Baru" terisi nama + jatah |
| 6 | `scene2_pockets_list3.png` | Kelola Kantong, 3 kartu |
| 7 | `scene3_allocate_initial.png` | Bagi Saldo, 3 input masih 0 |
| 8 | `scene3_allocate_typed.png` | 3 input terisi jatah |
| 9 | `scene3_allocate_saved.png` | Sesudah "Simpan Alokasi" |
| 10 | `scene4_home_kantong_cards.png` | Home, section Kantong (3 kartu + bar) |
| 11 | `scene4_report_per_kantong.png` | Laporan → Pengeluaran per Kantong |
| 12 | `scene5_brand_close.png` | Frame brand penutup |

---

## Persiapan Sebelum Shooting

1. Pakai akun demo; catat **pemasukan Rp1.000.000** agar "Total Saldo" = Rp1.000.000.
2. Nyalakan Bagi Saldo, buat 3 kantong persis: **Tabungan Pokok**, **Tabungan Investasi**, **Tabungan Jajan & Foya-foya**.
3. Set jatah: **Rp600.000 / Rp250.000 / Rp150.000** (total Rp1.000.000 → "Sisa belum dibagi" Rp0).
4. Ambil screenshot **berpasangan** (sebelum tap / sesudah tap) untuk adegan 2 dan 3.
5. Matikan notifikasi & mode gelap HP agar frame bersih.

---

## Batasan yang Dipegang

- Maksimal 5 adegan, satu ide per adegan.
- Overlay ≤ 6 kata, Bahasa Indonesia, tanpa emoji, tanpa klaim berlebihan.
- Tidak ada fitur yang dikarang; yang belum ada ditandai di bagian "Catatan Akurasi".
