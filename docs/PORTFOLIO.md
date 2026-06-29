# SpendScan — Portfolio Document

> Dokumen ini merangkum proyek SpendScan untuk keperluan portofolio.  
> Cocok digunakan sebagai konteks AI agent untuk membantu showcase ke LinkedIn, resume, website pribadi, atau wawancara.

---

## 1. Ringkasan Eksekutif

**SpendScan** adalah mobile expense tracker berbasis React Native + Expo yang memungkinkan pengguna mencatat pemasukan/pengeluaran harian secara manual atau **langsung scan struk belanja** — AI (Groq Vision / Llama 4 Scout 17B) otomatis membaca item-item beserta harganya. Backend Node.js/Express di-deploy ke Vercel, database di Supabase PostgreSQL.

- **Tujuan:** Membantu orang mencatat pengeluaran kecil sehari-hari yang sering terlewat
- **Role Saya:** Full ownership mobile app (Orang A) — arsitektur, UI/UX, navigasi, integrasi API
- **Kolaborator:** Orang B — backend API, database, AI integration, deployment

---

## 2. Masalah & Solusi

| Masalah | Solusi SpendScan |
|---------|------------------|
| Pengeluaran kecil harian (makan, transport, jajan) sering lupa dicatat | Form input manual cepat dengan toggle pemasukan/pengeluaran |
| Struk belanja mudah hilang/tercecer | **Scan struk pakai kamera** → AI baca otomatis semua item + harga |
| Nggak tau uang habis untuk apa aja | Dashboard ringkasan bulanan + grafik laporan + breakdown per kategori |
| Males catat satu-satu tiap item di struk | Batch save: 1 struk → banyak transaksi sekaligus |

---

## 3. Tech Stack

### Mobile App (Frontend) — Saya yang bangun

| Teknologi | Fungsi |
|-----------|--------|
| **React Native** + **Expo SDK 54** | Framework mobile cross-platform |
| **React Navigation** (bottom tabs + native stack) | Navigasi antar halaman |
| **expo-image-picker** | Kamera & galeri untuk scan struk |
| **expo-secure-store** | Penyimpanan token JWT secara aman |
| **react-native-chart-kit** | Grafik garis laporan keuangan |
| **date-fns** | Manipulasi tanggal |
| **@expo/vector-icons** | Ikon antarmuka |

### Backend (Kolaborator)

| Teknologi | Fungsi |
|-----------|--------|
| **Node.js + Express** | REST API server |
| **Supabase (PostgreSQL)** | Database & file storage |
| **Groq Vision (Llama 4 Scout 17B)** | AI baca struk dari gambar → JSON terstruktur |
| **JWT + bcryptjs** | Autentikasi & keamanan |
| **Vercel (free)** | Hosting backend |

---

## 4. Arsitektur

```
Handphone (React Native)
       │
       ▼ (HTTPS + JWT)
┌──────────────────┐
│   Backend API    │  Vercel
│   (Express.js)   │
└────────┬─────────┘
         │
    ┌────┼────┐
    ▼    ▼    ▼
 Supabase Groq  Vercel
 Database Vision Hosting
```

**Alur scan struk:**
1. User foto struk → gambar dikirim sebagai base64 ke backend
2. Backend simpan gambar ke Supabase Storage
3. Backend kirim gambar ke Groq Vision API
4. Groq balikin JSON: `{ merchant, date, items: [{name, amount}] }`
5. Tiap item bisa diedit/dihapus/ditambah user sebelum batch save

---

## 5. Fitur Utama

### ✅ Dashboard
- Ringkasan pemasukan, pengeluaran, dan saldo bulan ini
- Breakdown pengeluaran per kategori dengan progress bar
- 5 transaksi terbaru

### ✅ Manajemen Transaksi
- Tambah pemasukan (toggle hijau) / pengeluaran (toggle primary)
- Edit, hapus dengan konfirmasi
- Validasi form: required fields, amount > 0

### ✅ Riwayat & Filter
- Daftar transaksi per bulan dengan SectionList
- Filter kategori (chip), cari judul/kategori/catatan
- Pilih bulan lewat kalender modal

### ✅ Laporan Keuangan
- Line chart pemasukan (hijau) vs pengeluaran (merah)
- Ringkasan total + saldo bersih
- Pie chart breakdown per kategori

### ✅ Scan Struk dengan AI (Fitur Unggulan)
- Ambil foto via kamera atau galeri
- **Groq Vision (Llama 4 Scout 17B)** baca struk langsung dari gambar
- Output terstruktur: merchant, tanggal, daftar item + harga
- Review screen: edit nama item, edit harga, hapus item, tambah item manual
- Simpan semua item sekaligus → masing-masing jadi transaksi terpisah

