"""
HRMS FastAPI Backend
────────────────────
Full CRUD API for 40 Supabase tables covering the entire
Human Resource Management System.

Run with:
    uvicorn main:app --reload
"""

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from routes import (
    employees,
    departments,
    attendance,
    leave,
    payroll,
    recruitment,
    performance,
    training,
    benefits,
    assets,
    reimbursements,
    notifications,
    disciplinary,
    exit as exit_routes,
    audit,
)

app = FastAPI(
    title="HRMS API",
    description=(
        "Comprehensive Human Resource Management System API.\n\n"
        "Covers **40 tables** across these domains:\n"
        "- 👤 Employees & Organization Structure\n"
        "- 🕐 Attendance & Shifts\n"
        "- 🏖️ Leave Management\n"
        "- 💰 Payroll, Salary & Allowances\n"
        "- 📋 Recruitment Pipeline\n"
        "- 📊 Performance, KPIs & Goals\n"
        "- 🎓 Training & Skills\n"
        "- 🏥 Benefits\n"
        "- 🖥️ Assets\n"
        "- 💸 Reimbursements\n"
        "- 🔔 Notifications\n"
        "- ⚖️ Disciplinary Actions\n"
        "- 🚪 Exit Interviews\n"
        "- 📜 Audit Trail"
    ),
    version="1.0.0",
)

# ── CORS (allow all for local dev) ──────────────────────────
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# ── Register routers ────────────────────────────────────────
app.include_router(employees.router)
app.include_router(departments.router)
app.include_router(attendance.router)
app.include_router(leave.router)
app.include_router(payroll.router)
app.include_router(recruitment.router)
app.include_router(performance.router)
app.include_router(training.router)
app.include_router(benefits.router)
app.include_router(assets.router)
app.include_router(reimbursements.router)
app.include_router(notifications.router)
app.include_router(disciplinary.router)
app.include_router(exit_routes.router)
app.include_router(audit.router)


@app.get("/", tags=["Health"])
def root():
    return {
        "service": "HRMS API",
        "version": "1.0.0",
        "docs": "/docs",
        "tables_covered": 40,
    }


@app.get("/health", tags=["Health"])
def health_check():
    """Quick connectivity check — pings Supabase."""
    from database import get_client
    try:
        with get_client() as client:
            resp = client.get("/employees", params={"select": "emp_id", "limit": "1"})
        return {"status": "healthy", "database": "connected", "http_status": resp.status_code}
    except Exception as e:
        return {"status": "unhealthy", "database": str(e)}
