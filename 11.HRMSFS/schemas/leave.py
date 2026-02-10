"""
Schemas for leave_requests and leave_balances.
"""

from datetime import date, datetime
from typing import Optional
from pydantic import BaseModel


# ── Leave Requests ───────────────────────────────────────────────────────────

class LeaveRequestCreate(BaseModel):
    emp_id: int
    leave_type: str
    start_date: date
    end_date: date
    days_requested: Optional[float] = None
    status: Optional[str] = "pending"
    approved_by: Optional[int] = None
    approved_date: Optional[date] = None
    remarks: Optional[str] = None


class LeaveRequestUpdate(BaseModel):
    emp_id: Optional[int] = None
    leave_type: Optional[str] = None
    start_date: Optional[date] = None
    end_date: Optional[date] = None
    days_requested: Optional[float] = None
    status: Optional[str] = None
    approved_by: Optional[int] = None
    approved_date: Optional[date] = None
    remarks: Optional[str] = None


class LeaveRequestOut(LeaveRequestCreate):
    id: int
    created_at: Optional[datetime] = None

    class Config:
        from_attributes = True


# ── Leave Balances ───────────────────────────────────────────────────────────

class LeaveBalanceCreate(BaseModel):
    emp_id: int
    leave_type: str
    entitlement: Optional[float] = 0
    accrued: Optional[float] = 0
    used: Optional[float] = 0
    balance: Optional[float] = None
    year: int


class LeaveBalanceUpdate(BaseModel):
    emp_id: Optional[int] = None
    leave_type: Optional[str] = None
    entitlement: Optional[float] = None
    accrued: Optional[float] = None
    used: Optional[float] = None
    balance: Optional[float] = None
    year: Optional[int] = None


class LeaveBalanceOut(LeaveBalanceCreate):
    id: int
    updated_at: Optional[datetime] = None

    class Config:
        from_attributes = True
