# 🖥️ HRMS Frontend

> React SPA for the Human Resource Management System — built with **Vite**, **React 19**, and **React Router 7**.

This is the frontend client for the [HRMS FastAPI Backend](../README.md). It provides a premium dashboard UI covering **17 HR modules** with authentication, dark/light theming, and full CRUD operations.

---

## ✨ Features

- **Authentication** — Email/password sign-up & sign-in via AuthContext (JWT-based)
- **Google SSO** — One-click Google OAuth login
- **Dark / Light Theme** — Toggle between modes via ThemeContext
- **17 Module Pages** — Each with data tables, modals, and CRUD forms
- **Reusable Components** — Sidebar, Header, DataTable, Modal, PageDashboard
- **API Client** — Centralized fetch wrapper with proxy support (dev) and full URL (prod)
- **Deployment Ready** — Vercel config included with API rewrites to Render backend

---

## 📦 Modules / Pages

| Page | Route | Description |
|------|-------|-------------|
| Dashboard | `/` | Overview with key HR metrics |
| Employees | `/employees` | Employee directory & CRUD |
| Departments | `/departments` | Department management |
| Attendance | `/attendance` | Attendance records |
| Leave | `/leave` | Leave requests & balances |
| Shifts | `/shifts` | Shift scheduling |
| Payroll | `/payroll` | Payroll runs & payslips |
| Recruitment | `/recruitment` | Candidates, requisitions, interviews |
| Performance | `/performance` | Reviews, goals, KPIs, feedback |
| Training | `/training` | Courses, enrollments, skills |
| Benefits | `/benefits` | Employee benefits management |
| Assets | `/assets` | Asset tracking |
| Reimbursements | `/reimbursements` | Reimbursement types & claims |
| Notifications | `/notifications` | Notification center & preferences |
| Disciplinary | `/disciplinary` | Disciplinary actions |
| Exit | `/exit` | Exit interviews |
| Audit | `/audit` | Audit trail viewer |

---

## 🛠 Tech Stack

| Layer | Technology |
|-------|------------|
| **Framework** | React 19 |
| **Bundler** | Vite 7 |
| **Routing** | React Router DOM 7 |
| **Icons** | Lucide React |
| **Styling** | Vanilla CSS (CSS variables, dark/light themes) |
| **Font** | Inter (Google Fonts) |
| **Deployment** | Vercel |

---

## 🚀 Quick Start

### Prerequisites
- Node.js 18+
- The [HRMS FastAPI backend](../README.md) running on `http://localhost:8000`

### Install & Run

```bash
# Install dependencies
npm install

# Start dev server (proxies /api → backend)
npm run dev
```

Open **http://localhost:5173** in your browser.

### Build for Production

```bash
npm run build
npm run preview
```

---

## 🔧 Configuration

### Environment Variables

Create a `.env` file in this directory:

```env
# Production only — full backend URL (Render, Railway, etc.)
VITE_API_URL=https://hrms-api.onrender.com

# Supabase (for Google SSO)
VITE_SUPABASE_URL=https://your-project.supabase.co
VITE_SUPABASE_ANON_KEY=your-anon-key

# Google OAuth
VITE_GOOGLE_CLIENT_ID=your-google-client-id
```

> In **development**, `VITE_API_URL` can be left unset — Vite's proxy forwards `/api` requests to the backend automatically.

---

## 📁 Project Structure

```
frontend/
├── index.html              # HTML entry point
├── package.json            # Dependencies & scripts
├── vite.config.js          # Vite config (proxy, build)
├── vercel.json             # Vercel rewrites (API → Render)
├── .env                    # Environment variables
└── src/
    ├── main.jsx            # React DOM root + providers
    ├── App.jsx             # Route definitions + auth guard
    ├── index.css           # Global styles (dark/light theme)
    ├── api/
    │   └── client.js       # Fetch wrapper (GET/POST/PUT/PATCH/DELETE)
    ├── contexts/
    │   ├── AuthContext.jsx  # JWT auth state & Google SSO
    │   └── ThemeContext.jsx # Dark/light theme toggle
    ├── components/
    │   ├── Sidebar.jsx      # Navigation sidebar
    │   ├── Header.jsx       # Top header bar
    │   ├── DataTable.jsx    # Reusable data table
    │   ├── Modal.jsx        # Dialog modal
    │   └── PageDashboard.jsx# Dashboard card layout
    └── pages/
        ├── AuthPage.jsx     # Login / Register
        ├── Dashboard.jsx    # Home dashboard
        ├── Employees.jsx    # + 15 more module pages...
        └── ...
```

---

## 🌐 Deployment (Vercel)

The app is configured for **Vercel** deployment:

1. Connect the `frontend/` directory as the root in Vercel
2. Set the environment variables (`VITE_API_URL`, etc.)
3. Vercel uses `vercel.json` to rewrite `/api/*` requests to the Render backend

---

## 🔗 Related

- **Backend**: [`../README.md`](../README.md) — FastAPI + Supabase API (40 tables)
- **Mind Map**: [`../../10.MindMapHRM/README.md`](../../10.MindMapHRM/README.md) — Interactive HRMS schema visualizer

---

*Part of the HRMS Full-Stack project* 🏢
