"""Supabase Storage helpers — upload, download signed URLs, delete."""

from app.core.database import get_supabase_admin
from app.core.config import get_settings
from fastapi import UploadFile
import uuid


async def upload_file(file: UploadFile, folder: str) -> str:
    """Upload a file to Supabase Storage and return the path."""
    settings = get_settings()
    db = get_supabase_admin()
    
    ext = file.filename.split(".")[-1] if "." in file.filename else "bin"
    file_name = f"{folder}/{uuid.uuid4().hex}.{ext}"
    content = await file.read()
    
    db.storage.from_(settings.SUPABASE_STORAGE_BUCKET).upload(
        path=file_name,
        file=content,
        file_options={"content-type": file.content_type or "application/octet-stream"},
    )
    
    return file_name


def get_signed_url(file_path: str, expires_in: int = 3600) -> str:
    """Generate a signed URL for private file access."""
    settings = get_settings()
    db = get_supabase_admin()
    
    result = db.storage.from_(settings.SUPABASE_STORAGE_BUCKET).create_signed_url(
        path=file_path, expires_in=expires_in
    )
    return result.get("signedURL", "")


def delete_file(file_path: str) -> bool:
    """Delete a file from storage."""
    settings = get_settings()
    db = get_supabase_admin()
    
    try:
        db.storage.from_(settings.SUPABASE_STORAGE_BUCKET).remove([file_path])
        return True
    except Exception:
        return False
