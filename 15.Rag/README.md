# 📚 StudyDocs RAG — AI Study Assistant

A **dual-engine Retrieval Augmented Generation (RAG) system** for querying study material PDFs locally. Features two independent RAG implementations — **Pure Python** (no frameworks) and **LangChain (LCEL)** — with a **Next.js** premium frontend.

> **Runs 100% offline** on i5-13450HX + RTX 3050 6GB using Ollama.

---

## 🎯 What It Does

Upload your CS study PDFs and ask questions in natural language. The system:
1. Extracts text from all PDFs in the `datasets/` folder
2. Splits text into overlapping chunks
3. Creates vector embeddings for each chunk
4. Stores embeddings in a local ChromaDB vector database
5. On each query: finds the most relevant chunks → feeds them as context to the LLM → streams the answer back

---

## 🏗️ Architecture

```
┌─────────────────────────────────────────────────────────────────┐
│                        Next.js Frontend (:3000)                 │
│   ┌──────────────┐  ┌──────────────┐  ┌─────────────────────┐  │
│   │ Engine Toggle │  │  Ingest Btn  │  │  Chat + Streaming   │  │
│   └──────┬───────┘  └──────┬───────┘  └──────────┬──────────┘  │
│          │                 │                      │             │
│          └─────────────────┼──────────────────────┘             │
│                            │  /api/* proxy                     │
└────────────────────────────┼───────────────────────────────────┘
                             │
                             ▼
┌─────────────────────────────────────────────────────────────────┐
│                    FastAPI Backend (:8000)                       │
│   ┌──────────────────────┐    ┌──────────────────────────────┐  │
│   │   Pure Python Engine │    │     LangChain (LCEL) Engine  │  │
│   │                      │    │                              │  │
│   │  PyMuPDF → Custom    │    │  PyMuPDFLoader → Recursive   │  │
│   │  Chunker → Sentence  │    │  TextSplitter → HuggingFace  │  │
│   │  Transformers →      │    │  Embeddings → Chroma →       │  │
│   │  ChromaDB → Ollama   │    │  LCEL Chain → Ollama         │  │
│   │  (direct HTTP)       │    │  (LangChain wrapper)         │  │
│   └──────────┬───────────┘    └──────────────┬───────────────┘  │
│              │                               │                  │
│              └───────────┬───────────────────┘                  │
│                          ▼                                      │
│                  ┌───────────────┐                               │
│                  │   Ollama API  │                               │
│                  │  qwen2.5:7b   │                               │
│                  └───────────────┘                               │
└─────────────────────────────────────────────────────────────────┘
```

### File Structure
```
15.Rag/
├── datasets/                      # Drop your study PDFs here
├── backend/
│   ├── common/
│   │   ├── config.py              # Centralized settings
│   │   └── pdf_processor.py       # PyMuPDF text extraction
│   ├── rag_pure/                  # Engine 1: Pure Python
│   │   ├── chunker.py             # Custom sentence-aware splitter
│   │   ├── embeddings.py          # SentenceTransformer wrapper
│   │   ├── vector_store.py        # Direct ChromaDB client
│   │   └── engine.py              # Pipeline orchestrator
│   ├── rag_langchain/             # Engine 2: LangChain LCEL
│   │   └── engine.py              # LCEL chain pipeline
│   ├── server.py                  # FastAPI API server
│   └── requirements.txt
├── frontend/                      # Next.js 15 app
│   ├── src/app/
│   │   ├── layout.js              # Root layout + metadata
│   │   ├── page.js                # Main chat UI (streaming)
│   │   └── globals.css            # Premium design system
│   ├── next.config.mjs            # API proxy config
│   └── package.json
└── README.md
```

---

## 🔧 Tech Stack

| Component       | Technology                        | Notes                                |
|-----------------|-----------------------------------|--------------------------------------|
| **LLM**         | Ollama `qwen2.5:7b`              | 4.7GB, local inference               |
| **Embeddings**  | `all-MiniLM-L6-v2`               | 80MB, CPU-optimized, 384-dim vectors |
| **Vector DB**   | ChromaDB                          | Persistent, local, cosine similarity |
| **PDF Parser**  | PyMuPDF (fitz)                    | Fast C-backed PDF text extraction    |
| **API Server**  | FastAPI + Uvicorn                 | Async, streaming SSE support         |
| **Frontend**    | Next.js 15 (React)                | API proxy, premium glassmorphism UI  |

