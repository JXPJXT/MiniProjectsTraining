"""Document API endpoints."""

from fastapi import APIRouter, Depends, UploadFile, File, Form, Query
from app.core.deps import get_current_user, require_roles, CurrentUser
from app.documents import service
from app.documents.schemas import DocumentVerifyRequest
from app.students.service import get_student_by_user_id

router = APIRouter(prefix="/documents", tags=["Documents"])


@router.post("/upload")
async def upload_document(
    document_type: str = Form(...),
    file: UploadFile = File(...),
    current_user: CurrentUser = Depends(get_current_user),
):
    """Upload a document (student uploads resume/ID etc.)."""
    student = await get_student_by_user_id(current_user.id)
    if not student:
        return {"detail": "No student profile"}
    return await service.upload_document(student["student_id"], document_type, file, current_user.id)


@router.get("/my")
async def my_documents(current_user: CurrentUser = Depends(get_current_user)):
    """Get all my documents."""
    student = await get_student_by_user_id(current_user.id)
    if not student:
        return {"data": []}
    return {"data": await service.get_documents(student["student_id"])}


@router.get("/{doc_id}")
async def get_document(doc_id: int, current_user: CurrentUser = Depends(get_current_user)):
    return await service.get_document(doc_id)


@router.get("/{doc_id}/url")
async def get_document_url(doc_id: int, current_user: CurrentUser = Depends(get_current_user)):
    url = await service.get_document_url(doc_id)
    return {"url": url}


@router.put("/{doc_id}/verify")
async def verify_document(
    doc_id: int, data: DocumentVerifyRequest,
    current_user: CurrentUser = Depends(require_roles(["admin", "super_admin", "tpc"])),
):
    return await service.verify_document(doc_id, data, current_user.id)


@router.post("/{doc_id}/reupload")
async def reupload_document(
    doc_id: int,
    file: UploadFile = File(...),
    current_user: CurrentUser = Depends(get_current_user),
):
    """Re-upload a rejected document."""
    return await service.reupload_document(doc_id, file, current_user.id)


@router.get("/pending/verifications")
async def pending_verifications(
    limit: int = Query(50, le=200),
    current_user: CurrentUser = Depends(require_roles(["admin", "super_admin", "tpc"])),
):
    return {"data": await service.get_pending_verifications(limit)}


@router.get("/student/{student_id}")
async def student_documents(
    student_id: int,
    current_user: CurrentUser = Depends(require_roles(["admin", "super_admin", "tpc", "faculty"])),
):
    return {"data": await service.get_documents(student_id)}
