"""
Schemas for departments, positions, grades, position_grades.
"""

from datetime import date, datetime
from typing import Optional
from pydantic import BaseModel


# ── Departments ──────────────────────────────────────────────────────────────

class DepartmentCreate(BaseModel):
    dept_name: str
    parent_dept_id: Optional[int] = None
    manager_emp_id: Optional[int] = None
    location: Optional[str] = None


class DepartmentUpdate(BaseModel):
    dept_name: Optional[str] = None
    parent_dept_id: Optional[int] = None
    manager_emp_id: Optional[int] = None
    location: Optional[str] = None


class DepartmentOut(DepartmentCreate):
    dept_id: int
    created_at: Optional[datetime] = None
    updated_at: Optional[datetime] = None

    class Config:
        from_attributes = True


# ── Positions ────────────────────────────────────────────────────────────────

class PositionCreate(BaseModel):
    title: str
    dept_id: Optional[int] = None
    grade_level: Optional[str] = None
    min_salary: Optional[float] = None
    max_salary: Optional[float] = None
    description: Optional[str] = None
    is_active: Optional[bool] = True


class PositionUpdate(BaseModel):
    title: Optional[str] = None
    dept_id: Optional[int] = None
    grade_level: Optional[str] = None
    min_salary: Optional[float] = None
    max_salary: Optional[float] = None
    description: Optional[str] = None
    is_active: Optional[bool] = None


class PositionOut(PositionCreate):
    position_id: int
    created_at: Optional[datetime] = None

    class Config:
        from_attributes = True


# ── Grades ───────────────────────────────────────────────────────────────────

class GradeCreate(BaseModel):
    code: str
    name: str
    description: Optional[str] = None
    min_salary: Optional[float] = None
    max_salary: Optional[float] = None


class GradeUpdate(BaseModel):
    code: Optional[str] = None
    name: Optional[str] = None
    description: Optional[str] = None
    min_salary: Optional[float] = None
    max_salary: Optional[float] = None


class GradeOut(GradeCreate):
    grade_id: int
    created_at: Optional[datetime] = None

    class Config:
        from_attributes = True


# ── Position Grades ──────────────────────────────────────────────────────────

class PositionGradeCreate(BaseModel):
    position_id: int
    grade_id: int
    effective_from: date
    effective_to: Optional[date] = None
    is_active: Optional[bool] = True


class PositionGradeUpdate(BaseModel):
    position_id: Optional[int] = None
    grade_id: Optional[int] = None
    effective_from: Optional[date] = None
    effective_to: Optional[date] = None
    is_active: Optional[bool] = None


class PositionGradeOut(PositionGradeCreate):
    position_grade_id: int
    created_at: Optional[datetime] = None

    class Config:
        from_attributes = True
