"""
Custom text chunker — no frameworks.
Splits text into overlapping chunks for better retrieval quality.
"""
from typing import List, Dict
import re


def chunk_text(
    text: str,
    chunk_size: int = 512,
    chunk_overlap: int = 64,
) -> List[str]:
    """
    Split text into overlapping chunks.
    Uses sentence-aware splitting to avoid cutting mid-sentence.
    """
    if not text or len(text.strip()) == 0:
        return []
    
    # Normalize whitespace
    text = re.sub(r'\s+', ' ', text).strip()
    
    # Split into sentences first
    sentences = re.split(r'(?<=[.!?])\s+', text)
    
    chunks = []
    current_chunk = ""
    
    for sentence in sentences:
        # If adding this sentence exceeds chunk_size, save current chunk
        if len(current_chunk) + len(sentence) > chunk_size and current_chunk:
            chunks.append(current_chunk.strip())
            # Keep overlap from end of current chunk
            overlap_text = current_chunk[-chunk_overlap:] if len(current_chunk) > chunk_overlap else current_chunk
            current_chunk = overlap_text + " " + sentence
        else:
            current_chunk = (current_chunk + " " + sentence).strip()
    
    # Don't forget the last chunk
    if current_chunk.strip():
        chunks.append(current_chunk.strip())
    
    # Handle case where a single sentence is longer than chunk_size
    final_chunks = []
    for chunk in chunks:
        if len(chunk) > chunk_size * 2:
            # Force-split very long chunks
            for i in range(0, len(chunk), chunk_size - chunk_overlap):
                sub = chunk[i:i + chunk_size]
                if sub.strip():
                    final_chunks.append(sub.strip())
        else:
            final_chunks.append(chunk)
    
    return final_chunks


def chunk_documents(
    documents: List[Dict[str, str]],
    chunk_size: int = 512,
    chunk_overlap: int = 64,
) -> List[Dict[str, str]]:
    """
    Chunk a list of documents, preserving metadata.
    Returns list of {text, filename, chunk_id, source_path}
    """
    all_chunks = []
    
    for doc in documents:
        text_chunks = chunk_text(doc["text"], chunk_size, chunk_overlap)
        for i, chunk in enumerate(text_chunks):
            all_chunks.append({
                "text": chunk,
                "filename": doc["filename"],
                "chunk_id": f"{doc['filename']}_chunk_{i}",
                "source_path": doc.get("path", ""),
            })
    
    return all_chunks
