import type { Candle } from '../../services/mt5/mt5.types';

export class ADXEngine {
  // Wilder's smoothing for raw directional movement values (TR, +DM, -DM).
  // Initial value = sum of first `period` items (stays proportional for DI ratios).
  private wilderSum(data: number[], period: number): number[] {
    if (data.length < period) return [];
    const result: number[] = [];
    let s = data.slice(0, period).reduce((a, v) => a + v, 0);
    result.push(s);
    for (let i = period; i < data.length; i++) {
      s = s - s / period + data[i]!;
      result.push(s);
    }
    return result;
  }

  // Wilder's EMA for DX → ADX. Initial value = average (keeps result in 0–100).
  private wilderAvg(data: number[], period: number): number[] {
    if (data.length < period) return [];
    const result: number[] = [];
    let s = data.slice(0, period).reduce((a, v) => a + v, 0) / period;
    result.push(s);
    for (let i = period; i < data.length; i++) {
      s = (s * (period - 1) + data[i]!) / period;
      result.push(s);
    }
    return result;
  }

  // Returns the current ADX value (0–100). Returns null when there are not
  // enough candles (need at least 2*period+1).
  last(candles: Candle[], period = 14): number | null {
    if (candles.length < period * 2 + 1) return null;

    const trs: number[] = [];
    const pdms: number[] = [];
    const ndms: number[] = [];

    for (let i = 1; i < candles.length; i++) {
      const cur  = candles[i]!;
      const prev = candles[i - 1]!;

      trs.push(Math.max(
        cur.high - cur.low,
        Math.abs(cur.high - prev.close),
        Math.abs(cur.low  - prev.close),
      ));

      const upMove   = cur.high - prev.high;
      const downMove = prev.low  - cur.low;
      pdms.push(upMove   > downMove && upMove   > 0 ? upMove   : 0);
      ndms.push(downMove > upMove   && downMove > 0 ? downMove : 0);
    }

    const atr     = this.wilderSum(trs,  period);
    const pdmSmth = this.wilderSum(pdms, period);
    const ndmSmth = this.wilderSum(ndms, period);

    const dx: number[] = [];
    for (let i = 0; i < atr.length; i++) {
      if (atr[i]! === 0) continue;
      const pdi = 100 * pdmSmth[i]! / atr[i]!;
      const ndi = 100 * ndmSmth[i]! / atr[i]!;
      const sum = pdi + ndi;
      if (sum === 0) continue;
      dx.push(100 * Math.abs(pdi - ndi) / sum);
    }

    const adx = this.wilderAvg(dx, period);
    const val = adx[adx.length - 1];
    return val !== undefined ? Math.round(val * 100) / 100 : null;
  }
}
