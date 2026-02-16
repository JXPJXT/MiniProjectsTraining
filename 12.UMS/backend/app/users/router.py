"""User management API endpoints."""

from fastapi import APIRouter, Depends, Query
from typing import Optional
from pydantic import BaseModel
from app.core.deps import require_roles, CurrentUser
from app.users import service

router = APIRouter(prefix="/users", tags=["User Management"])


class RoleUpdate(BaseModel):
    role: str


@router.get("/")
async def list_users(
    limit: int = Query(50, le=200),
    offset: int = Query(0, ge=0),
    role: Optional[str] = None,
    current_user: CurrentUser = Depends(require_roles(["admin", "super_admin"])),
):
    users = await service.list_users(limit, offset, role)
    return {"data": users, "count": len(users)}


@router.get("/stats")
async def user_stats(
    current_user: CurrentUser = Depends(require_roles(["admin", "super_admin"])),
):
    return await service.get_user_stats()


@router.get("/{user_id}")
async def get_user(
    user_id: str,
    current_user: CurrentUser = Depends(require_roles(["admin", "super_admin"])),
):
    return await service.get_user(user_id)


@router.put("/{user_id}/role")
async def update_role(
    user_id: str, data: RoleUpdate,
    current_user: CurrentUser = Depends(require_roles(["super_admin"])),
):
    """Update user role (super_admin only)."""
    return await service.update_user_role(user_id, data.role, current_user.id)


@router.delete("/{user_id}")
async def delete_user(
    user_id: str,
    current_user: CurrentUser = Depends(require_roles(["super_admin"])),
):
    """Delete a user (super_admin only)."""
    return await service.delete_user(user_id, current_user.id)
