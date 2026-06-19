# PRD.md — SpendScan

## 1. Product Overview

**Product Name:** SpendScan  
**Product Type:** Smart receipt expense tracker mobile app  
**Platform:** Mobile App, Android-first for development/testing using Expo Go  
**Primary User:** Individual users who want to track daily expenses manually or by scanning receipts.

SpendScan is a mobile expense tracker that helps users record, view, edit, and manage daily spending. The MVP focuses on manual expense tracking first, then expands to receipt scanning using OCR. The project is built collaboratively: Orang A handles the mobile app, while Orang B handles backend, database, storage, and OCR.

## 2. Background

Many people forget small daily expenses such as food, transport, snacks, bills, and online purchases. Manual note-taking is often inconsistent, while receipts are easy to lose. SpendScan solves this by providing a simple mobile app where users can quickly add expenses manually and later scan receipts so the app can extract spending information automatically.

## 3. Goals

### Product Goals
- Help users record expenses quickly.
- Show monthly spending summary.
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
- Advanced budgeting system.
- AI-based financial advice.
- Multi-currency support.
- Complex analytics dashboard.
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
- Expo Vector Icons
- date-fns

### Backend
- Node.js
- Express.js
- Supabase/PostgreSQL
- Supabase Storage
- Tesseract.js

## 7. Core User Flow

### Manual Expense Flow
1. User opens SpendScan.
2. User sees dashboard with monthly total and latest transactions.
3. User taps **Tambah Transaksi**.
4. User fills title, amount, category, date, and optional note.
5. User saves transaction.
6. App returns to dashboard/list.
7. Monthly summary and transaction list update.

### Transaction Detail Flow
1. User opens transaction list or recent transactions.
2. User taps one transaction.
3. App opens detail screen.
4. User can view transaction data.
5. User can edit or delete transaction.

### Receipt Scan Flow
1. User taps scan/upload receipt option.
2. User chooses image from gallery or camera.
3. Mobile sends image to backend.
4. Backend uploads image to Supabase Storage.
5. Backend runs OCR with Tesseract.js.
6. Backend returns extracted raw text and parsed candidate fields.
7. Mobile pre-fills transaction form.
8. User reviews and corrects data.
9. User saves transaction.

## 8. MVP Scope

### Included in MVP
- Home dashboard.
- Monthly total spending summary.
- Latest transactions preview.
- Add transaction manually.
- Transaction list.
- Transaction detail.
- Edit transaction.
- Delete transaction.
- Mock data service layer.
- API-ready service structure.
- Basic receipt image picker UI.
- OCR integration planning/API contract.

### Phase 2 Scope
- Real authentication.
- Real API integration.
- Receipt image upload.
- OCR processing.
- Parsed OCR confirmation screen.
- Category/date filters.
- Better statistics.

## 9. Functional Requirements

### FR-001 — Home Dashboard
**Description:** User can see summary of spending for the current month and latest transactions.

**Requirements:**
- Show monthly total amount.
- Show transaction count.
- Show latest 5 transactions.
- Show empty state if no transaction exists.
- Provide button to add transaction.
- Tapping transaction opens detail screen.

**Acceptance Criteria:**
- User can open Home screen without error.
- Total spending is calculated from available transactions.
- Latest transactions are sorted by `createdAt` descending.
- Empty state appears when transaction list is empty.

### FR-002 — Add Manual Transaction
**Description:** User can manually add an expense.

**Fields:**
- Title, required.
- Amount, required, positive number.
- Category, required.
- Transaction date, required.
- Note, optional.
- Receipt image, optional/future.

**Acceptance Criteria:**
- App validates required fields.
- Amount must be numeric and greater than 0.
- New transaction appears in list/dashboard after saving.
- Transaction source is set to `manual`.

### FR-003 — Transaction List
**Description:** User can view all transactions.

**Requirements:**
- Display all transactions sorted by newest first.
- Show title, category, date, and amount.
- Tapping a transaction opens detail screen.
- Show empty state when no data exists.

