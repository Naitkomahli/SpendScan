# PRD.md — SpendScan

## 1. Product Overview

**Product Name:** SpendScan  
**Product Type:** Smart receipt expense tracker mobile app  
**Platform:** Mobile App, Android-first for development/testing using Expo Go  
**Primary User:** Individual users who want to track daily expenses and income manually or by scanning receipts.

SpendScan is a mobile expense tracker that helps users record, view, edit, and manage daily spending and income. The MVP focuses on manual expense and income tracking with a financial dashboard, then expands to receipt scanning using OCR. The project is built collaboratively: Orang A handles the mobile app, while Orang B handles backend, database, storage, and OCR.

## 2. Background

Many people forget small daily expenses such as food, transport, snacks, bills, and online purchases. Manual note-taking is often inconsistent, while receipts are easy to lose. SpendScan solves this by providing a simple mobile app where users can quickly add expenses and income manually and later scan receipts so the app can extract spending information automatically.

## 3. Goals

### Product Goals
- Help users record expenses and income quickly.
- Show monthly spending summary with income vs expense breakdown.
- Store transaction history in a structured way.
- Support manual input first so the mobile app can be built before backend is ready.
- Add receipt scan/OCR flow after core transaction features work.

### Project Goals
- Build a portfolio-ready mobile app project.
- Practice React Native + Expo mobile development.
- Practice real team collaboration between frontend/mobile and backend.
- Keep the architecture clean by separating UI screens from service/API logic.

## 4. Non-Goals for MVP

The MVP will not focus on:
- Bank account integration.
- E-wallet integration.
- Advanced budgeting system (beyond simple income/expense tracking).
- AI-based financial advice.
- Multi-currency support.
- Admin dashboard.
- Production payment processing.

These can be added later after the core app is stable.

## 5. Team and Responsibilities

### Orang A — Mobile App Developer
The user is **Orang A**.

Responsibilities:
- Create mobile app using React Native + Expo.
- Build screen UI and navigation.
- Build reusable UI components.
- Use mock data while backend is not ready.
- Integrate backend API from Orang B through service layer.
- Ensure mobile app can run in Expo Go.
- Prepare the mobile app for portfolio/demo.

### Orang B — Backend Developer
The collaborator is **Orang B**.

Responsibilities:
- Build REST API using Node.js + Express.
- Design database schema in Supabase/PostgreSQL.
- Handle authentication and user data.
- Store receipt images in Supabase Storage.
- Run OCR using Tesseract.js.
- Return transaction and OCR data to mobile app.
- Document API endpoints for Orang A.

## 6. Tech Stack

### Mobile App
- React Native
- Expo SDK 54
- JavaScript / JSX
- Expo Go for development testing
- React Navigation
- Expo Image Picker
- Expo Secure Store
- Expo Vector Icons
- date-fns
- react-native-svg
- react-native-chart-kit

### Backend
- Node.js
- Express.js
- Supabase/PostgreSQL
- Supabase Storage
- Tesseract.js (OCR)
- OpenAI SDK (LLM client untuk Groq API)
- Groq AI (Llama 3.3 70B untuk receipt parsing)
- jsonwebtoken (JWT auth)
- bcryptjs (password hashing)

## 7. Core User Flow

### Authentication Flow
1. User opens SpendScan.
2. If not logged in, LoginScreen appears.
3. User can toggle between Login and Register mode.
4. After successful login/register, JWT token is stored securely.
5. User is redirected to Home dashboard.
6. On next app open, token is restored automatically.

### Manual Expense/Income Flow
1. User opens SpendScan.
2. User sees dashboard with income, expense, balance, and latest transactions.
3. User taps **+** to add transaction.
4. User chooses **Pemasukan** or **Pengeluaran** type.
5. User fills title, amount, category, date, and optional note.
6. User saves transaction.
7. App returns to dashboard — summary updates automatically.

### Transaction Detail Flow
1. User opens transaction list or recent transactions.
2. User taps one transaction.
3. App opens detail screen showing title, amount with +/- sign, type badge, category, date, and note.
4. User can edit or delete transaction.

