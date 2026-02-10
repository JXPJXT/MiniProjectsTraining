"""
Schemas for audit_trail.
"""

from datetime import datetime
from typing import Any, Optional
from pydantic import BaseModel


class AuditTrailCreate(BaseModel):
    table_name: str
    record_id: int
    action: str
    old_values: Optional[dict[str, Any]] = None
    new_values: Optional[dict[str, Any]] = None
    changed_by: Optional[int] = None
    ip_address: Optional[str] = None
    user_agent: Optional[str] = None


class AuditTrailUpdate(BaseModel):
    table_name: Optional[str] = None
    record_id: Optional[int] = None
    action: Optional[str] = None
    old_values: Optional[dict[str, Any]] = None
    new_values: Optional[dict[str, Any]] = None
    changed_by: Optional[int] = None
    ip_address: Optional[str] = None
    user_agent: Optional[str] = None


class AuditTrailOut(AuditTrailCreate):
    audit_id: int
    changed_at: Optional[datetime] = None

    class Config:
        from_attributes = True
