"""
ML Insight Explorer — FastAPI Backend
======================================
Production-grade ML exploration platform backend.
Handles data loading, EDA, preprocessing, training, and evaluation.
"""

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from routers import datasets, eda, training

app = FastAPI(
    title="ML Insight Explorer API",
    description="Backend for the ML Insight Explorer platform",
    version="1.0.0",
)

# --- CORS for Next.js frontend ---
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000", "http://127.0.0.1:3000"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


@app.get("/api/health")
def health_check():
    return {"status": "ok", "message": "ML Insight Explorer API is running"}


# Mount routers
app.include_router(datasets.router, prefix="/api/datasets", tags=["Datasets"])
app.include_router(eda.router, prefix="/api/eda", tags=["EDA"])
app.include_router(training.router, prefix="/api/training", tags=["Training"])

if __name__ == "__main__":
    import uvicorn
    uvicorn.run("main:app", host="0.0.0.0", port=8000, reload=True)
