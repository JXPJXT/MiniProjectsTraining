"""
Routes for audit_trail.
"""

from fastapi import APIRouter, Query
from typing import Optional
from schemas.audit import AuditTrailCreate, AuditTrailUpdate
import crud

router = APIRouter(prefix="/audit-trail", tags=["Audit"])


@router.get("/", summary="List audit trail entries")
def list_audit_trail(limit: int = 100, offset: int = 0, table_name: Optional[str] = None, action: Optional[str] = None):
    filters = {}
    if table_name: filters["table_name"] = table_name
    if action: filters["action"] = action
    return crud.list_records("audit_trail", limit=limit, offset=offset, order_by="audit_id", filters=filters or None)

@router.get("/{audit_id}", summary="Get audit trail entry")
def get_audit_trail(audit_id: int):
    return crud.get_record("audit_trail", "audit_id", audit_id)

@router.post("/", status_code=201, summary="Create audit trail entry")
def create_audit_trail(body: AuditTrailCreate):
    return crud.create_record("audit_trail", body.model_dump())

@router.put("/{audit_id}", summary="Update audit trail entry")
def update_audit_trail(audit_id: int, body: AuditTrailUpdate):
    return crud.update_record("audit_trail", "audit_id", audit_id, body.model_dump(exclude_unset=True))

@router.delete("/{audit_id}", summary="Delete audit trail entry")
def delete_audit_trail(audit_id: int):
    return crud.delete_record("audit_trail", "audit_id", audit_id)
