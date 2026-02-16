# 🎓 Placement Portal — University Management System

> Enterprise-grade, cloud-native placement management system built with **FastAPI + Supabase** backend and **Next.js** frontend. Role-based access, document workflows, drive management, messaging, and real-time notifications.

---

## 🏗️ Architecture

```
12.UMS/
├── backend/                 # FastAPI + Supabase API server
│   ├── app/
│   │   ├── admin/          # Dashboard & analytics endpoints
│   │   ├── audit/          # Audit logging
│   │   ├── auth/           # Registration, login, JWT tokens
│   │   ├── core/           # Config, database, deps, security, storage
│   │   ├── documents/      # Document upload, verification, signed URLs
│   │   ├── drives/         # Placement drives, rounds, registrations
│   │   ├── messaging/      # DMs, broadcasts, read receipts
│   │   ├── notifications/  # In-app notifications
│   │   ├── placements/     # Placement profiles, eligibility
│   │   ├── students/       # Student CRUD, contacts, skills, preferences
│   │   ├── users/          # User management (admin)
│   │   └── main.py         # FastAPI app entrypoint
│   ├── requirements.txt
│   └── .env.example
├── frontend/                # Next.js 16 + TypeScript
│   ├── src/
│   │   ├── app/
│   │   │   ├── login/             # Auth page
│   │   │   ├── dashboard/         # Protected dashboard
│   │   │   │   ├── analytics/     # Placement reports
│   │   │   │   ├── audit/         # Audit logs (admin)
│   │   │   │   ├── documents/     # Document management
│   │   │   │   ├── drives/        # Placement drives
│   │   │   │   ├── messages/      # Messaging
│   │   │   │   ├── my-drives/     # Student registrations
│   │   │   │   ├── notifications/ # Notifications
│   │   │   │   ├── offers/        # Independent offers
│   │   │   │   ├── placement-profile/ # Placement profile
│   │   │   │   ├── profile/       # Student profile
│   │   │   │   ├── settings/      # System settings
│   │   │   │   ├── students/      # Student listing
│   │   │   │   └── users/         # User management
│   │   │   └── globals.css        # Design system
│   │   ├── components/
│   │   │   └── Sidebar.tsx        # Role-based navigation
│   │   ├── context/
│   │   │   └── AuthContext.tsx     # Auth state management
│   │   └── lib/
│   │       └── api.ts             # API client library
│   └── .env.local
└── supabase_schema.sql      # Database schema
```

## ✨ Features

### 🔐 Authentication & Authorization
- JWT-based auth with access + refresh tokens
- Server-side RBAC (student, faculty, TPC, admin, super_admin)
- Supabase Auth integration with database user table sync
- Auto-refresh on 401 with seamless token rotation

### 👨‍🎓 Student Management
- Full CRUD with contacts, family, skills, preferences
- Profile completeness tracking with section indicators
- Stream and batch filtering

### 🏢 Placement Drives
- Create, list, and manage placement drives
- Student registration and cancellation
- Multi-round drive support with attendance tracking
- Duty leave requests with proof upload and approval workflow
- Selection status with offer accept/reject flow

### 📄 Document Management
- Upload to Supabase Storage (never blobs in DB)
- Verification workflow with approve/reject + remarks
- Re-upload flow for rejected documents
- Secure signed URLs for file access

### 📊 Analytics & Reports
- Admin dashboard with user/drive/document/placement stats
- Placement reports with stream and batch filtering
- Placement rate visualization

### 💬 Messaging
- Direct messages with read receipts
- Conversation threads
- Broadcast messaging to role/stream cohorts
- Unread count tracking

### 🔔 Notifications
- In-app notification system
- Type-based icons and colors
- Mark read/mark all read
- Unread count badges

### 📋 Audit Logging
- All admin actions recorded
- Entity filtering
- Old/new data comparison

## 🎨 Design System

The frontend features a **premium dark-mode design** with:
- **Glassmorphism** effects with backdrop blur
- **Gradient accents** (indigo/emerald palette)
- **Micro-animations** on hover, entry, and interactions
- **Responsive layout** with collapsible sidebar
- **Inter font** for modern typography
- Custom scrollbar styling

## 🚀 Getting Started

### Backend

```bash
cd backend
python -m venv venv
venv\Scripts\activate          # Windows
pip install -r requirements.txt
cp .env.example .env           # Fill in Supabase credentials
uvicorn app.main:app --reload
```

### Frontend

```bash
cd frontend
npm install
cp .env.local.example .env.local  # API URL already set
npm run dev
```

### Database

Execute `supabase_schema.sql` in your Supabase SQL editor to create all tables, enums, and indexes.

## 🗂️ API Endpoints

| Module        | Prefix                    | Description                      |
|---------------|---------------------------|----------------------------------|
| Auth          | `/api/v1/auth`            | Register, login, refresh, me     |
| Students      | `/api/v1/students`        | CRUD, contacts, skills, prefs    |
| Placements    | `/api/v1/placements`      | Profiles, eligibility, policy    |
| Drives        | `/api/v1/drives`          | CRUD, rounds, registration, etc. |
| Documents     | `/api/v1/documents`       | Upload, verify, re-upload        |
| Messages      | `/api/v1/messages`        | Send, conversations, broadcast   |
| Notifications | `/api/v1/notifications`   | List, mark read, unread count    |
| Users         | `/api/v1/users`           | List, role update, delete        |
| Admin         | `/api/v1/admin`           | Dashboard, placement report      |
| Audit         | `/api/v1/audit`           | Audit logs                       |

## 🔧 Tech Stack

| Layer     | Technology                        |
|-----------|-----------------------------------|
| Frontend  | Next.js 16, TypeScript, Vanilla CSS |
| Backend   | FastAPI, Python 3.11+             |
| Database  | Supabase PostgreSQL (with RLS)    |
| Auth      | Supabase Auth + JWT               |
| Storage   | Supabase Storage                  |
| API       | Axios with interceptors           |

## 📜 License

Built for educational purposes as part of the University Management System training project.
