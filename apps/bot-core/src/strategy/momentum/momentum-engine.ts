import { Candle } from '../../services/mt5/mt5.types';
import { StructureEngine } from '../structure/structure-engine';
import { MomentumSignal } from './momentum-types';

const M15_LOOKBACK = 50;

export class MomentumEngine {
  private readonly structure = new StructureEngine();

  analyze(candles: Candle[]): MomentumSignal {
    if (candles.length < 10) {
      return { direction: 'NEUTRAL', strength: 'NONE', timestamp: 0 };
    }

    const result = this.structure.analyze(candles.slice(-M15_LOOKBACK));

    const lastBos = result.bos[result.bos.length - 1];
    const lastChoch = result.choch[result.choch.length - 1];

    const bosTime = lastBos?.candleTime ?? 0;
    const chochTime = lastChoch?.candleTime ?? 0;

    // Only BOS confirms real momentum — CHoCH is too early/speculative for entry
    if (lastBos) {
      return {
        direction: lastBos.type === 'BULLISH_BOS' ? 'BULLISH' : 'BEARISH',
        strength: 'BOS',
        timestamp: bosTime,
      };
    }

    return {
      direction: 'NEUTRAL',
      strength: 'NONE',
      timestamp: candles[candles.length - 1].time,
    };
  }
}
