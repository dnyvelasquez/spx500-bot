from pydantic import BaseModel

class OrderRequest(BaseModel):
    symbol: str
    volume: float
    order_type: str
    sl: float | None = None
    tp: float | None = None