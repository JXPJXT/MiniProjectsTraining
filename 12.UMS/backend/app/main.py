"""FastAPI application entry point — mounts all routers, configures CORS & middleware."""

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from app.core.config import get_settings
from app.auth.router import router as auth_router
from app.students.router import router as students_router
from app.placements.router import router as placements_router
from app.drives.router import router as drives_router
from app.documents.router import router as documents_router
from app.messaging.router import router as messaging_router
from app.notifications.router import router as notifications_router
from app.users.router import router as users_router
from app.admin.router import router as admin_router
from app.audit.router import router as audit_router

settings = get_settings()

app = FastAPI(
    title=settings.APP_NAME,
    version=settings.APP_VERSION,
    description="Cloud-native University Management System – Placement Portal",
    docs_url="/api/docs",
    redoc_url="/api/redoc",
)

# CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=[settings.FRONTEND_URL, "http://localhost:3000", "http://localhost:5173"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Mount all routers under /api prefix
PREFIX = "/api/v1"

app.include_router(auth_router, prefix=PREFIX)
app.include_router(students_router, prefix=PREFIX)
app.include_router(placements_router, prefix=PREFIX)
app.include_router(drives_router, prefix=PREFIX)
app.include_router(documents_router, prefix=PREFIX)
app.include_router(messaging_router, prefix=PREFIX)
app.include_router(notifications_router, prefix=PREFIX)
app.include_router(users_router, prefix=PREFIX)
app.include_router(admin_router, prefix=PREFIX)
app.include_router(audit_router, prefix=PREFIX)


@app.get("/")
async def root():
    return {
        "name": settings.APP_NAME,
        "version": settings.APP_VERSION,
        "status": "running",
        "docs": "/api/docs",
    }


@app.get("/health")
async def health():
    return {"status": "healthy"}
