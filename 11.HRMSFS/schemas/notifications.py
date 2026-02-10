"""
Schemas for notifications and notification_preferences.
"""

from datetime import datetime
from typing import Optional
from pydantic import BaseModel


# ── Notifications ────────────────────────────────────────────────────────────

class NotificationCreate(BaseModel):
    recipient_id: int
    sender_id: Optional[int] = None
    subject: Optional[str] = None
    message: Optional[str] = None
    type: Optional[str] = None
    priority: Optional[str] = "normal"
    status: Optional[str] = "unread"
    related_entity: Optional[str] = None
    related_entity_id: Optional[int] = None


class NotificationUpdate(BaseModel):
    recipient_id: Optional[int] = None
    sender_id: Optional[int] = None
    subject: Optional[str] = None
    message: Optional[str] = None
    type: Optional[str] = None
    priority: Optional[str] = None
    status: Optional[str] = None
    related_entity: Optional[str] = None
    related_entity_id: Optional[int] = None
    read_at: Optional[datetime] = None


class NotificationOut(NotificationCreate):
    notification_id: int
    sent_at: Optional[datetime] = None
    read_at: Optional[datetime] = None

    class Config:
        from_attributes = True


# ── Notification Preferences ────────────────────────────────────────────────

class NotificationPreferenceCreate(BaseModel):
    emp_id: int
    notification_type: str
    email_enabled: Optional[bool] = True
    sms_enabled: Optional[bool] = False
    push_enabled: Optional[bool] = False


class NotificationPreferenceUpdate(BaseModel):
    emp_id: Optional[int] = None
    notification_type: Optional[str] = None
    email_enabled: Optional[bool] = None
    sms_enabled: Optional[bool] = None
    push_enabled: Optional[bool] = None


class NotificationPreferenceOut(NotificationPreferenceCreate):
    preference_id: int
    created_at: Optional[datetime] = None

    class Config:
        from_attributes = True
