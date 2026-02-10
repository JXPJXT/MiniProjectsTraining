"""
Routes for exit_interviews.
"""

from fastapi import APIRouter, Query
from typing import Optional
from schemas.exit import ExitInterviewCreate, ExitInterviewUpdate
import crud

router = APIRouter(prefix="/exit-interviews", tags=["Exit"])


@router.get("/", summary="List exit interviews")
def list_exit_interviews(limit: int = 100, offset: int = 0, emp_id: Optional[int] = None):
    filters = {"emp_id": emp_id} if emp_id else None
    return crud.list_records("exit_interviews", limit=limit, offset=offset, order_by="interview_id", filters=filters)

@router.get("/{interview_id}", summary="Get exit interview")
def get_exit_interview(interview_id: int):
    return crud.get_record("exit_interviews", "interview_id", interview_id)

@router.post("/", status_code=201, summary="Create exit interview")
def create_exit_interview(body: ExitInterviewCreate):
    return crud.create_record("exit_interviews", body.model_dump())

@router.put("/{interview_id}", summary="Update exit interview")
def update_exit_interview(interview_id: int, body: ExitInterviewUpdate):
    return crud.update_record("exit_interviews", "interview_id", interview_id, body.model_dump(exclude_unset=True))

@router.delete("/{interview_id}", summary="Delete exit interview")
def delete_exit_interview(interview_id: int):
    return crud.delete_record("exit_interviews", "interview_id", interview_id)
