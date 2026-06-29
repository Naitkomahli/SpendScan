# SpendScan 🧾

**Smart Receipt Expense Tracker** — A mobile app for recording expenses and income, scanning receipts with AI-powered OCR, and viewing financial reports.

Built with React Native (Expo SDK 54) + Node.js backend + Supabase database + Groq AI for receipt parsing.

---

## ✨ Features

- **💰 Manual Tracking** — Add expenses and income with categories
- **📷 Receipt Scanning** — Take a photo of your receipt, and AI extracts items automatically
- **🧠 AI-Powered Parsing** — Groq Vision (Llama 4 Scout 17B) intelligently identifies items, prices, and dates directly from receipt images
- **📋 Item Review** — Edit, delete, or add items before saving
- **📊 Dashboard** — Monthly income/expense/balance cards with category breakdown
- **📈 Report Screen** — Interactive line chart with daily trends and month picker
- **🔍 Transaction History** — Search, filter by category, filter by month
- **🔐 Authentication** — Register/login/logout with JWT token management
- **☁️ Cloud Storage** — Receipt images stored in Supabase Storage

---

## 🛠 Tech Stack

### Mobile App
| Library | Purpose |
|---------|---------|
| React Native + Expo SDK 54 | Cross-platform mobile framework |
| React Navigation | Tab + Stack navigation |
| @expo/vector-icons | Icon library |
| react-native-chart-kit | Line charts for reports |
| expo-image-picker | Camera & gallery access |
| expo-file-system | File reading for OCR upload |
| expo-secure-store | JWT token storage |
| date-fns | Date formatting |

### Backend
| Library | Purpose |
|---------|---------|
| Node.js + Express (v5) | API server |
| Supabase (PostgreSQL) | Database |
| Supabase Storage | Receipt image storage |
| **Groq Vision (Llama 4 Scout 17B)** | **Direct image-to-JSON receipt parsing** |
| OpenAI SDK | LLM API client (Groq-compatible) |
| jsonwebtoken | JWT authentication |
| bcryptjs | Password hashing |

### Deployment
| Service | Detail |
|---------|--------|
| **Hosting** | Vercel (free Hobby plan) |
| **Production URL** | `https://backend-delta-sand-64.vercel.app` |
| **Deploy command** | `vercel --cwd backend --prod --yes --force` |

---

## 📷 Screenshots

<table>
  <tr>
    <td><img src="docs/screenshots/dashboard.jpg" alt="Dashboard" width="200"/></td>
    <td><img src="docs/screenshots/scan-awal1.jpg" alt="Scan" width="200"/></td>
    <td><img src="docs/screenshots/scan-review1.jpg" alt="Items Review" width="200"/></td>
  </tr>
  <tr>
    <td align="center"><em>Dashboard</em></td>
    <td align="center"><em>Scan Receipt</em></td>
    <td align="center"><em>Item Review</em></td>
  </tr>
  <tr>
    <td><img src="docs/screenshots/report.jpg" alt="Report" width="200"/></td>
    <td><img src="docs/screenshots/history.jpg" alt="History" width="200"/></td>
    <td><img src="docs/screenshots/login-register.jpeg" alt="Login" width="200"/></td>
  </tr>
  <tr>
    <td align="center"><em>Report</em></td>
    <td align="center"><em>Transaction History</em></td>
    <td align="center"><em>Login</em></td>
  </tr>
</table>

> **Note:** Add actual screenshots to `docs/screenshots/` folder.

---

## 🚀 Getting Started

### Prerequisites

