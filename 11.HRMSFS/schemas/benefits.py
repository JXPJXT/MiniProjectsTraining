"""
Schemas for benefits and employee_benefits.
"""

from datetime import date, datetime
from typing import Optional
from pydantic import BaseModel


# ── Benefits ─────────────────────────────────────────────────────────────────

class BenefitCreate(BaseModel):
    name: str
    category: Optional[str] = None
    description: Optional[str] = None
    employer_contrib: Optional[float] = None
    employee_contrib: Optional[float] = None
    coverage_limit: Optional[float] = None
    is_active: Optional[bool] = True


class BenefitUpdate(BaseModel):
    name: Optional[str] = None
    category: Optional[str] = None
    description: Optional[str] = None
    employer_contrib: Optional[float] = None
    employee_contrib: Optional[float] = None
    coverage_limit: Optional[float] = None
    is_active: Optional[bool] = None


class BenefitOut(BenefitCreate):
    benefit_id: int

    class Config:
        from_attributes = True


# ── Employee Benefits ────────────────────────────────────────────────────────

class EmployeeBenefitCreate(BaseModel):
    emp_id: int
    benefit_id: int
    enrollment_date: date
    end_date: Optional[date] = None
    policy_number: Optional[str] = None
    coverage_amount: Optional[float] = None
    insurer_name: Optional[str] = None


class EmployeeBenefitUpdate(BaseModel):
    emp_id: Optional[int] = None
    benefit_id: Optional[int] = None
    enrollment_date: Optional[date] = None
    end_date: Optional[date] = None
    policy_number: Optional[str] = None
    coverage_amount: Optional[float] = None
    insurer_name: Optional[str] = None


class EmployeeBenefitOut(EmployeeBenefitCreate):
    emp_benefit_id: int
    created_at: Optional[datetime] = None

    class Config:
        from_attributes = True
