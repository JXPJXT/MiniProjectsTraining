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
import torch

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


def parse_from_raw_text(raw_text: str) -> Dict[str, str]:
    """
    Common regex-based parsing logic for raw OCR text.
    Extracts name, dates, license number, etc.
    """
    extracted_fields = {
        'name': '', 'date_of_birth': '', 'issued_by': '',
        'date_of_issue': '', 'date_of_expiry': '', 'license_number': '',
        'address': '', 'blood_group': '', 'vehicle_class': ''
    }
    extracted_fields['raw_text'] = raw_text.strip()

    # Find all dates (DD/MM/YYYY format and variants)
    dates = re.findall(r'(\d{1,2}[/\-\.]\d{1,2}[/\-\.]\d{2,4})', raw_text)
    if dates:
        extracted_fields['date_of_birth'] = dates[0]
        if len(dates) > 1:
            extracted_fields['date_of_issue'] = dates[1]
        if len(dates) > 2:
            extracted_fields['date_of_expiry'] = dates[2]

    # Find license number (2 letters + digits pattern like PB02...)
    # Updated pattern to be more flexible
    license_match = re.search(r'([A-Z]{2}[\s\-]?[0-9]{2}[\s\-]?[0-9]{4,}[\d]*)', raw_text)
    if license_match:
        extracted_fields['license_number'] = license_match.group(1).strip()

    # Find blood group
    blood_match = re.search(r'\b([ABO]{1,2}[\+\-])', raw_text)
    if blood_match:
        extracted_fields['blood_group'] = blood_match.group(1)

    # Find names - look for capitalized words (potential names)
    # Names usually appear as all-caps words together
    name_patterns = re.findall(r'([A-Z][A-Z\s]+[A-Z])', raw_text)
    if name_patterns:
        # Filter out short matches and common words
        names = [n.strip() for n in name_patterns if len(n) > 5 and 'LICENCE' not in n and 'DATE' not in n and 'BLOOD' not in n and 'INDIA' not in n and 'TRANSPORT' not in n]
        if names:
            extracted_fields['name'] = names[0]
            if len(names) > 1:
                extracted_fields['issued_by'] = names[-1]  # Last name-like entry might be authority

    return extracted_fields


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
            
            # Use common parsing logic
            extracted_fields = parse_from_raw_text(raw_text)
            
        except Exception as e:
            logger.error(f"Tesseract error: {e}")
            extracted_fields['error'] = str(e)
        
        return extracted_fields


class VLMOCREngine:
    """
    Approach 2: Local VLM using Microsoft Florence-2
    Native Transformer model - fixed for _supports_sdpa error.
    """
    
    def __init__(self):
        self.processor = None
        self.model = None
        self.model_id = "microsoft/Florence-2-base" 
        logger.info("Initializing Florence-2 Engine...")
        self._load_model()

    def _load_model(self):
        """Load Florence-2 with eager attention to bypass errors."""
        try:
            from transformers import AutoProcessor, AutoModelForCausalLM
            
            logger.info(f"Loading local model: {self.model_id}...")
            print(f"DEBUG: Starting download/load of {self.model_id}...")
            
            device = "cuda" if torch.cuda.is_available() else "cpu"
            dtype = torch.float16 if device == "cuda" else torch.float32
            
            # Use attn_implementation="eager" to fix the _supports_sdpa error
            self.model = AutoModelForCausalLM.from_pretrained(
                self.model_id, 
                trust_remote_code=True,
                dtype=dtype,
                attn_implementation="eager"
            ).to(device)
            print("DEBUG: Model loaded.")
            
            self.processor = AutoProcessor.from_pretrained(self.model_id, trust_remote_code=True)
            print("DEBUG: Processor loaded.")
            
            logger.info("Local Florence-2 model loaded successfully!")
        except Exception as e:
            import traceback
            error_trace = traceback.format_exc()
            logger.error(f"Failed to load Florence-2: {e}")
            print(f"CRITICAL ERROR LOADING MODEL:\n{error_trace}")
            self.model = "ERROR"

    def extract(self, image: Image.Image) -> Dict[str, str]:
        """Extract text using Florence-2."""
        if self.model == "ERROR" or self.model is None:
             return self._demo_output("Model Load Failed")

        try:
            # Ensure RGB
            if image.mode != "RGB":
                image = image.convert("RGB")
            
            device = self.model.device
            dtype = self.model.dtype
            
            # Task for OCR
            task_prompt = "<OCR>"
            
            # Prepare inputs
            inputs = self.processor(text=task_prompt, images=image, return_tensors="pt").to(device, dtype)
            
            # Config for generation
            generated_ids = self.model.generate(
                input_ids=inputs["input_ids"],
                pixel_values=inputs["pixel_values"],
                max_new_tokens=1024,
                num_beams=1,
                do_sample=False,
                use_cache=False,
                early_stopping=False
            )
            
            # Decode output
            generated_text = self.processor.batch_decode(generated_ids, skip_special_tokens=False)[0]
            
            # Post-process (Florence returns task + answer, usually)
            parsed_answer = self.processor.post_process_generation(
                generated_text, 
                task=task_prompt, 
                image_size=(image.width, image.height)
            )
            
            # parsed_answer for <OCR> is usually simple text or dict
            raw_text = parsed_answer.get('<OCR>', '') if isinstance(parsed_answer, dict) else str(parsed_answer)
            
            logger.info(f"Florence-2 Full Output: {raw_text}")
            
            # Parse metrics
            return parse_from_raw_text(raw_text)

        except Exception as e:
            logger.error(f"Florence-2 inference error: {e}")
            import traceback
            traceback.print_exc()
            return self._demo_output(str(e))

    def _demo_output(self, reason: str) -> Dict[str, str]:
        return {
            'name': f'[Florence: {reason}]',
            'date_of_birth': '', 'license_number': '', 'raw_text': f'Error: {reason}',
            'note': 'Model failed or not loaded.'
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
