# 🎓 LPU Placement Portal

> Lovely Professional University — Campus Placement Management System

A full-stack placement management portal built for LPU with role-based dashboards, drive management, student profiles, documents, messaging, and real-time notifications.

---

## 🏗 Architecture

```
┌──────────────────────────────────────────────────────────┐
│  Frontend (Next.js 14 + TypeScript)                      │
│  Port: 3000                                              │
│  ├── Login / Register (JWT auth)                         │
│  ├── Role-based Sidebar Navigation                       │
│  ├── Dark / Light Theme Toggle                           │
│  └── Role-specific Dashboards                            │
├──────────────────────────────────────────────────────────┤
│  Backend API (FastAPI + Python)                          │
│  Port: 8000                                              │
│  ├── JWT Authentication (access + refresh tokens)        │
│  ├── RBAC (Role-Based Access Control)                    │
│  ├── 10 API Modules under /api/v1/                       │
│  └── Supabase Client (DB + Storage)                      │
├──────────────────────────────────────────────────────────┤
│  Database (Supabase PostgreSQL)                          │
│  ├── 15+ tables with ENUMs, FKs, indexes                 │
│  ├── pgcrypto for password hashing                       │
│  └── Row Level Security (optional)                       │
├──────────────────────────────────────────────────────────┤
│  File Storage (Supabase Storage)                         │
│  └── Resumes, certificates, offer letters                │
└──────────────────────────────────────────────────────────┘
```

---

## 🔑 Login Credentials (Seeded)

| Email              | Password      | Role    |
|--------------------|---------------|---------|
| `japjot@lpu.in`    | `japjot123`   | student |
| `aarav@lpu.in`     | `aarav123`    | student |
| `priya@lpu.in`     | `priya123`    | student |
| `admin@lpu.in`     | `admin123`    | admin   |
| `tpc@lpu.in`       | `tpc123`      | tpc     |
| `faculty@lpu.in`   | `faculty123`  | faculty |
| `sam@gmail.com`    | `sam123`      | admin   |

---

## 📦 Modules & Features

### Backend API Modules (`/api/v1/`)

| Module           | Prefix             | Description |
|------------------|--------------------|-------------|
| **Auth**         | `/auth`            | Register, Login, Refresh, `/me` endpoint |
| **Students**     | `/students`        | CRUD, contacts, family, skills, preferences, completeness |
| **Placements**   | `/placements`      | Placement profiles, policy acceptance, eligibility check |
| **Drives**       | `/drives`          | Drive CRUD, rounds, registration, attendance, duty leave, selections, independent offers |
| **Documents**    | `/documents`       | Upload to Supabase Storage, verification workflow |
| **Notifications**| `/notifications`   | In-app notifications, unread count, mark read |
| **Messaging**    | `/messages`        | DMs, threads, conversations, broadcast |
| **Users**        | `/users`           | User list, stats, role update, delete |
| **Admin**        | `/admin`           | Dashboard stats, placement reports |
| **Audit**        | `/audit`           | Audit trail logs |

### Frontend Pages

| Page               | Path                         | Roles                | Description |
|--------------------|------------------------------|----------------------|-------------|
| Login / Register   | `/login`                     | Public               | Email + password auth |
| Dashboard          | `/dashboard`                 | All                  | Role-specific dashboard |
| Profile            | `/dashboard/profile`         | Student              | Personal info, contacts, family |
| Placement Profile  | `/dashboard/placement-profile`| Student             | Policy, PEP fee, status |
| Browse Drives      | `/dashboard/drives`          | All                  | View/manage drives |
| My Registrations   | `/dashboard/my-drives`       | Student              | Drive registrations |
| Documents          | `/dashboard/documents`       | All                  | Upload/verify docs |
| Offers             | `/dashboard/offers`          | Student, TPC         | Accept/reject offers |
| Messages           | `/dashboard/messages`        | All                  | Chat, new conversation, broadcast |
| Notifications      | `/dashboard/notifications`   | All                  | Notification center |
| Students           | `/dashboard/students`        | Admin, TPC, Faculty  | Student list |
| Users              | `/dashboard/users`           | Admin                | User management |
| Analytics          | `/dashboard/analytics`       | Admin, TPC           | Placement reports |
| Audit Logs         | `/dashboard/audit`           | Admin                | Activity trail |
| Settings           | `/dashboard/settings`        | Super Admin          | System settings |

---

## 🛠 Tech Stack

### Frontend
- **Framework**: Next.js 14 (App Router)
- **Language**: TypeScript
- **Styling**: Vanilla CSS with CSS variables (dark/light theme)
- **HTTP Client**: Axios with JWT interceptors
- **Icons**: react-icons (Heroicons set)
- **Font**: Inter (Google Fonts)

