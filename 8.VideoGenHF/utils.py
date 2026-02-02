"""
Utility functions for video/image processing and caching
"""

import os
import hashlib
from PIL import Image
from typing import List
import imageio

from config import VIDEO_CONFIG

# Output directories
OUTPUT_DIR = "outputs"
VIDEOS_DIR = os.path.join(OUTPUT_DIR, "videos")
IMAGES_DIR = os.path.join(OUTPUT_DIR, "images")

# Create directories
os.makedirs(VIDEOS_DIR, exist_ok=True)
os.makedirs(IMAGES_DIR, exist_ok=True)


def generate_filename(prompt: str, seed: int, extension: str) -> str:
    """Generate unique filename from prompt and seed"""
    # Create short hash of prompt
    prompt_hash = hashlib.md5(prompt.encode()).hexdigest()[:8]
    return f"vintage_{prompt_hash}_{seed}.{extension}"


def save_image(image: Image.Image, prompt: str, seed: int) -> str:
    """Save image to outputs folder"""
    filename = generate_filename(prompt, seed, "png")
    filepath = os.path.join(IMAGES_DIR, filename)
    image.save(filepath, "PNG")
    return filepath


def save_video(frames: List[Image.Image], prompt: str, seed: int) -> tuple:
    """Save frames as MP4 and GIF"""
    base_name = generate_filename(prompt, seed, "")
    
    mp4_path = os.path.join(VIDEOS_DIR, base_name + "mp4")
    gif_path = os.path.join(VIDEOS_DIR, base_name + "gif")
    
    fps = VIDEO_CONFIG["fps"]
    
    # Convert PIL Images to numpy arrays
    frame_arrays = [
        imageio.core.util.Array(frame.convert("RGB"))
        for frame in frames
    ]
    
    # Save MP4
    try:
        imageio.mimsave(mp4_path, frame_arrays, fps=fps, codec="libx264", quality=8)
    except Exception as e:
        print(f"⚠️ Could not save MP4: {e}")
        mp4_path = None
    
    # Save GIF (always works)
    imageio.mimsave(gif_path, frame_arrays, fps=fps, loop=0)
    
    return mp4_path, gif_path


def list_outputs(output_type: str = "all") -> List[str]:
    """List all generated outputs"""
    files = []
    
    if output_type in ["all", "videos"]:
        if os.path.exists(VIDEOS_DIR):
            for f in os.listdir(VIDEOS_DIR):
                if f.endswith((".mp4", ".gif")):
                    files.append(os.path.join(VIDEOS_DIR, f))
    
    if output_type in ["all", "images"]:
        if os.path.exists(IMAGES_DIR):
            for f in os.listdir(IMAGES_DIR):
                if f.endswith(".png"):
                    files.append(os.path.join(IMAGES_DIR, f))
    
    # Sort by modification time (newest first)
    files.sort(key=lambda x: os.path.getmtime(x), reverse=True)
    return files


def validate_prompt(prompt: str) -> tuple:
    """Validate prompt for vintage bike context"""
    from config import ALLOWED_KEYWORDS, BLOCKED_KEYWORDS
    
    p = prompt.lower().strip()
    
    if not p:
        return False, "❌ Please enter a prompt"
    
    if len(p) < 10:
        return False, "❌ Prompt too short. Please be more descriptive."
    
    # Check for blocked keywords
    for blocked in BLOCKED_KEYWORDS:
        if blocked in p:
            return False, f"❌ Content not allowed: '{blocked}'"
    
    # Check for allowed keywords (at least one)
    has_context = any(allowed in p for allowed in ALLOWED_KEYWORDS)
    
    if not has_context:
        return False, "❌ Please include vintage motorcycle context (e.g., 'vintage motorcycle', 'classic bike')"
    
    return True, "✅ Prompt validated"


def build_prompt(user_prompt: str, era: str, camera: str) -> str:
    """Build enhanced prompt with context"""
    from config import ERA_DESCRIPTIONS, CAMERA_STYLES, BASE_STYLE
    
    era_desc = ERA_DESCRIPTIONS.get(era, ERA_DESCRIPTIONS["1970s"])
    camera_desc = CAMERA_STYLES.get(camera, CAMERA_STYLES["Pan"])
    
    # Build final prompt
    final_prompt = f"{camera_desc}, {era_desc}, {user_prompt.strip()}, {BASE_STYLE}"
    
    return final_prompt