### Report Flow
1. User taps **Lihat Laporan Keuangan** on Home dashboard.
2. App shows ReportScreen with line chart (income green, expense red) for the month.
3. Summary cards show total income, expense, and net balance.
4. Category breakdown shows expense bars with percentage.
5. User can change month via month picker.

### History & Filter Flow
1. User taps History tab.
2. App shows transactions for the current month with income/expense summary.
3. User can tap calendar icon to select a different month.
4. User can search transactions by title/category/note.
5. User can filter by category chips.

### Receipt Scan Flow ✅ (Completed)
1. User opens Scan tab.
2. User taps **"Ambil Gambar"** → modal pilihan: Kamera / Galeri / Batal.
3. User takes or selects receipt photo.
4. Image preview appears.
5. User taps **"Scan Struk"** → loading overlay with OCR progress.
6. Backend runs OCR via Tesseract.js → extracts raw text.
7. Backend sends raw text to **Groq AI (Llama 3.3 70B)** via LLM service.
8. LLM intelligently parses the text → returns structured JSON with:
   - Merchant name
   - Transaction date
   - List of items with name and price
9. Mobile displays **item review screen**:
   - Each item shown as row with number, name, amount.
   - User can **edit** item (name/amount) via modal.
   - User can **delete** unwanted items.
   - User can **add** new items manually.
   - Raw OCR text view (expandable).
10. User taps **"Simpan Semua (N item)"**.
11. Each item is saved as a **separate expense transaction** via API.
12. User returns to Scan tab, ready for next scan.

## 8. MVP Scope

### ✅ Completed
- Home dashboard with income/expense/balance cards.
- Category breakdown with progress bars.
- Add transaction manually with income/expense toggle.
- Transaction list with search, filter chips, and month filter.
- Transaction detail with type badge and source indicator.
- Edit transaction.
- Delete transaction with confirmation.
- Mock data with type field.
- API-ready service structure.
- Authentication (login/register/logout).
- JWT token management with SecureStore.
- Full API integration (transaction CRUD + auth).
- Report screen with LineChart.
- Profile screen with user info and logout.
- Bottom tab navigation (Home → Scan → History).
- Month filter in History screen.
- Receipt image upload (camera/gallery).
- OCR processing via Tesseract.js.
- LLM-based receipt parsing via Groq AI (Llama 3.3 70B).
- Item-level extraction (name + price per item).
- Item review screen (edit, delete, add items).
- Batch save multiple transactions from one receipt.
- Image upload to Supabase Storage.

### ❌ Remaining
- Better statistics / yearly comparison.
- Push notifications.
- Budget limit per category.
- Dark mode.
- Export CSV/PDF.
- Multi-device sync.

## 9. Functional Requirements

### FR-001 — Home Dashboard
**Description:** User can see summary of income, expenses, and balance for the current month.

**Requirements:**
- Show total income for the month (green card).
- Show total expenses for the month (red card).
- Show net balance (surplus/deficit).
- Show expense breakdown by category with progress bars.
- Show latest 5 transactions.
- Show empty state if no transaction exists.
- Provide button to add transaction.
- Provide button to open Report screen.
- Tapping transaction opens detail screen.
- Tapping avatar opens Profile screen.

**Acceptance Criteria:**
- Income, expense, and balance calculated correctly from transactions.
- Transactions filtered by current month (dynamic, not hardcoded).
- Category breakdown sorted by highest expense.
- Progress bar width reflects percentage of total expense.

### FR-002 — Add Manual Transaction
**Description:** User can manually add an income or expense transaction.

**Fields:**
- Type: Pemasukan (income) or Pengeluaran (expense), required.
- Title, required.
- Amount, required, positive number.
- Category: auto-set to "Pemasukan" for income, pick from list for expense.
- Transaction date, required.
- Note, optional.

**Behavior by Type:**
- **Income:** Toggle green, category auto-set to "💰 Pemasukan", title describes source (e.g. "Gaji Bulanan").
- **Expense:** Toggle primary color, user picks from 8 expense categories.

