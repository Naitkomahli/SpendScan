# SpendScan — Technical Overview

> Dokumen ini menjelaskan aplikasi SpendScan secara teknis, dari ujung ke ujung, dalam bahasa sederhana.

---

## 1. Aplikasi Ini Apa?

SpendScan adalah **aplikasi pencatat keuangan** yang jalan di HP Android. Bisa dipake buat:

- Ncatat pemasukan dan pengeluaran harian
- **Foto struk belanja**, lalu AI baca otomatis barang-barang yang dibeli beserta harganya
- Lihat ringkasan keuangan bulanan dalam bentuk grafik dan laporan

---

## 2. Arsitektur Aplikasi

```
Handphone (React Native App)
        │
        ▼
  ┌─────────────┐     HTTPS     ┌──────────────────┐
  │  SpendScan  │ ────────────► │  Backend API     │
  │  Mobile App │               │  (Vercel server) │
  └─────────────┘               └────────┬─────────┘
                                         │
                           ┌─────────────┼─────────────┐
                           ▼             ▼             ▼
                    ┌──────────┐  ┌──────────┐  ┌──────────┐
                    │ Supabase │  │ Groq AI │  │  Vercel  │
                    │ Database │  │ (Vision) │  │  Hosting │
                    └──────────┘  └──────────┘  └──────────┘
```

**Alur singkat:**
1. HP kamu (React Native) ngirim request ke Backend API (di Vercel)
2. Backend ngolah request, ngomong ke database (Supabase) atau AI (Groq)
3. Hasil dikembalikan ke HP kamu dalam bentuk JSON

---

## 3. Tech Stack (Teknologi yang Dipakai)

### Mobile App (Frontend) — yang jalan di HP

| Teknologi | Fungsinya |
|-----------|-----------|
| **React Native** | Framework buat bikin aplikasi HP pake JavaScript |
| **Expo SDK 54** | Tools biar gampang develop React Native (tinggal scan QR) |
| **React Navigation** | Navigasi antar halaman (pindah dari Home ke Detail dll) |
| **@expo/vector-icons** | Kumpulan icon (Ionicons) buat tombol dan dekorasi |
| **react-native-chart-kit** | Bikin grafik garis di halaman Report |
| **expo-image-picker** | Ambil foto dari kamera atau galeri HP |
| **expo-secure-store** | Nyimpen token login secara aman di HP |
| **date-fns** | Library buat ngolah tanggal |
| **react-native-screens** | Optimasi navigasi biar cepat |
| **react-native-safe-area-context** | Ngatur jarak aman di HP bergo |le |

### Backend (Server) — yang jalan di cloud

| Teknologi | Fungsinya |
|-----------|-----------|
| **Node.js** | Runtime JavaScript di server |
| **Express (v5)** | Framework buat bikin API endpoints |
| **Supabase** | Database (PostgreSQL) + penyimpanan file |
| **Groq Vision (AI)** | Baca struk dari gambar, balikin JSON (item, harga, tanggal) |
| **JWT (jsonwebtoken)** | Token login — bukti kalo user udah login |
| **bcryptjs** | Hash password (biar password ga disimpan mentah) |

### Infrastruktur

| Layanan | Fungsinya |
|---------|-----------|
| **Vercel (free)** | Hosting backend — API bisa diakses dari mana aja |
| **Supabase (free)** | Database + storage gambar struk |
| **Groq (free)** | AI vision — baca struk pake model Llama 4 Scout 17B |
| **GitHub** | Nyimpen source code |
| **EAS Build (free)** | Build APK dari source code |

---

## 4. Bahasa Pemrograman

| Bahasa | Dipake Dimana | Seberapa Banyak |
|--------|---------------|:------:|
| **JavaScript** | Semua kode — frontend & backend | 95% |
| **JSX** | Tampilan React Native (HTML-like syntax) | Di dalam JS |
| **SQL** | Query ke database | 1 file doang |
| **JSON** | Format data yang dikirim antar aplikasi | Di semua API |