- Node.js 18+
- npm or yarn
- Expo Go app on your phone (Android/iOS) — for development
- A Groq API key ([console.groq.com](https://console.groq.com)) — for receipt scanning
- A Supabase project ([supabase.com](https://supabase.com)) — for database & storage
- Vercel CLI — for backend deployment (optional)

### Quick Install (APK)

Download the latest APK directly on your Android phone:

[⬇️ Download SpendScan APK](https://expo.dev/artifacts/eas/EkRE1PMFEeh3E-dSDh5_yK1FJvxegw9H2b4OnVOIEpI.apk)

Or visit: `https://expo.dev/accounts/naitkomahli/projects/SpendScan/builds`

> The APK connects to the production backend at `https://backend-delta-sand-64.vercel.app`. No setup required.

### Run from Source (Development)

```bash
# Clone the repository
git clone https://github.com/Naitkomahli/SpendScan.git
cd SpendScan

# Install mobile dependencies
npm install

# Install backend dependencies
cd backend
npm install
cd ..
```

### Backend Setup

#### Local Development

1. **Create a `.env` file** in `backend/`:

```env
PORT=3000

# Supabase
SUPABASE_URL=your_supabase_url
SUPABASE_ANON_KEY=your_anon_key
SUPABASE_SERVICE_ROLE_KEY=your_service_role_key

# JWT
JWT_SECRET=your_jwt_secret
JWT_EXPIRES_IN=7d

# LLM (Groq — Vision for receipt scanning)
LLM_API_KEY=gsk_your_groq_api_key
LLM_BASE_URL=https://api.groq.com/openai/v1
LLM_MODEL=llama-3.3-70b-versatile
LLM_MODEL_VISION=meta-llama/llama-4-scout-17b-16e-instruct
```

2. **Run database migration** in Supabase SQL Editor:

```sql
ALTER TABLE transactions ADD COLUMN type VARCHAR(10) NOT NULL DEFAULT 'expense'
CHECK (type IN ('income', 'expense'));
```

3. **Start the backend server**:

```bash
cd backend
node src/server.js
```

#### Deploy to Vercel (Production)

```bash
# Install Vercel CLI
npm install -g vercel

# Set environment variables
echo "your_value" | vercel env add SUPABASE_URL production --yes
echo "your_value" | vercel env add SUPABASE_ANON_KEY production --yes
# ... repeat for all env vars (see table below)

# Deploy
vercel --cwd backend --prod --yes --force
```

Production URL: `https://backend-delta-sand-64.vercel.app`

### Run Mobile App (Development)

```bash
# From project root
npx expo start
```

Scan the QR code with Expo Go on your phone. Make sure your phone and laptop are on the same WiFi network.

> ⚠️ **Development:** The app uses the production Vercel backend by default. If you run the backend locally, update `BASE_URL` in `src/services/api.js` to your laptop's IP (e.g., `http://192.168.1.19:3000/api`).

### Build APK (Production)

To build your own APK with EAS Build:

```bash
# Install EAS CLI
npm install -g eas-cli

# Login to Expo
eas login

# Build APK
eas build --platform android --profile preview
```

## 📚 More Info

For a detailed technical explanation (how each feature works, data flow, glossary), see:

➡️ **[docs/TECHNICAL.md](docs/TECHNICAL.md)**

---

## 📁 Project Structure

```
SpendScan/
├── App.js                      # Entry point with ErrorBoundary + AuthProvider
├── app.json                    # Expo config
├── eas.json                    # EAS Build profiles
├── src/
│   ├── components/             # Reusable UI components
│   │   ├── TransactionCard.jsx
│   │   ├── CategoryBadge.jsx
│   │   ├── EmptyState.jsx
│   │   └── Skeleton.jsx        # Shimmer loading placeholders
│   ├── constants/              # App constants
│   │   ├── colors.js
│   │   └── categories.js
│   ├── contexts/
│   │   └── AuthContext.js      # Auth state + SecureStore
│   ├── data/
│   │   └── mockTransactions.js
│   ├── navigation/
│   │   └── AppNavigator.jsx    # Tab + Stack navigation
│   ├── screens/
│   │   ├── HomeScreen.jsx      # Dashboard with income/expense/balance
│   │   ├── AddTransactionScreen.jsx
│   │   ├── EditTransactionScreen.jsx
│   │   ├── TransactionListScreen.jsx
│   │   ├── TransactionDetailScreen.jsx
│   │   ├── LoginScreen.jsx
│   │   ├── ProfileScreen.jsx
│   │   ├── ReportScreen.jsx    # Line chart report
│   │   └── ScanScreen.jsx      # Camera/gallery + AI scan + item review
│   ├── services/
│   │   ├── api.js              # Fetch wrapper (auto-attaches JWT)
│   │   ├── authService.js
│   │   └── transactionService.js
│   └── utils/
│       └── formatCurrency.js
├── backend/
│   ├── .env
│   ├── vercel.json             # Vercel routing config
│   ├── src/
│   │   ├── server.js           # Express listen (local dev)
│   │   ├── app.js              # Express app (Vercel entry via Express preset)
│   │   ├── config/
│   │   │   └── supabase.js
│   │   ├── controllers/
│   │   │   ├── authController.js
│   │   │   ├── transactionController.js
│   │   │   └── receiptController.js
│   │   ├── services/
│   │   │   └── llmParser.js    # Groq Vision receipt parsing
│   │   ├── middleware/
│   │   │   ├── auth.js
│   │   │   └── errorHandler.js
│   │   ├── routes/
│   │   │   ├── auth.js
│   │   │   ├── transactions.js
│   │   │   └── receipts.js
│   │   └── db/
│   │       └── schema.sql
│   └── package.json
├── docs/
│   ├── PRD.md
│   ├── TECHNICAL.md            # Full technical overview
│   ├── AGENTS.md               # AI assistant context
│   └── screenshots/
└── README.md
```

---

## 📡 API Endpoints

| Method | Endpoint | Description | Auth Required |
|--------|----------|-------------|:---:|
| POST | `/api/auth/register` | Register new user | ❌ |
| POST | `/api/auth/login` | Login user | ❌ |
| GET | `/api/transactions` | Get all transactions | ✅ |
| GET | `/api/transactions/:id` | Get transaction by ID | ✅ |
| POST | `/api/transactions` | Create transaction | ✅ |
| PUT | `/api/transactions/:id` | Update transaction | ✅ |
| DELETE | `/api/transactions/:id` | Delete transaction | ✅ |
| POST | `/api/receipts/scan` | Upload & scan receipt | ✅ |

All responses follow `{ success: boolean, message: string, data: any }` format.

---

## 🔐 Environment Variables

### Backend (`backend/.env`)

| Variable | Required | Description |
|----------|:--------:|-------------|
| `PORT` | ❌ | Server port (default: 3000) |
| `SUPABASE_URL` | ✅ | Supabase project URL |
| `SUPABASE_ANON_KEY` | ✅ | Supabase anonymous key |
| `SUPABASE_SERVICE_ROLE_KEY` | ✅ | Supabase service role key |
| `JWT_SECRET` | ✅ | Secret for signing JWT tokens |
| `JWT_EXPIRES_IN` | ❌ | Token expiry (default: 7d) |
| `LLM_API_KEY` | ✅ | Groq API key |
| `LLM_BASE_URL` | ❌ | Groq API base URL (default: `https://api.groq.com/openai/v1`) |
| `LLM_MODEL` | ❌ | Text model for general LLM tasks (default: `llama-3.3-70b-versatile`) |
| `LLM_MODEL_VISION` | ❌ | Vision model for receipt scanning (default: `meta-llama/llama-4-scout-17b-16e-instruct`) |

---

## 🧪 Testing Checklist

- [x] Register, login, logout
- [x] Token persists across app restarts
- [x] Add income & expense transactions
- [x] Dashboard shows income/expense/balance
- [x] Category breakdown with progress bars
- [x] Transaction list with month filter
- [x] Search & category filter
- [x] Edit & delete transactions
- [x] Report screen with line chart
- [x] Scan receipt → AI Vision → item review
- [x] Edit/delete/add items in review screen
- [x] Batch save multiple transactions from one receipt
- [x] Profile screen with user info & logout

---

## ⬇️ Download APK

Download the latest APK directly on your Android phone:

```text
https://expo.dev/artifacts/eas/EkRE1PMFEeh3E-dSDh5_yK1FJvxegw9H2b4OnVOIEpI.apk
```

Or visit: [Expo Builds Dashboard](https://expo.dev/accounts/naitkomahli/projects/SpendScan/builds)

---

## 📄 License

This project is for educational and portfolio purposes.

---

## 👤 Author

**Ilham Oktian Ramadhan** — Mobile App Developer & Project Owner

---

## 🙏 Acknowledgments

- React Native & Expo teams
- Supabase for backend infrastructure
- Groq (Llama 4 Scout) for free vision AI API
- Vercel for free hosting
