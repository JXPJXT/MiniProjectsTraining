"""
Schemas for disciplinary_actions.
"""

from datetime import date, datetime
from typing import Optional
from pydantic import BaseModel


class DisciplinaryActionCreate(BaseModel):
    emp_id: int
    issued_by: Optional[int] = None
    issue_date: date
    violation_type: Optional[str] = None
    details: Optional[str] = None
    action_taken: Optional[str] = None
    outcome: Optional[str] = None
    appeal_status: Optional[str] = "none"


class DisciplinaryActionUpdate(BaseModel):
    emp_id: Optional[int] = None
    issued_by: Optional[int] = None
    issue_date: Optional[date] = None
    violation_type: Optional[str] = None
    details: Optional[str] = None
    action_taken: Optional[str] = None
    outcome: Optional[str] = None
    appeal_status: Optional[str] = None


class DisciplinaryActionOut(DisciplinaryActionCreate):
    action_id: int
    created_at: Optional[datetime] = None

    class Config:
        from_attributes = True
