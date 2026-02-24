# 🏛️ GovDocs RAG — Dual Engine AI Document Intelligence

> **Offline-first** Retrieval Augmented Generation system that queries 1,000 U.S. government PDF documents using **two separate RAG implementations** — one built **from scratch** (pure Python) and one with **LangChain** — both powered by **Ollama qwen2.5:7b** running locally.

---

## 🏗️ Architecture

```
┌──────────────────────────────────────────────────────┐
│                 Sleek Web Frontend                    │
│          (HTML/CSS/JS • Glassmorphism UI)             │
├──────────────┬───────────────────────────────────────┤
│              │          FastAPI Server                │
│              ├───────────────┬───────────────────────┤
│              │  Pure Python  │      LangChain         │
│              │    RAG ⚡     │        RAG 🔗          │
│              ├───────────────┴───────────────────────┤
│              │        Shared Utilities                │
│              │   (PDF Processor • Config)             │
├──────────────┴───────────────────────────────────────┤
│  ChromaDB (Vector Store)  │  Ollama qwen2.5:7b (LLM) │
│  sentence-transformers    │  (localhost:11434)         │
│  (all-MiniLM-L6-v2)      │                           │
└──────────────────────────────────────────────────────┘
```

## 🔧 Tech Stack

| Component          | Pure Python RAG           | LangChain RAG                  |
|--------------------|---------------------------|--------------------------------|
| PDF Parsing        | PyMuPDF (fitz)            | LangChain PyMuPDFLoader        |
| Text Chunking      | Custom sentence-aware     | RecursiveCharacterTextSplitter |
| Embeddings         | sentence-transformers     | HuggingFaceEmbeddings          |
| Vector Store       | ChromaDB (direct client)  | ChromaDB (LangChain wrapper)   |
| LLM Inference      | Ollama REST API (requests)| LangChain OllamaLLM            |
| Streaming          | Direct HTTP streaming     | Direct HTTP streaming          |

## 🖥️ Hardware Requirements

Optimized for your setup:
- **CPU**: i5-13450HX (embeddings run on CPU)
- **GPU**: RTX 3050 6GB (Ollama uses GPU for inference)
- **RAM**: ~4.7 GB for qwen2.5:7b + ~80 MB for embeddings
- **Fully offline** — no internet required after initial setup

## 🚀 Quick Start

### 1. Prerequisites
```bash
# Make sure Ollama is running with qwen2.5:7b
ollama serve
ollama pull qwen2.5:7b  # if not already pulled
```

### 2. Install Dependencies
```bash
cd 15.Rag
pip install -r backend/requirements.txt
```

### 3. Add PDFs
Place your `.gov` PDF files into the `datasets/` folder.

### 4. Run the Server
```bash
python -m uvicorn backend.server:app --host 0.0.0.0 --port 8000 --reload
```

### 5. Open the UI
Navigate to **http://localhost:8000** in your browser.

### 6. Ingest & Query
1. Select an engine (Pure Python or LangChain)
2. Click **Ingest PDFs** to process the documents
3. Start asking questions!

## 📁 Project Structure

```
15.Rag/
├── datasets/                  # Place your PDFs here
├── vectorstore_pure/          # ChromaDB data (pure engine)
├── vectorstore_langchain/     # ChromaDB data (LangChain engine)
├── backend/
│   ├── common/
│   │   ├── config.py          # Central configuration
│   │   └── pdf_processor.py   # Shared PDF extraction
│   ├── rag_pure/              # 🔥 Framework-free RAG
│   │   ├── chunker.py         # Custom text splitter
│   │   ├── embeddings.py      # sentence-transformers wrapper
│   │   ├── vector_store.py    # ChromaDB direct client
│   │   └── engine.py          # Full RAG pipeline
│   ├── rag_langchain/         # 🔗 LangChain RAG
│   │   └── engine.py          # LangChain pipeline
│   ├── server.py              # FastAPI unified API
│   └── requirements.txt
├── frontend/
│   ├── index.html
│   ├── style.css
│   └── script.js
└── README.md
```

## 🔌 API Endpoints

| Method | Endpoint              | Description                    |
|--------|-----------------------|--------------------------------|
| GET    | `/api/health`         | Health check                   |
| GET    | `/api/status`         | Both engines status            |
| GET    | `/api/status/{engine}`| Specific engine status         |
| POST   | `/api/ingest`         | Ingest PDFs into vector store  |
| POST   | `/api/query`          | Query with streaming support   |

### Example Query
```bash
curl -X POST http://localhost:8000/api/query \
  -H "Content-Type: application/json" \
  -d '{"question": "What government services are described?", "engine": "pure", "stream": false}'
```

## 📊 Dataset

**One Thousand .gov PDF Dataset** from the Library of Congress Web Archiving Program:
- 1,000 unique PDF files from `.gov` domains
- Includes government reports, forms, policies, and data
- Originally created 11/6/2018

---

*Built with ❤️ — Fully offline, fully local, zero cloud dependencies.*
