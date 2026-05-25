import {
  LiquidityCluster,
  LiquidityLevel,
  LiquiditySweep,
} from './liquidity.types';

interface Candle {
  time: number;
  open: number;
  high: number;
  low: number;
  close: number;
}

export class LiquiditySweepDetector {
  detect(
    clusters: LiquidityCluster[],
    candle: Candle,
    prevCandle?: Candle,
  ): LiquiditySweep[] {
    const sweeps: LiquiditySweep[] = [];

    for (const cluster of clusters) {
      // EQH Sweep (bearish)
      // Pattern A — 1-candle: same candle wicks above and closes below
      // Pattern B — 2-candle: prev wicks above (but closes above), current closes below
      if (cluster.type === 'EQH') {
        const swept1 =
          candle.high > cluster.averagePrice &&
          candle.close < cluster.averagePrice;

        const swept2 = prevCandle != null &&
          prevCandle.high > cluster.averagePrice &&
          prevCandle.close >= cluster.averagePrice &&
          candle.close < cluster.averagePrice;

        const sweepCandle = swept1 ? candle : swept2 ? prevCandle! : null;

        if (sweepCandle) {
          const level: LiquidityLevel = cluster.levels[0];
          sweeps.push({
            level,
            clusterId: cluster.id,
            sweptAt: candle.time,
            type: cluster.type,
            sweepCandleHigh: sweepCandle.high,
            sweepCandleLow: sweepCandle.low,
            sweepPrice: sweepCandle.high,
            candleTime: candle.time,
            rejectionStrength: sweepCandle.high - Math.max(sweepCandle.open, sweepCandle.close),
            direction: 'bearish',
            displacementStrength: Math.abs(candle.close - candle.open),
          });
        }
      }

      // EQL Sweep (bullish)
      // Pattern A — 1-candle: same candle wicks below and closes above
      // Pattern B — 2-candle: prev wicks below (but closes below), current closes above
      if (cluster.type === 'EQL') {
        const swept1 =
          candle.low < cluster.averagePrice &&
          candle.close > cluster.averagePrice;

        const swept2 = prevCandle != null &&
          prevCandle.low < cluster.averagePrice &&
          prevCandle.close <= cluster.averagePrice &&
          candle.close > cluster.averagePrice;

        const sweepCandle = swept1 ? candle : swept2 ? prevCandle! : null;

        if (sweepCandle) {
          const level: LiquidityLevel = cluster.levels[0];
          sweeps.push({
            level,
            clusterId: cluster.id,
            sweptAt: candle.time,
            type: cluster.type,
            sweepCandleHigh: sweepCandle.high,
            sweepCandleLow: sweepCandle.low,
            sweepPrice: sweepCandle.low,
            candleTime: candle.time,
            rejectionStrength: Math.min(sweepCandle.open, sweepCandle.close) - sweepCandle.low,
            direction: 'bullish',
            displacementStrength: Math.abs(candle.close - candle.open),
          });
        }
      }
    }

    return sweeps;
  }
}