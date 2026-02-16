"""Drive API endpoints — full drive lifecycle."""

from fastapi import APIRouter, Depends, Query, UploadFile, File, Form
from typing import Optional
from app.core.deps import get_current_user, require_roles, CurrentUser
from app.core.storage import upload_file
from app.drives.schemas import (
    DriveCreate, DriveUpdate, RoundCreate, AttendanceRecord,
    DutyLeaveCreate, DutyLeaveReview, SelectionUpdate,
    IndependentOfferCreate, IndependentOfferReview,
)
from app.drives import service
from app.students.service import get_student_by_user_id

router = APIRouter(prefix="/drives", tags=["Placement Drives"])


# ---- Drive CRUD ----

@router.post("/")
async def create_drive(
    data: DriveCreate,
    current_user: CurrentUser = Depends(require_roles(["admin", "super_admin", "tpc"])),
):
    return await service.create_drive(data, current_user.id)


@router.get("/")
async def list_drives(
    limit: int = Query(50, le=200),
    offset: int = Query(0, ge=0),
    status: Optional[str] = None,
    search: Optional[str] = None,
    current_user: CurrentUser = Depends(get_current_user),
):
    drives = await service.list_drives(limit, offset, status, search)
    return {"data": drives, "count": len(drives)}


@router.get("/eligible")
async def eligible_drives(current_user: CurrentUser = Depends(get_current_user)):
    """Get drives I'm eligible for."""
    student = await get_student_by_user_id(current_user.id)
    if not student:
        return {"data": [], "detail": "No student profile"}
    return {"data": await service.get_eligible_drives(student["student_id"])}


@router.get("/{drive_id}")
async def get_drive(drive_id: int, current_user: CurrentUser = Depends(get_current_user)):
    return await service.get_drive(drive_id)


@router.put("/{drive_id}")
async def update_drive(
    drive_id: int, data: DriveUpdate,
    current_user: CurrentUser = Depends(require_roles(["admin", "super_admin", "tpc"])),
):
    return await service.update_drive(drive_id, data, current_user.id)


# ---- Rounds ----

@router.post("/{drive_id}/rounds")
async def add_round(
    drive_id: int, data: RoundCreate,
    current_user: CurrentUser = Depends(require_roles(["admin", "super_admin", "tpc"])),
):
    return await service.add_round(drive_id, data, current_user.id)


@router.get("/{drive_id}/rounds")
async def get_rounds(drive_id: int, current_user: CurrentUser = Depends(get_current_user)):
    return {"data": await service.get_rounds(drive_id)}


# ---- Registration ----

@router.post("/{drive_id}/register")
async def register(drive_id: int, current_user: CurrentUser = Depends(get_current_user)):
    """Register for a drive (student self-registers)."""
    student = await get_student_by_user_id(current_user.id)
    if not student:
        return {"detail": "No student profile found"}
    return await service.register_for_drive(student["student_id"], drive_id, current_user.id)


@router.post("/{drive_id}/cancel")
async def cancel(drive_id: int, current_user: CurrentUser = Depends(get_current_user)):
    """Cancel drive registration."""
    student = await get_student_by_user_id(current_user.id)
    if not student:
        return {"detail": "No student profile found"}
    return await service.cancel_registration(student["student_id"], drive_id, current_user.id)


@router.get("/{drive_id}/students")
async def drive_students(
    drive_id: int,
    current_user: CurrentUser = Depends(require_roles(["admin", "super_admin", "tpc", "faculty"])),
):
    return {"data": await service.get_drive_students(drive_id)}


@router.get("/my/registrations")
async def my_registrations(current_user: CurrentUser = Depends(get_current_user)):
    student = await get_student_by_user_id(current_user.id)
    if not student:
        return {"data": []}
    return {"data": await service.get_student_drives(student["student_id"])}


# ---- Attendance ----

@router.post("/attendance")
async def mark_attendance(
    data: AttendanceRecord,
    current_user: CurrentUser = Depends(require_roles(["admin", "super_admin", "tpc", "faculty"])),
):
    return await service.mark_attendance(data, current_user.id)


