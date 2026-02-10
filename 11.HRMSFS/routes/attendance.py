"""
Routes for shifts and attendance_records.
"""

from fastapi import APIRouter, Query
from typing import Optional
from datetime import date
from schemas.attendance import (
    ShiftCreate, ShiftUpdate, ShiftOut,
    AttendanceRecordCreate, AttendanceRecordUpdate, AttendanceRecordOut,
)
import crud

router = APIRouter(tags=["Attendance"])


# ── Shifts ───────────────────────────────────────────────────────────────────

@router.get("/shifts", summary="List shifts")
def list_shifts(limit: int = 100, offset: int = 0):
    return crud.list_records("shifts", limit=limit, offset=offset, order_by="shift_id")


@router.get("/shifts/{shift_id}", summary="Get shift by ID")
def get_shift(shift_id: int):
    return crud.get_record("shifts", "shift_id", shift_id)


@router.post("/shifts", status_code=201, summary="Create shift")
def create_shift(body: ShiftCreate):
    return crud.create_record("shifts", body.model_dump())


@router.put("/shifts/{shift_id}", summary="Update shift")
def update_shift(shift_id: int, body: ShiftUpdate):
    return crud.update_record("shifts", "shift_id", shift_id, body.model_dump(exclude_unset=True))


@router.delete("/shifts/{shift_id}", summary="Delete shift")
def delete_shift(shift_id: int):
    return crud.delete_record("shifts", "shift_id", shift_id)


# ── Attendance Records ───────────────────────────────────────────────────────

@router.get("/attendance", summary="List attendance records")
def list_attendance(
    limit: int = 100,
    offset: int = 0,
    emp_id: Optional[int] = None,
    record_date: Optional[date] = None,
    status: Optional[str] = None,
):
    filters = {}
    if emp_id:
        filters["emp_id"] = emp_id
    if record_date:
        filters["record_date"] = str(record_date)
    if status:
        filters["status"] = status
    return crud.list_records("attendance_records", limit=limit, offset=offset, order_by="record_id", filters=filters or None)


@router.get("/attendance/{record_id}", summary="Get attendance record by ID")
def get_attendance(record_id: int):
    return crud.get_record("attendance_records", "record_id", record_id)


@router.post("/attendance", status_code=201, summary="Create attendance record")
def create_attendance(body: AttendanceRecordCreate):
    return crud.create_record("attendance_records", body.model_dump())


@router.put("/attendance/{record_id}", summary="Update attendance record")
def update_attendance(record_id: int, body: AttendanceRecordUpdate):
    return crud.update_record("attendance_records", "record_id", record_id, body.model_dump(exclude_unset=True))


@router.delete("/attendance/{record_id}", summary="Delete attendance record")
def delete_attendance(record_id: int):
    return crud.delete_record("attendance_records", "record_id", record_id)
