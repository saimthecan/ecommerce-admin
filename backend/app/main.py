import asyncio
import os

import httpx
from fastapi import FastAPI, Header, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse, Response
from fastapi.staticfiles import StaticFiles
from sqlalchemy import text

from app.core.config import settings
from app.api.v1 import api_router
from app.db.session import engine

app = FastAPI(title=settings.PROJECT_NAME)

# 🔹 CORS middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=False,
    allow_methods=["*"],
    allow_headers=["*"],
)

# 🔹 Static files for uploads
uploads_dir = os.path.join(os.path.dirname(__file__), "..", settings.UPLOAD_DIR)
os.makedirs(uploads_dir, exist_ok=True)
app.mount("/uploads", StaticFiles(directory=uploads_dir), name="uploads")


@app.get("/health")
async def health_check():
    return {"status": "ok"}

@app.get("/warmup")
async def warmup(x_warmup_key: str | None = Header(default=None, alias="x-warmup-key")):
    if settings.WARMUP_KEY and x_warmup_key != settings.WARMUP_KEY:
        raise HTTPException(status_code=401, detail="Unauthorized")

    async with engine.connect() as connection:
        result = await connection.execute(text("SELECT 1"))
        db_select_1 = result.scalar_one()

    return {"ok": True, "db_select_1": db_select_1}


@app.post("/api/warmup")
async def warmup_proxy():
    base = settings.INTERNAL_API_URL or settings.NEXT_PUBLIC_API_URL
    if not base:
        return JSONResponse(
            {"ok": False, "error": "missing NEXT_PUBLIC_API_URL"},
            status_code=500,
        )

    url = base.rstrip("/") + "/warmup"
    headers = {"Cache-Control": "no-store"}
    if settings.WARMUP_KEY:
        headers["x-warmup-key"] = settings.WARMUP_KEY

    max_attempts = 3
    attempt_timeout_ms = 18000
    retry_delay_ms = 1500
    last_error = None

    for attempt in range(max_attempts):
        try:
            timeout = httpx.Timeout(attempt_timeout_ms / 1000)
            async with httpx.AsyncClient(timeout=timeout) as client:
                response = await client.get(url, headers=headers)

            body = response.text
            if response.status_code < 500:
                content_type = response.headers.get("content-type") or "application/json"
                return Response(
                    content=body,
                    status_code=response.status_code,
                    headers={"content-type": content_type},
                )

            last_error = body or f"upstream status {response.status_code}"
        except httpx.TimeoutException:
            last_error = "timeout"
        except Exception as exc:
            last_error = str(exc)

        if attempt < max_attempts - 1:
            await asyncio.sleep(retry_delay_ms / 1000)

    return JSONResponse(
        {"ok": False, "error": last_error or "unknown"},
        status_code=502,
    )

app.include_router(api_router, prefix=settings.API_V1_PREFIX)