**Kesimpulan:** Kamu cukup paham JavaScript, udah bisa ngerti 95% kode aplikasi ini.

---

## 5. Cara Kerja Aplikasi (Alur Lengkap)

### Saat User Buka Aplikasi

```
Buka App
  │
  ▼
Splash Screen (layar ungu, 0.8 detik)
  │
  ▼
Cek token login di SecureStore
  │
  ├── Ada token → Langsung ke Dashboard (HomeScreen)
  │
  └── Tidak ada → Muncul layar Login
```

### Saat User Login

```
User isi email & password → tap "Login"
  │
  ▼
Frontend kirim POST /api/auth/login
  │
  ▼
Backend cek email + password di database Supabase
  │
  ├── Cocok → Backend buat JWT token → balikin ke HP
  │            HP simpan token di SecureStore → redirect ke Dashboard
  │
  └── Salah → Balikin error "Email/password salah"
```

### Saat User Nambah Transaksi Manual

```
User isi form (judul, jumlah, kategori, tanggal)
  │
  ▼
Tap "Simpan"
  │
  ▼
Frontend kirim POST /api/transactions + data + token JWT
  │
  ▼
Backend verifikasi token, simpan data ke database
  │
  ▼
Database simpan → balikin data transaksi yang baru
  │
  ▼
HP tampilkan notifikasi "Berhasil"
```

### Saat User Scan Struk

```
User tap "Scan" → pilih kamera/galeri
  │
  ▼
Ambil foto → kirim gambar (base64) ke POST /api/receipts/scan
  │
  ▼
Backend simpan gambar ke Supabase Storage
  │
  ▼
Backend kirim gambar ke Groq Vision API
  │
  ▼
Groq Vision baca struk, balikin JSON:
  { merchant: "INDOMARET", date: "2026-06-15",
    items: [{ name: "Beras 5KG", amount: 75000 }, ...] }
  │
  ▼
Backend balikin hasil ke HP
  │
  ▼
HP tampilkan daftar item → user bisa edit/hapus/tambah
  │
  ▼
User tap "Simpan Semua" → tiap item jadi transaksi terpisah
```

### Saat User Lihat Dashboard

```
Buka halaman Home
  │
  ▼
Frontend minta GET /api/transactions
  │
  ▼
Backend ambil SEMUA transaksi user dari database
  │
  ▼
Frontend hitung:
  - Total pemasukan bulan ini
  - Total pengeluaran bulan ini
  - Saldo = pemasukan - pengeluaran
  - Breakdown per kategori
  │
  ▼
Tampilkan semua di layar
```

---

## 6. Struktur Folder

