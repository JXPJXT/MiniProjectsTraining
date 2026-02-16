"""Student-related Pydantic schemas."""

from pydantic import BaseModel
from typing import Optional, List


class StudentCreate(BaseModel):
    reg_no: str
    full_name: str
    program: Optional[str] = None
    stream: Optional[str] = None
    batch_start_year: Optional[int] = None
    batch_end_year: Optional[int] = None
    cgpa: Optional[float] = None
    backlog_count: int = 0


class StudentUpdate(BaseModel):
    full_name: Optional[str] = None
    program: Optional[str] = None
    stream: Optional[str] = None
    cgpa: Optional[float] = None
    backlog_count: Optional[int] = None
    status: Optional[str] = None


class StudentResponse(BaseModel):
    student_id: int
    user_id: Optional[str] = None
    reg_no: Optional[str] = None
    full_name: str
    program: Optional[str] = None
    stream: Optional[str] = None
    batch_start_year: Optional[int] = None
    batch_end_year: Optional[int] = None
    cgpa: Optional[float] = None
    backlog_count: int = 0
    status: Optional[str] = None
    created_at: Optional[str] = None
    updated_at: Optional[str] = None


class ContactCreate(BaseModel):
    email: Optional[str] = None
    mobile: Optional[str] = None
    whatsapp: Optional[str] = None
    linkedin_url: Optional[str] = None
    microsoft_id: Optional[str] = None


class FamilyMemberCreate(BaseModel):
    relation: Optional[str] = None
    name: Optional[str] = None
    age: Optional[int] = None
    designation: Optional[str] = None
    employer: Optional[str] = None
    contact_no: Optional[str] = None
    email: Optional[str] = None


class SkillCreate(BaseModel):
    skill_name: str
    skill_level: Optional[str] = None
    experience_years: Optional[float] = None
    certification: Optional[str] = None
    projects: Optional[str] = None


class PreferencesUpdate(BaseModel):
    job_locations: Optional[List[str]] = None
    employment_types: Optional[List[str]] = None
    job_profiles: Optional[List[str]] = None
