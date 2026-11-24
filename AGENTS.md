# AGENTS.md — SpendScan Project Context

> This file is the primary context file for AI coding agents.  
> Before changing code, read this file and `docs/PRD.md`.

## 1. Project Identity

**Project name:** SpendScan  
**Product type:** Mobile expense tracker with receipt scan/OCR support  
**Core idea:** Users can record expenses manually or by scanning receipts. The app stores transactions, shows monthly spending summary, and lets users view, edit, and delete transaction records.

## 2. Source of Truth

- Full product requirements are stored in: `docs/PRD.md`
- This `AGENTS.md` is a shorter operational guide for AI agents.
- If this file and `docs/PRD.md` disagree, prioritize `docs/PRD.md` for product requirements, then ask the user before making major changes.

## 3. Roles

This project is built by a **single developer** who handles both the mobile app and backend.

### Developer

The user is the sole developer of this project.

Responsibilities across the full stack:
- Build the React Native + Expo mobile app (all screens, components, navigation)
- Build the backend API using Node.js + Express
- Manage database using Supabase/PostgreSQL and file storage using Supabase Storage
- Set up AI-powered receipt parsing using Gemini Vision API
- Deploy and maintain backend on Vercel
- Keep API calls isolated in the service layer for easy maintenance

Primary focus areas (mobile):
- `App.js`
- `src/screens/*`
- `src/components/*`
- `src/navigation/*`
- `src/services/transactionService.js`
- `src/constants/*`
- `src/utils/*`

## 4. Tech Stack

### Mobile App
- React Native
- Expo **SDK 58** (`expo ~58.0.24`, React Native 0.88.1)
  - App uses `expo-dev-client` + native modules (`@infinitered/react-native-mlkit-text-recognition`), so **Expo Go is no longer usable** — run a development build or the `preview` APK
- JavaScript / JSX
- React Navigation
  - `@react-navigation/native`
  - `@react-navigation/bottom-tabs`
  - `@react-navigation/native-stack`
- `react-native-screens`
- `react-native-safe-area-context`
- `expo-image-picker`
- `@expo/vector-icons`
- `date-fns`

### Backend
- Node.js
- Express.js (v5)
- Supabase/PostgreSQL
- Supabase Storage
- **Google Gemini Vision** (`gemini-3.6-flash`) via OpenAI-compatible endpoint for receipt OCR parsing
  - Replaces Groq Vision (Groq disabled all vision models)
  - Accepts base64 image directly, returns structured JSON (items, merchant, date)
  - Response time ~1-2s, well within Vercel limits
  - **Status: ACTIVE** — Tab Scan Struk aktif di Bottom Tab navigator. Pengguna bisa foto/unggah struk, edit item hasil scan, dan simpan langsung ke kantong/kategori.

### Deployment
- **Hosting:** Vercel (free Hobby plan, no credit card required)
- **Production URL:** `https://backend-delta-sand-64.vercel.app`
- **Framework:** Vercel Express preset (auto-wraps Express app, no `serverless-http` needed)
- **No `api/` directory** — Vercel launches Express directly via `server.js`
- **Config:** `backend/vercel.json` — route all requests `/(.*)` to Express
- **Env vars:** 9 variables set via `vercel env add` (SUPABASE, JWT, Gemini API keys)
- **Root Directory:** project Vercel sudah di-set ke `backend`, jadi perintah `vercel --cwd backend` akan gagal (`backend/backend` tidak ada).
- **Deploy command:** jalankan dari root repo:
  ```bash
  vercel --prod --yes --force
  ```

## 5. Important Setup Notes

### Recommended Local Folder
Avoid storing the project in Windows protected folders such as:
- `Documents`
- `Desktop`
- `Pictures`
- `Videos`

Recommended location:

```bash
C:\Users\HP\Projects\SpendScan
```

Reason: Windows Security / Controlled Folder Access may block `node.exe`, `npm`, or folder creation commands.

### Create Project

```bash
npx create-expo-app SpendScan --template blank
cd SpendScan
```

When asked to choose an Expo SDK version, use:

```text
For learning with Expo Go (SDK 54)
```

This was chosen because the newer SDK option previously caused Expo Go compatibility issues in the project setup.

### Run Project

```bash
npx expo start
```

Then scan the QR code using Expo Go on Android. The laptop and phone should be on the same Wi-Fi network.

