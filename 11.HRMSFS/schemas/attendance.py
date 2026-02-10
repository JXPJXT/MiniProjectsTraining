"""
Schemas for attendance_records and shifts.
"""

from datetime import date, datetime, time
from typing import Optional
from pydantic import BaseModel


# ── Shifts ───────────────────────────────────────────────────────────────────

class ShiftCreate(BaseModel):
    name: str
    start_time: Optional[str] = None  # time as HH:MM:SS string
    end_time: Optional[str] = None
    grace_minutes: Optional[int] = 15
    is_active: Optional[bool] = True


class ShiftUpdate(BaseModel):
    name: Optional[str] = None
    start_time: Optional[str] = None
    end_time: Optional[str] = None
    grace_minutes: Optional[int] = None
    is_active: Optional[bool] = None


class ShiftOut(ShiftCreate):
    shift_id: int

    class Config:
        from_attributes = True


# ── Attendance Records ───────────────────────────────────────────────────────

class AttendanceRecordCreate(BaseModel):
    emp_id: int
    record_date: date
    shift_id: Optional[int] = None
    clock_in: Optional[datetime] = None
    clock_out: Optional[datetime] = None
    total_hours: Optional[float] = None
    overtime_hours: Optional[float] = 0
    status: Optional[str] = None
    remarks: Optional[str] = None
    approved: Optional[bool] = False


class AttendanceRecordUpdate(BaseModel):
    emp_id: Optional[int] = None
    record_date: Optional[date] = None
    shift_id: Optional[int] = None
    clock_in: Optional[datetime] = None
    clock_out: Optional[datetime] = None
    total_hours: Optional[float] = None
    overtime_hours: Optional[float] = None
    status: Optional[str] = None
    remarks: Optional[str] = None
    approved: Optional[bool] = None


class AttendanceRecordOut(AttendanceRecordCreate):
    record_id: int
    created_at: Optional[datetime] = None

    class Config:
        from_attributes = True
