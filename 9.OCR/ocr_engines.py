"""
OCR Engines for DL Text Extraction
====================================
Two approaches:
1. Traditional: Pytesseract (local, offline)
2. VLM: Vision model via Hugging Face API
"""

import os
import cv2
import numpy as np
from PIL import Image
import re
import json
import base64
import io
from typing import Dict
import logging
from dotenv import load_dotenv
import requests

# Load environment variables from .env file
load_dotenv()

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

# Lazy loading
_pytesseract = None


def get_pytesseract():
    """Lazy load Pytesseract."""
    global _pytesseract
    if _pytesseract is None:
        import pytesseract
        tesseract_cmd = os.environ.get("TESSERACT_CMD")
        if tesseract_cmd and os.path.exists(tesseract_cmd):
            pytesseract.pytesseract.tesseract_cmd = tesseract_cmd
            logger.info(f"Using Tesseract at: {tesseract_cmd}")
        _pytesseract = pytesseract
    return _pytesseract


class TraditionalOCREngine:
    """
    Approach 1: Pytesseract - Raw image, NO preprocessing
    """
    
    def __init__(self):
        self.pytesseract = None
    
    def extract(self, preprocessed_image: np.ndarray, original_image: np.ndarray) -> Dict[str, str]:
        """Extract ALL text using Pytesseract on raw image."""
        if self.pytesseract is None:
            self.pytesseract = get_pytesseract()
        
        extracted_fields = {
            'name': '', 'date_of_birth': '', 'issued_by': '',
            'date_of_issue': '', 'date_of_expiry': '', 'license_number': '',
            'address': '', 'blood_group': '', 'vehicle_class': ''
        }
        
        try:
            # Just run Tesseract on raw image - no preprocessing
            raw_text = self.pytesseract.image_to_string(original_image)
            
            logger.info(f"Tesseract raw output:\n{raw_text}")
            
            # Store raw text for display
            extracted_fields['raw_text'] = raw_text.strip()
            
            # Find all dates (DD/MM/YYYY format)
            dates = re.findall(r'(\d{1,2}[/\-\.]\d{1,2}[/\-\.]\d{2,4})', raw_text)
            if dates:
                extracted_fields['date_of_birth'] = dates[0]
                if len(dates) > 1:
                    extracted_fields['date_of_issue'] = dates[1]
                if len(dates) > 2:
                    extracted_fields['date_of_expiry'] = dates[2]
            
            # Find license number (2 letters + digits pattern like PB02...)
            license_match = re.search(r'([A-Z]{2}[\s\-]?\d{2}[\s\-]?\d{4,}[\d]*)', raw_text)
            if license_match:
                extracted_fields['license_number'] = license_match.group(1).strip()
            
            # Find blood group
            blood_match = re.search(r'([ABO]{1,2}[\+\-])', raw_text)
            if blood_match:
                extracted_fields['blood_group'] = blood_match.group(1)
            
            # Find names - look for capitalized words (potential names)
            # Names usually appear as all-caps words together
            name_patterns = re.findall(r'([A-Z][A-Z\s]+[A-Z])', raw_text)
            if name_patterns:
                # Filter out short matches and common words
                names = [n.strip() for n in name_patterns if len(n) > 5 and 'LICENCE' not in n and 'DATE' not in n and 'BLOOD' not in n]
                if names:
                    extracted_fields['name'] = names[0]
                    if len(names) > 1:
                        extracted_fields['issued_by'] = names[-1]  # Last name-like entry might be authority
            
        except Exception as e:
            logger.error(f"Tesseract error: {e}")
            extracted_fields['error'] = str(e)
        
        return extracted_fields


