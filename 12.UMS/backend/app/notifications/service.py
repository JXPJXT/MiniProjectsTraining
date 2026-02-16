"""Notification service — in-app DB-based notifications."""

from typing import Optional
from app.core.database import get_supabase_admin


async def create_notification(user_id: str, notification_type: str, payload: dict) -> dict:
    """Create an in-app notification."""
    db = get_supabase_admin()
    result = db.table("notifications").insert({
        "user_id": user_id,
        "type": notification_type,
        "payload": payload,
    }).execute()
    return result.data[0] if result.data else {}


async def get_notifications(
    user_id: str,
    limit: int = 50,
    unread_only: bool = False,
) -> list:
    db = get_supabase_admin()
    query = db.table("notifications").select("*").eq("user_id", user_id).order("created_at", desc=True)
    if unread_only:
        query = query.eq("read", False)
    result = query.range(0, limit - 1).execute()
    return result.data or []


async def mark_read(notification_id: int, user_id: str) -> dict:
    db = get_supabase_admin()
    result = db.table("notifications").update({"read": True}).eq("id", notification_id).eq("user_id", user_id).execute()
    return result.data[0] if result.data else {}


async def mark_all_read(user_id: str) -> int:
    db = get_supabase_admin()
    result = db.table("notifications").update({"read": True}).eq("user_id", user_id).eq("read", False).execute()
    return len(result.data) if result.data else 0


async def get_unread_count(user_id: str) -> int:
    db = get_supabase_admin()
    result = db.table("notifications").select("id", count="exact").eq("user_id", user_id).eq("read", False).execute()
    return result.count if result.count else 0
