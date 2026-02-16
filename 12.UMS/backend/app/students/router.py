"""Student API endpoints."""

from fastapi import APIRouter, Depends, Query
from typing import Optional
from app.core.deps import get_current_user, require_roles, CurrentUser
from app.students.schemas import (
    StudentCreate,
    StudentUpdate,
    ContactCreate,
    FamilyMemberCreate,
    SkillCreate,
    PreferencesUpdate,
)
from app.students import service

router = APIRouter(prefix="/students", tags=["Students"])


@router.post("/")
async def create_student(
    data: StudentCreate,
    current_user: CurrentUser = Depends(require_roles(["admin", "super_admin", "tpc"])),
):
    """Create a new student profile (admin/TPC)."""
    return await service.create_student(data, current_user.id, current_user.id)


@router.get("/me")
async def get_my_profile(current_user: CurrentUser = Depends(get_current_user)):
    """Get the current student's own profile."""
    student = await service.get_student_by_user_id(current_user.id)
    if not student:
        return {"detail": "No student profile found"}
    return student


@router.get("/me/completeness")
async def my_completeness(current_user: CurrentUser = Depends(get_current_user)):
    """Check how complete my profile is."""
    student = await service.get_student_by_user_id(current_user.id)
    if not student:
        return {"percentage": 0, "sections": {}}
    return await service.compute_profile_completeness(student["student_id"])


@router.get("/")
async def list_students(
    limit: int = Query(50, le=200),
    offset: int = Query(0, ge=0),
    status: Optional[str] = None,
    stream: Optional[str] = None,
    search: Optional[str] = None,
    current_user: CurrentUser = Depends(require_roles(["admin", "super_admin", "tpc", "faculty"])),
):
    """List all students (admin/TPC/faculty)."""
    students = await service.list_students(limit, offset, status, stream, search)
    return {"data": students, "count": len(students)}


@router.get("/{student_id}")
async def get_student(
    student_id: int,
    current_user: CurrentUser = Depends(get_current_user),
):
    """Get a specific student by ID."""
    return await service.get_student(student_id)


@router.put("/{student_id}")
async def update_student(
    student_id: int,
    data: StudentUpdate,
    current_user: CurrentUser = Depends(require_roles(["admin", "super_admin", "tpc"])),
):
    """Update student details (admin/TPC)."""
    return await service.update_student(student_id, data, current_user.id)


# --- Contacts ---

@router.put("/{student_id}/contact")
async def upsert_contact(
    student_id: int,
    data: ContactCreate,
    current_user: CurrentUser = Depends(get_current_user),
):
    return await service.upsert_contact(student_id, data)


@router.get("/{student_id}/contact")
async def get_contact(
    student_id: int,
    current_user: CurrentUser = Depends(get_current_user),
):
    return await service.get_contact(student_id)


# --- Family ---

@router.post("/{student_id}/family")
async def add_family(
    student_id: int,
    data: FamilyMemberCreate,
    current_user: CurrentUser = Depends(get_current_user),
):
    return await service.add_family_member(student_id, data)


@router.get("/{student_id}/family")
async def get_family(
    student_id: int,
    current_user: CurrentUser = Depends(get_current_user),
):
    return await service.get_family(student_id)


# --- Skills ---

@router.post("/{student_id}/skills")
async def add_skill(
    student_id: int,
    data: SkillCreate,
    current_user: CurrentUser = Depends(get_current_user),
):
    return await service.add_skill(student_id, data)


@router.get("/{student_id}/skills")
async def get_skills(
    student_id: int,
    current_user: CurrentUser = Depends(get_current_user),
):
    return await service.get_skills(student_id)


# --- Preferences ---

@router.put("/{student_id}/preferences")
async def upsert_preferences(
    student_id: int,
    data: PreferencesUpdate,
    current_user: CurrentUser = Depends(get_current_user),
):
    return await service.upsert_preferences(student_id, data)


@router.get("/{student_id}/preferences")
async def get_preferences(
    student_id: int,
    current_user: CurrentUser = Depends(get_current_user),
):
    return await service.get_preferences(student_id)
