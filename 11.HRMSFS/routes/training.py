"""
Routes for training_courses, training_enrollments, skills.
"""

from fastapi import APIRouter, Query
from typing import Optional
from schemas.training import (
    TrainingCourseCreate, TrainingCourseUpdate, TrainingCourseOut,
    TrainingEnrollmentCreate, TrainingEnrollmentUpdate, TrainingEnrollmentOut,
    SkillCreate, SkillUpdate, SkillOut,
)
import crud

router = APIRouter(tags=["Training & Skills"])


# ── Training Courses ─────────────────────────────────────────────────────────

@router.get("/training-courses", summary="List training courses")
def list_training_courses(limit: int = 100, offset: int = 0):
    return crud.list_records("training_courses", limit=limit, offset=offset, order_by="course_id")


@router.get("/training-courses/{course_id}", summary="Get training course by ID")
def get_training_course(course_id: int):
    return crud.get_record("training_courses", "course_id", course_id)


@router.post("/training-courses", status_code=201, summary="Create training course")
def create_training_course(body: TrainingCourseCreate):
    return crud.create_record("training_courses", body.model_dump())


@router.put("/training-courses/{course_id}", summary="Update training course")
def update_training_course(course_id: int, body: TrainingCourseUpdate):
    return crud.update_record("training_courses", "course_id", course_id, body.model_dump(exclude_unset=True))


@router.delete("/training-courses/{course_id}", summary="Delete training course")
def delete_training_course(course_id: int):
    return crud.delete_record("training_courses", "course_id", course_id)


# ── Training Enrollments ────────────────────────────────────────────────────

@router.get("/training-enrollments", summary="List training enrollments")
def list_training_enrollments(limit: int = 100, offset: int = 0, emp_id: Optional[int] = None, course_id: Optional[int] = None, status: Optional[str] = None):
    filters = {}
    if emp_id:
        filters["emp_id"] = emp_id
    if course_id:
        filters["course_id"] = course_id
    if status:
        filters["status"] = status
    return crud.list_records("training_enrollments", limit=limit, offset=offset, order_by="enrollment_id", filters=filters or None)


@router.get("/training-enrollments/{enrollment_id}", summary="Get training enrollment by ID")
def get_training_enrollment(enrollment_id: int):
    return crud.get_record("training_enrollments", "enrollment_id", enrollment_id)


@router.post("/training-enrollments", status_code=201, summary="Create training enrollment")
def create_training_enrollment(body: TrainingEnrollmentCreate):
    return crud.create_record("training_enrollments", body.model_dump())


@router.put("/training-enrollments/{enrollment_id}", summary="Update training enrollment")
def update_training_enrollment(enrollment_id: int, body: TrainingEnrollmentUpdate):
    return crud.update_record("training_enrollments", "enrollment_id", enrollment_id, body.model_dump(exclude_unset=True))


@router.delete("/training-enrollments/{enrollment_id}", summary="Delete training enrollment")
def delete_training_enrollment(enrollment_id: int):
    return crud.delete_record("training_enrollments", "enrollment_id", enrollment_id)


# ── Skills ───────────────────────────────────────────────────────────────────

@router.get("/skills", summary="List skills")
def list_skills(limit: int = 100, offset: int = 0, category: Optional[str] = None):
    filters = {"category": category} if category else None
    return crud.list_records("skills", limit=limit, offset=offset, order_by="skill_id", filters=filters)


@router.get("/skills/{skill_id}", summary="Get skill by ID")
def get_skill(skill_id: int):
    return crud.get_record("skills", "skill_id", skill_id)


@router.post("/skills", status_code=201, summary="Create skill")
def create_skill(body: SkillCreate):
    return crud.create_record("skills", body.model_dump())


@router.put("/skills/{skill_id}", summary="Update skill")
def update_skill(skill_id: int, body: SkillUpdate):
    return crud.update_record("skills", "skill_id", skill_id, body.model_dump(exclude_unset=True))


@router.delete("/skills/{skill_id}", summary="Delete skill")
def delete_skill(skill_id: int):
    return crud.delete_record("skills", "skill_id", skill_id)
