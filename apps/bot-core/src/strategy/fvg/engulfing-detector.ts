import { Candle } from '../../services/mt5/mt5.types';

export interface EngulfingCandle {
  direction: 'BULLISH' | 'BEARISH';
  bodySize: number;
  time: number;
}

export class EngulfingDetector {
  // Returns the engulfing signal if candles[1] engulfs candles[0].
  // Caller passes [prev, current].
  detect(prev: Candle, current: Candle): EngulfingCandle | null {
    const currBody = Math.abs(current.close - current.open);
    const prevBody = Math.abs(prev.close - prev.open);
    if (currBody === 0 || prevBody === 0) return null;

    const bullish =
      current.close > current.open &&   // green candle
      current.open < prev.close &&       // opens below prev close
      current.close > prev.open;         // closes above prev open

    const bearish =
      current.close < current.open &&   // red candle
      current.open > prev.close &&       // opens above prev close
      current.close < prev.open;         // closes below prev open

    if (bullish) return { direction: 'BULLISH', bodySize: currBody, time: current.time };
    if (bearish) return { direction: 'BEARISH', bodySize: currBody, time: current.time };
    return null;
  }

  // Scans the last N candles and returns the most recent engulfing in the given direction.
  findRecent(candles: Candle[], direction: 'BULLISH' | 'BEARISH', lookback = 4): EngulfingCandle | null {
    const start = Math.max(1, candles.length - lookback);
    for (let i = candles.length - 1; i >= start; i--) {
      const signal = this.detect(candles[i - 1]!, candles[i]!);
      if (signal && signal.direction === direction) return signal;
    }
    return null;
  }
}