---

## 🚀 Quick Start

### Prerequisites
- **Python 3.10+** and **Node.js 18+**
- [Ollama](https://ollama.ai) installed with `qwen2.5:7b` pulled:
  ```bash
  ollama pull qwen2.5:7b
  ```

### 1. Start Ollama
```bash
ollama serve
```

### 2. Start Backend (Terminal 1)
```bash
cd 15.Rag
pip install -r backend/requirements.txt
python -m uvicorn backend.server:app --host 0.0.0.0 --port 8000 --reload
```

### 3. Start Frontend (Terminal 2)
```bash
cd 15.Rag/frontend
npm install
npm run dev
```

### 4. Open http://localhost:3000
1. Click **"Ingest PDFs"** to index your study materials
2. Select engine (**Pure Python** or **LangChain**)
3. Start asking questions!

---

## ⚙️ How The Two Engines Work

Both engines follow the same RAG pipeline but implement it very differently:

```
[User Question] → [Embed Query] → [Vector Search] → [Retrieve Top-K Chunks]
                                                            │
                                                            ▼
                                            [Build Prompt with Context]
                                                            │
                                                            ▼
                                              [LLM Generates Answer]
                                                            │
                                                            ▼
                                            [Stream Tokens to Frontend]
```

### ⚡ Engine 1: Pure Python (Zero Frameworks)

Every component is built from scratch — no LangChain, no orchestration library.

#### Step-by-Step Pipeline:

**1. PDF Text Extraction** (`common/pdf_processor.py`)
```
PyMuPDF (fitz) opens each PDF → iterates pages → extracts raw text
→ returns list of {filename, text} dicts
```
- Uses `fitz.open()` for fast C-backed parsing
- Handles encoding issues and empty pages gracefully

**2. Text Chunking** (`rag_pure/chunker.py`)
```
Raw text → Split on sentence boundaries (". ", "\n\n", "\n")
→ Build chunks of ~1000 chars with ~200 char overlap
→ Each chunk keeps metadata: {filename, chunk_index}
```
- **Custom sentence-aware splitter**: doesn't break mid-sentence
- **Overlapping windows**: prevents losing context at chunk boundaries
- Priority: paragraph breaks > newlines > periods > spaces

**3. Embedding** (`rag_pure/embeddings.py`)
```
Text chunks → SentenceTransformer('all-MiniLM-L6-v2') → 384-dim float vectors
```
- Direct `sentence-transformers` library usage
- Runs on CPU (fast enough, ~100 chunks/sec)
- Normalizes embeddings for cosine similarity

**4. Vector Storage** (`rag_pure/vector_store.py`)
```
ChromaDB Python client → collection "study_pdfs_pure"
→ Stores: embeddings + text + metadata (filename, chunk_id)
→ Uses HNSW index with cosine distance
```
- Direct `chromadb.PersistentClient` — no wrapper, no abstraction
- Batched inserts (100 chunks at a time) to avoid memory spikes
- Persistent storage in `vectorstore_pure/` directory

**5. Retrieval + Generation** (`rag_pure/engine.py`)
```
User query → Embed with same model → ChromaDB similarity search (top 5)
→ Build prompt: System prompt + Retrieved chunks + Question
→ POST to Ollama REST API (http://localhost:11434/api/generate)
→ Stream response tokens back as JSON lines
```
- **Direct HTTP calls** to Ollama — no SDK, no wrapper
- Streams using `requests.post(stream=True)` + `iter_lines()`
- Each token is yielded as `{"type": "token", "content": "..."}`

#### Key Design Decisions:
- **Why no frameworks?** Full control over every step. Easy to debug, modify, and understand the entire pipeline
- **Why direct HTTP to Ollama?** Eliminates SDK version conflicts. The Ollama REST API is simple and stable
- **Why sentence-aware chunking?** Naive character-based splitting breaks mid-concept. Sentence boundaries preserve semantic meaning

---

### 🔗 Engine 2: LangChain (LCEL Pipeline)

Uses the **LangChain Expression Language (LCEL)** — the modern, composable pipeline pattern.

#### Step-by-Step Pipeline:

**1. PDF Loading** (LangChain's `PyMuPDFLoader`)
```python
PyMuPDFLoader(pdf_path).load()
→ Returns list of LangChain Document objects with page_content + metadata
```
- Same underlying PyMuPDF, but wrapped in LangChain's `Document` schema
- Automatic metadata population (source, page number)

**2. Text Splitting** (LangChain's `RecursiveCharacterTextSplitter`)
```python
RecursiveCharacterTextSplitter(
    chunk_size=1000,
    chunk_overlap=200,
    separators=["\n\n", "\n", ". ", " ", ""]
)
```
- LangChain's built-in recursive splitter
- Same concept as our custom chunker but maintained by LangChain team
- Splits on the first separator that produces valid chunks, then recurses

**3. Embedding** (LangChain's `HuggingFaceEmbeddings`)
```python
HuggingFaceEmbeddings(
    model_name="all-MiniLM-L6-v2",
    model_kwargs={"device": "cpu"},
    encode_kwargs={"normalize_embeddings": True}
)
```
- Wraps `sentence-transformers` in LangChain's `Embeddings` interface
- Same model, same output — just a LangChain-compatible wrapper

**4. Vector Store** (LangChain's `Chroma` wrapper)
```python
Chroma(
    collection_name="study_pdfs_langchain",
    embedding_function=embeddings,
    persist_directory="vectorstore_langchain/"
)
```
- LangChain's Chroma integration handles embedding + storage together
- Exposes `.as_retriever()` for easy integration with chains

**5. LCEL Chain** (The Modern LangChain Way)
```python
chain = (
    {"context": retriever | format_docs, "question": RunnablePassthrough()}
    | prompt_template
    | ollama_llm
    | StrOutputParser()
)
```
This is a **composable pipeline** using the `|` (pipe) operator:
1. `retriever | format_docs` — retrieves docs, then formats them into a string
2. `RunnablePassthrough()` — passes the question through unchanged
3. Both feed into the prompt template as `{context}` and `{question}`
4. Prompt goes to `OllamaLLM` for generation
5. `StrOutputParser()` extracts the string from the LLM output

**For streaming**: we bypass the LCEL chain and call Ollama's REST API directly for reliable token-by-token streaming (LangChain's streaming can be inconsistent).

#### Key Design Decisions:
- **Why LCEL?** It replaced the deprecated `RetrievalQA` chain. LCEL is composable, type-safe, and supports async natively
- **Why direct Ollama for streaming?** LangChain's callback-based streaming adds latency and complexity. Direct HTTP streaming is simpler and more reliable
- **Why a separate collection?** Each engine manages its own vector store so you can compare retrieval quality independently

---

### 🆚 Pure Python vs LangChain — Comparison

| Aspect              | ⚡ Pure Python              | 🔗 LangChain                |
|---------------------|----------------------------|------------------------------|
| **Dependencies**    | 4 libs (fitz, ST, chroma, requests) | 8+ LangChain packages |
| **Lines of code**   | ~500 across 5 files        | ~300 in 1 file               |
| **Flexibility**     | Full control               | Constrained by abstractions  |
| **Debugging**       | Simple stack traces        | Deep LangChain internals     |
| **Updates**         | Stable (you own the code)  | Frequent breaking changes    |
| **Learning value**  | Understand RAG deeply      | Learn industry tooling       |
| **Production use**  | Good for custom pipelines  | Good for rapid prototyping   |
| **Streaming**       | Direct HTTP (reliable)     | Direct HTTP (reliable)       |

**Bottom line**: Pure Python teaches you *how RAG works*. LangChain teaches you *how the industry builds RAG*. Both produce equivalent results.

---

## 📡 API Endpoints (port 8000)

| Method | Endpoint             | Body                                         | Description              |
|--------|----------------------|----------------------------------------------|--------------------------|
| `GET`  | `/api/health`        | —                                            | Server health check      |
| `GET`  | `/api/status`        | —                                            | Status of both engines   |
| `GET`  | `/api/status/{engine}` | —                                          | Status of one engine     |
| `POST` | `/api/ingest`        | `{engine: "pure"/"langchain"/"both", force}` | Ingest PDFs              |
| `POST` | `/api/query`         | `{question, engine, top_k, stream}`          | Query with streaming     |

---

## 🎨 Frontend Features

- **Dark/Light theme** toggle with smooth transitions
- **Glassmorphism** design with animated background orbs
- **Real-time streaming** — tokens appear as generated
- **Source citations** — expandable panel showing retrieved chunks
- **Engine switching** — toggle between Pure Python and LangChain
- **Status indicators** — Ollama connection + indexed chunk count
- **Example queries** — one-click CS topic questions
