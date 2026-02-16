"""Audit log API router."""

from fastapi import APIRouter, Depends, Query
from typing import Optional
from app.core.deps import require_roles, CurrentUser
from app.audit.service import get_audit_logs

router = APIRouter(prefix="/audit", tags=["Audit Logs"])


@router.get("/logs")
async def list_audit_logs(
    limit: int = Query(50, le=200),
    offset: int = Query(0, ge=0),
    entity: Optional[str] = None,
    actor_id: Optional[str] = None,
    current_user: CurrentUser = Depends(require_roles(["admin", "super_admin"])),
):
    """Get audit logs (admin/super_admin only)."""
    logs = await get_audit_logs(
        limit=limit, offset=offset, entity=entity, actor_id=actor_id
    )
    return {"data": logs, "count": len(logs)}
