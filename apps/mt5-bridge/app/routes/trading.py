from fastapi import APIRouter
from app.core.mt5_client import MT5Client
from app.core.mt5_client import TIMEFRAMES

router = APIRouter()

@router.get("/health")
def health():

    connected = MT5Client.connect()

    return {
        "success": connected,
        "mt5_connected": connected
    }

@router.get("/tick/{symbol}")
def get_tick(symbol: str):

    connected = MT5Client.connect()

    if not connected:
        return {
            "success": False,
            "message": "MT5 not connected"
        }

    tick = MT5Client.get_symbol_tick(symbol)

    if tick is None:
        return {
            "success": False,
            "message": f"Symbol {symbol} not found"
        }

    return {
        "success": True,
        "symbol": symbol,
        "data": tick
    }

@router.get("/candles/{symbol}/{timeframe}")
def get_candles(
    symbol: str,
    timeframe: str,
    count: int = 100
):

    connected = MT5Client.connect()

    if not connected:
        return {
            "success": False,
            "message": "MT5 not connected"
        }

    tf = TIMEFRAMES.get(timeframe)

    if tf is None:
        return {
            "success": False,
            "message": "Invalid timeframe"
        }

    candles = MT5Client.get_rates(
        symbol,
        tf,
        count
    )

    return {
        "success": True,
        "symbol": symbol,
        "timeframe": timeframe,
        "count": count,
        "data": candles
    }