### Backend
- **Framework**: FastAPI (Python)
- **Auth**: JWT (python-jose) + bcrypt password hashing
- **Database Client**: supabase-py
- **Validation**: Pydantic v2
- **Server**: Uvicorn with hot-reload
- **Storage**: Supabase Storage (signed URLs)

### Database
- **Provider**: Supabase (PostgreSQL)
- **Schema**: 15+ tables, ENUM types, FK constraints, indexes
- **Auth**: Self-hosted (passwords in `users` table, bcrypt via pgcrypto)
- **Storage**: Supabase Storage buckets

### Key Libraries
```
# Backend (requirements.txt)
fastapi>=0.104.0        # API framework
uvicorn>=0.24.0         # ASGI server
supabase>=2.0.0         # Supabase client
python-jose[cryptography]  # JWT tokens
bcrypt>=4.0.0           # Password hashing
pydantic[email]>=2.0.0  # Validation
python-multipart        # File uploads
python-dotenv           # Environment vars

# Frontend (package.json)
next                    # React framework
typescript              # Type safety
axios                   # HTTP client
react-icons             # Icon library
```

---

## 🚀 Quick Start

### 1. Database Setup
```sql
-- Run in Supabase SQL Editor:
-- 1. First run: supabase_schema.sql (creates tables)
-- 2. Then run: insert_data.sql (seeds data + creates users with passwords)
```

### 2. Backend
```bash
cd backend
python -m venv venv
./venv/Scripts/activate    # Windows
pip install -r requirements.txt
# Edit .env with your Supabase credentials
uvicorn app.main:app --reload
# → http://localhost:8000/docs
```

### 3. Frontend
```bash
cd frontend
npm install
# Edit .env.local → NEXT_PUBLIC_API_URL=http://localhost:8000/api/v1
npm run dev
# → http://localhost:3000
```

---

## 🔒 Security

- **Passwords**: bcrypt-hashed, stored in `users.password_hash`
- **Auth**: JWT access + refresh tokens, auto-refresh on 401
- **RBAC**: Server-side role enforcement on every endpoint
- **Storage**: Signed URLs for document access (time-limited)
- **API**: No `password_hash` returned in user list responses

---

## 📁 Project Structure

```
12.UMS/
├── backend/
│   ├── app/
│   │   ├── admin/          # Dashboard stats, reports
│   │   ├── audit/          # Activity logging
│   │   ├── auth/           # Register, login, JWT
│   │   ├── core/           # Config, DB, security, deps
│   │   ├── documents/      # File upload, verification
│   │   ├── drives/         # Placement drives, rounds
│   │   ├── messaging/      # DMs, broadcast
│   │   ├── notifications/  # In-app notifications
│   │   ├── placements/     # Profiles, eligibility
│   │   ├── students/       # Student CRUD + sub-resources
│   │   ├── users/          # User management
│   │   └── main.py         # FastAPI app entry point
│   ├── .env                # Environment variables
│   └── requirements.txt    # Python dependencies
├── frontend/
│   ├── src/
│   │   ├── app/
│   │   │   ├── dashboard/  # All dashboard sub-pages
│   │   │   ├── login/      # Login/register page
│   │   │   ├── globals.css # Design system
│   │   │   ├── layout.tsx  # Root layout
│   │   │   └── page.tsx    # Root redirect
│   │   ├── components/     # Sidebar
│   │   ├── context/        # AuthContext (JWT + user state)
│   │   └── lib/            # API client (axios)
│   └── .env.local          # Frontend env
├── supabase_schema.sql     # Database DDL
├── insert_data.sql         # Seed data (users + students + drives)
└── README.md               # This file
```

---

## 📊 Seeded Data Summary

| Data               | Count |
|--------------------|-------|
| Users (with login) | 12    |
| Students           | 8     |
| Placement Drives   | 14    |
| Drive Rounds       | 23    |
| Registrations      | 33    |
| Skills             | 22    |
| Preferences        | 7     |
| Duty Leaves        | 5     |
| Independent Offers | 4     |
| Notifications      | 10    |
| Messages           | 10    |
| Audit Logs         | 9     |

---

## 📧 Email/SMTP

SMTP is configured in `.env` (Gmail) but currently only used for future password reset flows. All current notifications are **in-app** (stored in the `notifications` table). To test email:
- The backend has `EMAIL_USERNAME`, `EMAIL_PASSWORD`, `EMAIL_SERVER`, `EMAIL_PORT` in `.env`
- Not wired to any endpoint yet — can be extended for drive reminders, offer alerts, etc.

---

*Built with ❤️ for Lovely Professional University*
