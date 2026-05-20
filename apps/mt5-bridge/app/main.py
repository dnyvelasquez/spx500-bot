from fastapi import FastAPI
from app.routes.trading import router as trading_router

app = FastAPI(
    title="MT5 Bridge",
    version="1.0.0"
)

app.include_router(
    trading_router,
    prefix="/api/trading",
    tags=["Trading"]
)