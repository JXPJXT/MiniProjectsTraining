"""
Video/Image Generator - Optimized for RTX 3050 6GB
Uses smallest possible models with aggressive memory management
"""

import torch
import gc
import numpy as np
from PIL import Image
from typing import List, Optional, Tuple
import os

# Set memory-efficient settings BEFORE importing diffusers
os.environ["PYTORCH_CUDA_ALLOC_CONF"] = "max_split_size_mb:128"

from diffusers import (
    StableDiffusionPipeline,
    AnimateDiffPipeline,
    MotionAdapter,
    DDIMScheduler,
    DPMSolverMultistepScheduler
)
from diffusers.utils import export_to_gif, export_to_video

from config import (
    DEVICE, DTYPE, MODEL_CONFIG, VIDEO_CONFIG, IMAGE_CONFIG
)


def clear_memory():
    """Aggressively clear GPU memory"""
    gc.collect()
    if torch.cuda.is_available():
        torch.cuda.empty_cache()
        torch.cuda.synchronize()


class VintageGenerator:
    """
    Lightweight generator for RTX 3050 6GB
    Supports both image and video generation
    """
    
    def __init__(self):
        self.image_pipe = None
        self.video_pipe = None
        self.current_mode = None
        
    def _get_scheduler(self):
        """Get memory-efficient scheduler"""
        return DPMSolverMultistepScheduler(
            beta_start=0.00085,
            beta_end=0.012,
            beta_schedule="scaled_linear",
            num_train_timesteps=1000,
            steps_offset=1
        )
    
    def load_image_model(self):
        """Load SD 1.5 for image generation (smallest SD model)"""
        if self.current_mode == "image":
            return
            
        # Unload any existing model first
        self.unload()
        clear_memory()
        
        print("🔄 Loading image model (SD 1.5)...")
        
        self.image_pipe = StableDiffusionPipeline.from_pretrained(
            MODEL_CONFIG["sd_model"],
            torch_dtype=DTYPE,
            safety_checker=None,  # Disable for memory
            requires_safety_checker=False,
            variant="fp16" if DTYPE == torch.float16 else None
        )
        
        # Apply memory optimizations
        self.image_pipe.scheduler = self._get_scheduler()
        self.image_pipe.enable_attention_slicing(1)  # Most aggressive
        self.image_pipe.enable_vae_slicing()
        self.image_pipe.enable_vae_tiling()
        
        # Use sequential CPU offload for minimal VRAM
        self.image_pipe.enable_sequential_cpu_offload()
        
        self.current_mode = "image"
        print("✅ Image model ready!")
        
    def load_video_model(self):
        """Load AnimateDiff for video generation"""
        if self.current_mode == "video":
            return
            
        # Unload any existing model first
        self.unload()
        clear_memory()
        
        print("🔄 Loading video model (AnimateDiff)...")
        
        try:
            # Load motion adapter
            adapter = MotionAdapter.from_pretrained(
                MODEL_CONFIG["motion_module"],
                torch_dtype=DTYPE
            )
            
            # Load AnimateDiff pipeline
            self.video_pipe = AnimateDiffPipeline.from_pretrained(
                MODEL_CONFIG["sd_model"],
                motion_adapter=adapter,
                torch_dtype=DTYPE,
                safety_checker=None,
                requires_safety_checker=False
            )
            
            # Apply aggressive memory optimizations
            self.video_pipe.scheduler = DDIMScheduler.from_pretrained(
                MODEL_CONFIG["sd_model"],
                subfolder="scheduler",
                clip_sample=False,
                timestep_spacing="linspace",
                beta_schedule="linear",
                steps_offset=1,
            )
            
            self.video_pipe.enable_attention_slicing(1)
            self.video_pipe.enable_vae_slicing()
            self.video_pipe.enable_vae_tiling()
            
            # Use sequential CPU offload
            self.video_pipe.enable_sequential_cpu_offload()
            
            self.current_mode = "video"
            print("✅ Video model ready!")
            
        except Exception as e:
            print(f"⚠️ Could not load video model: {e}")
            print("📝 Falling back to image-based animation...")
            self.load_image_model()
            self.current_mode = "image_fallback"
    
    def generate_image(
        self,
        prompt: str,
        negative_prompt: str = "blurry, low quality, distorted, ugly",
        seed: Optional[int] = None
    ) -> Tuple[Image.Image, int]:
        """Generate a single image"""
        self.load_image_model()
        clear_memory()
        
        if seed is None:
            seed = torch.randint(0, 2**32, (1,)).item()
        
        generator = torch.Generator(device="cpu").manual_seed(seed)
        
        print(f"🎨 Generating image (seed: {seed})...")
        
        with torch.inference_mode():
            result = self.image_pipe(
                prompt=prompt,
                negative_prompt=negative_prompt,
                height=IMAGE_CONFIG["height"],
                width=IMAGE_CONFIG["width"],
                num_inference_steps=IMAGE_CONFIG["num_inference_steps"],
                guidance_scale=IMAGE_CONFIG["guidance_scale"],
                generator=generator
            )
        
        image = result.images[0]
        clear_memory()
        
        print("✅ Image generated!")
        return image, seed
    
    def generate_video(
        self,
        prompt: str,
        negative_prompt: str = "blurry, low quality, distorted, static, still",
        seed: Optional[int] = None
    ) -> Tuple[List[Image.Image], int]:
        """Generate video frames"""
        
        # Try video model first
        if self.current_mode != "image_fallback":
            try:
                self.load_video_model()
            except:
                self.current_mode = "image_fallback"
        
        clear_memory()
        
        if seed is None:
            seed = torch.randint(0, 2**32, (1,)).item()
        
        generator = torch.Generator(device="cpu").manual_seed(seed)
        
        if self.current_mode == "video" and self.video_pipe is not None:
            # Use AnimateDiff
            print(f"🎬 Generating video (seed: {seed})...")
            
            with torch.inference_mode():
                result = self.video_pipe(
                    prompt=prompt,
                    negative_prompt=negative_prompt,
                    num_frames=VIDEO_CONFIG["num_frames"],
                    height=VIDEO_CONFIG["height"],
                    width=VIDEO_CONFIG["width"],
                    num_inference_steps=VIDEO_CONFIG["num_inference_steps"],
                    guidance_scale=VIDEO_CONFIG["guidance_scale"],
                    generator=generator
                )
            
            frames = result.frames[0]  # List of PIL Images
            
        else:
            # Fallback: Generate single image, create simple animation
            print(f"🎨 Generating animated image (seed: {seed})...")
            self.load_image_model()
            
            with torch.inference_mode():
                result = self.image_pipe(
                    prompt=prompt,
                    negative_prompt=negative_prompt,
                    height=VIDEO_CONFIG["height"],
                    width=VIDEO_CONFIG["width"],
                    num_inference_steps=VIDEO_CONFIG["num_inference_steps"],
                    guidance_scale=VIDEO_CONFIG["guidance_scale"],
                    generator=generator
                )
            
            base_image = result.images[0]
            
            # Create simple zoom/pan animation from single image
            frames = self._create_animation_from_image(base_image)
        
        clear_memory()
        print(f"✅ Generated {len(frames)} frames!")
        
        return frames, seed
    
    def _create_animation_from_image(self, image: Image.Image, num_frames: int = 8) -> List[Image.Image]:
        """Create simple animation from a single image (fallback)"""
        frames = []
        w, h = image.size
        
        # Simple zoom effect
        for i in range(num_frames):
            # Calculate zoom factor (subtle: 1.0 to 1.1)
            zoom = 1.0 + (i / num_frames) * 0.1
            
            # Calculate crop box for zoom
            new_w = int(w / zoom)
            new_h = int(h / zoom)
            left = (w - new_w) // 2
            top = (h - new_h) // 2
            
            # Crop and resize back
            cropped = image.crop((left, top, left + new_w, top + new_h))
            resized = cropped.resize((w, h), Image.Resampling.LANCZOS)
            frames.append(resized)
        
        return frames
    
    def unload(self):
        """Unload all models to free memory"""
        if self.image_pipe is not None:
            del self.image_pipe
            self.image_pipe = None
            
        if self.video_pipe is not None:
            del self.video_pipe
            self.video_pipe = None
            
        self.current_mode = None
        clear_memory()
        print("✅ Models unloaded")


# Singleton instance
_generator = None

def get_generator() -> VintageGenerator:
    """Get or create generator instance"""
    global _generator
    if _generator is None:
        _generator = VintageGenerator()
    return _generator
