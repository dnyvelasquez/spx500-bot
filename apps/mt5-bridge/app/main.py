from pathlib import Path

from dotenv import load_dotenv
from fastapi import FastAPI
from fastapi.staticfiles import StaticFiles

from app.routes.trading import router as trading_router
from app.routes.settings import router as settings_router
from app.routes.journal import router as journal_router

# Cargar variables del .env del proyecto (raíz del monorepo)
_env_path = (Path(__file__).parent / ".." / ".." / ".." / ".env").resolve()
load_dotenv(_env_path, override=False)

app = FastAPI(title="MT5 Bridge", version="1.0.0")

app.include_router(trading_router, prefix="/api/trading", tags=["Trading"])
app.include_router(settings_router, prefix="/api", tags=["Settings"])
app.include_router(journal_router, prefix="/api/journal", tags=["Journal"])

STATIC_DIR = Path(__file__).parent / "static"
app.mount("/", StaticFiles(directory=str(STATIC_DIR), html=True), name="static")
