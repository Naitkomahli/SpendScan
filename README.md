# SpendScan 🧾

Aplikasi pencatat pengeluaran harian berbasis **React Native (Expo)** dengan fitur scan struk (OCR). Dibangun untuk memudahkan pencatatan keuangan pribadi dengan antarmuka yang bersih, modern, dan mudah digunakan.

> **Status:** Mobile App (Fase 1–7 selesai). Menunggu backend API (Fase 8) dan integrasi OCR (Fase 9).

---

## ✨ Fitur Utama

| Fitur | Status |
|-------|--------|
| 📊 Dashboard — ringkasan pengeluaran bulanan + transaksi terbaru | ✅ |
| ➕ Tambah transaksi manual (form dengan kategori, tanggal, catatan) | ✅ |
| 📋 Riwayat transaksi — search, filter kategori, grup tanggal | ✅ |
| 👁️ Detail transaksi — hero amount, info lengkap, foto struk | ✅ |
| ✏️ Edit transaksi | ✅ |
| 🗑️ Hapus transaksi (modal konfirmasi) | ✅ |
| 📱 4 Tab Navigasi (Home, History, Scan, Profile) | ✅ |
| 📸 Scan struk dengan OCR | ⏳ (Fase 9) |
| 🔐 Autentikasi & backend API | ⏳ (Fase 8) |

---

## 🛠️ Tech Stack

### Mobile App
- **React Native** — framework mobile
- **Expo SDK 54** — development toolchain
- **JavaScript / JSX**
- **React Navigation** — `bottom-tabs` + `native-stack`
- **Expo Image Picker** — untuk upload foto struk
- **@expo/vector-icons (Ionicons)**
- **date-fns** — manipulasi tanggal

### Backend (oleh Orang B — menyusul)
- Node.js + Express
- Supabase / PostgreSQL
- Supabase Storage
- Tesseract.js (OCR)

---

## 📁 Struktur Folder

```
SpendScan/
├── App.js                     # Entry point aplikasi
├── AGENTS.md                  # Konteks proyek (untuk AI agents)
├── docs/
│   ├── PRD.md                 # Product Requirements Document
│   └── design/                # Mockup desain UI/UX (HTML+PNG)
└── src/
    ├── screens/
    │   ├── HomeScreen.jsx           # Dashboard utama
    │   ├── AddTransactionScreen.jsx # Form tambah transaksi
    │   ├── TransactionListScreen.jsx# Riwayat transaksi
    │   ├── TransactionDetailScreen.jsx # Detail transaksi
    │   ├── EditTransactionScreen.jsx  # Edit transaksi
    │   ├── ScanScreen.jsx           # Scan struk (placeholder)
    │   └── ProfileScreen.jsx        # Profil (placeholder)
    ├── components/
    │   ├── TransactionCard.jsx       # Kartu transaksi
    │   ├── CategoryBadge.jsx         # Badge kategori
    │   └── EmptyState.jsx            # State kosong
    ├── navigation/
    │   └── AppNavigator.jsx          # Navigasi: 4 tab + stack
    ├── services/
    │   └── transactionService.js     # Service layer (mock → API)
    ├── data/
    │   └── mockTransactions.js       # Data dummy
    ├── constants/
    │   ├── colors.js                 # Design tokens
    │   └── categories.js             # 8 kategori default
    └── utils/
        └── formatCurrency.js         # Format Rupiah
```

---

## 🚀 Cara Menjalankan

### Prasyarat
- Node.js (v18+)
- Expo Go di HP Android (unduh dari Play Store)
- HP dan laptop dalam satu jaringan WiFi

### Instalasi & Run

```bash
# 1. Clone project
git clone <url-repo>
cd SpendScan

# 2. Install dependencies
npm install

# 3. Start development server
npx expo start

# 4. Scan QR code dengan Expo Go di HP
```

Jika ada error peer dependencies:

```bash
npm install --legacy-peer-deps
npx expo start -c   # clear cache
```

---

## 🎨 Desain

Proyek ini memiliki desain UI/UX lengkap yang tersimpan di `docs/design/`. Setiap screen memiliki file `code.html` (prototype interaktif) dan `screen.png` (visual preview):

- **Home Dashboard** — greeting, summary card, action grid, transaksi terbaru
- **Tambah Transaksi** — large amount display, chip kategori, OCR option
- **Riwayat Transaksi** — search bar, filter chips, date grouping
- **Detail Transaksi** — hero card, bento grid, foto struk, delete modal
- **Profil & Anggaran** — halaman placeholder

### Warna Utama

```
Primary:   #4F46E5 (Indigo)
Background: #F9FAFB (Light Gray)
Surface:   #FFFFFF (White)
Danger:    #EF4444 (Red)
Success:   #10B981 (Green)
```

Tipografi: **Manrope** (headline & angka) + **Inter** (body text)

---

## 🔌 Service Layer Contract

Semua akses data melalui `src/services/transactionService.js`. Screen tidak pernah langsung memanggil mock data atau fetch API.

```js
// Fase Mock (sekarang) — pake data lokal
transactionService.getAll()
transactionService.getById(id)
transactionService.create(data)
transactionService.update(id, data)
transactionService.delete(id)

// Fase API (nanti) — ganti implementasi di service layer
// Screen TIDAK perlu diubah
transactionService.getAll()       // → GET /transactions
transactionService.create(data)   // → POST /transactions
```

### Data Shape Transaksi

```js
{
  id: '1',
  userId: 'user-001',
  title: 'Makan Siang',
  amount: 25000,
  category: 'Food & Drink',
  transactionDate: '2026-06-15',
  note: 'Nasi ayam',
  receiptImageUrl: null,
  rawOcrText: null,
  source: 'manual',      // 'manual' | 'ocr'
  createdAt: '2026-06-15T10:00:00Z',
  updatedAt: '2026-06-15T10:00:00Z'
}
```

---

## 📋 Rencana Pengembangan

| Fase | Deskripsi | Status |
|------|-----------|--------|
| **1** | Setup Expo & dependencies | ✅ |
| **2** | Constants, utils, mock data, service layer | ✅ |
| **3** | Navigasi (4 tab + stack) | ✅ |
| **4** | HomeScreen — dashboard | ✅ |
| **5** | AddTransaction — form | ✅ |
| **6** | List & Detail screen | ✅ |
| **7** | Edit & Delete | ✅ |
| **8** | Backend API integration | ⏳ |
| **9** | Receipt scan & OCR | ⏳ |
| **10** | Polish & portfolio | ⏳ |

---

## 👥 Tim

- **Orang A (Mobile App Developer)** — React Native, Expo, UI/UX
- **Orang B (Backend Developer)** — Node.js, Express, Supabase, OCR

---

## 📝 Catatan

- Proyek ini menggunakan **mock data** selama backend belum tersedia
- Untuk mengganti ke API nyata, cukup update file `src/services/transactionService.js`
- Expo SDK **54** — pastikan HP dan laptop di jaringan yang sama saat development
- Hindari menyimpan proyek di folder Windows yang dilindungi (Documents, Desktop, dll)
