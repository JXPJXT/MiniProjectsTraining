"""
Unified FastAPI server for both RAG engines.
Serves both the Pure Python and LangChain RAG pipelines.
Frontend is a separate Next.js app connecting to this API.
"""
import os
from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import StreamingResponse
from pydantic import BaseModel
from typing import Optional

# ─── App Setup ──────────────────────────────────────────
app = FastAPI(
    title="StudyDocs RAG API",
    description="Dual RAG engine — Pure Python & LangChain — over study material PDFs (CS, SE, DS, ML, Networks)",
    version="1.0.0",
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# ─── Request Models ─────────────────────────────────────
class QueryRequest(BaseModel):
    question: str
    engine: str = "pure"        # "pure" or "langchain"
    top_k: Optional[int] = 5
    stream: Optional[bool] = True

class IngestRequest(BaseModel):
    engine: str = "both"        # "pure", "langchain", or "both"
    force: Optional[bool] = False


# ─── Lazy Engine Loading ────────────────────────────────
_pure_engine = None
_lc_engine = None

def get_engine(name: str):
    global _pure_engine, _lc_engine
    if name == "pure":
        if _pure_engine is None:
            from .rag_pure.engine import get_pure_engine
            _pure_engine = get_pure_engine()
        return _pure_engine
    elif name == "langchain":
        if _lc_engine is None:
            from .rag_langchain.engine import get_langchain_engine
            _lc_engine = get_langchain_engine()
        return _lc_engine
    else:
        raise HTTPException(400, f"Unknown engine: {name}. Use 'pure' or 'langchain'.")


# ─── API Routes ─────────────────────────────────────────

@app.get("/api/health")
async def health():
    return {"status": "ok", "message": "StudyDocs RAG Server is running"}


@app.get("/api/status/{engine}")
async def engine_status(engine: str):
    """Get status of a specific engine."""
    eng = get_engine(engine)
    return eng.get_status()


@app.get("/api/status")
async def all_status():
    """Get status of both engines."""
    pure = get_engine("pure").get_status()
    lc = get_engine("langchain").get_status()
    return {"pure": pure, "langchain": lc}


@app.post("/api/ingest")
async def ingest(req: IngestRequest):
    """Ingest PDFs into the vector store(s)."""
    results = {}
    
    if req.engine in ("pure", "both"):
        eng = get_engine("pure")
        results["pure"] = eng.ingest(force=req.force)
    
    if req.engine in ("langchain", "both"):
        eng = get_engine("langchain")
        results["langchain"] = eng.ingest(force=req.force)
    
    return results


@app.post("/api/query")
async def query(req: QueryRequest):
    """Query the RAG engine. Supports streaming."""
    eng = get_engine(req.engine)
    
    if req.stream:
        return StreamingResponse(
            eng.query_stream(req.question, top_k=req.top_k),
            media_type="text/event-stream",
            headers={
                "Cache-Control": "no-cache",
                "Connection": "keep-alive",
                "X-Accel-Buffering": "no",
            },
        )
    else:
        result = eng.query(req.question, top_k=req.top_k)
        return result


# ─── Run ────────────────────────────────────────────────
if __name__ == "__main__":
    import uvicorn
    uvicorn.run("backend.server:app", host="0.0.0.0", port=8000, reload=True)
