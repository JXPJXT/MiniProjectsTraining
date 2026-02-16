"""Drive management service — CRUD, registration, attendance, selections, offers."""

from typing import Optional
from datetime import datetime, timezone
from fastapi import HTTPException
from app.core.database import get_supabase_admin
from app.drives.schemas import (
    DriveCreate, DriveUpdate, RoundCreate, AttendanceRecord,
    DutyLeaveCreate, DutyLeaveReview, SelectionUpdate,
    IndependentOfferCreate, IndependentOfferReview,
)
from app.audit.service import log_action
from app.notifications.service import create_notification


# ===================== DRIVES =====================

async def create_drive(data: DriveCreate, actor_id: str) -> dict:
    db = get_supabase_admin()
    payload = data.model_dump(exclude_none=True)
    result = db.table("placement_drives").insert(payload).execute()
    if not result.data:
        raise HTTPException(status_code=400, detail="Failed to create drive")
    await log_action(actor_id, "create_drive", "placement_drives", str(result.data[0]["drive_id"]), new_data=payload)
    return result.data[0]


async def get_drive(drive_id: int) -> dict:
    db = get_supabase_admin()
    result = db.table("placement_drives").select("*").eq("drive_id", drive_id).execute()
    if not result.data:
        raise HTTPException(status_code=404, detail="Drive not found")
    return result.data[0]


async def list_drives(
    limit: int = 50, offset: int = 0,
    status: Optional[str] = None, search: Optional[str] = None,
) -> list:
    db = get_supabase_admin()
    query = db.table("placement_drives").select("*").order("drive_date", desc=True)
    if status:
        query = query.eq("status", status)
    if search:
        query = query.ilike("company_name", f"%{search}%")
    result = query.range(offset, offset + limit - 1).execute()
    return result.data or []


async def update_drive(drive_id: int, data: DriveUpdate, actor_id: str) -> dict:
    db = get_supabase_admin()
    old = await get_drive(drive_id)
    update_data = data.model_dump(exclude_none=True)
    if not update_data:
        return old
    update_data["updated_at"] = datetime.now(timezone.utc).isoformat()
    result = db.table("placement_drives").update(update_data).eq("drive_id", drive_id).execute()
    if not result.data:
        raise HTTPException(status_code=400, detail="Update failed")
    await log_action(actor_id, "update_drive", "placement_drives", str(drive_id), old_data=old, new_data=update_data)
    return result.data[0]


# ===================== ROUNDS =====================

async def add_round(drive_id: int, data: RoundCreate, actor_id: str) -> dict:
    db = get_supabase_admin()
    payload = {"drive_id": drive_id, "round_name": data.round_name, "round_order": data.round_order}
    result = db.table("drive_rounds").insert(payload).execute()
    if not result.data:
        raise HTTPException(status_code=400, detail="Failed to add round")
    await log_action(actor_id, "add_round", "drive_rounds", str(result.data[0]["round_id"]), new_data=payload)
    return result.data[0]


async def get_rounds(drive_id: int) -> list:
    db = get_supabase_admin()
    result = db.table("drive_rounds").select("*").eq("drive_id", drive_id).order("round_order").execute()
    return result.data or []


# ===================== REGISTRATION =====================

async def register_for_drive(student_id: int, drive_id: int, actor_id: str) -> dict:
    db = get_supabase_admin()
    # Check if already registered
    existing = db.table("student_drive_map").select("id").eq("student_id", student_id).eq("drive_id", drive_id).execute()
    if existing.data:
        raise HTTPException(status_code=400, detail="Already registered for this drive")

    payload = {
        "student_id": student_id,
        "drive_id": drive_id,
        "registered": True,
        "is_eligible": True,
    }
    result = db.table("student_drive_map").insert(payload).execute()
    if not result.data:
        raise HTTPException(status_code=400, detail="Registration failed")

    # Get student's user_id for notification
    student = db.table("students").select("user_id").eq("student_id", student_id).execute()
    if student.data and student.data[0].get("user_id"):
        drive = await get_drive(drive_id)
        await create_notification(
            student.data[0]["user_id"],
            "drive_registration",
            {"message": f"Successfully registered for {drive['company_name']} drive", "drive_id": drive_id},
        )

    await log_action(actor_id, "register_drive", "student_drive_map", str(result.data[0]["id"]), new_data=payload)
    return result.data[0]