**Acceptance Criteria:**
- App validates required fields.
- Amount must be numeric and greater than 0.
- Validation errors shown per field.
- Type persists after save.
- New transaction appears in list/dashboard after saving.

### FR-003 — Transaction List / History
**Description:** User can view all transactions filtered by month.

**Requirements:**
- Display month summary bar showing total income and expense for selected month.
- Display transactions grouped by date section (Hari Ini, Kemarin, or date).
- Each card shows title, category, type badge (INCOME/EXPENSE), and amount with +/- sign.
- Search transactions by title, category, or note.
- Filter by category chips.
- Filter by month via calendar button (modal with 6 months).
- Pull-to-refresh.

**Acceptance Criteria:**
- Month filter works and affects shown data.
- Search filters in real-time.
- Category chips show active state.
- Cards show green for income, red for expense.

### FR-004 — Transaction Detail
**Description:** User can view one transaction in detail.

**Requirements:**
- Show type badge: Pemasukan (green) or Pengeluaran (red).
- Show title.
- Show amount with +/- sign and appropriate color.
- Show category.
- Show date (formatted: "15 Juni 2026").
- Show note if available.
- Show source: manual or OCR.
- Provide edit action.
- Provide delete action with confirmation modal.

**Acceptance Criteria:**
- Correct transaction is loaded by ID.
- Missing note/receipt is handled gracefully.
- Edit button navigates to edit form.
- Delete action shows confirmation before deleting.

### FR-005 — Edit Transaction
**Description:** User can update an existing transaction.

**Requirements:**
- Form is pre-filled with existing data.
- User can modify type, title, amount, category, date, note.
- Type toggle works with same rules as add form.
- Save updates transaction.
- Updated data is visible in detail/list/dashboard.

**Acceptance Criteria:**
- Existing data loads correctly including type.
- Validation rules still apply.
- Changes persist after save.
- Navigation returns to previous screen on success.

### FR-006 — Delete Transaction
**Description:** User can delete an expense record.

**Requirements:**
- Delete action must show confirmation modal.
- Confirming delete removes transaction.
- Cancelling delete keeps transaction.
- Loading state on delete button during API call.

**Acceptance Criteria:**
- Transaction disappears from list/dashboard after deletion.
- App does not delete accidentally without confirmation.

### FR-007 — Report Screen
**Description:** User can view a financial report with chart and summary.

**Requirements:**
- Line chart showing daily income (green line) and expense (red line) for selected month.
- Summary cards: total income, total expense.
- Net balance card with surplus/deficit indicator.
- Category breakdown with colored progress bars, percentage, and icons.
- Month picker via tap on header.
- Auto-fetches latest data on focus.

**Acceptance Criteria:**
- Chart renders without error.
- Chart labels show day numbers.
- Data matches selected month.
- Tapping outside modal closes month picker.
- Works with empty data (shows flat line).

### FR-008 — Scan & OCR Receipt
**Description:** User can scan a receipt and the app extracts individual items using OCR + AI parsing.

**Requirements:**
- Camera/gallery option modal when tapping "Ambil Gambar".
- Image preview after selection.
- Loading overlay with status during OCR processing.
- Backend OCR via Tesseract.js extracts raw text.
- Backend sends raw text to **Groq AI (Llama 3.3 70B)** for intelligent parsing.
- LLM returns structured JSON: merchant, date, items (name + price).
- Review screen showing all extracted items.
- Each item editable (name, amount) via modal.
- Each item deletable with confirmation.
- "Tambah Item" button for manual additions.
- Raw OCR text viewable via expandable toggle.
- "Simpan Semua" button creates one transaction per item.
- Items saved with `source: 'ocr'` and `type: 'expense'`.

**Acceptance Criteria:**
- Scanner works with both camera and gallery.
- OCR + LLM parsing completes within reasonable time (5-15 seconds).
- Items correctly displayed in review list.
- Edit/delete/add operations update the list correctly.
- Saving creates correct number of transactions.
- All transactions visible in history/dashboard.

### FR-009 — Authentication
**Description:** User can register, login, and logout.

