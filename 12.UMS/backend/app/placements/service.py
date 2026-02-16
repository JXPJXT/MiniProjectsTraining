"""Placement profile service — policy acceptance, fee status, eligibility."""

from typing import Optional
from datetime import datetime, timezone
from fastapi import HTTPException
from app.core.database import get_supabase_admin
from app.placements.schemas import PlacementProfileCreate, PlacementProfileUpdate
from app.audit.service import log_action


async def create_profile(data: PlacementProfileCreate, actor_id: str) -> dict:
    db = get_supabase_admin()
    payload = {
        "student_id": data.student_id,
        "policy_accepted": data.policy_accepted,
        "pep_fee_paid": float(data.pep_fee_paid),
        "pep_fee_status": data.pep_fee_status,
        "registration_date": datetime.now(timezone.utc).isoformat(),
    }
    result = db.table("placement_profiles").insert(payload).execute()
    if not result.data:
        raise HTTPException(status_code=400, detail="Failed to create placement profile")

    await log_action(actor_id, "create_placement_profile", "placement_profiles",
                     str(result.data[0]["placement_id"]), new_data=payload)
    return result.data[0]


async def get_profile_by_student(student_id: int) -> Optional[dict]:
    db = get_supabase_admin()
    result = db.table("placement_profiles").select("*").eq("student_id", student_id).execute()
    return result.data[0] if result.data else None


async def update_profile(student_id: int, data: PlacementProfileUpdate, actor_id: str) -> dict:
    db = get_supabase_admin()
    old = await get_profile_by_student(student_id)
    if not old:
        raise HTTPException(status_code=404, detail="Placement profile not found")

    update_data = data.model_dump(exclude_none=True)
    if not update_data:
        return old

    update_data["last_updated"] = datetime.now(timezone.utc).isoformat()
    result = db.table("placement_profiles").update(update_data).eq("student_id", student_id).execute()
    if not result.data:
        raise HTTPException(status_code=400, detail="Update failed")

    await log_action(actor_id, "update_placement_profile", "placement_profiles",
                     str(old["placement_id"]), old_data=old, new_data=update_data)
    return result.data[0]


async def accept_policy(student_id: int, actor_id: str) -> dict:
    """Mark policy as accepted and set registration date."""
    db = get_supabase_admin()
    profile = await get_profile_by_student(student_id)
    if not profile:
        # Auto-create if not exists
        profile = await create_profile(
            PlacementProfileCreate(student_id=student_id, policy_accepted=True),
            actor_id,
        )
        return profile

    result = db.table("placement_profiles").update({
        "policy_accepted": True,
        "placement_status": "active",
        "registration_date": datetime.now(timezone.utc).isoformat(),
        "last_updated": datetime.now(timezone.utc).isoformat(),
    }).eq("student_id", student_id).execute()
    return result.data[0] if result.data else profile


async def check_eligibility(student_id: int) -> dict:
    """Check whether a student is eligible for placements."""
    db = get_supabase_admin()

    # Get student
    student_res = db.table("students").select("*").eq("student_id", student_id).execute()
    if not student_res.data:
        raise HTTPException(status_code=404, detail="Student not found")
    student = student_res.data[0]

    # Get profile
    profile = await get_profile_by_student(student_id)

    issues = []
    if not profile:
        issues.append("No placement profile created")
    elif not profile.get("policy_accepted"):
        issues.append("Policy not accepted")
    if student.get("status") == "debarred":
        issues.append("Student is debarred")
    if student.get("status") == "exit":
        issues.append("Student has exited placement process")
    if student.get("backlog_count", 0) > 0:
        issues.append(f"Has {student['backlog_count']} active backlogs")

    return {
        "student_id": student_id,
        "is_eligible": len(issues) == 0,
        "issues": issues,
        "cgpa": student.get("cgpa"),
        "status": student.get("status"),
    }
