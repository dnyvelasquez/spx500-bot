import { EventEmitter } from 'events';

import { Candle } from '../types/market.types';

import { LiquidityEngine } from '../strategy/liquidity/liquidity-engine';

import { MSSDetector } from '../strategy/mss/mss-detector';
import { SwingDetector } from '../strategy/structure/swing-detector';

const SWING_LOOKBACK = 30;

export class StrategyEngine extends EventEmitter {
  private readonly liquidityEngine =
    new LiquidityEngine();

  private readonly mssDetector =
    new MSSDetector();

  private readonly swingDetector =
    new SwingDetector();

  initialize() {
    this.liquidityEngine.on(
      'liquiditySweep',
      (sweep) => {
        let mss = null;

        const candles =
          this.liquidityEngine.getCandles();

        if (candles.length < 5) {
          return;
        }

        const currentCandle =
          candles[candles.length - 1];

        const recentCandles = candles.slice(-SWING_LOOKBACK) as Parameters<SwingDetector['detectSwings']>[0];
        const swings = this.swingDetector.detectSwings(recentCandles);
        const reversedSwings = [...swings].reverse();

        // Bearish MSS — break below last real swing low
        if (sweep.direction === 'bearish') {
          const lastSwingLow = reversedSwings.find(s => s.type === 'LOW');
          if (!lastSwingLow) return;
          mss = this.mssDetector.detectBearishMSS(currentCandle, {
            price: lastSwingLow.price,
            time: lastSwingLow.time,
          });
        }

        // Bullish MSS — break above last real swing high
        if (sweep.direction === 'bullish') {
          const lastSwingHigh = reversedSwings.find(s => s.type === 'HIGH');
          if (!lastSwingHigh) return;
          mss = this.mssDetector.detectBullishMSS(currentCandle, {
            price: lastSwingHigh.price,
            time: lastSwingHigh.time,
          });
        }

        if (mss) {
          this.emit(
            'mssConfirmed',
            {
              sweep,
              mss,
            },
          );
        }
      },
    );
  }

  processCandle(candle: Candle) {
    this.liquidityEngine.analyzeCandle(
      candle,
    );
  }

  getLiquidityEngine() {
    return this.liquidityEngine;
  }
}