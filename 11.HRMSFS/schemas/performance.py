"""
Schemas for performance_reviews, performance_goals,
performance_feedback, kpis, employee_kpis.
"""

from datetime import date, datetime
from typing import Optional
from pydantic import BaseModel


# ── Performance Reviews ──────────────────────────────────────────────────────

class PerformanceReviewCreate(BaseModel):
    emp_id: int
    reviewer_id: Optional[int] = None
    period_start: date
    period_end: date
    overall_rating: Optional[float] = None
    status: Optional[str] = "draft"
    comments: Optional[str] = None


class PerformanceReviewUpdate(BaseModel):
    emp_id: Optional[int] = None
    reviewer_id: Optional[int] = None
    period_start: Optional[date] = None
    period_end: Optional[date] = None
    overall_rating: Optional[float] = None
    status: Optional[str] = None
    comments: Optional[str] = None


class PerformanceReviewOut(PerformanceReviewCreate):
    review_id: int
    created_at: Optional[datetime] = None

    class Config:
        from_attributes = True


# ── Performance Goals ────────────────────────────────────────────────────────

class PerformanceGoalCreate(BaseModel):
    emp_id: int
    title: str
    target_date: Optional[date] = None
    progress_percentage: Optional[float] = 0
    status: Optional[str] = "active"


class PerformanceGoalUpdate(BaseModel):
    emp_id: Optional[int] = None
    title: Optional[str] = None
    target_date: Optional[date] = None
    progress_percentage: Optional[float] = None
    status: Optional[str] = None


class PerformanceGoalOut(PerformanceGoalCreate):
    goal_id: int
    created_at: Optional[datetime] = None

    class Config:
        from_attributes = True


# ── Performance Feedback ────────────────────────────────────────────────────

class PerformanceFeedbackCreate(BaseModel):
    emp_id: int
    giver_id: Optional[int] = None
    feedback_text: str
    feedback_date: date
    is_anonymous: Optional[bool] = False


class PerformanceFeedbackUpdate(BaseModel):
    emp_id: Optional[int] = None
    giver_id: Optional[int] = None
    feedback_text: Optional[str] = None
    feedback_date: Optional[date] = None
    is_anonymous: Optional[bool] = None


class PerformanceFeedbackOut(PerformanceFeedbackCreate):
    feedback_id: int
    created_at: Optional[datetime] = None

    class Config:
        from_attributes = True


# ── KPIs ─────────────────────────────────────────────────────────────────────

class KPICreate(BaseModel):
    name: str
    description: Optional[str] = None
    department_id: Optional[int] = None
    role_id: Optional[int] = None
    target_value: Optional[float] = None
    unit: Optional[str] = None
    frequency: Optional[str] = "monthly"


class KPIUpdate(BaseModel):
    name: Optional[str] = None
    description: Optional[str] = None
    department_id: Optional[int] = None
    role_id: Optional[int] = None
    target_value: Optional[float] = None
    unit: Optional[str] = None
    frequency: Optional[str] = None


class KPIOut(KPICreate):
    kpi_id: int
    created_at: Optional[datetime] = None

    class Config:
        from_attributes = True


# ── Employee KPIs ────────────────────────────────────────────────────────────

class EmployeeKPICreate(BaseModel):
    emp_id: int
    kpi_id: int
    assigned_date: Optional[date] = None
    due_date: Optional[date] = None
    actual_value: Optional[float] = None
    status: Optional[str] = "pending"
    notes: Optional[str] = None
    reviewed_by: Optional[int] = None
    reviewed_at: Optional[datetime] = None


class EmployeeKPIUpdate(BaseModel):
    emp_id: Optional[int] = None
    kpi_id: Optional[int] = None
    assigned_date: Optional[date] = None
    due_date: Optional[date] = None
    actual_value: Optional[float] = None
    status: Optional[str] = None
    notes: Optional[str] = None
    reviewed_by: Optional[int] = None
    reviewed_at: Optional[datetime] = None


class EmployeeKPIOut(EmployeeKPICreate):
    emp_kpi_id: int
    created_at: Optional[datetime] = None

    class Config:
        from_attributes = True