```
SpendScan/
│
├── App.js                  # File utama aplikasi (entry point)
├── app.json                # Konfigurasi Expo
├── eas.json                # Konfigurasi build APK
│
├── src/                    # ◄── Kode mobile app (yang bikin tampilan)
│   ├── constants/
│   │   ├── colors.js       # Warna tema aplikasi
│   │   └── categories.js   # Daftar kategori (Food, Transport, dll)
│   ├── components/
│   │   ├── TransactionCard.jsx    # Kartu transaksi
│   │   ├── CategoryBadge.jsx      # Label kategori
│   │   ├── EmptyState.jsx         # Tampilan "belum ada data"
│   │   └── Skeleton.jsx           # Animasi loading
│   ├── contexts/
│   │   └── AuthContext.js         # State login (siapa yang login)
│   ├── navigation/
│   │   └── AppNavigator.jsx       # Navigasi tab + stack
│   ├── screens/                   # ◄── Halaman-halaman aplikasi
│   │   ├── HomeScreen.jsx         # Dashboard (ringkasan)
│   │   ├── AddTransactionScreen.jsx   # Form tambah transaksi
│   │   ├── EditTransactionScreen.jsx  # Form edit transaksi
│   │   ├── TransactionListScreen.jsx  # Daftar semua transaksi
│   │   ├── TransactionDetailScreen.jsx # Detail satu transaksi
│   │   ├── LoginScreen.jsx        # Halaman login
│   │   ├── RegisterScreen.jsx     # Halaman daftar akun
│   │   ├── ProfileScreen.jsx      # Profil user
│   │   ├── ReportScreen.jsx       # Grafik laporan
│   │   └── ScanScreen.jsx         # Scan struk + review item
│   ├── services/
│   │   ├── api.js                 # Cara ngirim request ke backend
│   │   ├── authService.js         # Fungsi login/register
│   │   └── transactionService.js  # Fungsi CRUD transaksi
│   ├── data/
│   │   └── mockTransactions.js    # Data contoh (dulu)
│   └── utils/
│       └── formatCurrency.js      # Format angka jadi Rupiah
│
├── backend/                # ◄── Kode server (API)
│   ├── .env                # Environment variables (rahasia)
│   ├── vercel.json         # Konfigurasi deploy Vercel
│   └── src/
│       ├── app.js          # Setup Express server
│       ├── server.js       # Jalankan server (local development)
│       ├── config/
│       │   └── supabase.js     # Koneksi ke Supabase
│       ├── controllers/        # ◄── Logika tiap fitur
│       │   ├── authController.js       # Login/register logic
│       │   ├── transactionController.js # CRUD transaksi
│       │   └── receiptController.js    # Scan struk logic
│       ├── services/
│       │   └── llmParser.js    # Kirim gambar ke Groq AI
│       ├── middleware/
│       │   ├── auth.js          # Verifikasi JWT token
│       │   └── errorHandler.js  # Tangani error
│       ├── routes/              # ◄── Daftar endpoint API
│       │   ├── auth.js
│       │   ├── transactions.js
│       │   └── receipts.js
│       └── db/
│           └── schema.sql       # Struktur database
│
└── docs/
    ├── PRD.md              # Product Requirements Document
    ├── TECHNICAL.md        # ← Kamu di sini
    └── AGENTS.md           # Konteks untuk AI coding assistant
```

---

## 7. API Endpoints (Cara Frontend Ngomong ke Backend)

| Method | Endpoint | Kirim | Dapet |
|--------|----------|-------|-------|
| POST | `/api/auth/register` | name, email, password | Token + data user |
| POST | `/api/auth/login` | email, password | Token + data user |
| GET | `/api/transactions` | Token aja | Semua transaksi user |
| GET | `/api/transactions/:id` | Token | Satu transaksi |
| POST | `/api/transactions` | token + data transaksi | Transaksi baru |
| PUT | `/api/transactions/:id` | Token + data update | Transaksi terupdate |
| DELETE | `/api/transactions/:id` | Token | Pesan berhasil |
| POST | `/api/receipts/scan` | Token + gambar base64 | Items + merchant + date |

Semua response formatnya:

```json
{
  "success": true,
  "message": "Pesan",
  "data": { }
}
```

---

## 8. Alur Data Satu Transaksi — Contoh Real

```
User tap "Simpan" di form "Makan Siang Rp25.000"
  │
  ▼
AddTransactionScreen.jsx → panggil create({ title, amount, category, ... })
  │
  ▼
transactionService.js → panggil apiRequest('/transactions', { method: 'POST', body: data })
  │
  ▼
api.js → fetch('https://backend.../api/transactions', { method: 'POST', headers: { Authorization: 'Bearer <token>' }, body: JSON.stringify(data) })
  │
  ▼
Backend terima → auth.js middleware cek token valid atau tidak
  │
  ▼
transactionController.js → ambil data dari request, validasi, simpan ke Supabase
  │
  ▼
Supabase (PostgreSQL) → INSERT INTO transactions (...) VALUES (...)
  │
  ▼
Backend balikin response JSON { success: true, data: { id, title, ... } }
  │
  ▼
api.js → parse JSON, cek success = true, return data
  │
  ▼
AddTransactionScreen → dapet data → Alert "Berhasil" → navigasi ke Home
```

---

## 9. Data Flow Scan Struk

