# all_in_one_low_vram_text2video.py
# Run offline on RTX 3050 6GB laptop (tested pattern 2025–2026)
# Requirements: Python 3.10+, CUDA 11.8 or 12.1, ~20–25 GB disk space for model

# First-time install (run once in terminal / cmd):
# pip install torch torchvision torchaudio --index-url https://download.pytorch.org/whl/cu121
# pip install diffusers accelerate imageio[ffmpeg] transformers

import torch
from diffusers import DiffusionPipeline
import imageio
import numpy as np
from pathlib import Path
import time

# ──────────────────────────────────────────────
#  SETTINGS – tune these if needed
# ──────────────────────────────────────────────

MODEL_ID = "cerspense/zeroscope_v2_576w"          # ~2.5–3 GB download, smallest usable t2v model

PROMPT = "A vintage red cafe racer motorcycle driving on a mountain road at sunset, retro style, cinematic"

NUM_FRAMES     = 16      # 8–16 is realistic on 6GB; >20 → very high OOM risk
HEIGHT         = 320
WIDTH          = 576
INFERENCE_STEPS = 25     # 20–30; lower = faster + less VRAM, but lower quality
SEED           = 42
FPS            = 8       # playback speed

OUTPUT_MP4     = "output_low_vram.mp4"

# ──────────────────────────────────────────────
#  MAIN LOGIC
# ──────────────────────────────────────────────

def main():
    print("Starting low-VRAM text-to-video generation...")
    print(f"Device: {'CUDA' if torch.cuda.is_available() else 'CPU'}")
    if torch.cuda.is_available():
        print(f"GPU: {torch.cuda.get_device_name(0)}")
        print(f"VRAM total: {torch.cuda.get_device_properties(0).total_memory / 1e9:.1f} GB")

    start_time = time.time()

    try:
        print("\nLoading pipeline (first time downloads ~2.5 GB model)...")
        pipe = DiffusionPipeline.from_pretrained(
            MODEL_ID,
            torch_dtype=torch.float16,
            safety_checker=None,
            requires_safety_checker=False,
            variant="fp16" if torch.cuda.is_available() else None
        )

        # === Critical low-VRAM optimizations ===
        pipe.enable_model_cpu_offload()          # offload to CPU/RAM when possible
        pipe.enable_attention_slicing(1)         # slice attention → huge VRAM saving
        pipe.enable_vae_slicing()                # slice VAE → another big saving
        pipe.enable_vae_tiling()                 # tile VAE decode if still tight

        if torch.cuda.is_available():
            pipe.to("cuda")
        else:
            print("No GPU → very slow on CPU only...")

        print(f"\nGenerating {NUM_FRAMES} frames | {INFERENCE_STEPS} steps | seed={SEED}")
        generator = torch.Generator(device="cuda" if torch.cuda.is_available() else "cpu").manual_seed(SEED)

        video_frames = pipe(
            prompt=PROMPT,
            num_frames=NUM_FRAMES,
            height=HEIGHT,
            width=WIDTH,
            num_inference_steps=INFERENCE_STEPS,
            generator=generator,
        ).frames[0]   # list of PIL images

        print("Generation finished. Saving video...")

        # Convert to numpy & save mp4
        frames_np = [np.array(f) for f in video_frames]
        imageio.mimsave(OUTPUT_MP4, frames_np, fps=FPS, codec='libx264', quality=8)

        duration = time.time() - start_time
        print(f"\nDone! Video saved: {Path(OUTPUT_MP4).resolve()}")
        print(f"Total time: {duration:.0f} seconds (~{duration/NUM_FRAMES:.1f} s/frame)")

    except torch.cuda.OutOfMemoryError as e:
        print("\n" + "="*60)
        print("OOM ERROR – GPU ran out of memory.")
        print("Try these fixes (edit variables at top):")
        print("1. Reduce NUM_FRAMES to 8 or even 6")
        print("2. Reduce INFERENCE_STEPS to 20 or 15")
        print("3. Try adding: pipe.enable_sequential_cpu_offload()  # very slow but safest")
        print("4. Close other apps / browser tabs")
        print("5. Use smaller model variant if available (but 576w is already small)")
        print("="*60)
        raise e

    except Exception as e:
        print(f"\nUnexpected error: {e}")
        raise

if __name__ == "__main__":
    main()