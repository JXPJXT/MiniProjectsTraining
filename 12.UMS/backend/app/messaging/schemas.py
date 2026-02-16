"""Messaging schemas."""

from pydantic import BaseModel
from typing import Optional, List


class MessageCreate(BaseModel):
    receiver_id: str
    content: str


class BroadcastCreate(BaseModel):
    content: str
    target_role: Optional[str] = None  # None = all users
    target_stream: Optional[str] = None


class AnnouncementCreate(BaseModel):
    content: str
    target_role: Optional[str] = None
    target_stream: Optional[str] = None
