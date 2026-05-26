import { Candle } from '../../services/mt5/mt5.types';
import { StructureEngine } from '../structure/structure-engine';
import { FlippedZone } from './breakout-types';
import type { ZoneTimeframe } from '../zones/zone-types';

const TF_WEIGHT: Record<ZoneTimeframe, number> = { D1: 3, H4: 2, H1: 1, M15: 0.5 };
const ANALYSIS_LOOKBACK = 50;
// Only consider BOS events from the last N candles of that TF
// H4: 10 candles = 40 h ≈ 2 trading days
// H1: 10 candles = 10 h ≈ 1.5 trading days
const RECENCY_CANDLES = 10;

export class BreakoutEngine {
  private readonly structure = new StructureEngine();

  // Returns zones that were recently broken (H4 or H1 BOS) and are
  // now flipped: broken resistance becomes support, broken support becomes resistance.
  getFlippedZones(h4: Candle[], h1: Candle[]): FlippedZone[] {
    const zones: FlippedZone[] = [];

    const addFromTF = (candles: Candle[], tf: ZoneTimeframe) => {
      if (candles.length < 10) return;
      const window = candles.slice(-ANALYSIS_LOOKBACK) as Parameters<StructureEngine['analyze']>[0];
      const result = this.structure.analyze(window);
      const cutoff = candles.length - RECENCY_CANDLES;

      for (const bos of result.bos) {
        const globalIdx = candles.findIndex(c => c.time === bos.candleTime);
        if (globalIdx < cutoff) continue;

        zones.push({
          level: bos.brokenPrice,
          type: bos.type === 'BULLISH_BOS' ? 'SUPPORT' : 'RESISTANCE',
          direction: bos.type === 'BULLISH_BOS' ? 'BULLISH' : 'BEARISH',
          timeframe: tf,
          strength: TF_WEIGHT[tf],
          breakoutTime: bos.candleTime,
        });
      }
    };

    addFromTF(h4, 'H4');
    addFromTF(h1, 'H1');

    return zones;
  }

  findPullbackZone(
    zones: FlippedZone[],
    currentPrice: number,
    proximity: number,
  ): FlippedZone | null {
    let best: FlippedZone | null = null;
    let bestScore = -Infinity;

    for (const zone of zones) {
      const dist = Math.abs(currentPrice - zone.level);
      if (dist > proximity) continue;
      const score = zone.strength / (dist + 0.001);
      if (score > bestScore) {
        bestScore = score;
        best = zone;
      }
    }

    return best;
  }
}
