import { Candle } from '../../services/mt5/mt5.types';
import { SwingDetector } from '../structure/swing-detector';
import { SRZone, ZoneTimeframe } from './zone-types';

const TF_WEIGHT: Record<ZoneTimeframe, number> = { D1: 3, H4: 2, H1: 1, M15: 0.5 };
const SWING_LOOKBACK: Record<ZoneTimeframe, number> = { D1: 100, H4: 100, H1: 100, M15: 50 };

export class ZoneEngine {
  private readonly swingDetector = new SwingDetector();

  getZones(d1: Candle[], h4: Candle[], h1: Candle[], m15: Candle[] = []): SRZone[] {
    const zones: SRZone[] = [];

    const addFromTF = (candles: Candle[], tf: ZoneTimeframe) => {
      if (candles.length < 10) return;
      const recent = candles.slice(-SWING_LOOKBACK[tf]) as Parameters<SwingDetector['detectSwings']>[0];
      const swings = this.swingDetector.detectSwings(recent);
      for (const swing of swings) {
        zones.push({
          level: swing.price,
          type: swing.type === 'HIGH' ? 'RESISTANCE' : 'SUPPORT',
          timeframe: tf,
          strength: TF_WEIGHT[tf],
          candleTime: swing.time,
        });
      }
    };

    addFromTF(d1, 'D1');
    addFromTF(h4, 'H4');
    addFromTF(h1, 'H1');
    addFromTF(m15, 'M15');

    return zones;
  }

  // Returns the strongest zone within `proximity` points of `currentPrice`.
  findActiveZone(
    zones: SRZone[],
    currentPrice: number,
    proximity: number,
  ): SRZone | null {
    let best: SRZone | null = null;
    let bestScore = -Infinity;

    for (const zone of zones) {
      const dist = Math.abs(currentPrice - zone.level);
      if (dist > proximity) continue;
      // Higher TF weight and closer distance = better score
      const score = zone.strength / (dist + 0.001);
      if (score > bestScore) {
        bestScore = score;
        best = zone;
      }
    }

    return best;
  }
}
