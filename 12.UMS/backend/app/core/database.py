"""Supabase client initialization and helpers."""

from supabase import create_client, Client
from app.core.config import get_settings

_client: Client | None = None
_service_client: Client | None = None


def get_supabase() -> Client:
    """Get Supabase client with anon key (respects RLS)."""
    global _client
    if _client is None:
        settings = get_settings()
        _client = create_client(settings.SUPABASE_URL, settings.SUPABASE_KEY)
    return _client


def get_supabase_admin() -> Client:
    """Get Supabase client with service role key (bypasses RLS)."""
    global _service_client
    if _service_client is None:
        settings = get_settings()
        _service_client = create_client(settings.SUPABASE_URL, settings.SUPABASE_SERVICE_KEY)
    return _service_client
