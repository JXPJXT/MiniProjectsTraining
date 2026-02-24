"""
LangChain-based RAG Engine.
Uses LangChain ecosystem for the full pipeline.
Contrast with rag_pure/ which does everything from scratch.
"""
import os
import time
import json
from typing import List, Dict, Generator

from langchain_community.document_loaders import PyMuPDFLoader
from langchain_text_splitters import RecursiveCharacterTextSplitter
from langchain_community.embeddings import HuggingFaceEmbeddings
from langchain_chroma import Chroma
from langchain_ollama import OllamaLLM
from langchain_core.prompts import ChatPromptTemplate
from langchain_core.output_parsers import StrOutputParser
from langchain_core.runnables import RunnablePassthrough
from langchain_core.documents import Document

from ..common.config import (
    DATASET_DIR, CHROMA_LC_DIR, OLLAMA_BASE_URL,
    OLLAMA_MODEL, EMBEDDING_MODEL, EMBEDDING_DIMENSION,
    CHUNK_SIZE, CHUNK_OVERLAP, TOP_K,
)
from ..common.pdf_processor import get_pdf_count

import requests


# ─── Prompt Template (LCEL style) ───────────────────────
RAG_PROMPT = ChatPromptTemplate.from_template(
    """You are StudyDocs AI — an expert CS tutor. You answer questions ONLY using the provided context from academic PDF documents.

FORMAT RULES (follow strictly):

1. **Start with a TL;DR** — a 1-2 sentence bold summary answering the question directly.

2. **Use rich Markdown structure:**
   - Use `## Headings` for major sections
   - Use `### Sub-headings` where needed
   - Use **bold** for key terms on first mention
   - Use bullet points (`-`) for lists, numbered lists (`1.`) for sequential steps
   - Use `> blockquotes` for important definitions or formulas

3. **For layered/multi-part concepts** (e.g. OSI layers, SDLC phases):
   Use this format for each item:
   ### 🔹 Layer/Phase Name
   **Purpose:** one-line description
   - Key detail 1
   - Key detail 2
   - Example or analogy

4. **For comparisons** (e.g. algorithms, protocols):
   ALWAYS include a summary table:
   | Aspect | Option A | Option B |
   |--------|----------|----------|

5. **For algorithms:**
   - Show pseudocode or Python in ``` code blocks ```
   - Always state: Time Complexity, Space Complexity

6. **End with:**
   > 📌 **Key Takeaway:** one concise sentence summarizing the most important point.

   📄 **Sources:** list the filenames used.

7. Use analogies or real-world examples to make concepts intuitive for students.
8. If the context doesn't cover the question, say: "⚠️ This isn't covered in the provided documents."
9. Do NOT repeat the question. Jump straight into the answer.

### Context:
{context}

### Question:
{question}

### Answer:"""
)


def _format_docs(docs: List[Document]) -> str:
    """Format LangChain documents into a context string."""
    return "\n\n---\n\n".join(
        f"[Source: {doc.metadata.get('filename', 'unknown')}]\n{doc.page_content}"
        for doc in docs
    )


