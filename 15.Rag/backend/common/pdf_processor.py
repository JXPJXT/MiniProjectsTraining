"""
Shared PDF processing utilities.
Uses PyMuPDF (fitz) for fast, reliable PDF text extraction.
"""
import os
import fitz  # PyMuPDF
from typing import List, Dict
from .config import DATASET_DIR, MAX_PDF_PAGES


def extract_text_from_pdf(pdf_path: str) -> str:
    """Extract all text from a single PDF file."""
    try:
        doc = fitz.open(pdf_path)
        if doc.page_count > MAX_PDF_PAGES:
            doc.close()
            return ""
        
        text_parts = []
        for page in doc:
            text_parts.append(page.get_text("text"))
        doc.close()
        
        full_text = "\n".join(text_parts).strip()
        return full_text
    except Exception as e:
        print(f"[WARN] Failed to read {pdf_path}: {e}")
        return ""


def load_all_pdfs(directory: str = None) -> List[Dict[str, str]]:
    """
    Load all PDFs from the dataset directory.
    Returns list of {"filename": ..., "text": ..., "path": ...}
    """
    if directory is None:
        directory = DATASET_DIR
    
    documents = []
    
    if not os.path.exists(directory):
        print(f"[WARN] Dataset directory not found: {directory}")
        return documents
    
    pdf_files = []
    for root, _, files in os.walk(directory):
        for f in files:
            if f.lower().endswith(".pdf"):
                pdf_files.append(os.path.join(root, f))
    
    print(f"[INFO] Found {len(pdf_files)} PDF files in {directory}")
    
    for i, pdf_path in enumerate(pdf_files):
        text = extract_text_from_pdf(pdf_path)
        if text and len(text) > 50:  # skip nearly-empty PDFs
            documents.append({
                "filename": os.path.basename(pdf_path),
                "text": text,
                "path": pdf_path,
            })
        if (i + 1) % 100 == 0:
            print(f"[INFO] Processed {i + 1}/{len(pdf_files)} PDFs...")
    
    print(f"[INFO] Successfully extracted text from {len(documents)} PDFs")
    return documents


def get_pdf_count(directory: str = None) -> int:
    """Count the number of PDFs in the dataset directory."""
    if directory is None:
        directory = DATASET_DIR
    count = 0
    if os.path.exists(directory):
        for root, _, files in os.walk(directory):
            for f in files:
                if f.lower().endswith(".pdf"):
                    count += 1
    return count
