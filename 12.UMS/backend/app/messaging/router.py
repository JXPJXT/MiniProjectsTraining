"""Messaging API endpoints."""

from fastapi import APIRouter, Depends, Query
from app.core.deps import get_current_user, require_roles, CurrentUser
from app.messaging.schemas import MessageCreate, BroadcastCreate
from app.messaging import service

router = APIRouter(prefix="/messages", tags=["Messaging"])


@router.post("/send")
async def send_message(data: MessageCreate, current_user: CurrentUser = Depends(get_current_user)):
    return await service.send_message(current_user.id, data.receiver_id, data.content)


@router.get("/conversations")
async def conversations(current_user: CurrentUser = Depends(get_current_user)):
    return {"data": await service.get_conversations(current_user.id)}


@router.get("/thread/{partner_id}")
async def thread(
    partner_id: str,
    limit: int = Query(100, le=500),
    current_user: CurrentUser = Depends(get_current_user),
):
    return {"data": await service.get_thread(current_user.id, partner_id, limit)}


@router.post("/broadcast")
async def broadcast(
    data: BroadcastCreate,
    current_user: CurrentUser = Depends(require_roles(["admin", "super_admin", "tpc"])),
):
    """Broadcast message to a role or stream."""
    return await service.broadcast_message(current_user.id, data.content, data.target_role, data.target_stream)


@router.get("/unread-count")
async def unread_count(current_user: CurrentUser = Depends(get_current_user)):
    count = await service.get_unread_message_count(current_user.id)
    return {"count": count}
