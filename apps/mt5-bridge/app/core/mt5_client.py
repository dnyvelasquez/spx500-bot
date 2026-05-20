import MetaTrader5 as mt5

TIMEFRAMES = {
    "M1": mt5.TIMEFRAME_M1,
    "M5": mt5.TIMEFRAME_M5,
    "M15": mt5.TIMEFRAME_M15,
    "H1": mt5.TIMEFRAME_H1
}

class MT5Client:

    @staticmethod
    def connect():

        if mt5.initialize():
            return True

        return False

    @staticmethod
    def shutdown():
        mt5.shutdown()

    @staticmethod
    def get_symbol_tick(symbol: str):

        tick = mt5.symbol_info_tick(symbol)

        if tick is None:
            return None

        return {
            "bid": tick.bid,
            "ask": tick.ask,
            "last": tick.last,
            "time": tick.time
        }
    
    @staticmethod
    def get_rates(symbol: str, timeframe, count: int):

        rates = mt5.copy_rates_from_pos(
            symbol,
            timeframe,
            0,
            count
        )

        if rates is None:
            return None

        candles = []

        for rate in rates:

            candles.append({
                "time": int(rate["time"]),
                "open": float(rate["open"]),
                "high": float(rate["high"]),
                "low": float(rate["low"]),
                "close": float(rate["close"]),
                "tick_volume": int(rate["tick_volume"])
            })

        return candles    