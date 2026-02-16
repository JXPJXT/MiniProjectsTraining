"""Placement profile schemas."""

from pydantic import BaseModel
from typing import Optional


class PlacementProfileCreate(BaseModel):
    student_id: int
    policy_accepted: bool = False
    pep_fee_paid: float = 0
    pep_fee_status: Optional[str] = None


class PlacementProfileUpdate(BaseModel):
    policy_accepted: Optional[bool] = None
    placement_status: Optional[str] = None
    pep_fee_paid: Optional[float] = None
    pep_fee_status: Optional[str] = None
    opportunity_start: Optional[str] = None


class PlacementProfileResponse(BaseModel):
    placement_id: int
    student_id: int
    policy_accepted: bool
    registration_date: Optional[str] = None
    opportunity_start: Optional[str] = None
    placement_status: Optional[str] = None
    pep_fee_paid: Optional[float] = None
    pep_fee_status: Optional[str] = None
    last_updated: Optional[str] = None
