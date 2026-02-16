"""Notification API endpoints."""

from fastapi import APIRouter, Depends, Query
from app.core.deps import get_current_user, CurrentUser
from app.notifications import service

router = APIRouter(prefix="/notifications", tags=["Notifications"])


@router.get("/")
async def list_notifications(
    limit: int = Query(50, le=200),
    unread_only: bool = False,
    current_user: CurrentUser = Depends(get_current_user),
):
    notifs = await service.get_notifications(current_user.id, limit, unread_only)
    return {"data": notifs, "count": len(notifs)}


@router.get("/unread-count")
async def unread_count(current_user: CurrentUser = Depends(get_current_user)):
    count = await service.get_unread_count(current_user.id)
    return {"count": count}


@router.put("/{notification_id}/read")
async def mark_read(notification_id: int, current_user: CurrentUser = Depends(get_current_user)):
    return await service.mark_read(notification_id, current_user.id)


@router.put("/read-all")
async def mark_all_read(current_user: CurrentUser = Depends(get_current_user)):
    count = await service.mark_all_read(current_user.id)
    return {"marked_read": count}
