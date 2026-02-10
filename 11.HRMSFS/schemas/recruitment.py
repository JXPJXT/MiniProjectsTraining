"""
Schemas for candidates, job_requisitions, job_applications, interviews.
"""

from datetime import date, datetime
from typing import Optional
from pydantic import BaseModel


# ── Candidates ───────────────────────────────────────────────────────────────

class CandidateCreate(BaseModel):
    first_name: str
    last_name: str
    email: Optional[str] = None
    phone: Optional[str] = None
    resume_url: Optional[str] = None
    source: Optional[str] = None
    status: Optional[str] = "new"


class CandidateUpdate(BaseModel):
    first_name: Optional[str] = None
    last_name: Optional[str] = None
    email: Optional[str] = None
    phone: Optional[str] = None
    resume_url: Optional[str] = None
    source: Optional[str] = None
    status: Optional[str] = None


class CandidateOut(CandidateCreate):
    candidate_id: int
    created_at: Optional[datetime] = None

    class Config:
        from_attributes = True


# ── Job Requisitions ─────────────────────────────────────────────────────────

class JobRequisitionCreate(BaseModel):
    position_id: Optional[int] = None
    dept_id: Optional[int] = None
    title: str
    openings: Optional[int] = 1
    posted_date: Optional[date] = None
    closing_date: Optional[date] = None
    status: Optional[str] = "open"
    created_by: Optional[int] = None


class JobRequisitionUpdate(BaseModel):
    position_id: Optional[int] = None
    dept_id: Optional[int] = None
    title: Optional[str] = None
    openings: Optional[int] = None
    posted_date: Optional[date] = None
    closing_date: Optional[date] = None
    status: Optional[str] = None
    created_by: Optional[int] = None


class JobRequisitionOut(JobRequisitionCreate):
    requisition_id: int
    created_at: Optional[datetime] = None

    class Config:
        from_attributes = True


# ── Job Applications ────────────────────────────────────────────────────────

class JobApplicationCreate(BaseModel):
    requisition_id: int
    candidate_id: int
    applied_date: date
    current_stage: Optional[str] = None
    score: Optional[float] = None


class JobApplicationUpdate(BaseModel):
    requisition_id: Optional[int] = None
    candidate_id: Optional[int] = None
    applied_date: Optional[date] = None
    current_stage: Optional[str] = None
    score: Optional[float] = None


class JobApplicationOut(JobApplicationCreate):
    application_id: int
    created_at: Optional[datetime] = None

    class Config:
        from_attributes = True


# ── Interviews ───────────────────────────────────────────────────────────────

class InterviewCreate(BaseModel):
    application_id: int
    interviewer_id: Optional[int] = None
    scheduled_at: datetime
    status: Optional[str] = "scheduled"
    feedback: Optional[str] = None
    rating: Optional[float] = None


class InterviewUpdate(BaseModel):
    application_id: Optional[int] = None
    interviewer_id: Optional[int] = None
    scheduled_at: Optional[datetime] = None
    status: Optional[str] = None
    feedback: Optional[str] = None
    rating: Optional[float] = None


class InterviewOut(InterviewCreate):
    interview_id: int
    created_at: Optional[datetime] = None

    class Config:
        from_attributes = True
