"""
Schemas for assets.
"""

from datetime import date, datetime
from typing import Optional
from pydantic import BaseModel


class AssetCreate(BaseModel):
    name: str
    serial_number: Optional[str] = None
    model: Optional[str] = None
    assigned_to: Optional[int] = None
    assigned_date: Optional[date] = None
    returned_date: Optional[date] = None
    status: Optional[str] = "available"
    condition: Optional[str] = None
    purchase_date: Optional[date] = None
    warranty_expiry: Optional[date] = None


class AssetUpdate(BaseModel):
    name: Optional[str] = None
    serial_number: Optional[str] = None
    model: Optional[str] = None
    assigned_to: Optional[int] = None
    assigned_date: Optional[date] = None
    returned_date: Optional[date] = None
    status: Optional[str] = None
    condition: Optional[str] = None
    purchase_date: Optional[date] = None
    warranty_expiry: Optional[date] = None


class AssetOut(AssetCreate):
    asset_id: int
    created_at: Optional[datetime] = None

    class Config:
        from_attributes = True
