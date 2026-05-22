import { EventEmitter } from 'events';

import { Candle } from '../types/market.types';

import { LiquidityEngine } from '../strategy/liquidity/liquidity-engine';

import { MSSDetector } from '../strategy/mss/mss-detector';

export class StrategyEngine extends EventEmitter {
  private readonly liquidityEngine =
    new LiquidityEngine();

  private readonly mssDetector =
    new MSSDetector();

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

        // Bearish MSS
        if (
          sweep.direction ===
          'bearish'
        ) {
          const referenceSwing =
            candles[
              candles.length - 3
            ];

          mss =
            this.mssDetector.detectBearishMSS(
              currentCandle,
              {
                price:
                  referenceSwing.low,

                time:
                  referenceSwing.time,
              },
            );
        }

        // Bullish MSS
        if (
          sweep.direction ===
          'bullish'
        ) {
          const referenceSwing =
            candles[
              candles.length - 3
            ];

          mss =
            this.mssDetector.detectBullishMSS(
              currentCandle,
              {
                price:
                  referenceSwing.high,

                time:
                  referenceSwing.time,
              },
            );
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