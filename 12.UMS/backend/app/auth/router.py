"""Auth API endpoints."""

from fastapi import APIRouter, Depends
from app.auth.schemas import (
    RegisterRequest,
    LoginRequest,
    TokenResponse,
    RefreshRequest,
    UserProfile,
)
from app.auth.service import register_user, login_user, refresh_tokens
from app.core.deps import get_current_user, CurrentUser

router = APIRouter(prefix="/auth", tags=["Authentication"])


@router.post("/register", response_model=TokenResponse)
async def register(data: RegisterRequest):
    """Register a new user."""
    return await register_user(data)


@router.post("/login", response_model=TokenResponse)
async def login(data: LoginRequest):
    """Login and receive JWT tokens."""
    return await login_user(data)


@router.post("/refresh", response_model=TokenResponse)
async def refresh(data: RefreshRequest):
    """Refresh access token."""
    return await refresh_tokens(data.refresh_token)


@router.get("/me", response_model=UserProfile)
async def me(current_user: CurrentUser = Depends(get_current_user)):
    """Get current user profile."""
    return UserProfile(
        id=current_user.id,
        email=current_user.email,
        role=current_user.role,
    )
