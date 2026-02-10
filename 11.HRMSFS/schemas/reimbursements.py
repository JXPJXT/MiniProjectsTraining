"""
Schemas for reimbursement_types and reimbursements.
"""

from datetime import date, datetime
from typing import Optional
from pydantic import BaseModel


# ── Reimbursement Types ──────────────────────────────────────────────────────

class ReimbursementTypeCreate(BaseModel):
    name: str
    description: Optional[str] = None
    max_amount: Optional[float] = None
    requires_receipt: Optional[bool] = True
    is_active: Optional[bool] = True


class ReimbursementTypeUpdate(BaseModel):
    name: Optional[str] = None
    description: Optional[str] = None
    max_amount: Optional[float] = None
    requires_receipt: Optional[bool] = None
    is_active: Optional[bool] = None


class ReimbursementTypeOut(ReimbursementTypeCreate):
    type_id: int

    class Config:
        from_attributes = True


# ── Reimbursements ───────────────────────────────────────────────────────────

class ReimbursementCreate(BaseModel):
    emp_id: int
    type_id: int
    amount_requested: float
    amount_approved: Optional[float] = None
    currency: Optional[str] = "INR"
    expense_date: date
    purpose: Optional[str] = None
    receipt_url: Optional[str] = None
    approved_by: Optional[int] = None
    approved_at: Optional[datetime] = None
    status: Optional[str] = "submitted"
    remarks: Optional[str] = None


class ReimbursementUpdate(BaseModel):
    emp_id: Optional[int] = None
    type_id: Optional[int] = None
    amount_requested: Optional[float] = None
    amount_approved: Optional[float] = None
    currency: Optional[str] = None
    expense_date: Optional[date] = None
    purpose: Optional[str] = None
    receipt_url: Optional[str] = None
    approved_by: Optional[int] = None
    approved_at: Optional[datetime] = None
    status: Optional[str] = None
    remarks: Optional[str] = None


class ReimbursementOut(ReimbursementCreate):
    claim_id: int
    submitted_at: Optional[datetime] = None

    class Config:
        from_attributes = True