### Dependency Notes
Prefer Expo-compatible installs for React Native native modules.

Navigation packages may need:

```bash
npm install @react-navigation/native @react-navigation/bottom-tabs @react-navigation/native-stack --legacy-peer-deps
```

Expo/RN support packages compatible with SDK 54 may be installed with pinned versions if Expo install fails:

```bash
npm install react-native-screens@~4.16.0 react-native-safe-area-context@~5.6.0 --legacy-peer-deps
npx expo install expo-image-picker
npm install @expo/vector-icons date-fns
```

Do not blindly upgrade React Native, Expo SDK, or navigation packages without checking compatibility.

## 6. Expected Folder Structure

```text
SpendScan/
├── AGENTS.md
├── docs/
│   └── PRD.md
├── src/
│   ├── screens/
│   │   ├── HomeScreen.jsx
│   │   ├── TransactionListScreen.jsx
│   │   ├── TransactionDetailScreen.jsx
│   │   ├── AddTransactionScreen.jsx
│   │   ├── EditTransactionScreen.jsx
│   │   ├── ReportScreen.jsx
│   │   ├── ProfileScreen.jsx
│   │   ├── ManagePocketsScreen.jsx
│   │   ├── PocketDetailScreen.jsx
│   │   └── ScanScreen.jsx
│   ├── components/
│   │   ├── TransactionCard.jsx
│   │   ├── CategoryBadge.jsx
│   │   ├── PocketCard.jsx
│   │   └── EmptyState.jsx
│   ├── navigation/
│   │   └── AppNavigator.jsx
│   ├── services/
│   │   ├── api.js
│   │   ├── authService.js
│   │   ├── pocketService.js
│   │   └── transactionService.js
│   ├── data/
│   │   └── mockTransactions.js
│   ├── constants/
│   │   ├── colors.js
│   │   ├── categories.js
│   │   └── pockets.js
│   └── utils/
│       └── formatCurrency.js
├── App.js
└── package.json
```

## 7. Core Data Shape

Use this transaction shape consistently in mock data, screens, services, and backend responses.

```js
{
  id: '1',
  userId: 'user-001',
  title: 'Makan Siang',
  amount: 25000,
  category: 'Food & Drink',
  pocketId: null, // UUID kantong, OPSIONAL (null = transaksi tanpa kantong, tetap dihitung di Total Saldo)
  transactionDate: '2026-06-15',
  note: 'Nasi ayam',
  receiptImageUrl: null,
  rawOcrText: null,
  source: 'manual', // 'manual' | 'ocr'
  createdAt: '2026-06-15T10:00:00Z',
  updatedAt: '2026-06-15T10:00:00Z'
}
```

## 8. Default Categories

Dipakai saat fitur **Bagi Saldo MATI**. Saat Bagi Saldo **AKTIF**, pengeluaran dikelompokkan pakai **kantong custom** milik user, bukan daftar ini.

Kantong **opsional**: pemasukan dan pengeluaran boleh tidak punya kantong. Transaksi tanpa kantong saat Bagi Saldo aktif disimpan dengan `category = 'Lainnya'`, tidak muncul sebagai kartu/bucket kantong, tapi tetap dihitung di Total Saldo.

```js
export const CATEGORIES = [
  { id: '1', label: 'Food & Drink', icon: '🍔' },
  { id: '2', label: 'Transportation', icon: '🚗' },
  { id: '3', label: 'Shopping', icon: '🛍️' },
  { id: '4', label: 'Bills', icon: '🧾' },
  { id: '5', label: 'Health', icon: '💊' },
  { id: '6', label: 'Education', icon: '📚' },
  { id: '7', label: 'Entertainment', icon: '🎮' },
  { id: '8', label: 'Other', icon: '📦' }
];
```

## 9. Color Tokens

```js
export const colors = {
  primary: '#4F46E5',
  background: '#F9FAFB',
  card: '#FFFFFF',
  text: '#111827',
  textSecondary: '#6B7280',
  danger: '#EF4444',
  success: '#10B981',
  border: '#E5E7EB'
};
```

## 10. Architecture Rules

### Mobile App Rules
- Use functional React components.
- Keep screens focused on UI and user interaction.
- Do not call `fetch` or backend endpoints directly inside screens.
- All transaction data access must go through `src/services/transactionService.js`.
- Start with mock data in `src/data/mockTransactions.js`.
- Later, replace only service layer methods with real API calls.
- Use `formatCurrency()` for IDR display.
- Use `CATEGORIES` from constants, not hard-coded category arrays inside screens.
- Show loading, empty, error, and success states where relevant.
- Keep component names clear and file names consistent.

