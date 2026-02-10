"""
Schemas for exit_interviews.
"""

from datetime import date, datetime
from typing import Optional
from pydantic import BaseModel


class ExitInterviewCreate(BaseModel):
    emp_id: int
    conducted_by: Optional[int] = None
    interview_date: Optional[date] = None
    reason_for_leaving: Optional[str] = None
    feedback: Optional[str] = None
    suggestions: Optional[str] = None
    final_settlement_done: Optional[bool] = False
    clearance_status: Optional[str] = "pending"


class ExitInterviewUpdate(BaseModel):
    emp_id: Optional[int] = None
    conducted_by: Optional[int] = None
    interview_date: Optional[date] = None
    reason_for_leaving: Optional[str] = None
    feedback: Optional[str] = None
    suggestions: Optional[str] = None
    final_settlement_done: Optional[bool] = None
    clearance_status: Optional[str] = None


class ExitInterviewOut(ExitInterviewCreate):
    interview_id: int
    created_at: Optional[datetime] = None

    class Config:
        from_attributes = True
