"""Drive-related Pydantic schemas."""

from pydantic import BaseModel
from typing import Optional, List


class DriveCreate(BaseModel):
    drive_code: str
    company_name: str
    drive_type: Optional[str] = None
    drive_date: Optional[str] = None
    venue: Optional[str] = None
    streams_eligible: Optional[str] = None
    registration_deadline: Optional[str] = None


class DriveUpdate(BaseModel):
    company_name: Optional[str] = None
    drive_type: Optional[str] = None
    drive_date: Optional[str] = None
    venue: Optional[str] = None
    streams_eligible: Optional[str] = None
    registration_deadline: Optional[str] = None
    status: Optional[str] = None


class RoundCreate(BaseModel):
    round_name: str
    round_order: int


class DriveRegistration(BaseModel):
    student_id: int
    drive_id: int


class AttendanceRecord(BaseModel):
    student_id: int
    drive_id: int
    round_id: Optional[int] = None
    attended: bool


class DutyLeaveCreate(BaseModel):
    drive_id: Optional[int] = None
    date: str
    start_time: Optional[str] = None
    end_time: Optional[str] = None
    remarks: Optional[str] = None


class DutyLeaveReview(BaseModel):
    status: str  # 'approved' or 'rejected'
    remarks: Optional[str] = None


class SelectionUpdate(BaseModel):
    selected: bool
    offer_status: Optional[str] = None


class IndependentOfferCreate(BaseModel):
    company_name: str
    stipend: Optional[float] = None
    ctc: Optional[float] = None
    duration: Optional[str] = None


class IndependentOfferReview(BaseModel):
    status: str  # 'approved' or 'rejected'