### Backend Rules
- Backend should expose REST API endpoints for transactions, auth, image upload, and OCR.
- Backend should validate all input.
- Backend should never trust values directly from the client.
- Backend should store receipt images in Supabase Storage.
- Backend should store transaction records in PostgreSQL tables.
- OCR should return raw text and parsed candidate fields where possible.

## 11. Service Layer Contract

The mobile service layer should expose methods like:

```js
export const transactionService = {
  getAll: async () => {},
  getById: async (id) => {},
  create: async (data) => {},
  update: async (id, data) => {},
  delete: async (id) => {},
  scanReceipt: async (image) => {}
};
```

For now, these methods may use mock data. Later, they should call backend endpoints.

## 12. Planned API Contract

Recommended backend endpoints:

```text
POST   /auth/register
POST   /auth/login
GET    /transactions
GET    /transactions/:id
POST   /transactions
PUT    /transactions/:id
DELETE /transactions/:id
POST   /receipts/scan
GET    /pockets              → { enabled, pockets:[{ id, name, icon, color, balance, sortOrder }] }
POST   /pockets              → { name, icon, color, balance }
PATCH  /pockets/settings     → { enabled }
PATCH  /pockets/:id          → { name?, icon?, color?, balance? }
DELETE /pockets/:id
GET    /pockets/:id/transactions → transaksi yang bertag ke kantong itu
```

### Aturan saldo (berlaku setelah revisi 24 Nov 2026)

```text
Total Saldo   = Σ pemasukan − Σ pengeluaran          (read-only, tidak bisa diedit)
Saldo kantong = base_balance + Σ pemasukan bertag − Σ pengeluaran bertag
Sisa belum dibagi = Total Saldo − Σ saldo kantong     (hanya validasi, bukan kartu)
```

- Menambah/mengubah saldo kantong melebihi sisa Total Saldo → ditolak backend.
- Tidak ada tabel riwayat pindah saldo; `base_balance` dihitung ulang dari nilai yang diisi user.
- `pockets.allocated` **deprecated** (diganti `base_balance` di `migration_pockets_v3.sql`).
- Edit Total Saldo hanya lewat transaksi biasa (misal pemasukan berjudul "Saldo Awal").

Recommended response style:

```js
{
  success: true,
  message: 'Transaction created successfully',
  data: { }
}
```

Error response:

```js
{
  success: false,
  message: 'Validation failed',
  errors: []
}
```

## 13. Screen Responsibilities

### `HomeScreen.jsx`
- Show **Total Saldo** (read-only, dari semua transaksi) as the headline card.
- Show monthly summary (pemasukan, pengeluaran, saldo bersih bulan ini).
- Show kantong cards (nama + saldo saja) saat Bagi Saldo aktif; ketuk kartu → `PocketDetail`.
- Show latest 5 transactions.
- Provide button to add transaction.
- Navigate to transaction detail when a transaction card is tapped.

### `TransactionListScreen.jsx`
- Show all transactions.
- Support empty state.
- Filter by kategori (Bagi Saldo mati) atau nama kantong (Bagi Saldo aktif). Tidak ada filter "Tanpa Kantong".

### `TransactionDetailScreen.jsx`
- Show transaction detail.
- Show title, amount, category, date, note, source, and receipt image if available.
- Provide edit and delete entry points.

### `AddTransactionScreen.jsx`
- Manual form input for title, amount, category, date, and note.
- Validate required fields before saving.
- Saat **Bagi Saldo aktif**: tampilkan picker **kantong** dan itu **opsional** (berlaku untuk pemasukan maupun pengeluaran). Tanpa kantong → `category = 'Lainnya'`.
- Saat **Bagi Saldo mati**: picker **kategori default** (wajib untuk pengeluaran).

### `EditTransactionScreen.jsx`
- Load existing transaction by ID.
- Pre-fill form.
- Allow update.
- Return to detail/list after successful save.

### `ManagePocketsScreen.jsx`
- Tambah / ubah / hapus kantong, pilih icon & warna.
- Isi **saldo kantong** langsung (bukan jatah). Backend menolak kalau melebihi sisa Total Saldo.
- Hapus kantong → transaksinya jadi tanpa kantong, Total Saldo tidak berubah.

