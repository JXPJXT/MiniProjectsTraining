# 🏢 HRMS FastAPI Backend

Full CRUD API for a comprehensive Human Resource Management System, powered by **FastAPI** and **Supabase**.

## 📊 Coverage — 40 Tables

| Domain | Tables |
|---|---|
| **Employees** | `employees`, `employee_positions`, `employee_documents`, `employee_skills` |
| **Organization** | `departments`, `positions`, `grades`, `position_grades` |
| **Attendance** | `shifts`, `attendance_records` |
| **Leave** | `leave_requests`, `leave_balances` |
| **Payroll** | `payroll_runs`, `payroll_payslips`, `payroll_components`, `salary_history`, `allowance_types`, `employee_allowances` |
| **Recruitment** | `candidates`, `job_requisitions`, `job_applications`, `interviews` |
| **Performance** | `performance_reviews`, `performance_goals`, `performance_feedback`, `kpis`, `employee_kpis` |
| **Training** | `training_courses`, `training_enrollments`, `skills` |
| **Benefits** | `benefits`, `employee_benefits` |
| **Assets** | `assets` |
| **Reimbursements** | `reimbursement_types`, `reimbursements` |
| **Notifications** | `notifications`, `notification_preferences` |
| **Disciplinary** | `disciplinary_actions` |
| **Exit** | `exit_interviews` |
| **Audit** | `audit_trail` |

## 🚀 Quick Start

```bash
# Install dependencies
pip install -r requirements.txt

# Run the server
uvicorn main:app --reload
```

Open **http://localhost:8000/docs** for the interactive Swagger UI.

## 🔧 Configuration

Create a `.env` file:

```env
SUPABASE_URL=https://your-project.supabase.co
SUPABASE_KEY=your-api-key
```

## 📁 Project Structure

```
11.HRMSFS/
├── main.py            # FastAPI app entry point
├── config.py          # Loads .env settings
├── database.py        # Supabase client singleton
├── crud.py            # Generic CRUD operations
├── schemas/           # Pydantic models (Create / Update / Out)
│   ├── employees.py
│   ├── departments.py
│   ├── attendance.py
│   ├── leave.py
│   ├── payroll.py
│   ├── recruitment.py
│   ├── performance.py
│   ├── training.py
│   ├── benefits.py
│   ├── assets.py
│   ├── reimbursements.py
│   ├── notifications.py
│   ├── disciplinary.py
│   ├── exit.py
│   └── audit.py
├── routes/            # API route modules
│   └── (mirrors schemas/)
├── requirements.txt
└── .env
```

## 🛠 Tech Stack

- **FastAPI** — high-performance Python web framework
- **Supabase** — PostgreSQL backend-as-a-service
- **Pydantic v2** — data validation
- **Uvicorn** — ASGI server
