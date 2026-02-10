"""
Routes for notifications and notification_preferences.
"""

from fastapi import APIRouter, Query
from typing import Optional
from schemas.notifications import (
    NotificationCreate, NotificationUpdate,
    NotificationPreferenceCreate, NotificationPreferenceUpdate,
)
import crud

router = APIRouter(tags=["Notifications"])


@router.get("/notifications", summary="List notifications")
def list_notifications(limit: int = 100, offset: int = 0, recipient_id: Optional[int] = None, status: Optional[str] = None):
    filters = {}
    if recipient_id: filters["recipient_id"] = recipient_id
    if status: filters["status"] = status
    return crud.list_records("notifications", limit=limit, offset=offset, order_by="notification_id", filters=filters or None)

@router.get("/notifications/{notification_id}", summary="Get notification")
def get_notification(notification_id: int):
    return crud.get_record("notifications", "notification_id", notification_id)

@router.post("/notifications", status_code=201, summary="Create notification")
def create_notification(body: NotificationCreate):
    return crud.create_record("notifications", body.model_dump())

@router.put("/notifications/{notification_id}", summary="Update notification")
def update_notification(notification_id: int, body: NotificationUpdate):
    return crud.update_record("notifications", "notification_id", notification_id, body.model_dump(exclude_unset=True))

@router.delete("/notifications/{notification_id}", summary="Delete notification")
def delete_notification(notification_id: int):
    return crud.delete_record("notifications", "notification_id", notification_id)


@router.get("/notification-preferences", summary="List notification preferences")
def list_notification_preferences(limit: int = 100, offset: int = 0, emp_id: Optional[int] = None):
    filters = {"emp_id": emp_id} if emp_id else None
    return crud.list_records("notification_preferences", limit=limit, offset=offset, filters=filters)

@router.get("/notification-preferences/{preference_id}", summary="Get notification preference")
def get_notification_preference(preference_id: int):
    return crud.get_record("notification_preferences", "preference_id", preference_id)

@router.post("/notification-preferences", status_code=201, summary="Create notification preference")
def create_notification_preference(body: NotificationPreferenceCreate):
    return crud.create_record("notification_preferences", body.model_dump())

@router.put("/notification-preferences/{preference_id}", summary="Update notification preference")
def update_notification_preference(preference_id: int, body: NotificationPreferenceUpdate):
    return crud.update_record("notification_preferences", "preference_id", preference_id, body.model_dump(exclude_unset=True))

@router.delete("/notification-preferences/{preference_id}", summary="Delete notification preference")
def delete_notification_preference(preference_id: int):
    return crud.delete_record("notification_preferences", "preference_id", preference_id)
