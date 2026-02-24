# 📚 StudyDocs RAG — AI Study Assistant

A **dual-engine Retrieval Augmented Generation (RAG) system** for querying study material PDFs locally. Features two independent RAG implementations — **Pure Python** (no frameworks) and **LangChain** — with a shared premium frontend.

## 🎯 What It Does

Upload your CS study PDFs (Software Engineering, Data Structures, OS, Computer Networks, ML, Python, etc.) and ask questions. The system retrieves relevant context from your documents and generates answers using a local LLM.

## 🏗️ Architecture

```
15.Rag/
├── datasets/                  # Study material PDFs (45 books)
├── backend/
│   ├── common/
│   │   ├── config.py          # Shared config (Ollama, embeddings, chunking)
│   │   └── pdf_processor.py   # PyMuPDF-based PDF text extraction
│   ├── rag_pure/              # Pure Python RAG (zero frameworks)
│   │   ├── chunker.py         # Custom sentence-aware text chunking
│   │   ├── embeddings.py      # Sentence-transformers embeddings
│   │   ├── vector_store.py    # ChromaDB direct client
│   │   └── engine.py          # Full RAG pipeline orchestrator
│   ├── rag_langchain/         # LangChain RAG
│   │   └── engine.py          # LangChain-based RAG pipeline
│   ├── server.py              # FastAPI unified API server
│   └── requirements.txt       # Python dependencies
├── frontend/
│   ├── index.html             # Premium glassmorphism UI
│   ├── style.css              # Full design system (dark/light themes)
│   └── script.js              # Chat interface with streaming
└── README.md
```

## 🔧 Tech Stack

| Component | Technology | Notes |
|-----------|-----------|-------|
| **LLM** | Ollama `qwen2.5:7b` | 4.7GB, runs locally |
| **Embeddings** | `all-MiniLM-L6-v2` | 80MB, CPU-optimized |
| **Vector DB** | ChromaDB | Persistent, local storage |
| **PDF Parser** | PyMuPDF (fitz) | Fast C-backed parser |
| **API Server** | FastAPI + Uvicorn | Async, streaming support |
| **Frontend** | Vanilla HTML/CSS/JS | No build step required |

**Optimized for:** i5-13450HX + RTX 3050 6GB (runs entirely offline)

## 📖 Study Materials Included

45 PDFs covering:
- **Software Engineering** — SDLC, architecture patterns, practitioner's approach
- **Data Structures & Algorithms** — Linked lists, sorting, trees, complexity analysis  
- **Computer Networks** — TCP/IP, OSI model, data communications
- **Machine Learning** — Supervised/unsupervised, scikit-learn, TensorFlow
- **Python** — Crash courses, data structures, decorators, OOP
- **Web Development** — HTML/CSS, React, MERN stack, full-stack projects
- **Computer Organization** — Architecture, hardware fundamentals

## 🚀 Quick Start

### Prerequisites
- Python 3.10+
- [Ollama](https://ollama.ai) installed with `qwen2.5:7b` model

### 1. Install Dependencies
```bash
cd 15.Rag
pip install -r backend/requirements.txt
```

### 2. Start Ollama
```bash
ollama serve
```

### 3. Run the Server
```bash
python -m uvicorn backend.server:app --host 0.0.0.0 --port 8000 --reload
```

### 4. Open in Browser
Navigate to `http://localhost:8000`

### 5. Ingest & Query
1. Click **"Ingest PDFs"** to index your study materials
2. Select engine (**Pure Python** or **LangChain**)
3. Ask questions about SE, DSA, OS, CN, ML, Python, etc.

## 🔄 Two RAG Engines Compared

### ⚡ Pure Python Engine
- **No framework dependencies** — built from scratch
- Direct HTTP calls to Ollama REST API
- Custom sentence-aware text chunking
- Direct ChromaDB Python client
- Full control over every RAG pipeline step

### 🔗 LangChain Engine
- Uses LangChain ecosystem (loaders, splitters, chains)
- `RetrievalQA` chain with `stuff` strategy
- LangChain's `HuggingFaceEmbeddings` wrapper
- Chroma via LangChain integration
- Framework-managed pipeline orchestration

## 📡 API Endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| `GET` | `/api/health` | Server health check |
| `GET` | `/api/status` | Status of both engines |
| `GET` | `/api/status/{engine}` | Status of specific engine |
| `POST` | `/api/ingest` | Ingest PDFs into vector store |
| `POST` | `/api/query` | Query with streaming support |

## 🎨 Frontend Features

- **Dark/Light theme** toggle with smooth transitions
- **Glassmorphism** design with animated background orbs
- **Real-time streaming** — tokens appear as they're generated
- **Source citations** — expandable panel showing retrieved chunks
- **Engine switching** — toggle between Pure Python and LangChain
- **Performance metrics** — response time and source count
- **Responsive** — works on mobile and desktop
