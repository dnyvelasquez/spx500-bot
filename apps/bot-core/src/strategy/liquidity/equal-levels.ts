import { Candle } from '../../../src/types/market.types';
import { LiquidityLevel } from './liquidity.types';

const DEFAULT_TOLERANCE = 1.0;
const DEFAULT_MIN_TOUCHES = 2;

export function detectEqualHighs(
  candles: Candle[],
  tolerance = DEFAULT_TOLERANCE,
  minTouches = DEFAULT_MIN_TOUCHES,
): LiquidityLevel[] {
  const levels: LiquidityLevel[] = [];

  for (let i = 2; i < candles.length - 2; i++) {
    const current = candles[i];
    let touches = 1;

    for (let j = i + 2; j < candles.length; j++) {
      const compare = candles[j];
      if (Math.abs(current.high - compare.high) <= tolerance) {
        touches++;
        if (touches >= minTouches) {
          levels.push({
            price: current.high,
            type: 'EQH',
            touches,
            firstTouchTime: current.time,
            lastTouchTime: compare.time,
          });
        }
      }
    }
  }

  return levels;
}

export function detectEqualLows(
  candles: Candle[],
  tolerance = DEFAULT_TOLERANCE,
  minTouches = DEFAULT_MIN_TOUCHES,
): LiquidityLevel[] {
  const levels: LiquidityLevel[] = [];

  for (let i = 2; i < candles.length - 2; i++) {
    const current = candles[i];
    let touches = 1;

    for (let j = i + 2; j < candles.length; j++) {
      const compare = candles[j];
      if (Math.abs(current.low - compare.low) <= tolerance) {
        touches++;
        if (touches >= minTouches) {
          levels.push({
            price: current.low,
            type: 'EQL',
            touches,
            firstTouchTime: current.time,
            lastTouchTime: compare.time,
          });
        }
      }
    }
  }

  return levels;
}