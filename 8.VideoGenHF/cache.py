import hashlib
import os


CACHE_DIR = "cache"
os.makedirs(CACHE_DIR, exist_ok=True)


def cache_key(text: str) -> str:
    return hashlib.sha256(text.encode()).hexdigest()


def get_cached_video(key: str):
    path = os.path.join(CACHE_DIR, f"{key}.mp4")
    return path if os.path.exists(path) else None


def store_video(key: str, path: str):
    final_path = os.path.join(CACHE_DIR, f"{key}.mp4")
    os.replace(path, final_path)
    return final_path
