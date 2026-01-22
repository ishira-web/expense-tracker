# 💰 Expense Tracker | Admin & User Wallet System
![CodeRabbit Pull Request Reviews](https://img.shields.io/coderabbit/prs/github/ishira-web/expense-tracker?utm_source=oss&utm_medium=github&utm_campaign=ishira-web%2Fexpense-tracker&labelColor=171717&color=FF570A&link=https%3A%2F%2Fcoderabbit.ai&label=CodeRabbit+Reviews)

A full-stack, enterprise-grade Expense Tracking application featuring a dual-role dashboard system (Admin/HR and User), real-time wallet balance management, social-style profile management, and secure transaction logging.

### Deployment on Render

To deploy this application on Render, follow these steps:

#### 1. Backend (Server)
- **Environment**: Node
- **Root Directory**: `server`
- **Build Command**: `npm install` (The `postinstall` script will automatically run `npm run build`)
- **Start Command**: `npm start`
- **Environment Variables**: Add all variables from `server/.env`.

#### 2. Frontend (Client)
- **Environment**: Static Site (or Web Service if preferred)
- **Root Directory**: `client`
- **Build Command**: `npm install && npm run build`
- **Publish Directory**: `out` (if static) or `.next` (if Web Service)
- **Environment Variables**: Add `NEXT_PUBLIC_API_URL` pointing to your backend URL.

> [!IMPORTANT]
> Ensure you set the `Root Directory` correctly for both services if deploying from this monorepo.

---

### Key Features Summary

### 👤 User Dashboard
- **Real-time Wallet**: View your current balance and total amount deposited by the company.
- **Log Expenses**: Add expenses with date, category, amount, and payment method mapping.
- **Visual Proofs**: Upload image proofs for every transaction (stored securely in Cloudinary).
- **Personal Profile**: Update name and view activity status.
- **Persistent Session**: Stay logged in even after page refreshes.

### 🛡 Admin/HR Dashboard
- **User Management**: Create new users and manage existing accounts.
- **Wallet Funding**: Deposit money directly into user wallets with automated email notifications.
- **Global Overview**: View a consolidated "Pool Balance" reflecting all liquid funds in the system.
- **Audit Trails**: Filter expenses by user to audit individual spending habits and recovery amounts.

## 🛠 Tech Stack

### Frontend
- **Framework**: Next.js 16 (App Router)
- **State Management**: Zustand (with Persistence middleware)
- **Styling**: Tailwind CSS & Shadcn UI
- **Notifications**: Sonner

### Backend
- **Core**: Node.js & Express 5 (TypeScript)
- **Database**: MongoDB (via Mongoose)
- **Auth**: JWT (Access & Session tokens)
- **Services**: Cloudinary (Image storage), Sendinblue/Brevo (SMTP Email)

---

## 🏗 Project Structure

```text
.
├── client/              # Next.js Frontend
│   ├── app/             # Application Routes
│   ├── components/      # Shared UI Components
│   └── store/           # Zustand Auth Store
├── server/              # Express Backend
│   ├── src/
│   │   ├── auth/        # JWT & Route Protection
│   │   ├── controllers/ # Business Logic
│   │   ├── models/      # Mongoose Schemas
│   │   └── route/       # API Endpoints
└── README.md
```

## ⚙️ Installation & Setup

### 1. Clone the repository
```bash
git clone https://github.com/ishira-web/expense-tracker.git
cd expense-tracker
```

### 2. Server Configuration
Create a `.env` file in the `server/` directory:
```env
PORT=5000
MONGODB_URI=your_mongodb_connection_string
SECRET_KEY=your_jwt_access_secret
SESSION_SECRET_KEY=your_jwt_session_secret
CLOUDINARY_CLOUD_NAME=your_cloud_name
CLOUDINARY_API_KEY=your_api_key
CLOUDINARY_API_SECRET=your_api_secret
SENDINBLUE_API_KEY=your_brevo_key
SENDER_EMAIL=your_email@example.com
```
Run the server:
```bash
cd server
npm install
npm run dev
```

### 3. Client Configuration
Create a `.env` file in the `client/` directory:
```env
NEXT_PUBLIC_API_URL=http://localhost:5000/api
```
Run the client:
```bash
cd client
npm install
npm run dev
```

## 🔐 Security Note
- **No Secrets in Git**: The repository is protected by `.gitignore`. Never commit `.env` files.
- **Push Protection**: GitHub Push Protection is active to prevent accidental secret leakage.

---

Built with ❤️ by [Ishira Pahasara](https://github.com/ishira-web)