**Requirements:**
- Login form: email + password.
- Register form: name + email + password.
- Toggle between login and register mode.
- Validation: email format, password min 6 chars, name required for register.
- Show/hide password toggle.
- Error display via Alert.
- Loading state during API call.
- Token stored securely in SecureStore.
- Auto-restore session on app restart.

**Acceptance Criteria:**
- Login registers JWT token.
- Token persists across app restarts.
- Logout clears token and redirects to login.
- Invalid credentials show error message.

### FR-010 — Profile
**Description:** User can view their account info and logout.

**Requirements:**
- Show user avatar circle with initial.
- Show user name and email.
- Show detail list: name, email, UID (truncated).
- Logout button with confirmation.

**Acceptance Criteria:**
- User data displayed correctly from auth context.
- Logout clears session and navigates to login.

### FR-011 — Backend API Integration
**Description:** Mobile app integrates real backend via service layer.

**Requirements:**
- All transaction CRUD methods call backend endpoints.
- Auth methods call backend auth endpoints.
- JWT token attaches automatically via apiRequest helper.
- Field mapping: snake_case (Supabase) ↔ camelCase (mobile).
- Loading and error states handled in screens.
- Multipart upload support for receipt scanning.

**Acceptance Criteria:**
- Mobile screens work with real API without changes.
- Failed API requests show useful messages.
- Token expiry redirects to login.

## 10. Data Model

### Transaction Object

```js
{
  id: 'string',
  userId: 'string',
  title: 'string',
  amount: 25000,
  category: 'Food & Drink | Pemasukan | ...',
  transactionDate: 'YYYY-MM-DD',
  note: 'string | null',
  receiptImageUrl: 'string | null',
  rawOcrText: 'string | null',
  source: 'manual | ocr',
  type: 'income | expense',
  createdAt: 'ISO datetime string',
  updatedAt: 'ISO datetime string'
}
```

### User Object

```js
{
  id: 'string',
  name: 'string',
  email: 'string',
  createdAt: 'ISO datetime string'
}
```

### Receipt/OCR Result Object (Legacy)

```js
{
  imageUrl: 'string',
  rawText: 'string',
  parsed: {
    title: 'string | null',
    amount: 'number | null',
    transactionDate: 'YYYY-MM-DD | null',
    category: 'string | null'
  }
}
```

### Receipt Parsing Result (Current — LLM-based)

```js
{
  receiptImageUrl: 'string | null',
  rawOcrText: 'string',
  parsed: {
    merchant: 'string | null',
    transactionDate: 'YYYY-MM-DD | null',
    items: [
      { name: 'string', amount: 15000 }
    ]
  }
}
```

## 11. Database Schema (Supabase)

### `users`

| Field | Type | Notes |
|---|---|---|
| id | uuid | Primary key |
| name | text | User display name |
| email | text | Unique |
| password_hash | text | Managed by bcryptjs |
| created_at | timestamp | Auto timestamp |

### `transactions`

| Field | Type | Notes |
|---|---|---|
| id | uuid | Primary key |
| user_id | uuid | Foreign key to users |
| title | text | Required |
| amount | numeric(12,2) | Required, > 0 |
| category | text | Required |
| transaction_date | date | Required |
| note | text | Optional |
| receipt_image_url | text | Optional |
| raw_ocr_text | text | Optional |
| source | text | `manual` or `ocr` |
| type | varchar(10) | `income` or `expense`, default `expense` |
| created_at | timestamp | Auto timestamp |
| updated_at | timestamp | Auto timestamp |

## 12. API Contract

### Response Format

Success:
```json
{ "success": true, "message": "OK", "data": {} }
```

Error:
```json
{ "success": false, "message": "Validation failed", "errors": [] }
```

### Auth Endpoints

```
POST /api/auth/register   → body: { name, email, password }
POST /api/auth/login      → body: { email, password }
```

Login/register response:
```json
{
  "success": true,
  "message": "Login successful",
  "data": {
    "user": { "id": "uuid", "name": "...", "email": "..." },
    "token": "jwt..."
  }
}
```