### ✅ Autentikasi
- Register, login, logout
- JWT token disimpan di SecureStore
- Session otomatis ter-restore

### ✅ Profil
- Informasi akun (nama, email, UID)
- Tombol logout dengan konfirmasi

---

## 6. Navigasi Aplikasi

```
NavigationContainer
└── AuthProvider
    └── AppNavigator
        ├── LoginScreen (login/register toggle)
        └── BottomTabs [Authenticated]
            ├── HomeTab → Dashboard, Add, Detail, Edit, Profile, Report
            ├── ScanTab → ScanScreen + Review Item
            └── HistoryTab → TransactionList, Detail, Edit
```

---

## 7. Yang Membuat Proyek Ini Menonjol

1. **AI Integration End-to-End:** Pengguna foto struk → AI parsing → siap simpan. Bukan sekadar OCR mentahan, tapi AI yang paham konteks struk belanja.
2. **Arsitektur Clean:** Pemisahan tegas UI (screens) ↔ logic (services) ↔ data (mock/API). Service layer bisa switch dari mock ke API tanpa ubah screens.
3. **Full-stack Ownership:** Saya (mobile) + kolaborator (backend) — bukti kemampuan kolaborasi dan pemahaman sistem secara holistic.
4. **Portfolio-grade:** Gratis 100% (Vercel, Supabase, Groq, Expo, EAS — semua free tier), bisa diakses/didemo siapa aja.
5. **UX Flow yang Matang:** Loading skeleton, empty state, error with retry, semua di-handle.

---

## 8. Key Challenges & Solutions

| Challenge | Solution |
|-----------|----------|
| OCR mentah dari Tesseract.js hasilnya berantakan | Ganti ke **Groq Vision** — langsung gambar → JSON terstruktur tanpa perlu OCR preprocessing |
| Backend di Vercel ada request timeout 10s | Pilih Groq Vision yang response time ~1-2s, bukan OpenAI yang lebih lambat |
| Dependency conflict Expo SDK 54 | Pin versi eksplisit + `--legacy-peer-deps` |
| Windows protected folder access | Simpan proyek di folder aman, dokumentasi di AGENTS.md |

---

## 9. Screenshots

| Screen | Preview |
|--------|---------|
| Login/Register | `docs/screenshots/login-register.jpeg` |
| Dashboard | `docs/screenshots/dashboard.jpg` |
| Scan Struk | `docs/screenshots/scan-awal1.jpg` |
| Review Item Scan | `docs/screenshots/scan-review1.jpg` |
| Laporan | `docs/screenshots/report.jpg` |
| Riwayat | `docs/screenshots/history.jpg` |

---

## 10. Links

| Link | URL |
|------|-----|
| **GitHub Repository** | *(isi URL repo)* |
| **Backend API** | `https://backend-delta-sand-64.vercel.app` |
| **APK Download** | *(isi link EAS / GitHub Releases)* |
| **Demo Video** | *(isi link YouTube/drive)* |

---

## 11. Yang Bisa Saya Ceritakan di Wawancara

> "Saya bangun SpendScan, aplikasi pencatat keuangan dengan AI scan struk. Saya handle **seluruh mobile app** — dari navigasi, UI/UX, form validation, state management, fetching logic, sampai integrasi API. Kolaborator saya handle backend Express + Supabase + Groq Vision. Fitur yang paling saya banggakan adalah **receipt scan flow**: user tinggal foto struk, AI Groq Vision baca langsung item-itemnya, user review sebentar, lalu simsal semua. Saya juga pastikan arsitekturnya rapi — service layer terpisah dari UI, jadi migrate dari mock data ke API real gak perlu rewrite screens."

---

## 12. Skill yang Terdemonstrasi

- **React Native & Expo** — komponen fungsional, hooks, navigasi
- **Mobile UI/UX** — loading, empty, error states; responsive layout
- **State Management** — Context API + SecureStore untuk auth
- **REST API Integration** — fetch wrapper, JWT, error handling
- **AI/LLM Integration** — Groq Vision API untuk receipt parsing
- **Clean Architecture** — separation of concerns (screens vs services vs constants)
- **Git & Kolaborasi** — kerja tim dengan backend developer
- **Problem Solving** — solusi kreatif: Groq Vision gantikan Tesseract.js

---

> Dibuat: Juni 2026  
> Untuk kebutuhan portofolio — bisa disesuaikan dengan platform tujuan (LinkedIn, resume, website).
