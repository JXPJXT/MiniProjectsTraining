"""
Routes for candidates, job_requisitions, job_applications, interviews.
"""

from fastapi import APIRouter, Query
from typing import Optional
from schemas.recruitment import (
    CandidateCreate, CandidateUpdate, CandidateOut,
    JobRequisitionCreate, JobRequisitionUpdate, JobRequisitionOut,
    JobApplicationCreate, JobApplicationUpdate, JobApplicationOut,
    InterviewCreate, InterviewUpdate, InterviewOut,
)
import crud

router = APIRouter(tags=["Recruitment"])


# ── Candidates ───────────────────────────────────────────────────────────────

@router.get("/candidates", summary="List candidates")
def list_candidates(limit: int = 100, offset: int = 0, status: Optional[str] = None):
    filters = {"status": status} if status else None
    return crud.list_records("candidates", limit=limit, offset=offset, order_by="candidate_id", filters=filters)


@router.get("/candidates/{candidate_id}", summary="Get candidate by ID")
def get_candidate(candidate_id: int):
    return crud.get_record("candidates", "candidate_id", candidate_id)


@router.post("/candidates", status_code=201, summary="Create candidate")
def create_candidate(body: CandidateCreate):
    return crud.create_record("candidates", body.model_dump())


@router.put("/candidates/{candidate_id}", summary="Update candidate")
def update_candidate(candidate_id: int, body: CandidateUpdate):
    return crud.update_record("candidates", "candidate_id", candidate_id, body.model_dump(exclude_unset=True))


@router.delete("/candidates/{candidate_id}", summary="Delete candidate")
def delete_candidate(candidate_id: int):
    return crud.delete_record("candidates", "candidate_id", candidate_id)


# ── Job Requisitions ─────────────────────────────────────────────────────────

@router.get("/job-requisitions", summary="List job requisitions")
def list_job_requisitions(limit: int = 100, offset: int = 0, status: Optional[str] = None, dept_id: Optional[int] = None):
    filters = {}
    if status:
        filters["status"] = status
    if dept_id:
        filters["dept_id"] = dept_id
    return crud.list_records("job_requisitions", limit=limit, offset=offset, order_by="requisition_id", filters=filters or None)


@router.get("/job-requisitions/{requisition_id}", summary="Get job requisition by ID")
def get_job_requisition(requisition_id: int):
    return crud.get_record("job_requisitions", "requisition_id", requisition_id)


@router.post("/job-requisitions", status_code=201, summary="Create job requisition")
def create_job_requisition(body: JobRequisitionCreate):
    return crud.create_record("job_requisitions", body.model_dump())


@router.put("/job-requisitions/{requisition_id}", summary="Update job requisition")
def update_job_requisition(requisition_id: int, body: JobRequisitionUpdate):
    return crud.update_record("job_requisitions", "requisition_id", requisition_id, body.model_dump(exclude_unset=True))


@router.delete("/job-requisitions/{requisition_id}", summary="Delete job requisition")
def delete_job_requisition(requisition_id: int):
    return crud.delete_record("job_requisitions", "requisition_id", requisition_id)


# ── Job Applications ────────────────────────────────────────────────────────

@router.get("/job-applications", summary="List job applications")
def list_job_applications(limit: int = 100, offset: int = 0, requisition_id: Optional[int] = None, candidate_id: Optional[int] = None):
    filters = {}
    if requisition_id:
        filters["requisition_id"] = requisition_id
    if candidate_id:
        filters["candidate_id"] = candidate_id
    return crud.list_records("job_applications", limit=limit, offset=offset, order_by="application_id", filters=filters or None)


@router.get("/job-applications/{application_id}", summary="Get job application by ID")
def get_job_application(application_id: int):
    return crud.get_record("job_applications", "application_id", application_id)


@router.post("/job-applications", status_code=201, summary="Create job application")
def create_job_application(body: JobApplicationCreate):
    return crud.create_record("job_applications", body.model_dump())


@router.put("/job-applications/{application_id}", summary="Update job application")
def update_job_application(application_id: int, body: JobApplicationUpdate):
    return crud.update_record("job_applications", "application_id", application_id, body.model_dump(exclude_unset=True))


@router.delete("/job-applications/{application_id}", summary="Delete job application")
def delete_job_application(application_id: int):
    return crud.delete_record("job_applications", "application_id", application_id)


# ── Interviews ───────────────────────────────────────────────────────────────

@router.get("/interviews", summary="List interviews")
def list_interviews(limit: int = 100, offset: int = 0, application_id: Optional[int] = None, status: Optional[str] = None):
    filters = {}
    if application_id:
        filters["application_id"] = application_id
    if status:
        filters["status"] = status
    return crud.list_records("interviews", limit=limit, offset=offset, order_by="interview_id", filters=filters or None)


@router.get("/interviews/{interview_id}", summary="Get interview by ID")
def get_interview(interview_id: int):
    return crud.get_record("interviews", "interview_id", interview_id)


@router.post("/interviews", status_code=201, summary="Create interview")
def create_interview(body: InterviewCreate):
    return crud.create_record("interviews", body.model_dump())


@router.put("/interviews/{interview_id}", summary="Update interview")
def update_interview(interview_id: int, body: InterviewUpdate):
    return crud.update_record("interviews", "interview_id", interview_id, body.model_dump(exclude_unset=True))


@router.delete("/interviews/{interview_id}", summary="Delete interview")
def delete_interview(interview_id: int):
    return crud.delete_record("interviews", "interview_id", interview_id)
