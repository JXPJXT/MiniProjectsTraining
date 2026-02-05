"""
Model Download Script for Offline Use
======================================
Run this script ONCE with internet connectivity to download all required models.
After downloading, the system will work fully offline.
"""

import os
import sys

def download_paddleocr():
    """Download PaddleOCR models."""
    print("Downloading PaddleOCR models...")
    try:
        from paddleocr import PaddleOCR
        ocr = PaddleOCR(use_angle_cls=True, lang='en', use_gpu=False)
        print("✓ PaddleOCR models downloaded successfully")
        return True
    except Exception as e:
        print(f"✗ PaddleOCR download failed: {e}")
        return False


def download_olmocr():
    """Download OlmOCR-2-7B model."""
    print("\nDownloading OlmOCR-2-7B model (this may take a while, ~15GB)...")
    print("Note: This requires significant disk space and RAM.")
    
    try:
        from transformers import AutoProcessor, Qwen2VLForConditionalGeneration
        
        model_name = "allenai/olmocr-2-7b"
        
        print("  Downloading processor...")
        processor = AutoProcessor.from_pretrained(model_name)
        print("  ✓ Processor downloaded")
        
        print("  Downloading model weights (this takes longest)...")
        model = Qwen2VLForConditionalGeneration.from_pretrained(
            model_name,
            low_cpu_mem_usage=True
        )
        print("  ✓ Model downloaded")
        
        print("✓ OlmOCR-2-7B downloaded successfully")
        return True
        
    except Exception as e:
        print(f"✗ OlmOCR download failed: {e}")
        print("  You can still use Approach 1 (Traditional OCR) without this model.")
        return False


def main():
    print("=" * 60)
    print("DL OCR - Model Download Script")
    print("=" * 60)
    print("\nThis script downloads all required models for offline use.")
    print("Ensure you have a stable internet connection.\n")
    
    # Check if user wants to proceed
    response = input("Download all models? [y/N]: ").strip().lower()
    if response != 'y':
        print("Download cancelled.")
        return
    
    success_paddle = download_paddleocr()
    
    response = input("\nDownload OlmOCR-2-7B (15GB+)? [y/N]: ").strip().lower()
    if response == 'y':
        success_vlm = download_olmocr()
    else:
        print("Skipping VLM download. Approach 2 will use fallback.")
        success_vlm = False
    
    print("\n" + "=" * 60)
    print("Download Summary:")
    print(f"  PaddleOCR: {'✓ Ready' if success_paddle else '✗ Failed'}")
    print(f"  OlmOCR-2-7B: {'✓ Ready' if success_vlm else '⚠ Not downloaded'}")
    print("=" * 60)
    
    if success_paddle:
        print("\nYou can now run the system offline with: python main.py")


if __name__ == "__main__":
    main()
