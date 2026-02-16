"""Student CRUD service layer."""

from typing import Optional
from fastapi import HTTPException
from app.core.database import get_supabase_admin
from app.students.schemas import (
    StudentCreate,
    StudentUpdate,
    ContactCreate,
    FamilyMemberCreate,
    SkillCreate,
    PreferencesUpdate,
)
from app.audit.service import log_action


async def create_student(data: StudentCreate, user_id: str, actor_id: str) -> dict:
    """Create a student profile linked to a user account."""
    db = get_supabase_admin()
    payload = {
        "user_id": user_id,
        "reg_no": data.reg_no,
        "full_name": data.full_name,
        "program": data.program,
        "stream": data.stream,
        "batch_start_year": data.batch_start_year,
        "batch_end_year": data.batch_end_year,
        "cgpa": float(data.cgpa) if data.cgpa else None,
        "backlog_count": data.backlog_count,
    }
    result = db.table("students").insert(payload).execute()
    if not result.data:
        raise HTTPException(status_code=400, detail="Failed to create student")

    await log_action(actor_id, "create_student", "students", str(result.data[0]["student_id"]), new_data=payload)
    return result.data[0]


async def get_student_by_user_id(user_id: str) -> Optional[dict]:
    db = get_supabase_admin()
    result = db.table("students").select("*").eq("user_id", user_id).execute()
    return result.data[0] if result.data else None


async def get_student(student_id: int) -> dict:
    db = get_supabase_admin()
    result = db.table("students").select("*").eq("student_id", student_id).execute()
    if not result.data:
        raise HTTPException(status_code=404, detail="Student not found")
    return result.data[0]


async def list_students(
    limit: int = 50,
    offset: int = 0,
    status: Optional[str] = None,
    stream: Optional[str] = None,
    search: Optional[str] = None,
) -> list:
    db = get_supabase_admin()
    query = db.table("students").select("*").order("student_id", desc=True)

    if status:
        query = query.eq("status", status)
    if stream:
        query = query.eq("stream", stream)
    if search:
        query = query.ilike("full_name", f"%{search}%")

    result = query.range(offset, offset + limit - 1).execute()
    return result.data or []


async def update_student(student_id: int, data: StudentUpdate, actor_id: str) -> dict:
    db = get_supabase_admin()
    old = await get_student(student_id)
    update_data = data.model_dump(exclude_none=True)
    if not update_data:
        return old

    result = db.table("students").update(update_data).eq("student_id", student_id).execute()
    if not result.data:
        raise HTTPException(status_code=400, detail="Update failed")

    await log_action(actor_id, "update_student", "students", str(student_id), old_data=old, new_data=update_data)
    return result.data[0]


# ---------- Contacts ----------

async def upsert_contact(student_id: int, data: ContactCreate) -> dict:
    db = get_supabase_admin()
    payload = {"student_id": student_id, **data.model_dump(exclude_none=True)}
    # Check existing
    existing = db.table("student_contacts").select("id").eq("student_id", student_id).execute()
    if existing.data:
        result = db.table("student_contacts").update(data.model_dump(exclude_none=True)).eq("student_id", student_id).execute()
    else:
        result = db.table("student_contacts").insert(payload).execute()
    return result.data[0] if result.data else {}


async def get_contact(student_id: int) -> Optional[dict]:
    db = get_supabase_admin()
    result = db.table("student_contacts").select("*").eq("student_id", student_id).execute()
    return result.data[0] if result.data else None


# ---------- Family ----------

async def add_family_member(student_id: int, data: FamilyMemberCreate) -> dict:
    db = get_supabase_admin()
    payload = {"student_id": student_id, **data.model_dump(exclude_none=True)}
    result = db.table("student_family").insert(payload).execute()
    return result.data[0] if result.data else {}


async def get_family(student_id: int) -> list:
    db = get_supabase_admin()
    result = db.table("student_family").select("*").eq("student_id", student_id).execute()
    return result.data or []


# ---------- Skills ----------

async def add_skill(student_id: int, data: SkillCreate) -> dict:
    db = get_supabase_admin()
    payload = {"student_id": student_id, **data.model_dump(exclude_none=True)}
    result = db.table("student_skills").insert(payload).execute()
    return result.data[0] if result.data else {}


async def get_skills(student_id: int) -> list:
    db = get_supabase_admin()
    result = db.table("student_skills").select("*").eq("student_id", student_id).execute()
    return result.data or []


# ---------- Preferences ----------

async def upsert_preferences(student_id: int, data: PreferencesUpdate) -> dict:
    db = get_supabase_admin()
    payload = {"student_id": student_id, **data.model_dump(exclude_none=True)}
    existing = db.table("student_preferences").select("id").eq("student_id", student_id).execute()
    if existing.data:
        result = db.table("student_preferences").update(data.model_dump(exclude_none=True)).eq("student_id", student_id).execute()
    else:
        result = db.table("student_preferences").insert(payload).execute()
    return result.data[0] if result.data else {}


async def get_preferences(student_id: int) -> Optional[dict]:
    db = get_supabase_admin()
    result = db.table("student_preferences").select("*").eq("student_id", student_id).execute()
    return result.data[0] if result.data else None


# ---------- Profile Completeness ----------

async def compute_profile_completeness(student_id: int) -> dict:
    """Calculate how complete a student's profile is."""
    student = await get_student(student_id)
    contact = await get_contact(student_id)
    skills = await get_skills(student_id)
    prefs = await get_preferences(student_id)

    sections = {
        "basic_info": bool(student.get("full_name") and student.get("reg_no") and student.get("program")),
        "contact": bool(contact and contact.get("email") and contact.get("mobile")),
        "skills": len(skills) >= 1,
        "preferences": bool(prefs and prefs.get("job_profiles")),
        "cgpa": student.get("cgpa") is not None,
    }

    completed = sum(sections.values())
    total = len(sections)
    return {
        "percentage": round((completed / total) * 100),
        "sections": sections,
        "completed": completed,
        "total": total,
    }
