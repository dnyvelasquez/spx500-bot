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
  ): LiquiditySweep[] {
    const sweeps: LiquiditySweep[] = [];

    for (const cluster of clusters) {
      // EQH Sweep (bearish)
      if (cluster.type === 'EQH') {
        const swept =
          candle.high > cluster.averagePrice &&
          candle.close < cluster.averagePrice;

        if (swept) {
          const level: LiquidityLevel =
            cluster.levels[0];

          sweeps.push({
            level,

            clusterId: cluster.id,

            sweptAt: candle.time,

            type: cluster.type,

            sweepCandleHigh:
              candle.high,

            sweepCandleLow:
              candle.low,

            sweepPrice:
              candle.high,

            candleTime:
              candle.time,

            rejectionStrength:
              candle.high -
              Math.max(
                candle.open,
                candle.close,
              ),

            direction:
              'bearish',

            displacementStrength:
              Math.abs(
                candle.close -
                candle.open,
              ),
          });
        }
      }

      // EQL Sweep (bullish)
      if (cluster.type === 'EQL') {
        const swept =
          candle.low < cluster.averagePrice &&
          candle.close > cluster.averagePrice;

        if (swept) {
          const level: LiquidityLevel =
            cluster.levels[0];

          sweeps.push({
            level,

            clusterId: cluster.id,

            sweptAt: candle.time,

            type: cluster.type,

            sweepCandleHigh:
              candle.high,

            sweepCandleLow:
              candle.low,

            sweepPrice:
              candle.low,

            candleTime:
              candle.time,

            rejectionStrength:
              Math.min(
                candle.open,
                candle.close,
              ) - candle.low,

            direction:
              'bullish',

            displacementStrength:
              Math.abs(
                candle.close -
                candle.open,
              ),
          });
        }
      }
    }

    return sweeps;
  }
}