"""
Routes for disciplinary_actions.
"""

from fastapi import APIRouter, Query
from typing import Optional
from schemas.disciplinary import DisciplinaryActionCreate, DisciplinaryActionUpdate
import crud

router = APIRouter(prefix="/disciplinary-actions", tags=["Disciplinary"])


@router.get("/", summary="List disciplinary actions")
def list_disciplinary_actions(limit: int = 100, offset: int = 0, emp_id: Optional[int] = None):
    filters = {"emp_id": emp_id} if emp_id else None
    return crud.list_records("disciplinary_actions", limit=limit, offset=offset, order_by="action_id", filters=filters)

@router.get("/{action_id}", summary="Get disciplinary action")
def get_disciplinary_action(action_id: int):
    return crud.get_record("disciplinary_actions", "action_id", action_id)

@router.post("/", status_code=201, summary="Create disciplinary action")
def create_disciplinary_action(body: DisciplinaryActionCreate):
    return crud.create_record("disciplinary_actions", body.model_dump())

@router.put("/{action_id}", summary="Update disciplinary action")
def update_disciplinary_action(action_id: int, body: DisciplinaryActionUpdate):
    return crud.update_record("disciplinary_actions", "action_id", action_id, body.model_dump(exclude_unset=True))

@router.delete("/{action_id}", summary="Delete disciplinary action")
def delete_disciplinary_action(action_id: int):
    return crud.delete_record("disciplinary_actions", "action_id", action_id)
