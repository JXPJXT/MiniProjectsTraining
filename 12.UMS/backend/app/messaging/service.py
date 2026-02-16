"""Messaging service — DMs, broadcasts, read receipts."""

from typing import Optional
from datetime import datetime, timezone
from fastapi import HTTPException
from app.core.database import get_supabase_admin
from app.notifications.service import create_notification


async def send_message(sender_id: str, receiver_id: str, content: str) -> dict:
    db = get_supabase_admin()
    result = db.table("messages").insert({
        "sender_id": sender_id,
        "receiver_id": receiver_id,
        "content": content,
    }).execute()
    if not result.data:
        raise HTTPException(status_code=400, detail="Failed to send message")

    # Create notification for receiver
    await create_notification(
        receiver_id, "new_message",
        {"message": "You have a new message", "sender_id": sender_id},
    )
    return result.data[0]


async def get_conversations(user_id: str) -> list:
    """Get distinct conversation partners."""
    db = get_supabase_admin()
    # Messages where user is sender or receiver
    sent = db.table("messages").select("receiver_id, content, created_at").eq("sender_id", user_id).order("created_at", desc=True).execute()
    received = db.table("messages").select("sender_id, content, created_at").eq("receiver_id", user_id).order("created_at", desc=True).execute()

    partners = {}
    for msg in (sent.data or []):
        pid = msg["receiver_id"]
        if pid not in partners or msg["created_at"] > partners[pid]["last_message_at"]:
            partners[pid] = {"partner_id": pid, "last_message": msg["content"], "last_message_at": msg["created_at"]}
    for msg in (received.data or []):
        pid = msg["sender_id"]
        if pid not in partners or msg["created_at"] > partners[pid]["last_message_at"]:
            partners[pid] = {"partner_id": pid, "last_message": msg["content"], "last_message_at": msg["created_at"]}

    return sorted(partners.values(), key=lambda x: x["last_message_at"], reverse=True)


async def get_thread(user_id: str, partner_id: str, limit: int = 100) -> list:
    """Get message thread between two users."""
    db = get_supabase_admin()
    sent = db.table("messages").select("*").eq("sender_id", user_id).eq("receiver_id", partner_id).execute()
    received = db.table("messages").select("*").eq("sender_id", partner_id).eq("receiver_id", user_id).execute()

    all_messages = (sent.data or []) + (received.data or [])
    all_messages.sort(key=lambda m: m["created_at"])

    # Mark received messages as read
    for msg in (received.data or []):
        if not msg.get("read_at"):
            db.table("messages").update({
                "read_at": datetime.now(timezone.utc).isoformat()
            }).eq("id", msg["id"]).execute()

    return all_messages[-limit:]


async def broadcast_message(sender_id: str, content: str, target_role: Optional[str] = None, target_stream: Optional[str] = None) -> dict:
    """Send a broadcast message to multiple users."""
    db = get_supabase_admin()

    # Get target users
    if target_role:
        users_query = db.table("users").select("id").eq("role", target_role)
    else:
        users_query = db.table("users").select("id")

    users_result = users_query.execute()
    target_users = [u["id"] for u in (users_result.data or []) if u["id"] != sender_id]

    # If targeting by stream, filter through students
    if target_stream:
        students = db.table("students").select("user_id").eq("stream", target_stream).execute()
        student_user_ids = {s["user_id"] for s in (students.data or []) if s.get("user_id")}
        target_users = [uid for uid in target_users if uid in student_user_ids]

    # Send to each user
    messages_sent = 0
    for uid in target_users:
        db.table("messages").insert({
            "sender_id": sender_id,
            "receiver_id": uid,
            "content": content,
        }).execute()
        await create_notification(uid, "broadcast", {"message": content, "sender_id": sender_id})
        messages_sent += 1

    return {"messages_sent": messages_sent, "target_count": len(target_users)}


async def get_unread_message_count(user_id: str) -> int:
    db = get_supabase_admin()
    result = db.table("messages").select("id", count="exact").eq("receiver_id", user_id).is_("read_at", "null").execute()
    return result.count if result.count else 0