### `PocketDetailScreen.jsx`
- Dibuka dari kartu kantong di Home.
- Header: saldo kantong saat ini.
- Daftar transaksi bertag ke kantong itu (`GET /pockets/:id/transactions`), bisa diketuk ke detail transaksi.

### `ProfileScreen.jsx`
- Info user + logout.
- Switch **Bagi Saldo** + pintu masuk **Kelola Kantong**.

## 14. Development Phases

1. Setup project, dependencies, and folder structure.
2. Add constants, utils, mock data, and service layer.
3. Setup navigation: Bottom Tabs + Stack Navigation.
4. Build `HomeScreen` with summary and recent transactions.
5. Build `AddTransactionScreen` with manual form.
6. Build `TransactionListScreen` and `TransactionDetailScreen`.
7. Build `EditTransactionScreen` and delete confirmation.
8. Connect to backend by replacing mock service calls with real API calls.
9. Add receipt upload and OCR flow. (dimatikan di v1.2.0)
10. Build `ReportScreen` and `ProfileScreen`.
11. Redesign color palette.
12. **Bagi Saldo**: kantong opsional + custom (CRUD, toggle, integrasi form & laporan).
13. **Revisi kantong & saldo** (24 Nov 2026): Total Saldo read-only, kantong = wadah saldo (nama + saldo saja), set saldo langsung, drill-down transaksi per kantong, "Tanpa Kantong" dihapus, `AllocateScreen` dihapus.
14. Polish UI and prepare portfolio/demo.

## 15. Current Status

- Backend deployed to Vercel (production): `https://backend-delta-sand-64.vercel.app`
- Migrasi `migration_pockets_v2.sql` dan `migration_pockets_v3.sql` sudah dijalankan di Supabase
- All mobile screens built (Home, Add, List, Detail, Edit, Report, Profile, ManagePockets, PocketDetail)
- **Bagi Saldo**: kantong custom + opsional, toggle di Profil. Revisi saldo (v1.3.0) sudah di-deploy backend-nya, tinggal tes e2e di device
- **Model saldo**: `Total Saldo` read-only dari transaksi; `saldo kantong = base_balance + transaksi bertag`; tidak ada "Saldo Utama" dan tidak ada bucket "Tanpa Kantong"
- **Scan struk**: aktif dengan Gemini Vision; kantong saat simpan hasil scan juga opsional
- Mobile app connects to Vercel backend (BASE_URL di `api.js`)
- App version `1.2.0`, `versionCode 3`; `expo-updates` belum dipasang (tiap update perlu rebuild + reinstall)
- Next milestone: tes e2e revisi kantong, lalu build APK baru via `eas build --platform android --profile preview`

## 16. AI Agent Behavior Rules

When helping with this project:
- Always remember the user is **Mobile App Developer**.
- Still understand the whole project, including backend responsibilities.
- Do not assume backend is ready unless the user says so.
- Prefer mock data first.
- When giving code, include exact file path.
- When changing an existing file, explain what should be replaced.
- Avoid introducing TypeScript unless the user explicitly asks.
- Avoid adding new libraries unless clearly needed.
- Avoid changing the tech stack.
- If an error appears, diagnose from the exact terminal message first.
- Keep answers practical and beginner-friendly.

## 17. Useful Commands

```bash
# Start development server
npx expo start

# Clear Expo cache if needed
npx expo start -c

# Install lightweight JS dependencies
npm install @expo/vector-icons date-fns

# Install navigation packages if peer dependency conflict appears
npm install @react-navigation/native @react-navigation/bottom-tabs @react-navigation/native-stack --legacy-peer-deps

# Create folder structure on Windows PowerShell
mkdir src
cd src
mkdir screens
mkdir components
mkdir navigation
mkdir services
mkdir data
mkdir constants
mkdir utils
cd ..

# Deploy backend to Vercel (jalankan dari root repo)
# Root Directory project sudah di-set ke 'backend', JANGAN pakai --cwd backend
vercel --prod --yes --force

# Set environment variables on Vercel
echo "value" | vercel env add VAR_NAME production --yes
```

## 18. What To Do Next

Recommended next AI-assisted task:

1. Build APK via `eas build --platform android`
2. Rename Vercel project from `backend` to `spendscan-api` (or use custom domain)
3. Polish UI and prepare for portfolio/demo
