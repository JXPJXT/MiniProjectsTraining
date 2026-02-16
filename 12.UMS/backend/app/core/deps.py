"""FastAPI dependency injection — current user extraction and role enforcement."""

from typing import List, Optional
from fastapi import Depends, HTTPException, status
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
from app.core.security import decode_token
from app.core.database import get_supabase_admin
from pydantic import BaseModel

security = HTTPBearer()


class CurrentUser(BaseModel):
    id: str
    role: str
    email: Optional[str] = None
    full_name: Optional[str] = None


async def get_current_user(
    credentials: HTTPAuthorizationCredentials = Depends(security),
) -> CurrentUser:
    """Extract and validate the current user from the JWT token."""
    token = credentials.credentials
    payload = decode_token(token)
    
    user_id = payload.get("sub")
    if not user_id:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid authentication token",
        )
    
    # Fetch user from our own table
    db = get_supabase_admin()
    result = db.table("users").select("role, email, full_name").eq("id", user_id).execute()
    
    if not result.data:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="User not found",
        )
    
    user = result.data[0]
    return CurrentUser(
        id=user_id,
        role=user["role"],
        email=user.get("email"),
        full_name=user.get("full_name"),
    )


def require_roles(allowed_roles: List[str]):
    """Dependency factory: restrict endpoint to specific roles."""
    async def role_checker(current_user: CurrentUser = Depends(get_current_user)):
        if current_user.role not in allowed_roles:
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail=f"Role '{current_user.role}' is not authorized for this action",
            )
        return current_user
    return role_checker
