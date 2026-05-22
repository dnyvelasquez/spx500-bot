import { Candle } from '../../../src/types/market.types';
import { LiquidityLevel } from './liquidity.types';

const TOLERANCE = 1.0;
const MIN_TOUCHES = 2;

export function detectEqualHighs(
  candles: Candle[],
): LiquidityLevel[] {
  const levels: LiquidityLevel[] = [];

  for (let i = 2; i < candles.length - 2; i++) {
    const current = candles[i];

    let touches = 1;

    for (let j = i + 2; j < candles.length; j++) {
      const compare = candles[j];

      if (
        Math.abs(current.high - compare.high) <= TOLERANCE
      ) {
        touches++;

        if (touches >= MIN_TOUCHES) {
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
): LiquidityLevel[] {
  const levels: LiquidityLevel[] = [];

  for (let i = 2; i < candles.length - 2; i++) {
    const current = candles[i];

    let touches = 1;

    for (let j = i + 2; j < candles.length; j++) {
      const compare = candles[j];

      if (
        Math.abs(current.low - compare.low) <= TOLERANCE
      ) {
        touches++;

        if (touches >= MIN_TOUCHES) {
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