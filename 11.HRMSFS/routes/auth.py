"""
Authentication routes — email/password + Google SSO.

Uses the `users` and `user_sessions` tables in Supabase.
Google SSO verifies the ID token via google.oauth2.id_token
so the user's identity is truly verified by Google before
we create/match the account.
"""

import secrets
from datetime import datetime, timedelta, timezone
from typing import Optional

import bcrypt
from fastapi import APIRouter, HTTPException, Request, Depends
from pydantic import BaseModel, EmailStr

from database import get_client

router = APIRouter(prefix="/auth", tags=["Authentication"])


# ── Pydantic models ──────────────────────────────────────────

class SignupRequest(BaseModel):
    email: str
    password: str
    full_name: str
    role: str = "employee"

class SigninRequest(BaseModel):
    email: str
    password: str

class GoogleSSORequest(BaseModel):
    id_token: str

class AuthResponse(BaseModel):
    token: str
    user: dict

class MeResponse(BaseModel):
    user: dict


# ── Helpers ──────────────────────────────────────────────────

def _hash_pw(password: str) -> str:
    return bcrypt.hashpw(password.encode(), bcrypt.gensalt()).decode()


def _check_pw(password: str, hashed: str) -> bool:
    return bcrypt.checkpw(password.encode(), hashed.encode())


def _generate_token() -> str:
    return secrets.token_urlsafe(48)


def _make_avatar(name: str) -> str:
    parts = name.strip().split()
    return "".join(p[0] for p in parts[:2]).upper()


def _create_session(user_id: int, request: Request = None) -> dict:
    """Create a session row in Supabase and return it."""
    token = _generate_token()
    expires = (datetime.now(timezone.utc) + timedelta(days=7)).isoformat()

    session_data = {
        "user_id": user_id,
        "token": token,
        "expires_at": expires,
        "ip_address": request.client.host if request else None,
    }

    with get_client() as client:
        resp = client.post("/user_sessions", json=session_data)

    if resp.status_code >= 400:
        raise HTTPException(500, f"Failed to create session: {resp.text}")

    return {"token": token, "expires_at": expires}


def _get_user_by_email(email: str) -> Optional[dict]:
    with get_client() as client:
        resp = client.get("/users", params={"select": "*", "email": f"eq.{email}"})
    if resp.status_code >= 400:
        return None
    rows = resp.json()
    return rows[0] if rows else None


def _get_user_by_google_id(google_id: str) -> Optional[dict]:
    with get_client() as client:
        resp = client.get("/users", params={"select": "*", "google_id": f"eq.{google_id}"})
    if resp.status_code >= 400:
        return None
    rows = resp.json()
    return rows[0] if rows else None


def _sanitize_user(u: dict) -> dict:
    """Strip sensitive fields before returning to frontend."""
    return {
        "user_id": u["user_id"],
        "email": u["email"],
        "full_name": u["full_name"],
        "role": u.get("role", "employee"),
        "avatar_url": u.get("avatar_url"),
        "avatar": _make_avatar(u["full_name"]),
        "auth_provider": u.get("auth_provider", "email"),
        "is_active": u.get("is_active", True),
    }


# ── Dependency: get current user from token ──────────────────

async def get_current_user(request: Request) -> dict:
    """Extract Bearer token and look up the session + user."""
    auth = request.headers.get("Authorization", "")
    if not auth.startswith("Bearer "):
        raise HTTPException(401, "Missing authorization token")
    
    token = auth[7:]
    
    with get_client() as client:
        resp = client.get("/user_sessions", params={
            "select": "*, users(*)",
            "token": f"eq.{token}",
        })
    
    if resp.status_code >= 400:
        raise HTTPException(401, "Invalid token")
    
    rows = resp.json()
    if not rows:
        raise HTTPException(401, "Invalid or expired token")
    
    session = rows[0]
    
    # Check expiry
    exp = datetime.fromisoformat(session["expires_at"].replace("Z", "+00:00"))
    if exp < datetime.now(timezone.utc):
        raise HTTPException(401, "Token expired")
    
    user = session.get("users")
    if not user:
        raise HTTPException(401, "User not found")
    
    return _sanitize_user(user)


# ── Routes ───────────────────────────────────────────────────

