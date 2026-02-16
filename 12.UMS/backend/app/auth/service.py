"""Auth business logic — registration, login, token refresh.
Uses our own users table with bcrypt-hashed passwords. No Supabase Auth dependency.
"""

import uuid
from fastapi import HTTPException, status
from app.core.database import get_supabase_admin
from app.core.security import (
    hash_password,
    verify_password,
    create_access_token,
    create_refresh_token,
    decode_token,
)
from app.auth.schemas import RegisterRequest, LoginRequest


VALID_ROLES = {"student", "faculty", "tpc", "admin", "super_admin"}


async def register_user(data: RegisterRequest) -> dict:
    """Register a new user — hash password and store in our users table."""
    if data.role not in VALID_ROLES:
        raise HTTPException(status_code=400, detail=f"Invalid role: {data.role}")

    db = get_supabase_admin()

    # Check if email already exists
    existing = db.table("users").select("id").eq("email", data.email).execute()
    if existing.data:
        raise HTTPException(status_code=400, detail="Email already registered")

    # Generate UUID and hash password
    user_id = str(uuid.uuid4())
    hashed = hash_password(data.password)

    # Insert into users table
    db.table("users").insert({
        "id": user_id,
        "email": data.email,
        "password_hash": hashed,
        "full_name": data.full_name,
        "role": data.role,
    }).execute()

    # Generate tokens
    token_data = {"sub": user_id, "email": data.email, "role": data.role}
    access = create_access_token(token_data)
    refresh = create_refresh_token(token_data)

    return {
        "access_token": access,
        "refresh_token": refresh,
        "token_type": "bearer",
        "user_id": user_id,
        "role": data.role,
    }


async def login_user(data: LoginRequest) -> dict:
    """Authenticate user against our own users table."""
    db = get_supabase_admin()

    # Look up user by email
    result = db.table("users").select("*").eq("email", data.email).execute()
    if not result.data:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid email or password",
        )

    user = result.data[0]

    # Verify password
    if not verify_password(data.password, user["password_hash"]):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid email or password",
        )

    token_data = {"sub": user["id"], "email": user["email"], "role": user["role"]}
    access = create_access_token(token_data)
    refresh = create_refresh_token(token_data)

    return {
        "access_token": access,
        "refresh_token": refresh,
        "token_type": "bearer",
        "user_id": user["id"],
        "role": user["role"],
    }


async def refresh_tokens(refresh_token: str) -> dict:
    """Verify refresh token and issue new tokens."""
    payload = decode_token(refresh_token)
    if not payload or payload.get("type") != "refresh":
        raise HTTPException(status_code=401, detail="Invalid refresh token")

    user_id = payload.get("sub")
    db = get_supabase_admin()
    result = db.table("users").select("role, email").eq("id", user_id).execute()
    if not result.data:
        raise HTTPException(status_code=404, detail="User not found")

    user = result.data[0]
    token_data = {"sub": user_id, "email": user["email"], "role": user["role"]}
    access = create_access_token(token_data)
    new_refresh = create_refresh_token(token_data)

    return {
        "access_token": access,
        "refresh_token": new_refresh,
        "token_type": "bearer",
        "user_id": user_id,
        "role": user["role"],
    }
