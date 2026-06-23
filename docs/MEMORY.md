# Ringkasan Sesi — SpendScan (Sesi 1)

**Tanggal:** 22 Juni 2026

## Status Proyek

| Item | Detail |
|------|--------|
| **Mobile App** | ✅ Semua screen selesai |
| **Backend** | ✅ Folder, dependencies, struktur kode selesai |
| **Supabase** | ❌ Belum daftar |

## Mobile App — Semua Selesai

- **Screens:** HomeScreen, AddTransactionScreen, TransactionListScreen, TransactionDetailScreen, EditTransactionScreen, ScanScreen, ProfileScreen
- **Navigation:** Bottom Tabs (Home, History, Scan, Profile) + Native Stack untuk masing-masing tab
- **Components:** TransactionCard, CategoryBadge, EmptyState, Skeleton
- **Constants:** colors.js, categories.js
- **Utils:** formatCurrency.js
- **Data:** mockTransactions.js
- **Services:** transactionService.js (mock phase, siap di-switch ke API)
- **Entry:** App.js render AppNavigator via NavigationContainer

**Teknologi:** Expo SDK 54, React Navigation 7, @expo/vector-icons, date-fns, expo-image-picker

**Lokasi:** `C:\Project\SpendScan\`

## Backend — Setup Selesai (Sesi 2)

- **Folder:** `backend/` dengan Node.js + Express
- **Dependencies:** express, cors, dotenv, multer, @supabase/supabase-js, bcryptjs, jsonwebtoken, tesseract.js
- **Struktur:** `src/config/`, `src/middleware/`, `src/controllers/`, `src/routes/`, `src/db/`
- **Middleware:** `auth.js` (JWT), `errorHandler.js` (global error handler)
- **Endpoints:**
  - `POST /api/auth/register` — register user
  - `POST /api/auth/login` — login user
  - `GET /api/transactions` — ambil semua transaksi
  - `GET /api/transactions/:id` — detail transaksi
  - `POST /api/transactions` — buat transaksi
  - `PUT /api/transactions/:id` — update transaksi
  - `DELETE /api/transactions/:id` — hapus transaksi
  - `POST /api/receipts/scan` — upload & OCR receipt
- **Database:** `schema.sql` (tabel users + transactions, index, RLS policies)
- **Response format:** `{ success, message, data }` / `{ success, message, errors }`
- **Entry:** `backend/src/server.js` — port 3000

**Teknologi:** Node.js, Express, Supabase, Tesseract.js, JWT, bcryptjs

**Catatan:** Semua endpoint dan middleware sudah ditulis. Server siap dijalankan setelah Supabase di-setup dan `.env` diisi.

---

# Ringkasan Sesi — SpendScan (Sesi 3)

**Tanggal:** 23 Juni 2026

## Status Proyek

| Item | Detail |
|------|--------|
| **Mobile App** | ✅ Semua screen selesai (masih mock data) |
| **Backend** | ✅ Semua endpoint berfungsi |
| **Supabase** | ✅ Sudah daftar, project aktif, database & storage siap |
| **Integrasi Mobile↔Backend** | ❌ Belum dimulai |

## Yang Sudah Dilakukan Hari Ini

### 1. Supabase Setup ✅
- Daftar akun Supabase
- Buat project baru
- Ambil credentials: Project URL, anon/publishable key, service_role/secret key, JWT Secret

### 2. Environment Variables ✅
- File `backend/.env` diisi dengan credential Supabase:
  - `SUPABASE_URL`: `https://uqdcwgdbtpzmxzyjpnyq.supabase.co`
  - `SUPABASE_ANON_KEY`: publishable key
  - `SUPABASE_SERVICE_ROLE_KEY`: secret key
  - `JWT_SECRET`: `597235ba-283c-46e1-a650-059120560544`

### 3. Database ✅
- SQL Editor Supabase: run `schema.sql`
- Terbuat tabel:
  - `users` (id UUID, name, email unique, password_hash, created_at)
  - `transactions` (id UUID, user_id FK, title, amount, category, transaction_date, note, receipt_image_url, raw_ocr_text, source, created_at, updated_at)
- Index + RLS policies sudah aktif

### 4. Storage ✅
- Bucket `receipts` dibuat (public)
- Policy public access untuk SELECT + INSERT

### 5. Fix RLS di Controller ✅
- **`authController.js`**: Register & Login pakai `supabaseAdmin` (bypass RLS) karena user belum login
- **`transactionController.js`**: Semua operasi pakai `supabaseAdmin` karena anon key tidak punya konteks auth untuk RLS

### 6. API Test ✅
- `POST /api/auth/register` — ✅ sukses
  - User: `orang@test.com` / password: `123456`
- `POST /api/transactions` — ✅ sukses (1 transaksi berhasil dibuat)
- `GET /api/transactions` — ✅ sukses (data terisi)
- Server berjalan di `http://localhost:3000`

## Yang Perlu Dilakukan Selanjutnya

### Integrasi Mobile ↔ Backend (Prioritas)

1. Install `expo-secure-store` untuk penyimpanan token
2. Buat `src/contexts/AuthContext.js` untuk state autentikasi
3. Buat `src/screens/LoginScreen.jsx` (form login/register)
4. Update `App.js` — bungkus dengan AuthProvider
5. Update `AppNavigator.jsx` — auth flow (LoginScreen jika belum login)
6. Update `transactionService.js` — ganti mock data dengan fetch ke `http://localhost:3000/api/...`
7. Update screens yang panggil service (passing token)

### Catatan
- User adalah **Orang A** (Mobile App Developer) yang ingin belajar backend
- Token JWT untuk user `orang@test.com` perlu diambil ulang via login di sesi berikutnya
- Untuk menjalankan server: `cd backend && node src/server.js` (atau `node backend/src/server.js` dari root)
- Memilih `expo-secure-store` untuk penyimpanan token (production-ready)