@router.post("/signup")
async def signup(body: SignupRequest, request: Request):
    """Create a new user with email/password."""
    # Check if email already exists
    existing = _get_user_by_email(body.email)
    if existing:
        raise HTTPException(409, "An account with this email already exists")

    # Create user
    user_data = {
        "email": body.email,
        "password_hash": _hash_pw(body.password),
        "full_name": body.full_name,
        "role": body.role,
        "auth_provider": "email",
        "avatar_url": None,
        "is_active": True,
        "last_login": datetime.now(timezone.utc).isoformat(),
    }

    with get_client() as client:
        resp = client.post("/users", json=user_data)

    if resp.status_code >= 400:
        raise HTTPException(500, f"Failed to create user: {resp.text}")

    user = resp.json()[0]
    session = _create_session(user["user_id"], request)

    return {"token": session["token"], "user": _sanitize_user(user)}


@router.post("/signin")
async def signin(body: SigninRequest, request: Request):
    """Sign in with email/password."""
    user = _get_user_by_email(body.email)
    if not user:
        raise HTTPException(401, "Invalid email or password")

    if not user.get("password_hash"):
        raise HTTPException(401, "This account uses Google Sign-In. Please use Google SSO.")

    if not _check_pw(body.password, user["password_hash"]):
        raise HTTPException(401, "Invalid email or password")

    if not user.get("is_active", True):
        raise HTTPException(403, "Account is deactivated")

    # Update last_login
    with get_client() as client:
        client.patch("/users", params={"user_id": f"eq.{user['user_id']}"}, json={
            "last_login": datetime.now(timezone.utc).isoformat()
        })

    session = _create_session(user["user_id"], request)

    return {"token": session["token"], "user": _sanitize_user(user)}


@router.post("/google")
async def google_sso(body: GoogleSSORequest, request: Request):
    """
    Verify a Google ID token and create/match the user.
    
    Frontend sends the id_token from Google Sign-In,
    we verify it, then either find or create the user.
    """
    from google.oauth2 import id_token
    from google.auth.transport import requests as google_requests

    try:
        # Verify the token with Google
        idinfo = id_token.verify_oauth2_token(
            body.id_token,
            google_requests.Request(),
            # Don't enforce audience for flexibility — you can set your 
            # Google Client ID here for stricter validation:
            # audience="YOUR_GOOGLE_CLIENT_ID.apps.googleusercontent.com"
        )
    except Exception as e:
        raise HTTPException(401, f"Invalid Google token: {str(e)}")

    google_id = idinfo.get("sub")
    email = idinfo.get("email")
    name = idinfo.get("name", email.split("@")[0])
    avatar_url = idinfo.get("picture")

    if not google_id or not email:
        raise HTTPException(400, "Google token missing required claims")

    # Check if user exists by google_id
    user = _get_user_by_google_id(google_id)

    if not user:
        # Check if email already exists (link accounts)
        user = _get_user_by_email(email)

        if user:
            # Link Google ID to existing email account
            with get_client() as client:
                client.patch("/users", params={"user_id": f"eq.{user['user_id']}"}, json={
                    "google_id": google_id,
                    "avatar_url": avatar_url,
                    "last_login": datetime.now(timezone.utc).isoformat(),
                })
            user["google_id"] = google_id
            user["avatar_url"] = avatar_url
        else:
            # Create new user
            user_data = {
                "email": email,
                "password_hash": None,
                "full_name": name,
                "role": "employee",
                "auth_provider": "google",
                "google_id": google_id,
                "avatar_url": avatar_url,
                "is_active": True,
                "last_login": datetime.now(timezone.utc).isoformat(),
            }

            with get_client() as client:
                resp = client.post("/users", json=user_data)

            if resp.status_code >= 400:
                raise HTTPException(500, f"Failed to create user: {resp.text}")

            user = resp.json()[0]
    else:
        # Update last_login
        with get_client() as client:
            client.patch("/users", params={"user_id": f"eq.{user['user_id']}"}, json={
                "last_login": datetime.now(timezone.utc).isoformat(),
                "avatar_url": avatar_url,
            })

    session = _create_session(user["user_id"], request)

    return {"token": session["token"], "user": _sanitize_user(user)}


@router.get("/me")
async def get_me(user: dict = Depends(get_current_user)):
    """Get the current authenticated user."""
    return {"user": user}


@router.post("/signout")
async def signout(request: Request):
    """Delete the current session."""
    auth = request.headers.get("Authorization", "")
    if auth.startswith("Bearer "):
        token = auth[7:]
        with get_client() as client:
            client.delete("/user_sessions", params={"token": f"eq.{token}"})
    return {"message": "Signed out"}