async def cancel_registration(student_id: int, drive_id: int, actor_id: str) -> dict:
    db = get_supabase_admin()
    result = db.table("student_drive_map").update({"registered": False}).eq("student_id", student_id).eq("drive_id", drive_id).execute()
    if not result.data:
        raise HTTPException(status_code=404, detail="Registration not found")
    await log_action(actor_id, "cancel_registration", "student_drive_map", new_data={"student_id": student_id, "drive_id": drive_id})
    return result.data[0]


async def get_student_drives(student_id: int) -> list:
    db = get_supabase_admin()
    result = db.table("student_drive_map").select("*, placement_drives(*)").eq("student_id", student_id).execute()
    return result.data or []


async def get_drive_students(drive_id: int) -> list:
    db = get_supabase_admin()
    result = db.table("student_drive_map").select("*, students(*)").eq("drive_id", drive_id).execute()
    return result.data or []


async def get_eligible_drives(student_id: int) -> list:
    """Get drives that a student is eligible for based on stream."""
    db = get_supabase_admin()
    student = db.table("students").select("stream").eq("student_id", student_id).execute()
    if not student.data:
        raise HTTPException(status_code=404, detail="Student not found")

    stream = student.data[0].get("stream", "")
    drives = db.table("placement_drives").select("*").eq("status", "open").execute()
    eligible = []
    for d in (drives.data or []):
        eligible_streams = d.get("streams_eligible", "") or ""
        if not eligible_streams or stream.lower() in eligible_streams.lower():
            eligible.append(d)
    return eligible


# ===================== ATTENDANCE =====================

async def mark_attendance(data: AttendanceRecord, actor_id: str) -> dict:
    db = get_supabase_admin()
    payload = {
        "student_id": data.student_id,
        "drive_id": data.drive_id,
        "round_id": data.round_id,
        "attended": data.attended,
        "marked_by": actor_id,
    }
    # Upsert
    existing = db.table("drive_attendance").select("id").eq("student_id", data.student_id).eq("drive_id", data.drive_id)
    if data.round_id:
        existing = existing.eq("round_id", data.round_id)
    existing = existing.execute()

    if existing.data:
        result = db.table("drive_attendance").update({"attended": data.attended, "marked_by": actor_id}).eq("id", existing.data[0]["id"]).execute()
    else:
        result = db.table("drive_attendance").insert(payload).execute()

    if data.attended:
        db.table("student_drive_map").update({"participated": True}).eq("student_id", data.student_id).eq("drive_id", data.drive_id).execute()

    return result.data[0] if result.data else {}


async def get_attendance(drive_id: int, round_id: Optional[int] = None) -> list:
    db = get_supabase_admin()
    query = db.table("drive_attendance").select("*, students(full_name, reg_no)").eq("drive_id", drive_id)
    if round_id:
        query = query.eq("round_id", round_id)
    result = query.execute()
    return result.data or []


# ===================== DUTY LEAVE =====================

async def request_duty_leave(student_id: int, data: DutyLeaveCreate, actor_id: str) -> dict:
    db = get_supabase_admin()
    payload = {
        "student_id": student_id,
        "drive_id": data.drive_id,
        "date": data.date,
        "start_time": data.start_time,
        "end_time": data.end_time,
        "remarks": data.remarks,
    }
    result = db.table("duty_leave_requests").insert(payload).execute()
    if not result.data:
        raise HTTPException(status_code=400, detail="Failed to submit duty leave request")
    return result.data[0]


async def review_duty_leave(leave_id: int, data: DutyLeaveReview, actor_id: str) -> dict:
    db = get_supabase_admin()
    result = db.table("duty_leave_requests").update({
        "status": data.status,
        "remarks": data.remarks,
        "reviewed_by": actor_id,
    }).eq("id", leave_id).execute()
    if not result.data:
        raise HTTPException(status_code=404, detail="Duty leave request not found")
    await log_action(actor_id, "review_duty_leave", "duty_leave_requests", str(leave_id), new_data={"status": data.status})
    return result.data[0]


