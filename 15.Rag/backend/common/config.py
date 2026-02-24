"""
Shared configuration for both RAG implementations.
Optimized for: i5-13450HX + RTX 3050 6GB + Ollama qwen2.5:7b
"""
import os

# ─── Paths ───────────────────────────────────────────────
BASE_DIR = os.path.dirname(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))
DATASET_DIR = os.path.join(BASE_DIR, "datasets")
CHROMA_PURE_DIR = os.path.join(BASE_DIR, "vectorstore_pure")
CHROMA_LC_DIR = os.path.join(BASE_DIR, "vectorstore_langchain")

# ─── Ollama ──────────────────────────────────────────────
OLLAMA_BASE_URL = "http://localhost:11434"
OLLAMA_MODEL = "qwen2.5:7b"

# ─── Embedding Model (runs on CPU, ~80 MB) ──────────────
EMBEDDING_MODEL = "all-MiniLM-L6-v2"
EMBEDDING_DIMENSION = 384

# ─── Chunking ───────────────────────────────────────────
CHUNK_SIZE = 512          # tokens-ish (characters)
CHUNK_OVERLAP = 64        # overlap between chunks

# ─── Retrieval ──────────────────────────────────────────
TOP_K = 5                 # number of chunks to retrieve

# ─── PDF Processing ────────────────────────────────────
MAX_PDF_PAGES = 200       # skip extremely large PDFs
BATCH_SIZE = 50           # PDFs per ingest batch

# Ensure directories exist
os.makedirs(DATASET_DIR, exist_ok=True)
os.makedirs(CHROMA_PURE_DIR, exist_ok=True)
os.makedirs(CHROMA_LC_DIR, exist_ok=True)
