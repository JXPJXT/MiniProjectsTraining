"""
Pure Python RAG Engine — zero framework dependencies.
Orchestrates: PDF loading → chunking → embedding → retrieval → Ollama generation.
"""
import requests
import json
import time
from typing import List, Dict, Optional, Generator
from ..common.config import (
    OLLAMA_BASE_URL, OLLAMA_MODEL,
    CHUNK_SIZE, CHUNK_OVERLAP, TOP_K,
)
from ..common.pdf_processor import load_all_pdfs, get_pdf_count
from .chunker import chunk_documents
from .vector_store import get_vector_store


# ─── System Prompt ──────────────────────────────────────
SYSTEM_PROMPT = """You are a knowledgeable study assistant that answers questions based on academic and technical PDF documents.
The documents cover topics like Software Engineering, Data Structures, Algorithms, Computer Networks,
Operating Systems, Machine Learning, Python programming, Web Development, and other CS fundamentals.
You MUST answer based ONLY on the provided context. If the context doesn't contain enough information, say so clearly.
Always cite the source document filenames when possible.
Be concise but thorough. Use clear explanations suitable for a student learning these topics."""


def _build_prompt(query: str, context_chunks: List[Dict]) -> str:
    """Build the full prompt with retrieved context."""
    context_text = "\n\n---\n\n".join(
        f"[Source: {c['filename']}]\n{c['text']}" for c in context_chunks
    )
    
    return f"""{SYSTEM_PROMPT}

### Retrieved Context:
{context_text}

### User Question:
{query}

### Answer:"""