**Acceptance Criteria:**
- List renders all available transactions.
- Sorting is newest-first.
- Navigation to detail works.

### FR-004 — Transaction Detail
**Description:** User can view one transaction in detail.

**Requirements:**
- Show title.
- Show amount.
- Show category.
- Show date.
- Show note if available.
- Show source: manual or OCR.
- Show receipt image if available.
- Provide edit action.
- Provide delete action.

**Acceptance Criteria:**
- Correct transaction is loaded by ID.
- Missing note/receipt is handled gracefully.
- Edit button navigates to edit form.
- Delete action asks for confirmation.

### FR-005 — Edit Transaction
**Description:** User can update an existing transaction.

**Requirements:**
- Form is pre-filled with existing data.
- User can modify title, amount, category, date, note.
- Save updates transaction.
- Updated data is visible in detail/list/dashboard.

**Acceptance Criteria:**
- Existing data loads correctly.
- Validation rules still apply.
- `updatedAt` is updated.

### FR-006 — Delete Transaction
**Description:** User can delete an expense record.

**Requirements:**
- Delete action must show confirmation.
- Confirming delete removes transaction.
- Cancelling delete keeps transaction.

**Acceptance Criteria:**
- Transaction disappears from list/dashboard after deletion.
- App does not delete accidentally without confirmation.

### FR-007 — Receipt Image Picker
**Description:** User can choose receipt image from gallery or camera for future OCR flow.

**Requirements:**
- App can open image picker.
- Selected image preview can be displayed.
- Image can later be sent to backend.

**Acceptance Criteria:**
- User can choose image without app crash.
- App handles cancelled image selection.
- Image URI is stored temporarily in form state.

### FR-008 — OCR Processing
**Description:** Backend extracts text from receipt image.

**Requirements:**
- Backend receives image.
- Backend uploads image to Supabase Storage.
- Backend runs Tesseract.js OCR.
- Backend returns raw OCR text.
- Backend optionally returns parsed fields: merchant/title, amount, date, category candidate.

**Acceptance Criteria:**
- Backend returns OCR result in predictable JSON.
- Mobile can display raw OCR text or use parsed fields to pre-fill form.
- User can correct OCR result before saving.

### FR-009 — Backend API Integration
**Description:** Mobile app integrates real backend after mock flow works.

**Requirements:**
- Replace mock methods in `transactionService.js` with HTTP calls.
- Do not rewrite screen logic.
- Use consistent JSON response shape.
- Handle loading and error states.

**Acceptance Criteria:**
- Mobile screens still work after service layer switches to real API.
- Failed API requests show useful messages.
- API methods match agreed contract.

## 10. Data Model

### Transaction Object

