"""Auth business logic — registration, login, token refresh."""

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
    """Register a new user with Supabase Auth + our users table."""
    if data.role not in VALID_ROLES:
        raise HTTPException(status_code=400, detail=f"Invalid role: {data.role}")

    db = get_supabase_admin()

    # Create user in Supabase Auth
    try:
        auth_resp = db.auth.admin.create_user({
            "email": data.email,
            "password": data.password,
            "email_confirm": True,
            "user_metadata": {"full_name": data.full_name, "role": data.role},
        })
        user_id = auth_resp.user.id
    except Exception as e:
        raise HTTPException(status_code=400, detail=f"Registration failed: {str(e)}")

    # Insert into our users table
    db.table("users").insert({
        "id": str(user_id),
        "role": data.role,
    }).execute()

    # Generate tokens
    token_data = {"sub": str(user_id), "email": data.email, "role": data.role}
    access = create_access_token(token_data)
    refresh = create_refresh_token(token_data)

    return {
        "access_token": access,
        "refresh_token": refresh,
        "token_type": "bearer",
        "user_id": str(user_id),
        "role": data.role,
    }


async def login_user(data: LoginRequest) -> dict:
    """Authenticate with Supabase Auth and return JWT tokens."""
    db = get_supabase_admin()

    try:
        auth_resp = db.auth.sign_in_with_password({
            "email": data.email,
            "password": data.password,
        })
        user_id = auth_resp.user.id
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid credentials",
        )

    # Get role from our table
    result = db.table("users").select("role").eq("id", str(user_id)).execute()
    if not result.data:
        raise HTTPException(status_code=404, detail="User profile not found")

    role = result.data[0]["role"]
    token_data = {"sub": str(user_id), "email": data.email, "role": role}
    access = create_access_token(token_data)
    refresh = create_refresh_token(token_data)

    return {
        "access_token": access,
        "refresh_token": refresh,
        "token_type": "bearer",
        "user_id": str(user_id),
        "role": role,
    }


async def refresh_tokens(refresh_token: str) -> dict:
    """Verify refresh token and issue new access + refresh tokens."""
    payload = decode_token(refresh_token)
    if not payload or payload.get("type") != "refresh":
        raise HTTPException(status_code=401, detail="Invalid refresh token")

    user_id = payload.get("sub")
    db = get_supabase_admin()
    result = db.table("users").select("role").eq("id", user_id).execute()
    if not result.data:
        raise HTTPException(status_code=404, detail="User not found")

    role = result.data[0]["role"]
    token_data = {"sub": user_id, "email": payload.get("email"), "role": role}
    access = create_access_token(token_data)
    new_refresh = create_refresh_token(token_data)

    return {
        "access_token": access,
        "refresh_token": new_refresh,
        "token_type": "bearer",
        "user_id": user_id,
        "role": role,
    }