class PureRAGEngine:
    """
    Complete RAG pipeline built from scratch:
    1. PDF extraction (PyMuPDF)
    2. Text chunking (custom sentence-aware splitter)
    3. Embeddings (sentence-transformers)
    4. Vector search (ChromaDB, direct client)
    5. Generation (Ollama REST API, direct HTTP calls)
    """
    
    def __init__(self):
        self.vector_store = get_vector_store()
        self._is_ingested = False
    
    def ingest(self, force: bool = False) -> Dict:
        """
        Ingest all PDFs from dataset directory into the vector store.
        Skips if already ingested unless force=True.
        """
        stats = self.vector_store.get_stats()
        
        if stats["total_chunks"] > 0 and not force:
            self._is_ingested = True
            return {
                "status": "already_ingested",
                "total_chunks": stats["total_chunks"],
                "message": "Vector store already has data. Use force=True to re-ingest.",
            }
        
        if force:
            self.vector_store.clear()
        
        start = time.time()
        
        # Step 1: Load PDFs
        documents = load_all_pdfs()
        if not documents:
            return {
                "status": "no_documents",
                "total_chunks": 0,
                "message": "No PDFs found in datasets directory. Please add PDF files.",
            }
        
        # Step 2: Chunk documents
        chunks = chunk_documents(documents, CHUNK_SIZE, CHUNK_OVERLAP)
        print(f"[INFO] Pure RAG: Created {len(chunks)} chunks from {len(documents)} documents")
        
        # Step 3: Embed and store
        total = self.vector_store.add_chunks(chunks)
        
        elapsed = round(time.time() - start, 2)
        self._is_ingested = True
        
        return {
            "status": "success",
            "documents_processed": len(documents),
            "total_chunks": total,
            "time_seconds": elapsed,
            "message": f"Ingested {len(documents)} PDFs into {total} chunks in {elapsed}s",
        }
    
    def query(self, question: str, top_k: int = None) -> Dict:
        """
        Run the full RAG pipeline: retrieve → generate.
        Returns the answer and source chunks.
        """
        if top_k is None:
            top_k = TOP_K
        
        # Step 1: Retrieve relevant chunks
        retrieval_start = time.time()
        chunks = self.vector_store.search(question, top_k=top_k)
        retrieval_time = round(time.time() - retrieval_start, 4)
        
        if not chunks:
            return {
                "answer": "I couldn't find any relevant information in the indexed documents. Please make sure PDFs are ingested.",
                "sources": [],
                "retrieval_time": retrieval_time,
                "generation_time": 0,
                "engine": "pure_python",
            }
        
        # Step 2: Build prompt with context
        prompt = _build_prompt(question, chunks)
        
        # Step 3: Call Ollama for generation
        gen_start = time.time()
        answer = self._call_ollama(prompt)
        gen_time = round(time.time() - gen_start, 4)
        
        return {
            "answer": answer,
            "sources": [
                {"filename": c["filename"], "score": c["score"], "snippet": c["text"][:200]}
                for c in chunks
            ],
            "retrieval_time": retrieval_time,
            "generation_time": gen_time,
            "engine": "pure_python",
        }
    
    def query_stream(self, question: str, top_k: int = None) -> Generator:
        """
        Streaming version of query — yields tokens as they arrive.
        """
        if top_k is None:
            top_k = TOP_K
        
        # Retrieve
        chunks = self.vector_store.search(question, top_k=top_k)
        
        if not chunks:
            yield json.dumps({
                "type": "sources",
                "sources": [],
            }) + "\n"
            yield json.dumps({
                "type": "token",
                "content": "No relevant documents found. Please ingest PDFs first.",
            }) + "\n"
            yield json.dumps({"type": "done"}) + "\n"
            return
        
        # Send sources first
        yield json.dumps({
            "type": "sources",
            "sources": [
                {"filename": c["filename"], "score": c["score"], "snippet": c["text"][:200]}
                for c in chunks
            ],
        }) + "\n"
        
        # Build prompt
        prompt = _build_prompt(question, chunks)
        
        # Stream from Ollama
        try:
            response = requests.post(
                f"{OLLAMA_BASE_URL}/api/generate",
                json={
                    "model": OLLAMA_MODEL,
                    "prompt": prompt,
                    "stream": True,
                    "options": {
                        "temperature": 0.3,
                        "top_p": 0.9,
                        "num_predict": 1024,
                    },
                },
                stream=True,
                timeout=120,
            )
            response.raise_for_status()
            
            for line in response.iter_lines():
                if line:
                    data = json.loads(line)
                    if "response" in data:
                        yield json.dumps({
                            "type": "token",
                            "content": data["response"],
                        }) + "\n"
                    if data.get("done", False):
                        break
        except Exception as e:
            yield json.dumps({
                "type": "token",
                "content": f"\n\n[Error communicating with Ollama: {e}]",
            }) + "\n"
        
        yield json.dumps({"type": "done"}) + "\n"
    
    def _call_ollama(self, prompt: str) -> str:
        """Direct HTTP call to Ollama API (no SDK wrapper)."""
        try:
            response = requests.post(
                f"{OLLAMA_BASE_URL}/api/generate",
                json={
                    "model": OLLAMA_MODEL,
                    "prompt": prompt,
                    "stream": False,
                    "options": {
                        "temperature": 0.3,
                        "top_p": 0.9,
                        "num_predict": 1024,
                    },
                },
                timeout=120,
            )
            response.raise_for_status()
            return response.json().get("response", "No response generated.")
        except requests.exceptions.ConnectionError:
            return "Error: Cannot connect to Ollama. Make sure Ollama is running (ollama serve)."
        except Exception as e:
            return f"Error generating response: {e}"
    
    def get_status(self) -> Dict:
        """Get the current status of the pure RAG engine."""
        stats = self.vector_store.get_stats()
        pdf_count = get_pdf_count()
        
        # Check Ollama
        ollama_ok = False
        try:
            r = requests.get(f"{OLLAMA_BASE_URL}/api/tags", timeout=5)
            ollama_ok = r.status_code == 200
        except Exception:
            pass
        
        return {
            "engine": "pure_python",
            "indexed_chunks": stats["total_chunks"],
            "pdf_count": pdf_count,
            "ollama_connected": ollama_ok,
            "ollama_model": OLLAMA_MODEL,
            "embedding_model": "all-MiniLM-L6-v2",
            "vector_store": "ChromaDB (direct)",
        }


# Singleton
_engine = None

def get_pure_engine() -> PureRAGEngine:
    global _engine
    if _engine is None:
        _engine = PureRAGEngine()
    return _engine
