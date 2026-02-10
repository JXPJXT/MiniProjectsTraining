"""
Routes for leave_requests and leave_balances.
"""

from fastapi import APIRouter, Query
from typing import Optional
from schemas.leave import (
    LeaveRequestCreate, LeaveRequestUpdate, LeaveRequestOut,
    LeaveBalanceCreate, LeaveBalanceUpdate, LeaveBalanceOut,
)
import crud

router = APIRouter(tags=["Leave Management"])


# ── Leave Requests ───────────────────────────────────────────────────────────

@router.get("/leave-requests", summary="List leave requests")
def list_leave_requests(
    limit: int = 100,
    offset: int = 0,
    emp_id: Optional[int] = None,
    status: Optional[str] = None,
):
    filters = {}
    if emp_id:
        filters["emp_id"] = emp_id
    if status:
        filters["status"] = status
    return crud.list_records("leave_requests", limit=limit, offset=offset, order_by="id", filters=filters or None)


@router.get("/leave-requests/{id}", summary="Get leave request by ID")
def get_leave_request(id: int):
    return crud.get_record("leave_requests", "id", id)


@router.post("/leave-requests", status_code=201, summary="Create leave request")
def create_leave_request(body: LeaveRequestCreate):
    return crud.create_record("leave_requests", body.model_dump())


@router.put("/leave-requests/{id}", summary="Update leave request")
def update_leave_request(id: int, body: LeaveRequestUpdate):
    return crud.update_record("leave_requests", "id", id, body.model_dump(exclude_unset=True))


@router.delete("/leave-requests/{id}", summary="Delete leave request")
def delete_leave_request(id: int):
    return crud.delete_record("leave_requests", "id", id)


# ── Leave Balances ───────────────────────────────────────────────────────────

@router.get("/leave-balances", summary="List leave balances")
def list_leave_balances(
    limit: int = 100,
    offset: int = 0,
    emp_id: Optional[int] = None,
    year: Optional[int] = None,
):
    filters = {}
    if emp_id:
        filters["emp_id"] = emp_id
    if year:
        filters["year"] = year
    return crud.list_records("leave_balances", limit=limit, offset=offset, filters=filters or None)


@router.get("/leave-balances/{id}", summary="Get leave balance by ID")
def get_leave_balance(id: int):
    return crud.get_record("leave_balances", "id", id)


@router.post("/leave-balances", status_code=201, summary="Create leave balance")
def create_leave_balance(body: LeaveBalanceCreate):
    return crud.create_record("leave_balances", body.model_dump())


@router.put("/leave-balances/{id}", summary="Update leave balance")
def update_leave_balance(id: int, body: LeaveBalanceUpdate):
    return crud.update_record("leave_balances", "id", id, body.model_dump(exclude_unset=True))


@router.delete("/leave-balances/{id}", summary="Delete leave balance")
def delete_leave_balance(id: int):
    return crud.delete_record("leave_balances", "id", id)
