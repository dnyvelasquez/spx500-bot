from pathlib import Path

from fastapi import FastAPI
from fastapi.staticfiles import StaticFiles

from app.routes.trading import router as trading_router
from app.routes.settings import router as settings_router

app = FastAPI(title="MT5 Bridge", version="1.0.0")

app.include_router(trading_router, prefix="/api/trading", tags=["Trading"])
app.include_router(settings_router, prefix="/api", tags=["Settings"])

STATIC_DIR = Path(__file__).parent / "static"
app.mount("/", StaticFiles(directory=str(STATIC_DIR), html=True), name="static")