### Transaction Endpoints (require Bearer token)

```
GET    /api/transactions
GET    /api/transactions/:id
POST   /api/transactions
PUT    /api/transactions/:id
DELETE /api/transactions/:id
```

### Create Transaction Request

```json
{
  "title": "Makan Siang",
  "amount": 25000,
  "category": "Food & Drink",
  "transactionDate": "2026-06-15",
  "note": "Nasi ayam",
  "source": "manual",
  "type": "expense"
}
```

### OCR Endpoint (require Bearer token)

```
POST /api/receipts/scan
Content-Type: application/json
Body: { image: "base64string", imageType: "image/jpeg" }
```

**Response (success):**
```json
{
  "success": true,
  "message": "Receipt scanned successfully",
  "data": {
    "receiptImageUrl": "https://supabase/storage/...",
    "rawOcrText": "INDOMARET\nBeras 5KG 75000\n...",
    "parsed": {
      "merchant": "INDOMARET",
      "transactionDate": "2026-06-27",
      "items": [
        { "name": "Beras 5KG", "amount": 75000 },
        { "name": "Kecap Manis ABC", "amount": 8500 }
      ]
    }
  }
}
```

## 13. UI/UX Requirements

### Style Direction
- Clean.
- Minimal.
- Modern.
- Easy to read.
- Beginner-friendly user flow.
- Color coding: green for income, red for expense.

### Main Color Tokens

```js
primary: '#4F46E5'
background: '#F9FAFB'
card: '#FFFFFF'
text: '#111827'
textSecondary: '#6B7280'
danger: '#EF4444'
success: '#10B981'
border: '#E5E7EB'
```

### Required States
Each major screen should handle:
- Loading state (skeleton placeholders).
- Empty state (illustration + message).
- Error state (retry option).
- Success feedback (Alert).

### Accessibility/Usability
- Buttons should be easy to tap.
- Text should be readable.
- Amount should be formatted as Indonesian Rupiah with +/- sign.
- Destructive actions like delete should require confirmation.

## 14. Navigation Structure

```
NavigationContainer
└── AuthProvider
    └── AppNavigator
        ├── [Not Authenticated]
        │   └── LoginScreen (login/register toggle)
        └── [Authenticated] BottomTabs
            ├── HomeTab (Stack)
            │   ├── Home (Dashboard)
            │   ├── AddTransaction
            │   ├── TransactionDetail
            │   ├── EditTransaction
            │   ├── Profile
            │   └── Report
            ├── ScanTab
            │   └── ScanScreen (placeholder)
            └── HistoryTab (Stack)
                ├── TransactionList
                ├── TransactionDetail
                └── EditTransaction
```

Tab order: Home (left) → Scan (center) → History (right).

## 15. File Structure

```text
SpendScan/
├── App.js
├── AGENTS.md
├── backend/
│   ├── .env
│   ├── package.json
│   ├── src/
│   │   ├── server.js
│   │   ├── config/
│   │   │   └── supabase.js
│   │   ├── controllers/
│   │   │   ├── authController.js
│   │   │   ├── transactionController.js
│   │   │   └── receiptController.js
│   │   ├── services/
│   │   │   └── llmParser.js
│   │   ├── middleware/
│   │   │   ├── auth.js
│   │   │   └── errorHandler.js
│   │   ├── routes/
│   │   │   ├── auth.js
│   │   │   ├── transactions.js
│   │   │   └── receipts.js
│   │   └── db/
│   │       └── schema.sql
│   └── ...
├── docs/
│   ├── PRD.md
│   └── MEMORY.md
└── src/
    ├── components/
    │   ├── TransactionCard.jsx
    │   ├── CategoryBadge.jsx
    │   ├── EmptyState.jsx
    │   └── Skeleton.jsx
    ├── constants/
    │   ├── colors.js
    │   └── categories.js
    ├── contexts/
    │   └── AuthContext.js
    ├── data/
    │   └── mockTransactions.js
    ├── navigation/
    │   └── AppNavigator.jsx
    ├── screens/
    │   ├── HomeScreen.jsx
    │   ├── AddTransactionScreen.jsx
    │   ├── TransactionListScreen.jsx
    │   ├── TransactionDetailScreen.jsx
    │   ├── EditTransactionScreen.jsx
    │   ├── LoginScreen.jsx
    │   ├── ProfileScreen.jsx
    │   ├── ReportScreen.jsx
    │   └── ScanScreen.jsx
    ├── services/
    │   ├── api.js
    │   ├── authService.js
    │   └── transactionService.js
    └── utils/
        └── formatCurrency.js
```

