"""
Routes for benefits and employee_benefits.
"""

from fastapi import APIRouter, Query
from typing import Optional
from schemas.benefits import (
    BenefitCreate, BenefitUpdate, BenefitOut,
    EmployeeBenefitCreate, EmployeeBenefitUpdate, EmployeeBenefitOut,
)
import crud

router = APIRouter(tags=["Benefits"])


# ── Benefits ─────────────────────────────────────────────────────────────────

@router.get("/benefits", summary="List benefits")
def list_benefits(limit: int = 100, offset: int = 0, category: Optional[str] = None):
    filters = {"category": category} if category else None
    return crud.list_records("benefits", limit=limit, offset=offset, order_by="benefit_id", filters=filters)


@router.get("/benefits/{benefit_id}", summary="Get benefit by ID")
def get_benefit(benefit_id: int):
    return crud.get_record("benefits", "benefit_id", benefit_id)


@router.post("/benefits", status_code=201, summary="Create benefit")
def create_benefit(body: BenefitCreate):
    return crud.create_record("benefits", body.model_dump())


@router.put("/benefits/{benefit_id}", summary="Update benefit")
def update_benefit(benefit_id: int, body: BenefitUpdate):
    return crud.update_record("benefits", "benefit_id", benefit_id, body.model_dump(exclude_unset=True))


@router.delete("/benefits/{benefit_id}", summary="Delete benefit")
def delete_benefit(benefit_id: int):
    return crud.delete_record("benefits", "benefit_id", benefit_id)


# ── Employee Benefits ────────────────────────────────────────────────────────

@router.get("/employee-benefits", summary="List employee benefits")
def list_employee_benefits(limit: int = 100, offset: int = 0, emp_id: Optional[int] = None):
    filters = {"emp_id": emp_id} if emp_id else None
    return crud.list_records("employee_benefits", limit=limit, offset=offset, order_by="emp_benefit_id", filters=filters)


@router.get("/employee-benefits/{emp_benefit_id}", summary="Get employee benefit by ID")
def get_employee_benefit(emp_benefit_id: int):
    return crud.get_record("employee_benefits", "emp_benefit_id", emp_benefit_id)


@router.post("/employee-benefits", status_code=201, summary="Create employee benefit enrollment")
def create_employee_benefit(body: EmployeeBenefitCreate):
    return crud.create_record("employee_benefits", body.model_dump())


@router.put("/employee-benefits/{emp_benefit_id}", summary="Update employee benefit")
def update_employee_benefit(emp_benefit_id: int, body: EmployeeBenefitUpdate):
    return crud.update_record("employee_benefits", "emp_benefit_id", emp_benefit_id, body.model_dump(exclude_unset=True))


@router.delete("/employee-benefits/{emp_benefit_id}", summary="Delete employee benefit")
def delete_employee_benefit(emp_benefit_id: int):
    return crud.delete_record("employee_benefits", "emp_benefit_id", emp_benefit_id)
