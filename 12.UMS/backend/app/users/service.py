"""User management service."""

from typing import Optional
from fastapi import HTTPException
from app.core.database import get_supabase_admin
from app.audit.service import log_action


async def list_users(
    limit: int = 50,
    offset: int = 0,
    role: Optional[str] = None,
) -> list:
    db = get_supabase_admin()
    query = db.table("users").select("*").order("created_at", desc=True)
    if role:
        query = query.eq("role", role)
    result = query.range(offset, offset + limit - 1).execute()
    return result.data or []


async def get_user(user_id: str) -> dict:
    db = get_supabase_admin()
    result = db.table("users").select("*").eq("id", user_id).execute()
    if not result.data:
        raise HTTPException(status_code=404, detail="User not found")
    return result.data[0]


async def update_user_role(user_id: str, new_role: str, actor_id: str) -> dict:
    db = get_supabase_admin()
    old = await get_user(user_id)
    result = db.table("users").update({"role": new_role}).eq("id", user_id).execute()
    if not result.data:
        raise HTTPException(status_code=400, detail="Update failed")
    await log_action(actor_id, "update_user_role", "users", user_id, old_data=old, new_data={"role": new_role})
    return result.data[0]


async def delete_user(user_id: str, actor_id: str) -> dict:
    db = get_supabase_admin()
    old = await get_user(user_id)

    # Delete from Supabase Auth
    try:
        db.auth.admin.delete_user(user_id)
    except Exception:
        pass

    # Delete from our table
    db.table("users").delete().eq("id", user_id).execute()
    await log_action(actor_id, "delete_user", "users", user_id, old_data=old)
    return {"detail": "User deleted"}


async def get_user_stats() -> dict:
    """Get aggregated user statistics."""
    db = get_supabase_admin()
    all_users = db.table("users").select("role").execute()
    stats = {}
    for user in (all_users.data or []):
        role = user["role"]
        stats[role] = stats.get(role, 0) + 1
    stats["total"] = sum(stats.values())
    return stats