@router.get("/{drive_id}/attendance")
async def get_attendance(
    drive_id: int,
    round_id: Optional[int] = None,
    current_user: CurrentUser = Depends(require_roles(["admin", "super_admin", "tpc", "faculty"])),
):
    return {"data": await service.get_attendance(drive_id, round_id)}


# ---- Duty Leave ----

@router.post("/duty-leave")
async def request_duty_leave(
    data: DutyLeaveCreate,
    current_user: CurrentUser = Depends(get_current_user),
):
    student = await get_student_by_user_id(current_user.id)
    if not student:
        return {"detail": "No student profile"}
    return await service.request_duty_leave(student["student_id"], data, current_user.id)


@router.post("/duty-leave/{leave_id}/upload-proof")
async def upload_proof(
    leave_id: int,
    file: UploadFile = File(...),
    current_user: CurrentUser = Depends(get_current_user),
):
    """Upload proof document for duty leave."""
    from app.core.database import get_supabase_admin
    path = await upload_file(file, "duty-leave-proofs")
    db = get_supabase_admin()
    result = db.table("duty_leave_requests").update({"proof_path": path}).eq("id", leave_id).execute()
    return {"file_path": path, "updated": bool(result.data)}


@router.put("/duty-leave/{leave_id}/review")
async def review_duty_leave(
    leave_id: int, data: DutyLeaveReview,
    current_user: CurrentUser = Depends(require_roles(["admin", "super_admin", "tpc", "faculty"])),
):
    return await service.review_duty_leave(leave_id, data, current_user.id)


@router.get("/duty-leave/list")
async def list_duty_leaves(
    student_id: Optional[int] = None,
    drive_id: Optional[int] = None,
    current_user: CurrentUser = Depends(get_current_user),
):
    return {"data": await service.get_duty_leaves(student_id, drive_id)}


# ---- Selections / Outcomes ----

@router.put("/{drive_id}/students/{student_id}/selection")
async def update_selection(
    drive_id: int, student_id: int, data: SelectionUpdate,
    current_user: CurrentUser = Depends(require_roles(["admin", "super_admin", "tpc"])),
):
    return await service.update_selection(student_id, drive_id, data, current_user.id)


@router.post("/{drive_id}/accept-offer")
async def accept_offer(drive_id: int, current_user: CurrentUser = Depends(get_current_user)):
    student = await get_student_by_user_id(current_user.id)
    if not student:
        return {"detail": "No student profile"}
    return await service.accept_offer(student["student_id"], drive_id, current_user.id)


@router.post("/{drive_id}/reject-offer")
async def reject_offer(drive_id: int, current_user: CurrentUser = Depends(get_current_user)):
    student = await get_student_by_user_id(current_user.id)
    if not student:
        return {"detail": "No student profile"}
    return await service.reject_offer(student["student_id"], drive_id, current_user.id)


# ---- Independent Offers ----

@router.post("/independent-offers")
async def submit_independent_offer(
    company_name: str = Form(...),
    stipend: Optional[float] = Form(None),
    ctc: Optional[float] = Form(None),
    duration: Optional[str] = Form(None),
    offer_letter: Optional[UploadFile] = File(None),
    current_user: CurrentUser = Depends(get_current_user),
):
    student = await get_student_by_user_id(current_user.id)
    if not student:
        return {"detail": "No student profile"}
    offer_path = None
    if offer_letter:
        offer_path = await upload_file(offer_letter, "offer-letters")
    data = IndependentOfferCreate(company_name=company_name, stipend=stipend, ctc=ctc, duration=duration)
    return await service.submit_independent_offer(student["student_id"], data, offer_path)


@router.put("/independent-offers/{offer_id}/review")
async def review_independent_offer(
    offer_id: int, data: IndependentOfferReview,
    current_user: CurrentUser = Depends(require_roles(["admin", "super_admin", "tpc"])),
):
    return await service.review_independent_offer(offer_id, data, current_user.id)


@router.get("/independent-offers/list")
async def list_independent_offers(
    student_id: Optional[int] = None,
    current_user: CurrentUser = Depends(get_current_user),
):
    return {"data": await service.get_independent_offers(student_id)}
