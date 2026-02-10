"""
Lightweight Supabase REST client using httpx.

The supabase-py library rejects non-JWT keys, so we talk
to the PostgREST API directly.  This keeps everything simple
and works with any valid API key format.
"""

import httpx
from config import SUPABASE_URL, SUPABASE_KEY

BASE_URL = f"{SUPABASE_URL}/rest/v1"

HEADERS = {
    "apikey": SUPABASE_KEY,
    "Authorization": f"Bearer {SUPABASE_KEY}",
    "Content-Type": "application/json",
    "Prefer": "return=representation",   # always return the affected rows
}


def get_client() -> httpx.Client:
    """Return a pre-configured httpx client."""
    return httpx.Client(base_url=BASE_URL, headers=HEADERS, timeout=30.0)
