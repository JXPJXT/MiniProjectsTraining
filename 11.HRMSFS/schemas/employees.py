"""
Schemas for employees, employee_positions, employee_documents, employee_skills.
"""

from datetime import date, datetime
from typing import Optional
from pydantic import BaseModel, EmailStr


# ── Employees ────────────────────────────────────────────────────────────────

class EmployeeCreate(BaseModel):
    employee_code: str
    first_name: str
    last_name: str
    email: str
    phone: Optional[str] = None
    hire_date: date
    termination_date: Optional[date] = None
    status: Optional[str] = "active"
    manager_id: Optional[int] = None
    secondary_manager_id: Optional[int] = None
    dept_id: Optional[int] = None
    position_id: Optional[int] = None
    photo_url: Optional[str] = None


class EmployeeUpdate(BaseModel):
    employee_code: Optional[str] = None
    first_name: Optional[str] = None
    last_name: Optional[str] = None
    email: Optional[str] = None
    phone: Optional[str] = None
    hire_date: Optional[date] = None
    termination_date: Optional[date] = None
    status: Optional[str] = None
    manager_id: Optional[int] = None
    secondary_manager_id: Optional[int] = None
    dept_id: Optional[int] = None
    position_id: Optional[int] = None
    photo_url: Optional[str] = None


class EmployeeOut(EmployeeCreate):
    emp_id: int
    created_at: Optional[datetime] = None
    updated_at: Optional[datetime] = None

    class Config:
        from_attributes = True


# ── Employee Positions ───────────────────────────────────────────────────────

class EmployeePositionCreate(BaseModel):
    emp_id: int
    position_id: int
    dept_id: Optional[int] = None
    manager_id: Optional[int] = None
    secondary_manager_id: Optional[int] = None
    start_date: date
    end_date: Optional[date] = None
    is_current: Optional[bool] = False
    remarks: Optional[str] = None


class EmployeePositionUpdate(BaseModel):
    emp_id: Optional[int] = None
    position_id: Optional[int] = None
    dept_id: Optional[int] = None
    manager_id: Optional[int] = None
    secondary_manager_id: Optional[int] = None
    start_date: Optional[date] = None
    end_date: Optional[date] = None
    is_current: Optional[bool] = None
    remarks: Optional[str] = None


class EmployeePositionOut(EmployeePositionCreate):
    id: int
    created_at: Optional[datetime] = None

    class Config:
        from_attributes = True


# ── Employee Documents ───────────────────────────────────────────────────────

class EmployeeDocumentCreate(BaseModel):
    emp_id: int
    document_type: str
    file_url: str
    original_name: Optional[str] = None
    expiry_date: Optional[date] = None
    verified: Optional[bool] = False


class EmployeeDocumentUpdate(BaseModel):
    emp_id: Optional[int] = None
    document_type: Optional[str] = None
    file_url: Optional[str] = None
    original_name: Optional[str] = None
    expiry_date: Optional[date] = None
    verified: Optional[bool] = None


class EmployeeDocumentOut(EmployeeDocumentCreate):
    doc_id: int
    uploaded_at: Optional[datetime] = None

    class Config:
        from_attributes = True


# ── Employee Skills ──────────────────────────────────────────────────────────

class EmployeeSkillCreate(BaseModel):
    emp_id: int
    skill_id: int
    proficiency_level: Optional[str] = None
    acquired_via: Optional[str] = None
    certified: Optional[bool] = False
    certificate_url: Optional[str] = None
    validity_date: Optional[date] = None


class EmployeeSkillUpdate(BaseModel):
    emp_id: Optional[int] = None
    skill_id: Optional[int] = None
    proficiency_level: Optional[str] = None
    acquired_via: Optional[str] = None
    certified: Optional[bool] = None
    certificate_url: Optional[str] = None
    validity_date: Optional[date] = None


class EmployeeSkillOut(EmployeeSkillCreate):
    emp_skill_id: int
    created_at: Optional[datetime] = None

    class Config:
        from_attributes = True
