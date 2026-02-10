"""
Schemas for payroll_runs, payroll_payslips, payroll_components,
salary_history, allowance_types, employee_allowances.
"""

from datetime import date, datetime
from typing import Optional
from pydantic import BaseModel


# ── Payroll Runs ─────────────────────────────────────────────────────────────

class PayrollRunCreate(BaseModel):
    period_start: date
    period_end: date
    frequency: Optional[str] = None
    status: Optional[str] = "draft"


class PayrollRunUpdate(BaseModel):
    period_start: Optional[date] = None
    period_end: Optional[date] = None
    frequency: Optional[str] = None
    status: Optional[str] = None
    processed_at: Optional[datetime] = None


class PayrollRunOut(PayrollRunCreate):
    run_id: int
    processed_at: Optional[datetime] = None
    created_at: Optional[datetime] = None

    class Config:
        from_attributes = True


# ── Payroll Payslips ─────────────────────────────────────────────────────────

class PayslipCreate(BaseModel):
    emp_id: int
    run_id: int
    gross_salary: float
    total_deductions: Optional[float] = 0
    net_pay: float
    payment_date: Optional[date] = None
    status: Optional[str] = "generated"
    pdf_url: Optional[str] = None


class PayslipUpdate(BaseModel):
    emp_id: Optional[int] = None
    run_id: Optional[int] = None
    gross_salary: Optional[float] = None
    total_deductions: Optional[float] = None
    net_pay: Optional[float] = None
    payment_date: Optional[date] = None
    status: Optional[str] = None
    pdf_url: Optional[str] = None


class PayslipOut(PayslipCreate):
    payslip_id: int
    created_at: Optional[datetime] = None

    class Config:
        from_attributes = True


# ── Payroll Components ───────────────────────────────────────────────────────

class PayrollComponentCreate(BaseModel):
    payslip_id: int
    name: str
    amount: float
    is_earning: Optional[bool] = True


class PayrollComponentUpdate(BaseModel):
    payslip_id: Optional[int] = None
    name: Optional[str] = None
    amount: Optional[float] = None
    is_earning: Optional[bool] = None


class PayrollComponentOut(PayrollComponentCreate):
    component_id: int

    class Config:
        from_attributes = True


# ── Salary History ───────────────────────────────────────────────────────────

class SalaryHistoryCreate(BaseModel):
    emp_id: int
    amount: float
    effective_date: date
    end_date: Optional[date] = None
    change_reason: Optional[str] = None
    approved_by: Optional[int] = None


class SalaryHistoryUpdate(BaseModel):
    emp_id: Optional[int] = None
    amount: Optional[float] = None
    effective_date: Optional[date] = None
    end_date: Optional[date] = None
    change_reason: Optional[str] = None
    approved_by: Optional[int] = None


class SalaryHistoryOut(SalaryHistoryCreate):
    id: int
    created_at: Optional[datetime] = None

    class Config:
        from_attributes = True


# ── Allowance Types ─────────────────────────────────────────────────────────

class AllowanceTypeCreate(BaseModel):
    name: str
    description: Optional[str] = None
    is_taxable: Optional[bool] = True
    is_fixed: Optional[bool] = True
    calculation_basis: Optional[str] = None


class AllowanceTypeUpdate(BaseModel):
    name: Optional[str] = None
    description: Optional[str] = None
    is_taxable: Optional[bool] = None
    is_fixed: Optional[bool] = None
    calculation_basis: Optional[str] = None


class AllowanceTypeOut(AllowanceTypeCreate):
    allowance_type_id: int
    created_at: Optional[datetime] = None

    class Config:
        from_attributes = True


# ── Employee Allowances ─────────────────────────────────────────────────────

class EmployeeAllowanceCreate(BaseModel):
    emp_id: int
    allowance_type_id: int
    amount: float
    effective_from: date
    effective_to: Optional[date] = None
    frequency: Optional[str] = "monthly"
    is_active: Optional[bool] = True


class EmployeeAllowanceUpdate(BaseModel):
    emp_id: Optional[int] = None
    allowance_type_id: Optional[int] = None
    amount: Optional[float] = None
    effective_from: Optional[date] = None
    effective_to: Optional[date] = None
    frequency: Optional[str] = None
    is_active: Optional[bool] = None


class EmployeeAllowanceOut(EmployeeAllowanceCreate):
    emp_allowance_id: int
    created_at: Optional[datetime] = None

    class Config:
        from_attributes = True