async def get_duty_leaves(student_id: Optional[int] = None, drive_id: Optional[int] = None) -> list:
    db = get_supabase_admin()
    query = db.table("duty_leave_requests").select("*").order("created_at", desc=True)
    if student_id:
        query = query.eq("student_id", student_id)
    if drive_id:
        query = query.eq("drive_id", drive_id)
    result = query.execute()
    return result.data or []


# ===================== SELECTIONS / OUTCOMES =====================

async def update_selection(student_id: int, drive_id: int, data: SelectionUpdate, actor_id: str) -> dict:
    db = get_supabase_admin()
    update = {"selected": data.selected}
    if data.offer_status:
        update["offer_status"] = data.offer_status
    update["updated_at"] = datetime.now(timezone.utc).isoformat()

    result = db.table("student_drive_map").update(update).eq("student_id", student_id).eq("drive_id", drive_id).execute()
    if not result.data:
        raise HTTPException(status_code=404, detail="Registration not found")

    # Notify student
    student = db.table("students").select("user_id").eq("student_id", student_id).execute()
    if student.data and student.data[0].get("user_id"):
        drive = await get_drive(drive_id)
        status_msg = "selected" if data.selected else "not selected"
        await create_notification(
            student.data[0]["user_id"],
            "selection_result",
            {"message": f"You have been {status_msg} for {drive['company_name']}", "drive_id": drive_id},
        )

    await log_action(actor_id, "update_selection", "student_drive_map",
                     new_data={"student_id": student_id, "drive_id": drive_id, **update})
    return result.data[0]


async def accept_offer(student_id: int, drive_id: int, actor_id: str) -> dict:
    db = get_supabase_admin()
    result = db.table("student_drive_map").update({
        "offer_status": "accepted",
        "updated_at": datetime.now(timezone.utc).isoformat(),
    }).eq("student_id", student_id).eq("drive_id", drive_id).execute()
    if not result.data:
        raise HTTPException(status_code=404, detail="Registration not found")
    return result.data[0]


async def reject_offer(student_id: int, drive_id: int, actor_id: str) -> dict:
    db = get_supabase_admin()
    result = db.table("student_drive_map").update({
        "offer_status": "rejected",
        "updated_at": datetime.now(timezone.utc).isoformat(),
    }).eq("student_id", student_id).eq("drive_id", drive_id).execute()
    if not result.data:
        raise HTTPException(status_code=404, detail="Registration not found")
    return result.data[0]


# ===================== INDEPENDENT OFFERS =====================

async def submit_independent_offer(student_id: int, data: IndependentOfferCreate, offer_letter_path: str = None) -> dict:
    db = get_supabase_admin()
    payload = {
        "student_id": student_id,
        "company_name": data.company_name,
        "stipend": float(data.stipend) if data.stipend else None,
        "ctc": float(data.ctc) if data.ctc else None,
        "duration": data.duration,
        "offer_letter_path": offer_letter_path,
    }
    result = db.table("independent_offers").insert(payload).execute()
    if not result.data:
        raise HTTPException(status_code=400, detail="Failed to submit offer")
    return result.data[0]


async def review_independent_offer(offer_id: int, data: IndependentOfferReview, actor_id: str) -> dict:
    db = get_supabase_admin()
    result = db.table("independent_offers").update({
        "status": data.status,
        "reviewed_by": actor_id,
    }).eq("id", offer_id).execute()
    if not result.data:
        raise HTTPException(status_code=404, detail="Offer not found")
    await log_action(actor_id, "review_independent_offer", "independent_offers", str(offer_id), new_data={"status": data.status})
    return result.data[0]


async def get_independent_offers(student_id: Optional[int] = None) -> list:
    db = get_supabase_admin()
    query = db.table("independent_offers").select("*").order("submitted_at", desc=True)
    if student_id:
        query = query.eq("student_id", student_id)
    result = query.execute()
    return result.data or []
