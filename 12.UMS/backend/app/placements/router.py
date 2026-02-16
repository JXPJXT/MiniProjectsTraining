"""Placement profile API endpoints."""

from fastapi import APIRouter, Depends
from app.core.deps import get_current_user, require_roles, CurrentUser
from app.placements.schemas import PlacementProfileCreate, PlacementProfileUpdate
from app.placements import service
from app.students.service import get_student_by_user_id

router = APIRouter(prefix="/placements", tags=["Placement Profiles"])


@router.post("/profile")
async def create_profile(
    data: PlacementProfileCreate,
    current_user: CurrentUser = Depends(require_roles(["admin", "super_admin", "tpc"])),
):
    """Create a placement profile for a student."""
    return await service.create_profile(data, current_user.id)


@router.get("/profile/me")
async def my_profile(current_user: CurrentUser = Depends(get_current_user)):
    """Get my placement profile."""
    student = await get_student_by_user_id(current_user.id)
    if not student:
        return {"detail": "No student profile"}
    return await service.get_profile_by_student(student["student_id"])


@router.get("/profile/{student_id}")
async def get_profile(
    student_id: int,
    current_user: CurrentUser = Depends(get_current_user),
):
    return await service.get_profile_by_student(student_id)


@router.put("/profile/{student_id}")
async def update_profile(
    student_id: int,
    data: PlacementProfileUpdate,
    current_user: CurrentUser = Depends(require_roles(["admin", "super_admin", "tpc"])),
):
    return await service.update_profile(student_id, data, current_user.id)


@router.post("/profile/{student_id}/accept-policy")
async def accept_policy(
    student_id: int,
    current_user: CurrentUser = Depends(get_current_user),
):
    """Accept placement policy."""
    return await service.accept_policy(student_id, current_user.id)


@router.get("/eligibility/{student_id}")
async def check_eligibility(
    student_id: int,
    current_user: CurrentUser = Depends(get_current_user),
):
    """Check placement eligibility for a student."""
    return await service.check_eligibility(student_id)