```js
{
  id: 'string',
  userId: 'string',
  title: 'string',
  amount: 25000,
  category: 'Food & Drink',
  transactionDate: 'YYYY-MM-DD',
  note: 'string | null',
  receiptImageUrl: 'string | null',
  rawOcrText: 'string | null',
  source: 'manual | ocr',
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

### Receipt/OCR Result Object

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

## 11. Database Schema Recommendation

### `users`

| Field | Type | Notes |
|---|---|---|
| id | uuid | Primary key |
| name | text | User display name |
| email | text | Unique |
| password_hash | text | If backend handles auth manually |
| created_at | timestamp | Auto timestamp |

### `transactions`

| Field | Type | Notes |
|---|---|---|
| id | uuid | Primary key |
| user_id | uuid | Foreign key to users |
| title | text | Required |
| amount | numeric | Required, > 0 |
| category | text | Required |
| transaction_date | date | Required |
| note | text | Optional |
| receipt_image_url | text | Optional |
| raw_ocr_text | text | Optional |
| source | text | `manual` or `ocr` |
| created_at | timestamp | Auto timestamp |
| updated_at | timestamp | Auto timestamp |

## 12. API Contract Recommendation

### Response Format

Success:

```json
{
  "success": true,
  "message": "OK",
  "data": {}
}
```

Error:

```json
{
  "success": false,
  "message": "Validation failed",
  "errors": []
}
```

### Auth Endpoints

```text
POST /auth/register
POST /auth/login
```

Login response should include token/session data if backend handles auth directly.

### Transaction Endpoints

```text
GET /transactions
GET /transactions/:id
POST /transactions
PUT /transactions/:id
DELETE /transactions/:id
```

### Create Transaction Request

```json
{
  "title": "Makan Siang",
  "amount": 25000,
  "category": "Food & Drink",
  "transactionDate": "2026-06-15",
  "note": "Nasi ayam",
  "receiptImageUrl": null,
  "rawOcrText": null,
  "source": "manual"
}
```

### OCR Endpoint

```text
POST /receipts/scan
Content-Type: multipart/form-data
```

Expected response:

```json
{
  "success": true,
  "message": "OCR completed",
  "data": {
    "imageUrl": "https://...",
    "rawText": "OCR text here",
    "parsed": {
      "title": "Indomaret",
      "amount": 30500,
      "transactionDate": "2026-06-14",
      "category": "Shopping"
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
- Loading state.
- Empty state.
- Error state.
- Success feedback where relevant.

### Accessibility/Usability
- Buttons should be easy to tap.
- Text should be readable.
- Amount should be formatted as Indonesian Rupiah.
- Destructive actions like delete should require confirmation.

## 14. Navigation Structure

Use Bottom Tab + Native Stack.

### Bottom Tabs
- Home
- Transaksi

### Home Stack
- Home
- AddTransaction
- TransactionDetail

### Transaction Stack
- TransactionList
- TransactionDetail
- EditTransaction

## 15. Recommended File Structure

```text
src/
├── screens/
│   ├── HomeScreen.jsx
│   ├── TransactionListScreen.jsx
│   ├── TransactionDetailScreen.jsx
│   ├── AddTransactionScreen.jsx
│   └── EditTransactionScreen.jsx
├── components/
│   ├── TransactionCard.jsx
│   ├── CategoryBadge.jsx
│   └── EmptyState.jsx
├── navigation/
│   └── AppNavigator.jsx
├── services/
│   └── transactionService.js
├── data/
│   └── mockTransactions.js
├── constants/
│   ├── colors.js
│   └── categories.js
└── utils/
    └── formatCurrency.js
```

## 16. Development Roadmap

### Phase 1 — Setup Project
- Create Expo project.
- Use SDK 54.
- Confirm app runs in Expo Go.
- Install dependencies.
- Create folder structure.

### Phase 2 — Base Files
- Create `colors.js`.
- Create `categories.js`.
- Create `formatCurrency.js`.
- Create `mockTransactions.js`.
- Create `transactionService.js`.

### Phase 3 — Navigation
- Create `AppNavigator.jsx`.
- Configure Bottom Tabs.
- Configure Stack navigation.
- Update `App.js`.

### Phase 4 — Home Screen
- Monthly summary card.
- Add transaction button.
- Recent transactions list.
- Empty/loading states.

### Phase 5 — Add Transaction Screen
- Form fields.
- Category picker.
- Date input.
- Validation.
- Save to mock service.

### Phase 6 — List and Detail Screens
- Full transaction list.
- Detail view.
- Navigation by transaction ID.

### Phase 7 — Edit and Delete
- Edit form.
- Update service method.
- Delete confirmation.

### Phase 8 — Backend Integration
- Replace mock data with API calls.
- Add auth token handling.
- Add loading/error handling for network requests.

### Phase 9 — Receipt Scan/OCR
- Add image picker UI.
- Upload image to backend.
- Display OCR results.
- Pre-fill transaction form.
- Save corrected data.

### Phase 10 — Polish and Portfolio
- UI cleanup.
- Demo data.
- README.
- Screenshots.
- Short demo video.

## 17. Mobile Service Layer Plan

During mock phase:

```js
transactionService.getAll()
transactionService.getById(id)
transactionService.create(data)
transactionService.update(id, data)
transactionService.delete(id)
```

During API phase:

```js
transactionService.getAll()       // GET /transactions
transactionService.getById(id)    // GET /transactions/:id
transactionService.create(data)   // POST /transactions
transactionService.update(id,data)// PUT /transactions/:id
transactionService.delete(id)     // DELETE /transactions/:id
transactionService.scanReceipt()  // POST /receipts/scan
```

Important: Screens should not need major changes when switching from mock data to real API.

## 18. Validation Rules

### Transaction Form
- `title` is required.
- `amount` is required.
- `amount` must be a positive number.
- `category` is required.
- `transactionDate` is required.
- `note` is optional.
- `receiptImageUrl` is optional.

### Backend Validation
- User must be authenticated for private transaction data.
- User can only access their own transactions.
- Amount must be stored as numeric value.
- Transaction date must be valid date format.
- Uploaded receipt image must be image file type.

## 19. Error Handling Requirements

### Mobile
- Show message when API/network request fails.
- Prevent crash when transaction ID is missing.
- Prevent crash when receipt image is missing.
- Prevent invalid form submission.

### Backend
- Return 400 for validation errors.
- Return 401 for unauthenticated users.
- Return 403 for forbidden access.
- Return 404 for missing transaction.
- Return 500 for unexpected server errors.

## 20. Risks and Mitigations

### Risk: Expo Go SDK compatibility issue
**Mitigation:** Use SDK 54 for this project unless there is a clear reason to upgrade.

### Risk: Dependency conflict / ERESOLVE
**Mitigation:** Use `--legacy-peer-deps` or pinned versions confirmed compatible with SDK 54.

### Risk: Windows permission issues
**Mitigation:** Store project in `C:\Users\HP\Projects\SpendScan`, not in protected folders.

### Risk: Backend not ready
**Mitigation:** Continue mobile development using mock data and service layer.

### Risk: OCR result is inaccurate
**Mitigation:** OCR should pre-fill fields only; user must confirm/edit before saving.

### Risk: AI coding agent hallucinates project context
**Mitigation:** Maintain `AGENTS.md` and `docs/PRD.md` as project context and source of truth.

## 21. Definition of Done

A feature is considered done when:
- It runs in Expo Go without red error screen.
- It follows existing folder structure.
- It uses constants/services instead of hard-coded repeated logic.
- It handles loading/empty/error states where relevant.
- It works with mock data.
- It can later be connected to API through service layer.
- The code is readable for a beginner developer.

## 22. Testing Checklist

### Mobile Manual Test
- App opens successfully.
- Home screen loads.
- Monthly total appears.
- Latest transactions appear.
- Add transaction works.
- Added transaction appears in list.
- Transaction detail opens.
- Edit transaction works.
- Delete transaction works with confirmation.
- Empty state works when no transactions exist.
- Image picker opens and can be cancelled safely.

### Backend Manual Test
- Register/login works.
- Create transaction works.
- Get transaction list works.
- Get detail works.
- Update transaction works.
- Delete transaction works.
- Upload receipt works.
- OCR returns raw text.
- API returns predictable success/error JSON.

## 23. Future Enhancements

- Monthly chart.
- Category-based spending chart.
- Budget limit per category.
- Search transactions.
- Filter by category/date.
- Export to CSV/PDF.
- Push notifications.
- Multi-device sync.
- Better OCR parsing.
- Authentication with Supabase Auth.
- Dark mode.

## 24. Next Recommended Task for Orang A

The next practical task is:

1. Ensure the project is stored in a safe folder, ideally `C:\Users\HP\Projects\SpendScan`.
2. Make sure dependencies are installed and `npx expo start` works.
3. Create folder structure under `src/`.
4. Create base files: colors, categories, formatCurrency, mockTransactions, transactionService.
5. Setup navigation.
6. Build `HomeScreen`.
7. Continue with `AddTransactionScreen`.
