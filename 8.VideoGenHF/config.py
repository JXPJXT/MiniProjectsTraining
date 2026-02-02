"""
Configuration for Vintage Bike Video Generator
Optimized for RTX 3050 6GB VRAM - LAPTOP SAFE MODE
"""

import torch

# Device Configuration
DEVICE = "cuda" if torch.cuda.is_available() else "cpu"
DTYPE = torch.float16 if DEVICE == "cuda" else torch.float32

# ============================================
# THERMAL PROTECTION (Laptop Safe Mode)
# ============================================
THERMAL_CONFIG = {
    "max_temp_celsius": 80,      # Pause if GPU hits 80°C (well below throttle point)
    "cool_down_temp": 70,        # Resume when cooled to 70°C
    "check_interval_seconds": 5, # Check temp every 5 seconds during generation
    "delay_between_generations": 3,  # Wait 3 seconds between generations
    "enable_monitoring": True,   # Enable thermal monitoring
}

# Model Configuration - Using smallest models
# Option 1: Text2Video-Zero (uses SD 1.5, very lightweight)
# Option 2: AnimateDiff (needs motion module but small)
MODEL_CONFIG = {
    # Smallest stable diffusion model
    "sd_model": "runwayml/stable-diffusion-v1-5",
    # AnimateDiff motion module (small ~400MB)
    "motion_module": "guoyww/animatediff-motion-adapter-v1-5-2",
}

# Video Generation Settings (VERY conservative for 6GB)
VIDEO_CONFIG = {
    "num_frames": 8,          # Minimum frames for animation
    "height": 256,            # Low resolution
    "width": 256,             # Low resolution  
    "num_inference_steps": 15,  # Lower = faster + less VRAM
    "guidance_scale": 7.0,
    "fps": 6
}

# Image Generation Settings (for fallback)
IMAGE_CONFIG = {
    "height": 512,
    "width": 512,
    "num_inference_steps": 20,
    "guidance_scale": 7.5,
}

# Vintage Bike Context Keywords
ALLOWED_KEYWORDS = {
    "vintage", "classic", "motorcycle", "bike", "cafe racer",
    "retro", "1960s", "1970s", "1980s", "chrome", "air cooled",
    "triumph", "norton", "bsa", "harley", "indian", "royal enfield",
    "chopper", "bobber", "scrambler", "custom", "restoration",
    "motorbike", "engine", "wheel", "handlebar", "exhaust"
}

BLOCKED_KEYWORDS = {
    "person", "people", "face", "human", "animal", "gun", "weapon",
    "car", "truck", "futuristic", "cyberpunk", "modern", "electric",
    "robot", "alien", "fantasy", "nude", "violence", "blood"
}

# Era Descriptions
ERA_DESCRIPTIONS = {
    "1950s": "1950s vintage motorcycle, classic chrome, leather seat, spoke wheels",
    "1960s": "1960s vintage motorcycle, British cafe racer, analog gauges",
    "1970s": "1970s vintage motorcycle, cafe racer, chrome exhaust pipes",
    "1980s": "1980s retro motorcycle, air cooled engine, classic bodywork",
    "Custom": "custom vintage motorcycle, hand-built, artisan craftsmanship"
}

# Camera Styles
CAMERA_STYLES = {
    "Static": "static shot, professional photography",
    "Pan": "slow cinematic pan, smooth movement",
    "Detail": "close-up detail shot, macro view",
    "Wide": "wide establishing shot, full view"
}

# Base Style (simplified for better results)
BASE_STYLE = "cinematic, professional photography, natural lighting, high quality, detailed"

# Preset Prompts
PRESET_PROMPTS = {
    "🏍️ Classic Cafe Racer": "classic cafe racer motorcycle parked on street",
    "🔧 Garage Scene": "vintage motorcycle in garage workshop, tools visible",
    "🌅 Sunset Silhouette": "vintage motorcycle silhouette against sunset",
    "🪞 Chrome Details": "vintage motorcycle chrome engine, polished metal",
    "🌿 Country Road": "vintage motorcycle on country road, scenic"
}