## 16. Development Roadmap

### Phase 1 ✅ — Setup Project
- Create Expo project with SDK 54.
- Install dependencies.
- Create folder structure.

### Phase 2 ✅ — Base Files
- Create colors, categories, formatCurrency, mockTransactions.
- Create transactionService (mock).

### Phase 3 ✅ — Navigation
- Create AppNavigator with Bottom Tabs + Stack.
- Update App.js.

### Phase 4 ✅ — Home Screen
- Monthly summary card.
- Add transaction button.
- Recent transactions list.
- States: loading, empty, error.

### Phase 5 ✅ — Add Transaction Screen
- Form with validation.
- Category picker.
- Save to service.

### Phase 6 ✅ — List and Detail Screens
- Transaction list with SectionList.
- Transaction detail.
- Delete confirmation.

### Phase 7 ✅ — Edit and Delete
- Edit form.
- Update and delete in service.

### Phase 8 ✅ — Backend Integration
- Auth: login, register, logout.
- JWT + SecureStore.
- API client helper (apiRequest with base64, FormData support).
- Replace mock with real API calls.
- Field mapping (snake_case ↔ camelCase).
- LLM parser service (llmParser.js → Groq API).

### Phase 9 ✅ — Income/Expense & Dashboard
- Add type field (income/expense).
- Toggle in Add & Edit forms.
- Income/expense cards on dashboard.
- Net balance display.
- Category breakdown with progress bars.
- Dynamic month filtering.

### Phase 10 ✅ — Report Screen
- Line chart with react-native-chart-kit.
- Month picker modal.
- Summary cards.
- Category breakdown with colors.

### Phase 11 ✅ — Polish & Navigation
- Remove Profile tab, move profile to HomeStack.
- Reorder tabs: Home → Scan → History.
- Logo in History header.
- Functional calendar filter.
- Fix all non-functional buttons.

### Phase 12 ✅ — OCR Flow (LLM Integration)
- Build real ScanScreen with camera/gallery option modal.
- Expo image picker integration.
- Backend OCR via Tesseract.js → raw text.
- LLM-based item parsing via Groq AI API (Llama 3.3 70B).
- Item review screen with edit/delete/add capabilities.
- Batch save multiple transactions from one receipt.
- Image upload to Supabase Storage.

### Phase 13 ❌ — Portfolio Polish
- UI cleanup.
- Demo data.
- README.
- Screenshots.
- Demo video.

## 17. Mobile Service Layer

### Structure

```
src/services/
├── api.js              ← API client (base URL, token, headers, error handling)
├── authService.js      ← login(), register()
└── transactionService.js ← getAll, getById, create, update, deleteById, scanReceipt
```

### Current Implementation

All services call real backend via `apiRequest()` helper:
- Token auto-attached from SecureStore.
- Content-Type auto-set (`application/json` or skips for FormData).
- Error response parsed and thrown as Error.
- Data automatically mapped snake_case ↔ camelCase.

### Method Signatures (unchanged from mock phase)

```js
transactionService.getAll()              // GET /api/transactions → array
transactionService.getById(id)           // GET /api/transactions/:id → object or null
transactionService.create(data)          // POST /api/transactions → created object
transactionService.update(id, data)      // PUT /api/transactions/:id → updated object
transactionService.deleteById(id)        // DELETE /api/transactions/:id → true
transactionService.scanReceipt(image)    // POST /api/receipts/scan → OCR result
```

## 18. Validation Rules

