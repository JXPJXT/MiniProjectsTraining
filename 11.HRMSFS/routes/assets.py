"""
Routes for assets.
"""

from fastapi import APIRouter, Query
from typing import Optional
from schemas.assets import AssetCreate, AssetUpdate, AssetOut
import crud

router = APIRouter(prefix="/assets", tags=["Assets"])


@router.get("/", summary="List assets")
def list_assets(limit: int = 100, offset: int = 0, status: Optional[str] = None, assigned_to: Optional[int] = None):
    filters = {}
    if status:
        filters["status"] = status
    if assigned_to:
        filters["assigned_to"] = assigned_to
    return crud.list_records("assets", limit=limit, offset=offset, order_by="asset_id", filters=filters or None)


@router.get("/{asset_id}", summary="Get asset by ID")
def get_asset(asset_id: int):
    return crud.get_record("assets", "asset_id", asset_id)


@router.post("/", status_code=201, summary="Create asset")
def create_asset(body: AssetCreate):
    return crud.create_record("assets", body.model_dump())


@router.put("/{asset_id}", summary="Update asset")
def update_asset(asset_id: int, body: AssetUpdate):
    return crud.update_record("assets", "asset_id", asset_id, body.model_dump(exclude_unset=True))


@router.delete("/{asset_id}", summary="Delete asset")
def delete_asset(asset_id: int):
    return crud.delete_record("assets", "asset_id", asset_id)
