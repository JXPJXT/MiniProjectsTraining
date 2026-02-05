"""
Utility functions for DL OCR Project
=====================================
Contains image preprocessing, accuracy calculation, and helper functions.

Preprocessing Pipeline:
1. Grayscale conversion
2. Noise reduction (Gaussian blur)
3. Adaptive thresholding
4. Deskewing
5. Contrast enhancement (CLAHE)
"""

import cv2
import numpy as np
from PIL import Image
import io
import difflib
from typing import Dict, Tuple, Optional
import Levenshtein
import math
import warnings

warnings.filterwarnings("ignore")


class ImagePreprocessor:
    """
    Handles all image preprocessing for DL images.
    Optimized for both clean scans (95%+ accuracy) and noisy photos (80-90% accuracy).
    """
    
    def __init__(self):
        # CLAHE for contrast enhancement
        self.clahe = cv2.createCLAHE(clipLimit=2.0, tileGridSize=(8, 8))
    
    def preprocess(self, image_bytes: bytes) -> Tuple[np.ndarray, np.ndarray]:
        """
        Main preprocessing pipeline.
        
        Args:
            image_bytes: Raw image bytes from upload
            
        Returns:
            Tuple of (preprocessed_image, original_image) as numpy arrays
        """
        # Convert bytes to numpy array
        nparr = np.frombuffer(image_bytes, np.uint8)
        original = cv2.imdecode(nparr, cv2.IMREAD_COLOR)
        
        if original is None:
            raise ValueError("Invalid image format - could not decode image")
        
        # Create a copy for processing
        processed = original.copy()
        
        # Step 1: Resize if too large (for speed optimization)
        processed = self._resize_if_needed(processed)
        
        # Step 2: Convert to grayscale
        gray = cv2.cvtColor(processed, cv2.COLOR_BGR2GRAY)
        
        # Step 3: Noise reduction
        denoised = cv2.GaussianBlur(gray, (3, 3), 0)
        
        # Step 4: Contrast enhancement with CLAHE
        enhanced = self.clahe.apply(denoised)
        
        # Step 5: Deskew the image
        deskewed = self._deskew(enhanced)
        
        # Step 6: Adaptive thresholding for binarization
        # Using Otsu's method which works well for varied lighting
        _, binary = cv2.threshold(deskewed, 0, 255, cv2.THRESH_BINARY + cv2.THRESH_OTSU)
        
        # Step 7: Morphological operations to clean up
        kernel = np.ones((1, 1), np.uint8)
        cleaned = cv2.morphologyEx(binary, cv2.MORPH_CLOSE, kernel)
        
        return cleaned, original
    
    def _resize_if_needed(self, image: np.ndarray, max_width: int = 1920) -> np.ndarray:
        """
        Resize image if width exceeds max_width to improve processing speed.
        Target: <5s per image processing time.
        """
        height, width = image.shape[:2]
        if width > max_width:
            scale = max_width / width
            new_height = int(height * scale)
            return cv2.resize(image, (max_width, new_height), interpolation=cv2.INTER_AREA)
        return image
    
    def _deskew(self, image: np.ndarray) -> np.ndarray:
        """
        Correct skew in scanned/photographed DL images.
        Critical for noisy photos taken at angles.
        """
        try:
            # Find all white pixels (text regions)
            coords = np.column_stack(np.where(image > 0))
            
            if len(coords) < 100:  # Not enough points to determine angle
                return image
            
            # Get minimum area rectangle
            rect = cv2.minAreaRect(coords)
            angle = rect[-1]
            
            # Adjust angle
            if angle < -45:
                angle = 90 + angle
            elif angle > 45:
                angle = angle - 90
                
            # Only deskew if angle is significant
            if abs(angle) < 0.5:
                return image
            
            # Rotate image
            (h, w) = image.shape[:2]
            center = (w // 2, h // 2)
            M = cv2.getRotationMatrix2D(center, angle, 1.0)
            rotated = cv2.warpAffine(
                image, M, (w, h),
                flags=cv2.INTER_CUBIC,
                borderMode=cv2.BORDER_REPLICATE
            )
            return rotated
        except Exception:
            # If deskewing fails, return original
            return image
    
    def preprocess_for_vlm(self, image_bytes: bytes) -> Image.Image:
        """
        Lighter preprocessing for VLM models (OlmOCR).
        VLMs handle preprocessing internally, so we just ensure proper format.
        """
        image = Image.open(io.BytesIO(image_bytes))
        
        # Convert to RGB if needed
        if image.mode != 'RGB':
            image = image.convert('RGB')
        
        # Resize if too large (VLM memory optimization)
        max_size = 1024
        if max(image.size) > max_size:
            ratio = max_size / max(image.size)
            new_size = (int(image.size[0] * ratio), int(image.size[1] * ratio))
            image = image.resize(new_size, Image.Resampling.LANCZOS)
        
        return image


class AccuracyCalculator:
    """
    Calculates accuracy metrics between OCR output and ground truth.
    
    Metrics:
    - Character Error Rate (CER): Lower is better (0 = perfect)
    - Word Error Rate (WER): Lower is better
    - Similarity Score: Higher is better (1.0 = perfect match)
    - Levenshtein Distance: Lower is better (0 = identical)
    """
    
    @staticmethod
    def calculate_cer(prediction: str, ground_truth: str) -> float:
        """
        Calculate Character Error Rate.
        CER = (Substitutions + Insertions + Deletions) / Total Characters
        """
        if not ground_truth:
            return 1.0 if prediction else 0.0
        
        pred = prediction.lower().strip()
        truth = ground_truth.lower().strip()
        
        distance = Levenshtein.distance(pred, truth)
        cer = distance / max(len(truth), 1)
        
        return min(cer, 1.0)  # Cap at 1.0
    
    @staticmethod
    def calculate_similarity(prediction: str, ground_truth: str) -> float:
        """
        Calculate similarity score using difflib.
        Returns value between 0 and 1 (1 = identical).
        """
        if not ground_truth and not prediction:
            return 1.0
        if not ground_truth or not prediction:
            return 0.0
        
        pred = prediction.lower().strip()
        truth = ground_truth.lower().strip()
        
        return difflib.SequenceMatcher(None, pred, truth).ratio()
    
    @staticmethod
    def calculate_levenshtein(prediction: str, ground_truth: str) -> int:
        """
        Calculate Levenshtein distance (edit distance).
        """
        pred = prediction.lower().strip()
        truth = ground_truth.lower().strip()
        
        return Levenshtein.distance(pred, truth)
    
    @classmethod
    def calculate_field_accuracy(
        cls,
        predicted_fields: Dict[str, str],
        ground_truth_fields: Dict[str, str]
    ) -> Dict[str, any]:
        """
        Calculate per-field and overall accuracy metrics.
        
        Returns:
            Dict containing:
            - per_field: Individual field accuracies
            - overall_similarity: Average similarity across fields
            - overall_cer: Average CER across fields
        """
        per_field = {}
        similarities = []
        cers = []
        
        # Get all field names from ground truth
        all_fields = set(ground_truth_fields.keys())
        
        for field in all_fields:
            pred = predicted_fields.get(field, "")
            truth = ground_truth_fields.get(field, "")
            
            similarity = cls.calculate_similarity(pred, truth)
            cer = cls.calculate_cer(pred, truth)
            
            per_field[field] = {
                "predicted": pred,
                "ground_truth": truth,
                "similarity": round(similarity, 4),
                "cer": round(cer, 4),
                "levenshtein": cls.calculate_levenshtein(pred, truth)
            }
            
            if truth:  # Only count fields that have ground truth
                similarities.append(similarity)
                cers.append(cer)
        
        return {
            "per_field": per_field,
            "overall_similarity": round(sum(similarities) / max(len(similarities), 1), 4),
            "overall_cer": round(sum(cers) / max(len(cers), 1), 4),
            "accuracy_percent": round((sum(similarities) / max(len(similarities), 1)) * 100, 2)
        }
    
    @classmethod
    def compare_approaches(
        cls,
        approach1_fields: Dict[str, str],
        approach2_fields: Dict[str, str],
        ground_truth_fields: Dict[str, str]
    ) -> Dict[str, any]:
        """
        Compare accuracy between two OCR approaches.
        
        Returns detailed comparison with winner determination.
        """
        approach1_accuracy = cls.calculate_field_accuracy(approach1_fields, ground_truth_fields)
        approach2_accuracy = cls.calculate_field_accuracy(approach2_fields, ground_truth_fields)
        
        # Determine winner based on overall similarity
        a1_score = approach1_accuracy["overall_similarity"]
        a2_score = approach2_accuracy["overall_similarity"]
        
        if a1_score > a2_score + 0.01:  # 1% margin for clear winner
            winner = "Approach 1 (Pytesseract + PaddleOCR)"
        elif a2_score > a1_score + 0.01:
            winner = "Approach 2 (OlmOCR-2-7B)"
        else:
            winner = "Tie"
        
        return {
            "approach1": approach1_accuracy,
            "approach2": approach2_accuracy,
            "comparison": {
                "approach1_score": a1_score,
                "approach2_score": a2_score,
                "winner": winner,
                "margin": round(abs(a1_score - a2_score), 4)
            }
        }


def validate_image(file_bytes: bytes, max_size_mb: int = 5) -> Tuple[bool, str]:
    """
    Validate uploaded image file.
    
    Checks:
    - File size (max 5MB)
    - Valid image format
    - Minimum dimensions
    
    Returns:
        Tuple of (is_valid, error_message)
    """
    # Check file size
    size_mb = len(file_bytes) / (1024 * 1024)
    if size_mb > max_size_mb:
        return False, f"File size ({size_mb:.2f}MB) exceeds maximum allowed ({max_size_mb}MB)"
    
    if size_mb < 0.001:  # Less than 1KB
        return False, "File appears to be empty or too small"
    
    # Try to decode image
    try:
        nparr = np.frombuffer(file_bytes, np.uint8)
        image = cv2.imdecode(nparr, cv2.IMREAD_COLOR)
        
        if image is None:
            return False, "Invalid image format - could not decode image"
        
        # Check minimum dimensions
        height, width = image.shape[:2]
        if width < 100 or height < 100:
            return False, f"Image dimensions ({width}x{height}) too small"
        
        return True, "Valid image"
        
    except Exception as e:
        return False, f"Image validation error: {str(e)}"


def format_dl_fields(extracted: Dict) -> Dict[str, str]:
    """
    Normalize and format extracted DL fields.
    Ensures consistent field naming and formatting.
    """
    # Standard field names for Indian DL
    field_mapping = {
        "name": ["name", "holder_name", "full_name", "applicant"],
        "date_of_birth": ["dob", "date_of_birth", "birth_date", "d.o.b"],
        "issued_by": ["issued_by", "issuing_authority", "rto", "authority"],
        "date_of_issue": ["doi", "date_of_issue", "issue_date", "valid_from"],
        "date_of_expiry": ["doe", "date_of_expiry", "expiry_date", "valid_till", "valid_upto"],
        "license_number": ["dl_no", "license_number", "licence_no", "dl_number"],
        "address": ["address", "permanent_address", "addr"],
        "blood_group": ["blood_group", "blood", "bg"],
        "vehicle_class": ["cov", "vehicle_class", "class_of_vehicle", "vehicle_type"]
    }
    
    formatted = {}
    extracted_lower = {k.lower().replace(" ", "_"): v for k, v in extracted.items()}
    
    for standard_name, aliases in field_mapping.items():
        for alias in aliases:
            if alias in extracted_lower and extracted_lower[alias]:
                formatted[standard_name] = str(extracted_lower[alias]).strip()
                break
        if standard_name not in formatted:
            formatted[standard_name] = ""
    
    return formatted
