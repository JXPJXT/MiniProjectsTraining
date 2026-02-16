"""Audit logging service — records all admin/TPC actions for compliance."""

from typing import Optional
from app.core.database import get_supabase_admin


async def log_action(
    actor_id: str,
    action: str,
    entity: str,
    entity_id: Optional[str] = None,
    old_data: Optional[dict] = None,
    new_data: Optional[dict] = None,
):
    """Insert an audit log entry."""
    db = get_supabase_admin()
    db.table("audit_logs").insert({
        "actor_id": actor_id,
        "action": action,
        "entity": entity,
        "entity_id": entity_id,
        "old_data": old_data,
        "new_data": new_data,
    }).execute()


async def get_audit_logs(
    limit: int = 50,
    offset: int = 0,
    entity: Optional[str] = None,
    actor_id: Optional[str] = None,
) -> list:
    """Retrieve audit logs with optional filters."""
    db = get_supabase_admin()
    query = db.table("audit_logs").select("*").order("created_at", desc=True)

    if entity:
        query = query.eq("entity", entity)
    if actor_id:
        query = query.eq("actor_id", actor_id)

    result = query.range(offset, offset + limit - 1).execute()
    return result.data or []