### Transaction Form
- `type` is required (income/expense).
- `title` is required.
- `amount` is required.
- `amount` must be a positive number.
- `category` is required (auto-set for income).
- `transactionDate` is required.
- `note` is optional.

### Auth Form
- `email` required + valid email format.
- `password` required, min 6 characters.
- `name` required (register only).

### Backend Validation
- User must be authenticated for private data.
- User can only access their own transactions.
- Amount must be numeric.
- Transaction date must be valid.
- Uploaded receipt must be JPEG, PNG, or WebP (max 5MB).

## 19. Error Handling

### Mobile
- API errors: show message from backend via Alert.
- Network errors: show retry option.
- Prevent crash when transaction ID is missing.
- Prevent invalid form submission with field-level validation.

### Backend
- Return 400 for validation errors.
- Return 401 for unauthenticated users.
- Return 404 for missing resource.
- Return 500 for unexpected errors.
- All errors return `{ success: false, message, errors }` format.

## 20. Risks and Mitigations

| Risk | Mitigation |
|------|-----------|
| Expo Go SDK compatibility | Use SDK 54 for this project. |
| Dependency conflict | Use `--legacy-peer-deps` or pinned versions. |
| Windows permission issues | Store in safe folder (avoid Documents/Desktop). |
| Backend not ready | Service layer switches easily; mock data still works. |
| OCR inaccurate | OCR pre-fills only; user confirms before save. |
| AI agent loses context | Maintain AGENTS.md + PRD.md as source of truth. |

## 21. Definition of Done

A feature is considered done when:
- It runs in Expo Go without red error screen.
- It follows existing folder structure.
- It uses constants/services instead of hard-coded logic.
- It handles loading/empty/error states where relevant.
- It works with mock data and can switch to real API.
- Income transactions display in green, expenses in red.
- The code is readable for a beginner developer.

## 22. Testing Checklist

### Mobile
- [x] App opens without error.
- [x] Login/register works.
- [x] Token persists across app restarts.
- [x] Logout clears session.
- [x] Home dashboard loads with income/expense/balance.
- [x] Category breakdown shows correct data.
- [x] Latest transactions render.
- [x] Add income transaction works (green, Pemasukan category).
- [x] Add expense transaction works (category picker).
- [x] Form validation: empty fields, invalid amount.
- [x] Transaction list shows filtered by month.
- [x] Month filter changes data.
- [x] Search filters correctly.
- [x] Category chips filter correctly.
- [x] Transaction detail shows type badge (+/- sign).
- [x] Edit transaction preserves type.
- [x] Delete transaction with confirmation.
- [x] Report screen: chart renders, summary accurate.
- [x] Report month picker works.
- [x] Profile screen: user info + logout.
- [x] Avatar navigates to Profile.
- [x] Laporan button navigates to Report.
- [x] Bottom tabs: Home→Scan→History.
- [x] Loading skeletons appear.
- [x] Empty state shows when no data.
- [x] Network error shows retry option.

### Backend
- [x] Register/login works.
- [x] JWT returned and verified.
- [x] Create transaction (with type field).
- [x] Get transaction list (filtered by user).
- [x] Get transaction by ID.
- [x] Update transaction.
- [x] Delete transaction.
- [x] API returns `{ success, message, data }` format.

## 23. Future Enhancements
- Receipt scan with OCR (ScanScreen + backend integration).
- Image picker for receipt upload.
- OCR confirmation screen with pre-filled form.
- Year-over-year comparison.
- Budget limit per category.
- Export to CSV/PDF.
- Push notifications.
- Multi-device sync.
- Dark mode.
- Better OCR parsing with category detection.

## 24. Next Recommended Task for Orang A

All core MVPs are completed. The next practical task is **Phase 13 — Portfolio Polish**:

1. Create `README.md` with project overview, tech stack, screenshots, and setup guide.
2. Add Splash Screen (`expo-splash-screen`) with SpendScan logo.
3. Custom App Icon (replace default Expo icon).
4. Final end-to-end testing of all features.
5. Record demo video.
6. (Optional) Deploy backend to Railway/Render for 24/7 access.