```
User ambil foto struk
  │
  ▼
ImagePicker → dapet file gambar
  │
  ▼
ScanScreen.jsx → convert ke base64 → panggil scanReceipt(image)
  │
  ▼
transactionService.js → panggil apiRequest('/receipts/scan', { method: 'POST', body: { image: base64, imageType: 'image/jpeg' } })
  │
  ▼
Backend terima → simpan gambar ke Supabase Storage
  │
  ▼
Backend panggil llmParser.js → kirim base64 ke Groq Vision API
  │
  ▼
Groq Vision (Llama 4 Scout 17B) → baca struk → balikin JSON:
  { merchant: "INDOMARET", date: "2026-06-15",
    items: [{ name: "Beras 5KG", amount: 75000 }, { name: "Kecap", amount: 8500 }] }
  │
  ▼
Backend balikin response ke HP
  │
  ▼
HP tampilkan daftar item → user bisa edit/hapus/tambah
  │
  ▼
User tap "Simpan Semua" → tiap item jadi transaksi terpisah (ke endpoint POST /api/transactions)
```

---

## 10. Daftar Istilah

| Istilah | Arti Sederhana |
|---------|----------------|
| **API** | Jembatan antara HP dan server. HP minta data, server ngasih data |
| **Endpoint** | Alamat spesifik di API. Contoh: `/api/login` |
| **JWT Token** | Kunci login. Dibikin server pas login, disimpan di HP, dikirim tiap request |
| **Middleware** | Fungsi yang jalan sebelum handler. Contoh: cek token sebelum akses data |
| **JSON** | Format data: `{ "nama": "value" }`. Kayak objek di JavaScript |
| **CRUD** | Create, Read, Update, Delete — 4 operasi dasar data |
| **PostgreSQL** | Database SQL yang dipake Supabase |
| **Row Level Security** | Fitur Supabase: tiap user cuma bisa liat data mereka sendiri |
| **Rate Limiting** | Batasi jumlah request dari satu IP biar ga kena spam |
| **Hash** | Proses nyandiin password. Bedanya sama encrypt: ga bisa dibalikin |
| **base64** | Cara ngerubah file gambar jadi teks biar bisa dikirim lewat API |
| **Express** | Framework buat bikin API pake JavaScript di server |
| **React Navigation** | Library buat pindah-pindah halaman di React Native |
| **Expo** | Tools biar develop React Native gampang (tinggal scan QR) |
| **Vercel** | Layanan hosting gratis buat backend |
| **Supabase** | Database gratis + storage file. Alternatif open-source Firebase |
| **Groq** | Penyedia AI gratis. Cepet banget dibanding OpenAI |
| **Llama 4 Scout 17B** | Model AI yang bisa liat gambar dan baca teks dari struk |
| **Environment Variables** | File `.env` — nyimpen rahasia kaya API key, password database |
| **SDK 54** | Versi Expo yang dipake. SDK = Software Development Kit |
| **EAS Build** | Layanan Expo buat build APK di cloud (biar ga build di laptop) |

---

## 11. Cara Deploy (Biar Aplikasi Bisa Diakses dari Mana Aja)

### Backend ke Vercel

```bash
cd backend
vercel --prod --yes --force
```

### Build APK

```bash
eas build --platform android --profile preview
```

APK hasil build bisa didownload dari link yang dikasih EAS, lalu diupload ke GitHub Releases biar temen-temen bisa download.

---

## 12. Yang Perlu Diingat

1. **Semua pake JavaScript** — cukup paham JS, ngerti semua kode
2. **Frontend cuma urusan tampilan** — dia ga nyentuh database langsung
3. **Backend jembatan** — nerima request, ngolah, balikin data
4. **Database nyimpen data** — Supabase (PostgreSQL) di cloud
5. **AI cuma dipake buat scan struk** — sisanya pake logika biasa
6. **Aplikasi aman** — HTTPS, JWT, password di-hash, RLS aktif
7. **Gratis 100%** — Vercel, Supabase, Groq, Expo, EAS — semua free tier

---

> Dibuat: Juni 2026  
> Untuk dokumentasi pribadi — bisa diedit kapan aja kalo ada perubahan.
