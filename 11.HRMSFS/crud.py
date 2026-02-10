"""
Generic CRUD helper using httpx against Supabase PostgREST.

Every route module delegates to these functions so we
have a single place to maintain query logic.
"""

from typing import Any, Optional
from fastapi import HTTPException
from database import get_client


def _serialize(data: dict) -> dict:
    """Convert date/datetime objects to ISO strings for JSON."""
    clean = {}
    for k, v in data.items():
        if v is None:
            continue
        if hasattr(v, "isoformat"):
            clean[k] = v.isoformat()
        else:
            clean[k] = v
    return clean


def list_records(
    table: str,
    *,
    limit: int = 100,
    offset: int = 0,
    order_by: Optional[str] = None,
    ascending: bool = True,
    filters: Optional[dict[str, Any]] = None,
) -> list[dict]:
    """Return a paginated list from *table*."""
    params: dict[str, str] = {"select": "*"}

    if filters:
        for col, val in filters.items():
            params[col] = f"eq.{val}"

    if order_by:
        direction = "asc" if ascending else "desc"
        params["order"] = f"{order_by}.{direction}"

    headers = {"Range": f"{offset}-{offset + limit - 1}"}

    with get_client() as client:
        resp = client.get(f"/{table}", params=params, headers=headers)

    if resp.status_code >= 400:
        raise HTTPException(status_code=resp.status_code, detail=resp.text)
    return resp.json()


def get_record(table: str, pk_col: str, pk_val: Any) -> dict:
    """Return a single row or raise 404."""
    params = {"select": "*", pk_col: f"eq.{pk_val}"}

    with get_client() as client:
        resp = client.get(f"/{table}", params=params)

    if resp.status_code >= 400:
        raise HTTPException(status_code=resp.status_code, detail=resp.text)

    rows = resp.json()
    if not rows:
        raise HTTPException(status_code=404, detail=f"{table} record {pk_val} not found")
    return rows[0]


def create_record(table: str, data: dict) -> dict:
    """Insert a row and return it."""
    clean = _serialize(data)

    with get_client() as client:
        resp = client.post(f"/{table}", json=clean)

    if resp.status_code >= 400:
        raise HTTPException(status_code=resp.status_code, detail=resp.text)

    rows = resp.json()
    if not rows:
        raise HTTPException(status_code=400, detail="Insert returned no data")
    return rows[0]


def update_record(table: str, pk_col: str, pk_val: Any, data: dict) -> dict:
    """Update a row and return it, or raise 404."""
    clean = _serialize(data)
    if not clean:
        raise HTTPException(status_code=400, detail="No fields to update")

    params = {pk_col: f"eq.{pk_val}"}

    with get_client() as client:
        resp = client.patch(f"/{table}", params=params, json=clean)

    if resp.status_code >= 400:
        raise HTTPException(status_code=resp.status_code, detail=resp.text)

    rows = resp.json()
    if not rows:
        raise HTTPException(status_code=404, detail=f"{table} record {pk_val} not found")
    return rows[0]


def delete_record(table: str, pk_col: str, pk_val: Any) -> dict:
    """Delete a row and return the deleted record, or raise 404."""
    params = {pk_col: f"eq.{pk_val}"}

    with get_client() as client:
        resp = client.delete(f"/{table}", params=params)

    if resp.status_code >= 400:
        raise HTTPException(status_code=resp.status_code, detail=resp.text)

    rows = resp.json()
    if not rows:
        raise HTTPException(status_code=404, detail=f"{table} record {pk_val} not found")
    return rows[0]
