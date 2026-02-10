"""
Routes for reimbursement_types and reimbursements.
"""

from fastapi import APIRouter, Query
from typing import Optional
from schemas.reimbursements import (
    ReimbursementTypeCreate, ReimbursementTypeUpdate,
    ReimbursementCreate, ReimbursementUpdate,
)
import crud

router = APIRouter(tags=["Reimbursements"])


@router.get("/reimbursement-types", summary="List reimbursement types")
def list_reimbursement_types(limit: int = 100, offset: int = 0):
    return crud.list_records("reimbursement_types", limit=limit, offset=offset, order_by="type_id")

@router.get("/reimbursement-types/{type_id}", summary="Get reimbursement type")
def get_reimbursement_type(type_id: int):
    return crud.get_record("reimbursement_types", "type_id", type_id)

@router.post("/reimbursement-types", status_code=201, summary="Create reimbursement type")
def create_reimbursement_type(body: ReimbursementTypeCreate):
    return crud.create_record("reimbursement_types", body.model_dump())

@router.put("/reimbursement-types/{type_id}", summary="Update reimbursement type")
def update_reimbursement_type(type_id: int, body: ReimbursementTypeUpdate):
    return crud.update_record("reimbursement_types", "type_id", type_id, body.model_dump(exclude_unset=True))

@router.delete("/reimbursement-types/{type_id}", summary="Delete reimbursement type")
def delete_reimbursement_type(type_id: int):
    return crud.delete_record("reimbursement_types", "type_id", type_id)


@router.get("/reimbursements", summary="List reimbursements")
def list_reimbursements(limit: int = 100, offset: int = 0, emp_id: Optional[int] = None, status: Optional[str] = None):
    filters = {}
    if emp_id: filters["emp_id"] = emp_id
    if status: filters["status"] = status
    return crud.list_records("reimbursements", limit=limit, offset=offset, order_by="claim_id", filters=filters or None)

@router.get("/reimbursements/{claim_id}", summary="Get reimbursement")
def get_reimbursement(claim_id: int):
    return crud.get_record("reimbursements", "claim_id", claim_id)

@router.post("/reimbursements", status_code=201, summary="Create reimbursement")
def create_reimbursement(body: ReimbursementCreate):
    return crud.create_record("reimbursements", body.model_dump())

@router.put("/reimbursements/{claim_id}", summary="Update reimbursement")
def update_reimbursement(claim_id: int, body: ReimbursementUpdate):
    return crud.update_record("reimbursements", "claim_id", claim_id, body.model_dump(exclude_unset=True))

@router.delete("/reimbursements/{claim_id}", summary="Delete reimbursement")
def delete_reimbursement(claim_id: int):
    return crud.delete_record("reimbursements", "claim_id", claim_id)
