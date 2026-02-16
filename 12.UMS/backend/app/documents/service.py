"""Document management service — upload, verify, reject, re-upload."""

from typing import Optional
from fastapi import HTTPException
from app.core.database import get_supabase_admin
from app.core.storage import upload_file, get_signed_url, delete_file
from app.documents.schemas import DocumentVerifyRequest
from app.audit.service import log_action
from app.notifications.service import create_notification
from datetime import datetime, timezone


async def upload_document(student_id: int, document_type: str, file, uploaded_by: str) -> dict:
    """Upload a document to storage and record in DB."""
    file_path = await upload_file(file, f"documents/{student_id}")
    db = get_supabase_admin()
    payload = {
        "student_id": student_id,
        "document_type": document_type,
        "file_path": file_path,
        "uploaded_by": uploaded_by,
    }
    result = db.table("student_documents").insert(payload).execute()
    if not result.data:
        raise HTTPException(status_code=400, detail="Failed to upload document")

    # Create verification entry
    db.table("document_verifications").insert({
        "document_id": result.data[0]["id"],
    }).execute()

    return result.data[0]


async def get_documents(student_id: int) -> list:
    db = get_supabase_admin()
    result = db.table("student_documents").select("*, document_verifications(*)").eq("student_id", student_id).order("uploaded_at", desc=True).execute()
    return result.data or []


async def get_document(doc_id: int) -> dict:
    db = get_supabase_admin()
    result = db.table("student_documents").select("*, document_verifications(*)").eq("id", doc_id).execute()
    if not result.data:
        raise HTTPException(status_code=404, detail="Document not found")
    return result.data[0]


async def get_document_url(doc_id: int) -> str:
    doc = await get_document(doc_id)
    return get_signed_url(doc["file_path"])


async def verify_document(doc_id: int, data: DocumentVerifyRequest, actor_id: str) -> dict:
    db = get_supabase_admin()
    update_data = data.model_dump(exclude_none=True)
    update_data["verified_by"] = actor_id
    update_data["verified_at"] = datetime.now(timezone.utc).isoformat()

    result = db.table("document_verifications").update(update_data).eq("document_id", doc_id).execute()
    if not result.data:
        raise HTTPException(status_code=404, detail="Verification record not found")

    # Notify student
    doc = await get_document(doc_id)
    student = db.table("students").select("user_id").eq("student_id", doc["student_id"]).execute()
    if student.data and student.data[0].get("user_id"):
        status_text = data.soft_skill_status or data.technical_status or "updated"
        await create_notification(
            student.data[0]["user_id"],
            "document_verification",
            {"message": f"Document '{doc['document_type']}' has been {status_text}", "remarks": data.remarks},
        )

    await log_action(actor_id, "verify_document", "document_verifications", str(doc_id), new_data=update_data)
    return result.data[0]


async def get_pending_verifications(limit: int = 50) -> list:
    db = get_supabase_admin()
    result = db.table("document_verifications").select("*, student_documents(*, students(full_name, reg_no))").or_("soft_skill_status.eq.pending,technical_status.eq.pending").range(0, limit - 1).execute()
    return result.data or []


async def reupload_document(doc_id: int, file, uploaded_by: str) -> dict:
    """Re-upload a rejected document."""
    db = get_supabase_admin()
    old_doc = await get_document(doc_id)

    # Delete old file
    delete_file(old_doc["file_path"])

    # Upload new
    new_path = await upload_file(file, f"documents/{old_doc['student_id']}")

    # Update record
    result = db.table("student_documents").update({
        "file_path": new_path,
        "uploaded_at": datetime.now(timezone.utc).isoformat(),
        "uploaded_by": uploaded_by,
    }).eq("id", doc_id).execute()

    # Reset verification
    db.table("document_verifications").update({
        "soft_skill_status": "pending",
        "technical_status": "pending",
        "remarks": None,
        "verified_by": None,
        "verified_at": None,
    }).eq("document_id", doc_id).execute()

    return result.data[0] if result.data else {}
