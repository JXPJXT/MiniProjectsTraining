"""
Custom embedding engine — no frameworks.
Uses sentence-transformers (all-MiniLM-L6-v2) for lightweight local embeddings.
~80 MB model, runs fast on CPU.
"""
from typing import List
import numpy as np
from sentence_transformers import SentenceTransformer
from ..common.config import EMBEDDING_MODEL


class EmbeddingEngine:
    """Manages the embedding model lifecycle and batch encoding."""
    
    def __init__(self, model_name: str = None):
        self.model_name = model_name or EMBEDDING_MODEL
        self._model = None
    
    @property
    def model(self) -> SentenceTransformer:
        if self._model is None:
            print(f"[INFO] Loading embedding model: {self.model_name}")
            self._model = SentenceTransformer(self.model_name, device="cpu")
            print(f"[INFO] Embedding model loaded successfully")
        return self._model
    
    def embed_texts(self, texts: List[str], batch_size: int = 64) -> List[List[float]]:
        """Embed a list of texts. Returns list of embedding vectors."""
        if not texts:
            return []
        
        embeddings = self.model.encode(
            texts,
            batch_size=batch_size,
            show_progress_bar=len(texts) > 100,
            convert_to_numpy=True,
            normalize_embeddings=True,  # cosine similarity via dot product
        )
        return embeddings.tolist()
    
    def embed_query(self, query: str) -> List[float]:
        """Embed a single query string."""
        embedding = self.model.encode(
            [query],
            convert_to_numpy=True,
            normalize_embeddings=True,
        )
        return embedding[0].tolist()


# Singleton instance
_engine = None

def get_embedding_engine() -> EmbeddingEngine:
    global _engine
    if _engine is None:
        _engine = EmbeddingEngine()
    return _engine
