from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles
from slowapi import Limiter, _rate_limit_exceeded_handler
from slowapi.util import get_remote_address
from slowapi.errors import RateLimitExceeded
from pathlib import Path

from .config import get_settings
from .database import engine, Base
from .middleware.security import SecurityHeadersMiddleware
from .auth.oauth import router as auth_router
from .routers.public import router as public_router
from .routers.admin import router as admin_router
from .routers.contact_form import router as contact_router

settings = get_settings()

app = FastAPI(title="SIMHA API", docs_url="/api/docs", redoc_url=None)

# Rate limiting
limiter = Limiter(key_func=get_remote_address)
app.state.limiter = limiter
app.add_exception_handler(RateLimitExceeded, _rate_limit_exceeded_handler)

# CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.cors_origins_list,
    allow_credentials=True,
    allow_methods=["GET", "POST", "PUT", "DELETE"],
    allow_headers=["*"],
)

# Security headers
app.add_middleware(SecurityHeadersMiddleware)

# Static files for uploads
uploads_path = Path(settings.upload_dir)
uploads_path.mkdir(parents=True, exist_ok=True)
app.mount("/uploads", StaticFiles(directory=str(uploads_path)), name="uploads")

# Routers
app.include_router(auth_router)
app.include_router(public_router)
app.include_router(admin_router)
app.include_router(contact_router)


@app.get("/api/health")
def health_check():
    return {"status": "healthy"}


@app.on_event("startup")
def on_startup():
    Base.metadata.create_all(bind=engine)