class VLMOCREngine:
    """
    Approach 2: Local VLM using TrOCR (microsoft/trocr-small-printed)
    Native Transformer model - guaranteed to load without remote code issues.
    """
    
    def __init__(self):
        self.processor = None
        self.model = None
        # Switch to BASE model for better accuracy
        self.model_id = "microsoft/trocr-base-printed" 
        logger.info("Initializing Local TrOCR Engine...")
        print("DEBUG: Initializing Local TrOCR Engine Class...")
        self._load_model()

    def _load_model(self):
        """Load TrOCR immediately."""
        try:
            from transformers import TrOCRProcessor, VisionEncoderDecoderModel
            import torch
            
            logger.info(f"Loading local model: {self.model_id}...")
            print(f"DEBUG: IMPORTS SUCCESSFUL. Starting download/load of {self.model_id}...")
            
            # Use fast=False to avoid tokenizer bugs
            self.processor = TrOCRProcessor.from_pretrained(self.model_id, use_fast=False)
            print("DEBUG: Processor loaded.")
            
            self.model = VisionEncoderDecoderModel.from_pretrained(self.model_id)
            print("DEBUG: Model loaded.")
            
            logger.info("Local TrOCR model loaded successfully!")
        except Exception as e:
            import traceback
            error_trace = traceback.format_exc()
            logger.error(f"Failed to load TrOCR: {e}")
            print(f"CRITICAL ERROR LOADING MODEL:\n{error_trace}")
            self.model = "ERROR"

    def extract(self, image: Image.Image) -> Dict[str, str]:
        """Extract text using local TrOCR with smart slicing."""
        extracted_fields = {
            'name': '', 'date_of_birth': '', 'issued_by': '',
            'date_of_issue': '', 'date_of_expiry': '', 'license_number': '',
            'address': '', 'blood_group': '', 'vehicle_class': ''
        }
        
        if self.model == "ERROR" or self.model is None:
             return self._demo_output("Local Model Load Failed")

        try:
            # Convert to RGB
            if image.mode != "RGB":
                image = image.convert("RGB")
            
            # STRATEGY: TrOCR needs high-res text. Resizing a full A4 doc to 384x384 kills it.
            # We slice the image into 3 vertical chunks with overlap to preserve text size.
            w, h = image.size
            chunks = []
            
            # Top half (Hero info)
            chunks.append(image.crop((0, 0, w, int(h * 0.4))))
            # Middle (Details)
            chunks.append(image.crop((0, int(h * 0.3), w, int(h * 0.7))))
            # Bottom (Footer)
            chunks.append(image.crop((0, int(h * 0.6), w, h)))
            
            full_text = []
            
            print("DEBUG: Processing 3 image chunks...")
            for i, chunk in enumerate(chunks):
                # Run inference on chunk
                pixel_values = self.processor(images=chunk, return_tensors="pt").pixel_values
                generated_ids = self.model.generate(pixel_values, max_new_tokens=128)
                text = self.processor.batch_decode(generated_ids, skip_special_tokens=True)[0]
                full_text.append(text)
                print(f"DEBUG: Chunk {i} output: {text}")
            
            # Also run on full image just in case (for large headers)
            # pixel_values = self.processor(images=image, return_tensors="pt").pixel_values
            # generated_ids = self.model.generate(pixel_values)
            # full_text.append(self.processor.batch_decode(generated_ids, skip_special_tokens=True)[0])
            
            final_text = " ".join(full_text)
            logger.info(f"TrOCR Full Output: {final_text}")
            
            extracted_fields['raw_text'] = final_text
            
            # Simple Opportunistic parsing
            # Look for License pattern
            lic = re.search(r'([A-Z]{2}[-\s]?\d{2}[-\s]?\d{4,})', final_text)
            if lic:
                extracted_fields['license_number'] = lic.group(1)
            
            # Look for Name pattern (Long CAPS sequence)
            names = re.findall(r'([A-Z]{3,}\s[A-Z]{3,}\s[A-Z]{3,})', final_text)
            if names:
                extracted_fields['name'] = names[0]
                
            # Dates
            dates = re.findall(r'(\d{2}[/-]\d{2}[/-]\d{4})', final_text)
            if dates:
                extracted_fields['date_of_birth'] = dates[0]
            
            return extracted_fields

        except Exception as e:
            logger.error(f"Local TrOCR inference error: {e}")
            import traceback
            traceback.print_exc()
            return self._demo_output(str(e))

    def _demo_output(self, reason: str) -> Dict[str, str]:
        return {
            'name': f'[TrOCR: {reason}]',
            'date_of_birth': '', 'license_number': '', 'raw_text': f'Error: {reason}',
            'note': 'TrOCR model failed or not loaded.'
        }


# Singleton instances
_traditional_engine = None
_vlm_engine = None


def get_traditional_engine() -> TraditionalOCREngine:
    global _traditional_engine
    if _traditional_engine is None:
        _traditional_engine = TraditionalOCREngine()
    return _traditional_engine


def get_vlm_engine() -> VLMOCREngine:
    global _vlm_engine
    if _vlm_engine is None:
        _vlm_engine = VLMOCREngine()
    return _vlm_engine