class LangChainRAGEngine:
    """
    LangChain-based RAG pipeline using LCEL (LangChain Expression Language):
    1. PDF loading (LangChain PyMuPDFLoader)
    2. Text splitting (RecursiveCharacterTextSplitter)
    3. Embeddings (HuggingFace via LangChain)
    4. Vector store (Chroma via LangChain)
    5. LCEL Chain (Retriever → Prompt → Ollama LLM → Output)
    """

    def __init__(self):
        self._embeddings = None
        self._vectorstore = None
        self._llm = None
        self._chain = None

    @property
    def embeddings(self):
        if self._embeddings is None:
            print("[INFO] LangChain: Loading HuggingFace embeddings...")
            self._embeddings = HuggingFaceEmbeddings(
                model_name=EMBEDDING_MODEL,
                model_kwargs={"device": "cpu"},
                encode_kwargs={"normalize_embeddings": True},
            )
            print("[INFO] LangChain: Embeddings loaded")
        return self._embeddings

    @property
    def vectorstore(self):
        if self._vectorstore is None:
            self._vectorstore = Chroma(
                collection_name="study_pdfs_langchain",
                embedding_function=self.embeddings,
                persist_directory=CHROMA_LC_DIR,
                collection_metadata={"hnsw:space": "cosine"},
            )
        return self._vectorstore

    @property
    def llm(self):
        if self._llm is None:
            self._llm = OllamaLLM(
                model=OLLAMA_MODEL,
                base_url=OLLAMA_BASE_URL,
                temperature=0.3,
                top_p=0.9,
                num_predict=2048,
            )
        return self._llm

    @property
    def chain(self):
        """Build an LCEL RAG chain: retriever → format → prompt → llm → parse."""
        if self._chain is None:
            retriever = self.vectorstore.as_retriever(
                search_type="similarity",
                search_kwargs={"k": TOP_K},
            )
            self._chain = (
                {"context": retriever | _format_docs, "question": RunnablePassthrough()}
                | RAG_PROMPT
                | self.llm
                | StrOutputParser()
            )
        return self._chain

    def ingest(self, force: bool = False) -> Dict:
        """
        Ingest all PDFs from dataset directory using LangChain loaders.
        """
        try:
            existing_count = self.vectorstore._collection.count()
        except Exception:
            existing_count = 0

        if existing_count > 0 and not force:
            return {
                "status": "already_ingested",
                "total_chunks": existing_count,
                "message": "Vector store already has data. Use force=True to re-ingest.",
            }

        if force:
            try:
                # Reset the vectorstore
                self._vectorstore = None
                self._chain = None
                import shutil
                if os.path.exists(CHROMA_LC_DIR):
                    shutil.rmtree(CHROMA_LC_DIR)
                    os.makedirs(CHROMA_LC_DIR, exist_ok=True)
            except Exception as e:
                print(f"[WARN] Could not clear vector store: {e}")

        start = time.time()

        # Step 1: Find all PDFs
        pdf_files = []
        for root, _, files in os.walk(DATASET_DIR):
            for f in files:
                if f.lower().endswith(".pdf"):
                    pdf_files.append(os.path.join(root, f))

        if not pdf_files:
            return {
                "status": "no_documents",
                "total_chunks": 0,
                "message": "No PDFs found in datasets directory.",
            }

        print(f"[INFO] LangChain: Found {len(pdf_files)} PDFs")

        # Step 2: Load PDFs with LangChain loader
        all_docs = []
        for i, pdf_path in enumerate(pdf_files):
            try:
                loader = PyMuPDFLoader(pdf_path)
                docs = loader.load()
                for doc in docs:
                    doc.metadata["filename"] = os.path.basename(pdf_path)
                all_docs.extend(docs)
            except Exception as e:
                print(f"[WARN] LangChain: Failed to load {pdf_path}: {e}")

            if (i + 1) % 10 == 0:
                print(f"[INFO] LangChain: Loaded {i + 1}/{len(pdf_files)} PDFs")

        print(f"[INFO] LangChain: Loaded {len(all_docs)} pages from {len(pdf_files)} PDFs")

        # Step 3: Split into chunks
        splitter = RecursiveCharacterTextSplitter(
            chunk_size=CHUNK_SIZE,
            chunk_overlap=CHUNK_OVERLAP,
            length_function=len,
            separators=["\n\n", "\n", ". ", " ", ""],
        )
        chunks = splitter.split_documents(all_docs)
        print(f"[INFO] LangChain: Created {len(chunks)} chunks")

        # Filter out empty/tiny chunks
        chunks = [c for c in chunks if len(c.page_content.strip()) > 50]

        # Step 4: Add to vector store in batches
        batch_size = 100
        for i in range(0, len(chunks), batch_size):
            batch = chunks[i:i + batch_size]
            self.vectorstore.add_documents(batch)
            print(f"[INFO] LangChain: Indexed {min(i + batch_size, len(chunks))}/{len(chunks)} chunks")

        elapsed = round(time.time() - start, 2)

        # Reset chain so it picks up new data
        self._chain = None

        return {
            "status": "success",
            "documents_processed": len(pdf_files),
            "total_chunks": len(chunks),
            "time_seconds": elapsed,
            "message": f"Ingested {len(pdf_files)} PDFs into {len(chunks)} chunks in {elapsed}s",
        }

    def query(self, question: str, top_k: int = None) -> Dict:
        """Run the LCEL RAG chain (non-streaming)."""
        start = time.time()

        try:
            # Get sources separately for citation
            retriever = self.vectorstore.as_retriever(
                search_type="similarity",
                search_kwargs={"k": top_k or TOP_K},
            )
            docs = retriever.invoke(question)

            sources = []
            for doc in docs:
                sources.append({
                    "filename": doc.metadata.get("filename", doc.metadata.get("source", "unknown")),
                    "score": 0.0,
                    "snippet": doc.page_content[:200],
                })

            # Build context and generate answer
            context = _format_docs(docs)
            prompt = RAG_PROMPT.format(context=context, question=question)
            answer = self.llm.invoke(prompt)

            gen_time = round(time.time() - start, 4)

            return {
                "answer": answer,
                "sources": sources,
                "retrieval_time": 0,
                "generation_time": gen_time,
                "engine": "langchain",
            }
        except Exception as e:
            return {
                "answer": f"Error: {str(e)}",
                "sources": [],
                "retrieval_time": 0,
                "generation_time": 0,
                "engine": "langchain",
            }

    def query_stream(self, question: str, top_k: int = None) -> Generator:
        """
        Streaming query — retrieves then streams generation tokens.
        Uses direct Ollama HTTP for reliable streaming.
        """
        if top_k is None:
            top_k = TOP_K

        # Retrieve similar documents
        try:
            retriever = self.vectorstore.as_retriever(
                search_type="similarity",
                search_kwargs={"k": top_k},
            )
            docs = retriever.invoke(question)
        except Exception as e:
            yield json.dumps({"type": "sources", "sources": []}) + "\n"
            yield json.dumps({"type": "token", "content": f"Retrieval error: {e}"}) + "\n"
            yield json.dumps({"type": "done"}) + "\n"
            return

        # Send sources
        sources = []
        for doc in docs:
            sources.append({
                "filename": doc.metadata.get("filename", doc.metadata.get("source", "unknown")),
                "score": 0.0,
                "snippet": doc.page_content[:200],
            })

        yield json.dumps({"type": "sources", "sources": sources}) + "\n"

        # Build context
        context = _format_docs(docs)
        full_prompt = RAG_PROMPT.format(context=context, question=question)

        # Stream from Ollama directly (more reliable for streaming)
        try:
            response = requests.post(
                f"{OLLAMA_BASE_URL}/api/generate",
                json={
                    "model": OLLAMA_MODEL,
                    "prompt": full_prompt,
                    "stream": True,
                    "options": {
                        "temperature": 0.3,
                        "top_p": 0.9,
                        "num_predict": 2048,
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
                "content": f"\n\n[Error: {e}]",
            }) + "\n"

        yield json.dumps({"type": "done"}) + "\n"

    def get_status(self) -> Dict:
        """Get the current status of the LangChain RAG engine."""
        try:
            count = self.vectorstore._collection.count()
        except Exception:
            count = 0

        pdf_count = get_pdf_count()

        ollama_ok = False
        try:
            r = requests.get(f"{OLLAMA_BASE_URL}/api/tags", timeout=5)
            ollama_ok = r.status_code == 200
        except Exception:
            pass

        return {
            "engine": "langchain",
            "indexed_chunks": count,
            "pdf_count": pdf_count,
            "ollama_connected": ollama_ok,
            "ollama_model": OLLAMA_MODEL,
            "embedding_model": f"HuggingFace({EMBEDDING_MODEL})",
            "vector_store": "ChromaDB (LangChain wrapper)",
        }


# Singleton
_engine = None

def get_langchain_engine() -> LangChainRAGEngine:
    global _engine
    if _engine is None:
        _engine = LangChainRAGEngine()
    return _engine
