"""
ChromaDB-based vector store — no framework wrappers.
Direct usage of ChromaDB's Python client for full control.
"""
import chromadb
from chromadb.config import Settings
from typing import List, Dict, Optional
from ..common.config import CHROMA_PURE_DIR, TOP_K
from .embeddings import get_embedding_engine


COLLECTION_NAME = "study_pdfs_pure"


class VectorStore:
    """Manages ChromaDB collection for the pure RAG pipeline."""
    
    def __init__(self, persist_dir: str = None):
        self.persist_dir = persist_dir or CHROMA_PURE_DIR
        self._client = None
        self._collection = None
        self._embedding_engine = get_embedding_engine()
    
    @property
    def client(self) -> chromadb.ClientAPI:
        if self._client is None:
            self._client = chromadb.PersistentClient(path=self.persist_dir)
        return self._client
    
    @property
    def collection(self):
        if self._collection is None:
            self._collection = self.client.get_or_create_collection(
                name=COLLECTION_NAME,
                metadata={"hnsw:space": "cosine"},
            )
        return self._collection
    
    def add_chunks(self, chunks: List[Dict[str, str]], batch_size: int = 100) -> int:
        """
        Add document chunks to the vector store.
        Each chunk: {text, filename, chunk_id, source_path}
        """
        if not chunks:
            return 0
        
        total_added = 0
        
        for i in range(0, len(chunks), batch_size):
            batch = chunks[i:i + batch_size]
            
            texts = [c["text"] for c in batch]
            ids = [c["chunk_id"] for c in batch]
            metadatas = [{"filename": c["filename"], "source_path": c["source_path"]} for c in batch]
            
            # Generate embeddings
            embeddings = self._embedding_engine.embed_texts(texts)
            
            # Upsert into ChromaDB
            self.collection.upsert(
                documents=texts,
                embeddings=embeddings,
                ids=ids,
                metadatas=metadatas,
            )
            
            total_added += len(batch)
            print(f"[INFO] Pure VectorStore: indexed {total_added}/{len(chunks)} chunks")
        
        return total_added
    
    def search(self, query: str, top_k: int = None) -> List[Dict]:
        """
        Search for similar chunks given a query string.
        Returns list of {text, filename, score, source_path}
        """
        if top_k is None:
            top_k = TOP_K
        
        query_embedding = self._embedding_engine.embed_query(query)
        
        results = self.collection.query(
            query_embeddings=[query_embedding],
            n_results=top_k,
            include=["documents", "metadatas", "distances"],
        )
        
        output = []
        if results and results["documents"]:
            for doc, meta, dist in zip(
                results["documents"][0],
                results["metadatas"][0],
                results["distances"][0],
            ):
                output.append({
                    "text": doc,
                    "filename": meta.get("filename", ""),
                    "source_path": meta.get("source_path", ""),
                    "score": round(1 - dist, 4),  # cosine distance -> similarity
                })
        
        return output
    
    def get_stats(self) -> Dict:
        """Get collection statistics."""
        try:
            count = self.collection.count()
            return {"collection": COLLECTION_NAME, "total_chunks": count}
        except Exception:
            return {"collection": COLLECTION_NAME, "total_chunks": 0}
    
    def clear(self):
        """Delete the entire collection and recreate it."""
        try:
            self.client.delete_collection(COLLECTION_NAME)
            self._collection = None
            print("[INFO] Pure VectorStore: collection cleared")
        except Exception as e:
            print(f"[WARN] Clear failed: {e}")


# Singleton
_store = None

def get_vector_store() -> VectorStore:
    global _store
    if _store is None:
        _store = VectorStore()
    return _store
