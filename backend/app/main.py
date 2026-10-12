"""VibeSift FastAPI application entry point."""

from contextlib import asynccontextmanager
from typing import AsyncIterator

from fastapi import FastAPI, Request
from fastapi.exceptions import RequestValidationError
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse

from app.api import auth, playlist, stats, sync
from app.core.config import get_settings
from app.core.errors import VibeSiftError

settings = get_settings()


@asynccontextmanager
async def lifespan(_: FastAPI) -> AsyncIterator[None]:
    """App lifespan. Tables are created via `alembic upgrade head`."""
    yield


app = FastAPI(title="VibeSift API", version="0.1.0", lifespan=lifespan)

app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.cors_origin_list,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


@app.exception_handler(VibeSiftError)
async def handle_domain_error(_: Request, exc: VibeSiftError) -> JSONResponse:
    """Render domain errors in the documented shape."""
    return JSONResponse(
        status_code=exc.status_code, content={"detail": exc.detail, "code": exc.code}
    )


@app.exception_handler(RequestValidationError)
async def handle_validation_error(_: Request, exc: RequestValidationError) -> JSONResponse:
    """Render validation errors using the documented error shape."""
    fields = {error["loc"][-1] for error in exc.errors()}
    code = "PROMPT_EMPTY" if "prompt" in fields else "VALIDATION_ERROR"
    return JSONResponse(
        status_code=400, content={"detail": "Input tidak valid.", "code": code}
    )


@app.get("/api/health", tags=["meta"])
async def health() -> dict[str, str]:
    """Liveness probe."""
    return {"status": "ok"}


app.include_router(auth.router)
app.include_router(sync.router)
app.include_router(playlist.router)
app.include_router(stats.router)
