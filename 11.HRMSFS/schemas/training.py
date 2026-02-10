"""
Schemas for training_courses, training_enrollments, skills.
"""

from datetime import date, datetime
from typing import Optional
from pydantic import BaseModel


# ── Training Courses ─────────────────────────────────────────────────────────

class TrainingCourseCreate(BaseModel):
    title: str
    provider: Optional[str] = None
    duration_hours: Optional[float] = None
    cost: Optional[float] = None
    is_mandatory: Optional[bool] = False


class TrainingCourseUpdate(BaseModel):
    title: Optional[str] = None
    provider: Optional[str] = None
    duration_hours: Optional[float] = None
    cost: Optional[float] = None
    is_mandatory: Optional[bool] = None


class TrainingCourseOut(TrainingCourseCreate):
    course_id: int
    created_at: Optional[datetime] = None

    class Config:
        from_attributes = True


# ── Training Enrollments ────────────────────────────────────────────────────

class TrainingEnrollmentCreate(BaseModel):
    emp_id: int
    course_id: int
    enrolled_date: date
    completion_date: Optional[date] = None
    status: Optional[str] = "enrolled"
    score: Optional[float] = None
    certificate_url: Optional[str] = None


class TrainingEnrollmentUpdate(BaseModel):
    emp_id: Optional[int] = None
    course_id: Optional[int] = None
    enrolled_date: Optional[date] = None
    completion_date: Optional[date] = None
    status: Optional[str] = None
    score: Optional[float] = None
    certificate_url: Optional[str] = None


class TrainingEnrollmentOut(TrainingEnrollmentCreate):
    enrollment_id: int
    created_at: Optional[datetime] = None

    class Config:
        from_attributes = True


# ── Skills ───────────────────────────────────────────────────────────────────

class SkillCreate(BaseModel):
    name: str
    category: Optional[str] = None
    description: Optional[str] = None
    is_certifiable: Optional[bool] = False


class SkillUpdate(BaseModel):
    name: Optional[str] = None
    category: Optional[str] = None
    description: Optional[str] = None
    is_certifiable: Optional[bool] = None


class SkillOut(SkillCreate):
    skill_id: int
    created_at: Optional[datetime] = None

    class Config:
        from_attributes = True
